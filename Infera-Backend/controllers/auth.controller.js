const { registerSchema, loginSchema } = require("../validators/auth.validator")
const authService = require("../services/auth.service")
const { parseOrThrow } = require("../utils/validate")

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