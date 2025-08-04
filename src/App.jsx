import React, { useState, useMemo, useEffect, useRef } from 'react';
import { BookOpen, Loader2, AlertCircle, Search, Filter, Bookmark, Brain, Eye, Bot, Wrench, Code, ChevronLeft, ChevronRight } from 'lucide-react';
import Header from './components/Header';
import ArticleCard from './components/ArticleCard';
import ArticleModal from './components/ArticleModal';
import SavedArticles from './components/SavedArticles';
import AccountModal from './components/AccountModal';
import Footer from './components/Footer';
import ContactModal from './components/ContactModal';
import { arxivAPI, authAPI, savedArticlesAPI } from './lib/supabase';

function App() {
  const [selectedArticle, setSelectedArticle] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [favorites, setFavorites] = useState(new Set());
  const [isSavedArticlesOpen, setIsSavedArticlesOpen] = useState(false);
  const [isAccountOpen, setIsAccountOpen] = useState(false);
  const [isContactOpen, setIsContactOpen] = useState(false);
  
  // User state for authentication and skill level
  const [user, setUser] = useState(null);
  const [userSkillLevel, setUserSkillLevel] = useState('Beginner');
  
  // Data state
  const [articles, setArticles] = useState([]);
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [savedArticlesFromDB, setSavedArticlesFromDB] = useState([]);
  const [isLoadingSavedArticles, setIsLoadingSavedArticles] = useState(false);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const articlesPerPage = 15;

  // Ref for scrolling to results
  const resultsRef = useRef(null);

  // Check user authentication and load their skill level
  useEffect(() => {
    const checkAuth = async () => {
      try {
        if (authAPI && typeof authAPI.getCurrentSession === 'function') {
          const { data: { session } } = await authAPI.getCurrentSession();
          if (session?.user) {
            setUser(session.user);
            
            // Load user profile to get skill level
            try {
              if (authAPI.getProfile) {
                const profile = await authAPI.getProfile(session.user.id);
                if (profile) {
                  const skillLevel = profile.skill_level || 'Beginner';
                  setUserSkillLevel(skillLevel);
                  console.log('👤 User skill level:', skillLevel);
                }
              }
            } catch (profileError) {
              console.error('Error loading user profile:', profileError);
              setUserSkillLevel('Beginner'); // Default fallback
            }
          } else {
            setUser(null);
            setUserSkillLevel('Beginner'); // Default for non-authenticated users
          }
        }
      } catch (error) {
        console.error('Auth check error:', error);
        setUser(null);
        setUserSkillLevel('Beginner');
      }
    };
    checkAuth();
  }, []);

  // Load data from Supabase with skill-level specific summaries
  useEffect(() => {
    loadData();
  }, [userSkillLevel]); // Reload when skill level changes

  // Load user's saved articles
  useEffect(() => {
    if (user) {
      loadUserSavedArticles();
    } else {
      // Clear saved articles when user logs out
      setSavedArticlesFromDB([]);
      setFavorites(new Set());
    }
  }, [user, userSkillLevel, articles]); // Reload when user, skill level, or articles change

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
    console.log('🚀 Loading data from Supabase with skill level:', userSkillLevel);
    setIsLoading(true);
    setError(null);
    
    try {
      // Create a timeout to prevent infinite loading
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Request timeout')), 15000)
      );
      
      // Load articles with summaries and categories from Supabase
      const dataPromise = Promise.all([
        arxivAPI.getAllPapersWithSummaries(userSkillLevel),
        arxivAPI.getCategories()
      ]);
      
      const [papersData, categoriesData] = await Promise.race([dataPromise, timeoutPromise]);
      
      // Transform papers to article format
      const transformedArticles = papersData.map(paper => ({
        id: paper.id,
        // Use summary title if available, otherwise simplify original title
        title: paper.summaryTitle || simplifyTitle(paper.title || 'Untitled'),
        // Use summary overview if available, otherwise simplify abstract
        shortDescription: paper.summaryOverview || simplifyDescription(paper.abstract || 'No description available'),
        originalTitle: paper.title || 'Untitled',
        originalAbstract: paper.abstract || 'No abstract available',
        // Add summary content for detailed view
        summaryContent: paper.summaryContent || null,
        hasSummary: !!(paper.summaryTitle || paper.summaryOverview || paper.summaryContent),
        skillLevel: paper.skillLevel || userSkillLevel,
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
      
      console.log(`✅ Loaded ${transformedArticles.length} articles with summaries for ${userSkillLevel} level`);
      console.log(`📋 Found ${categoriesData.length} categories`);
      console.log(`📝 Articles with summaries: ${transformedArticles.filter(a => a.hasSummary).length}`);
      
    } catch (err) {
      console.error('💥 Error loading data:', err);
      setError('Failed to load articles from database. Please try again.');
      
      // Fallback: try to load without summaries
      try {
        console.log('🔄 Attempting fallback to basic articles...');
        const [papersData, categoriesData] = await Promise.all([
          arxivAPI.getAllPapers(),
          arxivAPI.getCategories()
        ]);
        
        const transformedArticles = papersData.map(paper => ({
          id: paper.id,
          title: simplifyTitle(paper.title || 'Untitled'),
          shortDescription: simplifyDescription(paper.abstract || 'No description available'),
          originalTitle: paper.title || 'Untitled',
          originalAbstract: paper.abstract || 'No abstract available',
          summaryContent: null,
          hasSummary: false,
          skillLevel: userSkillLevel,
          category: Array.isArray(paper.categories_name) && paper.categories_name.length > 0 
            ? paper.categories_name[0] 
            : 'General',
          categories: Array.isArray(paper.categories_name) ? paper.categories_name : [paper.categories_name || 'General'],
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
        setError(null); // Clear error if fallback succeeds
        console.log(`✅ Fallback successful: Loaded ${transformedArticles.length} basic articles`);
        
      } catch (fallbackErr) {
        console.error('💥 Fallback also failed:', fallbackErr);
        setError('Unable to load articles. Please check your connection and try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const loadUserSavedArticles = async () => {
    if (!user || !savedArticlesAPI) {
      console.log('❌ Cannot load saved articles: no user or API');
      setSavedArticlesFromDB([]);
      setFavorites(new Set());
      setIsLoadingSavedArticles(false);
      return;
    }

    if (articles.length === 0) {
      console.log('❌ No main articles loaded yet, skipping saved articles load');
      return;
    }

    setIsLoadingSavedArticles(true);
    try {
      console.log('📚 Loading saved articles for user:', user.id);
      
      // Get saved article IDs
      const savedArticleIds = await savedArticlesAPI.getUserSavedArticleIds(user.id);
      console.log('📚 Saved article IDs:', savedArticleIds);
      
      // Update favorites Set for heart icons (ensure same type as article IDs)
      const favoriteIds = new Set(savedArticleIds.map(id => {
        // Ensure the ID type matches what the articles use
        return typeof id === 'string' ? parseInt(id) || id : id;
      }));
      setFavorites(favoriteIds);
      
      // Filter main articles to get saved ones for the saved articles panel
      const savedArticles = articles.filter(article => {
        // Check both string and number versions for compatibility
        return savedArticleIds.includes(article.id) || 
               savedArticleIds.includes(String(article.id)) ||
               savedArticleIds.includes(Number(article.id));
      });
      console.log('📚 Available articles count:', articles.length);
      console.log('📚 Sample article IDs:', articles.slice(0, 5).map(a => ({ id: a.id, type: typeof a.id })));
      console.log('📚 Saved article IDs:', savedArticleIds.map(id => ({ id, type: typeof id })));
      console.log('📚 Found saved articles in main feed:', savedArticles.length);
      console.log('📚 Sample saved articles:', savedArticles.slice(0, 2).map(a => ({ id: a.id, title: a.title?.substring(0, 30) })));
      
      setSavedArticlesFromDB(savedArticles);
      
    } catch (error) {
      console.error('❌ Error loading saved articles:', error);
      setSavedArticlesFromDB([]);
    } finally {
      setIsLoadingSavedArticles(false);
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
    const filtered = articles.filter(article => {
      const matchesSearch = searchTerm === '' || 
        article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        article.shortDescription.toLowerCase().includes(searchTerm.toLowerCase()) ||
        article.originalTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
        article.authors.toLowerCase().includes(searchTerm.toLowerCase()) ||
        article.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase())) ||
        // Also search in summary content if available
        (article.summaryContent && article.summaryContent.toLowerCase().includes(searchTerm.toLowerCase()));
      
      // Check if selected category matches any of the article's categories_name
      const matchesCategory = selectedCategory === '' || 
        article.categories.includes(selectedCategory);
      
      return matchesSearch && matchesCategory;
    });

    // Reset to first page when filters change
    setCurrentPage(1);
    
    return filtered;
  }, [articles, searchTerm, selectedCategory]);

  // Calculate pagination
  const totalPages = Math.ceil(filteredArticles.length / articlesPerPage);
  const startIndex = (currentPage - 1) * articlesPerPage;
  const endIndex = startIndex + articlesPerPage;
  const currentArticles = filteredArticles.slice(startIndex, endIndex);

  // Update the results header to show the selected category name
  const selectedCategoryDisplay = selectedCategory ? selectedCategory : null;

  const savedArticles = useMemo(() => {
    return savedArticlesFromDB;
  }, [savedArticlesFromDB]);

  const handleArticleClick = (article) => {
    setSelectedArticle(article);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedArticle(null);
  };

  const handleToggleFavorite = async (articleId) => {
    console.log('💛 handleToggleFavorite called with articleId:', articleId);
    
    if (!user) {
      console.log('❌ User not authenticated, cannot save article');
      return;
    }

    try {
      const isFavorited = favorites.has(articleId);
      console.log('💖 Article currently favorited:', isFavorited);
      
      if (isFavorited) {
        // Remove from database
        await savedArticlesAPI.unsaveArticle(user.id, articleId);
        console.log('✅ Article removed from saved');
        
        // Update local state
        setFavorites(prev => {
          const newFavorites = new Set(prev);
          newFavorites.delete(articleId);
          return newFavorites;
        });
        
      } else {
        // Save to database
        await savedArticlesAPI.saveArticle(user.id, articleId);
        console.log('✅ Article saved');
        
        // Update local state
        setFavorites(prev => {
          const newFavorites = new Set(prev);
          newFavorites.add(articleId);
          return newFavorites;
        });
      }
      
      // Reload saved articles for the panel
      await loadUserSavedArticles();
      
    } catch (error) {
      console.error('❌ Error toggling favorite:', error);
      // Show user-friendly error message
      alert(`Failed to ${favorites.has(articleId) ? 'remove' : 'save'} article. Please try again.`);
    }
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

  const handleShowContact = () => {
    setIsContactOpen(true);
  };

  const handleCloseContact = () => {
    setIsContactOpen(false);
  };

  // Handle skill level changes from account modal
  const handleSkillLevelChange = (newSkillLevel) => {
    console.log('🎯 Skill level changed to:', newSkillLevel);
    setUserSkillLevel(newSkillLevel);
    // loadData will be triggered automatically by the useEffect dependency
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
        savedCount={savedArticlesFromDB.length}
        user={user}
        userSkillLevel={userSkillLevel}
      />

      {/* Content Spacer for Fixed Header */}
      <div className="h-24 sm:h-20"></div>

      <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-12">
        {/* Loading State */}
        {isLoading && (
          <div className="text-center py-12 sm:py-20">
            <div className="relative inline-block mb-6 sm:mb-8">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-2xl blur-xl"></div>
              <Loader2 className="relative mx-auto h-16 w-16 sm:h-24 sm:w-24 text-blue-500 animate-spin" />
            </div>
            <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3 sm:mb-4">Loading Research Papers</h3>
            <p className="text-gray-500 max-w-md mx-auto text-sm sm:text-base px-4">
              Connecting to database and fetching latest scientific discoveries...
            </p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="mb-6 sm:mb-8 bg-red-50 border border-red-200 rounded-2xl p-4 sm:p-6 mx-4 sm:mx-0">
            <div className="flex items-start space-x-3">
              <AlertCircle className="h-5 w-5 sm:h-6 sm:w-6 text-red-500 flex-shrink-0 mt-0.5" />
              <div className="flex-1 min-w-0">
                <h3 className="text-base sm:text-lg font-semibold text-red-900">Connection Error</h3>
                <p className="text-red-700 text-sm sm:text-base mt-1">{error}</p>
                <button
                  onClick={loadData}
                  className="mt-3 px-3 sm:px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm sm:text-base"
                >
                  Try Again
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Category Filter Section */}
        {!isLoading && !error && !searchTerm && (
          <div className="pt-8 sm:pt-8 pb-12 sm:pb-20 mb-8 sm:mb-12">
            <div className="mx-auto max-w-6xl px-4 sm:px-6">
              <div className="text-center mb-8 sm:mb-12">
                <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 mb-3 sm:mb-4 leading-tight px-2">
                  Your Daily Dose of Discovery
                </h2>
                <p className="text-base sm:text-lg text-gray-600 max-w-3xl mx-auto leading-relaxed px-4">
                We break down the latest AI breakthroughs into words you can actually understand
                </p>
              </div>

              <div className="text-center mb-6 sm:mb-10">
                <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2 sm:mb-3 px-4">
                  Explore Research Categories
                </h3>
                <p className="text-gray-600 text-sm sm:text-base px-4">
                  Click any category to discover the latest breakthroughs
                </p>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-6 max-w-5xl mx-auto px-4">
                {[
                  { name: 'Machine Learning', icon: Brain, color: 'bg-blue-50 hover:bg-blue-100 border-blue-200' },
                  { name: 'Artificial Intelligence', icon: Bot, color: 'bg-purple-50 hover:bg-purple-100 border-purple-200' },
                  { name: 'Computer Vision', icon: Eye, color: 'bg-green-50 hover:bg-green-100 border-green-200' },
                  { name: 'Robotics', icon: Wrench, color: 'bg-orange-50 hover:bg-orange-100 border-orange-200' },
                  { name: 'Natural Language', icon: Code, color: 'bg-pink-50 hover:bg-pink-100 border-pink-200' },
                ].map((category, index) => (
                  <button
                    key={category.name}
                    onClick={() => {
                      const targetCategory = category.name === 'Computer Vision' ? 'Computer Vision and Pattern Recognition' : category.name === 'Natural Language' ? 'Computation and Language' : category.name;
                      setSelectedCategory(selectedCategory === targetCategory ? '' : targetCategory);
                    }}
                    className={`group p-4 sm:p-8 rounded-xl sm:rounded-2xl border-2 transition-all duration-300 hover:scale-105 hover:shadow-lg ${category.color} ${
                      selectedCategory === (category.name === 'Computer Vision' ? 'Computer Vision and Pattern Recognition' : category.name === 'Natural Language' ? 'Computation and Language' : category.name) 
                        ? 'ring-2 ring-indigo-500 shadow-lg' : ''
                    } ${
                      // Center the 5th item on mobile when it's alone on a row
                      index === 4 ? 'col-span-2 sm:col-span-1 justify-self-center' : ''
                    }`}
                  >
                    <div className="flex flex-col items-center justify-center space-y-2 sm:space-y-3 h-20 sm:h-28">
                      <div className="p-2 sm:p-3 rounded-lg sm:rounded-xl bg-white shadow-sm group-hover:shadow-md transition-shadow flex-shrink-0">
                        <category.icon className="h-5 w-5 sm:h-8 sm:w-8 text-indigo-600" />
                      </div>
                      <span className="text-xs sm:text-sm font-semibold text-gray-900 leading-tight text-center min-h-[2.5rem] sm:min-h-[3rem] flex items-center justify-center px-1">
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
          <div className="mb-6 sm:mb-8 px-4 sm:px-0" ref={resultsRef}>
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-1 sm:mb-2">
                  {selectedCategoryDisplay ? `${categories.find(c => c.category_name === selectedCategoryDisplay)?.category_name || selectedCategoryDisplay}` : 'Latest Research'}
                </h3>
                <p className="text-gray-600 text-sm sm:text-base">
                  {filteredArticles.length} articles found
                  {searchTerm && ` for "${searchTerm}"`}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Articles Grid */}
        {!isLoading && !error && filteredArticles.length > 0 ? (
          <div className="px-4 sm:px-0">
            <div className="grid gap-4 sm:gap-6 md:gap-8 md:grid-cols-2 lg:grid-cols-3">
              {currentArticles.map(article => (
                <ArticleCard 
                  key={article.id} 
                  article={article} 
                  onClick={handleArticleClick}
                  isFavorite={favorites.has(article.id)}
                  onToggleFavorite={handleToggleFavorite}
                />
              ))}
            </div>

            {/* Pagination - Mobile optimized */}
            {totalPages > 1 && (
              <div className="flex flex-col sm:flex-row items-center justify-center space-y-3 sm:space-y-0 sm:space-x-2 mt-8 sm:mt-12 px-4">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="w-full sm:w-auto flex items-center justify-center px-4 py-3 sm:py-2 rounded-lg border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronLeft className="h-4 w-4 mr-1" />
                  Previous
                </button>

                <div className="flex items-center space-x-1 overflow-x-auto py-2 max-w-full">
                  {Array.from({ length: totalPages }, (_, i) => {
                    const pageNum = i + 1;
                    const isActive = pageNum === currentPage;
                    
                    // Show first page, last page, current page, and pages around current
                    const showPage = pageNum === 1 || 
                                   pageNum === totalPages || 
                                   Math.abs(pageNum - currentPage) <= 1;
                    
                    if (!showPage && pageNum === 2 && currentPage > 4) {
                      return <span key={pageNum} className="px-2 text-gray-400 text-sm">...</span>;
                    }
                    
                    if (!showPage && pageNum === totalPages - 1 && currentPage < totalPages - 3) {
                      return <span key={pageNum} className="px-2 text-gray-400 text-sm">...</span>;
                    }
                    
                    if (!showPage) return null;

                    return (
                      <button
                        key={pageNum}
                        onClick={() => setCurrentPage(pageNum)}
                        className={`px-3 py-2 rounded-lg font-medium transition-colors text-sm sm:text-base ${
                          isActive
                            ? 'bg-blue-600 text-white'
                            : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                </div>

                <button
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="w-full sm:w-auto flex items-center justify-center px-4 py-3 sm:py-2 rounded-lg border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Next
                  <ChevronRight className="h-4 w-4 ml-1" />
                </button>
              </div>
            )}
          </div>
        ) : !isLoading && !error && (
          <div className="text-center py-12 sm:py-20 px-4">
            <div className="relative inline-block mb-6 sm:mb-8">
              <div className="absolute inset-0 bg-gradient-to-r from-gray-300/20 to-gray-400/20 rounded-2xl blur-xl"></div>
              <BookOpen className="relative mx-auto h-16 w-16 sm:h-24 sm:w-24 text-gray-400" />
            </div>
            <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3 sm:mb-4">No Research Found</h3>
            <p className="text-gray-500 max-w-md mx-auto text-sm sm:text-base">
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
        isLoading={isLoadingSavedArticles}
        user={user}
      />

      <AccountModal
        isOpen={isAccountOpen}
        onClose={handleCloseAccount}
        userSkillLevel={userSkillLevel}
        onSkillLevelChange={handleSkillLevelChange}
      />

      <ContactModal
        isOpen={isContactOpen}
        onClose={handleCloseContact}
      />

      <Footer onContactClick={handleShowContact} />
    </div>
  );
}

export default App; 