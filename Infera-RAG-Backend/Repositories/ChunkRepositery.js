
// This file saves document chunks and their embeddings in PostgreSQL.

const pool = require("../Config/db.js");

const EMBEDDING_DIMENSION = Number(
    process.env.EMBEDDING_DIMENSION || 3072
);

const EMBEDDING_MODEL = "gemini-embedding-001";

// This function saves all chunks of a document in one transaction.
const saveDocumentChunks = async ({
    documentId,
    organizationId,
    chunks,
}) => {
    if (!documentId || !organizationId) {
        throw new Error("Document ID and Organization ID are required");
    }

    if (!Array.isArray(chunks) || chunks.length === 0) {
        throw new Error("Chunks array cannot be empty");
    }

    // Validate embeddings before starting the database transaction.
    for (const chunk of chunks) {
        if (
            !Array.isArray(chunk.embedding) ||
            chunk.embedding.length !== EMBEDDING_DIMENSION
        ) {
            throw new Error(
                `Invalid embedding dimension. Expected ${EMBEDDING_DIMENSION}`
            );
        }

        if (!chunk.embedding.every(Number.isFinite)) {
            throw new Error("Embedding contains invalid numeric values");
        }
    }

    const client = await pool.connect();

    try {
        await client.query("BEGIN");

        // Check that the document belongs to the given organization.
        const documentResult = await client.query(
            `SELECT id
       FROM documents
       WHERE id = $1 AND organization_id = $2
       FOR UPDATE`,
            [documentId, organizationId]
        );

        if (documentResult.rowCount === 0) {
            throw new Error("Document not found in this organization");
        }

        // Remove old chunks so reprocessing does not create duplicates.
        await client.query(
            `DELETE FROM document_chunks
       WHERE document_id = $1 AND organization_id = $2`,
            [documentId, organizationId]
        );

        // Insert every chunk with its embedding and metadata.
        for (const chunk of chunks) {
            const metadata = {
                ...(chunk.metadata || {}),
                documentName: chunk.documentName || null,
                fileType: chunk.fileType || null,
            };

            await client.query(
                `INSERT INTO document_chunks (
          organization_id,
          document_id,
          chunk_index,
          chunk_text,
          page_number,
          heading,
          token_count,
          embedding,
          embedding_model,
          metadata
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8::vector, $9, $10::jsonb)`,
                [
                    organizationId,
                    documentId,
                    chunk.chunkIndex,
                    chunk.text,
                    chunk.pageNumber ?? null,
                    chunk.heading ?? null,
                    chunk.tokenCount ?? null,
                    JSON.stringify(chunk.embedding),
                    EMBEDDING_MODEL,
                    JSON.stringify(metadata),
                ]
            );
        }

        // Mark the document ready only after all chunks are saved.
        await client.query(
            `UPDATE documents
       SET status = 'ready',
           processing_error = NULL,
           updated_at = NOW()
       WHERE id = $1 AND organization_id = $2`,
            [documentId, organizationId]
        );

        await client.query("COMMIT");

        return {
            documentId,
            savedChunks: chunks.length,
        };
    } catch (error) {
        await client.query("ROLLBACK");
        throw error;
    } finally {
        client.release();
    }
};

module.exports = {
    saveDocumentChunks,
};
