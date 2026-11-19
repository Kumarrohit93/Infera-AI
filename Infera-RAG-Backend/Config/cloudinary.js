const { v2: cloudinary } = require("cloudinary")
const { cloudinaryCloudName, cloudinaryApiKey, cloudinaryApiSecret } = require("./env")

const missingConfiguration = [
  ["CLOUDINARY_CLOUD_NAME", cloudinaryCloudName],
  ["CLOUDINARY_API_KEY", cloudinaryApiKey],
  ["CLOUDINARY_API_SECRET", cloudinaryApiSecret],
]
  .filter(([, value]) => !value)
  .map(([name]) => name)

if (missingConfiguration.length === 0) {
  cloudinary.config({
    cloud_name: cloudinaryCloudName,
    api_key: cloudinaryApiKey,
    api_secret: cloudinaryApiSecret,
    secure: true,
  })
}

module.exports = { cloudinary, missingConfiguration }