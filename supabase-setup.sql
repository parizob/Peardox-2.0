-- Complete setup for profiles table and RLS policies
-- Run this in your Supabase SQL editor

-- 1. Create the profiles table (if not already created)
CREATE TABLE IF NOT EXISTS public.profiles (
  -- The 'id' column links this table to the core 'auth.users' table.
  -- It is both the primary key of this table and a foreign key to auth.users.
  id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Automatically set the creation timestamp.
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  -- Columns for user metadata.
  full_name TEXT,
  professional_title TEXT,
  institution TEXT,
  
  -- An array of strings for research interests.
  research_interests TEXT[],
  
  -- User's technical skill level
  skill_level TEXT DEFAULT 'Beginner',
  
  -- Set the 'id' as the primary key of this table.
  PRIMARY KEY (id)
);

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
  -- Optional user notes about why they saved this article
  user_notes TEXT,
  -- Optional tags the user wants to associate with this saved article
  user_tags TEXT[],
  -- Set composite primary key
  PRIMARY KEY (id),
  -- Ensure a user can't save the same article multiple times
  UNIQUE(user_id, article_id)
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_saved_articles_user_id ON public.saved_articles(user_id);
CREATE INDEX IF NOT EXISTS idx_saved_articles_article_id ON public.saved_articles(article_id);
CREATE INDEX IF NOT EXISTS idx_saved_articles_saved_at ON public.saved_articles(saved_at DESC);

-- 2. Enable Row Level Security (RLS) for the profiles table
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.saved_articles ENABLE ROW LEVEL SECURITY;

-- 3. Drop existing policies if they exist (to avoid conflicts)
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can delete own profile" ON public.profiles;

DROP POLICY IF EXISTS "Users can view their own saved articles" ON public.saved_articles;
DROP POLICY IF EXISTS "Users can insert their own saved articles" ON public.saved_articles;
DROP POLICY IF EXISTS "Users can update their own saved articles" ON public.saved_articles;
DROP POLICY IF EXISTS "Users can delete their own saved articles" ON public.saved_articles;

-- 4. Create RLS policies
-- Policy: Users can view their own profile
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

-- Policy: Users can insert their own profile  
CREATE POLICY "Users can insert own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Policy: Users can update their own profile
CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

-- Policy: Users can delete their own profile (optional)
CREATE POLICY "Users can delete own profile" ON public.profiles
  FOR DELETE USING (auth.uid() = id);

-- Create RLS policies for saved_articles table
CREATE POLICY "Users can view their own saved articles" ON public.saved_articles
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own saved articles" ON public.saved_articles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own saved articles" ON public.saved_articles
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own saved articles" ON public.saved_articles
  FOR DELETE USING (auth.uid() = user_id);

-- 5. Grant necessary permissions
GRANT ALL ON public.profiles TO authenticated;
GRANT ALL ON public.saved_articles TO authenticated;
GRANT SELECT ON public.profiles TO anon; 
GRANT SELECT ON public.saved_articles TO anon; 