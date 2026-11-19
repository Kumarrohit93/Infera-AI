const crypto = require("crypto")
const bcrypt = require("bcryptjs")
const { pool } = require("../config/db")
const { frontendUrl } = require("../config/env")
const { sendEmail } = require("./email.service")
const AppError = require("../utils/AppError")

const hashToken = (token) => crypto.createHash("sha256").update(token).digest("hex")

async function requestPasswordReset(email) {
  const normalizedEmail = email.toLowerCase()
  const result = await pool.query(
    "SELECT id, email FROM users WHERE email = $1",
    [normalizedEmail]
  )

  if (result.rowCount === 0) return

  const user = result.rows[0]
  const token = crypto.randomBytes(32).toString("hex")
  const tokenHash = hashToken(token)
  await pool.query(
    "DELETE FROM password_reset_tokens WHERE user_id = $1",
    [user.id]
  )
  await pool.query(
    `INSERT INTO password_reset_tokens (token_hash, user_id, expires_at)
     VALUES ($1, $2, NOW() + INTERVAL '1 hour')`,
    [tokenHash, user.id]
  )

  const resetUrl = `${frontendUrl.replace(/\/$/, "")}/reset-password?token=${token}`
  try {
    const sent = await sendEmail({
      to: user.email,
      subject: "Reset your Infera AI password",
      html: `<p>Use this one-time link to reset your password:</p><p><a href="${resetUrl}">Reset password</a></p><p>The link expires in one hour.</p>`,
    })
    if (!sent) console.log(`[DEV] Password reset link for ${user.email}: ${resetUrl}`)
  } catch (error) {
    await pool.query("DELETE FROM password_reset_tokens WHERE token_hash = $1", [tokenHash])
    throw new AppError(503, "EMAIL_DELIVERY_FAILED", error.message)
  }
}

async function resetPassword({ token, password }) {
  const client = await pool.connect()
  try {
    await client.query("BEGIN")
    const tokenResult = await client.query(
      `SELECT token_hash, user_id
         FROM password_reset_tokens
        WHERE token_hash = $1 AND used_at IS NULL AND expires_at > NOW()
        FOR UPDATE`,
      [hashToken(token)]
    )
    const reset = tokenResult.rows[0]
    if (!reset) {
      throw new AppError(410, "GONE", "This password reset link is invalid or has expired.")
    }

    const passwordHash = await bcrypt.hash(password, 12)
    await client.query("UPDATE users SET password_hash = $1 WHERE id = $2", [
      passwordHash,
      reset.user_id,
    ])
    await client.query(
      "UPDATE password_reset_tokens SET used_at = NOW() WHERE token_hash = $1",
      [reset.token_hash]
    )
    await client.query(
      "UPDATE refresh_sessions SET revoked_at = NOW() WHERE user_id = $1 AND revoked_at IS NULL",
      [reset.user_id]
    )
    await client.query("COMMIT")
  } catch (error) {
    await client.query("ROLLBACK")
    throw error
  } finally {
    client.release()
  }
}

module.exports = { requestPasswordReset, resetPassword }
