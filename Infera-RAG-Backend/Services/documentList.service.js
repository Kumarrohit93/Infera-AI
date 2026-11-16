const pool = require("../Config/db")

function toDocument(row) {
  return {
    id: row.id,
    folderId: row.folder_id,
    folderName: row.folder_name,
    originalFilename: row.original_filename,
    mimeType: row.mime_type,
    sizeBytes: Number(row.file_size_bytes),
    status: row.status,
    errorMessage: row.processing_error,
    uploadedBy: row.uploaded_by,
    uploadedAt: row.uploaded_at,
    updatedAt: row.updated_at,
  }
}

async function listDocuments({
  organizationId,
  folderId,
  status,
  search,
  page,
  limit,
}) {
  const values = [organizationId]
  const conditions = ["d.organization_id = $1"]

  if (folderId) {
    values.push(folderId)
    conditions.push(`d.folder_id = $${values.length}`)
  }
  if (status) {
    values.push(status)
    conditions.push(`d.status = $${values.length}`)
  }
  if (search) {
    values.push(search)
    conditions.push(
      `position(lower($${values.length}) in lower(d.original_filename)) > 0`
    )
  }
  const where = conditions.join(" AND ")

  const countResult = await pool.query(
    `SELECT count(*)::int AS total FROM documents d WHERE ${where}`,
    values
  )
  const total = countResult.rows[0].total

  const listValues = [...values, limit, (page - 1) * limit]
  const limitPos = values.length + 1
  const offsetPos = values.length + 2

  const { rows } = await pool.query(
    `SELECT d.id, d.folder_id, f.name AS folder_name, d.original_filename,
            d.mime_type, d.file_size_bytes, d.status, d.processing_error,
            d.uploaded_by, d.uploaded_at, d.updated_at
       FROM documents d
       LEFT JOIN folders f
              ON f.id = d.folder_id AND f.organization_id = d.organization_id
      WHERE ${where}
      ORDER BY d.uploaded_at DESC, d.id
      LIMIT $${limitPos} OFFSET $${offsetPos}`,
    listValues
  )

  return {
    documents: rows.map(toDocument),
    meta: { page, limit, total },
  }
}

module.exports = { listDocuments }