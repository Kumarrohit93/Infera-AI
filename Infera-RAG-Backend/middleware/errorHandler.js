const multer = require("multer")
const AppError = require("../utils/AppError")

function notFound(req, res, next) {
  next(new AppError(404, "NOT_FOUND", "Route not found"))
}

function errorHandler(err, req, res, next) {
  let error = err

  if (err instanceof multer.MulterError) {
    if (err.code === "LIMIT_FILE_SIZE") {
      error = new AppError(413, "FILE_TOO_LARGE", "File is larger than 20 MB")
    } else {
      error = new AppError(400, "VALIDATION_ERROR", "Invalid upload request")
    }
  } else if (err.type === "entity.parse.failed") {
    error = new AppError(400, "VALIDATION_ERROR", "Invalid JSON body")
  }

  if (error instanceof AppError) {
    return res.status(error.status).json({
      success: false,
      error: { code: error.code, message: error.message, details: error.details },
    })
  }

  console.error(err)
  res.status(500).json({
    success: false,
    error: { code: "INTERNAL_ERROR", message: "Something went wrong" },
  })
}

module.exports = { notFound, errorHandler }