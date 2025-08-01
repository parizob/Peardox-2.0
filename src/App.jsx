import React, { useState, useMemo, useEffect, useRef } from 'react';
import { BookOpen, Loader2, AlertCircle, Search, Filter, Bookmark, Brain, Eye, Bot, Wrench, Code } from 'lucide-react';
import Header from './components/Header';
import ArticleCard from './components/ArticleCard';
import ArticleModal from './components/ArticleModal';
import SavedArticles from './components/SavedArticles';
import AccountModal from './components/AccountModal';
import { arxivAPI } from './lib/supabase';

function App() {
  const [selectedArticle, setSelectedArticle] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [favorites, setFavorites] = useState(new Set());
  const [isSavedArticlesOpen, setIsSavedArticlesOpen] = useState(false);
  const [isAccountOpen, setIsAccountOpen] = useState(false);
  
  // Data state
  const [articles, setArticles] = useState([]);
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Ref for scrolling to results
  const resultsRef = useRef(null);

  // Load data from Supabase
  useEffect(() => {
    loadData();
  }, []);

  // Scroll to results when category is selected
  useEffect(() => {
    if (selectedCategory && resultsRef.current) {
      const headerHeight = 80; // Account for fixed header height
      const elementPosition = resultsRef.current.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - headerHeight;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
  }, [selectedCategory]);

  const loadData = async () => {
    console.log('🚀 Loading data from Supabase...');
    setIsLoading(true);
    setError(null);
    
    try {
      // Load articles and categories from Supabase
      const [papersData, categoriesData] = await Promise.all([
        arxivAPI.getAllPapers(),
        arxivAPI.getCategories()
      ]);
      
      // Transform papers to article format
      const transformedArticles = papersData.map(paper => ({
        id: paper.id,
        title: simplifyTitle(paper.title || 'Untitled'),
        shortDescription: simplifyDescription(paper.abstract || 'No description available'),
        originalTitle: paper.title || 'Untitled',
        originalAbstract: paper.abstract || 'No abstract available',
        // Keep the first category name for backwards compatibility
        category: Array.isArray(paper.categories_name) && paper.categories_name.length > 0 
          ? paper.categories_name[0] 
          : 'General',
        // Store all categories from the array
        categories: Array.isArray(paper.categories_name) ? paper.categories_name : [paper.categories_name || 'General'],
        // Store subject classes for filtering
        subjectClasses: Array.isArray(paper.categories) ? paper.categories : [paper.categories || 'general'],
        categoriesName: Array.isArray(paper.categories_name) && paper.categories_name.length > 0 
          ? paper.categories_name[0] 
          : 'General',
        arxivId: paper.arxiv_id || '',
        url: paper.pdf_url || paper.abstract_url || `https://arxiv.org/pdf/${paper.arxiv_id}`,
        authors: Array.isArray(paper.authors) ? paper.authors.join(', ') : (paper.authors || 'Unknown Authors'),
        publishedDate: formatDate(paper.published_date || paper.created_at),
        tags: generateTags(paper.categories_name, paper.title, paper.abstract),
        _original: paper
      }));
      
      setArticles(transformedArticles);
      setCategories(categoriesData);
      
      console.log(`✅ Loaded ${transformedArticles.length} articles from Supabase`);
      console.log(`📋 Found ${categoriesData.length} categories`);
      
    } catch (err) {
      console.error('💥 Error loading data:', err);
      setError('Failed to load articles from database. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Helper functions
  const simplifyTitle = (title) => {
    return title
      .replace(/^(A|An|The)\s+/i, '')
      .replace(/:\s*.*$/, '')
      .replace(/\b(Novel|New|Improved|Enhanced|Advanced|Efficient)\b/gi, '')
      .trim();
  };

  const simplifyDescription = (abstract) => {
    const sentences = abstract.split(/[.!?]+/);
    const firstSentence = sentences[0]?.trim();
    
    if (!firstSentence) return abstract.substring(0, 200) + '...';
    
    return firstSentence
      .replace(/\b(methodology|framework|paradigm|algorithm)\b/gi, 'approach')
      .replace(/\b(demonstrate|illustrate|show)\b/gi, 'prove')
      .replace(/\b(significant|substantial|considerable)\b/gi, 'major')
      .replace(/\b(state-of-the-art|cutting-edge)\b/gi, 'advanced')
      + '.';
  };

  const formatDate = (dateString) => {
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

  const generateTags = (categories, title, abstract) => {
    const tags = [];
    
    // Add categories as tags
    if (Array.isArray(categories)) {
      tags.push(...categories);
    } else if (categories) {
      tags.push(categories);
    }
    
    const content = `${title} ${abstract}`.toLowerCase();
    const keywordMap = {
      'AI': ['artificial intelligence', 'machine learning', 'neural network'],
      'Deep Learning': ['deep learning', 'CNN', 'transformer'],
      'Computer Vision': ['computer vision', 'image', 'visual'],
      'NLP': ['natural language', 'text', 'language model'],
      'Quantum': ['quantum', 'qubit'],
      'Robotics': ['robot', 'autonomous'],
      'Security': ['security', 'encryption', 'privacy']
    };
    
    Object.entries(keywordMap).forEach(([tag, keywords]) => {
      if (keywords.some(keyword => content.includes(keyword))) {
        tags.push(tag);
      }
    });
    
    return [...new Set(tags)];
  };

  const filteredArticles = useMemo(() => {
    return articles.filter(article => {
      const matchesSearch = searchTerm === '' || 
        article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        article.shortDescription.toLowerCase().includes(searchTerm.toLowerCase()) ||
        article.originalTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
        article.authors.toLowerCase().includes(searchTerm.toLowerCase()) ||
        article.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
      
      // Check if selected category matches any of the article's categories_name
      const matchesCategory = selectedCategory === '' || 
        article.categories.includes(selectedCategory);
      
      return matchesSearch && matchesCategory;
    });
  }, [articles, searchTerm, selectedCategory]);

  // Update the results header to show the selected category name
  const selectedCategoryDisplay = selectedCategory ? selectedCategory : null;

  const savedArticles = useMemo(() => {
    return articles.filter(article => favorites.has(article.id));
  }, [articles, favorites]);

  const handleArticleClick = (article) => {
    setSelectedArticle(article);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedArticle(null);
  };

  const handleToggleFavorite = (articleId) => {
    setFavorites(prev => {
      const newFavorites = new Set(prev);
      if (newFavorites.has(articleId)) {
        newFavorites.delete(articleId);
      } else {
        newFavorites.add(articleId);
      }
      return newFavorites;
    });
  };

  const handleShowSavedArticles = () => {
    setIsSavedArticlesOpen(true);
  };

  const handleCloseSavedArticles = () => {
    setIsSavedArticlesOpen(false);
  };

  const handleShowAccount = () => {
    setIsAccountOpen(true);
  };

  const handleCloseAccount = () => {
    setIsAccountOpen(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50/30 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-blue-400/10 to-transparent rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-tr from-purple-400/10 to-transparent rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-to-r from-cyan-300/5 via-blue-300/5 to-purple-300/5 rounded-full blur-3xl"></div>
      </div>

      <Header 
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        selectedCategory={selectedCategory}
        onCategoryChange={setSelectedCategory}
        categories={categories}
        onShowSavedArticles={handleShowSavedArticles}
        onShowAccount={handleShowAccount}
        savedCount={favorites.size}
      />

      {/* Content Spacer for Fixed Header */}
      <div className="h-20"></div>

      <main className="relative z-10 max-w-7xl mx-auto px-6 py-12">
        {/* Loading State */}
        {isLoading && (
          <div className="text-center py-20">
            <div className="relative inline-block mb-8">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-2xl blur-xl"></div>
              <Loader2 className="relative mx-auto h-24 w-24 text-blue-500 animate-spin" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-4">Loading Research Papers</h3>
            <p className="text-gray-500 max-w-md mx-auto">
              Connecting to database and fetching latest scientific discoveries...
            </p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="mb-8 bg-red-50 border border-red-200 rounded-2xl p-6">
            <div className="flex items-center space-x-3">
              <AlertCircle className="h-6 w-6 text-red-500" />
              <div>
                <h3 className="text-lg font-semibold text-red-900">Connection Error</h3>
                <p className="text-red-700">{error}</p>
                <button
                  onClick={loadData}
                  className="mt-3 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  Try Again
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Category Filter Section */}
        {!isLoading && !error && !searchTerm && (
          <div className="pt-8 pb-20 mb-12">
            <div className="mx-auto max-w-6xl px-6">
              <div className="text-center mb-12">
                <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4 leading-tight">
                  Your Daily Dose of Discovery
                </h2>
                <p className="text-lg text-gray-600 max-w-3xl mx-auto leading-relaxed">
                  Our platform cuts through the jargon, delivering the most important AI advancements from around the globe directly to you.
                </p>
              </div>

              <div className="text-center mb-10">
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  Explore Research Categories
                </h3>
                <p className="text-gray-600">
                  Click any category to discover the latest breakthroughs
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6 max-w-5xl mx-auto">
                {[
                  { name: 'Machine Learning', icon: Brain, color: 'bg-blue-50 hover:bg-blue-100 border-blue-200' },
                  { name: 'Artificial Intelligence', icon: Bot, color: 'bg-purple-50 hover:bg-purple-100 border-purple-200' },
                  { name: 'Computer Vision', icon: Eye, color: 'bg-green-50 hover:bg-green-100 border-green-200' },
                  { name: 'Robotics', icon: Wrench, color: 'bg-orange-50 hover:bg-orange-100 border-orange-200' },
                  { name: 'Natural Language', icon: Code, color: 'bg-pink-50 hover:bg-pink-100 border-pink-200' },
                ].map((category) => (
                  <button
                    key={category.name}
                    onClick={() => {
                      const targetCategory = category.name === 'Computer Vision' ? 'Computer Vision and Pattern Recognition' : category.name === 'Natural Language' ? 'Computation and Language' : category.name;
                      setSelectedCategory(selectedCategory === targetCategory ? '' : targetCategory);
                    }}
                    className={`group p-6 rounded-2xl border-2 transition-all duration-300 hover:scale-105 hover:shadow-lg ${category.color} ${
                      selectedCategory === (category.name === 'Computer Vision' ? 'Computer Vision and Pattern Recognition' : category.name === 'Natural Language' ? 'Computation and Language' : category.name) 
                        ? 'ring-2 ring-indigo-500 shadow-lg' : ''
                    }`}
                  >
                    <div className="flex flex-col items-center space-y-3">
                      <div className="p-3 rounded-xl bg-white shadow-sm group-hover:shadow-md transition-shadow">
                        <category.icon className="h-8 w-8 text-indigo-600" />
                      </div>
                      <span className="text-sm font-semibold text-gray-900 leading-tight text-center">
                        {category.name}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Results Header */}
        {!isLoading && !error && (
          <div className="mb-8" ref={resultsRef}>
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">
                  {selectedCategoryDisplay ? `${categories.find(c => c.category_name === selectedCategoryDisplay)?.category_name || selectedCategoryDisplay}` : 'Latest Research'}
                </h3>
                <p className="text-gray-600">
                  {filteredArticles.length} articles found
                  {searchTerm && ` for "${searchTerm}"`}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Articles Grid */}
        {!isLoading && !error && filteredArticles.length > 0 ? (
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {filteredArticles.map(article => (
              <ArticleCard 
                key={article.id} 
                article={article} 
                onClick={handleArticleClick}
                isFavorite={favorites.has(article.id)}
                onToggleFavorite={handleToggleFavorite}
              />
            ))}
          </div>
        ) : !isLoading && !error && (
          <div className="text-center py-20">
            <div className="relative inline-block mb-8">
              <div className="absolute inset-0 bg-gradient-to-r from-gray-300/20 to-gray-400/20 rounded-2xl blur-xl"></div>
              <BookOpen className="relative mx-auto h-24 w-24 text-gray-400" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-4">No Research Found</h3>
            <p className="text-gray-500 max-w-md mx-auto">
              Try adjusting your search terms or exploring different categories to discover new research.
            </p>
          </div>
        )}
      </main>

      <ArticleModal 
        article={selectedArticle}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        isFavorite={selectedArticle ? favorites.has(selectedArticle.id) : false}
        onToggleFavorite={handleToggleFavorite}
      />

      <SavedArticles
        isOpen={isSavedArticlesOpen}
        onClose={handleCloseSavedArticles}
        savedArticles={savedArticles}
        onArticleClick={handleArticleClick}
        onToggleFavorite={handleToggleFavorite}
      />

      <AccountModal
        isOpen={isAccountOpen}
        onClose={handleCloseAccount}
      />
    </div>
  );
}

export default App; 