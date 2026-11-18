CREATE TABLE IF NOT EXISTS message_feedback (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    message_id UUID NOT NULL,
    organization_id UUID NOT NULL,
    user_id UUID NOT NULL,
    helpful BOOLEAN NOT NULL,
    comment VARCHAR(1000),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (message_id, user_id),
    CONSTRAINT fk_feedback_message_org
        FOREIGN KEY (message_id, organization_id)
        REFERENCES messages(id, organization_id)
        ON DELETE CASCADE,
    CONSTRAINT fk_feedback_member_org
        FOREIGN KEY (organization_id, user_id)
        REFERENCES organization_members(organization_id, user_id)
        ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_message_feedback_org_created
    ON message_feedback(organization_id, created_at DESC);
