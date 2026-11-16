const {
  uploadDocumentSchema,
  documentIdParamSchema,
} = require("../validators/document.validator");
const documentService = require("../Services/document.service");
const { deleteDocument: removeDocument } = require("../Services/documentDelete.service");
const { parseOrThrow } = require("../utils/validate");
  listDocumentsQuerySchema,
} = require("../validators/document.validator")
const documentService = require("../Services/document.service")
const { deleteDocument: removeDocument } = require("../Services/documentDelete.service")
const { listDocuments: findDocuments } = require("../Services/documentList.service")
const { parseOrThrow } = require("../utils/validate")

async function uploadDocument(req, res) {
  const { folderId } = parseOrThrow(uploadDocumentSchema, req.body);
  const document = await documentService.uploadDocument({
    organizationId: req.user.organizationId,
    userId: req.user.userId,
    folderId,
    file: req.file,
  });
  res.status(202).json({ success: true, data: { document } });
}

async function listDocuments(req, res) {
  const folderId = req.query.folderId;
  const documents = await documentService.listDocuments({
    organizationId: req.user.organizationId,
    userId: req.user.userId,
    role: req.user.role,
    folderId,
  });
  res.status(200).json({ success: true, data: documents });
}

async function listDocuments(req, res) {
  const query = parseOrThrow(listDocumentsQuerySchema, req.query)
  const { documents, meta } = await findDocuments({
    organizationId: req.user.organizationId,
    ...query,
  })
  res.json({ success: true, data: documents, meta })
}

async function deleteDocument(req, res) {
  const { id } = parseOrThrow(documentIdParamSchema, req.params);
  await removeDocument({
    organizationId: req.user.organizationId,
    documentId: id,
  });
  res.status(204).send();
}

module.exports = { uploadDocument, listDocuments, deleteDocument };
