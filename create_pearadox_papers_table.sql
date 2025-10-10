-- Create the pearadox_papers table
CREATE TABLE pearadox_papers (
    -- Primary key ID (auto-incrementing, starts at 1)
    id BIGSERIAL PRIMARY KEY,
    
    -- Pearadox ID (P1, P2, P3, etc.) - Generated automatically
    pearadox_id TEXT GENERATED ALWAYS AS ('P' || id) STORED,
    
    -- Paper Information
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    
    -- Authors (stored as a JSON array of strings)
    authors JSONB NOT NULL,
    
    -- Categories (stored as a JSON array of category names)
    categories JSONB NOT NULL,
    
    -- File storage reference (path or URL to the PDF)
    file_path TEXT NOT NULL,
    file_name TEXT NOT NULL,
    file_size BIGINT, -- Size in bytes
    
    -- Submission metadata
    submitted_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    submitted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    -- Status tracking
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'under_review', 'approved', 'rejected', 'published')),
    
    -- Review and approval
    reviewed_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    reviewed_at TIMESTAMPTZ,
    review_notes TEXT,
    
    -- Publishing
    published_at TIMESTAMPTZ,
    
    -- Timestamps for record keeping
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    -- Indexes for better query performance
    CONSTRAINT authors_is_array CHECK (jsonb_typeof(authors) = 'array'),
    CONSTRAINT categories_is_array CHECK (jsonb_typeof(categories) = 'array'),
    CONSTRAINT valid_file_size CHECK (file_size IS NULL OR file_size > 0)
);

-- Create indexes for frequently queried columns
CREATE INDEX idx_pearadox_papers_submitted_by ON pearadox_papers(submitted_by);
CREATE INDEX idx_pearadox_papers_status ON pearadox_papers(status);
CREATE INDEX idx_pearadox_papers_submitted_at ON pearadox_papers(submitted_at DESC);
CREATE INDEX idx_pearadox_papers_pearadox_id ON pearadox_papers(pearadox_id);

-- Create a GIN index for searching within JSON arrays
CREATE INDEX idx_pearadox_papers_categories ON pearadox_papers USING GIN (categories);
CREATE INDEX idx_pearadox_papers_authors ON pearadox_papers USING GIN (authors);

-- Create a trigger to automatically update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_pearadox_papers_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_pearadox_papers_updated_at
    BEFORE UPDATE ON pearadox_papers
    FOR EACH ROW
    EXECUTE FUNCTION update_pearadox_papers_updated_at();

-- Enable Row Level Security (RLS)
ALTER TABLE pearadox_papers ENABLE ROW LEVEL SECURITY;

-- RLS Policies

-- Policy: Users can view their own submissions
CREATE POLICY "Users can view their own submissions"
    ON pearadox_papers
    FOR SELECT
    USING (auth.uid() = submitted_by);

-- Policy: Users can insert their own submissions
CREATE POLICY "Users can insert their own submissions"
    ON pearadox_papers
    FOR INSERT
    WITH CHECK (auth.uid() = submitted_by);

-- Policy: Users can update their own pending submissions
CREATE POLICY "Users can update their own pending submissions"
    ON pearadox_papers
    FOR UPDATE
    USING (auth.uid() = submitted_by AND status = 'pending')
    WITH CHECK (auth.uid() = submitted_by AND status = 'pending');

-- Policy: Admins can view all submissions (assuming you have an admin role)
-- Note: You'll need to adjust this based on your auth setup
-- CREATE POLICY "Admins can view all submissions"
--     ON pearadox_papers
--     FOR SELECT
--     USING (
--         EXISTS (
--             SELECT 1 FROM user_roles 
--             WHERE user_id = auth.uid() AND role = 'admin'
--         )
--     );

-- Policy: Published papers are publicly viewable
CREATE POLICY "Published papers are publicly viewable"
    ON pearadox_papers
    FOR SELECT
    USING (status = 'published');

-- Add comments for documentation
COMMENT ON TABLE pearadox_papers IS 'Stores research papers submitted through the Pearadox submission form';
COMMENT ON COLUMN pearadox_papers.id IS 'Auto-incrementing primary key';
COMMENT ON COLUMN pearadox_papers.pearadox_id IS 'Human-readable identifier (P1, P2, P3, etc.)';
COMMENT ON COLUMN pearadox_papers.title IS 'Title of the research paper';
COMMENT ON COLUMN pearadox_papers.description IS 'Abstract or description of the paper';
COMMENT ON COLUMN pearadox_papers.authors IS 'JSON array of author names (up to 20)';
COMMENT ON COLUMN pearadox_papers.categories IS 'JSON array of selected categories (1-5)';
COMMENT ON COLUMN pearadox_papers.file_path IS 'Storage path or URL to the uploaded PDF file';
COMMENT ON COLUMN pearadox_papers.file_name IS 'Original filename of the uploaded PDF';
COMMENT ON COLUMN pearadox_papers.file_size IS 'Size of the PDF file in bytes';
COMMENT ON COLUMN pearadox_papers.submitted_by IS 'User ID of the person who submitted the paper';
COMMENT ON COLUMN pearadox_papers.submitted_at IS 'Timestamp when the paper was submitted';
COMMENT ON COLUMN pearadox_papers.status IS 'Current status of the submission (pending, under_review, approved, rejected, published)';
COMMENT ON COLUMN pearadox_papers.reviewed_by IS 'User ID of the reviewer (if applicable)';
COMMENT ON COLUMN pearadox_papers.reviewed_at IS 'Timestamp when the paper was reviewed';
COMMENT ON COLUMN pearadox_papers.review_notes IS 'Notes from the review process';
COMMENT ON COLUMN pearadox_papers.published_at IS 'Timestamp when the paper was published';
COMMENT ON COLUMN pearadox_papers.updated_at IS 'Timestamp of the last update to this record';

-- Example query to insert a paper
-- INSERT INTO pearadox_papers (
--     title, 
--     description, 
--     authors, 
--     categories, 
--     file_path, 
--     file_name, 
--     file_size,
--     submitted_by
-- ) VALUES (
--     'Deep Learning for Natural Language Processing',
--     'This paper explores advanced techniques in deep learning for NLP applications...',
--     '["John Doe", "Jane Smith", "Bob Johnson"]'::jsonb,
--     '["Natural Language Processing", "Deep Learning", "Machine Learning"]'::jsonb,
--     'papers/2024/01/paper-uuid-123.pdf',
--     'deep-learning-nlp.pdf',
--     2457600,
--     'user-uuid-here'
-- );

-- Example query to view all submissions by a user
-- SELECT 
--     pearadox_id,
--     title,
--     status,
--     submitted_at,
--     jsonb_array_length(authors) as author_count,
--     jsonb_array_length(categories) as category_count
-- FROM pearadox_papers
-- WHERE submitted_by = 'user-uuid-here'
-- ORDER BY submitted_at DESC;

-- Example query to search papers by category
-- SELECT 
--     pearadox_id,
--     title,
--     categories
-- FROM pearadox_papers
-- WHERE categories @> '["Machine Learning"]'::jsonb
--     AND status = 'published';

