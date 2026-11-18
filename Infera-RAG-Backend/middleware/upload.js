const multer = require("multer")

const MAX_FILE_SIZE = 20 * 1024 * 1024

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_FILE_SIZE, files: 1 },
}).single("file")

module.exports = upload