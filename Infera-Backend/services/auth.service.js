const bcrypt = require("bcrypt")
const { pool } = require("../config/db")
const AppError = require("../utils/AppError")
const { signAccessToken } = require("../utils/token")

async function registerOrganization({ organizationName, name, email, password }) {
  const passwordHash = await bcrypt.hash(password, 10)

  const client = await pool.connect()
  try {
    await client.query("BEGIN")

    const org = await client.query(
      "INSERT INTO organizations (name) VALUES ($1) RETURNING id, name",
      [organizationName]
    )
    const user = await client.query(
      "INSERT INTO users (name, email, password_hash) VALUES ($1, $2, $3) RETURNING id, name, email",
      [name, email.toLowerCase(), passwordHash]
    )
    await client.query(
      "INSERT INTO organization_members (organization_id, user_id, role) VALUES ($1, $2, 'admin')",
      [org.rows[0].id, user.rows[0].id]
    )

    await client.query("COMMIT")
    return {
      organization: org.rows[0],
      user: { ...user.rows[0], role: "admin" },
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

async function login({ email, password }) {
  const result = await pool.query(
    `SELECT u.id, u.name, u.email, u.password_hash,
            m.organization_id, m.role, m.status
     FROM users u
     JOIN organization_members m ON m.user_id = u.id
     WHERE u.email = $1`,
    [email.toLowerCase()]
  )
  const row = result.rows[0]

  const passwordOk = row ? await bcrypt.compare(password, row.password_hash) : false
  if (!passwordOk) {
    throw new AppError(401, "UNAUTHENTICATED", "Invalid email or password")
  }
  if (row.status !== "active") {
    throw new AppError(403, "FORBIDDEN", "Your account is not active in this organization")
  }

  const accessToken = signAccessToken({
    userId: row.id,
    organizationId: row.organization_id,
    role: row.role,
  })

  return {
    accessToken,
    user: {
      id: row.id,
      name: row.name,
      email: row.email,
      role: row.role,
      organizationId: row.organization_id,
    },
  }
}

async function getMe(userId) {
  const result = await pool.query(
    `SELECT u.id, u.name, u.email,
            o.id AS organization_id, o.name AS organization_name,
            m.role, m.status
     FROM users u
     JOIN organization_members m ON m.user_id = u.id
     JOIN organizations o ON o.id = m.organization_id
     WHERE u.id = $1`,
    [userId]
  )
  const row = result.rows[0]

  if (!row) {
    throw new AppError(401, "UNAUTHENTICATED", "User no longer exists")
  }
  if (row.status !== "active") {
    throw new AppError(403, "FORBIDDEN", "Your account is not active in this organization")
  }

  return {
    user: { id: row.id, name: row.name, email: row.email },
    organization: { id: row.organization_id, name: row.organization_name },
    role: row.role,
  }
}

module.exports = { registerOrganization, login, getMe }