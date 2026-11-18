-- Add the schema required by the admin employee directory to existing databases.
BEGIN;

CREATE TABLE IF NOT EXISTS departments (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name            VARCHAR(100) NOT NULL,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS departments_org_name_lower_unique
  ON departments (organization_id, lower(name));

INSERT INTO departments (organization_id, name)
SELECT organizations.id, defaults.name
FROM organizations
CROSS JOIN (
  VALUES
    ('HR'),
    ('IT'),
    ('Finance'),
    ('Engineering'),
    ('Operations'),
    ('Sales'),
    ('Marketing')
) AS defaults(name)
ON CONFLICT (organization_id, lower(name)) DO NOTHING;

ALTER TABLE users
  ADD COLUMN IF NOT EXISTS phone VARCHAR(20);

ALTER TABLE organization_members
  ADD COLUMN IF NOT EXISTS employee_id VARCHAR(50),
  ADD COLUMN IF NOT EXISTS department_id UUID;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'organization_members_department_id_fkey'
      AND conrelid = 'organization_members'::regclass
  ) THEN
    ALTER TABLE organization_members
      ADD CONSTRAINT organization_members_department_id_fkey
      FOREIGN KEY (department_id)
      REFERENCES departments(id)
      ON DELETE SET NULL;
  END IF;
END;
$$;

CREATE UNIQUE INDEX IF NOT EXISTS om_employee_id_unique
  ON organization_members (organization_id, employee_id)
  WHERE employee_id IS NOT NULL AND employee_id <> '';

COMMIT;
