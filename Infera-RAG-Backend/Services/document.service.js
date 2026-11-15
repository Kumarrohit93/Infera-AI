const crypto = require("crypto")
const path = require("path")
const pool = require("../Config/db")
const AppError = require("../utils/AppError")
const { uploadBuffer, deleteFile } = require("./storage.service")

function sanitizeFilename(name) {
  const base = path.basename(name || "file")
  const cleaned = base.replace(/[\u0000-\u001f\u007f]/g, "").slice(0, 255)
  return cleaned || "file"
}

async function uploadDocument({ organizationId, userId, folderId, file }) {
  const folder = await pool.query(
    "SELECT 1 FROM folders WHERE id = $1 AND organization_id = $2",
    [folderId, organizationId]
  )
  if (folder.rowCount === 0) {
    throw new AppError(404, "NOT_FOUND", "Folder not found")
  }

  const documentId = crypto.randomUUID()
  const { ext, mime } = file.detected
  const storageKey = `${organizationId}/${documentId}.${ext}`
  const checksum = crypto.createHash("sha256").update(file.buffer).digest("hex")
  const originalFilename = sanitizeFilename(file.originalname)

  try {
    await uploadBuffer(file.buffer, storageKey)
  } catch (err) {
    console.error("Cloudinary upload failed:", err.message)
    throw new AppError(502, "STORAGE_ERROR", "Could not store the file")
  }

  try {
    const result = await pool.query(
      `INSERT INTO documents
         (id, organization_id, folder_id, original_filename, storage_key,
          mime_type, file_size_bytes, checksum_sha256, uploaded_by)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       RETURNING id, folder_id, original_filename, mime_type,
                 file_size_bytes, status, uploaded_at`,
      [documentId, organizationId, folderId, originalFilename, storageKey,
       mime, file.size, checksum, userId]
    )
    const row = result.rows[0]
    return {
      id: row.id,
      folderId: row.folder_id,
      originalFilename: row.original_filename,
      mimeType: row.mime_type,
      sizeBytes: Number(row.file_size_bytes),
      status: row.status,
      uploadedAt: row.uploaded_at,
    }
  } catch (err) {
    await deleteFile(storageKey).catch((e) =>
      console.error("Cleanup failed for", storageKey, e.message)
    )
    throw err
  }
}

module.exports = { uploadDocument }