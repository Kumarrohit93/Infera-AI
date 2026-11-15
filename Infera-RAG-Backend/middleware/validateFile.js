const path = require("path")
const AppError = require("../utils/AppError")
const { detectFileType } = require("../utils/fileType")

const ALLOWED_EXTENSIONS = ["pdf", "docx", "txt"]

function validateFile(req, res, next) {
  if (!req.file) {
    throw new AppError(400, "VALIDATION_ERROR", "Invalid input", [
      { field: "file", message: "File is required" },
    ])
  }

  const detected = detectFileType(req.file.buffer)
  const claimedExt = path
    .extname(req.file.originalname || "")
    .slice(1)
    .toLowerCase()

  if (!detected || !ALLOWED_EXTENSIONS.includes(claimedExt) || claimedExt !== detected.ext) {
    throw new AppError(
      415,
      "UNSUPPORTED_MEDIA_TYPE",
      "Only PDF, DOCX and TXT files are allowed, and the file content must match its extension"
    )
  }

  req.file.detected = detected
  next()
}

module.exports = validateFile