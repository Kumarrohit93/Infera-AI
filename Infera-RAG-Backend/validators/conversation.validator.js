const { z } = require("zod");

const createConversationSchema = z.object({
  title: z.string().trim().min(1).max(200).optional(),
});

const conversationIdParamSchema = z.object({
  id: z.string().uuid("Invalid conversation ID format"),
});

module.exports = {
  createConversationSchema,
  conversationIdParamSchema,
};
