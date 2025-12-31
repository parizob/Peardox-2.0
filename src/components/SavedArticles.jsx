import React from 'react';
import { X, Heart, ExternalLink, Calendar, Tag } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

const SavedArticles = ({ isOpen, onClose, savedArticles, onArticleClick, onToggleFavorite }) => {
  const { isDarkMode } = useTheme();
  
  console.log('📚 SavedArticles component props:', {
    isOpen,
    savedArticlesCount: savedArticles?.length || 0,
    sampleArticle: savedArticles?.[0] ? {
      id: savedArticles[0].id,
      title: savedArticles[0].title?.substring(0, 30),
      hasTitle: !!savedArticles[0].title
    } : null
  });

  const getCategoryColor = (category) => {
    // Return styling based on dark mode
    return isDarkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-800';
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Unknown Date';
    
    try {
      const date = new Date(dateString);
      // Format as UTC date to show the actual published date from database
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        timeZone: 'UTC' // Force UTC timezone
      });
    } catch {
      return 'Unknown Date';
    }
  };

  const handleRemoveFavorite = (e, articleId) => {
    e.stopPropagation();
    onToggleFavorite(articleId);
  };

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={onClose}
        />
      )}
      
      {/* Side Panel */}
      <div className={`fixed top-0 right-0 h-full w-full sm:w-96 shadow-2xl transform transition-transform duration-300 ease-in-out z-50 flex flex-col ${
        isOpen ? 'translate-x-0' : 'translate-x-full'
      } ${isDarkMode ? 'bg-gray-900' : 'bg-white'}`}>
        {/* Header - Fixed */}
        <div className={`border-b p-4 sm:p-6 flex-shrink-0 ${
          isDarkMode 
            ? 'bg-gradient-to-r from-gray-800 to-gray-800 border-gray-700' 
            : 'bg-gradient-to-r from-red-50 to-pink-50 border-gray-200'
        }`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Heart className={`h-6 w-6 ${isDarkMode ? 'text-red-400' : 'text-red-600'}`} />
              <div>
                <h2 className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Saved Articles</h2>
                <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>{savedArticles.length} article{savedArticles.length !== 1 ? 's' : ''} saved</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className={`p-2 rounded-full transition-colors ${
                isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-white hover:bg-opacity-50'
              }`}
            >
              <X className={`h-6 w-6 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`} />
            </button>
          </div>
        </div>

        {/* Content - Scrollable */}
        <div className={`flex-1 overflow-y-auto overscroll-contain scroll-smooth 
                        scrollbar-thin 
                        [&::-webkit-scrollbar]:w-2 
                        [&::-webkit-scrollbar-thumb]:rounded-full
                        touch-pan-y ${
                          isDarkMode 
                            ? 'scrollbar-track-gray-800 scrollbar-thumb-gray-600 hover:scrollbar-thumb-gray-500 [&::-webkit-scrollbar-track]:bg-gray-800 [&::-webkit-scrollbar-thumb]:bg-gray-600 [&::-webkit-scrollbar-thumb:hover]:bg-gray-500' 
                            : 'scrollbar-track-gray-100 scrollbar-thumb-gray-300 hover:scrollbar-thumb-gray-400 [&::-webkit-scrollbar-track]:bg-gray-100 [&::-webkit-scrollbar-thumb]:bg-gray-300 [&::-webkit-scrollbar-thumb:hover]:bg-gray-400'
                        }`}>
          {/* Gradient fade at top when scrolling */}
          <div className={`sticky top-0 h-4 pointer-events-none z-10 ${
            isDarkMode ? 'bg-gradient-to-b from-gray-900 to-transparent' : 'bg-gradient-to-b from-white to-transparent'
          }`}></div>
          
          <div className="px-4 sm:px-4 pb-6 -mt-4">
            {savedArticles.length === 0 ? (
              <div className="text-center py-12">
                <Heart className={`mx-auto h-12 w-12 mb-4 ${isDarkMode ? 'text-gray-600' : 'text-gray-300'}`} />
                <h3 className={`text-lg font-medium mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>No saved articles yet</h3>
                <p className={`text-sm px-4 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  Click the heart icon on any article to save it here for later reading.
                </p>
              </div>
            ) : (
              <div className="space-y-4 pt-4">
                {savedArticles.map(article => (
                  <div
                    key={article.id}
                    className={`rounded-lg p-4 transition-colors cursor-pointer border ${
                      isDarkMode 
                        ? 'bg-gray-800 border-gray-700 hover:bg-gray-750' 
                        : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                    }`}
                    onClick={() => {
                      onArticleClick(article);
                      onClose();
                    }}
                  >
                    {/* Article Header */}
                    <div className="flex items-start justify-between mb-3">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(article.category)}`}>
                        <Tag className="w-3 h-3 mr-1" />
                        {article.category}
                      </span>
                      <button
                        onClick={(e) => handleRemoveFavorite(e, article.id)}
                        className={`p-1 rounded-full transition-colors ${
                          isDarkMode ? 'text-red-400 hover:bg-red-900/30' : 'text-red-600 hover:bg-red-50'
                        }`}
                        title="Remove from favorites"
                      >
                        <Heart className="h-4 w-4 fill-current" />
                      </button>
                    </div>

                    {/* Article Title */}
                    <h3 className={`font-semibold mb-2 text-sm leading-tight ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                      {article.title}
                    </h3>

                    {/* Article Description */}
                    <p className={`text-xs mb-3 line-clamp-2 leading-relaxed ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      {article.shortDescription}
                    </p>

                    {/* Article Meta */}
                    <div className={`flex items-center justify-between text-xs ${isDarkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                      <div className="flex items-center space-x-3">
                        <span className="flex items-center">
                          <Calendar className="h-3 w-3 mr-1" />
                          {formatDate(article.publishedDate)}
                        </span>
                        <span className="flex items-center">
                          <ExternalLink className="h-3 w-3 mr-1" />
                          {article.arxivId}
                        </span>
                      </div>
                    </div>

                    {/* Read More Button */}
                    <div className={`mt-3 pt-3 border-t ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                      <span className="font-medium text-xs" style={{ color: '#1db954' }}>
                        Click to read more →
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          
          {/* Gradient fade at bottom when there's more content */}
          {savedArticles.length > 3 && (
            <div className={`sticky bottom-0 h-6 pointer-events-none -mt-6 ${
              isDarkMode ? 'bg-gradient-to-t from-gray-900 to-transparent' : 'bg-gradient-to-t from-white to-transparent'
            }`}></div>
          )}
        </div>
      </div>
    </>
  );
};

export default SavedArticles; 