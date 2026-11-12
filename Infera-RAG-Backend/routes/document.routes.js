const express = require("express")
const authenticate = require("../middleware/authenticate")
const requireRole = require("../middleware/requireRole")
const upload = require("../middleware/upload")
const validateFile = require("../middleware/validateFile")
const { uploadDocument } = require("../controllers/document.controller")

const router = express.Router()

router.post(
  "/upload",
  authenticate,
  requireRole("admin"),
  upload,
  validateFile,
  uploadDocument
)

module.exports = router