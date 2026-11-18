const { z } = require("zod")

const updateOrganizationSchema = z.object({
  name: z.string().trim().min(2).max(150),
})

module.exports = { updateOrganizationSchema }