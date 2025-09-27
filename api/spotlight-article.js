// API endpoint for cached daily spotlight article
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL, 
  process.env.SUPABASE_SERVICE_KEY
);

export default async function handler(req, res) {
  try {
    const { skillLevel = 'Beginner' } = req.query;
    
    console.log(`🌟 Fetching spotlight article for skill level: ${skillLevel}`);
    
    // Get current date for deterministic daily selection
    const today = new Date();
    const dateString = `${today.getFullYear()}-${today.getMonth()}-${today.getDate()}`;
    
    // Create a hash from the date to get consistent daily selection
    let hash = 0;
    for (let i = 0; i < dateString.length; i++) {
      const char = dateString.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    
    // Get recent papers with summaries for the given skill level
    const skillPrefix = skillLevel.toLowerCase();
    const summaryFields = `id, arxiv_paper_id, ${skillPrefix}_title, ${skillPrefix}_overview, ${skillPrefix}_summary, created_at, updated_at`;
    
    const { data: summariesData, error: summariesError } = await supabase
      .from('summary_papers')
      .select(summaryFields)
      .eq('processing_status', 'completed')
      .order('created_at', { ascending: false })
      .limit(100); // Get top 100 recent papers for selection
    
    if (summariesError) {
      console.error('❌ Error fetching summaries:', summariesError);
      throw summariesError;
    }
    
    if (!summariesData || summariesData.length === 0) {
      console.log('⚠️ No summaries found, falling back to basic papers');
      
      // Fallback to basic papers if no summaries available
      const { data: basicPapers, error: basicError } = await supabase
        .from('v_arxiv_papers')
        .select('id, title, abstract, arxiv_id, categories_name, authors, published_date, created_at, pdf_url, abstract_url')
        .order('created_at', { ascending: false })
        .limit(50);
      
      if (basicError) {
        console.error('❌ Error fetching basic papers:', basicError);
        throw basicError;
      }
      
      if (!basicPapers || basicPapers.length === 0) {
        return res.status(404).json({ error: 'No articles available' });
      }
      
      // Select daily article from basic papers
      const dailyIndex = Math.abs(hash) % basicPapers.length;
      const selectedPaper = basicPapers[dailyIndex];
      
      const spotlightArticle = {
        id: selectedPaper.id,
        title: selectedPaper.title,
        shortDescription: selectedPaper.abstract?.substring(0, 200) + '...' || 'No description available',
        originalTitle: selectedPaper.title,
        originalAbstract: selectedPaper.abstract,
        summaryContent: null,
        hasSummary: false,
        skillLevel: skillLevel,
        category: Array.isArray(selectedPaper.categories_name) && selectedPaper.categories_name.length > 0
          ? selectedPaper.categories_name[0]
          : 'General',
        categories: Array.isArray(selectedPaper.categories_name) ? selectedPaper.categories_name : [selectedPaper.categories_name || 'General'],
        arxivId: selectedPaper.arxiv_id,
        url: selectedPaper.pdf_url || selectedPaper.abstract_url || `https://arxiv.org/pdf/${selectedPaper.arxiv_id}`,
        authors: Array.isArray(selectedPaper.authors) ? selectedPaper.authors.join(', ') : (selectedPaper.authors || 'Unknown Authors'),
        publishedDate: new Date(selectedPaper.published_date || selectedPaper.created_at).toLocaleDateString('en-US', { 
          year: 'numeric', 
          month: 'long', 
          day: 'numeric', 
          timeZone: 'UTC' 
        }),
        tags: Array.isArray(selectedPaper.categories_name) ? selectedPaper.categories_name : []
      };
      
      // Cache for 24 hours (86400 seconds) with 1 hour stale-while-revalidate
      res.setHeader('Cache-Control', 's-maxage=86400, stale-while-revalidate=3600');
      
      console.log(`✅ Spotlight article selected (basic): ${spotlightArticle.title}`);
      return res.status(200).json(spotlightArticle);
    }
    
    // Transform summaries data
    const transformedSummaries = summariesData.map(row => {
      return {
        id: row.id,
        paper_id: row.arxiv_paper_id,
        skill_level: skillLevel,
        title: row[`${skillPrefix}_title`],
        overview: row[`${skillPrefix}_overview`],
        summary: row[`${skillPrefix}_summary`],
        created_at: row.created_at,
        updated_at: row.updated_at
      };
    }).filter(item => item.title && item.overview);
    
    if (transformedSummaries.length === 0) {
      return res.status(404).json({ error: 'No valid summaries available' });
    }
    
    // Select daily spotlight from available summaries
    const dailyIndex = Math.abs(hash) % transformedSummaries.length;
    const selectedSummary = transformedSummaries[dailyIndex];
    
    console.log(`📝 Selected summary for spotlight: ${selectedSummary.title} (index: ${dailyIndex})`);
    
    // Get the corresponding paper data
    const { data: paperData, error: paperError } = await supabase
      .from('v_arxiv_papers')
      .select('id, title, abstract, arxiv_id, categories_name, authors, published_date, created_at, pdf_url, abstract_url')
      .eq('id', selectedSummary.paper_id)
      .single();
    
    if (paperError) {
      console.error('❌ Error fetching paper data:', paperError);
      throw paperError;
    }
    
    // Combine paper and summary data
    const spotlightArticle = {
      id: paperData.id,
      title: selectedSummary.title || paperData.title,
      shortDescription: selectedSummary.overview || (paperData.abstract?.substring(0, 200) + '...') || 'No description available',
      originalTitle: paperData.title,
      originalAbstract: paperData.abstract,
      summaryContent: selectedSummary.summary || null,
      hasSummary: !!(selectedSummary.title || selectedSummary.overview || selectedSummary.summary),
      skillLevel: selectedSummary.skill_level || skillLevel,
      category: Array.isArray(paperData.categories_name) && paperData.categories_name.length > 0
        ? paperData.categories_name[0]
        : 'General',
      categories: Array.isArray(paperData.categories_name) ? paperData.categories_name : [paperData.categories_name || 'General'],
      arxivId: paperData.arxiv_id,
      url: paperData.pdf_url || paperData.abstract_url || `https://arxiv.org/pdf/${paperData.arxiv_id}`,
      authors: Array.isArray(paperData.authors) ? paperData.authors.join(', ') : (paperData.authors || 'Unknown Authors'),
      publishedDate: new Date(paperData.published_date || paperData.created_at).toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric', 
        timeZone: 'UTC' 
      }),
      tags: Array.isArray(paperData.categories_name) ? paperData.categories_name : []
    };
    
    // Cache for 24 hours (86400 seconds) with 1 hour stale-while-revalidate
    // This means:
    // - Fresh response served for 24 hours
    // - After 24 hours, stale response served while new one is fetched in background
    // - Maximum stale age is 1 hour before forcing fresh fetch
    res.setHeader('Cache-Control', 's-maxage=86400, stale-while-revalidate=3600');
    
    console.log(`✅ Spotlight article selected: ${spotlightArticle.title}`);
    res.status(200).json(spotlightArticle);
    
  } catch (error) {
    console.error('❌ Error in spotlight-article API:', error);
    res.status(500).json({ 
      error: 'Failed to fetch spotlight article',
      message: error.message 
    });
  }
}
