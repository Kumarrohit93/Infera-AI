const bcrypt = require("bcrypt")
const { pool } = require("../config/db")
const AppError = require("../utils/AppError")

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

module.exports = { registerOrganization }