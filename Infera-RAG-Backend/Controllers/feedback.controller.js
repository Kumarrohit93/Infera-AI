const feedbackService = require("../Services/feedback.service");
const analyticsService = require("../Services/analytics.service");
const { z } = require("zod");
const { parseOrThrow } = require("../utils/validate");

const feedbackSchema = z.object({
  helpful: z.boolean(),
  comment: z.string().trim().max(1000).optional(),
});
const idSchema = z.object({ id: z.string().uuid() });
const replySchema = z.object({ reply: z.string().trim().min(1).max(2000) });

// Member submits a helpful/not-helpful rating on an AI message
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

// Admin lists all organization feedback
async function listFeedback(req, res) {
  const feedback = await feedbackService.listOrganizationFeedback(req.user.organizationId);
  res.status(200).json({ success: true, data: feedback });
}

// Admin replies to a feedback item
async function replyToFeedback(req, res) {
  const { id } = parseOrThrow(idSchema, req.params);
  const { reply } = parseOrThrow(replySchema, req.body);
  const result = await feedbackService.replyToFeedback({
    feedbackId: id,
    organizationId: req.user.organizationId,
    replyText: reply,
  });
  res.status(200).json({ success: true, data: result });
}

// Member views their own submitted feedback + any admin replies
async function getMyFeedback(req, res) {
  const feedback = await feedbackService.getMemberFeedback(
    req.user.organizationId,
    req.user.userId
  );
  res.status(200).json({ success: true, data: feedback });
}

async function getMonitoring(req, res) {
  const monitoring = await feedbackService.getMonitoring(req.user.organizationId);
  res.status(200).json({ success: true, data: monitoring });
}

async function getDashboardAnalytics(req, res) {
  const analytics = await analyticsService.getDashboardAnalytics(req.user.organizationId);
  res.status(200).json({ success: true, data: analytics });
}

module.exports = {
  saveFeedback,
  listFeedback,
  replyToFeedback,
  getMyFeedback,
  getMonitoring,
  getDashboardAnalytics,
};
