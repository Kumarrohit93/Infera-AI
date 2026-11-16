-- Infera AI: Chat History Persistence Schema
-- Supports conversations, messages, and document source citations with strict tenant & user isolation.

-- 1. Conversations Table
CREATE TABLE IF NOT EXISTS conversations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(200) NOT NULL DEFAULT 'New Conversation',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    -- Composite unique constraint for foreign key targets
    UNIQUE (id, organization_id),
    UNIQUE (id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_conversations_user_updated
    ON conversations(organization_id, user_id, updated_at DESC);

-- 2. Messages Table
CREATE TABLE IF NOT EXISTS messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    role VARCHAR(10) NOT NULL CHECK (role IN ('user', 'assistant')),
    content TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    -- Composite target for message_sources foreign keys
    UNIQUE (id, organization_id),
    UNIQUE (id, organization_id, role)
);

CREATE INDEX IF NOT EXISTS idx_messages_conversation_created
    ON messages(conversation_id, created_at ASC);

-- 3. Message Sources (Citations & References) Table
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
    page_number INTEGER CHECK (page_number IS NULL OR page_number > 0),
    similarity REAL CHECK (similarity IS NULL OR (similarity >= 0.0 AND similarity <= 1.0)),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    -- Unique citation index per assistant message
    UNIQUE (message_id, source_id),

    -- Foreign key linking to the assistant message
    CONSTRAINT fk_message_sources_message
        FOREIGN KEY (message_id, organization_id, role)
        REFERENCES messages(id, organization_id, role)
        ON DELETE CASCADE,

    -- Soft reference to document (if document is deleted, preserve citation snapshot)
    CONSTRAINT fk_message_sources_document
        FOREIGN KEY (document_id, organization_id)
        REFERENCES documents(id, organization_id)
        ON DELETE SET NULL (document_id)
);

CREATE INDEX IF NOT EXISTS idx_message_sources_message
    ON message_sources(message_id, source_id ASC);
