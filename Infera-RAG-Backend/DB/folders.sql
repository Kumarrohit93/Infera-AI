-- Folder hierarchy: parent_folder_id NULL ho toh root folder.
-- organization_id har folder ko tenant ke saath bind karta hai.
CREATE TABLE IF NOT EXISTS folders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    parent_folder_id UUID,
    name VARCHAR(150) NOT NULL,
    description TEXT,
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    UNIQUE (id, organization_id),

    -- Parent folder same organization ka hi hona chahiye.
    CONSTRAINT fk_folders_parent_same_org
        FOREIGN KEY (parent_folder_id, organization_id)
        REFERENCES folders(id, organization_id)
        ON DELETE CASCADE
);

-- Root folder names unique within an organization.
CREATE UNIQUE INDEX IF NOT EXISTS uq_folders_root_name
    ON folders(organization_id, LOWER(name))
    WHERE parent_folder_id IS NULL;

-- Child folder names unique under the same parent.
CREATE UNIQUE INDEX IF NOT EXISTS uq_folders_child_name
    ON folders(organization_id, parent_folder_id, LOWER(name))
    WHERE parent_folder_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_folders_org_parent
    ON folders(organization_id, parent_folder_id);
