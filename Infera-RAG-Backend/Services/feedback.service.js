const pool = require("../Config/db");
const AppError = require("../utils/AppError");

// Member submits feedback (thumbs up/down + optional comment) on an AI message
async function saveFeedback({ messageId, organizationId, userId, helpful, comment }) {
  const result = await pool.query(
    `INSERT INTO message_feedback (message_id, organization_id, user_id, helpful, comment)
     SELECT m.id, m.organization_id, $3, $4, $5
       FROM messages m
       JOIN conversations c
         ON c.id = m.conversation_id AND c.organization_id = m.organization_id
      WHERE m.id = $1 AND m.organization_id = $2
        AND m.role = 'assistant' AND c.user_id = $3
     ON CONFLICT (message_id, user_id)
     DO UPDATE SET helpful = EXCLUDED.helpful,
                   comment = EXCLUDED.comment,
                   updated_at = NOW()
     RETURNING id, message_id, helpful, comment, updated_at`,
    [messageId, organizationId, userId, helpful, comment || null]
  );
  if (result.rowCount === 0) {
    throw new AppError(404, "NOT_FOUND", "Assistant message not found.");
  }
  return result.rows[0];
}

// Admin lists all feedback for the organization (with admin_reply included)
async function listOrganizationFeedback(organizationId) {
  const { rows } = await pool.query(
    `SELECT f.id,
            u.name AS "user",
            question.content AS question,
            answer.content AS "aiAnswer",
            CASE WHEN f.helpful THEN 'Helpful' ELSE 'Not Helpful' END AS rating,
            COALESCE(source.document_name, 'No citation') AS "sourceDoc",
            f.comment,
            f.admin_reply AS "adminReply",
            f.replied_at AS "repliedAt",
            f.created_at AS date
       FROM message_feedback f
       JOIN messages answer
         ON answer.id = f.message_id AND answer.organization_id = f.organization_id
       JOIN users u ON u.id = f.user_id
       LEFT JOIN LATERAL (
         SELECT m.content
           FROM messages m
          WHERE m.conversation_id = answer.conversation_id
            AND m.role = 'user' AND m.created_at <= answer.created_at
          ORDER BY m.created_at DESC LIMIT 1
       ) question ON TRUE
       LEFT JOIN LATERAL (
         SELECT ms.document_name
           FROM message_sources ms
          WHERE ms.message_id = answer.id
          ORDER BY ms.citation_number LIMIT 1
       ) source ON TRUE
      WHERE f.organization_id = $1
      ORDER BY f.created_at DESC`,
    [organizationId]
  );
  return rows;
}

// Admin replies to a specific feedback item
async function replyToFeedback({ feedbackId, organizationId, replyText }) {
  const result = await pool.query(
    `UPDATE message_feedback
        SET admin_reply = $3,
            replied_at = NOW(),
            updated_at = NOW()
      WHERE id = $1 AND organization_id = $2
      RETURNING id, admin_reply AS "adminReply", replied_at AS "repliedAt"`,
    [feedbackId, organizationId, replyText]
  );
  if (result.rowCount === 0) {
    throw new AppError(404, "NOT_FOUND", "Feedback not found.");
  }
  return result.rows[0];
}

// Member views their own submitted feedback + any admin replies
async function getMemberFeedback(organizationId, userId) {
  const { rows } = await pool.query(
    `SELECT f.id,
            question.content AS question,
            answer.content AS "aiAnswer",
            CASE WHEN f.helpful THEN 'Helpful' ELSE 'Not Helpful' END AS rating,
            f.comment,
            f.admin_reply AS "adminReply",
            f.replied_at AS "repliedAt",
            COALESCE(source.document_name, 'No citation') AS "sourceDoc",
            f.created_at AS date
       FROM message_feedback f
       JOIN messages answer
         ON answer.id = f.message_id AND answer.organization_id = f.organization_id
       LEFT JOIN LATERAL (
         SELECT m.content
           FROM messages m
          WHERE m.conversation_id = answer.conversation_id
            AND m.role = 'user' AND m.created_at <= answer.created_at
          ORDER BY m.created_at DESC LIMIT 1
       ) question ON TRUE
       LEFT JOIN LATERAL (
         SELECT ms.document_name
           FROM message_sources ms
          WHERE ms.message_id = answer.id
          ORDER BY ms.citation_number LIMIT 1
       ) source ON TRUE
      WHERE f.organization_id = $1 AND f.user_id = $2
      ORDER BY f.created_at DESC`,
    [organizationId, userId]
  );
  return rows;
}

async function getMonitoring(organizationId) {
  const { rows } = await pool.query(
    `SELECT
       (SELECT COUNT(*)::int FROM documents WHERE organization_id = $1 AND status = 'failed') AS "failedDocuments",
       (SELECT COUNT(*)::int FROM documents WHERE organization_id = $1 AND status IN ('queued', 'processing')) AS "processingDocuments",
       (SELECT COUNT(*)::int FROM message_feedback WHERE organization_id = $1 AND helpful = FALSE) AS "unhelpfulAnswers",
       (SELECT COUNT(*)::int FROM folders WHERE organization_id = $1) AS folders,
       (SELECT COUNT(*)::int FROM organization_members WHERE organization_id = $1 AND status = 'active') AS members`,
    [organizationId]
  );
  return rows[0];
}

module.exports = { saveFeedback, listOrganizationFeedback, replyToFeedback, getMemberFeedback, getMonitoring };
