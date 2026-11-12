const { uploadDocumentSchema } = require("../validators/document.validator")
const documentService = require("../Services/document.service")
const { parseOrThrow } = require("../utils/validate")

async function uploadDocument(req, res) {
  const { folderId } = parseOrThrow(uploadDocumentSchema, req.body)
  const document = await documentService.uploadDocument({
    organizationId: req.user.organizationId,
    userId: req.user.userId,
    folderId,
    file: req.file,
  })
  res.status(202).json({ success: true, data: { document } })
}

module.exports = { uploadDocument }