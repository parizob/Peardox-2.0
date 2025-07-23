import React, { useState } from 'react';
import { Search, User, Heart, ChevronDown, Filter } from 'lucide-react';

const Header = ({ 
  searchTerm, 
  onSearchChange, 
  selectedCategory, 
  onCategoryChange, 
  categories,
  onShowSavedArticles,
  savedCount = 0
}) => {
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);
  const [isCategoryDropdownOpen, setIsCategoryDropdownOpen] = useState(false);

  const handleSearchClick = () => {
    setIsSearchExpanded(true);
  };

  const handleSearchBlur = () => {
    if (!searchTerm) {
      setIsSearchExpanded(false);
    }
  };

  const handleSearchChange = (value) => {
    onSearchChange(value);
    if (!value) {
      setIsSearchExpanded(false);
    }
  };

  const handleCategorySelect = (category) => {
    onCategoryChange(category);
    setIsCategoryDropdownOpen(false);
  };

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex items-center justify-between">
          {/* Left Side - Categories Dropdown */}
          <div className="flex-1 flex justify-start">
            <div className="relative">
              <button
                onClick={() => setIsCategoryDropdownOpen(!isCategoryDropdownOpen)}
                className="flex items-center space-x-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:border-gray-400 hover:shadow-sm transition-all duration-200 min-w-[180px] justify-between"
              >
                <div className="flex items-center space-x-2">
                  <Filter className="h-4 w-4 text-gray-500" />
                  <span className="text-sm font-medium text-gray-700">
                    {selectedCategory || 'All Categories'}
                  </span>
                </div>
                <ChevronDown 
                  className={`h-4 w-4 text-gray-400 transition-transform duration-200 ${
                    isCategoryDropdownOpen ? 'rotate-180' : ''
                  }`} 
                />
              </button>

              {/* Custom Dropdown Menu */}
              {isCategoryDropdownOpen && (
                <>
                  {/* Backdrop */}
                  <div 
                    className="fixed inset-0 z-10"
                    onClick={() => setIsCategoryDropdownOpen(false)}
                  />
                  
                  {/* Dropdown Content */}
                  <div className="absolute top-full left-0 mt-2 w-full bg-white border border-gray-200 rounded-lg shadow-lg z-20 overflow-hidden">
                    <div className="py-1">
                      <button
                        onClick={() => handleCategorySelect('')}
                        className={`w-full px-4 py-3 text-left text-sm hover:bg-gray-50 transition-colors ${
                          !selectedCategory ? 'bg-primary-50 text-primary-700 font-medium' : 'text-gray-700'
                        }`}
                      >
                        <div className="flex items-center space-x-2">
                          <div className={`w-2 h-2 rounded-full ${
                            !selectedCategory ? 'bg-primary-500' : 'bg-transparent'
                          }`} />
                          <span>All Categories</span>
                        </div>
                      </button>
                      
                      {categories.map(category => (
                        <button
                          key={category}
                          onClick={() => handleCategorySelect(category)}
                          className={`w-full px-4 py-3 text-left text-sm hover:bg-gray-50 transition-colors ${
                            selectedCategory === category ? 'bg-primary-50 text-primary-700 font-medium' : 'text-gray-700'
                          }`}
                        >
                          <div className="flex items-center space-x-2">
                            <div className={`w-2 h-2 rounded-full ${
                              selectedCategory === category ? 'bg-primary-500' : 'bg-transparent'
                            }`} />
                            <span>{category}</span>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Center - Pearadox Branding */}
          <div className="flex items-center space-x-3">
            <img 
              src="/logo512.png" 
              alt="Pearadox Logo" 
              className="h-10 w-10"
            />
            <h1 className="text-3xl font-bold text-gray-900">Pearadox</h1>
          </div>

          {/* Right Side - Search, Saved Articles, and Account */}
          <div className="flex-1 flex justify-end items-center space-x-4">
            {/* Expandable Search */}
            <div className="relative">
              {!isSearchExpanded ? (
                <button
                  onClick={handleSearchClick}
                  className="flex items-center space-x-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-full transition-colors text-gray-700"
                >
                  <Search className="h-4 w-4" />
                  <span className="text-sm font-medium">Search</span>
                </button>
              ) : (
                <div className="relative">
                  <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search articles..."
                    value={searchTerm}
                    onChange={(e) => handleSearchChange(e.target.value)}
                    onBlur={handleSearchBlur}
                    autoFocus
                    className="w-64 pl-9 pr-4 py-2 border border-gray-300 rounded-full focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
                  />
                </div>
              )}
            </div>

            {/* Saved Articles Icon */}
            <button
              onClick={onShowSavedArticles}
              className="relative p-2 text-gray-600 hover:text-primary-600 hover:bg-gray-50 rounded-full transition-colors"
              title="Saved Articles"
            >
              <Heart className="h-6 w-6" />
              {savedCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {savedCount}
                </span>
              )}
            </button>
            
            {/* Account Icon */}
            <button
              className="p-2 text-gray-600 hover:text-primary-600 hover:bg-gray-50 rounded-full transition-colors"
              title="Account"
            >
              <User className="h-6 w-6" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header; 