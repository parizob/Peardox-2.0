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
    };
    return colors[category] || 'from-gray-500 to-gray-400';
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

      {/* Category Badge */}
      <div className="relative mb-6">
        <div className={`inline-flex items-center px-4 py-2 rounded-2xl bg-gradient-to-r ${getCategoryColor(article.category)} text-white shadow-lg`}>
          <Tag className="w-4 h-4 mr-2" />
          <span className="text-sm font-bold">{article.category}</span>
        </div>
      </div>

      {/* Title */}
      <h3 className="text-2xl font-bold text-gray-900 mb-4 leading-tight group-hover:text-blue-900 transition-colors duration-300">
        {article.title}
      </h3>

      {/* Description */}
      <p className="text-gray-600 mb-6 line-clamp-3 leading-relaxed text-base">
        {article.shortDescription}
      </p>

      {/* Meta Information */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-4 text-sm text-gray-500">
          <div className="flex items-center bg-gray-50/80 backdrop-blur-sm rounded-full px-3 py-1">
            <Calendar className="h-4 w-4 mr-2" />
            <span className="font-medium">{article.publishedDate}</span>
          </div>
          <div className="flex items-center bg-gray-50/80 backdrop-blur-sm rounded-full px-3 py-1">
            <ExternalLink className="h-4 w-4 mr-2" />
            <span className="font-medium">{article.arxivId}</span>
          </div>
        </div>
      </div>

      {/* Call to Action */}
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl blur-lg opacity-0 group-hover:opacity-30 transition-opacity duration-500"></div>
        <div className="relative bg-gradient-to-r from-gray-50 to-white border border-gray-200/50 rounded-2xl p-4 group-hover:from-blue-50 group-hover:to-purple-50 group-hover:border-blue-200/50 transition-all duration-500">
          <div className="flex items-center justify-between">
            <span className="font-bold text-gray-700 group-hover:text-blue-700 transition-colors duration-300">
              Explore Research
            </span>
            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
              <ExternalLink className="h-4 w-4 text-white" />
            </div>
          </div>
        </div>
      </div>

      {/* Hover Accent Line */}
      <div className="absolute bottom-0 left-8 right-8 h-1 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left"></div>
    </div>
  );
};

export default ArticleCard; 