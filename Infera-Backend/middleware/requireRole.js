const AppError = require("../utils/AppError")

function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      throw new AppError(403, "FORBIDDEN", "You do not have permission to do this")
    }
    next()
  }
}

module.exports = requireRole