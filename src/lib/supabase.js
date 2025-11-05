import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ullqyuvcyvaaiihmntnw.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVsbHF5dXZjeXZhYWlpaG1udG53Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM5OTU4MDgsImV4cCI6MjA2OTU3MTgwOH0.RpUtrcaY3QIDl66Be5XG1PzK3gJkN3B0KLw40U2bQpA';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true
  }
});

console.log('🔗 Supabase client initialized');

// Test connection to v_arxiv_papers view
export const testConnection = async () => {
  try {
    console.log('🧪 Testing connection to v_arxiv_papers view...');
    
    const { data, error, count } = await supabase
      .from('v_arxiv_papers')
      .select('*', { count: 'exact' })
      .limit(3);
    
    if (error) {
      console.error('❌ Error accessing v_arxiv_papers:', error);
      return {
        success: false,
        error: error.message,
        count: 0
      };
    }
    
    console.log('✅ Successfully connected to v_arxiv_papers view');
    console.log(`📊 Found ${count} papers in view`);
    
    return {
      success: true,
      count: count || 0,
      sampleData: data || []
    };
    
  } catch (error) {
    console.error('💥 Connection test failed:', error);
    return {
      success: false,
      error: error.message,
      count: 0
    };
  }
};

// Simple in-memory cache with expiration
const cache = new Map();

const setCache = (key, value, minutesToLive = 15) => {
  const expiry = new Date().getTime() + (minutesToLive * 60 * 1000);
  cache.set(key, { value, expiry });
};

const getFromCache = (key) => {
  const cached = cache.get(key);
  if (!cached) return null;
  
  if (new Date().getTime() > cached.expiry) {
    cache.delete(key);
    return null;
  }
  
  return cached.value;
};

const clearCache = () => {
  cache.clear();
  console.log('🧹 Cache cleared');
};

// API functions for v_arxiv_papers view
export const arxivAPI = {
  // Get papers with explicit field selection and pagination
  async getAllPapers(page = 1, limit = 500, lightweight = false) {
    console.log(`📡 Fetching papers (page: ${page}, limit: ${limit}, lightweight: ${lightweight})...`);
    
    // Check cache first
    const cacheKey = `papers_${page}_${limit}_${lightweight}`;
    const cached = getFromCache(cacheKey);
    if (cached) {
      console.log('📦 Retrieved papers from cache');
      return cached;
    }
    
    // Essential fields only - optimized for UI needs
    const fields = lightweight 
      ? 'id, title, arxiv_id, categories_name, authors, published_date, created_at'
      : 'id, title, abstract, arxiv_id, categories_name, authors, published_date, created_at, pdf_url, abstract_url';
    
    const { data, error } = await supabase
      .from('v_arxiv_papers')
      .select(fields)
      .order('created_at', { ascending: false })
      .range((page - 1) * limit, page * limit - 1);
    
    if (error) {
      console.error('❌ Error fetching papers:', error);
      throw error;
    }
    
    // Cache the result
    setCache(cacheKey, data || [], 15);
    console.log(`✅ Retrieved ${data?.length || 0} papers`);
    return data || [];
  },

  // Get summaries by skill level - optimized for specific skill level
  async getSummariesBySkillLevel(skillLevel = 'Beginner', limit = 1000) {
    console.log(`📝 Fetching summaries for skill level: ${skillLevel} (limit: ${limit})`);
    
    const cacheKey = `summaries_${skillLevel}_${limit}`;
    const cached = getFromCache(cacheKey);
    if (cached) {
      console.log('📦 Retrieved summaries from cache');
      return cached;
    }
    
    // Only select fields for the specific skill level + essential metadata
    const skillPrefix = skillLevel.toLowerCase();
    const fields = `id, arxiv_paper_id, ${skillPrefix}_title, ${skillPrefix}_overview, ${skillPrefix}_summary, created_at, updated_at`;
    
    const { data, error } = await supabase
      .from('summary_papers')
      .select(fields)
      .eq('processing_status', 'completed')
      .limit(limit);
    
    if (error) {
      console.error('❌ Error fetching summaries:', error);
      throw error;
    }
    
    // Transform the data - fields already filtered for skill level
    const transformedData = (data || []).map(row => {
      const skillLevelLower = skillLevel.toLowerCase();
      return {
        id: row.id,
        paper_id: row.arxiv_paper_id,
        skill_level: skillLevel,
        title: row[`${skillLevelLower}_title`],
        overview: row[`${skillLevelLower}_overview`],
        summary: row[`${skillLevelLower}_summary`],
        created_at: row.created_at,
        updated_at: row.updated_at
      };
    }).filter(item => item.title && item.overview);
    
    // Cache the result
    setCache(cacheKey, transformedData, 20);
    console.log(`✅ Retrieved ${transformedData.length} summaries for ${skillLevel} level`);
    return transformedData;
  },

  async getLastRefreshDate() {
    console.log('📅 Getting last refresh date from summary_papers');
    
    try {
      const { data, error } = await supabase
        .from('summary_papers')
        .select('created_at')
        .order('created_at', { ascending: false })
        .limit(1);
      
      if (error) {
        console.error('❌ Error getting last refresh date:', error);
        return null;
      }
      
      if (data && data.length > 0) {
        const lastRefreshDate = new Date(data[0].created_at);
        console.log('✅ Last refresh date:', lastRefreshDate);
        return lastRefreshDate.toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          timeZone: 'UTC'
        });
      }
      
      return null;
    } catch (error) {
      console.error('❌ Exception in getLastRefreshDate:', error);
      return null;
    }
  },

  // Get papers with skill-level specific summaries - optimized and paginated
  async getAllPapersWithSummaries(skillLevel = 'Beginner', page = 1, limit = 500) {
    console.log(`📡 Fetching summarized papers for skill level: ${skillLevel} (page: ${page}, limit: ${limit})`);
    
    const cacheKey = `papers_summaries_${skillLevel}_${page}_${limit}`;
    const cached = getFromCache(cacheKey);
    if (cached) {
      console.log('📦 Retrieved papers with summaries from cache');
      return cached;
    }
    
    try {
      // Get summaries with skill-level specific fields only
      const skillPrefix = skillLevel.toLowerCase();
      const summaryFields = `id, arxiv_paper_id, ${skillPrefix}_title, ${skillPrefix}_overview, ${skillPrefix}_summary, created_at, updated_at`;
      
      const { data: summariesData, error: summariesError } = await supabase
        .from('summary_papers')
        .select(summaryFields)
        .eq('processing_status', 'completed')
        .order('created_at', { ascending: false })
        .range((page - 1) * limit, page * limit - 1);
      
      if (summariesError) {
        console.error('❌ Error fetching summaries:', summariesError);
        throw summariesError;
      }
      
      if (!summariesData || summariesData.length === 0) {
        console.log('⚠️ No summaries found, falling back to regular papers');
        return await this.getAllPapers();
      }
      
      console.log(`📝 Found ${summariesData.length} summaries (top 1500 by ID)`);
      
      // Transform summaries based on skill level
      const transformedSummaries = summariesData.map(row => {
        const skillLevelLower = skillLevel.toLowerCase();
        return {
          id: row.id,
          paper_id: row.arxiv_paper_id,
          skill_level: skillLevel,
          title: skillLevelLower === 'beginner' ? row.beginner_title : row.intermediate_title,
          overview: skillLevelLower === 'beginner' ? row.beginner_overview : row.intermediate_overview,
          summary: skillLevelLower === 'beginner' ? row.beginner_summary : row.intermediate_summary,
          created_at: row.created_at,
          updated_at: row.updated_at
        };
      }).filter(item => item.title && item.overview);
      
      console.log(`📝 Transformed ${transformedSummaries.length} summaries with content`);
      
      // Get the paper IDs that have summaries
      const paperIds = transformedSummaries.map(summary => summary.paper_id);
      
      // Fetch essential paper fields only
      const paperFields = 'id, title, abstract, arxiv_id, categories_name, authors, published_date, created_at, pdf_url, abstract_url';
      const { data: papersData, error: papersError } = await supabase
        .from('v_arxiv_papers')
        .select(paperFields)
        .in('id', paperIds)
        .order('id', { ascending: false });
      
      if (papersError) {
        console.error('❌ Error fetching papers:', papersError);
        throw papersError;
      }
      
      console.log(`📊 Found ${papersData?.length || 0} papers from v_arxiv_papers`);
      
      // Fetch quiz data for these papers
      console.log('🧠 Fetching quiz data for papers...');
      console.log('🧠 Paper IDs to fetch quizzes for:', paperIds.slice(0, 10), '... (showing first 10)');
      const { data: quizzesData, error: quizzesError } = await supabase
        .from('v_papers_with_quizzes')
        .select('arxiv_paper_id, question, answer_a, answer_b, answer_c, answer_d, correct_answer')
        .in('arxiv_paper_id', paperIds);
      
      if (quizzesError) {
        console.error('❌ Error fetching quizzes:', quizzesError);
        console.warn('⚠️ Error fetching quizzes (continuing without):', quizzesError);
      }
      
      console.log(`🧠 Found ${quizzesData?.length || 0} quizzes`);
      if (quizzesData && quizzesData.length > 0) {
        console.log('🧠 Quiz paper IDs:', quizzesData.map(q => q.arxiv_paper_id).slice(0, 10));
        console.log('🧠 Sample quiz:', quizzesData[0]);
      }
      
      // Create a map of summaries by paper ID for quick lookup
      const summariesMap = new Map();
      transformedSummaries.forEach(summary => {
        summariesMap.set(summary.paper_id, summary);
      });
      
      // Create a map of quizzes by paper ID for quick lookup
      const quizzesMap = new Map();
      (quizzesData || []).forEach(quiz => {
        quizzesMap.set(quiz.arxiv_paper_id, quiz);
      });
      
      // Merge papers with their corresponding summaries and quizzes
      const papersWithSummaries = (papersData || []).map(paper => {
        const summary = summariesMap.get(paper.id);
        const quiz = quizzesMap.get(paper.id);
        
        return {
          ...paper,
          // Add summary fields if available
          summaryTitle: summary?.title || null,
          summaryOverview: summary?.overview || null,
          summaryContent: summary?.summary || null,
          skillLevel: summary?.skill_level || null,
          // Add quiz fields if available
          quiz: quiz ? {
            question: quiz.question,
            answer_a: quiz.answer_a,
            answer_b: quiz.answer_b,
            answer_c: quiz.answer_c,
            answer_d: quiz.answer_d,
            correct_answer: quiz.correct_answer
          } : null
        };
      });
      
      // Cache the result
      setCache(cacheKey, papersWithSummaries, 20);
      console.log(`✅ Retrieved ${papersWithSummaries.length} papers with summaries and quizzes (page ${page})`);
      return papersWithSummaries;
      
    } catch (error) {
      console.error('❌ Error fetching papers with summaries:', error);
      // Fallback to regular papers if summaries fail
      console.log('🔄 Falling back to papers without summaries...');
      return await this.getAllPapers();
    }
  },

  // Get specific paper with summary by ID and skill level
  async getPaperWithSummary(paperId, skillLevel = 'Beginner') {
    console.log('📄 Fetching paper with summary - ID:', paperId, 'Skill Level:', skillLevel);
    
    try {
      // Get essential paper data only
      const paperFields = 'id, title, abstract, arxiv_id, categories_name, authors, published_date, created_at, pdf_url, abstract_url';
      const { data: paperData, error: paperError } = await supabase
        .from('v_arxiv_papers')
        .select(paperFields)
        .eq('id', paperId)
        .single();
      
      if (paperError) {
        console.error('❌ Error fetching paper:', paperError);
        throw paperError;
      }
      
      // Get skill-level specific summary fields only
      const skillPrefix = skillLevel.toLowerCase();
      const summaryFields = `id, arxiv_paper_id, ${skillPrefix}_title, ${skillPrefix}_overview, ${skillPrefix}_summary`;
      
      const { data: summaryData, error: summaryError } = await supabase
        .from('summary_papers')
        .select(summaryFields)
        .eq('arxiv_paper_id', paperId)
        .eq('processing_status', 'completed')
        .single();
      
      if (summaryError && summaryError.code !== 'PGRST116') {
        console.warn('⚠️ Error fetching summary (continuing without):', summaryError);
      }
      
      // Get quiz data for this paper
      console.log('🧠 Fetching quiz data for paper:', paperId);
      const { data: quizData, error: quizError } = await supabase
        .from('v_papers_with_quizzes')
        .select('arxiv_paper_id, question, answer_a, answer_b, answer_c, answer_d, correct_answer')
        .eq('arxiv_paper_id', paperId)
        .single();
      
      if (quizError && quizError.code !== 'PGRST116') {
        console.warn('⚠️ Error fetching quiz (continuing without):', quizError);
      }
      
      // Transform summary data - fields already filtered for skill level
      let transformedSummary = null;
      if (summaryData) {
        const skillLevelLower = skillLevel.toLowerCase();
        transformedSummary = {
          title: summaryData[`${skillLevelLower}_title`],
          overview: summaryData[`${skillLevelLower}_overview`],
          summary: summaryData[`${skillLevelLower}_summary`],
          skill_level: skillLevel
        };
      }
      
      // Merge paper with summary and quiz
      const paperWithSummary = {
        ...paperData,
        summaryTitle: transformedSummary?.title || null,
        summaryOverview: transformedSummary?.overview || null,
        summaryContent: transformedSummary?.summary || null,
        skillLevel: transformedSummary?.skill_level || null,
        // Add quiz fields if available
        quiz: quizData ? {
          question: quizData.question,
          answer_a: quizData.answer_a,
          answer_b: quizData.answer_b,
          answer_c: quizData.answer_c,
          answer_d: quizData.answer_d,
          correct_answer: quizData.correct_answer
        } : null
      };
      
      console.log('✅ Retrieved paper with summary and quiz');
      return paperWithSummary;
      
    } catch (error) {
      console.error('❌ Error in getPaperWithSummary:', error);
      throw error;
    }
  },
  
  // Get papers by category - optimized with explicit fields and pagination
  async getPapersByCategory(categoryName, page = 1, limit = 200) {
    console.log(`🏷️ Fetching papers for category: ${categoryName} (page: ${page}, limit: ${limit})`);
    
    const cacheKey = `category_${categoryName}_${page}_${limit}`;
    const cached = getFromCache(cacheKey);
    if (cached) {
      console.log('📦 Retrieved category papers from cache');
      return cached;
    }
    
    const fields = 'id, title, abstract, arxiv_id, categories_name, authors, published_date, created_at, pdf_url, abstract_url';
    const { data, error } = await supabase
      .from('v_arxiv_papers')
      .select(fields)
      .contains('categories_name', [categoryName])
      .order('created_at', { ascending: false })
      .range((page - 1) * limit, page * limit - 1);
    
    if (error) {
      console.error('❌ Error fetching papers by category:', error);
      throw error;
    }
    
    // Cache the result
    setCache(cacheKey, data || [], 15);
    console.log(`✅ Found ${data?.length || 0} papers for category: ${categoryName}`);
    return data || [];
  },

  // Get papers by category with summaries
  async getPapersByCategoryWithSummaries(categoryName, skillLevel = 'Beginner') {
    console.log('🏷️ Fetching papers with summaries for category:', categoryName, 'skill level:', skillLevel);
    
    try {
      // Get papers by category
      const papersData = await this.getPapersByCategory(categoryName);
      
      // Get summaries for these papers at the specified skill level
      const paperIds = papersData.map(paper => paper.id);
      
      if (paperIds.length === 0) {
        return [];
      }
      
      const { data: summariesData, error: summariesError } = await supabase
        .from('summary_papers')
        .select('*')
        .in('arxiv_paper_id', paperIds)
        .eq('processing_status', 'completed');
      
      if (summariesError) {
        console.warn('⚠️ Error fetching summaries for category (continuing without):', summariesError);
      }
      
      // Transform and create summaries map
      const summariesMap = new Map();
      (summariesData || []).forEach(row => {
        const skillLevelLower = skillLevel.toLowerCase();
        const transformedSummary = {
          title: skillLevelLower === 'beginner' ? row.beginner_title : row.intermediate_title,
          overview: skillLevelLower === 'beginner' ? row.beginner_overview : row.intermediate_overview,
          summary: skillLevelLower === 'beginner' ? row.beginner_summary : row.intermediate_summary,
          skill_level: skillLevel
        };
        
        // Only add if there's content
        if (transformedSummary.title && transformedSummary.overview) {
          summariesMap.set(row.arxiv_paper_id, transformedSummary);
        }
      });
      
      // Merge papers with summaries
      const papersWithSummaries = papersData.map(paper => {
        const summary = summariesMap.get(paper.id);
        return {
          ...paper,
          summaryTitle: summary?.title || null,
          summaryOverview: summary?.overview || null,
          summaryContent: summary?.summary || null,
          skillLevel: summary?.skill_level || null
        };
      });
      
      console.log(`✅ Found ${papersWithSummaries.length} papers with summaries for category: ${categoryName}`);
      return papersWithSummaries;
      
    } catch (error) {
      console.error('❌ Error fetching papers by category with summaries:', error);
      // Fallback to regular category search
      return await this.getPapersByCategory(categoryName);
    }
  },
  
  // Search papers - optimized with explicit fields and limits
  async searchPapers(searchTerm, limit = 100) {
    console.log(`🔍 Searching papers for: "${searchTerm}" (limit: ${limit})`);
    
    const cacheKey = `search_${searchTerm}_${limit}`;
    const cached = getFromCache(cacheKey);
    if (cached) {
      console.log('📦 Retrieved search results from cache');
      return cached;
    }
    
    const fields = 'id, title, abstract, arxiv_id, categories_name, authors, published_date, created_at, pdf_url, abstract_url';
    const { data, error } = await supabase
      .from('v_arxiv_papers')
      .select(fields)
      .or(`title.ilike.%${searchTerm}%,abstract.ilike.%${searchTerm}%`)
      .order('created_at', { ascending: false })
      .limit(limit);
    
    if (error) {
      console.error('❌ Error searching papers:', error);
      throw error;
    }
    
    // Cache the result
    setCache(cacheKey, data || [], 10); // Shorter cache for search results
    console.log(`✅ Search found ${data?.length || 0} papers`);
    return data || [];
  },

  // Search papers with summaries
  async searchPapersWithSummaries(searchTerm, skillLevel = 'Beginner') {
    console.log('🔍 Searching papers with summaries for:', searchTerm, 'skill level:', skillLevel);
    
    try {
      // Search papers
      const papersData = await this.searchPapers(searchTerm);
      
      // Get summaries for search results
      const paperIds = papersData.map(paper => paper.id);
      
      if (paperIds.length === 0) {
        return [];
      }
      
      const { data: summariesData, error: summariesError } = await supabase
        .from('summary_papers')
        .select('*')
        .in('arxiv_paper_id', paperIds)
        .eq('processing_status', 'completed');
      
      if (summariesError) {
        console.warn('⚠️ Error fetching summaries for search (continuing without):', summariesError);
      }
      
      // Transform and create summaries map
      const summariesMap = new Map();
      (summariesData || []).forEach(row => {
        const skillLevelLower = skillLevel.toLowerCase();
        const transformedSummary = {
          title: skillLevelLower === 'beginner' ? row.beginner_title : row.intermediate_title,
          overview: skillLevelLower === 'beginner' ? row.beginner_overview : row.intermediate_overview,
          summary: skillLevelLower === 'beginner' ? row.beginner_summary : row.intermediate_summary,
          skill_level: skillLevel
        };
        
        // Only add if there's content
        if (transformedSummary.title && transformedSummary.overview) {
          summariesMap.set(row.arxiv_paper_id, transformedSummary);
        }
      });
      
      // Merge papers with summaries
      const papersWithSummaries = papersData.map(paper => {
        const summary = summariesMap.get(paper.id);
        return {
          ...paper,
          summaryTitle: summary?.title || null,
          summaryOverview: summary?.overview || null,
          summaryContent: summary?.summary || null,
          skillLevel: summary?.skill_level || null
        };
      });
      
      console.log(`✅ Search found ${papersWithSummaries.length} papers with summaries`);
      return papersWithSummaries;
      
    } catch (error) {
      console.error('❌ Error searching papers with summaries:', error);
      // Fallback to regular search
      return await this.searchPapers(searchTerm);
    }
  },
  
  // Get categories from arxiv_categories table
  async getCategories() {
    console.log('📋 Fetching categories from arxiv_categories...');
    const { data, error } = await supabase
      .from('arxiv_categories')
      .select('subject_class, category_name')
      .order('category_name');
    
    if (error) {
      console.error('❌ Error fetching categories:', error);
      // Fallback to extracting from papers
      return this.getCategoriesFromPapers();
    }
    
    console.log(`📋 Found ${data?.length || 0} categories from arxiv_categories table`);
    return data || [];
  },

  // Fallback: Get categories from papers if arxiv_categories table is not available
  async getCategoriesFromPapers() {
    console.log('📋 Fallback: Fetching categories from v_arxiv_papers...');
    const { data, error } = await supabase
      .from('v_arxiv_papers')
      .select('categories_name')
      .not('categories_name', 'is', null);
    
    if (error) {
      console.error('❌ Error fetching categories from papers:', error);
      throw error;
    }
    
    // Flatten all categories from arrays and convert to expected format
    const allCategories = new Set();
    data.forEach(item => {
      if (Array.isArray(item.categories_name)) {
        item.categories_name.forEach(cat => allCategories.add(cat));
      }
    });
    
    // Convert to format matching arxiv_categories table
    const categories = [...allCategories].map(categoryName => ({
      subject_class: categoryName.toLowerCase().replace(/\s+/g, '_'),
      category_name: categoryName
    }));
    
    console.log('📋 Extracted categories from papers:', categories.length);
    return categories;
  },

  // Lazy load paper details (abstract, full content) when needed
  async getPaperDetails(paperId) {
    console.log('📄 Lazy loading paper details for ID:', paperId);
    
    const cacheKey = `paper_details_${paperId}`;
    const cached = getFromCache(cacheKey);
    if (cached) {
      console.log('📦 Retrieved paper details from cache');
      return cached;
    }
    
    // Only load what's needed for details view
    const { data, error } = await supabase
      .from('v_arxiv_papers')
      .select('id, abstract, pdf_url, abstract_url')
      .eq('id', paperId)
      .single();
    
    if (error) {
      console.error('❌ Error fetching paper details:', error);
      throw error;
    }
    
    // Cache for longer since details don't change often
    setCache(cacheKey, data, 60);
    console.log('✅ Retrieved and cached paper details');
    return data;
  },

  // Cache management
  clearCache,
  getFromCache,
  setCache
};

// Authentication API
export const authAPI = {
  async signUp(email, password, userData = {}) {
    console.log('🔐 Signing up user:', email, 'with userData:', userData);
    const { data, error } = await supabase.auth.signUp({ email, password });
    
    if (error) {
      console.error('❌ Signup error:', error);
      throw error;
    }
    
    console.log('✅ Signup successful:', data);
    console.log('🔍 User object:', data.user);
    console.log('🔍 Session object:', data.session);
    
    // Store userData for profile creation after email verification
    if (data.user && userData.name) {
      try {
        console.log('📝 Creating profile for user:', data.user.id);
        console.log('📝 Profile data to be saved:', {
          name: userData.name,
          title: userData.title,
          institution: userData.institution,
          researchInterests: userData.researchInterests
        });
        
        const profileResult = await this.createProfile(data.user.id, userData);
        console.log('✅ Profile created successfully during signup:', profileResult);
      } catch (profileError) {
        console.error('❌ Error creating profile during signup:', profileError);
        console.error('❌ Profile error details:', profileError.message);
        console.error('❌ Profile error code:', profileError.code);
        
        // Store signup data for later profile creation
        try {
          const signupData = {
            userId: data.user.id,
            name: userData.name,
            title: userData.title,
            institution: userData.institution,
            researchInterests: userData.researchInterests,
            timestamp: Date.now()
          };
          localStorage.setItem(`pendingProfile_${data.user.id}`, JSON.stringify(signupData));
          console.log('💾 Stored signup data for later profile creation:', signupData);
        } catch (storageError) {
          console.error('❌ Error storing signup data:', storageError);
        }
      }
    } else {
      console.log('⚠️ No userData.name provided or no user created, skipping profile creation');
      console.log('⚠️ data.user:', !!data.user);
      console.log('⚠️ userData.name:', userData.name);
    }
    
    return data;
  },

  async signIn(email, password) {
    console.log('🔐 Signing in user:', email);
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    
    if (error) {
      console.error('❌ Sign in error:', error);
      throw error;
    }
    
    console.log('✅ Sign in successful:', data);
    return data;
  },

  async signOut() {
    console.log('🔐 Signing out user');
    const { error } = await supabase.auth.signOut();
    
    if (error) {
      console.error('❌ Sign out error:', error);
      throw error;
    }
    
    console.log('✅ Sign out successful');
  },

  async getCurrentUser() {
    try {
      const { data: { user }, error } = await supabase.auth.getUser();
      
      if (error) {
        console.error('❌ Error getting current user:', error);
        return null;
      }
      
      console.log('👤 Current user:', user?.email || 'None');
      return user;
    } catch (error) {
      console.error('❌ Error in getCurrentUser:', error);
      return null;
    }
  },

  async getCurrentSession() {
    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error) {
        console.error('❌ Error getting current session:', error);
        return { data: { session: null } };
      }
      
      console.log('🎫 Current session:', session?.user?.email || 'None');
      return { data: { session } };
    } catch (error) {
      console.error('❌ Error in getCurrentSession:', error);
      return { data: { session: null } };
    }
  },

  async createProfile(userId, userData) {
    console.log('📝 Creating profile for userId:', userId, 'with data:', userData);
    
    const profileData = {
      id: userId,
      full_name: userData.name || '',
      professional_title: userData.title || '',
      institution: userData.institution || '',
      research_interests: userData.researchInterests || [],
      skill_level: userData.skillLevel || 'Beginner'
    };
    
    console.log('📝 Inserting profile data:', profileData);
    
    const { data, error } = await supabase
      .from('profiles')
      .insert(profileData)
      .select()
      .single();
    
    if (error) {
      console.error('❌ Profile creation error:', error);
      throw error;
    }
    
    console.log('✅ Profile created:', data);
    return data;
  },

  async getProfile(userId) {
    console.log('📋 Getting profile for userId:', userId);
    
    // Only select essential profile fields
    const { data, error } = await supabase
      .from('profiles')
      .select('id, full_name, professional_title, institution, research_interests, skill_level, created_at')
      .eq('id', userId)
      .single();
    
    if (error) {
      if (error.code === 'PGRST116') {
        console.log('📋 No profile found for user:', userId);
        return null;
      }
      console.error('❌ Error getting profile:', error);
      throw error;
    }
    
    console.log('✅ Profile found:', data);
    return data;
  },

  async updateProfile(userId, updates) {
    console.log('📝 Updating profile for userId:', userId, 'with updates:', updates);
    
    const profileUpdates = {
      full_name: updates.name,
      professional_title: updates.title,
      institution: updates.institution,
      research_interests: updates.research_interests,
      skill_level: updates.skill_level
    };
    
    console.log('📝 Updating with data:', profileUpdates);
    
    const { data, error } = await supabase
      .from('profiles')
      .update(profileUpdates)
      .eq('id', userId)
      .select()
      .single();
    
    if (error) {
      console.error('❌ Profile update error:', error);
      throw error;
    }
    
    console.log('✅ Profile updated:', data);
    return data;
  },

  async ensureProfile(userId, userData) {
    try {
      let profile = await this.getProfile(userId);
      
      if (!profile) {
        profile = await this.createProfile(userId, userData);
      }
      
      return profile;
    } catch (error) {
      console.error('❌ Error ensuring profile:', error);
      throw error;
    }
  },

  onAuthStateChange(callback) {
    console.log('👂 Setting up auth state change listener');
    return supabase.auth.onAuthStateChange(callback);
  },

  async resetPassword(email) {
    console.log('🔄 Resetting password for:', email);
    const { error } = await supabase.auth.resetPasswordForEmail(email);
    
    if (error) {
      console.error('❌ Password reset error:', error);
      throw error;
    }
    
    console.log('✅ Password reset email sent');
  }
};

// Saved Articles API
export const savedArticlesAPI = {
  async getUserSavedArticles(userId) {
    console.log('📚 Getting saved articles for user:', userId);
    try {
       const { data, error } = await supabase
         .from('saved_articles')
         .select('id, user_id, article_id, saved_at')
         .eq('user_id', userId)
         .order('saved_at', { ascending: false });
      
      if (error) {
        console.error('❌ Error fetching saved articles:', error);
        return [];
      }
      
      console.log(`✅ Retrieved ${data?.length || 0} saved articles`);
      return data || [];
    } catch (error) {
      console.error('❌ Exception in getUserSavedArticles:', error);
      return [];
    }
  },

  async getUserSavedArticlesWithDetails(userId, userSkillLevel = 'Beginner') {
    console.log('📚 Getting saved articles with details for user:', userId, 'skill level:', userSkillLevel);
    try {
      // First, let's check what saved articles we have
      const savedArticles = await this.getUserSavedArticles(userId);
      console.log(`📚 User has ${savedArticles.length} saved articles:`, savedArticles.map(s => s.article_id));
      
      if (savedArticles.length === 0) {
        return [];
      }
      
      // Get summaries and papers separately to avoid view issues
      console.log('📚 Getting summaries and papers for saved articles...');
      
       // Get summaries for saved articles - use direct approach instead of view
       const skillPrefix = userSkillLevel.toLowerCase();
       const summaryFields = `id, arxiv_paper_id, ${skillPrefix}_title, ${skillPrefix}_overview, ${skillPrefix}_summary`;
       
       const { data: summaryResults, error: summaryError } = await supabase
         .from('summary_papers')
         .select(summaryFields)
         .in('arxiv_paper_id', savedArticles.map(s => Number(s.article_id)))
         .eq('processing_status', 'completed');
      
      console.log(`📝 Found ${summaryResults?.length || 0} summary records with article data`);
      if (summaryError) {
        console.error('❌ Error fetching summaries with articles:', summaryError);
      }
      
      // Debug: Show what summary data we actually got
      if (summaryResults && summaryResults.length > 0) {
        console.log('🔍 Sample summary record structure:');
        const sample = summaryResults[0];
        console.log('Summary keys:', Object.keys(sample));
        console.log(`Sample summary fields for skill ${userSkillLevel}:`, {
          [`${userSkillLevel.toLowerCase()}_title`]: sample[`${userSkillLevel.toLowerCase()}_title`]?.substring(0, 50),
          [`${userSkillLevel.toLowerCase()}_overview`]: sample[`${userSkillLevel.toLowerCase()}_overview`]?.substring(0, 50),
          arxiv_paper_id: sample.arxiv_paper_id,
          skill_level: sample.skill_level
        });
      }
      
       // Fallback: get essential article data from v_arxiv_papers for articles without summaries
       const { data: basicArticles, error: basicError } = await supabase
         .from('v_arxiv_papers')
         .select('id, title, abstract, arxiv_id, categories_name, authors, published_date, created_at, pdf_url, abstract_url')
         .in('id', savedArticles.map(s => Number(s.article_id)));
        
      console.log(`📄 Found ${basicArticles?.length || 0} basic article records`);
      if (basicError) {
        console.error('❌ Error fetching basic articles:', basicError);
      }
      
      // Create maps for quick lookup
      const summaryMap = new Map();
      (summaryResults || []).forEach(summaryRecord => {
        summaryMap.set(Number(summaryRecord.arxiv_paper_id), summaryRecord);
      });
      
      const basicMap = new Map();
      (basicArticles || []).forEach(article => {
        basicMap.set(Number(article.id), article);
      });
      
      // Merge saved articles with their details and summaries
      const articlesWithDetails = savedArticles.map(saved => {
        const articleId = Number(saved.article_id);
        const summaryData = summaryMap.get(articleId);
        const basicArticle = basicMap.get(articleId);
        
        if (!summaryData && !basicArticle) {
          console.warn(`⚠️ Could not find any data for saved article ID: ${saved.article_id}`);
          return null;
        }
        
        // Use summary + article data if available, otherwise basic article data
        const summary = summaryData;
        const article = basicArticle;
        
        // Get the correct field names based on skill level
        const skillPrefix = userSkillLevel.toLowerCase();
        const summaryTitle = summary?.[`${skillPrefix}_title`];
        const summaryOverview = summary?.[`${skillPrefix}_overview`];
        const summaryContent = summary?.[`${skillPrefix}_summary`];
        
        console.log(`🔍 Article ${articleId}: skillLevel=${userSkillLevel}, prefix=${skillPrefix}`);
        console.log(`🔍 Summary fields: title="${summaryTitle?.substring(0,30)}...", overview="${summaryOverview?.substring(0,30)}..."`);
        console.log(`🔍 Original title: "${article?.title?.substring(0,30)}..."`);

        return {
          id: articleId,
          savedAt: saved.saved_at,
          // Use skill-level content if available
          title: summaryTitle || article?.title || 'Untitled',
          shortDescription: summaryOverview || (article?.abstract?.substring(0, 200) + '...') || 'No description available',
          originalTitle: article?.title || 'Untitled',
          originalAbstract: article?.abstract || 'No abstract available',
          summaryContent: summaryContent || null,
          hasSummary: !!(summaryTitle || summaryOverview || summaryContent),
          skillLevel: userSkillLevel,
          category: Array.isArray(article?.categories_name) && article.categories_name.length > 0 
            ? article.categories_name[0] 
            : 'General',
          categories: Array.isArray(article?.categories_name) ? article.categories_name : [article?.categories_name || 'General'],
          arxivId: article?.arxiv_id || '',
          url: article?.pdf_url || article?.abstract_url || `https://arxiv.org/pdf/${article?.arxiv_id}`,
          authors: Array.isArray(article?.authors) ? article.authors.join(', ') : (article?.authors || 'Unknown Authors'),
          publishedDate: article?.published_date || article?.created_at,
          tags: Array.isArray(article?.categories_name) ? article.categories_name : []
        };
      }).filter(Boolean);
      
      const withSummaries = articlesWithDetails.filter(a => a.hasSummary).length;
      console.log(`✅ Retrieved ${articlesWithDetails.length} saved articles (${withSummaries} with skill-level summaries, ${articlesWithDetails.length - withSummaries} with basic data)`);
      return articlesWithDetails;
      
    } catch (error) {
      console.error('❌ Exception in getUserSavedArticlesWithDetails:', error);
      return [];
    }
  },

  // Get all saved article IDs for a user
  async getUserSavedArticleIds(userId) {
    console.log('📚 Getting saved article IDs for user:', userId);
    
    const { data, error } = await supabase
      .from('saved_articles')
      .select('article_id')
      .eq('user_id', userId)
      .order('saved_at', { ascending: false });
    
    if (error) {
      console.error('❌ Error fetching saved article IDs:', error);
      return [];
    }
    
    // Convert string IDs back to numbers to match main articles
    const articleIds = (data || []).map(item => {
      const id = item.article_id;
      // Try to convert to number, keep as string if it fails
      const numId = Number(id);
      return isNaN(numId) ? id : numId;
    });
    
    console.log('✅ Retrieved and converted saved article IDs:', articleIds);
    return articleIds;
  },

  async saveArticle(userId, articleId) {
    console.log('💾 Saving article:', articleId, 'for user:', userId);
    
    // Convert articleId to string for consistency with TEXT field
    const articleIdStr = String(articleId);
    
    try {
      const { data, error } = await supabase
        .from('saved_articles')
        .insert({
          user_id: userId,
          article_id: articleIdStr
        })
        .select()
        .single();
      
      if (error) {
        // Handle duplicate key error gracefully
        if (error.code === '23505') {
          console.log('ℹ️ Article already saved');
          return { success: true, message: 'Article already saved' };
        }
        console.error('❌ Error saving article:', error);
        throw error;
      }
      
      console.log('✅ Article saved successfully:', data);
      return { success: true, data };
    } catch (error) {
      console.error('❌ Exception in saveArticle:', error);
      throw error;
    }
  },

  async unsaveArticle(userId, articleId) {
    console.log('🗑️ Unsaving article:', articleId, 'for user:', userId);
    
    // Convert articleId to string for consistency with TEXT field
    const articleIdStr = String(articleId);
    
    try {
      const { error } = await supabase
        .from('saved_articles')
        .delete()
        .eq('user_id', userId)
        .eq('article_id', articleIdStr);
      
      if (error) {
        console.error('❌ Error unsaving article:', error);
        throw error;
      }
      
      console.log('✅ Article unsaved successfully');
      return { success: true };
    } catch (error) {
      console.error('❌ Exception in unsaveArticle:', error);
      throw error;
    }
  },

  async isArticleSaved(userId, articleId) {
    // Convert articleId to string for consistency with TEXT field
    const articleIdStr = String(articleId);
    
    try {
      const { data, error } = await supabase
        .from('saved_articles')
        .select('id')
        .eq('user_id', userId)
        .eq('article_id', articleIdStr)
        .single();
      
      if (error && error.code !== 'PGRST116') {
        console.error('❌ Error checking if article is saved:', error);
        return false;
      }
      
      return !!data;
    } catch (error) {
      console.error('❌ Exception in isArticleSaved:', error);
      return false;
    }
  },

  async getSavedArticlesCount(userId) {
    try {
      const { count, error } = await supabase
        .from('saved_articles')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId);
      
      if (error) {
        console.error('❌ Error getting saved articles count:', error);
        return 0;
      }
      
      return count || 0;
    } catch (error) {
      console.error('❌ Exception in getSavedArticlesCount:', error);
      return 0;
    }
  }
};

// Email API for sending contact emails via Supabase Edge Function
export const emailAPI = {
  async sendContactEmail(name, email, subject, message) {
    try {
      console.log('📧 Sending contact email via Supabase Edge Function...');
      
      // Call the Supabase Edge Function
      const { data, error } = await supabase.functions.invoke('send-contact-email', {
        body: {
          name: name.trim(),
          email: email.trim(),
          subject: subject.trim(),
          message: message.trim()
        }
      });

      if (error) {
        console.error('❌ Supabase Edge Function error:', error);
        throw new Error(error.message || 'Failed to send email');
      }

      if (!data || !data.success) {
        console.error('❌ Edge Function returned unsuccessful response:', data);
        throw new Error(data?.error || 'Failed to send email');
      }

      console.log('✅ Email sent successfully via Edge Function:', data.id);
      return data;

    } catch (error) {
      console.error('❌ Email sending failed:', error);
      throw new Error(error.message || 'Failed to send email. Please try again.');
    }
  }
};

// Viewed Articles API - for tracking and analytics (supports both authenticated and anonymous users)
export const viewedArticlesAPI = {
  // Generate or retrieve session ID for anonymous users
  getSessionId() {
    let sessionId = localStorage.getItem('pearadox_session_id');
    if (!sessionId) {
      sessionId = `anon_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      localStorage.setItem('pearadox_session_id', sessionId);
    }
    return sessionId;
  },

  // Generate anonymous user ID (persists across sessions)
  getAnonymousId() {
    let anonymousId = localStorage.getItem('pearadox_anonymous_id');
    if (!anonymousId) {
      anonymousId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      localStorage.setItem('pearadox_anonymous_id', anonymousId);
    }
    return anonymousId;
  },

  // Get basic device/browser info for analytics
  getUserAgent() {
    return navigator.userAgent || 'Unknown';
  },

  async recordArticleView(userId, article, userSkillLevel = 'Beginner') {
    const isAuthenticated = !!userId;
    const sessionId = this.getSessionId();
    const anonymousId = isAuthenticated ? null : this.getAnonymousId();
    
    console.log('👁️ Recording article view:', {
      userId: userId || 'anonymous',
      articleId: article.id,
      arxivId: article.arxivId,
      category: article.category,
      skillLevel: userSkillLevel,
      isAuthenticated,
      sessionId: sessionId.substring(0, 20) + '...' // Log partial session ID
    });
    
    try {
      const viewData = {
        user_id: userId || null,
        article_id: String(article.id), // Ensure it's a string
        arxiv_id: article.arxivId || null,
        category: article.category || 'General',
        skill_level: userSkillLevel,
        session_id: sessionId,
        source: 'web',
        is_authenticated: isAuthenticated,
        anonymous_id: anonymousId,
        user_agent: this.getUserAgent()
      };
      
      const { data, error } = await supabase
        .from('viewed_articles')
        .insert([viewData])
        .select()
        .single();
      
      if (error) {
        // Check if it's a duplicate entry (unique constraint violation)
        if (error.code === '23505') {
          console.log('ℹ️ Article view already recorded for this hour, skipping...');
          return { success: true, isDuplicate: true };
        }
        console.error('❌ Error recording article view:', error);
        throw error;
      }
      
      console.log('✅ Article view recorded successfully:', data);
      return { success: true, data, isDuplicate: false };
    } catch (error) {
      console.error('❌ Exception in recordArticleView:', error);
      // Don't throw the error - we don't want to break the user experience
      // if analytics tracking fails
      return { success: false, error: error.message };
    }
  },

  async recordBlogPostView(userId, blogPost, source = 'blog') {
    const isAuthenticated = !!userId;
    const sessionId = this.getSessionId();
    const anonymousId = isAuthenticated ? null : this.getAnonymousId();
    
    console.log('📝 Recording blog post view:', {
      userId: userId || 'anonymous',
      blogTitle: blogPost.title,
      blogSlug: blogPost.slug,
      isAuthenticated,
      source,
      sessionId: sessionId.substring(0, 20) + '...' // Log partial session ID
    });
    
    try {
      const viewData = {
        user_id: userId || null,
        article_id: 'blog', // Set article_id as 'blog'
        arxiv_id: 'blog', // Set arxiv_id as 'blog'
        category: blogPost.title, // Store blog title in category field
        skill_level: 'Beginner', // Use valid skill level (Beginner or Intermediate)
        session_id: sessionId,
        source: source, // 'blog' for preview clicks, 'blog_post' for full article views
        is_authenticated: isAuthenticated,
        anonymous_id: anonymousId,
        user_agent: this.getUserAgent()
      };
      
      const { data, error } = await supabase
        .from('viewed_articles')
        .insert([viewData])
        .select()
        .single();
      
      if (error) {
        // Check if it's a duplicate entry (unique constraint violation)
        if (error.code === '23505') {
          console.log('ℹ️ Blog post view already recorded for this hour, skipping...');
          return { success: true, isDuplicate: true };
        }
        console.error('❌ Error recording blog post view:', error);
        throw error;
      }
      
      console.log('✅ Blog post view recorded successfully:', data);
      return { success: true, data, isDuplicate: false };
    } catch (error) {
      console.error('❌ Exception in recordBlogPostView:', error);
      // Don't throw the error - we don't want to break the user experience
      // if analytics tracking fails
      return { success: false, error: error.message };
    }
  },

  async getUserViewedArticles(userId, limit = 50, offset = 0) {
    console.log('📊 Getting viewed articles for user:', userId);
    
    try {
      const { data, error } = await supabase
        .from('v_article_analytics')
        .select('*')
        .eq('user_id', userId)
        .order('viewed_at', { ascending: false })
        .range(offset, offset + limit - 1);
      
      if (error) {
        console.error('❌ Error getting viewed articles:', error);
        throw error;
      }
      
      console.log('✅ Retrieved viewed articles:', data?.length || 0);
      return { success: true, data: data || [] };
    } catch (error) {
      console.error('❌ Exception in getUserViewedArticles:', error);
      throw error;
    }
  },

  async getUserViewingStats(userId) {
    console.log('📈 Getting viewing stats for user:', userId);
    
    try {
      const { data, error } = await supabase
        .from('viewed_articles')
        .select('category, skill_level, viewed_at, article_id')
        .eq('user_id', userId);
      
      if (error) {
        console.error('❌ Error getting viewing stats:', error);
        throw error;
      }
      
      // Calculate statistics
      const stats = {
        totalViews: data.length,
        categoriesViewed: [...new Set(data.map(item => item.category))],
        skillLevelsUsed: [...new Set(data.map(item => item.skill_level))],
        viewsByCategory: {},
        viewsBySkillLevel: {},
        recentViews: data, // Return ALL views for weekly chart processing
        firstView: data.length > 0 ? new Date(Math.min(...data.map(item => new Date(item.viewed_at)))) : null,
        lastView: data.length > 0 ? new Date(Math.max(...data.map(item => new Date(item.viewed_at)))) : null
      };
      
      // Count views by category (exclude blog entries)
      data.forEach(item => {
        if (item.article_id !== 'blog') {
          stats.viewsByCategory[item.category] = (stats.viewsByCategory[item.category] || 0) + 1;
        }
      });
      
      // Count views by skill level
      data.forEach(item => {
        stats.viewsBySkillLevel[item.skill_level] = (stats.viewsBySkillLevel[item.skill_level] || 0) + 1;
      });
      
      console.log('✅ Calculated viewing stats:', stats);
      return { success: true, data: stats };
    } catch (error) {
      console.error('❌ Exception in getUserViewingStats:', error);
      throw error;
    }
  },

  async getGlobalViewingStats() {
    console.log('🌍 Getting global viewing stats');
    
    try {
      const { data, error } = await supabase
        .from('viewed_articles')
        .select('category, skill_level, viewed_at, user_id, session_id, is_authenticated, anonymous_id');
      
      if (error) {
        console.error('❌ Error getting global viewing stats:', error);
        throw error;
      }
      
      // Calculate global statistics
      const authenticatedUsers = [...new Set(data.filter(item => item.is_authenticated && item.user_id).map(item => item.user_id))];
      const anonymousUsers = [...new Set(data.filter(item => !item.is_authenticated && item.anonymous_id).map(item => item.anonymous_id))];
      const uniqueSessions = [...new Set(data.map(item => item.session_id))];
      
      const stats = {
        totalViews: data.length,
        authenticatedViews: data.filter(item => item.is_authenticated).length,
        anonymousViews: data.filter(item => !item.is_authenticated).length,
        uniqueUsers: authenticatedUsers.length,
        uniqueAnonymousUsers: anonymousUsers.length,
        totalUniqueVisitors: authenticatedUsers.length + anonymousUsers.length,
        uniqueSessions: uniqueSessions.length,
        categoriesViewed: [...new Set(data.map(item => item.category))],
        skillLevelsUsed: [...new Set(data.map(item => item.skill_level))],
        viewsByCategory: {},
        viewsBySkillLevel: {},
        viewsByUserType: {
          authenticated: data.filter(item => item.is_authenticated).length,
          anonymous: data.filter(item => !item.is_authenticated).length
        },
        viewsLast7Days: 0,
        viewsLast30Days: 0,
        authConversionRate: 0 // percentage of sessions that resulted in authentication
      };
      
      const now = new Date();
      const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      
      data.forEach(item => {
        const viewDate = new Date(item.viewed_at);
        
        // Count by category
        stats.viewsByCategory[item.category] = (stats.viewsByCategory[item.category] || 0) + 1;
        
        // Count by skill level
        stats.viewsBySkillLevel[item.skill_level] = (stats.viewsBySkillLevel[item.skill_level] || 0) + 1;
        
        // Count recent views
        if (viewDate >= sevenDaysAgo) {
          stats.viewsLast7Days++;
        }
        if (viewDate >= thirtyDaysAgo) {
          stats.viewsLast30Days++;
        }
      });
      
      // Calculate conversion rate (authenticated users / total unique visitors)
      if (stats.totalUniqueVisitors > 0) {
        stats.authConversionRate = ((stats.uniqueUsers / stats.totalUniqueVisitors) * 100).toFixed(2);
      }
      
      console.log('✅ Calculated global viewing stats:', stats);
      return { success: true, data: stats };
    } catch (error) {
      console.error('❌ Exception in getGlobalViewingStats:', error);
      throw error;
    }
  }
};

// Article Comments API - Optimized for minimal egress
export const commentsAPI = {
  // Get comments for a specific article with minimal data transfer
  async getArticleComments(articleId, limit = 50, offset = 0) {
    console.log(`💬 Fetching comments for article ${articleId} (limit: ${limit}, offset: ${offset})`);
    
    try {
      const { data, error } = await supabase
        .from('v_article_comments')
        .select('id, user_id, comment_text, created_at, is_edited, user_name, user_title')
        .eq('article_id', articleId)
        .order('created_at', { ascending: true })
        .range(offset, offset + limit - 1);

      if (error) {
        console.error('❌ Error fetching comments:', error);
        throw error;
      }

      console.log(`✅ Retrieved ${data?.length || 0} comments for article ${articleId}`);
      return data || [];
    } catch (error) {
      console.error('❌ Exception in getArticleComments:', error);
      throw error;
    }
  },

  // Get comment count for an article (very efficient - no data transfer)
  async getArticleCommentCount(articleId) {
    console.log(`🔢 Getting comment count for article ${articleId}`);
    
    try {
      const { data, error } = await supabase
        .rpc('get_article_comment_count', { target_article_id: articleId });

      if (error) {
        console.error('❌ Error getting comment count:', error);
        throw error;
      }

      const count = data || 0;
      console.log(`✅ Article ${articleId} has ${count} comments`);
      return count;
    } catch (error) {
      console.error('❌ Exception in getArticleCommentCount:', error);
      return 0; // Return 0 on error rather than throwing
    }
  },

  // Add a new comment (authenticated users only)
  async addComment(articleId, userId, commentText) {
    if (!userId) {
      throw new Error('User must be authenticated to add comments');
    }

    if (!commentText || commentText.trim().length === 0) {
      throw new Error('Comment text cannot be empty');
    }

    if (commentText.length > 2000) {
      throw new Error('Comment text cannot exceed 2000 characters');
    }

    console.log(`💬 Adding comment to article ${articleId} by user ${userId}`);
    
    try {
      const { data, error } = await supabase
        .from('article_comments')
        .insert([{
          article_id: articleId,
          user_id: userId,
          comment_text: commentText.trim()
        }])
        .select('id, created_at')
        .single();

      if (error) {
        console.error('❌ Error adding comment:', error);
        throw error;
      }

      console.log(`✅ Comment added successfully with ID: ${data.id}`);
      return data;
    } catch (error) {
      console.error('❌ Exception in addComment:', error);
      throw error;
    }
  },

  // Update a comment (user's own comments only)
  async updateComment(commentId, userId, newCommentText) {
    if (!userId) {
      throw new Error('User must be authenticated to update comments');
    }

    if (!newCommentText || newCommentText.trim().length === 0) {
      throw new Error('Comment text cannot be empty');
    }

    if (newCommentText.length > 2000) {
      throw new Error('Comment text cannot exceed 2000 characters');
    }

    console.log(`✏️ Updating comment ${commentId} by user ${userId}`);
    
    try {
      const { data, error } = await supabase
        .from('article_comments')
        .update({ comment_text: newCommentText.trim() })
        .eq('id', commentId)
        .eq('user_id', userId)
        .eq('is_deleted', false)
        .select('updated_at, is_edited')
        .single();

      if (error) {
        console.error('❌ Error updating comment:', error);
        throw error;
      }

      if (!data) {
        throw new Error('Comment not found or you do not have permission to edit it');
      }

      console.log(`✅ Comment ${commentId} updated successfully`);
      return data;
    } catch (error) {
      console.error('❌ Exception in updateComment:', error);
      throw error;
    }
  },

  // Delete a comment (soft delete - user's own comments only)
  async deleteComment(commentId, userId) {
    if (!userId) {
      throw new Error('User must be authenticated to delete comments');
    }

    console.log(`🗑️ Soft deleting comment ${commentId} by user ${userId}`);
    
    try {
      const { data, error } = await supabase
        .from('article_comments')
        .update({ is_deleted: true })
        .eq('id', commentId)
        .eq('user_id', userId)
        .select('id')
        .single();

      if (error) {
        console.error('❌ Error deleting comment:', error);
        throw error;
      }

      if (!data) {
        throw new Error('Comment not found or you do not have permission to delete it');
      }

      console.log(`✅ Comment ${commentId} deleted successfully`);
      return data;
    } catch (error) {
      console.error('❌ Exception in deleteComment:', error);
      throw error;
    }
  },

  // Get comments with pagination metadata
  async getArticleCommentsWithPagination(articleId, page = 1, limit = 20) {
    const offset = (page - 1) * limit;
    
    try {
      const [comments, totalCount] = await Promise.all([
        this.getArticleComments(articleId, limit, offset),
        this.getArticleCommentCount(articleId)
      ]);

      const totalPages = Math.ceil(totalCount / limit);
      const hasNextPage = page < totalPages;
      const hasPrevPage = page > 1;

      return {
        comments,
        pagination: {
          currentPage: page,
          totalPages,
          totalCount,
          hasNextPage,
          hasPrevPage,
          limit
        }
      };
    } catch (error) {
      console.error('❌ Exception in getArticleCommentsWithPagination:', error);
      throw error;
    }
  }
};

// Quiz API - Track correct answers
export const quizAPI = {
  /**
   * Record a correct quiz answer for a user
   * @param {string} userId - UUID of the authenticated user
   * @param {number} arxivPaperId - Internal paper ID from v_arxiv_papers.id
   * @param {string} arxivId - ArXiv ID string (e.g., "2301.12345")
   * @returns {Promise<Object>} The created record or error
   */
  async recordCorrectAnswer(userId, arxivPaperId, arxivId) {
    try {
      console.log('🎯 Recording correct quiz answer:', { userId, arxivPaperId, arxivId });
      
      if (!userId) {
        console.error('❌ Cannot record quiz answer: user not authenticated');
        throw new Error('User must be authenticated to record quiz answers');
      }
      
      if (!arxivPaperId || !arxivId) {
        console.error('❌ Cannot record quiz answer: missing paper information');
        throw new Error('Paper ID and ArXiv ID are required');
      }
      
      const { data, error } = await supabase
        .from('quiz_correct_answers')
        .insert({
          user_id: userId,
          arxiv_paper_id: arxivPaperId,
          arxiv_id: arxivId,
          answered_at: new Date().toISOString()
        })
        .select()
        .single();
      
      if (error) {
        // Check if it's a unique constraint violation (user already answered correctly)
        if (error.code === '23505') {
          console.log('ℹ️ User already has a correct answer recorded for this quiz');
          return { 
            success: true, 
            alreadyRecorded: true,
            message: 'Answer already recorded'
          };
        }
        
        console.error('❌ Error recording correct answer:', error);
        throw error;
      }
      
      console.log('✅ Correct answer recorded successfully');
      return { 
        success: true, 
        data,
        alreadyRecorded: false 
      };
      
    } catch (error) {
      console.error('❌ Exception in recordCorrectAnswer:', error);
      throw error;
    }
  },
  
  /**
   * Get all correct answers for a user
   * @param {string} userId - UUID of the authenticated user
   * @returns {Promise<Array>} Array of correct answers
   */
  async getUserCorrectAnswers(userId) {
    try {
      console.log('📊 Fetching correct answers for user:', userId);
      
      if (!userId) {
        return [];
      }
      
      const { data, error } = await supabase
        .from('quiz_correct_answers')
        .select('*')
        .eq('user_id', userId)
        .order('answered_at', { ascending: false });
      
      if (error) {
        console.error('❌ Error fetching user correct answers:', error);
        throw error;
      }
      
      console.log(`✅ Found ${data?.length || 0} correct answers for user`);
      return data || [];
      
    } catch (error) {
      console.error('❌ Exception in getUserCorrectAnswers:', error);
      throw error;
    }
  },
  
  /**
   * Check if a user has answered a specific quiz correctly
   * @param {string} userId - UUID of the authenticated user
   * @param {number} arxivPaperId - Internal paper ID
   * @returns {Promise<boolean>} True if user has answered correctly
   */
  async hasUserAnsweredCorrectly(userId, arxivPaperId) {
    try {
      if (!userId || !arxivPaperId) {
        return false;
      }
      
      const { data, error } = await supabase
        .from('quiz_correct_answers')
        .select('id')
        .eq('user_id', userId)
        .eq('arxiv_paper_id', arxivPaperId)
        .single();
      
      if (error && error.code !== 'PGRST116') {
        console.error('❌ Error checking if user answered correctly:', error);
        return false;
      }
      
      return !!data;
      
    } catch (error) {
      console.error('❌ Exception in hasUserAnsweredCorrectly:', error);
      return false;
    }
  },
  
  /**
   * Get count of correct answers for a specific quiz (across all users)
   * @param {number} arxivPaperId - Internal paper ID
   * @returns {Promise<number>} Count of users who answered correctly
   */
  async getQuizCorrectCount(arxivPaperId) {
    try {
      const { count, error } = await supabase
        .from('quiz_correct_answers')
        .select('*', { count: 'exact', head: true })
        .eq('arxiv_paper_id', arxivPaperId);
      
      if (error) {
        console.error('❌ Error getting quiz correct count:', error);
        return 0;
      }
      
      return count || 0;
      
    } catch (error) {
      console.error('❌ Exception in getQuizCorrectCount:', error);
      return 0;
    }
  }
};

// Run initial test
testConnection().then(result => {
  if (result.success) {
    console.log('🎉 Initial connection test successful!');
    console.log(`📊 Found ${result.count} papers in v_arxiv_papers view`);
  } else {
    console.warn('⚠️ Initial connection test failed:', result.error);
  }
}); 