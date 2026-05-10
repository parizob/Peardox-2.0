import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Sparkles, BookOpen, ArrowRight, Eye, ShoppingCart, ChevronLeft, ChevronRight, HelpCircle, X, Trophy, Star, Gift, Zap, Coins } from 'lucide-react';
import { motion } from 'framer-motion';
import Header from '../components/Header';
import Footer from '../components/Footer';
import SavedArticles from '../components/SavedArticles';
import AccountModal from '../components/AccountModal';
import RedemptionModal from '../components/RedemptionModal';
import USDCRedemptionModal from '../components/USDCRedemptionModal';
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
  
  // Entrance animation state
  const [isVisible, setIsVisible] = useState({ hero: false, products: false, cta: false });
  
  const [pearTokenCount, setPearTokenCount] = useState(0);
  const [totalRedeemed, setTotalRedeemed] = useState(0);
  const [isLoadingTokens, setIsLoadingTokens] = useState(false);
  const [isSavedArticlesOpen, setIsSavedArticlesOpen] = useState(false);
  const [isAccountOpen, setIsAccountOpen] = useState(false);
  const [isRedemptionModalOpen, setIsRedemptionModalOpen] = useState(false);
  const [showBackImage, setShowBackImage] = useState(false);
  const [showHowToEarn, setShowHowToEarn] = useState(false);
  const [insufficientBalanceError, setInsufficientBalanceError] = useState(false);
  const [insufficientBalanceErrorUSDC, setInsufficientBalanceErrorUSDC] = useState(false);
  const [isUSDCRedemptionModalOpen, setIsUSDCRedemptionModalOpen] = useState(false);

  const TSHIRT_PRICE = 50;
  const USDC_MIN_PRICE = 100; // Minimum 100 PEAR = $1 USDC

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

  // Handle USDC redeem button click
  const handleRedeemUSDC = () => {
    if (!user) {
      setIsAccountOpen(true);
      return;
    }
    
    if (availableBalance < USDC_MIN_PRICE) {
      setInsufficientBalanceErrorUSDC(true);
      setTimeout(() => setInsufficientBalanceErrorUSDC(false), 5000);
      return;
    }
    
    // Open USDC redemption modal
    setIsUSDCRedemptionModalOpen(true);
  };

  // Handle successful USDC redemption from modal
  const handleUSDCRedemptionSuccess = (amount) => {
    // Update total redeemed locally
    setTotalRedeemed(prev => prev + amount);
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
  
  // Handle entrance animations - use requestAnimationFrame for reliable triggering
  useEffect(() => {
    const timer = requestAnimationFrame(() => {
      setIsVisible({
        hero: true,
        products: true,
        cta: true
      });
    });
    return () => cancelAnimationFrame(timer);
  }, []);

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
    <div className={`min-h-screen ${isDarkMode ? 'bg-gray-900' : 'bg-gradient-to-br from-[#f5f0e8] via-[#faf7f2] to-[#ede8df]'}`}>
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
        {/* ── HERO: Arcade-style Prize Counter ── */}
        <section className={`pt-6 pb-4 sm:pt-8 sm:pb-6 relative overflow-hidden transform transition-all duration-1000 ${
          isVisible.hero ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
        }`}>
          {/* Background glow blobs */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute top-0 left-1/4 w-96 h-96 rounded-full blur-[140px] opacity-40" style={{ background: 'rgba(245,158,11,0.25)' }} />
            <div className="absolute top-10 right-1/4 w-80 h-80 rounded-full blur-[120px] opacity-30" style={{ background: 'rgba(29,185,84,0.18)' }} />
            <div className="absolute -top-10 left-1/2 w-72 h-72 rounded-full blur-[100px] opacity-20" style={{ background: 'rgba(251,191,36,0.3)' }} />
          </div>

          <div className="max-w-5xl mx-auto px-4 sm:px-6 relative">
            {/* Title row with arcade vibe */}
            <div className="text-center mb-6">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full mb-4 shadow-md"
                style={{ background: 'linear-gradient(90deg, #f59e0b, #fbbf24, #f59e0b)' }}
              >
                <Trophy className="h-4 w-4 text-white" />
                <span className="text-xs font-extrabold text-white uppercase tracking-widest">Prize Counter</span>
                <Trophy className="h-4 w-4 text-white" />
              </motion.div>

              <h1 className={`text-4xl sm:text-5xl lg:text-6xl font-extrabold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                The PEAR{' '}
                <span className="bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-500 bg-clip-text text-transparent">
                  Store
                </span>
              </h1>
              <p className={`text-base sm:text-lg ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                You earned the tokens — now claim your prize
              </p>
            </div>

            {/* Giant animated balance ticker (signed-in users) */}
            {user ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
                className={`relative rounded-3xl border-2 overflow-hidden mb-5 ${
                  isDarkMode
                    ? 'bg-gradient-to-br from-amber-900/30 via-yellow-900/20 to-amber-900/30 border-amber-700/50'
                    : 'bg-gradient-to-br from-amber-50 via-yellow-50 to-amber-50 border-amber-300'
                }`}
              >
                {/* Sparkle particles */}
                <div className="absolute top-3 right-6 text-amber-400 text-xl animate-pulse">✨</div>
                <div className="absolute bottom-4 left-8 text-amber-400 text-base animate-pulse" style={{ animationDelay: '0.5s' }}>✨</div>
                <div className="absolute top-1/2 right-12 text-yellow-400 text-sm animate-pulse" style={{ animationDelay: '1s' }}></div>

                <div className="relative p-6 sm:p-8 flex flex-col sm:flex-row items-center gap-6 sm:gap-8">
                  {/* Giant spinning coin */}
                  <div className="relative flex-shrink-0">
                    <div className="absolute inset-0 rounded-full bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-400 blur-2xl opacity-70 animate-pulse" />
                    <div className="absolute -inset-2 rounded-full bg-gradient-to-r from-yellow-400 to-amber-500 opacity-40 blur-md" />
                    <motion.div
                      animate={{ rotateY: [0, 360] }}
                      transition={{ duration: 6, repeat: Infinity, ease: 'linear' }}
                      className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-gradient-to-br from-amber-300 via-yellow-400 to-amber-500 flex items-center justify-center shadow-2xl border-4 border-yellow-300/60"
                      style={{ transformStyle: 'preserve-3d' }}
                    >
                      <div className="absolute inset-2 rounded-full bg-gradient-to-br from-white/50 via-transparent to-transparent" />
                      <div className="absolute inset-0 rounded-full overflow-hidden">
                        <div className="absolute -inset-full bg-gradient-to-r from-transparent via-white/40 to-transparent rotate-45 animate-pulse" />
                      </div>
                      <span className="relative text-3xl sm:text-4xl font-extrabold text-white drop-shadow-lg" style={{ textShadow: '0 2px 4px rgba(0,0,0,0.3)' }}>
                      </span>
                    </motion.div>
                  </div>

                  {/* Balance display */}
                  <div className="flex-1 text-center sm:text-left">
                    <div className={`text-xs uppercase tracking-widest font-bold mb-1 ${isDarkMode ? 'text-amber-400' : 'text-amber-600'}`}>
                      Your Balance
                    </div>
                    <div className="flex items-baseline justify-center sm:justify-start gap-2">
                      <motion.span
                        key={availableBalance}
                        initial={{ scale: 1.3, color: '#fbbf24' }}
                        animate={{ scale: 1, color: isDarkMode ? '#ffffff' : '#111827' }}
                        transition={{ duration: 0.4 }}
                        className="text-5xl sm:text-6xl font-extrabold tabular-nums"
                      >
                        {isLoadingTokens ? '—' : availableBalance.toLocaleString()}
                      </motion.span>
                      <span className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-amber-500 to-yellow-600 bg-clip-text text-transparent">
                        PEAR
                      </span>
                    </div>
                    <div className={`text-sm mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      {totalRedeemed > 0 && (
                        <span>{totalRedeemed.toLocaleString()} redeemed all-time • </span>
                      )}
                      <button
                        onClick={handleStartEarning}
                        className="font-semibold underline decoration-dotted underline-offset-2 hover:text-amber-500 transition-colors"
                      >
                        Earn more →
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
                className={`text-center rounded-3xl border-2 p-8 mb-5 ${
                  isDarkMode
                    ? 'bg-gradient-to-br from-amber-900/30 via-yellow-900/20 to-amber-900/30 border-amber-700/50'
                    : 'bg-gradient-to-br from-amber-50 via-yellow-50 to-amber-50 border-amber-300'
                }`}
              >
                <div className="text-5xl mb-3"></div>
                <h3 className={`text-xl font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  Sign in to see your tokens
                </h3>
                <p className={`text-sm mb-4 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  Track your PEAR balance and start claiming prizes
                </p>
                <button
                  onClick={() => setIsAccountOpen(true)}
                  className="inline-flex items-center px-6 py-3 text-white text-sm font-bold rounded-xl shadow-lg hover:shadow-xl hover:scale-105 transition-all"
                  style={{ background: 'linear-gradient(90deg, #f59e0b, #fbbf24)' }}
                >
                  <Sparkles className="h-4 w-4 mr-2" />
                  Sign In to Redeem
                </button>
              </motion.div>
            )}

            {/* How to Earn - Compact Toggle */}
            <div className="text-center">
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
            </div>

            {/* Expandable How to Earn Section */}
            {showHowToEarn && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className={`mt-4 p-5 rounded-2xl border ${
                  isDarkMode ? 'bg-gray-800/50 border-gray-700' : 'bg-white border-gray-200'
                }`}
              >
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
              </motion.div>
            )}
          </div>
        </section>

        {/* ── PRIZE WALL ── */}
        <section className={`py-8 sm:py-10 transform transition-all duration-1000 delay-200 ${
          isVisible.products ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
        }`}>
          <div className="max-w-6xl mx-auto px-4 sm:px-6">
            <div className="flex items-end justify-between mb-6">
              <div>
                <h2 className={`text-2xl sm:text-3xl font-extrabold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  Prize Wall
                </h2>
                <p className={`text-sm mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  Pick a prize. Hit redeem. Done.
                </p>
              </div>
              <div className={`hidden sm:flex items-center gap-1.5 text-xs font-medium ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                <Star className="h-3.5 w-3.5 fill-current text-amber-500" />
                <span>Hover for prize details</span>
              </div>
            </div>

            {/* Prize Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">

              {/* ──── LEGENDARY: Pearadox T-Shirt ──── */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="relative group"
              >
                {/* Outer glow halo */}
                <div className="absolute -inset-1 rounded-2xl bg-gradient-to-br from-amber-400 via-yellow-400 to-amber-500 opacity-50 group-hover:opacity-80 blur-md transition-opacity" />

                <div className={`relative rounded-2xl border-2 overflow-hidden h-full flex flex-col transition-all duration-300 hover:-translate-y-1 ${
                  isDarkMode ? 'bg-gray-800 border-amber-600/60' : 'bg-white border-amber-300'
                }`}>
                  {/* Rarity ribbon */}
                  <div className="absolute top-0 left-0 right-0 z-10 py-1 text-center text-[10px] font-extrabold tracking-widest text-white shadow-md" style={{ background: 'linear-gradient(90deg, #f59e0b, #fbbf24, #f59e0b)' }}>
                    ⭐ LEGENDARY ⭐
                  </div>

                  {/* Image with hover arrows */}
                  <div className="relative aspect-square mt-6 group/img cursor-pointer">
                    <img
                      src={showBackImage ? '/Pearadox_Tshirt_Back.png' : '/Pearadox_Tshirt_Front.png'}
                      alt={`Pearadox T-Shirt ${showBackImage ? 'Back' : 'Front'}`}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />

                    {/* Limited Edition Badge */}
                    <div className="absolute top-2 left-2 inline-flex items-center gap-1 px-2 py-0.5 bg-gradient-to-r from-amber-500 to-yellow-500 text-white text-[10px] font-bold rounded-full shadow-md">
                      <Zap className="h-3 w-3" />
                      LIMITED
                    </div>

                    {/* Image arrows */}
                    {showBackImage && (
                      <button
                        onClick={(e) => { e.stopPropagation(); setShowBackImage(false); }}
                        className={`absolute left-1.5 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full flex items-center justify-center opacity-0 group-hover/img:opacity-100 transition-all ${
                          isDarkMode ? 'bg-gray-900/80 hover:bg-gray-900 text-white' : 'bg-white/90 hover:bg-white text-gray-900'
                        } shadow-md`}
                      >
                        <ChevronLeft className="h-4 w-4" />
                      </button>
                    )}
                    {!showBackImage && (
                      <button
                        onClick={(e) => { e.stopPropagation(); setShowBackImage(true); }}
                        className={`absolute right-1.5 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full flex items-center justify-center opacity-0 group-hover/img:opacity-100 transition-all ${
                          isDarkMode ? 'bg-gray-900/80 hover:bg-gray-900 text-white' : 'bg-white/90 hover:bg-white text-gray-900'
                        } shadow-md`}
                      >
                        <ChevronRight className="h-4 w-4" />
                      </button>
                    )}

                    <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1 opacity-0 group-hover/img:opacity-100 transition-opacity">
                      <div className={`w-1.5 h-1.5 rounded-full transition-colors ${!showBackImage ? 'bg-white' : 'bg-white/50'}`}></div>
                      <div className={`w-1.5 h-1.5 rounded-full transition-colors ${showBackImage ? 'bg-white' : 'bg-white/50'}`}></div>
                    </div>
                  </div>

                  {/* Card Content */}
                  <div className="p-4 flex flex-col flex-1">
                    <div className="flex items-center gap-1.5 mb-1">
                      <Gift className="h-3.5 w-3.5 text-amber-500" />
                      <span className="text-[10px] font-bold uppercase tracking-wider text-amber-500">Exclusive Merch</span>
                    </div>
                    <h3 className={`text-base font-bold mb-1 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                      Pearadox T-Shirt
                    </h3>
                    <p className={`text-xs mb-3 line-clamp-2 flex-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      Premium cotton tee with the iconic Pearadox logo.
                    </p>

                    {/* Arcade-ticket price tag */}
                    <div className={`flex items-center justify-center gap-2 py-2 px-3 mb-3 rounded-lg border-2 border-dashed ${
                      isDarkMode ? 'bg-amber-900/20 border-amber-700/50' : 'bg-amber-50 border-amber-300'
                    }`}>
                      <Coins className="h-4 w-4 text-amber-500" />
                      <span className="text-base font-extrabold bg-gradient-to-r from-amber-600 to-yellow-600 bg-clip-text text-transparent tabular-nums">
                        {TSHIRT_PRICE} PEAR
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
                        className="flex-1 inline-flex items-center justify-center px-3 py-2 text-white font-bold text-xs rounded-lg transition-all shadow-md hover:shadow-lg hover:scale-105"
                        style={{ background: 'linear-gradient(90deg, #1db954, #16a14a)' }}
                      >
                        <ShoppingCart className="h-3.5 w-3.5 mr-1" />
                        REDEEM
                      </button>
                    </div>

                    {/* Insufficient Balance Error */}
                    {insufficientBalanceError && (
                      <div className="mt-3 p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
                        <p className="text-xs text-red-600 dark:text-red-400 font-medium">
                          Not enough tokens! Need {TSHIRT_PRICE} PEAR.
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
              </motion.div>

              {/* ──── RARE: USDC ──── */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="relative group"
              >
                {/* Outer glow halo */}
                <div className="absolute -inset-1 rounded-2xl bg-gradient-to-br from-blue-400 via-cyan-400 to-blue-500 opacity-40 group-hover:opacity-70 blur-md transition-opacity" />

                <div className={`relative rounded-2xl border-2 overflow-hidden h-full flex flex-col transition-all duration-300 hover:-translate-y-1 ${
                  isDarkMode ? 'bg-gray-800 border-blue-600/50' : 'bg-white border-blue-300'
                }`}>
                  {/* Rarity ribbon */}
                  <div className="absolute top-0 left-0 right-0 z-10 py-1 text-center text-[10px] font-extrabold tracking-widest text-white shadow-md" style={{ background: 'linear-gradient(90deg, #2563eb, #3b82f6, #2563eb)' }}>
                    💎 RARE 💎
                  </div>

                  {/* Image */}
                  <div className={`relative aspect-square mt-6 flex items-center justify-center ${isDarkMode ? 'bg-gray-900' : 'bg-gradient-to-br from-blue-50 to-blue-100'}`}>
                    <motion.img
                      src="/USD_Coin_logo.png"
                      alt="USDC"
                      className="w-28 h-28 object-contain"
                      animate={{ y: [0, -8, 0] }}
                      transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                    />
                    <div className="absolute top-2 left-2 inline-flex items-center gap-1 px-2 py-0.5 bg-gradient-to-r from-blue-500 to-blue-600 text-white text-[10px] font-bold rounded-full shadow-md">
                      <Sparkles className="h-3 w-3" />
                      CRYPTO
                    </div>
                  </div>

                  {/* Card Content */}
                  <div className="p-4 flex flex-col flex-1">
                    <div className="flex items-center gap-1.5 mb-1">
                      <Gift className="h-3.5 w-3.5 text-blue-500" />
                      <span className="text-[10px] font-bold uppercase tracking-wider text-blue-500">Crypto Reward</span>
                    </div>
                    <h3 className={`text-base font-bold mb-1 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                      USDC Stablecoin
                    </h3>
                    <p className={`text-xs mb-3 line-clamp-2 flex-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      Convert PEAR tokens to real USDC, sent to your wallet.
                    </p>

                    {/* Arcade-ticket price tag */}
                    <div className={`flex items-center justify-center gap-2 py-2 px-3 mb-3 rounded-lg border-2 border-dashed ${
                      isDarkMode ? 'bg-amber-900/20 border-amber-700/50' : 'bg-amber-50 border-amber-300'
                    }`}>
                      <Coins className="h-4 w-4 text-amber-500" />
                      <span className="text-base font-extrabold bg-gradient-to-r from-amber-600 to-yellow-600 bg-clip-text text-transparent tabular-nums">
                        100 PEAR = $1
                      </span>
                    </div>

                    {/* Buttons - Active */}
                    <div className="flex gap-2">
                      <button
                        onClick={() => { navigate('/store/usdc'); setTimeout(() => window.scrollTo({ top: 0, behavior: 'instant' }), 0); }}
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
                        onClick={handleRedeemUSDC}
                        className="flex-1 inline-flex items-center justify-center px-3 py-2 text-white font-bold text-xs rounded-lg transition-all shadow-md hover:shadow-lg hover:scale-105"
                        style={{ background: 'linear-gradient(90deg, #1db954, #16a14a)' }}
                      >
                        <ShoppingCart className="h-3.5 w-3.5 mr-1" />
                        REDEEM
                      </button>
                    </div>

                    {insufficientBalanceErrorUSDC && (
                      <div className="mt-3 p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
                        <p className="text-xs text-red-600 dark:text-red-400 font-medium">
                          Not enough tokens! Need at least {USDC_MIN_PRICE} PEAR.
                        </p>
                        <button
                          onClick={() => { setInsufficientBalanceErrorUSDC(false); handleStartEarning(); }}
                          className="text-xs text-red-500 dark:text-red-400 underline font-medium hover:text-red-700 dark:hover:text-red-300 mt-1"
                        >
                          Earn more tokens →
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>

              {/* ──── COMING SOON: Amazon Gift Card ──── */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                className="relative group"
              >
                <div className={`relative rounded-2xl border-2 overflow-hidden h-full flex flex-col ${
                  isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-300'
                }`}>
                  {/* Rarity ribbon */}
                  <div className="absolute top-0 left-0 right-0 z-10 py-1 text-center text-[10px] font-extrabold tracking-widest text-white shadow-md bg-gradient-to-r from-gray-500 via-gray-400 to-gray-500">
                    🔒 LOCKED 🔒
                  </div>

                  {/* Coming Soon Diagonal Banner */}
                  <div className="absolute top-6 right-0 z-20 w-28 h-28 overflow-visible">
                    <div className="absolute top-[18px] -right-[28px] w-[120px] bg-gray-600 text-white text-[10px] font-bold py-1 text-center transform rotate-45 shadow-md">
                      COMING SOON
                    </div>
                  </div>

                  {/* Greyed out overlay */}
                  <div className="absolute inset-0 bg-gray-500/20 z-10 pointer-events-none mt-6"></div>

                  {/* Image */}
                  <div className={`relative aspect-square mt-6 flex items-center justify-center ${isDarkMode ? 'bg-gray-900' : 'bg-gradient-to-br from-orange-50 to-amber-100'}`}>
                    <img
                      src="/Amazon_Giftcard.png"
                      alt="Amazon Gift Card"
                      className="w-28 h-28 object-contain opacity-70"
                    />
                  </div>

                  {/* Card Content */}
                  <div className="p-4 flex flex-col flex-1">
                    <div className="flex items-center gap-1.5 mb-1">
                      <Gift className="h-3.5 w-3.5 text-orange-500" />
                      <span className="text-[10px] font-bold uppercase tracking-wider text-orange-500">Gift Card</span>
                    </div>
                    <h3 className={`text-base font-bold mb-1 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                      Amazon Gift Card
                    </h3>
                    <p className={`text-xs mb-3 line-clamp-2 flex-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      Coming soon — redeem PEAR for an Amazon gift card.
                    </p>

                    {/* Price tag */}
                    <div className={`flex items-center justify-center gap-2 py-2 px-3 mb-3 rounded-lg border-2 border-dashed opacity-60 ${
                      isDarkMode ? 'bg-amber-900/20 border-amber-700/50' : 'bg-amber-50 border-amber-300'
                    }`}>
                      <Coins className="h-4 w-4 text-amber-500" />
                      <span className="text-base font-extrabold bg-gradient-to-r from-amber-600 to-yellow-600 bg-clip-text text-transparent tabular-nums">
                        1000 PEAR = $10
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
                        className="flex-1 inline-flex items-center justify-center px-3 py-2 font-bold text-xs rounded-lg cursor-not-allowed opacity-50 bg-gray-400 text-white"
                      >
                        <ShoppingCart className="h-3.5 w-3.5 mr-1" />
                        SOON
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>

            {/* More Coming Soon - playful */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className={`mt-8 flex items-center justify-center gap-3 py-4 px-6 rounded-2xl border-2 border-dashed ${
                isDarkMode ? 'bg-gray-800/30 border-gray-700' : 'bg-amber-50/60 border-amber-200'
              }`}
            >
              <span className="text-2xl animate-bounce" style={{ animationDuration: '2s' }}>🎁</span>
              <p className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                <span className="font-bold">More prizes loading...</span> Premium features and surprise drops on the way.
              </p>
              <span className="text-2xl animate-bounce" style={{ animationDuration: '2s', animationDelay: '0.3s' }}>🎁</span>
            </motion.div>
          </div>
        </section>

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

      {/* USDC Redemption Modal */}
      <USDCRedemptionModal
        isOpen={isUSDCRedemptionModalOpen}
        onClose={() => setIsUSDCRedemptionModalOpen(false)}
        user={user}
        availableBalance={availableBalance}
        onRedemptionSuccess={handleUSDCRedemptionSuccess}
      />
    </div>
  );
};

export default Store;
