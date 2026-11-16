const express = require("express");
const authenticate = require("../middleware/authenticate");
const requireRole = require("../middleware/requireRole");
const upload = require("../middleware/upload");
const validateFile = require("../middleware/validateFile");
const {
  uploadDocument,
  listDocuments,
  deleteDocument,
} = require("../Controllers/document.controller");

const router = express.Router();

// List documents: Admin lists all, Member lists only authorized documents
router.get("/", authenticate, listDocuments);

// Upload: Admin only
router.post(
  "/upload",
  authenticate,
  requireRole("admin"),
  upload,
  validateFile,
  uploadDocument
);

// Delete: Admin only
router.delete("/:id", authenticate, requireRole("admin"), deleteDocument);

module.exports = router;
