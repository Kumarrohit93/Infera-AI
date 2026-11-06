const crypto = require("crypto")
const { pool } = require("../config/db")
const AppError = require("../utils/AppError")
const { frontendUrl, invitationExpiresDays } = require("../config/env")

async function createInvitation({ organizationId, invitedBy, email, role }) {
  const emailLower = email.toLowerCase()

  const existingUser = await pool.query("SELECT 1 FROM users WHERE email = $1", [emailLower])
  if (existingUser.rowCount > 0) {
    throw new AppError(409, "CONFLICT", "This email is already registered")
  }

  const pending = await pool.query(
    `SELECT 1 FROM invitations
     WHERE organization_id = $1 AND email = $2 AND accepted_at IS NULL AND expires_at > NOW()`,
    [organizationId, emailLower]
  )
  if (pending.rowCount > 0) {
    throw new AppError(409, "CONFLICT", "This email already has a pending invitation")
  }

  const token = crypto.randomBytes(32).toString("hex")
  const tokenHash = crypto.createHash("sha256").update(token).digest("hex")
  const expiresAt = new Date(Date.now() + invitationExpiresDays * 24 * 60 * 60 * 1000)

  const result = await pool.query(
    `INSERT INTO invitations (organization_id, email, role, token_hash, expires_at, invited_by)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING id, email, role, expires_at, created_at`,
    [organizationId, emailLower, role, tokenHash, expiresAt, invitedBy]
  )
  const row = result.rows[0]

  if (process.env.NODE_ENV !== "production") {
    console.log(`[DEV] Invitation link for ${emailLower}: ${frontendUrl}/accept-invitation?token=${token}`)
  }

  return {
    id: row.id,
    email: row.email,
    role: row.role,
    expiresAt: row.expires_at,
    createdAt: row.created_at,
  }
}

module.exports = { createInvitation }