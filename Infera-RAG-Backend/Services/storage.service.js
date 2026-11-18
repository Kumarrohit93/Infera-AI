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

async function downloadBuffer(publicId, format) {
  const configurationError = getConfigurationError()
  if (configurationError) throw configurationError

  const url = cloudinary.utils.private_download_url(publicId, format, {
    resource_type: "raw",
    type: "authenticated",
    expires_at: Math.floor(Date.now() / 1000) + 300,
    attachment: false,
  })
  const response = await fetch(url, { signal: AbortSignal.timeout(60_000) })
  if (!response.ok) {
    throw new Error(`Cloudinary download failed with status ${response.status}`)
  }

  const contentLength = Number(response.headers.get("content-length") || 0)
  if (contentLength > 20 * 1024 * 1024) {
    throw new Error("Stored document exceeds the 20 MB processing limit")
  }

  const buffer = Buffer.from(await response.arrayBuffer())
  if (buffer.length > 20 * 1024 * 1024) {
    throw new Error("Stored document exceeds the 20 MB processing limit")
  }
  return buffer
}

module.exports = { uploadBuffer, downloadBuffer, deleteFile }