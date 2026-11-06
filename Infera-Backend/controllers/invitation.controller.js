const { createInvitationSchema, acceptInvitationSchema } = require("../validators/invitation.validator")
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

async function acceptInvitation(req, res) {
  const data = parseOrThrow(acceptInvitationSchema, req.body)
  const result = await invitationService.acceptInvitation(data)
  res.status(201).json({ success: true, data: result })
}

module.exports = { createInvitation, acceptInvitation }