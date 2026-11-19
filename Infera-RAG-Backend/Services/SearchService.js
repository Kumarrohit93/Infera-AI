const { generateEmbedding } = require("./EmbeddingService");
const {
    searchSimilarChunks,
    countAuthorizedDocuments,
} = require("../Repositories/SearchRepository");
const { buildContext } = require("./ContextBuilder");
const { generateAnswer, generateAnswerStream } = require("./LLMService");
const { validateCitations } = require("./CitationValidator");

const EMPTY_CITATION_VALIDATION = {
    isValid: true,
    usedCitations: [],
    invalidCitations: [],
};

async function prepareSearch({
    query,
    organizationId,
    userId,
    role,
    limit = 5,
    minSimilarity = 0.50,
}) {
    if (!query || typeof query !== "string" || !query.trim()) {
        throw new Error("Search query cannot be empty");
    }

    if (!organizationId) {
        throw new Error("Organization ID is required");
    }

    const normalizedQuery = query.trim();
    const effectiveRole = role || (userId ? "member" : "admin");
    const authorizedCount = await countAuthorizedDocuments({
        organizationId,
        userId,
        role: effectiveRole,
    });

    if (authorizedCount === 0) {
        return {
            query: normalizedQuery,
            answer: effectiveRole === "admin"
                ? "No documents are currently indexed and ready in this organization."
                : "You do not have access to any documents in this organization. Please contact your administrator.",
            totalResults: 0,
            sources: [],
            citationValidation: EMPTY_CITATION_VALIDATION,
        };
    }

    const queryEmbedding = await generateEmbedding(
        normalizedQuery,
        "RETRIEVAL_QUERY"
    );
    const results = await searchSimilarChunks({
        organizationId,
        userId,
        role: effectiveRole,
        queryEmbedding,
        query: normalizedQuery,
        limit,
        minSimilarity,
    });

    if (results.length === 0) {
        return {
            query: normalizedQuery,
            answer: "I could not find this information in the provided documents.",
            totalResults: 0,
            sources: [],
            citationValidation: EMPTY_CITATION_VALIDATION,
        };
    }

    const { context, sources } = buildContext(results);
    return {
        query: normalizedQuery,
        context,
        totalResults: results.length,
        sources,
    };
}

function validateAnswer(generatedAnswer, sources) {
    const citationValidation = validateCitations(generatedAnswer, sources);
    return {
        answer: citationValidation.isValid
            ? generatedAnswer
            : "I could not provide a reliably cited answer from the retrieved documents.",
        citationValidation,
    };
}

async function searchDocuments(options) {
    try {
        const prepared = await prepareSearch(options);
        if (prepared.answer) return prepared;

        const generatedAnswer = await generateAnswer({
            question: prepared.query,
            context: prepared.context,
        });
        const { answer, citationValidation } = validateAnswer(
            generatedAnswer,
            prepared.sources
        );

        return {
            query: prepared.query,
            answer,
            totalResults: prepared.totalResults,
            sources: prepared.sources,
            citationValidation,
        };
    } catch (error) {
        throw new Error(`Document Search Error: ${error.message}`);
    }
}

async function searchDocumentsStream(options, { onSources, onToken } = {}) {
    try {
        const prepared = await prepareSearch(options);
        if (onSources) onSources(prepared.sources || []);
        if (prepared.answer) return prepared;

        let generatedAnswer = "";
        for await (const token of generateAnswerStream({
            question: prepared.query,
            context: prepared.context,
        })) {
            generatedAnswer += token;
            if (onToken) onToken(token);
        }

        const { answer, citationValidation } = validateAnswer(
            generatedAnswer,
            prepared.sources
        );
        return {
            query: prepared.query,
            answer,
            totalResults: prepared.totalResults,
            sources: prepared.sources,
            citationValidation,
        };
    } catch (error) {
        throw new Error(`Document Search Error: ${error.message}`);
    }
}

module.exports = {
    searchDocuments,
    searchDocumentsStream,
};
