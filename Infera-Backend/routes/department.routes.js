const express = require("express")
const {
  listDepartments,
  createDepartment,
} = require("../controllers/department.controller")
const authenticate = require("../middleware/authenticate")
const requireRole = require("../middleware/requireRole")

const router = express.Router()

router.use(authenticate, requireRole("admin"))

router.get("/", listDepartments)
router.post("/", createDepartment)

module.exports = router