const fs = require("fs");
const path = require("path");
const pool = require("./db");

/**
 * Initializes required tables for Chat History Persistence and RAG Access Control.
 * Safe to run multiple times (idempotent IF NOT EXISTS queries).
 */
async function initDb() {
  try {
    // 1. Folders
    await pool.query(`
      CREATE TABLE IF NOT EXISTS folders (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
          parent_folder_id UUID,
          name VARCHAR(150) NOT NULL,
          description TEXT,
          created_by UUID REFERENCES users(id) ON DELETE SET NULL,
          created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
          updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
          UNIQUE (id, organization_id)
      );
    `);

    // 2. Folder Permissions
    await pool.query(`
      CREATE TABLE IF NOT EXISTS folder_permissions (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          organization_id UUID NOT NULL,
          folder_id UUID NOT NULL REFERENCES folders(id) ON DELETE CASCADE,
          user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
          permission VARCHAR(10) NOT NULL CHECK (permission IN ('view', 'upload', 'edit', 'manage')),
          granted_by UUID REFERENCES users(id) ON DELETE SET NULL,
          expires_at TIMESTAMPTZ,
          created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
          UNIQUE (folder_id, user_id)
      );
    `);

    // 3. Conversations
    await pool.query(`
      CREATE TABLE IF NOT EXISTS conversations (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
          user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
          title VARCHAR(200) NOT NULL DEFAULT 'New Conversation',
          created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
          updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
          UNIQUE (id, organization_id)
      );
      CREATE INDEX IF NOT EXISTS idx_conversations_user_updated
          ON conversations(organization_id, user_id, updated_at DESC);
    `);

    // 4. Messages
    await pool.query(`
      CREATE TABLE IF NOT EXISTS messages (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
          organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
          role VARCHAR(10) NOT NULL CHECK (role IN ('user', 'assistant')),
          content TEXT NOT NULL,
          created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
          UNIQUE (id, organization_id),
          UNIQUE (id, organization_id, role)
      );
      CREATE INDEX IF NOT EXISTS idx_messages_conversation_created
          ON messages(conversation_id, created_at ASC);
    `);

    // 5. Message Sources
    await pool.query(`
      CREATE TABLE IF NOT EXISTS message_sources (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
          message_id UUID NOT NULL,
          role VARCHAR(10) NOT NULL DEFAULT 'assistant' CHECK (role = 'assistant'),
          document_id UUID,
          chunk_id UUID,
          source_id INTEGER NOT NULL CHECK (source_id > 0),
          document_name VARCHAR(255) NOT NULL,
          heading VARCHAR(255),
          page_number INTEGER,
          similarity REAL,
          created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
          UNIQUE (message_id, source_id),
          CONSTRAINT fk_message_sources_message
              FOREIGN KEY (message_id, organization_id, role)
              REFERENCES messages(id, organization_id, role)
              ON DELETE CASCADE
      );
      CREATE INDEX IF NOT EXISTS idx_message_sources_message
          ON message_sources(message_id, source_id ASC);
    `);

    console.log("[Database] Chat history & permission tables verified.");
  } catch (err) {
    console.error("[Database] Failed to verify chat history tables:", err.message);
  }
}

module.exports = { initDb };
