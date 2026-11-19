const { pool } = require("../config/db")
const AppError = require("../utils/AppError")

const DEFAULT_DEPARTMENTS = [
  "HR",
  "IT",
  "Finance",
  "Engineering",
  "Operations",
  "Sales",
  "Marketing",
]

async function seedDefaultDepartments(client, organizationId) {
  await client.query(
    `INSERT INTO departments (organization_id, name)
     SELECT $1, department_name
     FROM unnest($2::text[]) AS defaults(department_name)
     ON CONFLICT (organization_id, lower(name)) DO NOTHING`,
    [organizationId, DEFAULT_DEPARTMENTS]
  )
}

async function listDepartments(organizationId) {
  const result = await pool.query(
    `SELECT d.id, d.name, d.created_at,
            (SELECT COUNT(*) FROM organization_members m
             WHERE m.department_id = d.id
               AND m.organization_id = d.organization_id
               AND m.status = 'active')::int AS employee_count
     FROM departments d
     WHERE d.organization_id = $1
     ORDER BY d.name`,
    [organizationId]
  )
  return result.rows.map((r) => ({
    id: r.id,
    name: r.name,
    employeeCount: r.employee_count,
    createdAt: r.created_at,
  }))
}

async function createDepartment({ organizationId, name }) {
  try {
    const result = await pool.query(
      `INSERT INTO departments (organization_id, name)
       VALUES ($1, $2)
       RETURNING id, name, created_at`,
      [organizationId, name]
    )
    const r = result.rows[0]
    return { id: r.id, name: r.name, employeeCount: 0, createdAt: r.created_at }
  } catch (err) {
    if (err.code === "23505") {
      throw new AppError(409, "CONFLICT", "This department already exists")
    }
    throw err
  }
}

module.exports = { listDepartments, createDepartment, seedDefaultDepartments }