const { z } = require("zod")

const registerSchema = z.object({
  organizationName: z.string().trim().min(2).max(150),
  name: z.string().trim().min(2).max(100),
  email: z.email().max(255),
  password: z.string().min(8).max(72),
})

module.exports = { registerSchema }