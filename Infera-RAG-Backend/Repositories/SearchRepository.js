const pool = require("../Config/db");
const EMBEDDING_DIMENSION = Number(process.env.EMBEDDING_DIMENSION || 1536);

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
 * Searches authorized chunks with reciprocal-rank fusion across vector and full-text results.
 */
const searchSimilarChunks = async ({
    organizationId,
    userId,
    role = "member",
    queryEmbedding,
    query = "",
    limit = 5,
    minSimilarity = 0.50,
}) => {
    try {
        if (!organizationId) {
            throw new Error("Organization ID is required");
        }
        if (
            !Array.isArray(queryEmbedding) ||
            queryEmbedding.length !== EMBEDDING_DIMENSION
        ) {
            throw new Error(`Query embedding must contain ${EMBEDDING_DIMENSION} dimensions`);
        }
        if (!queryEmbedding.every(Number.isFinite)) {
            throw new Error("Query embedding contains invalid values");
        }
        if (!Number.isInteger(limit) || limit < 1 || limit > 20) {
            throw new Error("Limit must be between 1 and 20");
        }
        if (
            typeof minSimilarity !== "number" ||
            !Number.isFinite(minSimilarity) ||
            minSimilarity < -1 ||
            minSimilarity > 1
        ) {
            throw new Error("Minimum similarity must be between -1 and 1");
        }

        const embeddingVector = JSON.stringify(queryEmbedding);
        const effectiveRole = role || (userId ? "member" : "admin");
        const candidateLimit = Math.max(limit * 4, 20);
        const result = await pool.query(
            `WITH vector_candidates AS (
                SELECT
                    dc.id AS chunk_id,
                    dc.document_id,
                    dc.chunk_index,
                    dc.chunk_text,
                    dc.page_number,
                    dc.heading,
                    dc.token_count,
                    d.original_filename,
                    1 - (dc.embedding <=> $1::vector) AS similarity,
                    ROW_NUMBER() OVER (
                        ORDER BY dc.embedding <=> $1::vector
                    ) AS vector_rank
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
                LIMIT $3
            ),
            keyword_candidates AS (
                SELECT
                    dc.id AS chunk_id,
                    dc.document_id,
                    dc.chunk_index,
                    dc.chunk_text,
                    dc.page_number,
                    dc.heading,
                    dc.token_count,
                    d.original_filename,
                    CASE
                        WHEN dc.embedding IS NULL THEN 0::double precision
                        ELSE 1 - (dc.embedding <=> $1::vector)
                    END AS similarity,
                    ROW_NUMBER() OVER (
                        ORDER BY ts_rank_cd(dc.search_text, websearch_to_tsquery('simple', $7)) DESC
                    ) AS keyword_rank
                FROM document_chunks dc
                INNER JOIN documents d
                    ON d.id = dc.document_id
                    AND d.organization_id = dc.organization_id
                WHERE dc.organization_id = $2
                    AND d.status = 'ready'
                    AND $7 <> ''
                    AND dc.search_text @@ websearch_to_tsquery('simple', $7)
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
                ORDER BY ts_rank_cd(dc.search_text, websearch_to_tsquery('simple', $7)) DESC
                LIMIT $3
            ),
            ranked_candidates AS (
                SELECT
                    chunk_id, document_id, chunk_index, chunk_text, page_number,
                    heading, token_count, original_filename, similarity,
                    vector_rank, NULL::bigint AS keyword_rank,
                    1.0 / (60 + vector_rank) AS rank_score
                FROM vector_candidates
                UNION ALL
                SELECT
                    chunk_id, document_id, chunk_index, chunk_text, page_number,
                    heading, token_count, original_filename, similarity,
                    NULL::bigint AS vector_rank, keyword_rank,
                    1.0 / (60 + keyword_rank) AS rank_score
                FROM keyword_candidates
            )
            SELECT
                chunk_id,
                document_id,
                chunk_index,
                chunk_text,
                page_number,
                heading,
                token_count,
                original_filename,
                MAX(similarity) AS similarity,
                SUM(rank_score) AS fused_rank
            FROM ranked_candidates
            GROUP BY chunk_id, document_id, chunk_index, chunk_text, page_number,
                     heading, token_count, original_filename
            ORDER BY fused_rank DESC, similarity DESC
            LIMIT $8`,
            [
                embeddingVector,
                organizationId,
                candidateLimit,
                minSimilarity,
                effectiveRole,
                userId || null,
                typeof query === "string" ? query.trim() : "",
                limit,
            ]
        );

        return result.rows;
    } catch (error) {
        throw new Error(`Hybrid Search Error: ${error.message}`);
    }
};

module.exports = {
    searchSimilarChunks,
    countAuthorizedDocuments,
};
