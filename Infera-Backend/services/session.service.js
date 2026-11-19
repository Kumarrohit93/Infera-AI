const crypto = require("crypto")
const { pool } = require("../config/db")
const AppError = require("../utils/AppError")
const { signAccessToken } = require("../utils/token")

const REFRESH_DAYS = Math.max(1, Number(process.env.JWT_REFRESH_DAYS) || 7)
const hashToken = (token) => crypto.createHash("sha256").update(token).digest("hex")

async function createSession(user, executor = pool) {
  const refreshToken = crypto.randomBytes(48).toString("hex")
  await executor.query(
    `INSERT INTO refresh_sessions (token_hash, organization_id, user_id, expires_at)
     VALUES ($1, $2, $3, NOW() + ($4 * INTERVAL '1 day'))`,
    [hashToken(refreshToken), user.organizationId, user.id, REFRESH_DAYS]
  )

  return {
    accessToken: signAccessToken({
      userId: user.id,
      organizationId: user.organizationId,
      role: user.role,
    }),
    refreshToken,
    user,
  }
}

async function rotateSession(refreshToken) {
  if (!refreshToken) {
    throw new AppError(401, "UNAUTHENTICATED", "Session expired. Please log in again.")
  }

  const client = await pool.connect()
  try {
    await client.query("BEGIN")
    const current = await client.query(
      `SELECT rs.token_hash, rs.organization_id, rs.user_id,
              u.name, u.email, m.role, m.status
         FROM refresh_sessions rs
         JOIN users u ON u.id = rs.user_id
         JOIN organization_members m
           ON m.organization_id = rs.organization_id AND m.user_id = rs.user_id
        WHERE rs.token_hash = $1
          AND rs.revoked_at IS NULL
          AND rs.expires_at > NOW()
        FOR UPDATE OF rs`,
      [hashToken(refreshToken)]
    )
    const row = current.rows[0]
    if (!row || row.status !== "active") {
      throw new AppError(401, "UNAUTHENTICATED", "Session expired. Please log in again.")
    }

    await client.query(
      "UPDATE refresh_sessions SET revoked_at = NOW() WHERE token_hash = $1",
      [row.token_hash]
    )
    const session = await createSession({
      id: row.user_id,
      name: row.name,
      email: row.email,
      role: row.role,
      organizationId: row.organization_id,
    }, client)
    await client.query("COMMIT")
    return session
  } catch (error) {
    await client.query("ROLLBACK")
    throw error
  } finally {
    client.release()
  }
}

async function revokeSession(refreshToken) {
  if (!refreshToken) return
  await pool.query(
    "UPDATE refresh_sessions SET revoked_at = NOW() WHERE token_hash = $1 AND revoked_at IS NULL",
    [hashToken(refreshToken)]
  )
}

module.exports = { createSession, rotateSession, revokeSession }
