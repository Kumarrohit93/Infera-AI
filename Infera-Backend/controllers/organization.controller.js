const { updateOrganizationSchema } = require("../validators/organization.validator")
const organizationService = require("../services/organization.service")
const { parseOrThrow } = require("../utils/validate")

async function getCurrent(req, res) {
  const result = await organizationService.getCurrentOrganization(req.user.organizationId)
  res.status(200).json({ success: true, data: result })
}

async function updateCurrent(req, res) {
  const data = parseOrThrow(updateOrganizationSchema, req.body)
  const result = await organizationService.updateCurrentOrganization(req.user.organizationId, data)
  res.status(200).json({ success: true, data: result })
}

module.exports = { getCurrent, updateCurrent }