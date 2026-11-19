const feedbackService = require("../Services/feedback.service");
const { z } = require("zod");
const { parseOrThrow } = require("../utils/validate");

const feedbackSchema = z.object({
  helpful: z.boolean(),
  comment: z.string().trim().max(1000).optional(),
});
const idSchema = z.object({ id: z.string().uuid() });

async function saveFeedback(req, res) {
  const { id } = parseOrThrow(idSchema, req.params);
  const body = parseOrThrow(feedbackSchema, req.body);
  const feedback = await feedbackService.saveFeedback({
    messageId: id,
    organizationId: req.user.organizationId,
    userId: req.user.userId,
    ...body,
  });
  res.status(200).json({ success: true, data: feedback });
}

async function listFeedback(req, res) {
  const feedback = await feedbackService.listOrganizationFeedback(req.user.organizationId);
  res.status(200).json({ success: true, data: feedback });
}

async function getMonitoring(req, res) {
  const monitoring = await feedbackService.getMonitoring(req.user.organizationId);
  res.status(200).json({ success: true, data: monitoring });
}

module.exports = { saveFeedback, listFeedback, getMonitoring };
