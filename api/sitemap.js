import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

// Initialize Supabase client
const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://ullqyuvcyvaaiihmntnw.supabase.co';
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVsbHF5dXZjeXZhYWlpaG1udG53Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM5OTU4MDgsImV4cCI6MjA2OTU3MTgwOH0.RpUtrcaY3QIDl66Be5XG1PzK3gJkN3B0KLw40U2bQpA';

const supabase = createClient(supabaseUrl, supabaseKey);

/**
 * API route to generate and update sitemap.xml
 * Can be called manually or via Vercel cron job
 */
export default async function handler(req, res) {
  try {
    console.log('🚀 Starting sitemap generation...');

    // Fetch articles using the same pattern as the working sitemap script
    let articles = [];
    
    // Step 1: Get summaries first
    const { data: summariesData, error: summariesError } = await supabase
      .from('summary_papers')
      .select('id, arxiv_paper_id, beginner_title, intermediate_title, beginner_overview, intermediate_overview, beginner_summary, intermediate_summary')
      .eq('processing_status', 'completed')
      .order('created_at', { ascending: false })
      .limit(10000); // Latest 10,000 articles

    if (summariesError) {
      console.error('❌ Error fetching summaries:', summariesError);
      return res.status(500).json({ error: 'Failed to fetch summaries', details: summariesError.message });
    }

    console.log(`📝 Found ${summariesData?.length || 0} completed summaries`);

    if (!summariesData || summariesData.length === 0) {
      console.log('⚠️ No summaries found, falling back to basic papers');
      // Fallback to basic papers
      const { data: basicData, error: basicError } = await supabase
        .from('v_arxiv_papers')
        .select('id, title, abstract, arxiv_id, categories_name, authors, published_date, created_at')
        .order('created_at', { ascending: false })
        .limit(10000);
      
      if (basicError) {
        console.error('❌ Error fetching basic papers:', basicError);
        return res.status(500).json({ error: 'Failed to fetch papers', details: basicError.message });
      }
      
      articles = (basicData || []).map(paper => ({
        arxiv_id: paper.arxiv_id,
        title: paper.title || 'Untitled',
        published_date: paper.published_date || paper.created_at,
        created_at: paper.created_at
      })).filter(article => article.arxiv_id);
    } else {
      // Transform summaries data
      articles = summariesData.map(summary => ({
        arxiv_id: summary.arxiv_id,
        title: summary.beginner_title || summary.intermediate_title || summary.expert_title || 'Untitled',
        published_date: summary.created_at,
        created_at: summary.created_at
      })).filter(article => article.arxiv_id);
    }

    if (articles.length === 0) {
      console.warn('⚠️ No articles found after processing');
      return res.status(200).json({ message: 'No articles found, empty sitemap created' });
    }

    console.log(`📄 Found ${articles.length} articles for sitemap`);

    // Generate article URLs with SEO-friendly slugs
    const articleUrls = articles.map(article => {
      // Create SEO-friendly slug
      const cleanTitle = article.title
        .toLowerCase()
        .replace(/[^\w\s-]/g, '') // Remove special characters
        .replace(/\s+/g, '-') // Replace spaces with hyphens
        .replace(/-+/g, '-') // Replace multiple hyphens with single
        .trim();
      
      const truncatedTitle = cleanTitle.length > 60 
        ? cleanTitle.substring(0, 60).replace(/-[^-]*$/, '') 
        : cleanTitle;
      
      const slug = `${article.arxiv_id}-${truncatedTitle}`;
      
      // Use the most recent date available
      const lastmod = article.published_date || article.created_at;
      
      return {
        url: `https://www.pearadox.app/article/${slug}`,
        lastmod: new Date(lastmod).toISOString(),
        changefreq: 'weekly',
        priority: '0.8'
      };
    });

    // Blog posts
    const blogPosts = [
      {
        url: 'https://www.pearadox.app/blog/what-makes-an-ai-agent',
        lastmod: '2025-11-15T00:00:00.000Z',
        changefreq: 'monthly',
        priority: '0.9'
      },
      {
        url: 'https://www.pearadox.app/blog/ai-first-mindset-ferrari-engine',
        lastmod: '2025-08-30T00:00:00.000Z',
        changefreq: 'monthly',
        priority: '0.9'
      },
      {
        url: 'https://www.pearadox.app/blog/building-an-app-with-AI',
        lastmod: '2025-08-24T00:00:00.000Z',
        changefreq: 'monthly',
        priority: '0.8'
      },
      {
        url: 'https://www.pearadox.app/blog/democratizing-ai-research',
        lastmod: '2025-08-19T00:00:00.000Z',
        changefreq: 'monthly',
        priority: '0.8'
      }
    ];

    // Static pages
    const staticPages = [
      {
        url: 'https://www.pearadox.app/',
        lastmod: new Date().toISOString(),
        changefreq: 'daily',
        priority: '1.0'
      },
      {
        url: 'https://www.pearadox.app/aboutus',
        lastmod: new Date().toISOString(),
        changefreq: 'monthly',
        priority: '0.7'
      },
      {
        url: 'https://www.pearadox.app/blog',
        lastmod: new Date().toISOString(),
        changefreq: 'weekly',
        priority: '0.8'
      },
      {
        url: 'https://www.pearadox.app/submit',
        lastmod: new Date().toISOString(),
        changefreq: 'monthly',
        priority: '0.6'
      }
    ];

    // Combine all URLs
    const allUrls = [...staticPages, ...blogPosts, ...articleUrls];

    // Generate sitemap XML
    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
        xsi:schemaLocation="http://www.sitemaps.org/schemas/sitemap/0.9
        http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd">
${allUrls.map(({ url, lastmod, changefreq, priority }) => `  <url>
    <loc>${url}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
  </url>`).join('\n')}
</urlset>`;

    // Write sitemap to public directory
    const publicDir = path.join(process.cwd(), 'public');
    const sitemapPath = path.join(publicDir, 'sitemap.xml');
    
    // Ensure public directory exists
    if (!fs.existsSync(publicDir)) {
      fs.mkdirSync(publicDir, { recursive: true });
    }
    
    fs.writeFileSync(sitemapPath, sitemap, 'utf8');

    console.log(`✅ Sitemap generated successfully with ${allUrls.length} URLs`);
    console.log(`📁 Sitemap saved to: ${sitemapPath}`);

    // Return success response
    res.status(200).json({
      success: true,
      message: `Sitemap updated successfully ✅`,
      stats: {
        totalUrls: allUrls.length,
        articleUrls: articleUrls.length,
        blogUrls: blogPosts.length,
        staticUrls: staticPages.length,
        generatedAt: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('❌ Sitemap generation failed:', error);
    res.status(500).json({
      success: false,
      error: 'Sitemap generation failed',
      details: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
}
