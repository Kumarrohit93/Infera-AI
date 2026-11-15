const pool = require("../Config/db")
const AppError = require("../utils/AppError")
const { deleteFile } = require("./storage.service")

async function deleteDocument({ organizationId, documentId }) {
  // 1) DB first: the document disappears from lists and search immediately.
  //    document_chunks are removed by ON DELETE CASCADE.
  const { rows } = await pool.query(
    `DELETE FROM documents
      WHERE id = $1 AND organization_id = $2
      RETURNING storage_key`,
    [documentId, organizationId]
  )
  if (rows.length === 0) {
    throw new AppError(404, "NOT_FOUND", "Document not found")
  }

  // 2) Then remove the file from Cloudinary.
  //    If this fails the row is already gone, so only log the key for manual cleanup.
  const storageKey = rows[0].storage_key
  try {
    const result = await deleteFile(storageKey)
    if (result.result !== "ok") {
      console.warn("Cloudinary delete returned:", result.result, storageKey)
    }
  } catch (err) {
    console.error("Cloudinary delete failed for", storageKey, err.message)
  }
}

module.exports = { deleteDocument }