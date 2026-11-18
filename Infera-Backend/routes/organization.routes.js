const express = require("express")
const { getCurrent, updateCurrent } = require("../controllers/organization.controller")
const authenticate = require("../middleware/authenticate")
const requireRole = require("../middleware/requireRole")

const router = express.Router()

router.get("/current", authenticate, getCurrent)
router.patch("/current", authenticate, requireRole("admin"), updateCurrent)

module.exports = router