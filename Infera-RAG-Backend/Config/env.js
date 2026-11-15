require("dotenv").config()

const required = ["JWT_ACCESS_SECRET"]

for (const key of required) {
  if (!process.env[key]) {
    throw new Error(`Missing environment variable: ${key}`)
  }
}

module.exports = {
  jwtAccessSecret: process.env.JWT_ACCESS_SECRET,
  cloudinaryCloudName: process.env.CLOUDINARY_CLOUD_NAME,
  cloudinaryApiKey: process.env.CLOUDINARY_API_KEY,
  cloudinaryApiSecret: process.env.CLOUDINARY_API_SECRET,
}