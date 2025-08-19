import React, { useState, useEffect } from 'react';
import { ArrowLeft, Users, Target, Heart, Brain, Lightbulb, Globe, Rocket, CheckCircle, Star, Quote, ArrowRight, BookOpen, Zap } from 'lucide-react';
import { Link } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import SavedArticles from '../components/SavedArticles';
import AccountModal from '../components/AccountModal';
import { useUser } from '../contexts/UserContext';

const AboutUs = () => {
  const [isVisible, setIsVisible] = useState({});
  
  // Modal states
  const [isSavedArticlesOpen, setIsSavedArticlesOpen] = useState(false);
  const [isAccountOpen, setIsAccountOpen] = useState(false);
  
  // Get user state from context
  const {
    user,
    userProfile,
    userSkillLevel,
    userResearchInterests,
    savedArticlesFromDB,
    isLoadingSavedArticles,
    loadUserSavedArticles,
    handleSkillLevelChange,
    handleResearchInterestsChange,
    handleToggleFavorite
  } = useUser();

  // Handle scroll animations
  useEffect(() => {
    // Simplified - just set all sections as visible
    setIsVisible({
      stats: true,
      story: true,
      'story-visual': true,
      'value-0': true,
      'value-1': true,
      'value-2': true,
      'value-3': true,
      'team-0': true,
      'team-1': true,
      'team-2': true,
      impact: true,
      contact: true
    });
  }, []);

  // Modal handlers
  const handleShowSavedArticles = () => {
    setIsSavedArticlesOpen(true);
    // Refresh saved articles when opening the modal
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

  // Article click handler for saved articles
  const handleArticleClick = (article) => {
    // Could implement article modal here if needed
    console.log('Article clicked:', article);
  };

  const teamMembers = [
    {
      name: "Research Team",
      role: "AI & Scientific Research",
      description: "PhD researchers and AI specialists working to democratize scientific knowledge",
      icon: Brain,
      color: "from-blue-500 to-indigo-600"
    },
    {
      name: "Engineering Team", 
      role: "Platform Development",
      description: "Full-stack developers building scalable, user-friendly research tools",
      icon: Rocket,
      color: "from-green-500 to-emerald-600"
    },
    {
      name: "UX Team",
      role: "User Experience",
      description: "Designers focused on making complex research accessible to everyone",
      icon: Heart,
      color: "from-pink-500 to-rose-600"
    }
  ];

  const values = [
    {
      icon: Globe,
      title: "Democratize Knowledge",
      description: "Making cutting-edge research accessible to everyone, regardless of background or experience level."
    },
    {
      icon: Lightbulb,
      title: "Simplify Complexity",
      description: "Transforming dense academic papers into clear, actionable insights using AI technology."
    },
    {
      icon: Zap,
      title: "Accelerate Discovery", 
      description: "Helping researchers, students, and professionals stay ahead in the rapidly evolving world of AI."
    },
    {
      icon: Users,
      title: "Build Community",
      description: "Creating a collaborative space where knowledge sharing drives innovation and progress."
    }
  ];

  const stats = [
    { number: "1M+", label: "Authors Indexed", icon: Users },
    { number: "50K+", label: "Papers Processed", icon: BookOpen },
    { number: "100+", label: "Research Categories", icon: Target },
    { number: "24/7", label: "Real-time Updates", icon: Zap }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50">
      <Header 
        searchTerm=""
        onSearchChange={() => {}}
        selectedCategory=""
        onCategoryChange={() => {}}
        categories={[]}
        onShowSavedArticles={handleShowSavedArticles}
        onShowAccount={handleShowAccount}
        savedCount={savedArticlesFromDB.length}
        isAboutPage={true}
      />
      
      {/* Content Spacer for Fixed Header */}
      <div className="h-24 sm:h-20"></div>

      <main className="relative z-10">
        {/* Hero Section */}
        <section className="pt-12 pb-20 px-4 sm:px-6">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <div className="flex items-center justify-center mb-8">
                <Link 
                  to="/"
                  className="inline-flex items-center text-blue-600 hover:text-blue-800 transition-colors group"
                >
                  <ArrowLeft className="h-5 w-5 mr-2 group-hover:-translate-x-1 transition-transform" />
                  Back to Research Hub
                </Link>
              </div>
              
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 mb-6 leading-tight">
                About <span className="bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">Pearadox</span>
              </h1>
              
              <p className="text-xl sm:text-2xl text-gray-600 max-w-4xl mx-auto leading-relaxed">
                We're on a mission to democratize AI research, making cutting-edge discoveries accessible to everyone.
              </p>
            </div>

            {/* Stats Section */}
            <div 
              data-animate
              id="stats"
              className={`grid grid-cols-2 lg:grid-cols-4 gap-6 mb-20 transform transition-all duration-1000 ${
                isVisible.stats ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
              }`}
            >
              {stats.map((stat, index) => (
                <div key={index} className="text-center p-6 bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100">
                  <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-r from-blue-500 to-green-500 rounded-xl mb-4">
                    <stat.icon className="h-6 w-6 text-white" />
                  </div>
                  <div className="text-3xl font-bold text-gray-900 mb-2">{stat.number}</div>
                  <div className="text-gray-600 font-medium">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Our Story Section */}
        <section className="py-20 bg-gradient-to-r from-blue-50 to-green-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <div className="grid lg:grid-cols-2 gap-16 items-center">
              <div 
                data-animate
                id="story"
                className={`transform transition-all duration-1000 ${
                  isVisible.story ? 'translate-x-0 opacity-100' : '-translate-x-10 opacity-0'
                }`}
              >
                <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-6">
                  Our Story
                </h2>
                <div className="space-y-6 text-lg text-gray-700 leading-relaxed">
                  <p>
                    In a world where groundbreaking AI research is published daily, we noticed a critical gap: 
                    the most important discoveries were trapped behind academic jargon and complex methodologies.
                  </p>
                  <p>
                    <strong className="text-gray-900">Pearadox was born from a simple belief:</strong> everyone should have access 
                    to the knowledge that's shaping our future, regardless of their academic background or technical expertise.
                  </p>
                  <p>
                    We combine advanced AI with human expertise to transform dense research papers into clear, 
                    actionable insights that empower researchers, students, entrepreneurs, and curious minds worldwide.
                  </p>
                </div>
              </div>
              
              <div 
                data-animate
                id="story-visual"
                className={`transform transition-all duration-1000 delay-300 ${
                  isVisible['story-visual'] ? 'translate-x-0 opacity-100' : 'translate-x-10 opacity-0'
                }`}
              >
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-green-400 rounded-3xl transform rotate-3"></div>
                  <div className="relative bg-white rounded-3xl p-8 shadow-2xl">
                    <div className="flex items-center mb-6">
                      <div className="w-4 h-4 bg-red-400 rounded-full mr-2"></div>
                      <div className="w-4 h-4 bg-yellow-400 rounded-full mr-2"></div>
                      <div className="w-4 h-4 bg-green-400 rounded-full"></div>
                    </div>
                    <div className="space-y-4">
                      <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                      <div className="h-4 bg-blue-200 rounded w-full"></div>
                      <div className="h-4 bg-green-200 rounded w-2/3"></div>
                      <div className="h-8 bg-gradient-to-r from-blue-100 to-green-100 rounded"></div>
                      <div className="flex space-x-2">
                        <div className="h-6 w-6 bg-blue-400 rounded"></div>
                        <div className="h-6 w-6 bg-green-400 rounded"></div>
                        <div className="h-6 w-6 bg-purple-400 rounded"></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Our Values Section */}
        <section className="py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <div className="text-center mb-16">
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-6">
                What Drives Us
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Our core values guide everything we do, from product development to community building.
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {values.map((value, index) => (
                <div 
                  key={index}
                  data-animate
                  id={`value-${index}`}
                  className={`text-center p-8 bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-500 transform hover:-translate-y-2 ${
                    isVisible[`value-${index}`] ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
                  }`}
                  style={{ transitionDelay: `${index * 150}ms` }}
                >
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-500 to-green-500 rounded-2xl mb-6">
                    <value.icon className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-4">{value.title}</h3>
                  <p className="text-gray-600 leading-relaxed">{value.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Team Section */}
        <section className="py-20 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <div className="text-center mb-16">
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-6">
                Meet Our Team
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                A diverse group of researchers, engineers, and designers united by our passion for democratizing knowledge.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {teamMembers.map((member, index) => (
                <div 
                  key={index}
                  data-animate
                  id={`team-${index}`}
                  className={`bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-500 overflow-hidden transform hover:-translate-y-2 ${
                    isVisible[`team-${index}`] ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
                  }`}
                  style={{ transitionDelay: `${index * 200}ms` }}
                >
                  <div className={`h-32 bg-gradient-to-r ${member.color} flex items-center justify-center`}>
                    <member.icon className="h-16 w-16 text-white" />
                  </div>
                  <div className="p-8">
                    <h3 className="text-xl font-bold text-gray-900 mb-2">{member.name}</h3>
                    <p className="text-blue-600 font-medium mb-4">{member.role}</p>
                    <p className="text-gray-600 leading-relaxed">{member.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Impact Section */}
        <section className="py-20 bg-gradient-to-r from-blue-600 to-green-600">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 text-center">
            <div 
              data-animate
              id="impact"
              className={`transform transition-all duration-1000 ${
                isVisible.impact ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
              }`}
            >
              <h2 className="text-3xl sm:text-4xl font-bold text-white mb-8">
                The Impact We're Creating
              </h2>
              
              <div className="grid md:grid-cols-3 gap-8 mb-12">
                <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8">
                  <div className="text-4xl font-bold text-white mb-2">10x</div>
                  <div className="text-blue-100">Faster Research Discovery</div>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8">
                  <div className="text-4xl font-bold text-white mb-2">90%</div>
                  <div className="text-blue-100">Reduction in Reading Time</div>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8">
                  <div className="text-4xl font-bold text-white mb-2">∞</div>
                  <div className="text-blue-100">Learning Potential Unlocked</div>
                </div>
              </div>

              <blockquote className="text-xl sm:text-2xl text-white/90 italic max-w-4xl mx-auto mb-8">
                "By breaking down the barriers between complex research and everyday understanding, 
                we're not just sharing knowledge—we're accelerating human progress."
              </blockquote>
              
              <Link 
                to="/"
                className="inline-flex items-center px-8 py-4 bg-white text-blue-600 font-semibold rounded-xl hover:bg-blue-50 transition-all duration-300 transform hover:scale-105 shadow-lg"
                onClick={() => {
                  // Scroll to top when navigating to home page
                  setTimeout(() => window.scrollTo({ top: 0, behavior: 'smooth' }), 100);
                }}
              >
                Start Exploring Research
                <ArrowRight className="h-5 w-5 ml-2" />
              </Link>
            </div>
          </div>
        </section>

        {/* Contact Section */}
        <section className="py-20">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
            <div 
              data-animate
              id="contact"
              className={`transform transition-all duration-1000 ${
                isVisible.contact ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
              }`}
            >
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-6">
                Let's Build the Future Together
              </h2>
              <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
                Have questions, ideas, or want to collaborate? We'd love to hear from you.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <a 
                  href="mailto:pearadoxapp@gmail.com"
                  className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-blue-600 to-green-600 text-white font-semibold rounded-xl hover:shadow-lg transition-all duration-300 transform hover:scale-105"
                >
                  Get in Touch
                  <ArrowRight className="h-5 w-5 ml-2" />
                </a>
                <Link 
                  to="/"
                  className="inline-flex items-center px-8 py-4 border-2 border-gray-300 text-gray-700 font-semibold rounded-xl hover:border-blue-500 hover:text-blue-600 transition-all duration-300"
                  onClick={() => {
                    // Scroll to top when navigating to home page
                    setTimeout(() => window.scrollTo({ top: 0, behavior: 'smooth' }), 100);
                  }}
                >
                  Explore Research
                  <BookOpen className="h-5 w-5 ml-2" />
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />

      {/* Modals */}
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

export default AboutUs;
