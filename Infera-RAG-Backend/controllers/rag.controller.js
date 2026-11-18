const { askQuestionSchema } = require("../validators/rag.validator");
const { parseOrThrow } = require("../utils/validate");
const { searchDocuments } = require("../Services/SearchService");
const conversationService = require("../Services/conversation.service");

async function askQuestion(req, res) {
    const { question, conversationId } = parseOrThrow(askQuestionSchema, req.body);
    const organizationId = req.user.organizationId;
    const userId = req.user.userId;
    const role = req.user.role;

    // 1. Resolve or create conversation with ownership verification
    let activeConversationId = conversationId;
    if (activeConversationId) {
        // Verifies conversation belongs to this user and organization
        await conversationService.getConversationMessages({
            conversationId: activeConversationId,
            organizationId,
            userId,
        });
    } else {
        const title = question.trim().slice(0, 50) || "New Conversation";
        const newConv = await conversationService.createConversation({
            organizationId,
            userId,
            title,
        });
        activeConversationId = newConv.id;
    }

    // 2. Perform permission-aware multi-document RAG search
    const result = await searchDocuments({
        query: question,
        organizationId,
        userId,
        role,
    });

    // 3. Atomically persist User Message + Assistant Answer + Source Citations
    await conversationService.saveChatExchange({
        conversationId: activeConversationId,
        organizationId,
        userId,
        userQuestion: question,
        aiAnswer: result.answer,
        sources: result.sources || [],
    });

    res.status(200).json({
        success: true,
        data: {
            conversationId: activeConversationId,
            query: result.query,
            answer: result.answer,
            totalResults: result.totalResults,
            sources: result.sources,
            citationValidation: result.citationValidation,
        },
    });
}

module.exports = { askQuestion };
