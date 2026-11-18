const {
  createEmployeeSchema,
  employeeIdParamSchema,
  listEmployeesQuerySchema,
} = require("../validators/employee.validator")
const employeeService = require("../services/employee.service")
const { parseOrThrow } = require("../utils/validate")

async function createEmployee(req, res) {
  const data = parseOrThrow(createEmployeeSchema, req.body)
  const employee = await employeeService.createEmployee({
    ...data,
    organizationId: req.user.organizationId,
  })
  res.status(201).json({ success: true, data: employee })
}

async function listEmployees(req, res) {
  const { search } = parseOrThrow(listEmployeesQuerySchema, req.query)
  const employees = await employeeService.listEmployees({
    organizationId: req.user.organizationId,
    search,
  })
  res.status(200).json({ success: true, data: employees })
}

async function deleteEmployee(req, res) {
  const { id } = parseOrThrow(employeeIdParamSchema, req.params)
  await employeeService.deleteEmployee({
    organizationId: req.user.organizationId,
    userId: id,
  })
  res.status(204).send()
}

module.exports = { createEmployee, listEmployees, deleteEmployee }