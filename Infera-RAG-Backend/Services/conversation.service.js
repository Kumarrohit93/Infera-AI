const conversationRepo = require("../Repositories/ConversationRepository");

async function createConversation({ organizationId, userId, title }) {
  return conversationRepo.createConversation({ organizationId, userId, title });
}

async function listConversations({ organizationId, userId }) {
  return conversationRepo.listConversations({ organizationId, userId });
}

async function getConversationMessages({ conversationId, organizationId, userId }) {
  return conversationRepo.getConversationMessages({ conversationId, organizationId, userId });
}

async function deleteConversation({ conversationId, organizationId, userId }) {
  return conversationRepo.deleteConversation({ conversationId, organizationId, userId });
}

async function saveChatExchange({
  conversationId,
  organizationId,
  userId,
  userQuestion,
  aiAnswer,
  sources,
}) {
  return conversationRepo.saveChatExchange({
    conversationId,
    organizationId,
    userId,
    userQuestion,
    aiAnswer,
    sources,
  });
}

module.exports = {
  createConversation,
  listConversations,
  getConversationMessages,
  deleteConversation,
  saveChatExchange,
};
