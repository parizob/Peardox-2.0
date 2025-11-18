const fs = require('fs');
const path = require('path');

// Import Supabase client
const { createClient } = require('@supabase/supabase-js');

// Use your existing Supabase configuration
const supabaseUrl = 'https://ullqyuvcyvaaiihmntnw.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVsbHF5dXZjeXZhYWlpaG1udG53Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM5OTU4MDgsImV4cCI6MjA2OTU3MTgwOH0.RpUtrcaY3QIDl66Be5XG1PzK3gJkN3B0KLw40U2bQpA';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Generate slug from paper title and arxiv ID (matching your app's logic)
function generateSlug(title, arxivId) {
  if (!title || !arxivId) return '';
  
  const cleanTitle = title
    .toLowerCase()
    .replace(/[^\w\s-]/g, '') // Remove special characters
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with single
    .trim();
  
  // Limit length for better URLs (matching your app)
  const truncatedTitle = cleanTitle.length > 60 ? cleanTitle.substring(0, 60).replace(/-[^-]*$/, '') : cleanTitle;
  
  return `${arxivId}-${truncatedTitle}`;
}

// Fetch articles using the same pattern as your app (matching getAllPapersWithSummaries)
async function fetchArticles() {
  try {
    console.log('📊 Fetching articles using app pattern...');
    
    // Step 1: Get summaries (like your app does)
    const { data: summariesData, error: summariesError } = await supabase
      .from('summary_papers')
      .select('id, arxiv_paper_id, beginner_title, intermediate_title, beginner_overview, intermediate_overview, beginner_summary, intermediate_summary')
      .eq('processing_status', 'completed')
      .order('created_at', { ascending: false })
      .limit(1500); // Same limit as your app
    
    if (summariesError) {
      console.error('❌ Error fetching summaries:', summariesError);
      throw summariesError;
    }
    
    console.log(`📝 Found ${summariesData?.length || 0} completed summaries`);
    
    if (!summariesData || summariesData.length === 0) {
      console.log('⚠️ No summaries found, falling back to basic papers');
      // Fallback to basic papers
      const { data: basicData, error: basicError } = await supabase
        .from('v_arxiv_papers')
        .select('id, arxiv_paper_id, beginner_title, intermediate_title, beginner_overview, intermediate_overview, beginner_summary, intermediate_summary')
        .order('created_at', { ascending: false })
        .limit(1000);
      
      if (basicError) throw basicError;
      
      return (basicData || []).map(paper => ({
        id: paper.id,
        title: paper.title || 'Untitled',
        arxivId: paper.arxiv_id,
        authors: paper.authors || 'Unknown Authors',
        published_date: paper.published_date || paper.created_at,
        categories_name: Array.isArray(paper.categories_name) && paper.categories_name.length > 0 
          ? paper.categories_name[0] 
          : 'General',
        created_at: paper.created_at,
        updated_at: paper.updated_at
      })).filter(article => article.arxivId);
    }
    
    // Step 2: Transform summaries (like your app does)
    const transformedSummaries = summariesData.map(summary => ({
      paper_id: summary.arxiv_paper_id,
      arxiv_id: summary.arxiv_id,
      beginner_title: summary.beginner_title,
      intermediate_title: summary.intermediate_title,
      beginner_overview: summary.beginner_overview,
      intermediate_overview: summary.intermediate_overview,
      beginner_summary: summary.beginner_summary,
      intermediate_summary: summary.intermediate_summary,
      created_at: summary.created_at,
      updated_at: summary.updated_at
    }));
    
    // Step 3: Get corresponding papers from v_arxiv_papers
    const paperIds = transformedSummaries.map(summary => summary.paper_id);
    const { data: papersData, error: papersError } = await supabase
      .from('v_arxiv_papers')
      .select('id, title, abstract, arxiv_id, categories_name, authors, published_date, created_at')
      .in('id', paperIds)
      .order('id', { ascending: false });
    
    if (papersError) {
      console.error('❌ Error fetching papers:', papersError);
      throw papersError;
    }
    
    console.log(`📊 Found ${papersData?.length || 0} papers from v_arxiv_papers`);
    
    // Step 4: Create summaries map (like your app does)
    const summariesMap = new Map();
    transformedSummaries.forEach(summary => {
      summariesMap.set(summary.paper_id, summary);
    });
    
    // Step 5: Merge papers with summaries (like your app does)
    const papersWithSummaries = (papersData || []).map(paper => {
      const summary = summariesMap.get(paper.id);
      return {
        ...paper,
        // Use beginner level content by default for sitemap
        summaryTitle: summary?.beginner_title,
        summaryOverview: summary?.beginner_overview,
        summaryContent: summary?.beginner_summary,
        hasSummary: !!(summary?.beginner_title || summary?.beginner_overview || summary?.beginner_summary)
      };
    });
    
    // Step 6: Transform to match your app's article structure
    const transformedArticles = papersWithSummaries.map(paper => ({
      id: paper.id,
      title: paper.summaryTitle || paper.title || 'Untitled',
      summaryTitle: paper.summaryTitle,
      originalTitle: paper.title,
      shortDescription: paper.summaryOverview || (paper.abstract ? paper.abstract.substring(0, 200) + '...' : ''),
      arxivId: paper.arxiv_id, // This is the key property for URL generation
      authors: Array.isArray(paper.authors) ? paper.authors.join(', ') : (paper.authors || 'Unknown Authors'),
      published_date: paper.published_date || paper.created_at,
      categories_name: Array.isArray(paper.categories_name) && paper.categories_name.length > 0 
        ? paper.categories_name[0] 
        : 'General',
      created_at: paper.created_at,
      updated_at: paper.updated_at
    }));
    
    // Step 7: Filter out articles without arxiv_id
    const validArticles = transformedArticles.filter(article => article.arxivId);
    
    console.log(`🔄 Final result: ${validArticles.length} valid articles for sitemap generation`);
    return validArticles;
    
  } catch (error) {
    console.error('❌ Error fetching articles:', error);
    throw error;
  }
}

// Generate sitemap XML with your actual articles
function generateSitemapXML(articles, baseUrl = 'https://www.pearadox.app') {
  const currentDate = new Date().toISOString().split('T')[0];
  
  let sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:news="http://www.google.com/schemas/sitemap-news/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml"
        xmlns:mobile="http://www.google.com/schemas/sitemap-mobile/1.0">

  <!-- Main pages -->
  <url>
    <loc>${baseUrl}</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
  
  <url>
    <loc>${baseUrl}/aboutus</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
  
  <url>
    <loc>${baseUrl}/blog</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>
  
  <url>
    <loc>${baseUrl}/submit</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.6</priority>
  </url>
  
  <!-- Blog posts -->
  <url>
    <loc>${baseUrl}/blog/what-makes-an-ai-agent</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>
  
  <url>
    <loc>${baseUrl}/blog/ai-first-mindset-ferrari-engine</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>
  
  <url>
    <loc>${baseUrl}/blog/building-an-app-with-AI</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>
  
  <url>
    <loc>${baseUrl}/blog/democratizing-ai-research</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>

  <!-- Article pages -->`;

  // Add article URLs using the same slug generation as your app
  let validUrlCount = 0;
  articles.forEach((article) => {
    const slug = generateSlug(article.title, article.arxivId);
    if (slug && slug !== '-' && !slug.startsWith('undefined')) {
      const publishedDate = article.published_date ? new Date(article.published_date).toISOString().split('T')[0] : currentDate;
      const lastModified = article.updated_at ? new Date(article.updated_at).toISOString().split('T')[0] : publishedDate;
      const title = (article.title || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
      
      sitemap += `
  <url>
    <loc>${baseUrl}/article/${slug}</loc>
    <lastmod>${lastModified}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.6</priority>
    <news:news>
      <news:publication>
        <news:name>Pearadox Research</news:name>
        <news:language>en</news:language>
      </news:publication>
      <news:publication_date>${publishedDate}</news:publication_date>
      <news:title>${title}</news:title>
      <news:keywords>${article.categories_name || 'AI, machine learning, research'}</news:keywords>
    </news:news>
  </url>`;
      validUrlCount++;
    }
  });

  sitemap += `
</urlset>`;

  console.log(`📊 Generated ${validUrlCount} article URLs in sitemap`);
  return sitemap;
}

// Main sitemap generation function
async function generateWorkingSitemap() {
  try {
    console.log('🗺️ Starting working sitemap generation...');
    console.log('🔗 Connecting to Supabase...');
    
    // Test connection
    const { error: testError } = await supabase.from('v_summary_papers').select('count').limit(1);
    if (testError) {
      throw new Error(`Connection test failed: ${testError.message}`);
    }
    console.log('✅ Supabase connection successful');
    
    // Fetch articles from your actual database
    const allArticles = await fetchArticles();
    
    if (allArticles.length === 0) {
      throw new Error('No articles found in database');
    }
    
    // Sort by published date (newest first) - same as your app
    const sortedArticles = allArticles.sort((a, b) => 
      new Date(b.published_date || 0) - new Date(a.published_date || 0)
    );
    
    console.log(`📄 Generating sitemap for ${sortedArticles.length} articles...`);
    
    // Generate sitemap with all articles
    const sitemapXML = generateSitemapXML(sortedArticles);
    
    // Write sitemap to public directory
    const publicDir = path.join(__dirname, '..', 'public');
    const sitemapPath = path.join(publicDir, 'sitemap.xml');
    
    fs.writeFileSync(sitemapPath, sitemapXML, 'utf8');
    console.log(`✅ Sitemap generated: ${sitemapPath}`);
    
    // Update robots.txt with LLM crawler support
    const robotsTxt = `User-agent: *
Allow: /

# Specific AI/LLM crawlers (explicitly allow for better discoverability)
User-agent: GPTBot
Allow: /

User-agent: ChatGPT-User
Allow: /

User-agent: CCBot
Allow: /

User-agent: anthropic-ai
Allow: /

User-agent: Claude-Web
Allow: /

User-agent: Google-Extended
Allow: /

User-agent: PerplexityBot
Allow: /

User-agent: YouBot
Allow: /

User-agent: Bingbot
Allow: /

User-agent: Googlebot
Allow: /

# Sitemap
Sitemap: https://www.pearadox.app/sitemap.xml

# Allow article pages (most important for indexing)
Allow: /article/

# Allow public resources
Allow: /aboutus
Allow: /blog

# Block admin areas
Disallow: /admin/

# Crawl delay for politeness (1 second between requests)
Crawl-delay: 1

# Host
Host: https://www.pearadox.app`;

    const robotsPath = path.join(publicDir, 'robots.txt');
    fs.writeFileSync(robotsPath, robotsTxt, 'utf8');
    console.log(`✅ Robots.txt updated`);
    
    console.log('🎉 Working sitemap generation completed successfully!');
    
    // Show sample URLs
    console.log('\n📋 Sample article URLs generated:');
    const sampleArticles = sortedArticles.slice(0, 5);
    sampleArticles.forEach(article => {
      const slug = generateSlug(article.title, article.arxivId);
      if (slug && !slug.startsWith('undefined')) {
        console.log(`   ✅ https://www.pearadox.app/article/${slug}`);
      }
    });
    
    const validUrls = sortedArticles.filter(article => {
      const slug = generateSlug(article.title, article.arxivId);
      return slug && !slug.startsWith('undefined');
    });
    
    console.log(`\n📊 Summary:`);
    console.log(`   📄 Total articles in database: ${allArticles.length}`);
    console.log(`   🔗 Valid article URLs generated: ${validUrls.length}`);
    console.log(`   🗺️ Sitemap includes all main pages plus article pages`);
    
    return {
      success: true,
      totalArticles: allArticles.length,
      validUrls: validUrls.length,
      sampleUrls: sampleArticles.slice(0, 3).map(article => {
        const slug = generateSlug(article.title, article.arxivId);
        return `https://www.pearadox.app/article/${slug}`;
      }).filter(url => !url.includes('undefined'))
    };
    
  } catch (error) {
    console.error('❌ Working sitemap generation failed:', error);
    
    // Generate minimal fallback sitemap
    const fallbackSitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://www.pearadox.app</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>https://www.pearadox.app/aboutus</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>https://www.pearadox.app/blog</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>
  <url>
    <loc>https://www.pearadox.app/submit</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.6</priority>
  </url>
  <url>
    <loc>https://www.pearadox.app/blog/what-makes-an-ai-agent</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>
  <url>
    <loc>https://www.pearadox.app/blog/ai-first-mindset-ferrari-engine</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>
  <url>
    <loc>https://www.pearadox.app/blog/building-an-app-with-AI</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>
  <url>
    <loc>https://www.pearadox.app/blog/democratizing-ai-research</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>
</urlset>`;

    const publicDir = path.join(__dirname, '..', 'public');
    const fallbackPath = path.join(publicDir, 'sitemap.xml');
    
    fs.writeFileSync(fallbackPath, fallbackSitemap, 'utf8');
    console.log('📝 Fallback sitemap generated');
    
    return {
      success: false,
      error: error.message
    };
  }
}

// Export for use in build process
module.exports = {
  generateWorkingSitemap,
  generateSitemapXML,
  generateSlug,
  fetchArticles
};

// If run directly, execute the generation
if (require.main === module) {
  generateWorkingSitemap()
    .then((result) => {
      if (result.success) {
        console.log(`\n🏁 Success! Generated sitemap with ${result.validUrls} article pages out of ${result.totalArticles} total articles.`);
        console.log('\n🔗 Your article pages are now in the sitemap and ready for search engines!');
        console.log('\n🚀 Next steps:');
        console.log('   1. Your sitemap is ready at public/sitemap.xml');
        console.log('   2. Deploy your site to make the sitemap live');
        console.log('   3. Submit your sitemap to Google Search Console');
        process.exit(0);
      } else {
        console.warn(`\n⚠️ Sitemap generation failed: ${result.error}`);
        console.log('\n✅ Fallback sitemap generated - build can continue');
        console.log('\n📌 Note: The cron job will regenerate the full sitemap daily at 3 AM UTC');
        process.exit(0); // Exit successfully even with fallback
      }
    })
    .catch((error) => {
      console.error('\n💥 Unexpected error:', error);
      console.log('\n✅ Fallback sitemap should have been generated - build can continue');
      process.exit(0); // Exit successfully to not block deployment
    });
}
