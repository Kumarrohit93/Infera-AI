const bcrypt = require("bcryptjs")
const { pool } = require("../config/db")
const AppError = require("../utils/AppError")

const BCRYPT_ROUNDS = 12

const SELECT_EMPLOYEE = `
  SELECT u.id, u.name, u.email, u.phone,
         m.employee_id, m.status, m.joined_at,
         d.id AS department_id, d.name AS department_name
  FROM organization_members m
  JOIN users u ON u.id = m.user_id
  LEFT JOIN departments d
    ON d.id = m.department_id AND d.organization_id = m.organization_id
`

function mapEmployee(row) {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    phone: row.phone,
    employeeId: row.employee_id,
    department: row.department_name || null,
    departmentId: row.department_id || null,
    status: row.status,
    createdAt: row.joined_at,
  }
}

async function getEmployee(userId, organizationId) {
  const result = await pool.query(
    `${SELECT_EMPLOYEE}
     WHERE m.organization_id = $1 AND m.user_id = $2 AND m.role = 'member'`,
    [organizationId, userId]
  )
  if (result.rowCount === 0) {
    throw new AppError(404, "NOT_FOUND", "Employee not found")
  }
  return mapEmployee(result.rows[0])
}

// departmentId mile to wahi use hoga (isi organization ka hona chahiye).
// Sirf naam mile to case-insensitive dhundho, na mile to bana do.
async function resolveDepartmentId(client, organizationId, department, departmentId) {
  if (departmentId) {
    const dep = await client.query(
      "SELECT id FROM departments WHERE id = $1 AND organization_id = $2",
      [departmentId, organizationId]
    )
    if (dep.rowCount === 0) {
      throw new AppError(404, "NOT_FOUND", "Department not found")
    }
    return dep.rows[0].id
  }
  if (department) {
    const dep = await client.query(
      `INSERT INTO departments (organization_id, name)
       VALUES ($1, $2)
       ON CONFLICT (organization_id, lower(name))
       DO UPDATE SET name = departments.name
       RETURNING id`,
      [organizationId, department]
    )
    return dep.rows[0].id
  }
  return null
}

async function createEmployee({
  organizationId,
  name,
  email,
  password,
  phone,
  employeeId,
  department,
  departmentId,
}) {
  const passwordHash = await bcrypt.hash(password, BCRYPT_ROUNDS)

  const client = await pool.connect()
  try {
    await client.query("BEGIN")

    const resolvedDepartmentId = await resolveDepartmentId(
      client,
      organizationId,
      department,
      departmentId
    )

    const user = await client.query(
      `INSERT INTO users (name, email, password_hash, phone)
       VALUES ($1, $2, $3, $4)
       RETURNING id`,
      [name, email.toLowerCase(), passwordHash, phone]
    )

    await client.query(
      `INSERT INTO organization_members
         (organization_id, user_id, role, employee_id, department_id)
       VALUES ($1, $2, 'member', $3, $4)`,
      [organizationId, user.rows[0].id, employeeId, resolvedDepartmentId]
    )

    await client.query("COMMIT")
    return await getEmployee(user.rows[0].id, organizationId)
  } catch (err) {
    await client.query("ROLLBACK")
    if (err.code === "23505") {
      if (err.constraint === "om_employee_id_unique") {
        throw new AppError(409, "CONFLICT", "This employee ID is already used")
      }
      throw new AppError(409, "CONFLICT", "This email is already registered")
    }
    throw err
  } finally {
    client.release()
  }
}

async function listEmployees({ organizationId, search }) {
  const params = [organizationId]
  let where = "WHERE m.organization_id = $1 AND m.role = 'member' AND m.status = 'active'"

  if (search) {
    params.push(search)
    where += ` AND (
      position(lower($2) in lower(u.name)) > 0
      OR position(lower($2) in lower(u.email)) > 0
      OR position(lower($2) in lower(coalesce(m.employee_id, ''))) > 0
    )`
  }

  const result = await pool.query(
    `${SELECT_EMPLOYEE} ${where} ORDER BY m.joined_at DESC`,
    params
  )
  return result.rows.map(mapEmployee)
}

async function deleteEmployee({ organizationId, userId }) {
  const result = await pool.query(
    `UPDATE organization_members
     SET status = 'removed'
     WHERE organization_id = $1 AND user_id = $2
       AND role = 'member' AND status = 'active'
     RETURNING user_id`,
    [organizationId, userId]
  )
  if (result.rowCount === 0) {
    throw new AppError(404, "NOT_FOUND", "Employee not found")
  }
}

module.exports = { createEmployee, listEmployees, deleteEmployee }