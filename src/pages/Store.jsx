import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingBag, ArrowLeft, Sparkles, Coins, Gift, TrendingUp, Zap, Clock, BookOpen, Trophy, ArrowRight } from 'lucide-react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { useUser } from '../contexts/UserContext';
import { quizAPI } from '../lib/supabase';

const Store = () => {
  const navigate = useNavigate();
  const {
    savedArticlesFromDB,
    user,
  } = useUser();
  
  const [pearTokenCount, setPearTokenCount] = useState(0);
  const [isLoadingTokens, setIsLoadingTokens] = useState(false);
  
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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
      <Header 
        searchTerm=""
        onSearchChange={() => {}}
        selectedCategory=""
        onCategoryChange={() => {}}
        categories={[]}
        onShowSavedArticles={() => {}}
        onShowAccount={() => {}}
        savedCount={savedArticlesFromDB.length}
      />
      
      {/* Content Spacer for Fixed Header */}
      <div className="h-24 sm:h-20"></div>

      <main className="relative z-10">
        {/* Hero Section */}
        <section className="py-12 sm:py-20 relative overflow-hidden">
          {/* Background decorations */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute top-20 left-10 w-72 h-72 bg-green-100 rounded-full blur-3xl opacity-40"></div>
            <div className="absolute bottom-20 right-10 w-96 h-96 bg-amber-100 rounded-full blur-3xl opacity-40"></div>
          </div>

          <div className="max-w-5xl mx-auto px-4 sm:px-6 text-center relative">
            {/* Coming Soon Badge */}
            <div className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-amber-50 to-yellow-50 border border-amber-200 rounded-full mb-6">
              <Clock className="h-4 w-4 text-amber-600 mr-2" />
              <span className="text-amber-700 font-medium text-sm">Launching Soon</span>
            </div>

            {/* Title */}
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-gray-900 mb-4">
              The PEAR <span style={{ color: '#1db954' }}>Store</span>
            </h1>
            
            {/* Subtitle */}
            <p className="text-lg sm:text-xl text-gray-600 mb-8 max-w-2xl mx-auto leading-relaxed">
              Your knowledge has value. Redeem PEAR tokens for real rewards — including <span className="font-semibold text-gray-800">crypto and merch</span>.
            </p>

            {/* Token Display for logged in users */}
            {user && (
              <div className="inline-flex items-center gap-4 px-6 py-4 bg-gradient-to-br from-amber-50 via-yellow-50/50 to-orange-50/30 rounded-2xl shadow-lg border border-amber-200 mb-8">
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
                  <p className="text-sm text-gray-500">Your current balance</p>
                </div>
              </div>
            )}

            {/* How to Earn PEAR Steps - Inline */}
            <div className="mt-10 max-w-4xl mx-auto">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">How to Earn PEAR</h2>
              <p className="text-gray-600 text-sm mb-6">It's simple: learn, prove it, and get rewarded.</p>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-8">
                <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 text-center hover:shadow-md transition-shadow">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold mx-auto mb-2 text-sm" style={{ backgroundColor: '#1db954' }}>
                    1
                  </div>
                  <h3 className="font-semibold text-gray-900 text-sm mb-0.5">Explore</h3>
                  <p className="text-gray-500 text-xs">Browse papers</p>
                </div>
                <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 text-center hover:shadow-md transition-shadow">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold mx-auto mb-2 text-sm" style={{ backgroundColor: '#1db954' }}>
                    2
                  </div>
                  <h3 className="font-semibold text-gray-900 text-sm mb-0.5">Read</h3>
                  <p className="text-gray-500 text-xs">Learn summaries</p>
                </div>
                <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 text-center hover:shadow-md transition-shadow">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold mx-auto mb-2 text-sm" style={{ backgroundColor: '#1db954' }}>
                    3
                  </div>
                  <h3 className="font-semibold text-gray-900 text-sm mb-0.5">Quiz</h3>
                  <p className="text-gray-500 text-xs">Test knowledge</p>
                </div>
                <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 text-center hover:shadow-md transition-shadow">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold mx-auto mb-2 text-sm" style={{ backgroundColor: '#1db954' }}>
                    4
                  </div>
                  <h3 className="font-semibold text-gray-900 text-sm mb-0.5">Earn</h3>
                  <p className="text-gray-500 text-xs">Get PEAR tokens</p>
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
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3">What You Can Redeem</h2>
              <p className="text-gray-600 max-w-xl mx-auto">Stack your PEAR tokens now. When the store opens, you'll have first access to exclusive rewards.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {/* Crypto Card */}
              <div className="relative bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-6 text-white overflow-hidden group hover:scale-[1.02] transition-transform h-full">
                <div className="absolute top-0 right-0 w-32 h-32 bg-green-500 rounded-full blur-3xl opacity-20 group-hover:opacity-30 transition-opacity"></div>
                <div className="relative h-full flex flex-col">
                  <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center mb-4">
                    <Coins className="h-6 w-6 text-green-400" />
                  </div>
                  <h3 className="text-xl font-bold mb-2">Crypto Rewards</h3>
                  <p className="text-gray-400 text-sm mb-4 flex-1">Convert PEAR tokens to USDC and other cryptocurrencies. Real value for real learning.</p>
                  <div className="flex items-center text-green-400 text-sm font-medium mt-auto">
                    <TrendingUp className="h-4 w-4 mr-1" />
                    High Value
                  </div>
                </div>
              </div>

              {/* Premium Features Card */}
              <div className="relative bg-white rounded-2xl p-6 shadow-lg border border-gray-100 overflow-hidden group hover:scale-[1.02] transition-transform hover:border-green-200 h-full">
                <div className="absolute top-0 right-0 w-32 h-32 bg-amber-400 rounded-full blur-3xl opacity-10 group-hover:opacity-20 transition-opacity"></div>
                <div className="relative h-full flex flex-col">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-4" style={{ backgroundColor: '#1db954' }}>
                    <Zap className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Premium Features</h3>
                  <p className="text-gray-600 text-sm mb-4 flex-1">Unlock advanced AI summaries, priority access to new papers, and exclusive tools.</p>
                  <div className="flex items-center text-amber-600 text-sm font-medium mt-auto">
                    <Sparkles className="h-4 w-4 mr-1" />
                    Exclusive Access
                  </div>
                </div>
              </div>

              {/* Merch Card */}
              <div className="relative bg-white rounded-2xl p-6 shadow-lg border border-gray-100 overflow-hidden group hover:scale-[1.02] transition-transform hover:border-green-200 h-full">
                <div className="absolute top-0 right-0 w-32 h-32 bg-purple-400 rounded-full blur-3xl opacity-10 group-hover:opacity-20 transition-opacity"></div>
                <div className="relative h-full flex flex-col">
                  <div className="w-12 h-12 rounded-xl bg-purple-100 flex items-center justify-center mb-4">
                    <Gift className="h-6 w-6 text-purple-600" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Exclusive Merch</h3>
                  <p className="text-gray-600 text-sm mb-4 flex-1">Rep your Pearadox journey with limited edition merchandise and collectibles.</p>
                  <div className="flex items-center text-purple-600 text-sm font-medium mt-auto">
                    <Trophy className="h-4 w-4 mr-1" />
                    Limited Edition
                  </div>
                </div>
              </div>
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
    </div>
  );
};

export default Store;
