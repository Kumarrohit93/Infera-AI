const cloudinary = require("../Config/cloudinary")

function uploadBuffer(buffer, publicId) {
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
  return cloudinary.uploader.destroy(publicId, {
    resource_type: "raw",
    type: "authenticated",
  })
}

module.exports = { uploadBuffer, deleteFile }