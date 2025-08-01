import React from 'react';
import { X, ExternalLink, Calendar, User, Tag, BookOpen, GraduationCap, Heart } from 'lucide-react';

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

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-4xl max-h-[90vh] overflow-y-auto w-full mx-4">
        <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex justify-between items-start">
          <div className="flex-1 pr-4">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">{article.title}</h2>
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getCategoryColor(article.category)}`}>
              <Tag className="w-4 h-4 mr-1" />
              {article.category}
            </span>
          </div>
          <div className="flex items-center space-x-2">
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
                className={`h-6 w-6 transition-all duration-200 ${
                  isFavorite ? 'fill-current' : ''
                }`} 
              />
            </button>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X className="h-6 w-6 text-gray-500" />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-8">
          {/* Simplified Overview Section */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
            <div className="flex items-center mb-3">
              <BookOpen className="h-5 w-5 text-blue-600 mr-2" />
              <h3 className="text-lg font-semibold text-blue-900"> Overview</h3>
            </div>
            <p className="text-blue-800 leading-relaxed">{article.shortDescription}</p>
          </div>

          {/* Technical Details Section */}
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
            <div className="flex items-center mb-4">
              <GraduationCap className="h-5 w-5 text-gray-600 mr-2" />
              <h3 className="text-lg font-semibold text-gray-900">Technical Details</h3>
            </div>
            
            <div className="space-y-4">
              <div>
                <h4 className="font-medium text-gray-700 mb-2">Original Research Title:</h4>
                <p className="text-gray-900 font-medium">{article.originalTitle}</p>
              </div>
              
              <div>
                <h4 className="font-medium text-gray-700 mb-2">Research Abstract:</h4>
                <p className="text-gray-800 leading-relaxed">{article.originalAbstract}</p>
              </div>
            </div>
          </div>

          {/* Article Info Section */}
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-center text-gray-600">
                <User className="h-5 w-5 mr-2" />
                <div>
                  <span className="font-medium">Authors:</span>
                  <p className="text-gray-800">{article.authors}</p>
                </div>
              </div>

              <div className="flex items-center text-gray-600">
                <Calendar className="h-5 w-5 mr-2" />
                <div>
                  <span className="font-medium">Published:</span>
                  <p className="text-gray-800">{article.publishedDate}</p>
                </div>
              </div>

              <div className="flex items-center text-gray-600">
                <ExternalLink className="h-5 w-5 mr-2" />
                <div>
                  <span className="font-medium">ArXiv ID:</span>
                  <p className="text-gray-800">{article.arxivId}</p>
                </div>
              </div>
            </div>

            <div>
              <h4 className="font-medium text-gray-700 mb-3">Research Tags:</h4>
              <div className="flex flex-wrap gap-2">
                {article.categories && article.categories.length > 0 ? (
                  (() => {
                    // Filter out categories that contain periods or commas
                    const filteredCategories = article.categories.filter(category => !category.includes('.') && !category.includes(','));
                    
                    return filteredCategories.length > 0 ? (
                      <>
                        {filteredCategories.map((category, index) => (
                          <span 
                            key={index}
                            className="inline-flex items-center px-2 py-1 rounded-md bg-gray-100 text-gray-600 text-xs font-medium"
                          >
                            {category}
                          </span>
                        ))}
                      </>
                    ) : (
                      // Fallback to article.category if no valid categories remain
                      <span className="inline-flex items-center px-2 py-1 rounded-md bg-gray-100 text-gray-600 text-xs font-medium">
                        {article.category}
                      </span>
                    );
                  })()
                ) : (
                  <span className="inline-flex items-center px-2 py-1 rounded-md bg-gray-100 text-gray-600 text-xs font-medium">
                    {article.category}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Action Button */}
          <div className="pt-6 border-t border-gray-200">
            <a
              href={article.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center px-6 py-3 bg-primary-600 text-white font-medium rounded-lg hover:bg-primary-700 transition-colors"
            >
              <ExternalLink className="h-5 w-5 mr-2" />
              Read Full Research Paper
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ArticleModal; 