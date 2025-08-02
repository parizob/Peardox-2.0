import React from 'react';
import { X, ExternalLink, Calendar, User, Tag, BookOpen, GraduationCap, Heart, Brain, Sparkles } from 'lucide-react';

const ArticleModal = ({ article, isOpen, onClose, isFavorite, onToggleFavorite }) => {
  if (!isOpen || !article) return null;

  const getCategoryColor = (category) => {
    const colors = {
      'Artificial Intelligence': 'bg-blue-100 text-blue-800',
      'Quantum Computing': 'bg-purple-100 text-purple-800',
      'Edge Computing': 'bg-green-100 text-green-800',
      'Computer Vision': 'bg-orange-100 text-orange-800',
      'Natural Language Processing': 'bg-indigo-100 text-indigo-800',
    };
    return colors[category] || 'bg-gray-100 text-gray-800';
  };

  const getSkillLevelColor = (skillLevel) => {
    const colors = {
      'Beginner': 'bg-green-100 text-green-800 border-green-200',
      'Intermediate': 'bg-yellow-100 text-yellow-800 border-yellow-200',
      'Advanced': 'bg-orange-100 text-orange-800 border-orange-200',
      'Expert': 'bg-red-100 text-red-800 border-red-200'
    };
    return colors[skillLevel] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-2 sm:p-4 z-50">
      <div className="bg-white rounded-lg max-w-4xl max-h-[95vh] sm:max-h-[90vh] overflow-y-auto w-full mx-2 sm:mx-4">
        <div className="sticky top-0 bg-white border-b border-gray-200 p-4 sm:p-6 flex justify-between items-start">
          <div className="flex-1 pr-3 sm:pr-4 min-w-0">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2 leading-tight">{article.title}</h2>
            <div className="flex flex-wrap items-center gap-2">
              <span className={`inline-flex items-center px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-medium ${getCategoryColor(article.category)}`}>
                <Tag className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                {article.category}
              </span>
              {article.skillLevel && (
                <span className={`inline-flex items-center px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-medium border ${getSkillLevelColor(article.skillLevel)}`}>
                  <Brain className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                  {article.skillLevel}
                </span>
              )}
              {article.hasSummary && (
                <span className="inline-flex items-center px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-medium bg-purple-100 text-purple-800 border border-purple-200">
                  <Sparkles className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                  AI Summary
                </span>
              )}
            </div>
          </div>
          <div className="flex items-center space-x-1 sm:space-x-2 flex-shrink-0">
            <button
              onClick={() => onToggleFavorite(article.id)}
              className={`p-2 rounded-full transition-all duration-200 ${
                isFavorite 
                  ? 'bg-red-50 text-red-600 hover:bg-red-100' 
                  : 'bg-gray-50 text-gray-400 hover:bg-red-50 hover:text-red-500'
              }`}
              title={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
            >
              <Heart 
                className={`h-5 w-5 sm:h-6 sm:w-6 transition-all duration-200 ${
                  isFavorite ? 'fill-current' : ''
                }`} 
              />
            </button>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X className="h-5 w-5 sm:h-6 sm:w-6 text-gray-500" />
            </button>
          </div>
        </div>

        <div className="p-4 sm:p-6 space-y-6 sm:space-y-8">
          {/* Overview Section */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 sm:p-6">
            <div className="flex items-center mb-3">
              <BookOpen className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600 mr-2" />
              <h3 className="text-base sm:text-lg font-semibold text-blue-900">Overview</h3>
            </div>
            <p className="text-blue-800 leading-relaxed text-sm sm:text-base">{article.shortDescription}</p>
          </div>

          {/* AI-Generated Summary Section (if available) */}
          {article.summaryContent && (
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 sm:p-6">
              <div className="flex items-center mb-3">
                <Sparkles className="h-4 w-4 sm:h-5 sm:w-5 text-purple-600 mr-2" />
                <h3 className="text-base sm:text-lg font-semibold text-purple-900">AI-Generated Summary</h3>
              </div>
              <div className="text-purple-800 leading-relaxed text-sm sm:text-base whitespace-pre-wrap">
                {article.summaryContent}
              </div>
            </div>
          )}

          {/* Technical Details Section */}
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 sm:p-6">
            <div className="flex items-center mb-4">
              <GraduationCap className="h-4 w-4 sm:h-5 sm:w-5 text-gray-600 mr-2" />
              <h3 className="text-base sm:text-lg font-semibold text-gray-900">Technical Details</h3>
            </div>
            
            <div className="space-y-4">
              <div>
                <h4 className="font-medium text-gray-700 mb-2 text-sm sm:text-base">Original Research Title:</h4>
                <p className="text-gray-900 font-medium text-sm sm:text-base leading-relaxed">{article.originalTitle}</p>
              </div>
              
              <div>
                <h4 className="font-medium text-gray-700 mb-2 text-sm sm:text-base">Research Abstract:</h4>
                <p className="text-gray-800 leading-relaxed text-sm sm:text-base">{article.originalAbstract}</p>
              </div>
            </div>
          </div>

          {/* Article Info Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-start text-gray-600">
                <User className="h-4 w-4 sm:h-5 sm:w-5 mr-2 flex-shrink-0 mt-0.5" />
                <div className="min-w-0">
                  <span className="font-medium text-sm sm:text-base">Authors:</span>
                  <p className="text-gray-800 text-sm sm:text-base break-words">{article.authors}</p>
                </div>
              </div>

              <div className="flex items-center text-gray-600">
                <Calendar className="h-4 w-4 sm:h-5 sm:w-5 mr-2 flex-shrink-0" />
                <div>
                  <span className="font-medium text-sm sm:text-base">Published:</span>
                  <p className="text-gray-800 text-sm sm:text-base">{article.publishedDate}</p>
                </div>
              </div>

              <div className="flex items-center text-gray-600">
                <ExternalLink className="h-4 w-4 sm:h-5 sm:w-5 mr-2 flex-shrink-0" />
                <div>
                  <span className="font-medium text-sm sm:text-base">ArXiv ID:</span>
                  <p className="text-gray-800 text-sm sm:text-base break-all">{article.arxivId}</p>
                </div>
              </div>
            </div>

            <div>
              <h4 className="font-medium text-gray-700 mb-3 text-sm sm:text-base">Research Tags:</h4>
              <div className="flex flex-wrap gap-1.5 sm:gap-2">
                {article.categories && article.categories.length > 0 ? (
                  (() => {
                    // Filter out categories that contain periods or commas
                    const filteredCategories = article.categories.filter(category => !category.includes('.') && !category.includes(','));
                    
                    return filteredCategories.length > 0 ? (
                      <>
                        {filteredCategories.map((category, index) => (
                          <span 
                            key={index}
                            className="inline-flex items-center px-2 py-0.5 sm:py-1 rounded-md bg-gray-100 text-gray-600 text-xs font-medium"
                          >
                            {category}
                          </span>
                        ))}
                      </>
                    ) : (
                      // Fallback to article.category if no valid categories remain
                      <span className="inline-flex items-center px-2 py-0.5 sm:py-1 rounded-md bg-gray-100 text-gray-600 text-xs font-medium">
                        {article.category}
                      </span>
                    );
                  })()
                ) : (
                  <span className="inline-flex items-center px-2 py-0.5 sm:py-1 rounded-md bg-gray-100 text-gray-600 text-xs font-medium">
                    {article.category}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Action Button */}
          <div className="pt-4 sm:pt-6 border-t border-gray-200">
            <a
              href={article.url}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto inline-flex items-center justify-center px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors text-sm sm:text-base"
            >
              <ExternalLink className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
              Read Full Research Paper
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ArticleModal; 