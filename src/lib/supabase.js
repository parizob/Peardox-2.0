import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ullqyuvcyvaaiihmntnw.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVsbHF5dXZjeXZhYWlpaG1udG53Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM5OTU4MDgsImV4cCI6MjA2OTU3MTgwOH0.RpUtrcaY3QIDl66Be5XG1PzK3gJkN3B0KLw40U2bQpA';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

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

// Run initial test
testConnection().then(result => {
  if (result.success) {
    console.log('🎉 Initial connection test successful!');
    console.log(`📊 Found ${result.count} papers in v_arxiv_papers view`);
  } else {
    console.warn('⚠️ Initial connection test failed:', result.error);
  }
}); 