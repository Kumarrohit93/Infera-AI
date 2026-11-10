-- Table 5 (RAG): Citations, evidence snippets, and document references.
-- Preserves citation snapshots even if underlying documents or chunks are deleted.

CREATE TABLE IF NOT EXISTS message_sources (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    message_id UUID NOT NULL,
    role VARCHAR(10) NOT NULL DEFAULT 'assistant' CHECK (role = 'assistant'),
    document_id UUID,
    chunk_id UUID,
    citation_number INTEGER NOT NULL CHECK (citation_number > 0),
    document_name VARCHAR(255) NOT NULL,
    page_number INTEGER CHECK (page_number IS NULL OR page_number > 0),
    section_heading TEXT,
    similarity_score REAL CHECK (similarity_score IS NULL OR (similarity_score >= 0.0 AND similarity_score <= 1.0)),
    quoted_excerpt TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    -- Enforces [1], [2], [3] sequence uniqueness per assistant message
    UNIQUE (message_id, citation_number),

    -- 1. Guarantees cited message belongs to the same organization AND is an assistant response
    CONSTRAINT fk_message_sources_message_same_org
        FOREIGN KEY (message_id, organization_id, role)
        REFERENCES messages(id, organization_id, role)
        ON DELETE CASCADE,

    -- 2. Document reference: If document is deleted, preserve snapshot by setting document_id to NULL
    CONSTRAINT fk_message_sources_document_same_org
        FOREIGN KEY (document_id, organization_id)
        REFERENCES documents(id, organization_id)
        ON DELETE SET NULL (document_id),

    -- 3. Chunk reference: If chunk is deleted, set ONLY chunk_id to NULL. Document_id remains intact!
    CONSTRAINT fk_message_sources_chunk_same_doc
        FOREIGN KEY (chunk_id, document_id)
        REFERENCES document_chunks(id, document_id)
        ON DELETE SET NULL (chunk_id)
);

CREATE INDEX IF NOT EXISTS idx_message_sources_message
    ON message_sources(message_id);

CREATE INDEX IF NOT EXISTS idx_message_sources_org_doc
    ON message_sources(organization_id, document_id);
