const express = require("express")
const authenticate = require("../middleware/authenticate")
const requireRole = require("../middleware/requireRole")
const upload = require("../middleware/upload")
const validateFile = require("../middleware/validateFile")
const {
  uploadDocument,
  listDocuments,
  deleteDocument,
} = require("../controllers/document.controller")

const router = express.Router()

// Phase 1: Admin only. Members will get access after folder_permissions exists.
router.get("/", authenticate, requireRole("admin"), listDocuments)

router.post(
  "/upload",
  authenticate,
  requireRole("admin"),
  upload,
  validateFile,
  uploadDocument
)

router.delete("/:id", authenticate, requireRole("admin"), deleteDocument)

module.exports = router