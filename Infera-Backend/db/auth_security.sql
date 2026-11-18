CREATE TABLE IF NOT EXISTS refresh_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  token_hash CHAR(64) NOT NULL UNIQUE,
  organization_id UUID NOT NULL,
  user_id UUID NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  revoked_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT fk_refresh_session_member
    FOREIGN KEY (organization_id, user_id)
    REFERENCES organization_members(organization_id, user_id)
    ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_refresh_sessions_user
  ON refresh_sessions(organization_id, user_id);

CREATE TABLE IF NOT EXISTS password_reset_tokens (
  token_hash CHAR(64) PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  expires_at TIMESTAMPTZ NOT NULL,
  used_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_password_reset_tokens_user
  ON password_reset_tokens(user_id);
