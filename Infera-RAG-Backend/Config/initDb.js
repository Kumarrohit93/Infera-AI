const fs = require("fs");
const path = require("path");
const pool = require("./db");

const schemaFiles = [
  "folders.sql",
  "documents.sql",
  "document_versions.sql",
  "document_chunks.sql",
  "folder_permissions.sql",
  "conversations.sql",
  "feedback.sql",
];

async function applyVectorIndexMigration() {
  const currentIndex = await pool.query(
    `SELECT indexdef FROM pg_indexes
      WHERE schemaname = current_schema()
        AND indexname = 'idx_document_chunks_embedding_hnsw'`
  );
  if (currentIndex.rows[0]?.indexdef?.includes("vector_cosine_ops")) return;

  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    await client.query("LOCK TABLE document_chunks IN SHARE ROW EXCLUSIVE MODE");
    await client.query("DROP INDEX IF EXISTS idx_document_chunks_embedding_hnsw");
    await client.query(`
      CREATE INDEX idx_document_chunks_embedding_hnsw
      ON document_chunks
      USING hnsw (embedding vector_cosine_ops)
    `);
    await client.query("COMMIT");
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

async function verifyEmbeddingDimension() {
  const expectedDimension = Number(process.env.EMBEDDING_DIMENSION || 1536);
  if (expectedDimension !== 1536) {
    throw new Error(
      "This database schema requires EMBEDDING_DIMENSION=1536; changing dimensions requires re-embedding stored documents."
    );
  }
  const result = await pool.query(
    `SELECT format_type(a.atttypid, a.atttypmod) AS embedding_type
     FROM pg_attribute a
     JOIN pg_class c ON c.oid = a.attrelid
     WHERE c.relname = 'document_chunks'
       AND a.attname = 'embedding'
       AND NOT a.attisdropped`
  );
  const expectedType = `vector(${expectedDimension})`;
  if (result.rows[0]?.embedding_type !== expectedType) {
    throw new Error(
      `Embedding dimension mismatch: database has ${result.rows[0]?.embedding_type || "no embedding column"} but EMBEDDING_DIMENSION is ${expectedDimension}`
    );
  }
}

async function initDb() {
  await pool.query("CREATE EXTENSION IF NOT EXISTS vector");

  for (const file of schemaFiles) {
    const sql = fs.readFileSync(path.join(__dirname, "..", "DB", file), "utf8");
    try {
      await pool.query(sql);
    } catch (error) {
      throw new Error(`Failed to apply RAG schema ${file}: ${error.message}`);
    }
  }

  await verifyEmbeddingDimension();
  await applyVectorIndexMigration();
  console.log("[Database] RAG schema and vector index are ready.");
}

module.exports = { initDb };
