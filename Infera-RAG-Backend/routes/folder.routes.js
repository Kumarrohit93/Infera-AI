const express = require("express")
const authenticate = require("../middleware/authenticate")
const requireRole = require("../middleware/requireRole")
const {
  createFolder,
  listFolders,
  updateFolder,
  deleteFolder,
} = require("../controllers/folder.controller")

const router = express.Router()

router.get("/", authenticate, listFolders)
router.post("/", authenticate, requireRole("admin"), createFolder)
router.patch("/:id", authenticate, requireRole("admin"), updateFolder)
router.delete("/:id", authenticate, requireRole("admin"), deleteFolder)

module.exports = router