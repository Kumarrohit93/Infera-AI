const express = require("express")
const { registerOrganization, login, me } = require("../controllers/auth.controller")
const authenticate = require("../middleware/authenticate")

const router = express.Router()

router.post("/register-organization", registerOrganization)
router.post("/login", login)
router.get("/me", authenticate, me)

module.exports = router