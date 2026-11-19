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
    status VARCHAR(12) NOT NULL DEFAULT 'pending',
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
        ON DELETE SET NULL (uploaded_by),

    CONSTRAINT documents_status_check
        CHECK (status IN ('pending', 'queued', 'processing', 'ready', 'failed', 'archived'))
);

DO $$
DECLARE
    status_constraint RECORD;
BEGIN
    FOR status_constraint IN
        SELECT conname, pg_get_constraintdef(oid) AS definition
        FROM pg_constraint
        WHERE conrelid = 'documents'::regclass
          AND contype = 'c'
          AND pg_get_constraintdef(oid) ILIKE '%status%'
    LOOP
        IF status_constraint.definition NOT ILIKE '%queued%' THEN
            EXECUTE format(
                'ALTER TABLE documents DROP CONSTRAINT %I',
                status_constraint.conname
            );
        END IF;
    END LOOP;

    IF NOT EXISTS (
        SELECT 1
        FROM pg_constraint
        WHERE conrelid = 'documents'::regclass
          AND conname = 'documents_status_check'
          AND pg_get_constraintdef(oid) ILIKE '%queued%'
    ) THEN
        ALTER TABLE documents
            ADD CONSTRAINT documents_status_check
            CHECK (status IN ('pending', 'queued', 'processing', 'ready', 'failed', 'archived'));
    END IF;
END
$$;

CREATE INDEX IF NOT EXISTS idx_documents_org_status
    ON documents(organization_id, status);

CREATE INDEX IF NOT EXISTS idx_documents_folder
    ON documents(folder_id);

CREATE INDEX IF NOT EXISTS idx_documents_org_uploaded
    ON documents(organization_id, uploaded_at DESC);

CREATE INDEX IF NOT EXISTS idx_documents_checksum
    ON documents(organization_id, checksum_sha256)
    WHERE checksum_sha256 IS NOT NULL;
