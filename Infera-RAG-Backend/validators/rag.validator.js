const { z } = require("zod");

const askQuestionSchema = z.object({
  question: z.string().trim().min(1, "Question cannot be empty"),
  conversationId: z.string().uuid("Invalid conversation ID format").optional(),
});

module.exports = { askQuestionSchema };
