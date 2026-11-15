const AppError = require("../utils/AppError")

function notFound(req, res) {
  res.status(404).json({
    success: false,
    error: { code: "NOT_FOUND", message: "Route not found" },
  })
}

function errorHandler(err, req, res, next) {
  if (err instanceof AppError) {
    return res.status(err.status).json({
      success: false,
      error: { code: err.code, message: err.message, details: err.details },
    })
  }
  if (err.type === "entity.parse.failed") {
    return res.status(400).json({
      success: false,
      error: { code: "VALIDATION_ERROR", message: "Request body is not valid JSON" },
    })
  }
  console.error(err.message)
  res.status(500).json({
    success: false,
    error: { code: "INTERNAL_ERROR", message: "Something went wrong" },
  })
}

module.exports = { notFound, errorHandler }