const { generateEmbedding } = require("./EmbeddingService");
const {
    searchSimilarChunks,
    countAuthorizedDocuments,
} = require("../Repositories/SearchRepository");
const { buildContext } = require("./ContextBuilder");
const { generateAnswer } = require("./LLMService");
const { validateCitations } = require("./CitationValidator");

/**
 * Search documents across multiple authorized documents and generate an answer with validated citations.
 */
const searchDocuments = async ({
    query,
    organizationId,
    userId,
    role,
    limit = 5,
    minSimilarity = 0.50,
}) => {
    try {
        // Validate user's question and organization.
        if (!query || typeof query !== "string" || !query.trim()) {
            throw new Error("Search query cannot be empty");
        }

        if (!organizationId) {
            throw new Error("Organization ID is required");
        }

        const effectiveRole = role || (userId ? "member" : "admin");

        // Check if the user has any authorized, ready documents in the organization.
        const authorizedCount = await countAuthorizedDocuments({
            organizationId,
            userId,
            role: effectiveRole,
        });

        if (authorizedCount === 0) {
            return {
                query: query.trim(),
                answer: effectiveRole === "admin"
                    ? "No documents are currently indexed and ready in this organization."
                    : "You do not have access to any documents in this organization. Please contact your administrator.",
                totalResults: 0,
                sources: [],
                citationValidation: {
                    isValid: true,
                    usedCitations: [],
                    invalidCitations: [],
                },
            };
        }

        // Generate an embedding for the user's question.
        const queryEmbedding = await generateEmbedding(
            query.trim(),
            "RETRIEVAL_QUERY"
        );

        // Retrieve relevant document chunks across authorized documents.
        const results = await searchSimilarChunks({
            organizationId,
            userId,
            role: effectiveRole,
            queryEmbedding,
            limit,
            minSimilarity,
        });

        // Return a fallback when no relevant chunks match the similarity threshold.
        if (results.length === 0) {
            return {
                query: query.trim(),
                answer: "I could not find this information in the provided documents.",
                totalResults: 0,
                sources: [],
                citationValidation: {
                    isValid: true,
                    usedCitations: [],
                    invalidCitations: [],
                },
            };
        }

        // Build combined multi-document context and source references.
        const { context, sources } = buildContext(results);

        // Generate an answer using the retrieved context.
        const generatedAnswer = await generateAnswer({
            question: query.trim(),
            context,
        });

        // Validate citation IDs against retrieved sources.
        const citationValidation = validateCitations(
            generatedAnswer,
            sources
        );

        // Reject answers containing invalid citation IDs.
        const answer = citationValidation.isValid
            ? generatedAnswer
            : "I could not provide a reliably cited answer from the retrieved documents.";

        return {
            query: query.trim(),
            answer,
            totalResults: results.length,
            sources,
            citationValidation,
        };
    } catch (error) {
        throw new Error(`Document Search Error: ${error.message}`);
    }
};

module.exports = {
    searchDocuments,
};
