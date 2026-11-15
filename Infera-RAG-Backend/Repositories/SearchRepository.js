
const pool = require("../Config/db");

// Search relevant document chunks using cosine similarity.
const searchSimilarChunks = async ({
    organizationId,
    queryEmbedding,
    limit = 5,
    minSimilarity = 0.50,
}) => {
    try {
        // Validate required search inputs.
        if (!organizationId) {
            throw new Error("Organization ID is required");
        }

        if (
            !Array.isArray(queryEmbedding) ||
            queryEmbedding.length !== 1536
        ) {
            throw new Error("Query embedding must contain 1536 dimensions");
        }

        if (!queryEmbedding.every(Number.isFinite)) {
            throw new Error("Query embedding contains invalid values");
        }

        if (!Number.isInteger(limit) || limit < 1 || limit > 20) {
            throw new Error("Limit must be between 1 and 20");
        }

        // Validate minimum similarity threshold.
        if (
            typeof minSimilarity !== "number" ||
            !Number.isFinite(minSimilarity) ||
            minSimilarity < -1 ||
            minSimilarity > 1
        ) {
            throw new Error("Minimum similarity must be between -1 and 1");
        }

        // Convert the embedding array into pgvector format.
        const embeddingVector = JSON.stringify(queryEmbedding);

        // Find relevant chunks from the specified organization.
        const result = await pool.query(
            `SELECT
                dc.id AS chunk_id,
                dc.document_id,
                dc.chunk_index,
                dc.chunk_text,
                dc.page_number,
                dc.heading,
                dc.token_count,
                d.original_filename,
                1 - (dc.embedding <=> $1::vector) AS similarity
            FROM document_chunks dc
            INNER JOIN documents d
                ON d.id = dc.document_id
                AND d.organization_id = dc.organization_id
            WHERE dc.organization_id = $2
                AND d.status = 'ready'
                AND dc.embedding IS NOT NULL
                AND 1 - (dc.embedding <=> $1::vector) >= $4
            ORDER BY dc.embedding <=> $1::vector
            LIMIT $3`,
            [
                embeddingVector,
                organizationId,
                limit,
                minSimilarity,
            ]
        );

        return result.rows;
    } catch (error) {
        throw new Error(`Vector Search Error: ${error.message}`);
    }
};

module.exports = {
    searchSimilarChunks,
};
