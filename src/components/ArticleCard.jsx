import React from 'react';
import { Calendar, Heart, ArrowUpRight } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

const ArticleCard = ({ article, onClick, isFavorite, onToggleFavorite }) => {
  const { isDarkMode } = useTheme();
  
  const handleFavoriteClick = (e) => {
    e.stopPropagation();
    onToggleFavorite(article.id);
  };

  return (
    <div 
      className={`group relative border rounded-2xl p-5 sm:p-6 cursor-pointer transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5 ${
        isDarkMode 
          ? 'bg-gray-800 border-gray-700 hover:border-gray-600' 
          : 'bg-white border-gray-200 hover:border-gray-300'
      }`}
      onClick={() => onClick(article)}
    >
      {/* Favorite Button */}
      <button
        onClick={handleFavoriteClick}
        className={`absolute top-4 right-4 p-2 rounded-full transition-all duration-200 z-10 ${
          isFavorite 
            ? 'bg-red-50 text-red-500 dark:bg-red-900/30 dark:text-red-400' 
            : isDarkMode 
              ? 'bg-gray-700 text-gray-400 hover:bg-gray-600 hover:text-gray-300' 
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
      <h3 className={`text-lg sm:text-xl font-bold leading-tight mb-3 pr-10 transition-colors duration-200 ${
        isDarkMode 
          ? 'text-white group-hover:text-gray-200' 
          : 'text-gray-900 group-hover:text-gray-700'
      }`}>
        {article.title}
      </h3>

      {/* Description */}
      <p className={`leading-relaxed line-clamp-3 text-sm sm:text-[15px] mb-4 ${
        isDarkMode ? 'text-gray-400' : 'text-gray-600'
      }`}>
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
                    className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                      isDarkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-600'
                    }`}
                  >
                    {category}
                  </span>
                ))}
                {filteredCategories.length > 2 && (
                  <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs ${
                    isDarkMode ? 'bg-gray-700 text-gray-400' : 'bg-gray-100 text-gray-500'
                  }`}>
                    +{filteredCategories.length - 2}
                  </span>
                )}
              </>
            ) : (
              <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                isDarkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-600'
              }`}>
                {article.category}
              </span>
            );
          })()
        ) : (
          <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
            isDarkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-600'
          }`}>
            {article.category}
          </span>
        )}
      </div>

      {/* Footer */}
      <div className={`flex items-center justify-between pt-4 border-t ${
        isDarkMode ? 'border-gray-700' : 'border-gray-100'
      }`}>
        <div className={`flex items-center text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
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
