-- Migration Script: Upgrades existing Infera AI database schema to v2
-- Run this if your database already has the 6 existing tables populated.

BEGIN;

-- 1. Ensure vector extension is installed
CREATE EXTENSION IF NOT EXISTS vector;

-- 2. Update invitations: Ensure semicolon and indexes are present
CREATE INDEX IF NOT EXISTS idx_invitations_email ON invitations(email);

-- 3. Upgrade chats: add composite unique constraint
ALTER TABLE chats 
    DROP CONSTRAINT IF EXISTS uq_chats_id_org,
    ADD CONSTRAINT uq_chats_id_org UNIQUE (id, organization_id);

-- 4. Upgrade messages: add organization_id, backfill, and enforce constraints
ALTER TABLE messages 
    ADD COLUMN IF NOT EXISTS organization_id UUID;

-- Backfill organization_id from parent chats table
UPDATE messages m
SET organization_id = c.organization_id
FROM chats c
WHERE m.chat_id = c.id
  AND m.organization_id IS NULL;

-- Enforce NOT NULL after backfill
ALTER TABLE messages 
    ALTER COLUMN organization_id SET NOT NULL;

-- Add composite unique constraints on messages
ALTER TABLE messages 
    DROP CONSTRAINT IF EXISTS uq_messages_id_org,
    ADD CONSTRAINT uq_messages_id_org UNIQUE (id, organization_id);

ALTER TABLE messages 
    DROP CONSTRAINT IF EXISTS uq_messages_id_org_role,
    ADD CONSTRAINT uq_messages_id_org_role UNIQUE (id, organization_id, role);

-- Enforce composite foreign key on messages
ALTER TABLE messages 
    DROP CONSTRAINT IF EXISTS fk_messages_chat_org,
    ADD CONSTRAINT fk_messages_chat_org 
        FOREIGN KEY (chat_id, organization_id) 
        REFERENCES chats(id, organization_id) 
        ON DELETE CASCADE;

CREATE INDEX IF NOT EXISTS idx_messages_org_created 
    ON messages(organization_id, created_at);

COMMIT;
