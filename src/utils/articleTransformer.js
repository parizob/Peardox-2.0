import { taxonomyService } from '../services/taxonomyService';

// Transform Supabase arxiv_papers data to our article format
export const transformSupabaseToArticle = (supabaseData) => {
  if (!supabaseData) return null;

  // Create simplified title from technical title
  const createSimplifiedTitle = (technicalTitle) => {
    // Basic simplification - could be enhanced with AI later
    return technicalTitle
      .replace(/^(A|An|The)\s+/i, '')
      .replace(/:\s*.*$/, '')
      .replace(/\b(Novel|New|Improved|Enhanced|Advanced|Efficient)\b/gi, '')
      .trim();
  };

  // Create simplified description from abstract
  const createSimplifiedDescription = (abstract) => {
    // Basic simplification - extract first meaningful sentence
    const sentences = abstract.split(/[.!?]+/);
    const firstSentence = sentences[0]?.trim();
    
    if (!firstSentence) return abstract.substring(0, 200) + '...';
    
    // Simplify technical language
    return firstSentence
      .replace(/\b(methodology|framework|paradigm|algorithm)\b/gi, 'approach')
      .replace(/\b(demonstrate|illustrate|show)\b/gi, 'prove')
      .replace(/\b(significant|substantial|considerable)\b/gi, 'major')
      .replace(/\b(state-of-the-art|cutting-edge)\b/gi, 'advanced')
      + '.';
  };

  // Extract publication date
  const getPublishedDate = (dateString) => {
    if (!dateString) return new Date().toLocaleDateString();
    
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch {
      return new Date().toLocaleDateString();
    }
  };

  // Get category color based on categories_name
  const getCategoryColor = (categoriesName) => {
    if (!categoriesName) return 'from-gray-500 to-gray-400';
    
    // Create a simple hash-based color assignment
    const colors = [
      'from-blue-500 to-cyan-400',
      'from-purple-500 to-pink-400', 
      'from-green-500 to-emerald-400',
      'from-orange-500 to-yellow-400',
      'from-indigo-500 to-purple-400',
      'from-red-500 to-pink-400',
      'from-teal-500 to-green-400',
      'from-pink-500 to-rose-400',
      'from-emerald-500 to-blue-400',
      'from-violet-500 to-indigo-400',
      'from-cyan-500 to-teal-400',
      'from-slate-500 to-gray-400',
      'from-blue-600 to-indigo-500',
      'from-yellow-500 to-orange-400',
      'from-purple-600 to-pink-500'
    ];
    
    // Simple hash function to assign consistent colors
    let hash = 0;
    for (let i = 0; i < categoriesName.length; i++) {
      hash = categoriesName.charCodeAt(i) + ((hash << 5) - hash);
    }
    hash = Math.abs(hash);
    
    return colors[hash % colors.length];
  };

  // Create basic tags from categories_name and content
  const createTags = (categoriesName, title, abstract) => {
    const tags = [];
    
    // Add categories_name as primary tag
    if (categoriesName) {
      tags.push(categoriesName);
    }
    
    // Add some basic content-based tags
    const content = `${title} ${abstract}`.toLowerCase();
    
    const keywordMap = {
      'Machine Learning': ['machine learning', 'neural network', 'deep learning', 'training'],
      'Computer Vision': ['computer vision', 'image', 'visual', 'CNN', 'object detection'],
      'Natural Language': ['natural language', 'NLP', 'text', 'language model', 'transformer'],
      'Quantum': ['quantum', 'qubit', 'quantum computing', 'quantum algorithm'],
      'Robotics': ['robot', 'autonomous', 'navigation', 'control'],
      'Security': ['security', 'encryption', 'privacy', 'cryptography'],
      'Data Science': ['data mining', 'analytics', 'big data', 'statistics'],
      'AI': ['artificial intelligence', 'intelligent agent', 'AI'],
      'Trending': ['GPT', 'transformer', 'BERT', 'state-of-the-art', 'breakthrough']
    };
    
    Object.entries(keywordMap).forEach(([tag, keywords]) => {
      if (keywords.some(keyword => content.includes(keyword))) {
        tags.push(tag);
      }
    });
    
    return [...new Set(tags)]; // Remove duplicates
  };

  return {
    id: supabaseData.id,
    title: createSimplifiedTitle(supabaseData.title),
    shortDescription: createSimplifiedDescription(supabaseData.abstract),
    originalTitle: supabaseData.title,
    originalAbstract: supabaseData.abstract,
    category: supabaseData.categories_name || 'General',
    categoriesName: supabaseData.categories_name,
    categoryColor: getCategoryColor(supabaseData.categories_name),
    arxivId: supabaseData.arxiv_id,
    url: supabaseData.url || `https://arxiv.org/pdf/${supabaseData.arxiv_id}`,
    authors: supabaseData.authors || 'Research Institution',
    publishedDate: getPublishedDate(supabaseData.published_date || supabaseData.created_at),
    tags: createTags(supabaseData.categories_name, supabaseData.title, supabaseData.abstract),
    // Keep original data for reference
    _original: supabaseData
  };
};

// Transform array of Supabase data
export const transformSupabaseArrayToArticles = (supabaseArray) => {
  if (!Array.isArray(supabaseArray)) return [];
  
  return supabaseArray
    .map(transformSupabaseToArticle)
    .filter(article => article !== null);
}; 