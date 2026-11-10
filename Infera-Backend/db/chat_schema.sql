-- 1. Chats table: Bound to organization and verified active member
CREATE TABLE IF NOT EXISTS chats (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  user_id         UUID NOT NULL,
  title           VARCHAR(200),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Composite target for messages foreign key
  UNIQUE (id, organization_id),

  -- Ensures the creator belongs to the same organization
  CONSTRAINT fk_chats_member_org
      FOREIGN KEY (organization_id, user_id)
      REFERENCES organization_members(organization_id, user_id)
      ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_chats_org_user ON chats(organization_id, user_id);
CREATE INDEX IF NOT EXISTS idx_chats_user_updated ON chats(user_id, updated_at);

-- 2. Messages table: Directly bound to tenant and chat
CREATE TABLE IF NOT EXISTS messages (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  chat_id         UUID NOT NULL,
  role            VARCHAR(10) NOT NULL CHECK (role IN ('user', 'assistant')),
  content         TEXT NOT NULL,
  status          VARCHAR(10) NOT NULL DEFAULT 'complete' CHECK (status IN ('complete', 'no_answer', 'error')),
  model           VARCHAR(60),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Composite targets for message_sources foreign keys
  UNIQUE (id, organization_id),
  UNIQUE (id, organization_id, role),

  -- Guarantees message belongs to the same organization as the chat
  CONSTRAINT fk_messages_chat_org
      FOREIGN KEY (chat_id, organization_id)
      REFERENCES chats(id, organization_id)
      ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_messages_chat_created ON messages(chat_id, created_at);
CREATE INDEX IF NOT EXISTS idx_messages_org_created ON messages(organization_id, created_at);
