-- Employees and Departments (run after schema.sql)
-- Safe to run more than once.

-- 1) users: phone number
ALTER TABLE users
  ADD COLUMN IF NOT EXISTS phone VARCHAR(20);

-- 2) departments: fixed list per organization, Admin can add more
CREATE TABLE IF NOT EXISTS departments (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name            VARCHAR(100) NOT NULL,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (id, organization_id)
);

-- Same department name (any letter case) only once per organization
CREATE UNIQUE INDEX IF NOT EXISTS departments_org_lower_name_uq
  ON departments (organization_id, lower(name));

-- 3) organization_members: employee id and department
ALTER TABLE organization_members
  ADD COLUMN IF NOT EXISTS employee_id    VARCHAR(50),
  ADD COLUMN IF NOT EXISTS department_id  UUID;

-- Employee id is unique inside one organization
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'om_employee_id_unique'
  ) THEN
    ALTER TABLE organization_members
      ADD CONSTRAINT om_employee_id_unique UNIQUE (organization_id, employee_id);
  END IF;
END $$;

-- Department must belong to the same organization as the member
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'om_department_fk'
  ) THEN
    ALTER TABLE organization_members
      ADD CONSTRAINT om_department_fk
      FOREIGN KEY (department_id, organization_id)
      REFERENCES departments (id, organization_id);
  END IF;
END $$;