const AppError = require("./AppError")

function parseOrThrow(schema, data) {
  const parsed = schema.safeParse(data)
  if (!parsed.success) {
    const details = parsed.error.issues.map((i) => ({
      field: i.path.join("."),
      message: i.message,
    }))
    throw new AppError(400, "VALIDATION_ERROR", "Invalid input", details)
  }
  return parsed.data
}

module.exports = { parseOrThrow }