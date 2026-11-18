const { cloudinary, missingConfiguration } = require("../Config/cloudinary")

function getConfigurationError() {
  if (missingConfiguration.length === 0) return null

  const error = new Error(
    `Cloudinary is not configured. Set ${missingConfiguration.join(", ")} in the RAG backend environment.`
  )
  error.code = "CLOUDINARY_NOT_CONFIGURED"
  return error
}

function uploadBuffer(buffer, publicId) {
  const configurationError = getConfigurationError()
  if (configurationError) return Promise.reject(configurationError)

  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        resource_type: "raw",
        type: "authenticated",
        public_id: publicId,
        overwrite: false,
      },
      (error, result) => (error ? reject(error) : resolve(result))
    )
    stream.end(buffer)
  })
}

function deleteFile(publicId) {
  const configurationError = getConfigurationError()
  if (configurationError) return Promise.reject(configurationError)

  return cloudinary.uploader.destroy(publicId, {
    resource_type: "raw",
    type: "authenticated",
  })
}

module.exports = { uploadBuffer, deleteFile }