const { z } = require("zod")

const createInvitationSchema = z.object({
  email: z.email().max(255),
  role: z.enum(["admin", "member"]),
})

module.exports = { createInvitationSchema }