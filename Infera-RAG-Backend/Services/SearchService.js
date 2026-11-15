const { generateEmbedding } = require("./EmbeddingService");
const { searchSimilarChunks } = require("../Repositories/SearchRepository");
const { buildContext } = require("./ContextBuilder");
const { generateAnswer } = require("./LLMService");

// Search documents and generate an answer using retrieved context.
const searchDocuments = async ({
    query,
    organizationId,
    limit = 5,
    minSimilarity = 0.50,
}) => {
    try {
        if (!query || typeof query !== "string" || !query.trim()) {
            throw new Error("Search query cannot be empty");
        }

        if (!organizationId) {
            throw new Error("Organization ID is required");
        }

        // Convert the user's question into an embedding.
        const queryEmbedding = await generateEmbedding(
            query.trim(),
            "RETRIEVAL_QUERY"
        );

        // Find relevant chunks from the same organization.
        const results = await searchSimilarChunks({
            organizationId,
            queryEmbedding,
            limit,
            minSimilarity,
        });

        // Return directly if no relevant chunks are found.
        if (results.length === 0) {
            return {
                query: query.trim(),
                answer: "I could not find this information in the provided documents.",
                totalResults: 0,
                results: [],
            };
        }

        // Build context from the retrieved document chunks.
        const context = buildContext(results);

        // Generate an answer using only the retrieved context.
        const answer = await generateAnswer({
            question: query.trim(),
            context,
        });

        return {
            query: query.trim(),
            answer,
            totalResults: results.length,
            results,
        };
    } catch (error) {
        throw new Error(`Document Search Error: ${error.message}`);
    }
};

module.exports = {
    searchDocuments,
};