const pool = require("../Config/db")
const AppError = require("../utils/AppError")

function requireRole(...roles) {
  return async (req, res, next) => {
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