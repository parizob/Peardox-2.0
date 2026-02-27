import React, { useState, useEffect } from 'react';
import { ArrowLeft, Headphones, ExternalLink, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import SavedArticles from '../components/SavedArticles';
import AccountModal from '../components/AccountModal';
import ArticleModal from '../components/ArticleModal';
import { useUser } from '../contexts/UserContext';
import { useTheme } from '../contexts/ThemeContext';
import { viewedArticlesAPI } from '../lib/supabase';

const Podcasts = () => {
  const [isVisible, setIsVisible] = useState({});
  
  // Modal states
  const [isSavedArticlesOpen, setIsSavedArticlesOpen] = useState(false);
  const [isAccountOpen, setIsAccountOpen] = useState(false);
  const [selectedArticle, setSelectedArticle] = useState(null);
  const [isArticleModalOpen, setIsArticleModalOpen] = useState(false);
  
  // Theme context
  const { isDarkMode } = useTheme();
  
  // Get user state from context
  const {
    user,
    userProfile,
    userSkillLevel,
    userResearchInterests,
    savedArticlesFromDB,
    isLoadingSavedArticles,
    favorites,
    loadUserSavedArticles,
    handleSkillLevelChange,
    handleResearchInterestsChange,
    handleToggleFavorite
  } = useUser();

  // Handle scroll animations
  useEffect(() => {
    setIsVisible({
      hero: true,
      podcasts: true
    });
  }, []);

  // Modal handlers
  const handleShowSavedArticles = () => {
    setIsSavedArticlesOpen(true);
    if (user) {
      loadUserSavedArticles();
    }
  };

  const handleCloseSavedArticles = () => {
    setIsSavedArticlesOpen(false);
  };

  const handleShowAccount = () => {
    setIsAccountOpen(true);
  };

  const handleCloseAccount = () => {
    setIsAccountOpen(false);
  };

  const handleArticleClick = async (article) => {
    setSelectedArticle(article);
    setIsArticleModalOpen(true);
    
    if (viewedArticlesAPI && article) {
      try {
        await viewedArticlesAPI.recordArticleView(user?.id, article, userSkillLevel);
      } catch (error) {
        console.error('Error recording article view:', error);
      }
    }
  };

  const handleCloseArticleModal = () => {
    setIsArticleModalOpen(false);
    setSelectedArticle(null);
  };

  // Curated podcast episodes
  const podcastEpisodes = [
    {
      id: 1,
      spotifyId: '72djm6TCuLtVyuIMJyOjIK',
      title: 'Ben Horowitz: xAI Executive Exodus, Apple\'s AI Crisis, The Page of AI',
      podcast: 'Moonshots With Peter Diamandis',
      description: 'Ben Horowitz and Peter Diamandis argue that AI\'s acceleration is outstripping terrestrial infrastructure, shifting the strategic focus toward off-planet energy solutions and specialized hardware to sustain recursive self-improvement. They suggest that the rapid closing of the "uncanny valley" and the rise of autonomous agents are forcing massive geopolitical bets that transcend simple software updates and move into the realm of global transformation.',
      tags: ['AI Investing', 'Silicon Valley', 'Compute', 'Tech Evolution'],
      duration: '1.5+ hours',
    },
    {
      id: 2,
      spotifyId: '2ZNrpVSrgZMlDwQinl20Ay',
      title: 'Dario Amodei - "We are near the end of exponential"',
      podcast: 'Dwarkesh Podcast',
      description: 'Dario Amodei posits that the industry is rapidly approaching a "country of geniuses" through scaling laws, shifting the strategic focus from raw model capabilities to the massive economic diffusion of intelligence. He argues that the true challenge lies in the timing and allocation of immense compute resources, where multi-billion-dollar bets on agents and infrastructure will ultimately decide how quickly global power and productivity compound.',
      tags: ['AI', 'Foundation Models', 'Anthropic', 'Future of AI', 'Scaling Laws'],
      duration: '2+ hours',
    },
    {
      id: 3,
      spotifyId: '0JngRfN8UnFunkzrGUj9AS',
      title: 'Bill Gurley',
      podcast: 'Tetragamamton',
      description: 'Bill Gurley draws on his deep background in tech economics to analyze how AI represents a complex intersection of market hype and a genuine platform shift that reshapes power dynamics. He emphasizes that enduring success in this era requires first-principles thinking, the courage to take long-term risks, and a wary eye toward regulatory capture and misaligned incentives.',
      tags: ['Tech', 'Career Advice', 'Investing', 'Risk Taking'],
      duration: '1.5+ hours',
    },
    {
      id: 4,
      spotifyId: '5boGa1dClc7EKdLIrnsAD9',
      title: 'Marc Andreessen on Why This Is the Most Important Moment in Tech History',
      podcast: 'The A16Z Show',
      description: 'Marc Andreessen argues that the current era represents a fundamental structural reset where AI acts as a vital solution to global economic stagnation and shifting demographics. The conversation shifts the focus from mere technical execution to the compounding power of human judgment and taste, enabling "super-empowered" individuals to build massive value with unprecedented leverage.',
      tags: ['AI', 'Macroeconomics', 'Work', 'Tech Investing'],
      duration: '1.5+ hours',
    },
    {
      id: 5,
      spotifyId: '5ilZL35OkcOBadelSce6KS',
      title: 'Kevin Kelly: Excellet Advice for Living',
      podcast: 'Founders',
      description: 'This isn’t an AI episode. But it is about the foundations that determine whether AI becomes leverage or noise. What makes this episode stand out is clarity. The advice strips away tactics and trends — the same discipline required to separate signal from noise in AI research.',
      tags: ['Life Advice', 'Leverage', 'Founders', 'Comapny Building'],
      duration: '30+ minutes',
    },
  ];

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-gray-900' : 'bg-gradient-to-br from-gray-50 via-white to-gray-50'}`}>
      <Header 
        searchTerm=""
        onSearchChange={() => {}}
        selectedCategory=""
        onCategoryChange={() => {}}
        categories={[]}
        onShowSavedArticles={handleShowSavedArticles}
        onShowAccount={handleShowAccount}
        savedCount={savedArticlesFromDB.length}
        isBlogPage={true}
      />
      
      {/* Content Spacer for Fixed Header */}
      <div className="h-24 sm:h-20"></div>

      <main className="relative z-10">
        {/* Hero Section */}
        <section className="pt-8 pb-4 sm:pt-12 sm:pb-6">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
            <div 
              className={`transform transition-all duration-1000 ${
                isVisible.hero ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
              }`}
            >
              <div className="max-w-5xl mx-auto">
                {/* Main Header */}
                <div className="text-center">
                  <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl mb-4 shadow-lg" style={{ backgroundColor: '#1db954' }}>
                    <Headphones className="h-7 w-7 text-white" />
                  </div>
                  
                  <h1 className={`text-3xl sm:text-4xl md:text-5xl font-bold mb-3 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    <span>Recommended</span>
                    <span className="block sm:inline"> Podcasts</span>
                  </h1>
                  
                  <p className={`text-base sm:text-lg max-w-2xl mx-auto leading-relaxed mb-4 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    A curated playlist for curious minds. Deep conversations exploring mathematics, physics, consciousness, learning, and the nature of reality.
                  </p>
                  
                  {/* Spotify Badge */}
                  <div className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-medium ${
                    isDarkMode ? 'bg-gray-800 text-gray-300' : 'bg-gray-100 text-gray-700'
                  }`}>
                    <Sparkles className="h-4 w-4 mr-2" style={{ color: '#1db954' }} />
                    Hand-picked episodes we love
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Podcasts Section */}
        <section className="py-6 sm:py-8">
          <div className="max-w-4xl mx-auto px-4 sm:px-6">
            <div 
              className={`transform transition-all duration-1000 ${
                isVisible.podcasts ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
              }`}
            >
              <div className="space-y-6 sm:space-y-8">
                {podcastEpisodes.map((episode, index) => (
                  <article 
                    key={episode.id} 
                    className={`rounded-xl sm:rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 ${
                      isDarkMode ? 'bg-gray-800' : 'bg-white'
                    }`}
                    style={{
                      animationDelay: `${index * 100}ms`
                    }}
                  >
                    {/* Episode Info */}
                    <div className="p-4 sm:p-6">
                      {/* Podcast Name */}
                      <div className={`text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                        {episode.podcast}
                      </div>
                      
                      {/* Episode Title */}
                      <h2 className={`text-xl sm:text-2xl font-bold mb-3 leading-tight ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                        {episode.title}
                      </h2>
                      
                      {/* Description */}
                      <p className={`text-sm sm:text-base mb-4 leading-relaxed ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        {episode.description}
                      </p>
                      
                      {/* Tags & Duration */}
                      <div className="flex flex-wrap items-center gap-2 mb-4">
                        {episode.tags.map((tag, tagIndex) => (
                          <span 
                            key={tagIndex}
                            className={`px-2 py-1 text-xs rounded-full font-medium ${
                              isDarkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-700'
                            }`}
                          >
                            {tag}
                          </span>
                        ))}
                        <span className={`text-xs ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                          • {episode.duration}
                        </span>
                      </div>
                      
                      {/* Spotify Embed */}
                      <div className="rounded-xl overflow-hidden">
                        <iframe
                          style={{ borderRadius: '12px' }}
                          src={`https://open.spotify.com/embed/episode/${episode.spotifyId}?utm_source=generator&theme=${isDarkMode ? '0' : '1'}`}
                          width="100%"
                          height="152"
                          frameBorder="0"
                          allowFullScreen
                          allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                          loading="lazy"
                        ></iframe>
                      </div>
                      
                      {/* Open in Spotify Link */}
                      <div className="mt-4 flex justify-end">
                        <a
                          href={`https://open.spotify.com/episode/${episode.spotifyId}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={`inline-flex items-center text-sm font-medium transition-colors ${
                            isDarkMode ? 'text-gray-400 hover:text-white' : 'text-gray-500 hover:text-gray-900'
                          }`}
                        >
                          <ExternalLink className="h-4 w-4 mr-1" />
                          Open in Spotify
                        </a>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
              
              {/* Coming Soon */}
              <div className="text-center py-12">
                <div className={`inline-flex items-center px-6 py-3 rounded-xl ${isDarkMode ? 'bg-gray-800 text-gray-400' : 'bg-gray-100 text-gray-600'}`}>
                  <Headphones className="h-5 w-5 mr-2" />
                  <span className="font-medium">More episodes coming soon...</span>
                </div>
                <p className={`mt-4 text-sm ${isDarkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                  We're always hunting for mind-expanding conversations. Have a recommendation?{' '}
                  <a 
                    href="mailto:pearadoxapp@gmail.com" 
                    className="underline hover:no-underline"
                    style={{ color: '#1db954' }}
                  >
                    Let us know
                  </a>
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Back to Research Hub */}
      <div className="flex items-center justify-center mb-8">
        <Link 
          to="/"
          className="inline-flex items-center transition-colors group"
          style={{ color: '#1db954' }}
          onMouseEnter={(e) => e.currentTarget.style.color = '#16a14a'}
          onMouseLeave={(e) => e.currentTarget.style.color = '#1db954'}
          onClick={() => {
            setTimeout(() => window.scrollTo({ top: 0, behavior: 'smooth' }), 100);
          }}
        >
          <ArrowLeft className="h-5 w-5 mr-2 group-hover:-translate-x-1 transition-transform" />
          Back to Research Hub
        </Link>
      </div>

      <Footer />

      {/* Modals */}
      <ArticleModal
        isOpen={isArticleModalOpen}
        onClose={handleCloseArticleModal}
        article={selectedArticle}
        isFavorite={selectedArticle ? favorites.has(selectedArticle.id) : false}
        onToggleFavorite={handleToggleFavorite}
      />

      <SavedArticles
        isOpen={isSavedArticlesOpen}
        onClose={handleCloseSavedArticles}
        savedArticles={savedArticlesFromDB}
        onArticleClick={handleArticleClick}
        onToggleFavorite={handleToggleFavorite}
        isLoading={isLoadingSavedArticles}
        user={user}
      />

      <AccountModal
        isOpen={isAccountOpen}
        onClose={handleCloseAccount}
        userSkillLevel={userSkillLevel}
        onSkillLevelChange={handleSkillLevelChange}
        onResearchInterestsChange={handleResearchInterestsChange}
      />
    </div>
  );
};

export default Podcasts;
