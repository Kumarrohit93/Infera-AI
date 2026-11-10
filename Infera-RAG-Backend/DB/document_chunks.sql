-- RAG ke liye extracted text chunks + vector embeddings.
-- VECTOR(1536) OpenAI text-embedding-3-small ke default dimensions ke liye hai.
-- Agar embedding model/dimensions badloge toh column aur index bhi update karna.
CREATE TABLE IF NOT EXISTS document_chunks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL,
    document_id UUID NOT NULL,
    folder_id UUID,
    chunk_index INTEGER NOT NULL CHECK (chunk_index >= 0),
    chunk_text TEXT NOT NULL,
    page_number INTEGER CHECK (page_number IS NULL OR page_number > 0),
    heading TEXT,
    token_count INTEGER CHECK (token_count IS NULL OR token_count >= 0),
    embedding VECTOR(1536),
    embedding_model VARCHAR(100) NOT NULL DEFAULT 'text-embedding-3-small',
    metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    UNIQUE (document_id, chunk_index),

    CONSTRAINT fk_chunks_document_org
        FOREIGN KEY (document_id, organization_id)
        REFERENCES documents(id, organization_id)
        ON DELETE CASCADE,

    CONSTRAINT fk_chunks_folder_org
        FOREIGN KEY (folder_id, organization_id)
        REFERENCES folders(id, organization_id)
        ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_chunks_org_document
    ON document_chunks(organization_id, document_id);

CREATE INDEX IF NOT EXISTS idx_chunks_folder
    ON document_chunks(folder_id);

-- Cosine-distance HNSW index. Embeddings insert karne ke baad vector search fast hoga.
CREATE INDEX IF NOT EXISTS idx_document_chunks_embedding_hnsw
    ON document_chunks
    USING hnsw (embedding vector_cosine_ops);

-- Tenant filter ke liye organization index.
CREATE INDEX IF NOT EXISTS idx_document_chunks_org
    ON document_chunks(organization_id);
