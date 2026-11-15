const {
  uploadDocumentSchema,
  documentIdParamSchema,
} = require("../validators/document.validator")
const documentService = require("../Services/document.service")
const { deleteDocument: removeDocument } = require("../Services/documentDelete.service")
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

async function deleteDocument(req, res) {
  const { id } = parseOrThrow(documentIdParamSchema, req.params)
  await removeDocument({
    organizationId: req.user.organizationId,
    documentId: id,
  })
  res.status(204).send()
}

module.exports = { uploadDocument, deleteDocument }