const AppError = require("../utils/AppError")
const { registerSchema, loginSchema } = require("../validators/auth.validator")
const authService = require("../services/auth.service")

function parseOrThrow(schema, body) {
  const parsed = schema.safeParse(body)
  if (!parsed.success) {
    const details = parsed.error.issues.map((i) => ({
      field: i.path.join("."),
      message: i.message,
    }))
    throw new AppError(400, "VALIDATION_ERROR", "Invalid input", details)
  }
  return parsed.data
}

async function registerOrganization(req, res) {
  const data = parseOrThrow(registerSchema, req.body)
  const result = await authService.registerOrganization(data)
  res.status(201).json({ success: true, data: result })
}

async function login(req, res) {
  const data = parseOrThrow(loginSchema, req.body)
  const result = await authService.login(data)
  res.status(200).json({ success: true, data: result })
}

async function me(req, res) {
  const result = await authService.getMe(req.user.userId)
  res.status(200).json({ success: true, data: result })
}

module.exports = { registerOrganization, login, me }