import React, { useState, useEffect } from 'react';
import { Search, User, Heart, ChevronDown, Filter, X } from 'lucide-react';

const Header = ({ 
  searchTerm, 
  onSearchChange, 
  selectedCategory, 
  onCategoryChange, 
  categories,
  onShowSavedArticles,
  onShowAccount,
  savedCount = 0
}) => {
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);
  const [isCategoryDropdownOpen, setIsCategoryDropdownOpen] = useState(false);
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleSearchClick = () => {
    setIsSearchExpanded(true);
  };

  const handleSearchClose = () => {
    setIsSearchExpanded(false);
    onSearchChange('');
  };

  const handleCategorySelect = (category) => {
    onCategoryChange(category);
    setIsCategoryDropdownOpen(false);
  };

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

  return (
    <>
      {/* Immersive Search Overlay */}
      {isSearchExpanded && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-xl z-50 flex items-center justify-center">
          <div className="w-full max-w-3xl mx-4">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-purple-600/20 rounded-2xl blur-xl"></div>
              <div className="relative bg-white/10 backdrop-blur-2xl border border-white/20 rounded-2xl p-8">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-white">Discover Science</h2>
                  <button
                    onClick={handleSearchClose}
                    className="p-2 text-white/70 hover:text-white hover:bg-white/10 rounded-full transition-all"
                  >
                    <X className="h-6 w-6" />
                  </button>
                </div>
                <div className="relative">
                  <Search className="absolute left-6 top-1/2 transform -translate-y-1/2 h-6 w-6 text-white/50" />
                  <input
                    type="text"
                    placeholder="Search for groundbreaking research..."
                    value={searchTerm}
                    onChange={(e) => onSearchChange(e.target.value)}
                    autoFocus
                    className="w-full pl-16 pr-6 py-6 bg-white/10 border border-white/20 rounded-2xl text-white placeholder-white/50 text-lg focus:outline-none focus:ring-2 focus:ring-white/30 focus:border-white/30 backdrop-blur-sm"
                  />
                </div>
                {searchTerm && (
                  <div className="mt-4 text-white/70 text-sm">
                    Press Enter to search • ESC to close
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Header */}
      <header className={`fixed top-0 left-0 right-0 z-40 transition-all duration-500 ${
        scrollY > 10 
          ? 'bg-white/80 backdrop-blur-xl border-b border-white/20 shadow-xl' 
          : 'bg-white/95 backdrop-blur-md'
      }`}>
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            
            {/* Left - Dynamic Categories */}
            <div className="flex-1 flex justify-start">
              <div className="relative">
                <button
                  onClick={() => setIsCategoryDropdownOpen(!isCategoryDropdownOpen)}
                  className={`group flex items-center space-x-3 px-6 py-3 rounded-2xl transition-all duration-300 ${
                    selectedCategory 
                      ? `bg-gradient-to-r ${getCategoryColor(selectedCategory)} text-white shadow-lg transform hover:scale-105`
                      : 'bg-gray-50 hover:bg-gray-100 text-gray-700 hover:shadow-md'
                  }`}
                >
                  <Filter className="h-4 w-4" />
                  <span className="font-medium text-sm">
                    {selectedCategory || 'Explore'}
                  </span>
                  <ChevronDown 
                    className={`h-4 w-4 transition-transform duration-300 ${
                      isCategoryDropdownOpen ? 'rotate-180' : ''
                    }`} 
                  />
                </button>

                {/* Sleek Dropdown */}
                {isCategoryDropdownOpen && (
                  <>
                    <div 
                      className="fixed inset-0 z-10"
                      onClick={() => setIsCategoryDropdownOpen(false)}
                    />
                    <div className="absolute top-full left-0 mt-3 w-80 bg-white/95 backdrop-blur-xl border border-white/20 rounded-2xl shadow-2xl z-20 overflow-hidden">
                      <div className="p-2">
                        <button
                          onClick={() => handleCategorySelect('')}
                          className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                            !selectedCategory 
                              ? 'bg-gradient-to-r from-gray-100 to-gray-50 text-gray-900 shadow-sm' 
                              : 'hover:bg-gray-50 text-gray-700'
                          }`}
                        >
                          <div className={`w-3 h-3 rounded-full bg-gradient-to-r from-gray-400 to-gray-300 ${
                            !selectedCategory ? 'shadow-md' : ''
                          }`} />
                          <span className="font-medium">All Categories</span>
                        </button>
                        
                        {categories.map(category => (
                          <button
                            key={category}
                            onClick={() => handleCategorySelect(category)}
                            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 group ${
                              selectedCategory === category 
                                ? `bg-gradient-to-r ${getCategoryColor(category)} text-white shadow-lg transform scale-[1.02]`
                                : 'hover:bg-gray-50 text-gray-700 hover:transform hover:scale-[1.01]'
                            }`}
                          >
                            <div className={`w-3 h-3 rounded-full bg-gradient-to-r ${getCategoryColor(category)} ${
                              selectedCategory === category ? 'bg-white/30 shadow-lg' : 'shadow-md'
                            }`} />
                            <span className="font-medium text-sm">{category}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Center - Premium Branding */}
            <div className="flex items-center space-x-4 group cursor-pointer">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-xl blur-md group-hover:blur-lg transition-all"></div>
                <img 
                  src="/logo512.png" 
                  alt="Pearadox Logo" 
                  className="relative h-12 w-12 rounded-xl shadow-lg transform group-hover:scale-105 transition-all duration-300"
                />
              </div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 bg-clip-text text-transparent group-hover:from-blue-600 group-hover:via-purple-600 group-hover:to-blue-600 transition-all duration-500">
                Pearadox
              </h1>
            </div>

            {/* Right - Action Center */}
            <div className="flex-1 flex justify-end items-center space-x-4">
              
              {/* Search Trigger */}
              <button
                onClick={handleSearchClick}
                className="group flex items-center space-x-3 px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-2xl hover:from-blue-600 hover:to-purple-600 transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl"
              >
                <Search className="h-4 w-4" />
                <span className="font-medium text-sm">Search</span>
                <div className="w-px h-4 bg-white/30"></div>
                <span className="text-xs opacity-75">⌘K</span>
              </button>

              {/* Saved Articles */}
              <button
                onClick={onShowSavedArticles}
                className="relative p-3 text-gray-600 hover:text-red-500 hover:bg-red-50 rounded-2xl transition-all duration-300 group"
                title="Saved Articles"
              >
                <Heart className="h-6 w-6 group-hover:scale-110 transition-transform" />
                {savedCount > 0 && (
                  <div className="absolute -top-1 -right-1 bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs rounded-full h-6 w-6 flex items-center justify-center font-bold shadow-lg animate-pulse">
                    {savedCount}
                  </div>
                )}
              </button>
              
              {/* Account */}
              <button
                onClick={onShowAccount}
                className="p-3 text-gray-600 hover:text-blue-500 hover:bg-blue-50 rounded-2xl transition-all duration-300 group"
                title="Account"
              >
                <User className="h-6 w-6 group-hover:scale-110 transition-transform" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Content Spacer */}
      <div className="h-20"></div>
    </>
  );
};

export default Header; 