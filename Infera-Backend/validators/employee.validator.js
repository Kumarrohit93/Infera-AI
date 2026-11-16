const { z } = require("zod")

const optionalText = (max) =>
  z.string().trim().max(max).nullish().transform((v) => v || null)

const createEmployeeSchema = z.object({
  name: z.string().trim().min(2).max(100),
  email: z.email().max(255),
  password: z.string().min(8).max(72),
  phone: optionalText(20),
  employeeId: optionalText(50),
  department: optionalText(100),
  departmentId: z.uuid().nullish().transform((v) => v || null),
})

const employeeIdParamSchema = z.object({ id: z.uuid() })

const listEmployeesQuerySchema = z.object({
  search: z.string().trim().max(255).optional(),
})

const createDepartmentSchema = z.object({
  name: z.string().trim().min(1).max(100),
})

module.exports = {
  createEmployeeSchema,
  employeeIdParamSchema,
  listEmployeesQuerySchema,
  createDepartmentSchema,
}