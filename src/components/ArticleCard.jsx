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
      className="group relative bg-white/70 backdrop-blur-xl border border-white/20 rounded-3xl p-8 cursor-pointer transition-all duration-500 hover:bg-white/80 hover:shadow-2xl hover:shadow-blue-500/10 hover:-translate-y-2 hover:scale-[1.02]"
      onClick={() => onClick(article)}
    >
      {/* Background Glow Effect */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/40 to-transparent rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
      
      {/* Favorite Heart */}
      <button
        onClick={handleFavoriteClick}
        className={`absolute top-6 right-6 p-3 rounded-2xl transition-all duration-300 z-10 ${
          isFavorite 
            ? 'bg-gradient-to-r from-red-500 to-pink-500 text-white shadow-lg shadow-red-500/25 scale-110' 
            : 'bg-white/60 backdrop-blur-sm text-gray-400 hover:bg-red-50 hover:text-red-500 hover:scale-110'
        }`}
        title={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
      >
        <Heart 
          className={`h-5 w-5 transition-all duration-300 ${
            isFavorite ? 'fill-current' : ''
          }`} 
        />
      </button>

      {/* Categories Section */}
      <div className="relative mb-6">
        <div className="flex flex-wrap gap-2">
          {article.categories && article.categories.length > 0 ? (
            (() => {
              // Filter out categories that contain periods or commas
              const filteredCategories = article.categories.filter(category => !category.includes('.') && !category.includes(','));
              
              return filteredCategories.length > 0 ? (
                <>
                  {filteredCategories.slice(0, 3).map((category, index) => (
                    <div 
                      key={index}
                      className={`inline-flex items-center px-3 py-1.5 rounded-xl bg-gradient-to-r ${getCategoryColor(category)} text-white shadow-md text-xs font-semibold`}
                    >
                      <Tag className="w-3 h-3 mr-1.5" />
                      <span>{category}</span>
                    </div>
                  ))}
                  {filteredCategories.length > 3 && (
                    <div className="inline-flex items-center px-3 py-1.5 rounded-xl bg-gray-100 text-gray-600 text-xs font-semibold">
                      +{filteredCategories.length - 3} more
                    </div>
                  )}
                </>
              ) : (
                // Fallback to article.category if no valid categories remain
                <div className={`inline-flex items-center px-3 py-1.5 rounded-xl bg-gradient-to-r ${getCategoryColor(article.category)} text-white shadow-md text-xs font-semibold`}>
                  <Tag className="w-3 h-3 mr-1.5" />
                  <span>{article.category}</span>
                </div>
              );
            })()
          ) : (
            <div className={`inline-flex items-center px-3 py-1.5 rounded-xl bg-gradient-to-r ${getCategoryColor(article.category)} text-white shadow-md text-xs font-semibold`}>
              <Tag className="w-3 h-3 mr-1.5" />
              <span>{article.category}</span>
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="relative space-y-4">
        {/* Title */}
        <h3 className="text-xl font-bold text-gray-900 leading-tight group-hover:text-blue-900 transition-colors duration-300">
          {article.title}
        </h3>

        {/* Description */}
        <p className="text-gray-600 leading-relaxed line-clamp-3">
          {article.shortDescription}
        </p>

        {/* Meta Information */}
        <div className="flex items-center justify-between text-sm text-gray-500">
          <div className="flex items-center space-x-4">
            <div className="flex items-center">
              <Calendar className="w-4 h-4 mr-2" />
              <span>{article.publishedDate}</span>
            </div>
          </div>
          
          <div className="flex items-center text-blue-600 group-hover:text-blue-800 transition-colors duration-300">
            <ExternalLink className="w-4 h-4 mr-1" />
            <span className="font-medium">Read More</span>
          </div>
        </div>

        {/* Authors */}
        <div className="text-sm text-gray-500 border-t border-gray-100 pt-3">
          <span className="font-medium text-gray-700">Authors:</span> {article.authors}
        </div>
      </div>

      {/* Animated Border */}
      <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-cyan-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500 -z-10 blur-xl"></div>
    </div>
  );
};

export default ArticleCard; 