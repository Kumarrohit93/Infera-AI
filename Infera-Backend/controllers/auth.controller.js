const {
  registerSchema,
  loginSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
} = require("../validators/auth.validator")
const authService = require("../services/auth.service")
const passwordResetService = require("../services/passwordReset.service")
const sessionService = require("../services/session.service")
const { parseOrThrow } = require("../utils/validate")
const { readCookie, sendSession, clearSessionCookie } = require("../utils/sessionCookie")

async function registerOrganization(req, res) {
  const data = parseOrThrow(registerSchema, req.body)
  const result = await authService.registerOrganization(data)
  res.status(201).json({ success: true, data: result })
}

async function login(req, res) {
  const data = parseOrThrow(loginSchema, req.body)
  const result = await authService.login(data)
  sendSession(res, result)
}

async function refresh(req, res) {
  const result = await sessionService.rotateSession(readCookie(req, "infera_refresh"))
  sendSession(res, result)
}

async function logout(req, res) {
  await sessionService.revokeSession(readCookie(req, "infera_refresh"))
  clearSessionCookie(res)
  res.status(204).send()
}

async function requestPasswordReset(req, res) {
  const { email } = parseOrThrow(forgotPasswordSchema, req.body)
  await passwordResetService.requestPasswordReset(email)
  res.status(200).json({
    success: true,
    message: "If an account exists for that email, a reset link has been sent.",
  })
}

async function resetPassword(req, res) {
  const data = parseOrThrow(resetPasswordSchema, req.body)
  await passwordResetService.resetPassword(data)
  res.status(200).json({ success: true, message: "Password updated. You can now sign in." })
}

async function me(req, res) {
  const result = await authService.getMe(req.user.userId)
  res.status(200).json({ success: true, data: result })
}

module.exports = {
  registerOrganization,
  login,
  refresh,
  logout,
  requestPasswordReset,
  resetPassword,
  me,
}