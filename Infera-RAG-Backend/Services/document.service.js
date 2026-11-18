const crypto = require("crypto");
const path = require("path");
const pool = require("../Config/db");
const AppError = require("../utils/AppError");
const { uploadBuffer, deleteFile, downloadBuffer } = require("./storage.service");
const { enqueueDocumentIngestion } = require("./ingestionQueue");
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
async function ingestUploadedDocument({
  documentId,
  organizationId,
  buffer,
  originalFilename,
  ext,
  versionId,
}) {
  try {
    if (versionId) {
      const currentVersion = await pool.query(
        `UPDATE document_versions
         SET status = 'processing'
         WHERE id = $1 AND document_id = $2 AND organization_id = $3
           AND version_number = (
             SELECT MAX(version_number)
             FROM document_versions
             WHERE document_id = $2 AND organization_id = $3
           )
         RETURNING id`,
        [versionId, documentId, organizationId]
      );
      if (!currentVersion.rowCount) {
        await pool.query(
          `UPDATE document_versions
           SET status = CASE WHEN is_current THEN status ELSE 'superseded' END
           WHERE id = $1 AND document_id = $2 AND organization_id = $3`,
          [versionId, documentId, organizationId]
        );
        return { documentId, superseded: true };
      }
    }

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

    const saved = await saveDocumentChunks({
      documentId,
      organizationId,
      chunks: embeddedChunks,
      versionId,
    });

    if (saved.superseded) {
      console.log(`[Ingestion] Version ${versionId} of ${documentId} was superseded.`);
    } else {
      console.log(`[Ingestion] Document ${documentId} (${originalFilename}) successfully indexed and ready.`);
    }
    return saved;
  } catch (err) {
    console.error(`[Ingestion] Attempt failed for ${documentId}:`, err.message);
    throw err;
  }
}

async function markDocumentVersionFailed({ documentId, organizationId, versionId, error }) {
  if (!versionId) {
    await pool.query(
      `UPDATE documents
       SET status = 'failed', processing_error = $3, updated_at = NOW()
       WHERE id = $1 AND organization_id = $2`,
      [documentId, organizationId, error]
    );
    return;
  }

  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const documentLock = await client.query(
      `SELECT id FROM documents
       WHERE id = $1 AND organization_id = $2
       FOR UPDATE`,
      [documentId, organizationId]
    );
    if (!documentLock.rowCount) {
      await client.query("COMMIT");
      return;
    }
    const failedVersionResult = await client.query(
      `UPDATE document_versions SET status = 'failed'
       WHERE id = $1 AND document_id = $2 AND organization_id = $3`,
      [versionId, documentId, organizationId]
    );
    if (!failedVersionResult.rowCount) {
      await client.query("COMMIT");
      return;
    }
    const latestVersion = await client.query(
      `SELECT MAX(version_number)::int AS version_number
       FROM document_versions
       WHERE document_id = $1 AND organization_id = $2`,
      [documentId, organizationId]
    );
    const failedVersion = await client.query(
      "SELECT version_number FROM document_versions WHERE id = $1",
      [versionId]
    );
    if (failedVersion.rows[0].version_number < latestVersion.rows[0].version_number) {
      await client.query(
        "UPDATE document_versions SET status = 'superseded' WHERE id = $1",
        [versionId]
      );
      await client.query("COMMIT");
      return;
    }
    const result = await client.query(
      `SELECT original_filename, storage_key, mime_type, file_size_bytes,
              checksum_sha256, status, created_at
       FROM document_versions
       WHERE document_id = $1 AND organization_id = $2 AND is_current
       LIMIT 1`,
      [documentId, organizationId]
    );
    if (result.rowCount) {
      const currentVersion = result.rows[0];
      await client.query(
        `UPDATE documents
         SET original_filename = $3,
             storage_key = $4,
             mime_type = $5,
             file_size_bytes = $6,
             checksum_sha256 = $7,
             uploaded_at = $8,
             status = CASE WHEN $9 = 'ready' THEN 'ready' ELSE 'failed' END,
             processing_error = CASE WHEN $9 = 'ready' THEN NULL ELSE $10 END,
             updated_at = NOW()
         WHERE id = $1 AND organization_id = $2`,
        [
          documentId,
          organizationId,
          currentVersion.original_filename,
          currentVersion.storage_key,
          currentVersion.mime_type,
          currentVersion.file_size_bytes,
          currentVersion.checksum_sha256,
          currentVersion.created_at,
          currentVersion.status,
          error,
        ]
      );
    } else {
      await client.query(
        `UPDATE documents
         SET status = 'failed', processing_error = $3, updated_at = NOW()
         WHERE id = $1 AND organization_id = $2`,
        [documentId, organizationId, error]
      );
    }
    await client.query("COMMIT");
  } catch (failureError) {
    await client.query("ROLLBACK");
    throw failureError;
  } finally {
    client.release();
  }
}

async function queueDocumentIngestion(jobData) {
  try {
    const queued = await enqueueDocumentIngestion(jobData);
    if (queued) return;

    setImmediate(() => {
      downloadBuffer(jobData.storageKey, jobData.ext)
        .then((buffer) => ingestUploadedDocument({ ...jobData, buffer }))
        .catch(async (error) => {
          console.error(`[Ingestion] Local processing failed for ${jobData.documentId}:`, error.message);
          await markDocumentVersionFailed({
            ...jobData,
            error: error.message,
          });
        });
    });
  } catch (error) {
    await markDocumentVersionFailed({
      ...jobData,
      error: error.message,
    });
    throw new AppError(503, "INGESTION_QUEUE_UNAVAILABLE", "Document was uploaded but could not be queued for indexing");
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
  const versionId = crypto.randomUUID();

  try {
    await uploadBuffer(file.buffer, storageKey);
  } catch (err) {
    console.error("Cloudinary upload failed:", err.message);
    if (err.code === "CLOUDINARY_NOT_CONFIGURED") {
      throw new AppError(503, "STORAGE_NOT_CONFIGURED", err.message);
    }
    throw new AppError(502, "STORAGE_ERROR", "Could not store the file in Cloudinary");
  }

  let row;
  try {
    const client = await pool.connect();
    try {
      await client.query("BEGIN");
      const result = await client.query(
        `INSERT INTO documents
           (id, organization_id, folder_id, original_filename, storage_key,
            mime_type, file_size_bytes, checksum_sha256, uploaded_by, status)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, 'queued')
         RETURNING id, folder_id, original_filename, mime_type,
                   file_size_bytes, status, uploaded_at`,
        [documentId, organizationId, folderId, originalFilename, storageKey,
         mime, file.size, checksum, userId]
      );
      row = result.rows[0];
      await client.query(
        `INSERT INTO document_versions
           (id, organization_id, document_id, version_number, original_filename,
            storage_key, mime_type, file_size_bytes, checksum_sha256, uploaded_by,
            status, is_current)
         VALUES ($1, $2, $3, 1, $4, $5, $6, $7, $8, $9, 'queued', TRUE)`,
        [versionId, organizationId, documentId, originalFilename, storageKey,
         mime, file.size, checksum, userId]
      );
      await client.query("COMMIT");
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }
  } catch (err) {
    await deleteFile(storageKey).catch((e) =>
      console.error("Cleanup failed for", storageKey, e.message)
    );
    throw err;
  }

  const jobData = {
    documentId,
    organizationId,
    versionId,
    storageKey,
    originalFilename,
    ext,
  };

  await queueDocumentIngestion(jobData);

  return {
    id: row.id,
    folderId: row.folder_id,
    originalFilename: row.original_filename,
    mimeType: row.mime_type,
    sizeBytes: Number(row.file_size_bytes),
    status: row.status,
    uploadedAt: row.uploaded_at,
  };
}

async function uploadDocumentVersion({ organizationId, userId, documentId, file }) {
  const documentResult = await pool.query(
    `SELECT id, original_filename
     FROM documents
     WHERE id = $1 AND organization_id = $2`,
    [documentId, organizationId]
  );
  if (!documentResult.rowCount) {
    throw new AppError(404, "NOT_FOUND", "Document not found");
  }

  const versionId = crypto.randomUUID();
  const { ext, mime } = file.detected;
  const storageKey = `${organizationId}/${documentId}/versions/${versionId}.${ext}`;
  const checksum = crypto.createHash("sha256").update(file.buffer).digest("hex");
  const originalFilename = sanitizeFilename(file.originalname);

  try {
    await uploadBuffer(file.buffer, storageKey);
  } catch (err) {
    console.error("Cloudinary version upload failed:", err.message);
    if (err.code === "CLOUDINARY_NOT_CONFIGURED") {
      throw new AppError(503, "STORAGE_NOT_CONFIGURED", err.message);
    }
    throw new AppError(502, "STORAGE_ERROR", "Could not store the file in Cloudinary");
  }

  let versionNumber;
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const lockedDocument = await client.query(
      `SELECT id FROM documents
       WHERE id = $1 AND organization_id = $2
       FOR UPDATE`,
      [documentId, organizationId]
    );
    if (!lockedDocument.rowCount) {
      throw new AppError(404, "NOT_FOUND", "Document not found");
    }
    const currentVersion = await client.query(
      `SELECT COALESCE(MAX(version_number), 0)::int + 1 AS next_version
       FROM document_versions WHERE document_id = $1`,
      [documentId]
    );
    versionNumber = currentVersion.rows[0].next_version;
    await client.query(
      `INSERT INTO document_versions
         (id, organization_id, document_id, version_number, original_filename,
          storage_key, mime_type, file_size_bytes, checksum_sha256, uploaded_by,
          status, is_current)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, 'queued', FALSE)`,
      [versionId, organizationId, documentId, versionNumber, originalFilename,
       storageKey, mime, file.size, checksum, userId]
    );
    await client.query(
      `UPDATE documents
       SET status = 'queued', processing_error = NULL, updated_at = NOW()
       WHERE id = $1 AND organization_id = $2`,
      [documentId, organizationId]
    );
    await client.query("COMMIT");
  } catch (error) {
    await client.query("ROLLBACK");
    await deleteFile(storageKey).catch((cleanupError) =>
      console.error("Cleanup failed for", storageKey, cleanupError.message)
    );
    throw error;
  } finally {
    client.release();
  }

  const jobData = {
    documentId,
    organizationId,
    versionId,
    storageKey,
    originalFilename,
    ext,
  };
  await queueDocumentIngestion(jobData);

  return {
    id: documentId,
    versionId,
    versionNumber,
    originalFilename,
    status: "queued",
  };
}

async function listDocumentVersions({ organizationId, documentId }) {
  const result = await pool.query(
    `SELECT id, version_number, original_filename, mime_type, file_size_bytes,
            status, is_current, created_at
     FROM document_versions
     WHERE organization_id = $1 AND document_id = $2
     ORDER BY version_number DESC`,
    [organizationId, documentId]
  );
  return result.rows.map((version) => ({
    id: version.id,
    versionNumber: version.version_number,
    originalFilename: version.original_filename,
    mimeType: version.mime_type,
    sizeBytes: Number(version.file_size_bytes),
    status: version.status,
    isCurrent: version.is_current,
    createdAt: version.created_at,
  }));
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
            d.mime_type, d.file_size_bytes, d.status, d.processing_error, d.uploaded_at,
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
    status: r.status,
    errorMessage: r.processing_error,
    chunks: r.chunk_count,
    uploadDate: r.uploaded_at?.toISOString()?.split("T")[0],
  }));
}

module.exports = {
  uploadDocument,
  uploadDocumentVersion,
  listDocumentVersions,
  listDocuments,
  ingestUploadedDocument,
  markDocumentVersionFailed,
};
