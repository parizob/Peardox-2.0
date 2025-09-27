-- Article Comments Table for Pearadox
-- Optimized for minimal egress with explicit field selection

CREATE TABLE article_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  article_id INTEGER NOT NULL,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  comment_text TEXT NOT NULL CHECK (length(comment_text) > 0 AND length(comment_text) <= 2000),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  is_edited BOOLEAN DEFAULT false,
  is_deleted BOOLEAN DEFAULT false,
  
  -- Indexes for performance
  CONSTRAINT article_comments_article_id_idx UNIQUE (id),
  INDEX idx_article_comments_article_id ON article_comments(article_id),
  INDEX idx_article_comments_user_id ON article_comments(user_id),
  INDEX idx_article_comments_created_at ON article_comments(created_at DESC),
  INDEX idx_article_comments_active ON article_comments(article_id, is_deleted) WHERE is_deleted = false
);

-- Enable Row Level Security (RLS)
ALTER TABLE article_comments ENABLE ROW LEVEL SECURITY;

-- RLS Policies for secure access

-- Allow everyone to read non-deleted comments
CREATE POLICY "Anyone can read active comments" ON article_comments
  FOR SELECT USING (is_deleted = false);

-- Allow authenticated users to insert their own comments
CREATE POLICY "Authenticated users can create comments" ON article_comments
  FOR INSERT WITH CHECK (auth.uid() = user_id AND is_deleted = false);

-- Allow users to update only their own comments (for editing)
CREATE POLICY "Users can update their own comments" ON article_comments
  FOR UPDATE USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id AND is_deleted = false);

-- Allow users to "soft delete" their own comments
CREATE POLICY "Users can delete their own comments" ON article_comments
  FOR UPDATE USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Trigger to automatically update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_article_comments_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  -- Mark as edited if comment_text changed (but not on initial insert)
  IF TG_OP = 'UPDATE' AND OLD.comment_text IS DISTINCT FROM NEW.comment_text THEN
    NEW.is_edited = true;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_article_comments_updated_at_trigger
  BEFORE UPDATE ON article_comments
  FOR EACH ROW
  EXECUTE FUNCTION update_article_comments_updated_at();

-- Create a view for efficient comment retrieval with user profile data
-- This joins with profiles table to get user display information
CREATE VIEW v_article_comments AS
SELECT 
  ac.id,
  ac.article_id,
  ac.user_id,
  ac.comment_text,
  ac.created_at,
  ac.updated_at,
  ac.is_edited,
  -- User profile data (only what we need for display)
  COALESCE(p.full_name, 'Anonymous User') as user_name,
  COALESCE(p.professional_title, '') as user_title
FROM article_comments ac
LEFT JOIN profiles p ON ac.user_id = p.id
WHERE ac.is_deleted = false
ORDER BY ac.created_at ASC;

-- Grant necessary permissions
GRANT SELECT ON v_article_comments TO authenticated;
GRANT ALL ON article_comments TO authenticated;
GRANT USAGE ON SEQUENCE article_comments_id_seq TO authenticated;

-- Comment count function for efficient counting without full data retrieval
CREATE OR REPLACE FUNCTION get_article_comment_count(target_article_id INTEGER)
RETURNS INTEGER AS $$
BEGIN
  RETURN (
    SELECT COUNT(*)::INTEGER 
    FROM article_comments 
    WHERE article_id = target_article_id 
    AND is_deleted = false
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission on the function
GRANT EXECUTE ON FUNCTION get_article_comment_count(INTEGER) TO authenticated;
GRANT EXECUTE ON FUNCTION get_article_comment_count(INTEGER) TO anon;

-- Example optimized queries for minimal egress:

/*
-- Get comments for an article (only essential fields)
SELECT id, user_id, comment_text, created_at, is_edited, user_name, user_title
FROM v_article_comments 
WHERE article_id = $1 
ORDER BY created_at ASC 
LIMIT 50;

-- Get comment count for an article
SELECT get_article_comment_count($1);

-- Add a new comment (minimal insert)
INSERT INTO article_comments (article_id, user_id, comment_text) 
VALUES ($1, $2, $3) 
RETURNING id, created_at;

-- Update a comment (user's own only)
UPDATE article_comments 
SET comment_text = $1 
WHERE id = $2 AND user_id = $3 AND is_deleted = false
RETURNING updated_at, is_edited;

-- Soft delete a comment
UPDATE article_comments 
SET is_deleted = true 
WHERE id = $1 AND user_id = $2
RETURNING id;
*/
