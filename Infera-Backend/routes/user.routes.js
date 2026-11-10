const express = require("express")
const { createInvitation } = require("../controllers/invitation.controller")
const authenticate = require("../middleware/authenticate")
const requireRole = require("../middleware/requireRole")

const router = express.Router()

router.post("/invitations", authenticate, requireRole("admin"), createInvitation)

module.exports = router