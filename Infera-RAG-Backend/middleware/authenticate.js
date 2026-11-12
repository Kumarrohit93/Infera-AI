const jwt = require("jsonwebtoken")
const AppError = require("../utils/AppError")
const { jwtAccessSecret } = require("../Config/env")

function authenticate(req, res, next) {
  const header = req.headers.authorization

  if (!header || !header.startsWith("Bearer ")) {
    throw new AppError(401, "UNAUTHENTICATED", "Missing or invalid Authorization header")
  }

  const token = header.slice(7)

  let payload
  try {
    payload = jwt.verify(token, jwtAccessSecret, { algorithms: ["HS256"] })
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