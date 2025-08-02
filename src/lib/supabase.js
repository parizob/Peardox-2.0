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

// Run initial test
testConnection().then(result => {
  if (result.success) {
    console.log('🎉 Initial connection test successful!');
    console.log(`📊 Found ${result.count} papers in v_arxiv_papers view`);
  } else {
    console.warn('⚠️ Initial connection test failed:', result.error);
  }
}); 