-- =========================================
-- VENDORLENS DATABASE SCHEMA
-- =========================================

-- 1. VENDORS
CREATE TABLE IF NOT EXISTS vendors (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    name VARCHAR(150) NOT NULL
        CHECK (char_length(trim(name)) > 0),

    website TEXT,
    category VARCHAR(100) NOT NULL,
    description TEXT NOT NULL DEFAULT '',

    data_classification TEXT NOT NULL
        CHECK (data_classification IN ('public', 'internal', 'confidential')),

    status TEXT NOT NULL DEFAULT 'active'
        CHECK (status IN ('active', 'archived')),

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. ASSESSMENTS
CREATE TABLE IF NOT EXISTS assessments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    vendor_id UUID NOT NULL
        REFERENCES vendors(id) ON DELETE RESTRICT,

    questionnaire_version INTEGER NOT NULL DEFAULT 1
        CHECK (questionnaire_version > 0),

    status TEXT NOT NULL DEFAULT 'draft'
        CHECK (status IN ('draft', 'completed')),

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    completed_at TIMESTAMPTZ,

    score NUMERIC(5, 2)
        CHECK (score BETWEEN 0 AND 100),

    risk_level TEXT
        CHECK (risk_level IN ('low', 'medium', 'high')),

    category_scores JSONB
        CHECK (
            category_scores IS NULL
            OR jsonb_typeof(category_scores) = 'object'
        ),

    recommendations JSONB NOT NULL DEFAULT '[]'::jsonb
        CHECK (jsonb_typeof(recommendations) = 'array'),

    -- Drafts must not have completed results.
    -- Completed assessments must have their results.
    CHECK (
        (
            status = 'draft'
            AND completed_at IS NULL
            AND score IS NULL
            AND risk_level IS NULL
            AND category_scores IS NULL
        )
        OR
        (
            status = 'completed'
            AND completed_at IS NOT NULL
            AND score IS NOT NULL
            AND risk_level IS NOT NULL
            AND category_scores IS NOT NULL
        )
    )
);

-- 3. ASSESSMENT ANSWERS
CREATE TABLE IF NOT EXISTS assessment_answers (
    assessment_id UUID NOT NULL
        REFERENCES assessments(id) ON DELETE CASCADE,

    question_id VARCHAR(100) NOT NULL,

    category TEXT NOT NULL
        CHECK (
            category IN (
                'security',
                'privacy',
                'compliance',
                'operational-resilience'
            )
        ),

    answer TEXT NOT NULL
        CHECK (answer IN ('yes', 'no', 'unknown')),

    evidence_note TEXT,

    PRIMARY KEY (assessment_id, question_id)
);

-- =========================================
-- INDEXES
-- =========================================

CREATE INDEX IF NOT EXISTS idx_vendors_status
    ON vendors(status);

CREATE INDEX IF NOT EXISTS idx_assessments_vendor_created
    ON assessments(vendor_id, created_at DESC);

-- =========================================
-- AUTOMATIC UPDATED_AT TIMESTAMP
-- =========================================

CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS vendors_updated_at_trigger ON vendors;

CREATE TRIGGER vendors_updated_at_trigger
BEFORE UPDATE ON vendors
FOR EACH ROW
EXECUTE FUNCTION update_updated_at();
