import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Calendar, Clock, User, ArrowLeft, BookOpen, Brain, Globe, Users, Zap, Heart, Target, Lightbulb, ArrowRight, TrendingUp, BarChart, CheckCircle } from 'lucide-react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import SavedArticles from '../components/SavedArticles';
import AccountModal from '../components/AccountModal';
import ArticleModal from '../components/ArticleModal';
import { useUser } from '../contexts/UserContext';
import { viewedArticlesAPI } from '../lib/supabase';

const BlogPost = () => {
  const { slug } = useParams();
  const [isVisible, setIsVisible] = useState({});
  
  // Modal states
  const [isSavedArticlesOpen, setIsSavedArticlesOpen] = useState(false);
  const [isAccountOpen, setIsAccountOpen] = useState(false);
  const [selectedArticle, setSelectedArticle] = useState(null);
  const [isArticleModalOpen, setIsArticleModalOpen] = useState(false);
  
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
      content: true
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
    
    // Record article view
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

  // Blog post data - in a real app, this would come from an API
  const blogPost = {
    id: 1,
    title: "Democratizing AI Research: Why Everyone Deserves to Understand the Future",
    slug: "democratizing-ai-research",
    excerpt: "AI research is reshaping our world at unprecedented speed. But what happens when this transformative knowledge remains locked behind academic walls? We believe everyone deserves access to the insights that are defining our collective future.",
    author: "The Pearadox Team",
    date: "2025-08-19",
    readTime: "8 min read",
    tags: ["AI Research", "Democratization", "Innovation", "Education", "Accessibility"],
    featured: true
  };

  // Return 404 if post not found
  if (slug !== 'democratizing-ai-research') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Post Not Found</h1>
          <p className="text-gray-600 mb-8">The blog post you're looking for doesn't exist.</p>
          <Link 
            to="/blog"
            className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors"
          >
            <ArrowLeft className="h-5 w-5 mr-2" />
            Back to Blog
          </Link>
        </div>
      </div>
    );
  }

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
        isBlogPage={true}
      />
      
      {/* Content Spacer for Fixed Header */}
      <div className="h-24 sm:h-20"></div>

      <main className="relative z-10">
        {/* Back to Blog */}
        <div className="max-w-4xl mx-auto px-4 sm:px-6 pt-8">
          <Link 
            to="/blog"
            className="inline-flex items-center text-blue-600 hover:text-blue-700 transition-colors mb-8"
            onClick={() => {
              setTimeout(() => window.scrollTo({ top: 0, behavior: 'smooth' }), 100);
            }}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Blog
          </Link>
        </div>

        {/* Article Content */}
        <article className="max-w-4xl mx-auto px-4 sm:px-6 pb-16">
          <div 
            className={`transform transition-all duration-1000 ${
              isVisible.content ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
            }`}
          >
            {/* Article Header */}
            <header className="mb-12">
              {blogPost.featured && (
                <div className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-blue-600 to-green-600 text-white text-sm font-medium rounded-full mb-6">
                  <Zap className="h-4 w-4 mr-2" />
                  Featured Post
                </div>
              )}
              
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-6 leading-tight">
                {blogPost.title}
              </h1>
              
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8 space-y-4 sm:space-y-0">
                <div className="flex items-center text-gray-600">
                  <Calendar className="h-4 w-4 mr-2" />
                  <span>{new Date(blogPost.date).toLocaleDateString('en-US', { 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}</span>
                  <span className="mx-3">•</span>
                  <Clock className="h-4 w-4 mr-2" />
                  <span>{blogPost.readTime}</span>
                </div>
                <div className="flex items-center text-gray-600">
                  <User className="h-4 w-4 mr-2" />
                  <span>{blogPost.author}</span>
                </div>
              </div>
              
              {/* Tags */}
              <div className="flex flex-wrap gap-2 mb-8">
                {blogPost.tags.map((tag, index) => (
                  <span 
                    key={index}
                    className="px-3 py-1 bg-blue-50 text-blue-700 text-sm rounded-full font-medium"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </header>

            {/* Hero Image/Diagram */}
            <div className="mb-12">
              <div className="bg-gradient-to-br from-blue-100 via-indigo-50 to-purple-100 rounded-2xl p-8 sm:p-12">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-center">
                  <div className="text-center">
                    <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Target className="h-8 w-8 text-red-600" />
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-2">Academic Silos</h3>
                    <p className="text-sm text-gray-600">Research locked behind complex language and institutional barriers</p>
                  </div>
                  
                  <div className="text-center">
                    <ArrowRight className="h-8 w-8 text-blue-600 mx-auto mb-4" />
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Heart className="h-6 w-6 text-blue-600" />
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-2">Pearadox Bridge</h3>
                    <p className="text-sm text-gray-600">Translating complexity into accessible insights</p>
                  </div>
                  
                  <div className="text-center">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Globe className="h-8 w-8 text-green-600" />
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-2">Universal Access</h3>
                    <p className="text-sm text-gray-600">Knowledge accessible to everyone, everywhere</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Article Content */}
            <div className="prose prose-lg max-w-none">
              
              <p className="text-xl text-gray-700 leading-relaxed mb-8">
                Imagine a world where groundbreaking discoveries in artificial intelligence remain hidden in academic papers, accessible only to those with advanced degrees and institutional access. Now imagine the opposite: a world where every teacher, entrepreneur, student, and curious mind can understand and apply the latest AI breakthroughs to solve real problems in their communities.
              </p>

              <p className="text-gray-700 leading-relaxed mb-8">
                This is the vision driving Pearadox — and it's more than just an ideal. It's an urgent necessity for our collective future.
              </p>

              <h2 className="text-3xl font-bold text-gray-900 mt-12 mb-6">The Knowledge Acceleration Crisis</h2>
              
              <div className="bg-yellow-50 border-l-4 border-yellow-400 p-6 mb-8">
                <div className="flex items-start">
                  <TrendingUp className="h-6 w-6 text-yellow-600 mr-3 mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold text-yellow-800 mb-2">Rapid Discovery Rate</h3>
                    <p className="text-yellow-700">Every day, researchers publish dozens of papers on machine learning, computer vision, natural language processing, and robotics. The pace of discovery is accelerating exponentially.</p>
                  </div>
                </div>
              </div>

              <p className="text-gray-700 leading-relaxed mb-8">
                We're living through the most rapid period of scientific advancement in human history. These discoveries have the potential to revolutionize healthcare, education, climate science, and countless other fields that touch every aspect of human life.
              </p>

              <p className="text-gray-700 leading-relaxed mb-8">
                But here's the problem: <strong className="text-gray-900">most of this knowledge never makes it beyond the ivory tower.</strong>
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
                <div className="bg-red-50 p-6 rounded-xl">
                  <h4 className="font-semibold text-red-800 mb-3 flex items-center">
                    <Target className="h-5 w-5 mr-2" />
                    The Problem
                  </h4>
                  <ul className="text-red-700 space-y-2 text-sm">
                    <li>• Technical language barriers</li>
                    <li>• Mathematical complexity</li>
                    <li>• Institutional access requirements</li>
                    <li>• Disconnect from practical applications</li>
                  </ul>
                </div>
                
                <div className="bg-green-50 p-6 rounded-xl">
                  <h4 className="font-semibold text-green-800 mb-3 flex items-center">
                    <CheckCircle className="h-5 w-5 mr-2" />
                    The Solution
                  </h4>
                  <ul className="text-green-700 space-y-2 text-sm">
                    <li>• Clear, accessible translations</li>
                    <li>• Conceptual explanations</li>
                    <li>• Open access for everyone</li>
                    <li>• Real-world application focus</li>
                  </ul>
                </div>
              </div>

              <h2 className="text-3xl font-bold text-gray-900 mt-12 mb-6">Why Democratization Matters</h2>

              <p className="text-gray-700 leading-relaxed mb-8">
                When we make AI research accessible to everyone, three powerful things happen:
              </p>

              <div className="space-y-8 mb-12">
                <div className="flex items-start">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-4 mt-1 flex-shrink-0">
                    <span className="text-blue-600 font-bold">1</span>
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-3">Innovation Accelerates Exponentially</h3>
                    <p className="text-gray-700 leading-relaxed mb-4">
                      The best innovations often come from unexpected connections between different fields. When a marine biologist understands the latest advances in pattern recognition, they might discover new ways to track ocean ecosystem changes. When a music teacher grasps how transformer models work, they could develop revolutionary approaches to composition education.
                    </p>
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <p className="text-blue-800 text-sm italic">
                        "By breaking down the barriers to AI knowledge, we're not just sharing information — we're creating infinite possibilities for cross-pollination of ideas."
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mr-4 mt-1 flex-shrink-0">
                    <span className="text-green-600 font-bold">2</span>
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-3">Solutions Become More Human-Centered</h3>
                    <p className="text-gray-700 leading-relaxed mb-4">
                      Academic researchers excel at pushing the boundaries of what's technically possible. But the people who understand real human needs — social workers, community organizers, local business owners — often lack the technical background to envision how AI could address their challenges.
                    </p>
                    <p className="text-gray-700 leading-relaxed">
                      When we bridge this gap, AI development becomes more responsive to actual human needs rather than just technical benchmarks.
                    </p>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center mr-4 mt-1 flex-shrink-0">
                    <span className="text-purple-600 font-bold">3</span>
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-3">Progress Becomes More Equitable</h3>
                    <p className="text-gray-700 leading-relaxed mb-4">
                      Today's AI revolution risks widening existing inequalities. Companies and institutions with the resources to hire PhD researchers gain tremendous advantages, while others fall further behind.
                    </p>
                    <p className="text-gray-700 leading-relaxed">
                      But when AI knowledge is democratically accessible, every organization—regardless of size or budget—can participate in the transformation.
                    </p>
                  </div>
                </div>
              </div>

              {/* Impact Visualization */}
              <div className="bg-gradient-to-r from-purple-100 to-pink-100 rounded-2xl p-8 mb-12">
                <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">The Ripple Effect of Democratized Knowledge</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div className="text-center">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                      <Users className="h-6 w-6 text-blue-600" />
                    </div>
                    <h4 className="font-semibold text-gray-900 mb-2">Individual</h4>
                    <p className="text-sm text-gray-600">Better decisions, new opportunities</p>
                  </div>
                  <div className="text-center">
                    <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                      <Target className="h-6 w-6 text-green-600" />
                    </div>
                    <h4 className="font-semibold text-gray-900 mb-2">Community</h4>
                    <p className="text-sm text-gray-600">Local innovation, shared knowledge</p>
                  </div>
                  <div className="text-center">
                    <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-3">
                      <Lightbulb className="h-6 w-6 text-yellow-600" />
                    </div>
                    <h4 className="font-semibold text-gray-900 mb-2">Industry</h4>
                    <p className="text-sm text-gray-600">Faster adoption, better solutions</p>
                  </div>
                  <div className="text-center">
                    <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                      <Globe className="h-6 w-6 text-purple-600" />
                    </div>
                    <h4 className="font-semibold text-gray-900 mb-2">Society</h4>
                    <p className="text-sm text-gray-600">Accelerated progress, reduced inequality</p>
                  </div>
                </div>
              </div>

              <h2 className="text-3xl font-bold text-gray-900 mt-12 mb-6">Join the Revolution</h2>

              <p className="text-gray-700 leading-relaxed mb-8">
                The democratization of AI research isn't a spectator sport. It requires active participation from all of us—researchers willing to communicate beyond their peers, institutions willing to prioritize accessibility, and individuals willing to engage with complex ideas.
              </p>

              <div className="bg-gradient-to-r from-blue-50 to-green-50 rounded-xl p-8 mb-12">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">What You Can Do</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">As a Researcher</h4>
                    <ul className="text-gray-700 space-y-1 text-sm">
                      <li>• Write accessible summaries of your work</li>
                      <li>• Engage with non-academic communities</li>
                      <li>• Share practical applications</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">As a Learner</h4>
                    <ul className="text-gray-700 space-y-1 text-sm">
                      <li>• Stay curious about new developments</li>
                      <li>• Ask questions and seek understanding</li>
                      <li>• Share insights with your community</li>
                    </ul>
                  </div>
                </div>
              </div>

              <p className="text-xl text-gray-700 leading-relaxed mb-8 font-medium">
                At Pearadox, we're just getting started. Every paper we translate, every insight we share, every person we reach is a step toward a more inclusive, innovative, and equitable future.
              </p>

              <p className="text-gray-700 leading-relaxed mb-8">
                The knowledge exists. The tools are available. The only question is: are you ready to be part of the solution?
              </p>

              <div className="bg-gray-900 text-white rounded-2xl p-8 text-center">
                <h3 className="text-2xl font-bold mb-4">Ready to dive in?</h3>
                <p className="text-gray-300 mb-6">
                  Start by exploring our latest paper summaries, tailored to your experience level. Whether you're a complete beginner or a seasoned expert, there's always something new to discover when we make complex research accessible to everyone.
                </p>
                <Link 
                  to="/"
                  className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-blue-600 to-green-600 text-white font-semibold rounded-xl hover:shadow-lg transition-all duration-300 transform hover:scale-105"
                  onClick={() => {
                    setTimeout(() => window.scrollTo({ top: 0, behavior: 'smooth' }), 100);
                  }}
                >
                  Explore Research Papers
                  <ArrowRight className="h-5 w-5 ml-2" />
                </Link>
              </div>
            </div>
          </div>
        </article>
      </main>

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

export default BlogPost;
