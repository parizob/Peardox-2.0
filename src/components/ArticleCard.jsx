import React from 'react';
import { Calendar, Heart, ArrowUpRight } from 'lucide-react';

const ArticleCard = ({ article, onClick, isFavorite, onToggleFavorite }) => {
  const handleFavoriteClick = (e) => {
    e.stopPropagation();
    onToggleFavorite(article.id);
  };

  return (
    <div 
      className="group relative bg-white border border-gray-200 rounded-2xl p-5 sm:p-6 cursor-pointer transition-all duration-300 hover:shadow-lg hover:border-gray-300 hover:-translate-y-0.5"
      onClick={() => onClick(article)}
    >
      {/* Favorite Button */}
      <button
        onClick={handleFavoriteClick}
        className={`absolute top-4 right-4 p-2 rounded-full transition-all duration-200 z-10 ${
          isFavorite 
            ? 'bg-red-50 text-red-500' 
            : 'bg-gray-100 text-gray-400 hover:bg-gray-200 hover:text-gray-600'
        }`}
        title={isFavorite ? 'Remove from saved' : 'Save article'}
      >
        <Heart 
          className={`h-4 w-4 transition-all duration-200 ${
            isFavorite ? 'fill-current' : ''
          }`} 
        />
      </button>

      {/* Title */}
      <h3 className="text-lg sm:text-xl font-bold text-gray-900 leading-tight mb-3 pr-10 group-hover:text-gray-700 transition-colors duration-200">
        {article.title}
      </h3>

      {/* Description */}
      <p className="text-gray-600 leading-relaxed line-clamp-3 text-sm sm:text-[15px] mb-4">
        {article.shortDescription}
      </p>

      {/* Categories */}
      <div className="flex flex-wrap gap-1.5 mb-4">
        {article.categories && article.categories.length > 0 ? (
          (() => {
            const filteredCategories = article.categories.filter(category => !category.includes('.') && !category.includes(','));
            
            return filteredCategories.length > 0 ? (
              <>
                {filteredCategories.slice(0, 2).map((category, index) => (
                  <span 
                    key={index}
                    className="inline-flex items-center px-2.5 py-1 rounded-full bg-gray-100 text-gray-600 text-xs font-medium"
                  >
                    {category}
                  </span>
                ))}
                {filteredCategories.length > 2 && (
                  <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-gray-100 text-gray-500 text-xs">
                    +{filteredCategories.length - 2}
                  </span>
                )}
              </>
            ) : (
              <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-gray-100 text-gray-600 text-xs font-medium">
                {article.category}
              </span>
            );
          })()
        ) : (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-gray-100 text-gray-600 text-xs font-medium">
            {article.category}
          </span>
        )}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between pt-4 border-t border-gray-100">
        <div className="flex items-center text-sm text-gray-500">
          <Calendar className="w-4 h-4 mr-1.5" />
          <span>{article.publishedDate}</span>
        </div>
        
        <span 
          className="inline-flex items-center text-sm font-semibold transition-all duration-200 group-hover:gap-2"
          style={{ color: '#1db954' }}
        >
          Read
          <ArrowUpRight className="w-4 h-4 ml-1 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform duration-200" />
        </span>
      </div>
    </div>
  );
};

export default ArticleCard;
