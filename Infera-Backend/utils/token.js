const jwt = require("jsonwebtoken")
const { jwtAccessSecret, jwtAccessExpiresIn } = require("../config/env")

function signAccessToken({ userId, organizationId, role }) {
  return jwt.sign({ userId, organizationId, role }, jwtAccessSecret, {
    expiresIn: jwtAccessExpiresIn,
  })
}

function verifyAccessToken(token) {
  return jwt.verify(token, jwtAccessSecret)
}

module.exports = { signAccessToken, verifyAccessToken }