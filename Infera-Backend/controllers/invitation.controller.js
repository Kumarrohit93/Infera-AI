const { createInvitationSchema } = require("../validators/invitation.validator")
const invitationService = require("../services/invitation.service")
const { parseOrThrow } = require("../utils/validate")

async function createInvitation(req, res) {
  const data = parseOrThrow(createInvitationSchema, req.body)
  const invitation = await invitationService.createInvitation({
    ...data,
    organizationId: req.user.organizationId,
    invitedBy: req.user.userId,
  })
  res.status(201).json({ success: true, data: { invitation } })
}

module.exports = { createInvitation }