const AppError = require("../utils/AppError")
const { registerSchema } = require("../validators/auth.validator")
const authService = require("../services/auth.service")

async function registerOrganization(req, res) {
  const parsed = registerSchema.safeParse(req.body)
  if (!parsed.success) {
    const details = parsed.error.issues.map((i) => ({
      field: i.path.join("."),
      message: i.message,
    }))
    throw new AppError(400, "VALIDATION_ERROR", "Invalid input", details)
  }

  const result = await authService.registerOrganization(parsed.data)
  res.status(201).json({ success: true, data: result })
}

module.exports = { registerOrganization }