const express = require("express")
const { registerOrganization } = require("../controllers/auth.controller")

const router = express.Router()

router.post("/register-organization", registerOrganization)

module.exports = router