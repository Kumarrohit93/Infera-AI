const express = require("express")
const {
  registerOrganization,
  login,
  refresh,
  logout,
  requestPasswordReset,
  resetPassword,
  me,
} = require("../controllers/auth.controller")
const authenticate = require("../middleware/authenticate")
const { acceptInvitation } = require("../controllers/invitation.controller")

const router = express.Router()

router.post("/register-organization", registerOrganization)
router.post("/login", login)
router.post("/refresh", refresh)
router.post("/logout", logout)
router.post("/forgot-password", requestPasswordReset)
router.post("/reset-password", resetPassword)
router.post("/accept-invitation", acceptInvitation)
router.get("/me", authenticate, me)

module.exports = router