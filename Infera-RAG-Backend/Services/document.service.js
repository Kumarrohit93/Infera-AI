const crypto = require("crypto");
const path = require("path");
const pool = require("../Config/db");
const AppError = require("../utils/AppError");
const { uploadBuffer, deleteFile } = require("./storage.service");
const { processDocument } = require("./DocumentProcessor");
const { createChunks } = require("./ChunkingService");
const { generateChunkEmbeddings } = require("./EmbeddingService");
const { saveDocumentChunks } = require("../Repositories/ChunkRepositery");

function sanitizeFilename(name) {
  const base = path.basename(name || "file");
  const cleaned = base.replace(/[\u0000-\u001f\u007f]/g, "").slice(0, 255);
  return cleaned || "file";
}

/**
 * Background ingestion pipeline:
 * 1. Text extraction from PDF, DOCX, TXT
 * 2. Token chunking with overlap
 * 3. Gemini embeddings generation
 * 4. PostgreSQL vector storage (updates status to 'ready')
 */
async function ingestUploadedDocument({ documentId, organizationId, buffer, originalFilename, ext }) {
  try {
    await pool.query(
      "UPDATE documents SET status = 'processing', updated_at = NOW() WHERE id = $1 AND organization_id = $2",
      [documentId, organizationId]
    );

    const docObj = await processDocument({
      buffer,
      originalFilename,
      extension: ext,
    });

    const chunks = createChunks(docObj);
    const embeddedChunks = await generateChunkEmbeddings(chunks);

    await saveDocumentChunks({
      documentId,
      organizationId,
      chunks: embeddedChunks,
    });

    console.log(`[Ingestion] Document ${documentId} (${originalFilename}) successfully indexed and ready.`);
  } catch (err) {
    console.error(`[Ingestion] Failed for ${documentId}:`, err.message);
    await pool.query(
      "UPDATE documents SET status = 'failed', processing_error = $3, updated_at = NOW() WHERE id = $1 AND organization_id = $2",
      [documentId, organizationId, err.message]
    ).catch((e) => console.error("Failed to update status to failed:", e.message));
  }
}

async function uploadDocument({ organizationId, userId, folderId, file }) {
  const folder = await pool.query(
    "SELECT 1 FROM folders WHERE id = $1 AND organization_id = $2",
    [folderId, organizationId]
  );
  if (folder.rowCount === 0) {
    throw new AppError(404, "NOT_FOUND", "Folder not found");
  }

  const documentId = crypto.randomUUID();
  const { ext, mime } = file.detected;
  const storageKey = `${organizationId}/${documentId}.${ext}`;
  const checksum = crypto.createHash("sha256").update(file.buffer).digest("hex");
  const originalFilename = sanitizeFilename(file.originalname);

  try {
    await uploadBuffer(file.buffer, storageKey);
  } catch (err) {
    console.error("Cloudinary upload failed:", err.message);
    if (err.code === "CLOUDINARY_NOT_CONFIGURED") {
      throw new AppError(503, "STORAGE_NOT_CONFIGURED", err.message);
    }
    throw new AppError(502, "STORAGE_ERROR", "Could not store the file in Cloudinary");
  }

  try {
    const result = await pool.query(
      `INSERT INTO documents
         (id, organization_id, folder_id, original_filename, storage_key,
          mime_type, file_size_bytes, checksum_sha256, uploaded_by, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, 'processing')
       RETURNING id, folder_id, original_filename, mime_type,
                 file_size_bytes, status, uploaded_at`,
      [documentId, organizationId, folderId, originalFilename, storageKey,
       mime, file.size, checksum, userId]
    );
    const row = result.rows[0];

    // Trigger asynchronous ingestion worker
    ingestUploadedDocument({
      documentId,
      organizationId,
      buffer: file.buffer,
      originalFilename,
      ext,
    }).catch((e) => console.error("Background ingestion dispatch error:", e.message));

    return {
      id: row.id,
      folderId: row.folder_id,
      originalFilename: row.original_filename,
      mimeType: row.mime_type,
      sizeBytes: Number(row.file_size_bytes),
      status: row.status,
      uploadedAt: row.uploaded_at,
    };
  } catch (err) {
    await deleteFile(storageKey).catch((e) =>
      console.error("Cleanup failed for", storageKey, e.message)
    );
    throw err;
  }
}

async function listDocuments({ organizationId, userId, role = "member", folderId }) {
  const values = [organizationId];
  let folderFilter = "";

  if (folderId && folderId !== "All") {
    values.push(folderId);
    folderFilter = `AND d.folder_id = $${values.length}`;
  }

  let permissionFilter = "";
  if (role !== "admin") {
    values.push(userId);
    permissionFilter = `AND d.folder_id IS NOT NULL AND EXISTS (
      SELECT 1 FROM folder_permissions fp
      WHERE fp.folder_id = d.folder_id
        AND fp.user_id = $${values.length}
        AND fp.organization_id = $1
        AND (fp.expires_at IS NULL OR fp.expires_at > NOW())
    )`;
  }

  const { rows } = await pool.query(
    `SELECT d.id, d.folder_id, f.name AS folder_name, d.original_filename,
            d.mime_type, d.file_size_bytes, d.status, d.uploaded_at,
            (SELECT count(*)::int FROM document_chunks dc WHERE dc.document_id = d.id) AS chunk_count
     FROM documents d
     LEFT JOIN folders f ON f.id = d.folder_id
     WHERE d.organization_id = $1
       ${folderFilter}
       ${permissionFilter}
     ORDER BY d.uploaded_at DESC`,
    values
  );

  return rows.map((r) => ({
    id: r.id,
    folderId: r.folder_id,
    folder: r.folder_name || "General",
    name: r.original_filename,
    mimeType: r.mime_type,
    size: `${(Number(r.file_size_bytes) / (1024 * 1024)).toFixed(1)} MB`,
    status: r.status === "ready" ? "Completed" : r.status,
    chunks: r.chunk_count,
    uploadDate: r.uploaded_at?.toISOString()?.split("T")[0],
  }));
}

module.exports = {
  uploadDocument,
  listDocuments,
  ingestUploadedDocument,
};
