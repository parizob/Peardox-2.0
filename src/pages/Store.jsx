import React from 'react';
import { Link } from 'react-router-dom';
import { ShoppingBag, ArrowLeft, Sparkles } from 'lucide-react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { useUser } from '../contexts/UserContext';

const Store = () => {
  const {
    savedArticlesFromDB,
  } = useUser();

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
        <section className="py-16 sm:py-24">
          <div className="max-w-2xl mx-auto px-4 sm:px-6 text-center">
            {/* Icon */}
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl mb-8 shadow-lg" style={{ backgroundColor: '#1db954' }}>
              <ShoppingBag className="h-10 w-10 text-white" />
            </div>
            
            {/* Title */}
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              PEAR Store
            </h1>
            
            {/* Subtitle */}
            <p className="text-lg text-gray-600 mb-8 max-w-lg mx-auto leading-relaxed">
              Redeem your PEAR tokens for exclusive rewards, merchandise, and premium features.
            </p>

            {/* Coming Soon Badge */}
            <div className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-amber-100 to-yellow-100 border border-amber-200 rounded-full mb-12">
              <Sparkles className="h-5 w-5 text-amber-600 mr-2" />
              <span className="text-amber-800 font-semibold">Coming Soon</span>
            </div>

            {/* Info Card */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8 text-left">
              <h2 className="text-xl font-bold text-gray-900 mb-4">How it works</h2>
              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold text-sm flex-shrink-0" style={{ backgroundColor: '#1db954' }}>
                    1
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">Read Research</h3>
                    <p className="text-gray-600 text-sm">Explore AI research papers on Pearadox</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold text-sm flex-shrink-0" style={{ backgroundColor: '#1db954' }}>
                    2
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">Take Quizzes</h3>
                    <p className="text-gray-600 text-sm">Test your understanding after each paper</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold text-sm flex-shrink-0" style={{ backgroundColor: '#1db954' }}>
                    3
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">Earn PEAR Tokens</h3>
                    <p className="text-gray-600 text-sm">Get rewarded for correct answers</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold text-sm flex-shrink-0" style={{ backgroundColor: '#1db954' }}>
                    4
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">Redeem Rewards</h3>
                    <p className="text-gray-600 text-sm">Exchange tokens for exclusive perks</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Back Link */}
            <div className="mt-12">
              <Link 
                to="/"
                className="inline-flex items-center transition-colors group"
                style={{ color: '#1db954' }}
                onMouseEnter={(e) => e.currentTarget.style.color = '#16a14a'}
                onMouseLeave={(e) => e.currentTarget.style.color = '#1db954'}
              >
                <ArrowLeft className="h-5 w-5 mr-2 group-hover:-translate-x-1 transition-transform" />
                Back to Research Hub
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Store;

