const express = require("express")
const {
  createEmployee,
  listEmployees,
  deleteEmployee,
} = require("../controllers/employee.controller")
const authenticate = require("../middleware/authenticate")
const requireRole = require("../middleware/requireRole")

const router = express.Router()

router.use(authenticate, requireRole("admin"))

router.get("/", listEmployees)
router.post("/", createEmployee)
router.delete("/:id", deleteEmployee)

module.exports = router