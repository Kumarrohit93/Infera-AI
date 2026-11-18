const pool = require("../Config/db");

/**
 * Counts ready documents accessible to the given user in an organization.
 * Admin: all ready documents in the organization.
 * Member: only ready documents in folders where the member has active permissions.
 */
const countAuthorizedDocuments = async ({ organizationId, userId, role = "member" }) => {
    try {
        if (!organizationId) {
            throw new Error("Organization ID is required");
        }

        if (role === "admin" || !userId) {
            const result = await pool.query(
                `SELECT COUNT(*)::int AS count
                 FROM documents
                 WHERE organization_id = $1 AND status = 'ready'`,
                [organizationId]
            );
            return result.rows[0]?.count || 0;
        }

        const result = await pool.query(
            `SELECT COUNT(*)::int AS count
             FROM documents d
             WHERE d.organization_id = $1
               AND d.status = 'ready'
               AND d.folder_id IS NOT NULL
               AND EXISTS (
                   SELECT 1 FROM folder_permissions fp
                   WHERE fp.folder_id = d.folder_id
                     AND fp.user_id = $2
                     AND fp.organization_id = $1
                     AND (fp.expires_at IS NULL OR fp.expires_at > NOW())
               )`,
            [organizationId, userId]
        );
        return result.rows[0]?.count || 0;
    } catch (error) {
        throw new Error(`Document Count Error: ${error.message}`);
    }
};

/**
 * Search relevant document chunks across multiple authorized documents using cosine similarity.
 *
 * Security:
 * - Admin searches all ready documents within the organization.
 * - Members search only ready documents in folders with active folder_permissions.
 * - Unauthorized chunks are filtered out directly inside the PostgreSQL database query.
 */
const searchSimilarChunks = async ({
    organizationId,
    userId,
    role = "member",
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

        // Effective role: if userId is not provided (e.g. test scripts), default to admin
        const effectiveRole = role || (userId ? "member" : "admin");

        // Database query enforcing document-level / folder-level permissions
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
                AND (
                    $5 = 'admin'
                    OR (
                        d.folder_id IS NOT NULL
                        AND EXISTS (
                            SELECT 1 FROM folder_permissions fp
                            WHERE fp.folder_id = d.folder_id
                              AND fp.user_id = $6
                              AND fp.organization_id = $2
                              AND (fp.expires_at IS NULL OR fp.expires_at > NOW())
                        )
                    )
                )
            ORDER BY dc.embedding <=> $1::vector
            LIMIT $3`,
            [
                embeddingVector,
                organizationId,
                limit,
                minSimilarity,
                effectiveRole,
                userId || null,
            ]
        );

        return result.rows;
    } catch (error) {
        throw new Error(`Vector Search Error: ${error.message}`);
    }
};

module.exports = {
    searchSimilarChunks,
    countAuthorizedDocuments,
};
