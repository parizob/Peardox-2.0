import React, { useState, useEffect, useRef } from 'react';
import { Search, ChevronDown, Filter, X, Bookmark, User } from 'lucide-react';

const Header = ({
  searchTerm,
  onSearchChange,
  selectedCategory,
  onCategoryChange,
  categories,
  onShowSavedArticles,
  onShowAccount,
  savedCount
}) => {
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);
  const [isCategoryDropdownOpen, setIsCategoryDropdownOpen] = useState(false);
  const [categorySearchTerm, setCategorySearchTerm] = useState('');
  const [scrollY, setScrollY] = useState(0);
  
  const dropdownRef = useRef(null);
  const categorySearchRef = useRef(null);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsCategoryDropdownOpen(false);
        setCategorySearchTerm('');
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Focus search input when dropdown opens
  useEffect(() => {
    if (isCategoryDropdownOpen && categorySearchRef.current) {
      setTimeout(() => categorySearchRef.current?.focus(), 100);
    }
  }, [isCategoryDropdownOpen]);

  const handleSearchClick = () => {
    setIsSearchExpanded(true);
  };

  const handleSearchClose = () => {
    setIsSearchExpanded(false);
    onSearchChange('');
  };

  const handleSearchChange = (e) => {
    onSearchChange(e.target.value);
  };

  const handleCategorySelect = (category) => {
    onCategoryChange(category.category_name);
    setIsCategoryDropdownOpen(false);
    setCategorySearchTerm('');
  };

  const handleClearCategory = () => {
    onCategoryChange('');
    setIsCategoryDropdownOpen(false);
    setCategorySearchTerm('');
  };

  // Filter categories based on search term
  const filteredCategories = categories.filter(category => 
    category.category_name?.toLowerCase().includes(categorySearchTerm.toLowerCase()) ||
    category.subject_class?.toLowerCase().includes(categorySearchTerm.toLowerCase())
  );

  // Find selected category name for display
  const selectedCategoryName = categories.find(cat => cat.category_name === selectedCategory)?.category_name || selectedCategory;

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      scrollY > 10 
        ? 'bg-white/90 backdrop-blur-lg shadow-lg border-b border-white/20' 
        : 'bg-white/70 backdrop-blur-sm'
    }`}>
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Left: Categories Dropdown */}
          <div className="flex-none" ref={dropdownRef}>
            <div className="relative">
              <button
                onClick={() => setIsCategoryDropdownOpen(!isCategoryDropdownOpen)}
                className={`inline-flex items-center px-4 py-2 text-sm font-medium rounded-xl transition-all duration-300 ${
                  selectedCategory
                    ? 'bg-blue-100 text-blue-800 border border-blue-200'
                    : 'bg-white/60 text-gray-700 border border-gray-200 hover:bg-gray-50'
                }`}
              >
                <Filter className="h-4 w-4 mr-2" />
                <span className="max-w-32 truncate">
                  {selectedCategory ? selectedCategoryName : 'Explore'}
                </span>
                <ChevronDown className={`h-4 w-4 ml-2 transition-transform duration-200 ${
                  isCategoryDropdownOpen ? 'rotate-180' : ''
                }`} />
              </button>

              {/* Dropdown Menu */}
              {isCategoryDropdownOpen && (
                <div className="absolute top-full left-0 mt-2 w-80 bg-white/95 backdrop-blur-xl border border-white/20 rounded-2xl shadow-2xl z-50">
                  {/* Search Input */}
                  <div className="p-4 border-b border-gray-100">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <input
                        ref={categorySearchRef}
                        type="text"
                        placeholder="Search categories..."
                        value={categorySearchTerm}
                        onChange={(e) => setCategorySearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </div>

                  {/* Categories List */}
                  <div className="max-h-64 overflow-y-auto">
                    {/* Clear Filter Option */}
                    {selectedCategory && (
                      <button
                        onClick={handleClearCategory}
                        className="w-full px-4 py-3 text-left hover:bg-blue-50 transition-colors duration-200 border-b border-gray-100"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-blue-600">
                            Clear Filter
                          </span>
                          <X className="h-4 w-4 text-blue-600" />
                        </div>
                      </button>
                    )}

                    {/* Category Options */}
                    {filteredCategories.length > 0 ? (
                      filteredCategories.map((category, index) => (
                        <button
                          key={index}
                          onClick={() => handleCategorySelect(category)}
                          className={`w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors duration-200 ${
                            selectedCategory === category.subject_class ? 'bg-blue-50' : ''
                          }`}
                        >
                          <div className="flex flex-col">
                            <span className="text-sm font-medium text-gray-900">
                              {category.category_name}
                            </span>
                            <span className="text-xs text-gray-500 mt-0.5">
                              {category.subject_class}
                            </span>
                          </div>
                        </button>
                      ))
                    ) : (
                      <div className="px-4 py-6 text-center text-gray-500 text-sm">
                        No categories found
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Center: Logo and Title */}
          <div className="flex-1 flex justify-center">
            <div className="flex items-center space-x-3">
              <img 
                src="/logo512.png" 
                alt="Pearadox" 
                className="h-10 w-10"
              />
              <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Pearadox
              </h1>
            </div>
          </div>

          {/* Right: Search and Action Icons */}
          <div className="flex-none flex items-center space-x-3">
            {/* Search */}
            <div className="relative">
              {isSearchExpanded ? (
                <div className="flex items-center bg-white/80 backdrop-blur-sm border border-white/30 rounded-2xl px-4 py-2 shadow-lg">
                  <Search className="h-5 w-5 text-gray-400 mr-3" />
                  <input
                    type="text"
                    placeholder="Search articles..."
                    value={searchTerm}
                    onChange={handleSearchChange}
                    className="bg-transparent placeholder-gray-400 text-gray-900 focus:outline-none w-64"
                    autoFocus
                  />
                  <button
                    onClick={handleSearchClose}
                    className="ml-3 p-1 hover:bg-gray-100 rounded-full transition-colors duration-200"
                  >
                    <X className="h-4 w-4 text-gray-400" />
                  </button>
                  <kbd className="ml-3 px-2 py-1 text-xs text-gray-500 bg-gray-100 rounded">⌘K</kbd>
                </div>
              ) : (
                <button
                  onClick={handleSearchClick}
                  className="flex items-center bg-white/60 backdrop-blur-sm text-gray-600 border border-white/30 rounded-2xl px-4 py-2 hover:bg-white/80 transition-all duration-300 shadow-md hover:shadow-lg"
                >
                  <Search className="h-5 w-5 mr-2" />
                  <span className="text-sm">Search</span>
                  <kbd className="ml-2 px-2 py-1 text-xs text-gray-500 bg-gray-100 rounded">⌘K</kbd>
                </button>
              )}
            </div>

            {/* Saved Articles */}
            <button
              onClick={onShowSavedArticles}
              className="relative p-3 bg-white/60 backdrop-blur-sm text-gray-600 border border-white/30 rounded-2xl hover:bg-white/80 transition-all duration-300 shadow-md hover:shadow-lg"
              title="Saved Articles"
            >
              <Bookmark className="h-5 w-5" />
              {savedCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-6 w-6 flex items-center justify-center font-bold">
                  {savedCount > 99 ? '99+' : savedCount}
                </span>
              )}
            </button>

            {/* Account */}
            <button
              onClick={onShowAccount}
              className="p-3 bg-white/60 backdrop-blur-sm text-gray-600 border border-white/30 rounded-2xl hover:bg-white/80 transition-all duration-300 shadow-md hover:shadow-lg"
              title="Account"
            >
              <User className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header; 