const { z } = require("zod")

const uploadDocumentSchema = z.object({
  folderId: z.uuid(),
})

module.exports = { uploadDocumentSchema }