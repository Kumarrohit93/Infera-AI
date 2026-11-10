-- Folder-level access for organization members.
-- permission values:
-- view = read documents, upload = view + upload,
-- edit = manage folder/document metadata, manage = manage access too.
CREATE TABLE IF NOT EXISTS folder_permissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL,
    folder_id UUID NOT NULL,
    user_id UUID NOT NULL,
    permission VARCHAR(10) NOT NULL
        CHECK (permission IN ('view', 'upload', 'edit', 'manage')),
    granted_by UUID REFERENCES users(id) ON DELETE SET NULL,
    expires_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    UNIQUE (folder_id, user_id),

    -- Folder aur member dono same organization ke hone chahiye.
    CONSTRAINT fk_folder_permissions_folder_org
        FOREIGN KEY (folder_id, organization_id)
        REFERENCES folders(id, organization_id)
        ON DELETE CASCADE,

    CONSTRAINT fk_folder_permissions_member_org
        FOREIGN KEY (organization_id, user_id)
        REFERENCES organization_members(organization_id, user_id)
        ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_folder_permissions_user
    ON folder_permissions(organization_id, user_id);

CREATE INDEX IF NOT EXISTS idx_folder_permissions_folder
    ON folder_permissions(folder_id);
