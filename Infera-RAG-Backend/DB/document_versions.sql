CREATE TABLE IF NOT EXISTS document_versions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    document_id UUID NOT NULL,
    version_number INTEGER NOT NULL CHECK (version_number > 0),
    original_filename VARCHAR(255) NOT NULL,
    storage_key TEXT NOT NULL,
    mime_type VARCHAR(150) NOT NULL,
    file_size_bytes BIGINT NOT NULL CHECK (file_size_bytes >= 0),
    checksum_sha256 CHAR(64),
    uploaded_by UUID,
    status VARCHAR(12) NOT NULL DEFAULT 'queued',
    is_current BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT fk_document_versions_document_org
        FOREIGN KEY (document_id, organization_id)
        REFERENCES documents(id, organization_id)
        ON DELETE CASCADE,
    CONSTRAINT document_versions_status_check
        CHECK (status IN ('queued', 'processing', 'ready', 'failed', 'superseded')),
    UNIQUE (document_id, version_number)
);

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_constraint
        WHERE conrelid = 'document_versions'::regclass
          AND conname = 'document_versions_status_check'
          AND pg_get_constraintdef(oid) LIKE '%superseded%'
    ) THEN
        ALTER TABLE document_versions
            DROP CONSTRAINT IF EXISTS document_versions_status_check;
        ALTER TABLE document_versions
            ADD CONSTRAINT document_versions_status_check
            CHECK (status IN ('queued', 'processing', 'ready', 'failed', 'superseded'));
    END IF;
END
$$;

CREATE UNIQUE INDEX IF NOT EXISTS idx_document_versions_one_current
    ON document_versions(document_id)
    WHERE is_current;

CREATE INDEX IF NOT EXISTS idx_document_versions_document
    ON document_versions(organization_id, document_id, version_number DESC);

INSERT INTO document_versions (
    organization_id, document_id, version_number, original_filename, storage_key,
    mime_type, file_size_bytes, checksum_sha256, uploaded_by, status, is_current, created_at
)
SELECT
    d.organization_id, d.id, 1, d.original_filename, d.storage_key,
    d.mime_type, d.file_size_bytes, d.checksum_sha256, d.uploaded_by,
    CASE WHEN d.status IN ('ready', 'archived') THEN 'ready'
         WHEN d.status = 'failed' THEN 'failed'
         WHEN d.status = 'queued' THEN 'queued'
         ELSE 'processing'
    END,
    TRUE,
    d.uploaded_at
FROM documents d
WHERE NOT EXISTS (
    SELECT 1 FROM document_versions dv WHERE dv.document_id = d.id
);
