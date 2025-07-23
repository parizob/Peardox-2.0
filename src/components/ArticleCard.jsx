import React from 'react';
import { ExternalLink, Calendar, Tag, Heart } from 'lucide-react';

const ArticleCard = ({ article, onClick, isFavorite, onToggleFavorite }) => {
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

  const handleFavoriteClick = (e) => {
    e.stopPropagation(); // Prevent card click when clicking heart
    onToggleFavorite(article.id);
  };

  return (
    <div 
      className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 p-6 cursor-pointer border border-gray-200 hover:border-primary-300 relative"
      onClick={() => onClick(article)}
    >
      {/* Favorite Heart Icon */}
      <button
        onClick={handleFavoriteClick}
        className={`absolute top-4 right-4 p-2 rounded-full transition-all duration-200 ${
          isFavorite 
            ? 'bg-red-50 text-red-600 hover:bg-red-100' 
            : 'bg-gray-50 text-gray-400 hover:bg-red-50 hover:text-red-500'
        }`}
        title={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
      >
        <Heart 
          className={`h-5 w-5 transition-all duration-200 ${
            isFavorite ? 'fill-current' : ''
          }`} 
        />
      </button>

      <div className="pr-12"> {/* Add right padding to avoid overlap with heart */}
        <div className="flex items-start justify-between mb-3">
          <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getCategoryColor(article.category)}`}>
            <Tag className="w-3 h-3 mr-1" />
            {article.category}
          </span>
        </div>

        <h3 className="text-xl font-semibold text-gray-900 mb-3 leading-tight">
          {article.title}
        </h3>

        <p className="text-gray-600 mb-4 line-clamp-3 leading-relaxed">
          {article.shortDescription}
        </p>

        <div className="flex items-center justify-between">
          <div className="flex items-center text-sm text-gray-500 space-x-4">
            <span className="flex items-center">
              <Calendar className="h-4 w-4 mr-1" />
              {article.publishedDate}
            </span>
            <span className="flex items-center">
              <ExternalLink className="h-4 w-4 mr-1" />
              {article.arxivId}
            </span>
          </div>
        </div>

        <div className="mt-4 pt-4 border-t border-gray-100">
          <button className="text-primary-600 hover:text-primary-700 font-medium text-sm transition-colors">
            Read More →
          </button>
        </div>
      </div>
    </div>
  );
};

export default ArticleCard; 