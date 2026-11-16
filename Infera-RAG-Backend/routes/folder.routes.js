const express = require("express")
const authenticate = require("../middleware/authenticate")
const requireRole = require("../middleware/requireRole")
const {
  createFolder,
  listFolders,
  updateFolder,
  deleteFolder,
} = require("../Controllers/folder.controller")

const router = express.Router()

// Phase 1: all routes are Admin only.
// Phase 2 will let Members list the folders they are permitted to see.
router.get("/", authenticate, requireRole("admin"), listFolders)
router.post("/", authenticate, requireRole("admin"), createFolder)
router.patch("/:id", authenticate, requireRole("admin"), updateFolder)
router.delete("/:id", authenticate, requireRole("admin"), deleteFolder)

module.exports = router