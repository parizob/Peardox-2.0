import React from 'react';
import { ExternalLink, Calendar, Tag, Heart } from 'lucide-react';

const ArticleCard = ({ article, onClick, isFavorite, onToggleFavorite }) => {
  const getCategoryColor = (category) => {
    const colors = {
      'Artificial Intelligence': 'from-blue-500 to-cyan-400',
      'Quantum Computing': 'from-purple-500 to-pink-400',
      'Edge Computing': 'from-green-500 to-emerald-400',
      'Computer Vision': 'from-orange-500 to-yellow-400',
      'Natural Language Processing': 'from-indigo-500 to-purple-400',
      'Machine Learning': 'from-teal-500 to-green-400',
      'Information Retrieval': 'from-pink-500 to-rose-400',
      'Computation and Language': 'from-indigo-500 to-blue-400',
      'Computers and Society': 'from-gray-600 to-gray-500',
    };
    
    // Hash-based color assignment for categories not in the map
    if (!colors[category]) {
      const colorOptions = [
        'from-blue-500 to-cyan-400',
        'from-purple-500 to-pink-400', 
        'from-green-500 to-emerald-400',
        'from-orange-500 to-yellow-400',
        'from-indigo-500 to-purple-400',
        'from-red-500 to-pink-400',
        'from-teal-500 to-green-400',
        'from-pink-500 to-rose-400'
      ];
      
      let hash = 0;
      for (let i = 0; i < category.length; i++) {
        hash = category.charCodeAt(i) + ((hash << 5) - hash);
      }
      hash = Math.abs(hash);
      
      return colorOptions[hash % colorOptions.length];
    }
    
    return colors[category];
  };

  const handleFavoriteClick = (e) => {
    e.stopPropagation();
    onToggleFavorite(article.id);
  };

  return (
    <div 
      className="group relative bg-white border border-gray-200 rounded-xl sm:rounded-2xl p-4 sm:p-6 cursor-pointer transition-all duration-300 hover:shadow-xl hover:border-gray-300 hover:-translate-y-1"
      onClick={() => onClick(article)}
    >
      {/* Favorite Heart */}
      <button
        onClick={handleFavoriteClick}
        className={`absolute top-3 right-3 sm:top-4 sm:right-4 p-1.5 sm:p-2 rounded-lg transition-all duration-300 z-10 ${
          isFavorite 
            ? 'bg-red-50 text-red-600' 
            : 'bg-gray-50 text-gray-400 hover:bg-red-50 hover:text-red-500'
        }`}
        title={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
      >
        <Heart 
          className={`h-3.5 w-3.5 sm:h-4 sm:w-4 transition-all duration-300 ${
            isFavorite ? 'fill-current' : ''
          }`} 
        />
      </button>

      {/* Main Content */}
      <div className="space-y-3 sm:space-y-4">
        {/* Title - Now the star of the show */}
        <h3 className="text-lg sm:text-xl font-bold text-gray-900 leading-tight pr-6 sm:pr-8 group-hover:text-blue-900 transition-colors duration-300">
          {article.title}
        </h3>

        {/* Description - Clean and prominent */}
        <p className="text-gray-600 leading-relaxed line-clamp-3 text-sm sm:text-base">
          {article.shortDescription}
        </p>

        {/* Meta Information */}
        <div className="flex items-center justify-between text-xs sm:text-sm text-gray-500 border-t border-gray-100 pt-3 sm:pt-4">
          <div className="flex items-center">
            <Calendar className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1.5 sm:mr-2" />
            <span className="truncate">{article.publishedDate}</span>
          </div>
          
          <div className="flex items-center text-blue-600 group-hover:text-blue-800 transition-colors duration-300 flex-shrink-0 ml-2">
            <ExternalLink className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1" />
            <span className="font-medium">Read More</span>
          </div>
        </div>

        {/* Categories - Now at bottom, subtle */}
        <div className="flex flex-wrap gap-1.5 sm:gap-2 pt-2 sm:pt-3">
          {article.categories && article.categories.length > 0 ? (
            (() => {
              // Filter out categories that contain periods or commas
              const filteredCategories = article.categories.filter(category => !category.includes('.') && !category.includes(','));
              
              return filteredCategories.length > 0 ? (
                <>
                  {filteredCategories.slice(0, 2).map((category, index) => (
                    <span 
                      key={index}
                      className="inline-flex items-center px-2 py-0.5 sm:py-1 rounded-md bg-gray-100 text-gray-600 text-xs font-medium"
                    >
                      {category}
                    </span>
                  ))}
                  {filteredCategories.length > 2 && (
                    <span className="inline-flex items-center px-2 py-0.5 sm:py-1 rounded-md bg-gray-100 text-gray-500 text-xs">
                      +{filteredCategories.length - 2} more
                    </span>
                  )}
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
  );
};

export default ArticleCard; 