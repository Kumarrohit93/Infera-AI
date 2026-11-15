const {
  createFolderSchema,
  updateFolderSchema,
  folderIdParamSchema,
  listFoldersQuerySchema,
} = require("../validators/folder.validator")
const folderService = require("../Services/folder.service")
const { parseOrThrow } = require("../utils/validate")

async function createFolder(req, res) {
  const body = parseOrThrow(createFolderSchema, req.body)
  const folder = await folderService.createFolder({
    organizationId: req.user.organizationId,
    userId: req.user.userId,
    ...body,
  })
  res.status(201).json({ success: true, data: folder })
}

async function listFolders(req, res) {
  const { search } = parseOrThrow(listFoldersQuerySchema, req.query)
  const folders = await folderService.listFolders({
    organizationId: req.user.organizationId,
    search,
  })
  res.json({ success: true, data: folders })
}

async function updateFolder(req, res) {
  const { id } = parseOrThrow(folderIdParamSchema, req.params)
  const body = parseOrThrow(updateFolderSchema, req.body)
  const folder = await folderService.updateFolder({
    organizationId: req.user.organizationId,
    folderId: id,
    ...body,
  })
  res.json({ success: true, data: folder })
}

async function deleteFolder(req, res) {
  const { id } = parseOrThrow(folderIdParamSchema, req.params)
  await folderService.deleteFolder({
    organizationId: req.user.organizationId,
    folderId: id,
  })
  res.status(204).send()
}

module.exports = { createFolder, listFolders, updateFolder, deleteFolder }