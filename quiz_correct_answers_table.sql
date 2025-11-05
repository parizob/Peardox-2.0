-- Create table to track users' correct quiz answers
CREATE TABLE IF NOT EXISTS quiz_correct_answers (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  arxiv_paper_id BIGINT NOT NULL,
  arxiv_id TEXT NOT NULL,
  answered_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Ensure a user can only have one correct answer recorded per paper
  UNIQUE(user_id, arxiv_paper_id)
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_quiz_correct_answers_user_id ON quiz_correct_answers(user_id);
CREATE INDEX IF NOT EXISTS idx_quiz_correct_answers_arxiv_paper_id ON quiz_correct_answers(arxiv_paper_id);
CREATE INDEX IF NOT EXISTS idx_quiz_correct_answers_arxiv_id ON quiz_correct_answers(arxiv_id);
CREATE INDEX IF NOT EXISTS idx_quiz_correct_answers_answered_at ON quiz_correct_answers(answered_at DESC);

-- Enable Row Level Security
ALTER TABLE quiz_correct_answers ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Users can view their own correct answers
CREATE POLICY "Users can view their own correct answers"
  ON quiz_correct_answers
  FOR SELECT
  USING (auth.uid() = user_id);

-- Users can insert their own correct answers
CREATE POLICY "Users can insert their own correct answers"
  ON quiz_correct_answers
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Optional: Allow users to see aggregate stats (e.g., how many people got a quiz correct)
-- Uncomment if you want public read access to counts
-- CREATE POLICY "Public can view quiz statistics"
--   ON quiz_correct_answers
--   FOR SELECT
--   USING (true);

-- Add a comment to the table
COMMENT ON TABLE quiz_correct_answers IS 'Tracks when users answer quiz questions correctly';
COMMENT ON COLUMN quiz_correct_answers.user_id IS 'Reference to the user who answered correctly';
COMMENT ON COLUMN quiz_correct_answers.arxiv_paper_id IS 'Internal paper ID from v_arxiv_papers.id';
COMMENT ON COLUMN quiz_correct_answers.arxiv_id IS 'ArXiv ID string (e.g., 2301.12345)';
COMMENT ON COLUMN quiz_correct_answers.answered_at IS 'Timestamp when the user answered correctly';

