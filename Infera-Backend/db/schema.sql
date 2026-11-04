-- 1) Organization: ek company / group
CREATE TABLE IF NOT EXISTS organizations (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),  -- apne aap unique id
  name       VARCHAR(150) NOT NULL,                       -- organization ka naam
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()           -- kab bani
);

-- 2) User: ek insaan ka account
CREATE TABLE IF NOT EXISTS users (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name          VARCHAR(120) NOT NULL,
  email         VARCHAR(255) NOT NULL UNIQUE,   -- ek email sirf ek account
  password_hash VARCHAR(100) NOT NULL,          -- bcrypt hash, asli password nahi
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3) Link: kaun user kis organization mein, kis role se
CREATE TABLE IF NOT EXISTS organization_members (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  user_id         UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  role            VARCHAR(10) NOT NULL CHECK (role IN ('admin', 'member')),
  status          VARCHAR(10) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'removed')),
  joined_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (organization_id, user_id)
);