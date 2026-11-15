
const {
    generateEmbedding,
} = require("./EmbeddingService");

const {
    searchSimilarChunks,
} = require("../Repositories/SearchRepository");

// Search relevant document chunks for a user's question.
const searchDocuments = async ({
    query,
    organizationId,
    limit = 5,
    minSimilarity = 0.50,
}) => {
    try {
        // Validate the user's question.
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

        // Search PostgreSQL for similar document chunks.
        const results = await searchSimilarChunks({
            organizationId,
            queryEmbedding,
            limit,
            minSimilarity,
        });

        return {
            query,
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
