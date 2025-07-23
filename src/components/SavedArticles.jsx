import React from 'react';
import { X, Heart, ExternalLink, Calendar, Tag } from 'lucide-react';

const SavedArticles = ({ isOpen, onClose, savedArticles, onArticleClick, onToggleFavorite }) => {
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
      <div className={`fixed top-0 right-0 h-full w-96 bg-white shadow-2xl transform transition-transform duration-300 ease-in-out z-50 ${
        isOpen ? 'translate-x-0' : 'translate-x-full'
      }`}>
        {/* Header */}
        <div className="bg-gradient-to-r from-red-50 to-pink-50 border-b border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Heart className="h-6 w-6 text-red-600" />
              <div>
                <h2 className="text-xl font-bold text-gray-900">Saved Articles</h2>
                <p className="text-sm text-gray-600">{savedArticles.length} article{savedArticles.length !== 1 ? 's' : ''} saved</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white hover:bg-opacity-50 rounded-full transition-colors"
            >
              <X className="h-6 w-6 text-gray-500" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4">
          {savedArticles.length === 0 ? (
            <div className="text-center py-12">
              <Heart className="mx-auto h-12 w-12 text-gray-300 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No saved articles yet</h3>
              <p className="text-gray-500 text-sm">
                Click the heart icon on any article to save it here for later reading.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {savedArticles.map(article => (
                <div
                  key={article.id}
                  className="bg-gray-50 rounded-lg p-4 hover:bg-gray-100 transition-colors cursor-pointer border border-gray-200"
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
                      className="p-1 text-red-600 hover:bg-red-50 rounded-full transition-colors"
                      title="Remove from favorites"
                    >
                      <Heart className="h-4 w-4 fill-current" />
                    </button>
                  </div>

                  {/* Article Title */}
                  <h3 className="font-semibold text-gray-900 mb-2 text-sm leading-tight">
                    {article.title}
                  </h3>

                  {/* Article Description */}
                  <p className="text-gray-600 text-xs mb-3 line-clamp-2 leading-relaxed">
                    {article.shortDescription}
                  </p>

                  {/* Article Meta */}
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <div className="flex items-center space-x-3">
                      <span className="flex items-center">
                        <Calendar className="h-3 w-3 mr-1" />
                        {article.publishedDate}
                      </span>
                      <span className="flex items-center">
                        <ExternalLink className="h-3 w-3 mr-1" />
                        {article.arxivId}
                      </span>
                    </div>
                  </div>

                  {/* Read More Button */}
                  <div className="mt-3 pt-3 border-t border-gray-200">
                    <span className="text-primary-600 font-medium text-xs">
                      Click to read more →
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default SavedArticles; 