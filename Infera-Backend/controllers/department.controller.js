const { createDepartmentSchema } = require("../validators/employee.validator")
const departmentService = require("../services/department.service")
const { parseOrThrow } = require("../utils/validate")

async function listDepartments(req, res) {
  const departments = await departmentService.listDepartments(req.user.organizationId)
  res.status(200).json({ success: true, data: departments })
}

async function createDepartment(req, res) {
  const { name } = parseOrThrow(createDepartmentSchema, req.body)
  const department = await departmentService.createDepartment({
    organizationId: req.user.organizationId,
    name,
  })
  res.status(201).json({ success: true, data: department })
}

module.exports = { listDepartments, createDepartment }