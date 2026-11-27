const conversationService = require("../Services/conversation.service");
const {
  createConversationSchema,
  conversationIdParamSchema,
} = require("../validators/conversation.validator");
const { parseOrThrow } = require("../utils/validate");

async function createConversation(req, res) {
  const body = parseOrThrow(createConversationSchema, req.body);
  const conversation = await conversationService.createConversation({
    organizationId: req.user.organizationId,
    userId: req.user.userId,
    ...body,
  });
  res.status(201).json({ success: true, data: conversation });
}

async function listConversations(req, res) {
  const conversations = await conversationService.listConversations({
    organizationId: req.user.organizationId,
    userId: req.user.userId,
  });
  res.status(200).json({ success: true, data: conversations });
}

async function getConversationMessages(req, res) {
  const { id } = parseOrThrow(conversationIdParamSchema, req.params);
  const messages = await conversationService.getConversationMessages({
    conversationId: id,
    organizationId: req.user.organizationId,
    userId: req.user.userId,
  });
  res.status(200).json({ success: true, data: messages });
}

async function deleteConversation(req, res) {
  const { id } = parseOrThrow(conversationIdParamSchema, req.params);
  await conversationService.deleteConversation({
    conversationId: id,
    organizationId: req.user.organizationId,
    userId: req.user.userId,
  });
  res.status(204).send();
}

module.exports = {
  createConversation,
  listConversations,
  getConversationMessages,
  deleteConversation,
};
