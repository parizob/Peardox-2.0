-- Create the saved_articles table
CREATE TABLE IF NOT EXISTS public.saved_articles (
  -- Unique identifier for each saved article record
  id UUID NOT NULL DEFAULT gen_random_uuid(),
  -- Reference to the user who saved the article
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  -- Reference to the article from v_arxiv_papers
  article_id TEXT NOT NULL,
  -- Additional metadata about when the article was saved
  saved_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  -- Set composite primary key
  PRIMARY KEY (id),
  -- Ensure a user can't save the same article multiple times
  UNIQUE(user_id, article_id)
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_saved_articles_user_id ON public.saved_articles(user_id);
CREATE INDEX IF NOT EXISTS idx_saved_articles_article_id ON public.saved_articles(article_id);
CREATE INDEX IF NOT EXISTS idx_saved_articles_saved_at ON public.saved_articles(saved_at DESC);

-- Enable Row Level Security (RLS)
ALTER TABLE public.saved_articles ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view their own saved articles" ON public.saved_articles;
DROP POLICY IF EXISTS "Users can insert their own saved articles" ON public.saved_articles;
DROP POLICY IF EXISTS "Users can update their own saved articles" ON public.saved_articles;
DROP POLICY IF EXISTS "Users can delete their own saved articles" ON public.saved_articles;

-- Create RLS policies
CREATE POLICY "Users can view their own saved articles" ON public.saved_articles
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own saved articles" ON public.saved_articles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own saved articles" ON public.saved_articles
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own saved articles" ON public.saved_articles
  FOR DELETE USING (auth.uid() = user_id);

-- Grant necessary permissions
GRANT ALL ON public.saved_articles TO authenticated;
GRANT SELECT ON public.saved_articles TO anon; 