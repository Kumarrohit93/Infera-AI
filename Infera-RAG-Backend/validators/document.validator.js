const { z } = require("zod")

const uploadDocumentSchema = z.object({ folderId: z.uuid() })

const documentIdParamSchema = z.object({ id: z.uuid() })

module.exports = { uploadDocumentSchema, documentIdParamSchema }