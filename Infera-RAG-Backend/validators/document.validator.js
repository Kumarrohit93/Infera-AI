const { z } = require("zod")

const uploadDocumentSchema = z.object({ folderId: z.uuid() })

const documentIdParamSchema = z.object({ id: z.uuid() })

// page defaults to 1, limit defaults to 20 (max 100) - safety limits chosen by us
const listDocumentsQuerySchema = z.object({
  folderId: z.uuid().optional(),
  status: z
    .enum(["pending", "queued", "processing", "ready", "failed", "archived"])
    .optional(),
  search: z.string().trim().max(255).optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
})

module.exports = {
  uploadDocumentSchema,
  documentIdParamSchema,
  listDocumentsQuerySchema,
}