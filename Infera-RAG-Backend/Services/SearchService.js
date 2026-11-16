
const { generateEmbedding } = require("./EmbeddingService");
const { searchSimilarChunks } = require("../Repositories/SearchRepository");
const { buildContext } = require("./ContextBuilder");
const { generateAnswer } = require("./LLMService");
const { validateCitations } = require("./CitationValidator");

// Search documents and generate an answer with validated citations.
const searchDocuments = async ({
    query,
    organizationId,
    limit = 5,
    minSimilarity = 0.50,
}) => {
    try {
        // Validate the user's question and organization.
        if (!query || typeof query !== "string" || !query.trim()) {
            throw new Error("Search query cannot be empty");
        }

        if (!organizationId) {
            throw new Error("Organization ID is required");
        }

        // Generate an embedding for the user's question.
        const queryEmbedding = await generateEmbedding(
            query.trim(),
            "RETRIEVAL_QUERY"
        );

        // Retrieve relevant document chunks.
        const results = await searchSimilarChunks({
            organizationId,
            queryEmbedding,
            limit,
            minSimilarity,
        });

        // Return a fallback when no relevant chunks are found.
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

        // Build document context and source references.
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
