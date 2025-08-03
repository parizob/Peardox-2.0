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

// API functions for v_arxiv_papers view
export const arxivAPI = {
  // Get all papers
  async getAllPapers() {
    console.log('📡 Fetching all papers from v_arxiv_papers...');
    const { data, error } = await supabase
      .from('v_arxiv_papers')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('❌ Error fetching papers:', error);
      throw error;
    }
    
    console.log(`✅ Retrieved ${data?.length || 0} papers`);
    return data || [];
  },

  // Get summaries by skill level from summary_papers table
  async getSummariesBySkillLevel(skillLevel = 'Beginner') {
    console.log('📝 Fetching summaries for skill level:', skillLevel);
    
    const { data, error } = await supabase
      .from('summary_papers')
      .select('*')
      .eq('processing_status', 'completed'); // Only get completed summaries
    
    if (error) {
      console.error('❌ Error fetching summaries:', error);
      throw error;
    }
    
    // Transform the data to match expected format based on skill level
    const transformedData = (data || []).map(row => {
      const skillLevelLower = skillLevel.toLowerCase();
      return {
        id: row.id,
        paper_id: row.arxiv_paper_id, // Map to the paper ID field
        skill_level: skillLevel,
        title: skillLevelLower === 'beginner' ? row.beginner_title : row.intermediate_title,
        overview: skillLevelLower === 'beginner' ? row.beginner_overview : row.intermediate_overview,
        summary: skillLevelLower === 'beginner' ? row.beginner_summary : row.intermediate_summary,
        created_at: row.created_at,
        updated_at: row.updated_at
      };
    }).filter(item => item.title && item.overview); // Only include items with content
    
    console.log(`✅ Retrieved ${transformedData.length} summaries for ${skillLevel} level`);
    return transformedData;
  },

  // Get all papers with skill-level specific summaries
  async getAllPapersWithSummaries(skillLevel = 'Beginner') {
    console.log('📡 Fetching papers with summaries for skill level:', skillLevel);
    
    try {
      // Get summaries for the specified skill level
      const summariesData = await this.getSummariesBySkillLevel(skillLevel);
      
      if (summariesData.length === 0) {
        console.log('⚠️ No summaries found, falling back to regular papers');
        return await this.getAllPapers();
      }
      
      // Get the paper IDs that have summaries
      const paperIds = summariesData.map(summary => summary.paper_id);
      
      // Fetch the corresponding papers from v_arxiv_papers
      const { data: papersData, error: papersError } = await supabase
        .from('v_arxiv_papers')
        .select('*')
        .in('id', paperIds)
        .order('created_at', { ascending: false });
      
      if (papersError) {
        console.error('❌ Error fetching papers:', papersError);
        throw papersError;
      }
      
      // Create a map of summaries by paper ID for quick lookup
      const summariesMap = new Map();
      summariesData.forEach(summary => {
        summariesMap.set(summary.paper_id, summary);
      });
      
      // Merge papers with their corresponding summaries
      const papersWithSummaries = (papersData || []).map(paper => {
        const summary = summariesMap.get(paper.id);
        return {
          ...paper,
          // Add summary fields if available
          summaryTitle: summary?.title || null,
          summaryOverview: summary?.overview || null,
          summaryContent: summary?.summary || null,
          skillLevel: summary?.skill_level || null
        };
      });
      
      console.log(`✅ Retrieved ${papersWithSummaries.length} papers with summaries for ${skillLevel} level`);
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
      // Get the paper data
      const { data: paperData, error: paperError } = await supabase
        .from('v_arxiv_papers')
        .select('*')
        .eq('id', paperId)
        .single();
      
      if (paperError) {
        console.error('❌ Error fetching paper:', paperError);
        throw paperError;
      }
      
      // Get the summary for the paper
      const { data: summaryData, error: summaryError } = await supabase
        .from('summary_papers')
        .select('*')
        .eq('arxiv_paper_id', paperId)
        .eq('processing_status', 'completed')
        .single();
      
      if (summaryError && summaryError.code !== 'PGRST116') {
        console.warn('⚠️ Error fetching summary (continuing without):', summaryError);
      }
      
      // Transform summary data based on skill level
      let transformedSummary = null;
      if (summaryData) {
        const skillLevelLower = skillLevel.toLowerCase();
        transformedSummary = {
          title: skillLevelLower === 'beginner' ? summaryData.beginner_title : summaryData.intermediate_title,
          overview: skillLevelLower === 'beginner' ? summaryData.beginner_overview : summaryData.intermediate_overview,
          summary: skillLevelLower === 'beginner' ? summaryData.beginner_summary : summaryData.intermediate_summary,
          skill_level: skillLevel
        };
      }
      
      // Merge paper with summary
      const paperWithSummary = {
        ...paperData,
        summaryTitle: transformedSummary?.title || null,
        summaryOverview: transformedSummary?.overview || null,
        summaryContent: transformedSummary?.summary || null,
        skillLevel: transformedSummary?.skill_level || null
      };
      
      console.log('✅ Retrieved paper with summary');
      return paperWithSummary;
      
    } catch (error) {
      console.error('❌ Error in getPaperWithSummary:', error);
      throw error;
    }
  },
  
  // Get papers by category using categories_name
  async getPapersByCategory(categoryName) {
    console.log('🏷️ Fetching papers for category name:', categoryName);
    const { data, error } = await supabase
      .from('v_arxiv_papers')
      .select('*')
      .contains('categories_name', [categoryName])
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('❌ Error fetching papers by category:', error);
      throw error;
    }
    
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
  
  // Search papers
  async searchPapers(searchTerm) {
    console.log('🔍 Searching papers for:', searchTerm);
    const { data, error } = await supabase
      .from('v_arxiv_papers')
      .select('*')
      .or(`title.ilike.%${searchTerm}%,abstract.ilike.%${searchTerm}%`)
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('❌ Error searching papers:', error);
      throw error;
    }
    
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
  }
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
    
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
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

// Saved Articles API - Clean Implementation
export const savedArticlesAPI = {
  // Save an article for a user
  async saveArticle(userId, articleId) {
    console.log('💾 Saving article:', articleId, 'for user:', userId);
    
    const { data, error } = await supabase
      .from('saved_articles')
      .insert({
        user_id: userId,
        article_id: articleId
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
    
    console.log('✅ Article saved successfully');
    return { success: true, data };
  },

  // Remove a saved article
  async unsaveArticle(userId, articleId) {
    console.log('🗑️ Removing saved article:', articleId, 'for user:', userId);
    
    const { error } = await supabase
      .from('saved_articles')
      .delete()
      .eq('user_id', userId)
      .eq('article_id', articleId);
    
    if (error) {
      console.error('❌ Error removing saved article:', error);
      throw error;
    }
    
    console.log('✅ Article removed successfully');
    return { success: true };
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
    
    const articleIds = (data || []).map(item => item.article_id);
    console.log('✅ Retrieved saved article IDs:', articleIds);
    return articleIds;
  },

  // Check if an article is saved
  async isArticleSaved(userId, articleId) {
    const { data, error } = await supabase
      .from('saved_articles')
      .select('id')
      .eq('user_id', userId)
      .eq('article_id', articleId)
      .single();
    
    if (error && error.code !== 'PGRST116') {
      console.error('❌ Error checking if article is saved:', error);
      return false;
    }
    
    return !!data;
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