import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, ShoppingCart, Check, Truck, ChevronLeft, ChevronRight } from 'lucide-react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import SavedArticles from '../components/SavedArticles';
import AccountModal from '../components/AccountModal';
import { useUser } from '../contexts/UserContext';
import { useTheme } from '../contexts/ThemeContext';
import { quizAPI } from '../lib/supabase';

const ProductDetail = () => {
  const { productId } = useParams();
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
  const [activeImage, setActiveImage] = useState(0);
  const [selectedSize, setSelectedSize] = useState('M');

  // Scroll to top on mount
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, []);
  
  // Product data
  const product = {
    id: 'pearadox_tshirt',
    name: 'Pearadox T-Shirt',
    description: 'Rep your Pearadox journey with our premium cotton tee. Features the iconic Pearadox logo on the front and a unique design on the back. Perfect for researchers, learners, and AI enthusiasts who want to show their commitment to democratizing knowledge.',
    price: 50,
    images: [
      '/Pearadox_Tshirt_Front.png',
      '/Pearadox_Tshirt_Back.png'
    ],
    sizes: ['S', 'M', 'L', 'XL', '2XL', '3XL'],
    features: [
      '100% Premium Cotton',
      'Unisex modern fit',
      'High-quality screen printed graphics',
      'Machine washable'
    ],
    shipping: 'Free worldwide shipping on all orders. Estimated delivery: 7-14 business days.',
    returns: '30-day satisfaction guarantee. If you\'re not happy with your purchase, we\'ll refund your PEAR tokens.',
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

  const nextImage = () => {
    setActiveImage((prev) => (prev + 1) % product.images.length);
  };

  const prevImage = () => {
    setActiveImage((prev) => (prev - 1 + product.images.length) % product.images.length);
  };

  // Handle 404 for unknown products
  if (productId !== 'pearadox_tshirt') {
    return (
      <div className={`min-h-screen flex items-center justify-center ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
        <div className="text-center">
          <h1 className={`text-4xl font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Product Not Found</h1>
          <p className={`mb-6 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>The product you're looking for doesn't exist.</p>
          <Link 
            to="/store"
            className="inline-flex items-center px-6 py-3 text-white font-semibold rounded-xl transition-all hover:opacity-90"
            style={{ backgroundColor: '#1db954' }}
          >
            <ArrowLeft className="h-5 w-5 mr-2" />
            Back to Store
          </Link>
        </div>
      </div>
    );
  }

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

      <main className="relative z-10 py-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          {/* Back Button */}
          <Link 
            to="/store"
            className="inline-flex items-center mb-6 transition-colors"
            style={{ color: '#1db954' }}
          >
            <ArrowLeft className="h-5 w-5 mr-2" />
            Back to Store
          </Link>

          {/* Product Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
            {/* Image Gallery */}
            <div>
              {/* Main Image */}
              <div className={`relative aspect-square rounded-2xl overflow-hidden mb-4 ${isDarkMode ? 'bg-gray-800' : 'bg-gray-100'}`}>
                <img 
                  src={product.images[activeImage]}
                  alt={`${product.name} - View ${activeImage + 1}`}
                  className="w-full h-full object-cover"
                />
                
                {/* Navigation Arrows */}
                <button 
                  onClick={prevImage}
                  className={`absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                    isDarkMode ? 'bg-gray-900/80 hover:bg-gray-900 text-white' : 'bg-white/80 hover:bg-white text-gray-900'
                  } shadow-lg`}
                >
                  <ChevronLeft className="h-6 w-6" />
                </button>
                <button 
                  onClick={nextImage}
                  className={`absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                    isDarkMode ? 'bg-gray-900/80 hover:bg-gray-900 text-white' : 'bg-white/80 hover:bg-white text-gray-900'
                  } shadow-lg`}
                >
                  <ChevronRight className="h-6 w-6" />
                </button>

                {/* Limited Edition Badge */}
                <div className="absolute top-4 left-4 px-4 py-1.5 bg-gradient-to-r from-amber-500 to-yellow-500 text-white text-sm font-bold rounded-full shadow-lg">
                  LIMITED EDITION
                </div>
              </div>

              {/* Thumbnails */}
              <div className="flex gap-3 justify-center">
                {product.images.map((img, index) => (
                  <button 
                    key={index}
                    onClick={() => setActiveImage(index)}
                    className={`relative w-20 h-20 rounded-xl overflow-hidden border-2 transition-all ${
                      activeImage === index 
                        ? 'border-green-500 ring-2 ring-green-500/30' 
                        : isDarkMode ? 'border-gray-700 hover:border-gray-600' : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <img 
                      src={img} 
                      alt={`View ${index + 1}`} 
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            </div>

            {/* Product Info */}
            <div>
              {/* Title & Price */}
              <div className="mb-6">
                <span className="text-sm font-semibold uppercase tracking-wide" style={{ color: '#1db954' }}>Exclusive Merch</span>
                <h1 className={`text-3xl sm:text-4xl font-bold mt-1 mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  {product.name}
                </h1>
                
                {/* Price Display */}
                <div className={`inline-flex items-center gap-3 px-5 py-3 rounded-xl ${isDarkMode ? 'bg-gray-800' : 'bg-amber-50'}`}>
                  <div className="relative">
                    <div className="absolute inset-0 rounded-full bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-400 blur-md opacity-60"></div>
                    <div className="absolute -inset-0.5 rounded-full bg-gradient-to-r from-yellow-400 to-amber-500 opacity-30 blur-sm"></div>
                    <div className="relative w-10 h-10 rounded-full bg-gradient-to-br from-amber-300 via-yellow-400 to-amber-500 flex items-center justify-center shadow-lg border border-yellow-300/50">
                      <div className="absolute inset-1 rounded-full bg-gradient-to-br from-white/40 via-transparent to-transparent"></div>
                    </div>
                  </div>
                  <div>
                    <p className="text-2xl font-bold bg-gradient-to-r from-amber-600 to-yellow-600 bg-clip-text text-transparent">
                      {product.price} PEAR Tokens
                    </p>
                  </div>
                </div>

                {/* User Balance */}
                {user && (
                  <p className={`mt-3 text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    Your balance: <span className="font-semibold text-amber-600">{isLoadingTokens ? '...' : pearTokenCount} PEAR</span>
                    {pearTokenCount >= product.price && (
                      <span className="ml-2 text-green-500 font-medium">✓ Enough to redeem!</span>
                    )}
                  </p>
                )}
              </div>

              {/* Description */}
              <p className={`mb-6 leading-relaxed ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                {product.description}
              </p>

              {/* Size Selection */}
              <div className="mb-6">
                <label className={`block text-sm font-semibold mb-3 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  Select Size
                </label>
                <div className="flex flex-wrap gap-2">
                  {product.sizes.map((size) => (
                    <button
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      className={`px-4 py-2 rounded-lg font-medium transition-all ${
                        selectedSize === size
                          ? 'text-white shadow-lg'
                          : isDarkMode 
                            ? 'bg-gray-800 text-gray-300 hover:bg-gray-700 border border-gray-700' 
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-200'
                      }`}
                      style={selectedSize === size ? { backgroundColor: '#1db954' } : {}}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>

              {/* Redeem Button */}
              <button 
                className="w-full flex items-center justify-center px-6 py-4 text-white font-semibold rounded-xl transition-all hover:opacity-90 hover:scale-[1.02] shadow-lg mb-6"
                style={{ backgroundColor: '#1db954' }}
              >
                <ShoppingCart className="h-5 w-5 mr-2" />
                Redeem for {product.price} PEAR
              </button>

              {/* Features */}
              <div className={`p-5 rounded-xl mb-6 ${isDarkMode ? 'bg-gray-800' : 'bg-gray-50'}`}>
                <h3 className={`font-semibold mb-3 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Product Features</h3>
                <ul className="space-y-2">
                  {product.features.map((feature, index) => (
                    <li key={index} className="flex items-center gap-2">
                      <div className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: '#1db954' }}>
                        <Check className="h-3 w-3 text-white" />
                      </div>
                      <span className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Shipping */}
              <div className={`p-4 rounded-xl border ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
                <div className="flex items-center gap-3 mb-2">
                  <Truck className="h-5 w-5" style={{ color: '#1db954' }} />
                  <span className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Free Shipping</span>
                </div>
                <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  Worldwide delivery in 7-14 days
                </p>
              </div>
            </div>
          </div>
        </div>
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
    </div>
  );
};

export default ProductDetail;
