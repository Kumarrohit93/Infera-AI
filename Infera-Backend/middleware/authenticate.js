const AppError = require("../utils/AppError")
const { verifyAccessToken } = require("../utils/token")

function authenticate(req, res, next) {
  const header = req.headers.authorization || ""
  const [scheme, token] = header.split(" ")

  if (scheme !== "Bearer" || !token) {
    throw new AppError(401, "UNAUTHENTICATED", "Missing or invalid Authorization header")
  }

  let payload
  try {
    payload = verifyAccessToken(token)
  } catch (err) {
    throw new AppError(401, "UNAUTHENTICATED", "Invalid or expired token")
  }

  req.user = {
    userId: payload.userId,
    organizationId: payload.organizationId,
    role: payload.role,
  }
  next()
}

module.exports = authenticate