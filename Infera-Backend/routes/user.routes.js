const express = require("express")
const { createInvitation } = require("../controllers/invitation.controller")
const authenticate = require("../middleware/authenticate")
const requireRole = require("../middleware/requireRole")
const { pool } = require("../config/db")

const router = express.Router()

// List all members in the authenticated admin's organization
router.get("/", authenticate, requireRole("admin"), async (req, res, next) => {
  try {
    const { rows } = await pool.query(
      `SELECT id, name, email, role, status, "employeeId", department, "joinedAt"
       FROM (
         SELECT u.id::text AS id, u.name, u.email, m.role, m.status,
                m.employee_id AS "employeeId", d.name AS department,
                m.joined_at AS "joinedAt"
         FROM users u
         JOIN organization_members m ON m.user_id = u.id
         LEFT JOIN departments d
           ON d.id = m.department_id AND d.organization_id = m.organization_id
         WHERE m.organization_id = $1
           AND m.status <> 'removed'

         UNION ALL

         SELECT i.id::text AS id, NULL::text AS name, i.email, i.role,
                'invited'::text AS status, NULL::text AS "employeeId",
                NULL::text AS department, i.created_at AS "joinedAt"
         FROM invitations i
         WHERE i.organization_id = $1
           AND i.accepted_at IS NULL
           AND i.expires_at > NOW()
       ) organization_users
       ORDER BY "joinedAt" DESC`,
      [req.user.organizationId]
    )
    res.json({ success: true, data: rows })
  } catch (err) {
    next(err)
  }
})

// Invite a member to the organization
router.post("/invitations", authenticate, requireRole("admin"), createInvitation)

// Remove a member from the organization
router.delete("/:id", authenticate, requireRole("admin"), async (req, res, next) => {
  try {
    let result = await pool.query(
      `DELETE FROM organization_members
       WHERE user_id = $1 AND organization_id = $2`,
      [req.params.id, req.user.organizationId]
    )
    if (result.rowCount === 0) {
      result = await pool.query(
        `DELETE FROM invitations
         WHERE id = $1 AND organization_id = $2 AND accepted_at IS NULL`,
        [req.params.id, req.user.organizationId]
      )
    }
    if (result.rowCount === 0) {
      return res.status(404).json({ success: false, message: "Member not found in organization" })
    }
    res.status(204).send()
  } catch (err) {
    next(err)
  }
})

module.exports = router