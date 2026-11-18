const { pool } = require("../config/db")
const AppError = require("../utils/AppError")

function format(row) {
  return { id: row.id, name: row.name, createdAt: row.created_at }
}

async function getCurrentOrganization(organizationId) {
  const result = await pool.query(
    "SELECT id, name, created_at FROM organizations WHERE id = $1",
    [organizationId]
  )
  if (result.rows.length === 0) {
    throw new AppError(404, "NOT_FOUND", "Organization not found")
  }
  return format(result.rows[0])
}

async function updateCurrentOrganization(organizationId, { name }) {
  const result = await pool.query(
    "UPDATE organizations SET name = $1 WHERE id = $2 RETURNING id, name, created_at",
    [name, organizationId]
  )
  if (result.rows.length === 0) {
    throw new AppError(404, "NOT_FOUND", "Organization not found")
  }
  return format(result.rows[0])
}

module.exports = { getCurrentOrganization, updateCurrentOrganization }