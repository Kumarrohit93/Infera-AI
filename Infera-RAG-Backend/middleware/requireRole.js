const pool = require("../Config/db")
const AppError = require("../utils/AppError")

function requireRole(...roles) {
  return async (req, res, next) => {
    // Step 1: Check the role from the JWT token (already verified by authenticate middleware).
    // The JWT is cryptographically signed, so req.user.role is trustworthy.
    if (req.user.role && roles.includes(req.user.role)) {
      return next()
    }

    // Step 2: Fallback — verify role from the organization_members table.
    // This handles cases where JWT role is missing or not set.
    const result = await pool.query(
      `SELECT role FROM organization_members
       WHERE organization_id = $1 AND user_id = $2 AND status = 'active'`,
      [req.user.organizationId, req.user.userId]
    )

    if (result.rowCount === 0 || !roles.includes(result.rows[0].role)) {
      throw new AppError(403, "FORBIDDEN", "You do not have permission to do this")
    }

    req.user.role = result.rows[0].role
    next()
  }
}

module.exports = requireRole