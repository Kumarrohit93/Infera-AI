require("dotenv").config()

const required = ["PORT", "DATABASE_URL", "JWT_ACCESS_SECRET", "JWT_REFRESH_SECRET"]

for (const key of required) {
  if (!process.env[key]) {
    throw new Error(`Missing environment variable: ${key}`)
  }
}

module.exports = {
  port: process.env.PORT,
  databaseUrl: process.env.DATABASE_URL,
  jwtAccessSecret: process.env.JWT_ACCESS_SECRET,
  jwtRefreshSecret: process.env.JWT_REFRESH_SECRET,
  jwtAccessExpiresIn: process.env.JWT_ACCESS_EXPIRES_IN || "15m",
  jwtRefreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || "7d",
  frontendUrl: process.env.FRONTEND_URL || "http://localhost:5173",
  invitationExpiresDays: Number(process.env.INVITATION_EXPIRES_DAYS) || 7,
}