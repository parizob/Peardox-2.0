-- =====================================
-- SAVED ARTICLES TABLE FOR PEARADOX
-- =====================================

-- Drop existing table if it exists (for clean restart)
DROP TABLE IF EXISTS public.saved_articles CASCADE;

-- Create the saved_articles table
CREATE TABLE public.saved_articles (
  -- Primary key
  id UUID NOT NULL DEFAULT gen_random_uuid(),
  
  -- Foreign keys
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  article_id TEXT NOT NULL,
  
  -- Metadata
  saved_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  -- Constraints
  PRIMARY KEY (id),
  UNIQUE(user_id, article_id)
);

-- Create indexes for performance
CREATE INDEX idx_saved_articles_user_id ON public.saved_articles(user_id);
CREATE INDEX idx_saved_articles_article_id ON public.saved_articles(article_id);
CREATE INDEX idx_saved_articles_saved_at ON public.saved_articles(saved_at DESC);

-- Enable Row Level Security (RLS)
ALTER TABLE public.saved_articles ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can manage their own saved articles" ON public.saved_articles;

-- Create a single comprehensive RLS policy
CREATE POLICY "Users can manage their own saved articles" ON public.saved_articles
  FOR ALL USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Grant permissions
GRANT ALL ON public.saved_articles TO authenticated;
GRANT USAGE ON SCHEMA public TO authenticated;

-- Verify table creation
SELECT 
  'saved_articles table created successfully' as status,
  COUNT(*) as initial_count 
FROM public.saved_articles; 