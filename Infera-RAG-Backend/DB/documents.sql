-- Uploaded file ka record. Actual PDF/DOCX bytes storage mein rahenge
-- (local disk / S3 / Supabase Storage); yahan sirf metadata + storage key.
CREATE TABLE IF NOT EXISTS documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    folder_id UUID,
    original_filename VARCHAR(255) NOT NULL,
    storage_key TEXT NOT NULL,
    mime_type VARCHAR(150) NOT NULL,
    file_size_bytes BIGINT NOT NULL CHECK (file_size_bytes >= 0),
    checksum_sha256 CHAR(64),
    status VARCHAR(12) NOT NULL DEFAULT 'pending'
        CHECK (status IN ('pending', 'processing', 'ready', 'failed', 'archived')),
    processing_error TEXT,
    uploaded_by UUID,
    uploaded_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    UNIQUE (id, organization_id),

    -- PG16 syntax: Folder deletion sets folder_id to NULL; document stays in organization
    CONSTRAINT fk_documents_folder_same_org
        FOREIGN KEY (folder_id, organization_id)
        REFERENCES folders(id, organization_id)
        ON DELETE SET NULL (folder_id),

    -- PG16 syntax: Member removal sets uploaded_by to NULL; document stays in organization
    CONSTRAINT fk_documents_uploader_same_org
        FOREIGN KEY (organization_id, uploaded_by)
        REFERENCES organization_members(organization_id, user_id)
        ON DELETE SET NULL (uploaded_by)
);

CREATE INDEX IF NOT EXISTS idx_documents_org_status
    ON documents(organization_id, status);

CREATE INDEX IF NOT EXISTS idx_documents_folder
    ON documents(folder_id);

CREATE INDEX IF NOT EXISTS idx_documents_org_uploaded
    ON documents(organization_id, uploaded_at DESC);

CREATE INDEX IF NOT EXISTS idx_documents_checksum
    ON documents(organization_id, checksum_sha256)
    WHERE checksum_sha256 IS NOT NULL;
