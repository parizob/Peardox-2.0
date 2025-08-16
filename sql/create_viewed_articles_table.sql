-- Create viewed_articles table for tracking user article views
-- This table will be used for KPIs and analytics
-- Supports both authenticated and anonymous users

CREATE TABLE viewed_articles (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE, -- Nullable for anonymous users
    article_id TEXT NOT NULL, -- References the article ID from v_arxiv_papers
    arxiv_id TEXT, -- Store ArXiv ID for additional reference
    category TEXT, -- Store article category for analytics
    skill_level TEXT CHECK (skill_level IN ('Beginner', 'Intermediate', 'Advanced')) DEFAULT 'Beginner', -- User's skill level when viewing
    viewed_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    session_id TEXT NOT NULL, -- Required: track viewing sessions for anonymous users
    source TEXT DEFAULT 'web', -- Track where the view came from (web, mobile, etc.)
    is_authenticated BOOLEAN DEFAULT false, -- Track if user was authenticated
    anonymous_id TEXT, -- Optional: client-generated ID for anonymous user tracking
    user_agent TEXT, -- Track browser/device information
    ip_hash TEXT, -- Optional: hashed IP for anonymous analytics (privacy-friendly)
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create indexes for better query performance
CREATE INDEX idx_viewed_articles_user_id ON viewed_articles(user_id);
CREATE INDEX idx_viewed_articles_article_id ON viewed_articles(article_id);
CREATE INDEX idx_viewed_articles_viewed_at ON viewed_articles(viewed_at);
CREATE INDEX idx_viewed_articles_category ON viewed_articles(category);
CREATE INDEX idx_viewed_articles_skill_level ON viewed_articles(skill_level);
CREATE INDEX idx_viewed_articles_session_id ON viewed_articles(session_id);
CREATE INDEX idx_viewed_articles_is_authenticated ON viewed_articles(is_authenticated);
CREATE INDEX idx_viewed_articles_anonymous_id ON viewed_articles(anonymous_id);
CREATE INDEX idx_viewed_articles_user_viewed_at ON viewed_articles(user_id, viewed_at) WHERE user_id IS NOT NULL;

-- Create composite index for preventing duplicate views within a short timeframe
-- For authenticated users
CREATE UNIQUE INDEX idx_viewed_articles_auth_user_article_recent 
ON viewed_articles(user_id, article_id, DATE_TRUNC('hour', viewed_at))
WHERE user_id IS NOT NULL;

-- For anonymous users (using session_id)
CREATE UNIQUE INDEX idx_viewed_articles_anon_session_article_recent 
ON viewed_articles(session_id, article_id, DATE_TRUNC('hour', viewed_at))
WHERE user_id IS NULL;

-- Enable Row Level Security
ALTER TABLE viewed_articles ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
-- Authenticated users can view their own article views
CREATE POLICY "Users can view their own article views" ON viewed_articles
    FOR SELECT USING (auth.uid() = user_id);

-- Authenticated users can insert their own article views
CREATE POLICY "Users can insert their own article views" ON viewed_articles
    FOR INSERT WITH CHECK (auth.uid() = user_id AND is_authenticated = true);

-- Anonymous users can insert article views (no user_id check)
CREATE POLICY "Anonymous users can insert article views" ON viewed_articles
    FOR INSERT WITH CHECK (user_id IS NULL AND is_authenticated = false);

-- Authenticated users can update their own article views
CREATE POLICY "Users can update their own article views" ON viewed_articles
    FOR UPDATE USING (auth.uid() = user_id AND is_authenticated = true);

-- Allow anonymous read access for analytics (optional - can be restricted)
CREATE POLICY "Allow anonymous analytics reads" ON viewed_articles
    FOR SELECT USING (user_id IS NULL);

-- Optional: Create a function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_viewed_articles_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = TIMEZONE('utc'::text, NOW());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_viewed_articles_updated_at_trigger
    BEFORE UPDATE ON viewed_articles
    FOR EACH ROW
    EXECUTE FUNCTION update_viewed_articles_updated_at();

-- Create a view for analytics queries
CREATE OR REPLACE VIEW v_article_analytics AS
SELECT 
    va.user_id,
    va.article_id,
    va.arxiv_id,
    va.category,
    va.skill_level,
    va.viewed_at,
    va.source,
    va.session_id,
    va.is_authenticated,
    va.anonymous_id,
    -- Add user profile information (only for authenticated users)
    p.full_name,
    p.professional_title,
    p.institution,
    -- Add article information if needed
    ap.title as article_title,
    ap.authors,
    ap.published_date,
    -- Calculate metrics
    COUNT(*) OVER (PARTITION BY va.user_id) as user_total_views,
    COUNT(*) OVER (PARTITION BY va.session_id) as session_total_views,
    COUNT(*) OVER (PARTITION BY va.category) as category_total_views,
    ROW_NUMBER() OVER (PARTITION BY COALESCE(va.user_id::text, va.session_id) ORDER BY va.viewed_at) as view_sequence,
    -- Anonymous user aggregations
    CASE 
        WHEN va.user_id IS NOT NULL THEN 'authenticated'
        ELSE 'anonymous'
    END as user_type
FROM viewed_articles va
LEFT JOIN profiles p ON va.user_id = p.id AND va.is_authenticated = true
LEFT JOIN v_arxiv_papers ap ON va.article_id = ap.id::text;

-- Grant necessary permissions
GRANT SELECT, INSERT, UPDATE ON viewed_articles TO authenticated;
GRANT SELECT, INSERT ON viewed_articles TO anon; -- Allow anonymous users to insert views
GRANT SELECT ON v_article_analytics TO authenticated;
GRANT SELECT ON v_article_analytics TO anon; -- Allow anonymous analytics reads
GRANT USAGE ON SEQUENCE viewed_articles_id_seq TO authenticated;
GRANT USAGE ON SEQUENCE viewed_articles_id_seq TO anon;
