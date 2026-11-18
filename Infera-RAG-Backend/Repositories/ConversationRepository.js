const pool = require("../Config/db");
const AppError = require("../utils/AppError");

/**
 * Creates a new conversation for the authenticated user and organization.
 */
async function createConversation({ organizationId, userId, title = "New Conversation" }) {
  const { rows } = await pool.query(
    `INSERT INTO conversations (organization_id, user_id, title)
     VALUES ($1, $2, $3)
     RETURNING id, title, created_at, updated_at`,
    [organizationId, userId, title.slice(0, 200)]
  );

  const row = rows[0];
  return {
    id: row.id,
    title: row.title,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

/**
 * Lists all conversations for the authenticated user in the current organization.
 * Includes latest message preview.
 */
async function listConversations({ organizationId, userId }) {
  const { rows } = await pool.query(
    `SELECT
        c.id,
        c.title,
        c.created_at,
        c.updated_at,
        (
            SELECT m.content
            FROM messages m
            WHERE m.conversation_id = c.id
            ORDER BY m.created_at DESC
            LIMIT 1
        ) AS latest_message,
        (
            SELECT COUNT(*)::int
            FROM messages m
            WHERE m.conversation_id = c.id
        ) AS message_count
     FROM conversations c
     WHERE c.organization_id = $1 AND c.user_id = $2
     ORDER BY c.updated_at DESC`,
    [organizationId, userId]
  );

  return rows.map((r) => ({
    id: r.id,
    title: r.title,
    createdAt: r.created_at,
    updatedAt: r.updated_at,
    latestMessage: r.latest_message ? r.latest_message.slice(0, 100) : null,
    messageCount: r.message_count || 0,
  }));
}

/**
 * Retrieves a single conversation verifying user and organization ownership.
 */
async function getConversationById({ conversationId, organizationId, userId }) {
  const { rows } = await pool.query(
    `SELECT id, title, created_at, updated_at
     FROM conversations
     WHERE id = $1 AND organization_id = $2 AND user_id = $3`,
    [conversationId, organizationId, userId]
  );

  if (rows.length === 0) {
    throw new AppError(404, "NOT_FOUND", "Conversation not found or access denied");
  }

  return rows[0];
}

/**
 * Retrieves all messages and their source citations for a conversation.
 */
async function getConversationMessages({ conversationId, organizationId, userId }) {
  // First ensure conversation exists and belongs to user
  await getConversationById({ conversationId, organizationId, userId });

  // Get all messages
  const messageRows = await pool.query(
    `SELECT id, role, content, created_at,
            (SELECT helpful FROM message_feedback
              WHERE message_id = messages.id AND user_id = $3) AS feedback
     FROM messages
     WHERE conversation_id = $1 AND organization_id = $2
     ORDER BY created_at ASC`,
    [conversationId, organizationId, userId]
  );

  // If no messages, return empty array
  if (messageRows.rows.length === 0) {
    return [];
  }

  // Get all citations for messages in this conversation
  const messageIds = messageRows.rows.map((m) => m.id);
  const sourceRows = await pool.query(
    `SELECT
        ms.id,
        ms.message_id,
        ms.source_id,
        ms.document_id,
        ms.chunk_id,
        ms.document_name,
        ms.heading,
        ms.page_number,
        ms.similarity
     FROM message_sources ms
     WHERE ms.message_id = ANY($1::uuid[])
     ORDER BY ms.source_id ASC`,
    [messageIds]
  );

  // Group sources by message_id
  const sourcesByMessage = {};
  for (const s of sourceRows.rows) {
    if (!sourcesByMessage[s.message_id]) {
      sourcesByMessage[s.message_id] = [];
    }
    sourcesByMessage[s.message_id].push({
      sourceId: s.source_id,
      documentId: s.document_id,
      documentName: s.document_name,
      chunkId: s.chunk_id,
      heading: s.heading || null,
      pageNumber: s.page_number ?? null,
      similarity: s.similarity !== null ? Number(Number(s.similarity).toFixed(2)) : null,
    });
  }

  return messageRows.rows.map((m) => ({
    id: m.id,
    role: m.role,
    content: m.content,
    createdAt: m.created_at,
    feedback: m.feedback === null || m.feedback === undefined
      ? null
      : m.feedback ? "Helpful" : "Not Helpful",
    sources: sourcesByMessage[m.id] || [],
  }));
}

/**
 * Deletes a conversation and cascades dependent messages and sources.
 */
async function deleteConversation({ conversationId, organizationId, userId }) {
  const result = await pool.query(
    `DELETE FROM conversations
     WHERE id = $1 AND organization_id = $2 AND user_id = $3`,
    [conversationId, organizationId, userId]
  );

  if (result.rowCount === 0) {
    throw new AppError(404, "NOT_FOUND", "Conversation not found or access denied");
  }

  return true;
}

/**
 * Persists a full chat exchange (User Question + Assistant Answer + Source Citations)
 * atomically inside a single database transaction.
 */
async function saveChatExchange({
  conversationId,
  organizationId,
  userId,
  userQuestion,
  aiAnswer,
  sources = [],
}) {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    // 1. Verify and lock the conversation
    const convCheck = await client.query(
      `SELECT id, title
       FROM conversations
       WHERE id = $1 AND organization_id = $2 AND user_id = $3
       FOR UPDATE`,
      [conversationId, organizationId, userId]
    );

    if (convCheck.rowCount === 0) {
      throw new AppError(404, "NOT_FOUND", "Conversation not found or access denied");
    }

    const currentTitle = convCheck.rows[0].title;

    // 2. Save User Message
    const userMsgRes = await client.query(
      `INSERT INTO messages (conversation_id, organization_id, role, content)
       VALUES ($1, $2, 'user', $3)
       RETURNING id, created_at`,
      [conversationId, organizationId, userQuestion]
    );
    const userMessageId = userMsgRes.rows[0].id;

    // 3. Save Assistant Message
    const aiMsgRes = await client.query(
      `INSERT INTO messages (conversation_id, organization_id, role, content)
       VALUES ($1, $2, 'assistant', $3)
       RETURNING id, created_at`,
      [conversationId, organizationId, aiAnswer]
    );
    const assistantMessageId = aiMsgRes.rows[0].id;

    // 4. Save Source Citations linked to the Assistant Message
    if (Array.isArray(sources) && sources.length > 0) {
      for (const s of sources) {
        await client.query(
          `INSERT INTO message_sources (
             organization_id,
             message_id,
             role,
             document_id,
             chunk_id,
             source_id,
             document_name,
             heading,
             page_number,
             similarity
           )
           VALUES ($1, $2, 'assistant', $3, $4, $5, $6, $7, $8, $9)
           ON CONFLICT (message_id, source_id) DO NOTHING`,
          [
            organizationId,
            assistantMessageId,
            s.documentId || null,
            s.chunkId || null,
            s.sourceId,
            s.documentName || "Document",
            s.heading || null,
            s.pageNumber ?? null,
            s.similarity !== undefined && s.similarity !== null ? Number(s.similarity) : null,
          ]
        );
      }
    }

    // 5. Update Conversation updated_at and Title if it was still default
    let newTitle = currentTitle;
    if (currentTitle === "New Conversation" && userQuestion) {
      newTitle = userQuestion.trim().slice(0, 60);
      if (userQuestion.length > 60) newTitle += "...";
    }

    await client.query(
      `UPDATE conversations
       SET title = $1, updated_at = NOW()
       WHERE id = $2`,
      [newTitle, conversationId]
    );

    await client.query("COMMIT");

    return {
      conversationId,
      title: newTitle,
      userMessageId,
      assistantMessageId,
    };
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
}

module.exports = {
  createConversation,
  listConversations,
  getConversationById,
  getConversationMessages,
  deleteConversation,
  saveChatExchange,
};
