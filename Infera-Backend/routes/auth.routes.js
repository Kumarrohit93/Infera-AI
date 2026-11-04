const express = require("express")
const { registerOrganization, login } = require("../controllers/auth.controller")

const router = express.Router()

router.post("/register-organization", registerOrganization)
router.post("/login", login)

module.exports = router