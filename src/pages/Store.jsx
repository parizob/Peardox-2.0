import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Sparkles, BookOpen, ArrowRight, Eye, ShoppingCart, ChevronLeft, ChevronRight } from 'lucide-react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import SavedArticles from '../components/SavedArticles';
import AccountModal from '../components/AccountModal';
import { useUser } from '../contexts/UserContext';
import { useTheme } from '../contexts/ThemeContext';
import { quizAPI } from '../lib/supabase';

const Store = () => {
  const navigate = useNavigate();
  const { isDarkMode } = useTheme();
  const {
    savedArticlesFromDB,
    user,
    userSkillLevel,
    handleSkillLevelChange,
    handleResearchInterestsChange,
  } = useUser();
  
  const [pearTokenCount, setPearTokenCount] = useState(0);
  const [isLoadingTokens, setIsLoadingTokens] = useState(false);
  const [isSavedArticlesOpen, setIsSavedArticlesOpen] = useState(false);
  const [isAccountOpen, setIsAccountOpen] = useState(false);
  const [showBackImage, setShowBackImage] = useState(false);
  
  // Navigate to home and scroll to articles section
  const handleStartEarning = () => {
    navigate('/');
    // Wait for navigation, then scroll to quiz section
    setTimeout(() => {
      const quizSection = document.getElementById('quiz-section');
      if (quizSection) {
        const headerHeight = 80;
        const additionalOffset = 20;
        const elementPosition = quizSection.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.pageYOffset - headerHeight - additionalOffset;
        window.scrollTo({
          top: offsetPosition,
          behavior: 'smooth'
        });
      }
    }, 100);
  };
  
  // Navigate to home and scroll to top
  const handleBackToHub = () => {
    navigate('/');
    setTimeout(() => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 100);
  };

  // Navigate to product detail and scroll to top
  const handleViewDetails = () => {
    navigate('/store/pearadox_tshirt');
    setTimeout(() => {
      window.scrollTo({ top: 0, behavior: 'instant' });
    }, 0);
  };
  
  // Fetch PEAR tokens
  useEffect(() => {
    const loadPearTokens = async () => {
      if (user) {
        setIsLoadingTokens(true);
        try {
          const correctAnswers = await quizAPI.getUserCorrectAnswers(user.id);
          setPearTokenCount(correctAnswers.length);
        } catch (error) {
          console.error('Error loading PEAR tokens:', error);
          setPearTokenCount(0);
        } finally {
          setIsLoadingTokens(false);
        }
      } else {
        setPearTokenCount(0);
      }
    };

    loadPearTokens();
  }, [user]);

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-gray-900' : 'bg-gradient-to-br from-gray-50 via-white to-gray-50'}`}>
      <Header 
        searchTerm=""
        onSearchChange={() => {}}
        selectedCategory=""
        onCategoryChange={() => {}}
        categories={[]}
        onShowSavedArticles={() => setIsSavedArticlesOpen(true)}
        onShowAccount={() => setIsAccountOpen(true)}
        savedCount={savedArticlesFromDB.length}
      />
      
      {/* Content Spacer for Fixed Header */}
      <div className="h-24 sm:h-20"></div>

      <main className="relative z-10">
        {/* Hero Section */}
        <section className="py-8 sm:py-12 relative overflow-hidden">
          {/* Background decorations */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className={`absolute top-20 left-10 w-72 h-72 rounded-full blur-3xl opacity-40 ${isDarkMode ? 'bg-green-900/30' : 'bg-green-100'}`}></div>
            <div className={`absolute bottom-20 right-10 w-96 h-96 rounded-full blur-3xl opacity-40 ${isDarkMode ? 'bg-amber-900/30' : 'bg-amber-100'}`}></div>
          </div>

          <div className="max-w-5xl mx-auto px-4 sm:px-6 text-center relative">
            {/* Title */}
            <h1 className={`text-4xl sm:text-5xl md:text-6xl font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              The PEAR <span style={{ color: '#1db954' }}>Store</span>
            </h1>
            
            {/* Subtitle */}
            <p className={`text-lg sm:text-xl mb-8 max-w-2xl mx-auto leading-relaxed ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Your knowledge has value. Redeem PEAR tokens for real rewards — including <span className={`font-semibold ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>exclusive merch and crypto</span>.
            </p>

            {/* Token Display for logged in users */}
            {user && (
              <div className={`inline-flex items-center gap-4 px-6 py-4 rounded-2xl shadow-lg border mb-8 ${
                isDarkMode 
                  ? 'bg-amber-900/20 border-amber-700' 
                  : 'bg-gradient-to-br from-amber-50 via-yellow-50/50 to-orange-50/30 border-amber-200'
              }`}>
                {/* PEAR Token Coin with count - matches main page */}
                <div className="relative group/token cursor-pointer flex-shrink-0">
                  {/* Outer glow ring - pulses */}
                  <div className="absolute inset-0 rounded-full bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-400 blur-md opacity-60 group-hover/token:opacity-100 animate-pulse"></div>
                  {/* Secondary glow */}
                  <div className="absolute -inset-1 rounded-full bg-gradient-to-r from-yellow-400 to-amber-500 opacity-30 group-hover/token:opacity-50 blur-sm transition-opacity"></div>
                  {/* Main token */}
                  <div className="relative w-16 h-16 rounded-full bg-gradient-to-br from-amber-300 via-yellow-400 to-amber-500 flex items-center justify-center shadow-lg border-2 border-yellow-300/50 group-hover/token:scale-110 transition-transform duration-300">
                    {/* Inner highlight */}
                    <div className="absolute inset-1 rounded-full bg-gradient-to-br from-white/40 via-transparent to-transparent"></div>
                    {/* Shimmer effect */}
                    <div className="absolute inset-0 rounded-full overflow-hidden">
                      <div className="absolute -inset-full bg-gradient-to-r from-transparent via-white/30 to-transparent rotate-45 translate-x-[-100%] group-hover/token:translate-x-[200%] transition-transform duration-1000"></div>
                    </div>
                    {/* Token count */}
                    <span className="relative text-2xl font-bold text-white drop-shadow-md">
                      {isLoadingTokens ? '...' : pearTokenCount}
                    </span>
                  </div>
                </div>
                
                <div className="text-left">
                  <p className="text-xl font-bold bg-gradient-to-r from-amber-600 to-yellow-600 bg-clip-text text-transparent">PEAR Tokens</p>
                  <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Your current balance</p>
                </div>
              </div>
            )}

            {/* How to Earn PEAR Steps - Inline */}
            <div className="mt-6 max-w-4xl mx-auto">
              <h2 className={`text-xl sm:text-2xl font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>How to Earn PEAR</h2>
              <p className={`text-sm mb-6 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>It's simple: learn, prove it, and get rewarded.</p>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-8">
                <div className={`rounded-xl p-4 shadow-sm border text-center hover:shadow-md transition-shadow ${
                  isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'
                }`}>
                  <div className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold mx-auto mb-2 text-sm" style={{ backgroundColor: '#1db954' }}>
                    1
                  </div>
                  <h3 className={`font-semibold text-sm mb-0.5 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Explore</h3>
                  <p className={`text-xs ${isDarkMode ? 'text-gray-500' : 'text-gray-500'}`}>Browse papers</p>
                </div>
                <div className={`rounded-xl p-4 shadow-sm border text-center hover:shadow-md transition-shadow ${
                  isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'
                }`}>
                  <div className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold mx-auto mb-2 text-sm" style={{ backgroundColor: '#1db954' }}>
                    2
                  </div>
                  <h3 className={`font-semibold text-sm mb-0.5 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Read</h3>
                  <p className={`text-xs ${isDarkMode ? 'text-gray-500' : 'text-gray-500'}`}>Learn summaries</p>
                </div>
                <div className={`rounded-xl p-4 shadow-sm border text-center hover:shadow-md transition-shadow ${
                  isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'
                }`}>
                  <div className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold mx-auto mb-2 text-sm" style={{ backgroundColor: '#1db954' }}>
                    3
                  </div>
                  <h3 className={`font-semibold text-sm mb-0.5 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Quiz</h3>
                  <p className={`text-xs ${isDarkMode ? 'text-gray-500' : 'text-gray-500'}`}>Test knowledge</p>
                </div>
                <div className={`rounded-xl p-4 shadow-sm border text-center hover:shadow-md transition-shadow ${
                  isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'
                }`}>
                  <div className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold mx-auto mb-2 text-sm" style={{ backgroundColor: '#1db954' }}>
                    4
                  </div>
                  <h3 className={`font-semibold text-sm mb-0.5 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Earn</h3>
                  <p className={`text-xs ${isDarkMode ? 'text-gray-500' : 'text-gray-500'}`}>Get PEAR tokens</p>
                </div>
              </div>

              {/* CTA to earn more */}
              <button 
                onClick={handleStartEarning}
                className="inline-flex items-center px-6 py-3 text-white font-semibold rounded-xl transition-all hover:opacity-90 hover:scale-105 shadow-lg"
                style={{ backgroundColor: '#1db954' }}
              >
                <BookOpen className="h-5 w-5 mr-2" />
                Start Earning PEAR
                <ArrowRight className="h-5 w-5 ml-2" />
              </button>
            </div>
          </div>
        </section>

        {/* Rewards Preview Section */}
        <section className="py-12 sm:py-16">
          <div className="max-w-5xl mx-auto px-4 sm:px-6">
            <div className="text-center mb-10">
              <h2 className={`text-2xl sm:text-3xl font-bold mb-3 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>What You Can Redeem</h2>
              <p className={`max-w-xl mx-auto ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Stack your PEAR tokens and redeem them for exclusive rewards.</p>
            </div>

            {/* Product Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 max-w-2xl mx-auto">
              
              {/* Pearadox T-Shirt Card */}
              <div className={`rounded-xl shadow-md border overflow-hidden hover:shadow-lg transition-shadow ${
                isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'
              }`}>
                {/* Image with hover arrows */}
                <div 
                  className="relative aspect-[4/3] group cursor-pointer"
                  onMouseEnter={() => {}}
                >
                  <img 
                    src={showBackImage ? '/Pearadox_Tshirt_Back.png' : '/Pearadox_Tshirt_Front.png'}
                    alt={`Pearadox T-Shirt ${showBackImage ? 'Back' : 'Front'}`}
                    className="w-full h-full object-cover"
                  />
                  {/* Limited Edition Badge */}
                  <div className="absolute top-2 left-2 px-2 py-0.5 bg-gradient-to-r from-amber-500 to-yellow-500 text-white text-[10px] font-bold rounded-full shadow-md">
                    LIMITED EDITION
                  </div>
                  
                  {/* Navigation Arrows - show contextually on hover */}
                  {showBackImage && (
                    <button 
                      onClick={(e) => { e.stopPropagation(); setShowBackImage(false); }}
                      className={`absolute left-1.5 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all ${
                        isDarkMode ? 'bg-gray-900/80 hover:bg-gray-900 text-white' : 'bg-white/90 hover:bg-white text-gray-900'
                      } shadow-md`}
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </button>
                  )}
                  {!showBackImage && (
                    <button 
                      onClick={(e) => { e.stopPropagation(); setShowBackImage(true); }}
                      className={`absolute right-1.5 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all ${
                        isDarkMode ? 'bg-gray-900/80 hover:bg-gray-900 text-white' : 'bg-white/90 hover:bg-white text-gray-900'
                      } shadow-md`}
                    >
                      <ChevronRight className="h-4 w-4" />
                    </button>
                  )}
                  
                  {/* Image indicator dots */}
                  <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className={`w-1.5 h-1.5 rounded-full transition-colors ${!showBackImage ? 'bg-white' : 'bg-white/50'}`}></div>
                    <div className={`w-1.5 h-1.5 rounded-full transition-colors ${showBackImage ? 'bg-white' : 'bg-white/50'}`}></div>
                  </div>
                </div>

                {/* Card Content */}
                <div className="p-4">
                  <span className="text-[10px] font-semibold uppercase tracking-wide" style={{ color: '#1db954' }}>Exclusive Merch</span>
                  <h3 className={`text-base font-bold mt-0.5 mb-1 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    Pearadox T-Shirt
                  </h3>
                  <p className={`text-xs mb-3 line-clamp-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    Premium cotton tee with the iconic Pearadox logo.
                  </p>

                  {/* Price with shiny token */}
                  <div className="flex items-center gap-2 mb-3">
                    <div className="relative">
                      <div className="absolute inset-0 rounded-full bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-400 blur-[3px] opacity-60"></div>
                      <div className="relative w-5 h-5 rounded-full bg-gradient-to-br from-amber-300 via-yellow-400 to-amber-500 flex items-center justify-center shadow-sm border border-yellow-300/50">
                        <div className="absolute inset-0.5 rounded-full bg-gradient-to-br from-white/40 via-transparent to-transparent"></div>
                      </div>
                    </div>
                    <span className="text-sm font-bold bg-gradient-to-r from-amber-600 to-yellow-600 bg-clip-text text-transparent">
                      50 PEAR
                    </span>
                  </div>

                  {/* Buttons */}
                  <div className="flex gap-2">
                    <button 
                      onClick={handleViewDetails}
                      className={`flex-1 inline-flex items-center justify-center px-3 py-2 rounded-lg font-medium text-xs transition-all hover:scale-105 border ${
                        isDarkMode 
                          ? 'bg-gray-700 border-gray-600 text-white hover:bg-gray-600' 
                          : 'bg-gray-100 border-gray-200 text-gray-900 hover:bg-gray-200'
                      }`}
                    >
                      <Eye className="h-3.5 w-3.5 mr-1" />
                      Details
                    </button>
                    <button 
                      className="flex-1 inline-flex items-center justify-center px-3 py-2 text-white font-medium text-xs rounded-lg transition-all hover:opacity-90 hover:scale-105 shadow-sm"
                      style={{ backgroundColor: '#1db954' }}
                    >
                      <ShoppingCart className="h-3.5 w-3.5 mr-1" />
                      Redeem
                    </button>
                  </div>
                </div>
              </div>

              {/* USDC Card with Coming Soon Banner */}
              <div className={`relative rounded-xl shadow-md border overflow-hidden ${
                isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'
              }`}>
                {/* Coming Soon Diagonal Banner */}
                <div className="absolute top-0 right-0 z-20 w-28 h-28 overflow-visible">
                  <div className="absolute top-[18px] -right-[28px] w-[120px] bg-gray-500 text-white text-[10px] font-bold py-1 text-center transform rotate-45 shadow-md">
                    COMING SOON
                  </div>
                </div>

                {/* Greyed out overlay */}
                <div className="absolute inset-0 bg-gray-500/20 z-10 pointer-events-none"></div>

                {/* Image */}
                <div className={`relative aspect-[4/3] flex items-center justify-center ${isDarkMode ? 'bg-gray-900' : 'bg-gradient-to-br from-blue-50 to-blue-100'}`}>
                  <img 
                    src="/USD_Coin_logo.png"
                    alt="USDC"
                    className="w-20 h-20 object-contain opacity-70"
                  />
                </div>

                {/* Card Content */}
                <div className="p-4">
                  <span className="text-[10px] font-semibold uppercase tracking-wide text-blue-500">Crypto Rewards</span>
                  <h3 className={`text-base font-bold mt-0.5 mb-1 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    USDC
                  </h3>
                  <p className={`text-xs mb-3 line-clamp-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    Convert PEAR tokens to USDC stablecoin.
                  </p>

                  {/* Price with shiny token */}
                  <div className="flex items-center gap-2 mb-3">
                    <div className="relative">
                      <div className="absolute inset-0 rounded-full bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-400 blur-[3px] opacity-60"></div>
                      <div className="relative w-5 h-5 rounded-full bg-gradient-to-br from-amber-300 via-yellow-400 to-amber-500 flex items-center justify-center shadow-sm border border-yellow-300/50">
                        <div className="absolute inset-0.5 rounded-full bg-gradient-to-br from-white/40 via-transparent to-transparent"></div>
                      </div>
                    </div>
                    <span className="text-sm font-bold bg-gradient-to-r from-amber-600 to-yellow-600 bg-clip-text text-transparent">
                      100 PEAR = $1
                    </span>
                  </div>

                  {/* Buttons - Disabled */}
                  <div className="flex gap-2">
                    <button 
                      disabled
                      className={`flex-1 inline-flex items-center justify-center px-3 py-2 rounded-lg font-medium text-xs border cursor-not-allowed opacity-50 ${
                        isDarkMode 
                          ? 'bg-gray-700 border-gray-600 text-gray-400' 
                          : 'bg-gray-100 border-gray-200 text-gray-500'
                      }`}
                    >
                      <Eye className="h-3.5 w-3.5 mr-1" />
                      Details
                    </button>
                    <button 
                      disabled
                      className="flex-1 inline-flex items-center justify-center px-3 py-2 font-medium text-xs rounded-lg cursor-not-allowed opacity-50 bg-gray-400 text-white"
                    >
                      <ShoppingCart className="h-3.5 w-3.5 mr-1" />
                      Redeem
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* More Coming Soon Teaser */}
            <div className={`mt-8 text-center p-5 rounded-xl border border-dashed ${
              isDarkMode ? 'border-gray-700 bg-gray-800/50' : 'border-gray-300 bg-gray-50'
            }`}>
              <Sparkles className={`h-8 w-8 mx-auto mb-3 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`} />
              <h3 className={`font-semibold mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>More rewards coming soon!</h3>
              <p className={`text-sm ${isDarkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                Keep stacking PEAR tokens. Premium features and more merch are on the way.
              </p>
            </div>
          </div>
        </section>

        {/* Back Link */}
        <section className="py-8">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 text-center">
            <button 
              onClick={handleBackToHub}
              className="inline-flex items-center transition-colors group"
              style={{ color: '#1db954' }}
              onMouseEnter={(e) => e.currentTarget.style.color = '#16a14a'}
              onMouseLeave={(e) => e.currentTarget.style.color = '#1db954'}
            >
              <ArrowLeft className="h-5 w-5 mr-2 group-hover:-translate-x-1 transition-transform" />
              Back to Research Hub
            </button>
          </div>
        </section>
      </main>

      <Footer />

      {/* Saved Articles Modal */}
      <SavedArticles
        isOpen={isSavedArticlesOpen}
        onClose={() => setIsSavedArticlesOpen(false)}
        savedArticles={savedArticlesFromDB}
        onArticleClick={() => {}} // Articles can't be opened from store, but modal can be viewed
        onToggleFavorite={() => {}}
        isLoading={false}
        user={user}
      />

      {/* Account Modal */}
      <AccountModal
        isOpen={isAccountOpen}
        onClose={() => setIsAccountOpen(false)}
        userSkillLevel={userSkillLevel}
        onSkillLevelChange={handleSkillLevelChange}
        onResearchInterestsChange={handleResearchInterestsChange}
      />
    </div>
  );
};

export default Store;
