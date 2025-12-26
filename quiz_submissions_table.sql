-- Create table to track users' quiz submissions (correct and incorrect)
CREATE TABLE IF NOT EXISTS quiz_submissions (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  arxiv_paper_id BIGINT NOT NULL,
  arxiv_id TEXT NOT NULL,
  answer_type TEXT NOT NULL DEFAULT 'true', -- 'true' for correct, 'false' for incorrect
  answered_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Ensure a user can only have one submission per paper (one attempt only)
  UNIQUE(user_id, arxiv_paper_id)
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_quiz_submissions_user_id ON quiz_submissions(user_id);
CREATE INDEX IF NOT EXISTS idx_quiz_submissions_arxiv_paper_id ON quiz_submissions(arxiv_paper_id);
CREATE INDEX IF NOT EXISTS idx_quiz_submissions_arxiv_id ON quiz_submissions(arxiv_id);
CREATE INDEX IF NOT EXISTS idx_quiz_submissions_answered_at ON quiz_submissions(answered_at DESC);
CREATE INDEX IF NOT EXISTS idx_quiz_submissions_answer_type ON quiz_submissions(answer_type);

-- Enable Row Level Security
ALTER TABLE quiz_submissions ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Users can view their own submissions
CREATE POLICY "Users can view their own submissions"
  ON quiz_submissions
  FOR SELECT
  USING (auth.uid() = user_id);

-- Users can insert their own submissions
CREATE POLICY "Users can insert their own submissions"
  ON quiz_submissions
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Optional: Allow users to see aggregate stats (e.g., how many people got a quiz correct)
-- Uncomment if you want public read access to counts
-- CREATE POLICY "Public can view quiz statistics"
--   ON quiz_submissions
--   FOR SELECT
--   USING (true);

-- Add comments to the table
COMMENT ON TABLE quiz_submissions IS 'Tracks user quiz submissions (both correct and incorrect answers)';
COMMENT ON COLUMN quiz_submissions.user_id IS 'Reference to the user who submitted the answer';
COMMENT ON COLUMN quiz_submissions.arxiv_paper_id IS 'Internal paper ID from v_arxiv_papers.id';
COMMENT ON COLUMN quiz_submissions.arxiv_id IS 'ArXiv ID string (e.g., 2301.12345)';
COMMENT ON COLUMN quiz_submissions.answer_type IS 'Whether the answer was correct: "true" or "false"';
COMMENT ON COLUMN quiz_submissions.answered_at IS 'Timestamp when the user submitted their answer';
