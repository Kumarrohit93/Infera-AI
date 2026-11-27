const { askQuestionSchema } = require("../validators/rag.validator");
const { parseOrThrow } = require("../utils/validate");
const { searchDocuments, searchDocumentsStream } = require("../Services/SearchService");
const conversationService = require("../Services/conversation.service");

function sendEvent(res, eventName, data) {
    if (res.destroyed || res.writableEnded) return false;
    return res.write(`event: ${eventName}\ndata: ${JSON.stringify(data)}\n\n`);
}

async function getActiveConversation({ question, conversationId, organizationId, userId }) {
    if (conversationId) {
        await conversationService.getConversationMessages({
            conversationId,
            organizationId,
            userId,
        });
        return conversationId;
    }

    const newConv = await conversationService.createConversation({
        organizationId,
        userId,
        title: question.trim().slice(0, 50) || "New Conversation",
    });
    return newConv.id;
}

async function askQuestion(req, res) {
    const { question, conversationId } = parseOrThrow(askQuestionSchema, req.body);
    const organizationId = req.user.organizationId;
    const userId = req.user.userId;
    const role = req.user.role;

    const activeConversationId = await getActiveConversation({
        question,
        conversationId,
        organizationId,
        userId,
    });
    const result = await searchDocuments({
        query: question,
        organizationId,
        userId,
        role,
    });

    const savedExchange = await conversationService.saveChatExchange({
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
            messageId: savedExchange.assistantMessageId,
            userMessageId: savedExchange.userMessageId,
            query: result.query,
            answer: result.answer,
            totalResults: result.totalResults,
            sources: result.sources,
            citationValidation: result.citationValidation,
        },
    });
}

async function askQuestionStream(req, res) {
    const { question, conversationId } = parseOrThrow(askQuestionSchema, req.body);
    const { organizationId, userId, role } = req.user;
    const activeConversationId = await getActiveConversation({
        question,
        conversationId,
        organizationId,
        userId,
    });

    res.status(200);
    res.set({
        "Content-Type": "text/event-stream; charset=utf-8",
        "Cache-Control": "no-cache, no-transform",
        Connection: "keep-alive",
        "X-Accel-Buffering": "no",
    });
    res.flushHeaders();
    sendEvent(res, "start", { conversationId: activeConversationId });

    let streamedAnswer = "";
    try {
        const result = await searchDocumentsStream(
            { query: question, organizationId, userId, role },
            {
                onSources(sources) {
                    sendEvent(res, "sources", { sources });
                },
                onToken(token) {
                    streamedAnswer += token;
                    sendEvent(res, "token", { token });
                },
            }
        );

        if (!streamedAnswer && result.answer) {
            sendEvent(res, "token", { token: result.answer });
        }

        const savedExchange = await conversationService.saveChatExchange({
            conversationId: activeConversationId,
            organizationId,
            userId,
            userQuestion: question,
            aiAnswer: result.answer,
            sources: result.sources || [],
        });

        sendEvent(res, "done", {
            conversationId: activeConversationId,
            messageId: savedExchange.assistantMessageId,
            userMessageId: savedExchange.userMessageId,
            query: result.query,
            answer: result.answer,
            totalResults: result.totalResults,
            sources: result.sources || [],
            citationValidation: result.citationValidation,
        });
        if (!res.destroyed && !res.writableEnded) res.end();
    } catch (error) {
        console.error("[RAG] Streaming answer failed:", error.message);
        sendEvent(res, "error", {
            message: "The assistant could not complete this request. Please try again.",
        });
        if (!res.destroyed && !res.writableEnded) res.end();
    }
}

module.exports = { askQuestion, askQuestionStream };
