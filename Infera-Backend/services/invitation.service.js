const crypto = require("crypto")
const bcrypt = require("bcryptjs")
const { pool } = require("../config/db")
const AppError = require("../utils/AppError")
const { signAccessToken } = require("../utils/token")
const { frontendUrl, invitationExpiresDays } = require("../config/env")

const BCRYPT_ROUNDS = 12

function hashToken(token) {
  return crypto.createHash("sha256").update(token).digest("hex")
}

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
  const tokenHash = hashToken(token)
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

async function acceptInvitation({ token, name, password }) {
  const tokenHash = hashToken(token)
  const passwordHash = await bcrypt.hash(password, BCRYPT_ROUNDS)

  const client = await pool.connect()
  try {
    await client.query("BEGIN")

    const inv = await client.query(
      `SELECT id, organization_id, email, role FROM invitations
       WHERE token_hash = $1 AND accepted_at IS NULL AND expires_at > NOW()
       FOR UPDATE`,
      [tokenHash]
    )
    if (inv.rowCount === 0) {
      throw new AppError(410, "GONE", "This invitation link is invalid or has expired")
    }
    const invitation = inv.rows[0]

    const userResult = await client.query(
      `INSERT INTO users (name, email, password_hash)
       VALUES ($1, $2, $3)
       RETURNING id, name, email`,
      [name, invitation.email, passwordHash]
    )
    const user = userResult.rows[0]

    await client.query(
      `INSERT INTO organization_members (organization_id, user_id, role)
       VALUES ($1, $2, $3)`,
      [invitation.organization_id, user.id, invitation.role]
    )

    await client.query("UPDATE invitations SET accepted_at = NOW() WHERE id = $1", [invitation.id])

    await client.query("COMMIT")

    const accessToken = signAccessToken({
      userId: user.id,
      organizationId: invitation.organization_id,
      role: invitation.role,
    })

    return {
      accessToken,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: invitation.role,
        organizationId: invitation.organization_id,
      },
    }
  } catch (err) {
    await client.query("ROLLBACK")
    if (err.code === "23505") {
      throw new AppError(409, "CONFLICT", "This email is already registered")
    }
    throw err
  } finally {
    client.release()
  }
}

module.exports = { createInvitation, acceptInvitation }