const { z } = require("zod")

const createInvitationSchema = z.object({
  email: z.email().max(255),
  role: z.enum(["admin", "member"]),
})

const acceptInvitationSchema = z.object({
  token: z.string().min(1).max(200),
  name: z.string().trim().min(2).max(100),
  password: z.string().min(8).max(72),
})

module.exports = { createInvitationSchema, acceptInvitationSchema }