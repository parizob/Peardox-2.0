import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Sparkles, BookOpen, ArrowRight, Eye, ShoppingCart, ChevronLeft, ChevronRight, HelpCircle, X } from 'lucide-react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import SavedArticles from '../components/SavedArticles';
import AccountModal from '../components/AccountModal';
import RedemptionModal from '../components/RedemptionModal';
import { useUser } from '../contexts/UserContext';
import { useTheme } from '../contexts/ThemeContext';
import { quizAPI, redemptionAPI } from '../lib/supabase';

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
  const [totalRedeemed, setTotalRedeemed] = useState(0);
  const [isLoadingTokens, setIsLoadingTokens] = useState(false);
  const [isSavedArticlesOpen, setIsSavedArticlesOpen] = useState(false);
  const [isAccountOpen, setIsAccountOpen] = useState(false);
  const [isRedemptionModalOpen, setIsRedemptionModalOpen] = useState(false);
  const [showBackImage, setShowBackImage] = useState(false);
  const [showHowToEarn, setShowHowToEarn] = useState(false);
  const [insufficientBalanceError, setInsufficientBalanceError] = useState(false);

  const TSHIRT_PRICE = 50;

  // Calculate available balance (earned - redeemed)
  const availableBalance = pearTokenCount - totalRedeemed;

  // Handle redeem button click - open modal or show error
  const handleRedeemTshirt = () => {
    if (!user) {
      setIsAccountOpen(true);
      return;
    }
    
    if (availableBalance < TSHIRT_PRICE) {
      setInsufficientBalanceError(true);
      setTimeout(() => setInsufficientBalanceError(false), 5000);
      return;
    }
    
    // Open redemption modal
    setIsRedemptionModalOpen(true);
  };

  // Handle successful redemption from modal
  const handleRedemptionSuccess = () => {
    // Update total redeemed locally
    setTotalRedeemed(prev => prev + TSHIRT_PRICE);
  };
  
  // Navigate to home and scroll to quiz section (same as "Explore Now" button)
  const handleStartEarning = () => {
    navigate('/');
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
  
  // Fetch PEAR tokens and redemptions
  useEffect(() => {
    const loadPearTokens = async () => {
      if (user) {
        setIsLoadingTokens(true);
        try {
          // Load earned tokens
          const correctAnswers = await quizAPI.getUserCorrectAnswers(user.id);
          setPearTokenCount(correctAnswers.length);
          
          // Load total redeemed
          const redeemed = await redemptionAPI.getUserTotalRedeemed(user.id);
          setTotalRedeemed(redeemed);
        } catch (error) {
          console.error('Error loading PEAR tokens:', error);
          setPearTokenCount(0);
          setTotalRedeemed(0);
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
        {/* Compact Hero with Balance */}
        <section className="pt-6 pb-4 sm:pt-8 sm:pb-6 relative overflow-hidden">
          {/* Background decorations */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className={`absolute top-10 left-10 w-64 h-64 rounded-full blur-3xl opacity-30 ${isDarkMode ? 'bg-green-900/30' : 'bg-green-100'}`}></div>
            <div className={`absolute top-20 right-10 w-72 h-72 rounded-full blur-3xl opacity-30 ${isDarkMode ? 'bg-amber-900/30' : 'bg-amber-100'}`}></div>
          </div>

          <div className="max-w-5xl mx-auto px-4 sm:px-6 relative">
            {/* Header Row: Title + Balance */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
              <div>
                <h1 className={`text-3xl sm:text-4xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  The PEAR <span style={{ color: '#1db954' }}>Store</span>
                </h1>
                <p className={`text-sm sm:text-base mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  Redeem your tokens for exclusive rewards
                </p>
              </div>

              {/* Token Balance - Compact */}
              {user && (
                <div className={`flex items-center gap-3 px-4 py-3 rounded-xl shadow-md border ${
                  isDarkMode 
                    ? 'bg-amber-900/20 border-amber-700/50' 
                    : 'bg-gradient-to-br from-amber-50 to-yellow-50 border-amber-200'
                }`}>
                  <div className="relative">
                    <div className="absolute inset-0 rounded-full bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-400 blur-md opacity-60 animate-pulse"></div>
                    <div className="relative w-10 h-10 rounded-full bg-gradient-to-br from-amber-300 via-yellow-400 to-amber-500 flex items-center justify-center shadow-lg border border-yellow-300/50">
                      <div className="absolute inset-1 rounded-full bg-gradient-to-br from-white/40 via-transparent to-transparent"></div>
                      <span className="relative text-lg font-bold text-white drop-shadow-md">
                        {isLoadingTokens ? '...' : availableBalance}
                      </span>
                    </div>
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-bold bg-gradient-to-r from-amber-600 to-yellow-600 bg-clip-text text-transparent">PEAR Tokens</p>
                    <p className={`text-xs ${isDarkMode ? 'text-gray-500' : 'text-gray-500'}`}>Available balance</p>
                  </div>
                </div>
              )}
            </div>

            {/* How to Earn - Compact Toggle */}
            <button
              onClick={() => setShowHowToEarn(!showHowToEarn)}
              className={`inline-flex items-center gap-2 text-sm font-medium transition-colors ${
                isDarkMode ? 'text-gray-400 hover:text-gray-300' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <HelpCircle className="h-4 w-4" />
              How do I earn PEAR tokens?
              <ChevronRight className={`h-4 w-4 transition-transform ${showHowToEarn ? 'rotate-90' : ''}`} />
            </button>

            {/* Expandable How to Earn Section */}
            {showHowToEarn && (
              <div className={`mt-4 p-5 rounded-xl border ${
                isDarkMode ? 'bg-gray-800/50 border-gray-700' : 'bg-white border-gray-200'
              }`}>
                <div className="flex items-start justify-between mb-4">
                  <p className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Earn tokens by reading papers and answering quiz questions correctly
                  </p>
                  <button 
                    onClick={() => setShowHowToEarn(false)}
                    className={`ml-2 p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors ${
                      isDarkMode ? 'text-gray-400' : 'text-gray-500'
                    }`}
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
                
                {/* Steps - Vertical on mobile, Horizontal on desktop */}
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 sm:gap-4 mb-5">
                  {[
                    { num: '1', label: 'Explore', sub: 'Browse research papers' },
                    { num: '2', label: 'Read', sub: 'Learn from AI summaries' },
                    { num: '3', label: 'Quiz', sub: 'Test your knowledge' },
                    { num: '4', label: 'Earn', sub: 'Get PEAR tokens' },
                  ].map((step, i) => (
                    <div key={i} className={`flex sm:flex-col items-center sm:items-center gap-3 sm:gap-2 p-3 rounded-lg ${
                      isDarkMode ? 'bg-gray-700/50' : 'bg-gray-50'
                    }`}>
                      <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center text-white text-lg sm:text-xl font-bold shadow-md flex-shrink-0" style={{ backgroundColor: '#1db954' }}>
                        {step.num}
                      </div>
                      <div className="sm:text-center">
                        <p className={`text-sm font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{step.label}</p>
                        <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>{step.sub}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <button 
                  onClick={handleStartEarning}
                  className="w-full sm:w-auto inline-flex items-center justify-center px-5 py-2.5 text-white text-sm font-semibold rounded-lg transition-all hover:opacity-90 hover:scale-105 shadow-md"
                  style={{ backgroundColor: '#1db954' }}
                >
                  <BookOpen className="h-4 w-4 mr-2" />
                  Start Earning PEAR
                  <ArrowRight className="h-4 w-4 ml-2" />
                </button>
              </div>
            )}
          </div>
        </section>

        {/* Products Section - Main Focus */}
        <section className="py-8 sm:py-10">
          <div className="max-w-5xl mx-auto px-4 sm:px-6">
            <div className="mb-6">
              <h2 className={`text-xl sm:text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Available Rewards</h2>
              <p className={`text-sm mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Redeem your tokens for these exclusive items</p>
            </div>

            {/* Product Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 max-w-2xl">
              
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
                      onClick={handleRedeemTshirt}
                      className="flex-1 inline-flex items-center justify-center px-3 py-2 text-white font-medium text-xs rounded-lg transition-all shadow-sm hover:opacity-90 hover:scale-105"
                      style={{ backgroundColor: '#1db954' }}
                    >
                      <ShoppingCart className="h-3.5 w-3.5 mr-1" />
                      Redeem
                    </button>
                  </div>

                  {/* Insufficient Balance Error */}
                  {insufficientBalanceError && (
                    <div className="mt-3 p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
                      <p className="text-xs text-red-600 dark:text-red-400 font-medium">
                        Insufficient balance! You need {TSHIRT_PRICE} PEAR tokens to redeem this item.
                      </p>
                      <button 
                        onClick={() => { setInsufficientBalanceError(false); handleStartEarning(); }}
                        className="text-xs text-red-500 dark:text-red-400 underline font-medium hover:text-red-700 dark:hover:text-red-300 mt-1"
                      >
                        Earn more tokens →
                      </button>
                    </div>
                  )}

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

            {/* More Coming Soon - Subtle */}
            <div className={`mt-6 flex items-center gap-3 py-3 px-4 rounded-lg ${
              isDarkMode ? 'bg-gray-800/30' : 'bg-gray-50'
            }`}>
              <Sparkles className={`h-5 w-5 ${isDarkMode ? 'text-amber-500' : 'text-amber-500'}`} />
              <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                <span className="font-medium">More rewards coming soon!</span> Premium features and additional merch on the way.
              </p>
            </div>
          </div>
        </section>

        {/* Not logged in? Call to action */}
        {!user && (
          <section className="py-6">
            <div className="max-w-5xl mx-auto px-4 sm:px-6">
              <div className={`p-5 rounded-xl border text-center ${
                isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
              }`}>
                <p className={`text-sm mb-3 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Sign in to view your PEAR token balance and start redeeming rewards
                </p>
                <button 
                  onClick={() => setIsAccountOpen(true)}
                  className="inline-flex items-center px-5 py-2.5 text-white text-sm font-semibold rounded-lg transition-all hover:opacity-90 shadow-md"
                  style={{ backgroundColor: '#1db954' }}
                >
                  Sign In to Get Started
                </button>
              </div>
            </div>
          </section>
        )}

        {/* Back Link */}
        <section className="py-6">
          <div className="max-w-5xl mx-auto px-4 sm:px-6">
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
        onArticleClick={() => {}}
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

      {/* Redemption Modal */}
      <RedemptionModal
        isOpen={isRedemptionModalOpen}
        onClose={() => setIsRedemptionModalOpen(false)}
        user={user}
        itemId="pearadox_tshirt"
        itemName="Pearadox T-Shirt"
        itemPrice={TSHIRT_PRICE}
        availableBalance={availableBalance}
        onRedemptionSuccess={handleRedemptionSuccess}
      />
    </div>
  );
};

export default Store;
