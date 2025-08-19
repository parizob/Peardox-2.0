import React, { useState, useEffect, useRef } from 'react';
import { Search, ChevronDown, Filter, X, Bookmark, User, Info, BookOpen } from 'lucide-react';
import { Link } from 'react-router-dom';

const Header = ({
  searchTerm,
  onSearchChange,
  selectedCategory,
  onCategoryChange,
  categories,
  onShowSavedArticles,
  onShowAccount,
  savedCount,
  isAboutPage = false,
  isBlogPage = false
}) => {
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);
  const [isCategoryDropdownOpen, setIsCategoryDropdownOpen] = useState(false);
  const [categorySearchTerm, setCategorySearchTerm] = useState('');
  const [scrollY, setScrollY] = useState(0);
  
  const dropdownRef = useRef(null);
  const mobileDropdownRef = useRef(null);
  const categorySearchRef = useRef(null);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      const isOutsideDesktop = dropdownRef.current && !dropdownRef.current.contains(event.target);
      const isOutsideMobile = mobileDropdownRef.current && !mobileDropdownRef.current.contains(event.target);
      
      if (isOutsideDesktop && isOutsideMobile) {
        setIsCategoryDropdownOpen(false);
        setCategorySearchTerm('');
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (isCategoryDropdownOpen && categorySearchRef.current) {
      setTimeout(() => categorySearchRef.current?.focus(), 100);
    }
  }, [isCategoryDropdownOpen]);

  const handleSearchClick = () => setIsSearchExpanded(true);
  const handleSearchClose = () => {
    setIsSearchExpanded(false);
    onSearchChange('');
  };
  const handleSearchChange = (e) => onSearchChange(e.target.value);

  const handleCategorySelect = (category) => {
    console.log('Category selected:', category); // Debug log
    onCategoryChange(category.category_name);
    setIsCategoryDropdownOpen(false);
    setCategorySearchTerm('');
  };

  const handleClearCategory = () => {
    console.log('Clearing category'); // Debug log
    onCategoryChange('');
    setIsCategoryDropdownOpen(false);
    setCategorySearchTerm('');
  };

  // Filter categories based on search term
  const filteredCategories = categories.filter(category => 
    category.category_name?.toLowerCase().includes(categorySearchTerm.toLowerCase()) ||
    category.subject_class?.toLowerCase().includes(categorySearchTerm.toLowerCase())
  );

  // Debug logging
  useEffect(() => {
    console.log('Categories data:', categories);
    console.log('Filtered categories:', filteredCategories);
    console.log('Category dropdown open:', isCategoryDropdownOpen);
  }, [categories, filteredCategories, isCategoryDropdownOpen]);

  // Find selected category name for display
  const selectedCategoryName = categories.find(cat => cat.category_name === selectedCategory)?.category_name || selectedCategory;

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      scrollY > 10 
        ? 'bg-white/95 backdrop-blur-lg shadow-lg' 
        : 'bg-white/90 backdrop-blur-sm'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 sm:py-4">
        <div className="relative flex items-center justify-between min-w-0">
          
          {/* Left side - Desktop and Mobile Navigation */}
          <div className="flex items-center space-x-3 min-w-0">
            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-3" ref={dropdownRef}>
            <div className="relative">
              <button
                onClick={() => setIsCategoryDropdownOpen(!isCategoryDropdownOpen)}
                className={`flex items-center space-x-2 px-3 sm:px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  selectedCategory
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <Filter className="h-4 w-4" />
                <span className="max-w-24 sm:max-w-32 truncate">
                  {selectedCategory ? selectedCategoryName : 'Categories'}
                </span>
                <ChevronDown className={`h-4 w-4 transition-transform ${
                  isCategoryDropdownOpen ? 'rotate-180' : ''
                }`} />
              </button>

              {isCategoryDropdownOpen && (
                <div className="absolute top-full left-0 mt-2 w-80 bg-white border border-gray-200 rounded-lg shadow-xl z-50">
                  <div className="p-4 border-b border-gray-100">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <input
                        ref={categorySearchRef}
                        type="text"
                        placeholder="Search categories..."
                        value={categorySearchTerm}
                        onChange={(e) => setCategorySearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  <div className="max-h-64 overflow-y-auto">
                    {selectedCategory && (
                      <button
                        onClick={handleClearCategory}
                        className="w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors border-b border-gray-100"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-blue-600">Clear Filter</span>
                          <X className="h-4 w-4 text-gray-400" />
                        </div>
                      </button>
                    )}

                    {filteredCategories.length > 0 ? (
                      filteredCategories.map((category, index) => (
                        <button
                          key={index}
                          onClick={() => handleCategorySelect(category)}
                          className={`w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors ${
                            selectedCategory === category.category_name ? 'bg-blue-50' : ''
                          }`}
                        >
                          <div className="text-sm font-medium text-gray-900">
                            {category.category_name}
                          </div>
                          <div className="text-xs text-gray-500 mt-1">
                            {category.subject_class}
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
            
            {/* About Us Link */}
            <Link
              to="/aboutus"
              className="flex items-center space-x-1 px-3 py-2 rounded-lg text-sm font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-100 transition-colors"
              onClick={() => {
                // Close any expanded search first
                if (isSearchExpanded) {
                  setIsSearchExpanded(false);
                }
                // Let React Router handle navigation naturally
                setTimeout(() => window.scrollTo({ top: 0, behavior: 'smooth' }), 100);
              }}
              title="About Pearadox"
            >
              <Info className="h-4 w-4" />
              <span>About Us</span>
            </Link>
            
            {/* Blog Link */}
            <Link
              to="/blog"
              className="flex items-center space-x-1 px-3 py-2 rounded-lg text-sm font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-100 transition-colors"
              onClick={() => {
                // Close any expanded search first
                if (isSearchExpanded) {
                  setIsSearchExpanded(false);
                }
                // Let React Router handle navigation naturally
                setTimeout(() => window.scrollTo({ top: 0, behavior: 'smooth' }), 100);
              }}
              title="Pearadox Blog"
            >
              <BookOpen className="h-4 w-4" />
              <span>Blog</span>
            </Link>
            </div>
            
            {/* Mobile Navigation */}
            <div className="md:hidden flex items-center space-x-2">
              {/* About Us - Mobile */}
              <Link
                to="/aboutus"
                className="flex items-center justify-center p-2 bg-gray-100 text-gray-700 rounded-lg hover:text-blue-600 hover:bg-gray-200 transition-colors flex-shrink-0"
                onClick={() => {
                  // Close any expanded search first
                  if (isSearchExpanded) {
                    setIsSearchExpanded(false);
                  }
                  // Let React Router handle navigation naturally
                  setTimeout(() => window.scrollTo({ top: 0, behavior: 'smooth' }), 100);
                }}
                title="About Pearadox"
              >
                <Info className="h-4 w-4" />
              </Link>

              {/* Blog - Mobile */}
              <Link
                to="/blog"
                className="flex items-center justify-center p-2 bg-gray-100 text-gray-700 rounded-lg hover:text-blue-600 hover:bg-gray-200 transition-colors flex-shrink-0"
                onClick={() => {
                  // Close any expanded search first
                  if (isSearchExpanded) {
                    setIsSearchExpanded(false);
                  }
                  // Let React Router handle navigation naturally
                  setTimeout(() => window.scrollTo({ top: 0, behavior: 'smooth' }), 100);
                }}
                title="Pearadox Blog"
              >
                <BookOpen className="h-4 w-4" />
              </Link>
            </div>
          </div>

          {/* Logo - Absolutely centered */}
          <div className="absolute left-1/2 transform -translate-x-1/2">
            <Link to="/" className="flex items-center space-x-2 sm:space-x-3 hover:opacity-80 transition-opacity">
              <img 
                src="/logo512.png" 
                alt="Pearadox" 
                className="h-6 w-6 sm:h-8 sm:w-8"
              />
              <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900">
                Pearadox
              </h1>
            </Link>
          </div>

          {/* Actions */}
          <div className="flex items-center space-x-2 sm:space-x-3 ml-auto">
              
              {/* Search - Desktop only */}
              <div className="hidden md:block w-48 md:w-64">
                {isSearchExpanded ? (
                  <div className="flex items-center bg-white border border-gray-200 rounded-lg px-2 sm:px-3 py-2 shadow-md w-full">
                    <Search className="h-4 w-4 text-gray-400 mr-2 flex-shrink-0" />
                    <input
                      type="text"
                      placeholder="Search..."
                      value={searchTerm}
                      onChange={handleSearchChange}
                      className="bg-transparent flex-1 text-sm focus:outline-none min-w-0"
                      autoFocus
                    />
                    <button
                      onClick={handleSearchClose}
                      className="ml-1 sm:ml-2 p-1 hover:bg-gray-100 rounded flex-shrink-0"
                    >
                      <X className="h-4 w-4 text-gray-400" />
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={handleSearchClick}
                    className="flex items-center justify-center bg-gray-100 text-gray-700 rounded-lg px-2 sm:px-3 py-2 text-sm font-medium hover:bg-gray-200 transition-colors w-full"
                  >
                    <Search className="h-4 w-4 sm:mr-2" />
                    <span className="hidden sm:inline">Search</span>
                  </button>
                )}
              </div>

              {/* Saved Articles */}
              <button
                onClick={onShowSavedArticles}
                className="relative p-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                <Bookmark className="h-4 w-4" />
                {savedCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-4 w-4 sm:h-5 sm:w-5 flex items-center justify-center font-medium text-xs">
                    {savedCount > 9 ? '9+' : savedCount}
                  </span>
                )}
              </button>

              {/* Account */}
              <button
                onClick={onShowAccount}
                className="p-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                <User className="h-4 w-4" />
              </button>
          </div>
        </div>

        {/* Mobile Categories and Search - Same row below header */}
        {!isAboutPage && !isBlogPage && (
          <div className="md:hidden mt-3 pt-3 border-t border-gray-100" ref={mobileDropdownRef}>
          <div className="flex items-center gap-2 overflow-hidden">
            {/* Categories Button - Shrinks when search is expanded */}
            <button
              onClick={() => setIsCategoryDropdownOpen(!isCategoryDropdownOpen)}
              className={`${isSearchExpanded ? 'flex-none w-28' : 'flex-1'} flex items-center justify-between px-3 py-3 rounded-lg text-sm font-medium transition-all duration-300 min-w-0 ${
                selectedCategory
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700'
              }`}
            >
              <div className="flex items-center space-x-1 min-w-0">
                <Filter className="h-4 w-4 flex-shrink-0" />
                <span className="truncate">
                  {isSearchExpanded 
                    ? (selectedCategory ? 'All' : 'All') 
                    : (selectedCategory ? selectedCategoryName : 'Categories')
                  }
                </span>
              </div>
              {!isSearchExpanded && (
                <ChevronDown className={`h-4 w-4 transition-transform flex-shrink-0 ${
                  isCategoryDropdownOpen ? 'rotate-180' : ''
                }`} />
              )}
            </button>
            
            {/* Search - Mobile - Expands when active */}
            <div className={`transition-all duration-300 ease-in-out min-w-0 ${isSearchExpanded ? 'flex-1' : 'w-12 flex-shrink-0'}`}>
              {isSearchExpanded ? (
                <div className="flex items-center bg-white border border-gray-200 rounded-lg px-2 py-3 shadow-md min-w-0">
                  <Search className="h-4 w-4 text-gray-400 mr-2 flex-shrink-0" />
                  <input
                    type="text"
                    placeholder="Search..."
                    value={searchTerm}
                    onChange={handleSearchChange}
                    className="bg-transparent flex-1 text-sm focus:outline-none min-w-0"
                    autoFocus
                    onBlur={(e) => {
                      // Only close if clicking outside and no search term
                      if (!searchTerm.trim()) {
                        setTimeout(() => setIsSearchExpanded(false), 150);
                      }
                    }}
                  />
                  <button
                    onClick={handleSearchClose}
                    className="ml-1 p-1 hover:bg-gray-100 rounded flex-shrink-0"
                  >
                    <X className="h-4 w-4 text-gray-400" />
                  </button>
                </div>
              ) : (
                <button
                  onClick={handleSearchClick}
                  className="flex items-center justify-center bg-gray-100 text-gray-700 rounded-lg p-3 hover:bg-gray-200 transition-all duration-300 w-full h-full"
                  title="Search articles"
                >
                  <Search className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>

          {isCategoryDropdownOpen && (
            <div className="mt-2 bg-white border border-gray-200 rounded-lg shadow-lg">
              <div className="p-3 border-b border-gray-100">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    ref={categorySearchRef}
                    type="text"
                    placeholder="Search categories..."
                    value={categorySearchTerm}
                    onChange={(e) => setCategorySearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="max-h-48 overflow-y-auto">
                {selectedCategory && (
                  <button
                    onClick={handleClearCategory}
                    className="w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors border-b border-gray-100"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-blue-600">Clear Filter</span>
                      <X className="h-4 w-4 text-gray-400" />
                    </div>
                  </button>
                )}

                {filteredCategories.length > 0 ? (
                  filteredCategories.map((category, index) => (
                    <button
                      key={index}
                      onClick={() => handleCategorySelect(category)}
                      className={`w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors ${
                        selectedCategory === category.category_name ? 'bg-blue-50' : ''
                      }`}
                    >
                      <div className="text-sm font-medium text-gray-900">
                        {category.category_name}
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        {category.subject_class}
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
        )}
      </div>
    </header>
  );
};

export default Header; 