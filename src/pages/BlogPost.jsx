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

  // Blog posts data - in a real app, this would come from an API
  const blogPosts = {
    "building-an-app-with-AI": {
      id: 2,
      title: "Building an AI-Powered App for Just $20: A Complete Guide",
      slug: "building-an-app-with-AI",
      excerpt: "Think you need thousands of dollars and a team of developers to build an AI-powered app? Think again. With modern tools like Cursor, Vercel, GitHub, and Resend, you can create and deploy a sophisticated AI application for less than the cost of a dinner out.",
      author: "The Pearadox Team",
      date: "2025-08-24",
      readTime: "12 min read",
      tags: ["AI Development", "Cursor", "Vercel", "Indie Development", "Tutorial", "Low-Cost"],
      featured: true
    },
    "democratizing-ai-research": {
      id: 1,
      title: "Democratizing AI Research: Why Everyone Deserves to Understand the Future",
      slug: "democratizing-ai-research",
      excerpt: "AI research is reshaping our world at unprecedented speed. But what happens when this transformative knowledge remains locked behind academic walls? We believe everyone deserves access to the insights that are defining our collective future.",
      author: "The Pearadox Team",
      date: "2025-08-19",
      readTime: "8 min read",
      tags: ["AI Research", "Democratization", "Innovation", "Education", "Accessibility"],
      featured: true
    }
  };

  const blogPost = blogPosts[slug];

  // Track blog post view
  useEffect(() => {
    const trackBlogPostView = async () => {
      if (blogPost) {
        try {
          await viewedArticlesAPI.recordBlogPostView(user?.id, blogPost, 'blog_post');
        } catch (error) {
          console.error('Error recording blog post view:', error);
        }
      }
    };

    trackBlogPostView();
  }, [slug, user?.id, blogPost]);


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



  // Return 404 if post not found
  if (!blogPost) {
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

            {/* Dynamic Article Content */}
            {slug === 'democratizing-ai-research' && (
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
            )}

            {slug === 'building-an-app-with-AI' && (
              <div className="prose prose-lg max-w-none">
                
                <p className="text-xl text-gray-700 leading-relaxed mb-8">
                  What if I told you that the only thing standing between you and building your dream app isn't technical knowledge, team size, or budget—it's just getting started? The era of "you need to be a programmer" is over. Today, anyone with curiosity and creativity can build, deploy, and share sophisticated AI-powered applications with the world.
                </p>

                <p className="text-gray-700 leading-relaxed mb-8">
                  No computer science degree. No development team. No massive budget. Just you, your ideas, and $30 to turn them into reality. Let me show you exactly how to unlock your creative potential and join the ranks of solo app creators changing the world.
                </p>

                <h2 className="text-3xl font-bold text-gray-900 mt-12 mb-6">Your Creative Freedom Toolkit</h2>
                
                <p className="text-gray-700 leading-relaxed mb-8">
                  These aren't just cheaper alternatives—they're actually better than what big companies use. The barriers that once required entire development teams have been eliminated. Now it's just you and your imagination.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
                  <div className="bg-gradient-to-r from-purple-50 to-blue-50 p-6 rounded-xl">
                    <h3 className="text-lg font-bold text-purple-900 mb-3 flex items-center">
                      <BarChart className="h-6 w-6 mr-3 text-purple-600" />
                      Cursor ($20/month)
                    </h3>
                    <p className="text-purple-800 text-sm leading-relaxed">
                      Talk to it like a friend: "I want an app that helps me track my workouts." Cursor writes the code. You focus on your vision.
                    </p>
                  </div>

                  <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-6 rounded-xl">
                    <h3 className="text-lg font-bold text-green-900 mb-3 flex items-center">
                      <Globe className="h-6 w-6 mr-3 text-green-600" />
                      Vercel (Free)
                    </h3>
                    <p className="text-green-800 text-sm leading-relaxed">
                    Launch your project in seconds with built-in security, instant previews, and a free plan that goes a long way.
                    </p>
                  </div>

                  <div className="bg-gradient-to-r from-blue-50 to-cyan-50 p-6 rounded-xl">
                    <h3 className="text-lg font-bold text-blue-900 mb-3 flex items-center">
                      <BookOpen className="h-6 w-6 mr-3 text-blue-600" />
                      GitHub (Free)
                    </h3>
                    <p className="text-blue-800 text-sm leading-relaxed">
                      Your code's safe home. Save your work, track changes, and connect everything together. It's like Google Drive for your apps.
                    </p>
                  </div>

                  <div className="bg-gradient-to-r from-orange-50 to-red-50 p-6 rounded-xl">
                    <h3 className="text-lg font-bold text-orange-900 mb-3 flex items-center">
                      <Zap className="h-6 w-6 mr-3 text-orange-600" />
                      Resend ($0-20/month)
                    </h3>
                    <p className="text-orange-800 text-sm leading-relaxed">
                      Send emails from your app like a pro. Welcome messages, notifications, updates—all handled automatically.
                    </p>
                  </div>
                </div>

                <div className="bg-yellow-50 border-l-4 border-yellow-400 p-6 mb-8">
                  <div className="flex items-start">
                    <Target className="h-6 w-6 text-yellow-600 mr-3 mt-1 flex-shrink-0" />
                    <div>
                      <h3 className="font-semibold text-yellow-800 mb-2">The $30 Breakdown</h3>
                      <ul className="text-yellow-700 space-y-1 text-sm">
                        <li>• Cursor subscription: $20/month</li>
                        <li>• Vercel hosting: $0 (free tier)</li>
                        <li>• GitHub repository: $0 (free)</li>
                        <li>• Resend email: $0 (100 emails/month free)</li>
                        <li>• Custom domain: $0 (depending on your domain provider)</li>
                      </ul>
                    </div>
                  </div>
                </div>

                <h2 className="text-3xl font-bold text-gray-900 mt-12 mb-6">Your Step-by-Step Setup Guide</h2>
                
                <p className="text-gray-700 leading-relaxed mb-8">
                  Ready to become an app creator? Here's exactly how to set up your creative freedom toolkit. Follow these steps, and in 30 minutes you'll be building your first app.
                </p>

                <div className="bg-gradient-to-r from-green-50 to-blue-50 p-8 rounded-xl mb-12">
                  <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
                    <CheckCircle className="h-6 w-6 mr-3 text-green-600" />
                    Step 1: Create Your GitHub Account (5 minutes)
                  </h3>
                  <div className="space-y-4 text-gray-700">
                    <p><strong>What it does:</strong> GitHub is like Google Drive for your app code. It saves everything, tracks changes, and connects to your other tools.</p>
                    <div className="bg-white p-4 rounded-lg">
                      <p className="font-medium mb-2">Action steps:</p>
                      <ol className="list-decimal list-inside space-y-1 text-sm">
                        <li>Go to <span className="font-mono bg-gray-100 px-2 py-1 rounded">github.com</span></li>
                        <li>Click "Sign up" and create your account</li>
                        <li>Choose the free plan (it's perfect for getting started)</li>
                        <li>Verify your email address</li>
                      </ol>
                    </div>
                    <p className="text-sm italic">🎉 Congratulations! You now have unlimited storage for all your app projects.</p>
                  </div>
                </div>

                <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-8 rounded-xl mb-12">
                  <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
                    <CheckCircle className="h-6 w-6 mr-3 text-purple-600" />
                    Step 2: Download Cursor (10 minutes)
                  </h3>
                  <div className="space-y-4 text-gray-700">
                    <p><strong>What it does:</strong> Cursor is your AI coding partner. You describe what you want, it writes the code. It's like having a senior developer who never gets tired.</p>
                    <div className="bg-white p-4 rounded-lg">
                      <p className="font-medium mb-2">Action steps:</p>
                      <ol className="list-decimal list-inside space-y-1 text-sm">
                        <li>Visit <span className="font-mono bg-gray-100 px-2 py-1 rounded">cursor.sh</span></li>
                        <li>Download for your operating system (Mac/Windows/Linux)</li>
                        <li>Install and open Cursor</li>
                        <li>Sign in with your GitHub account (this connects everything)</li>
                        <li>Start your free trial or subscribe ($20/month)</li>
                      </ol>
                    </div>
                    <p className="text-sm italic">✨ You now have an AI assistant that can build entire applications for you.</p>
                  </div>
                </div>

                <div className="bg-gradient-to-r from-blue-50 to-cyan-50 p-8 rounded-xl mb-12">
                  <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
                    <CheckCircle className="h-6 w-6 mr-3 text-blue-600" />
                    Step 3: Set Up Vercel (5 minutes)
                  </h3>
                  <div className="space-y-4 text-gray-700">
                    <p><strong>What it does:</strong> Vercel takes your code from GitHub and instantly makes it a live website that anyone can visit. Zero server management.</p>
                    <div className="bg-white p-4 rounded-lg">
                      <p className="font-medium mb-2">Action steps:</p>
                      <ol className="list-decimal list-inside space-y-1 text-sm">
                        <li>Go to <span className="font-mono bg-gray-100 px-2 py-1 rounded">vercel.com</span></li>
                        <li>Click "Sign up" and choose "Continue with GitHub"</li>
                        <li>Authorize Vercel to access your GitHub account</li>
                        <li>Complete your profile setup</li>
                      </ol>
                    </div>
                    <p className="text-sm italic">🚀 Your apps will now deploy automatically every time you save changes!</p>
                  </div>
                </div>

                <div className="bg-gradient-to-r from-orange-50 to-red-50 p-8 rounded-xl mb-12">
                  <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
                    <CheckCircle className="h-6 w-6 mr-3 text-orange-600" />
                    Step 4: Create Your First App (10 minutes)
                  </h3>
                  <div className="space-y-4 text-gray-700">
                    <p><strong>The magic moment:</strong> Watch your idea become reality in real-time.</p>
                    <div className="bg-white p-4 rounded-lg">
                      <p className="font-medium mb-2">Action steps:</p>
                      <ol className="list-decimal list-inside space-y-2 text-sm">
                        <li><strong>In Cursor:</strong> Press <span className="font-mono bg-gray-100 px-2 py-1 rounded">Ctrl+Shift+P</span> (or Cmd on Mac)</li>
                        <li>Type "Clone Repository" and paste: <span className="font-mono bg-gray-100 px-2 py-1 rounded text-xs">https://github.com/vercel/next.js/tree/canary/examples/hello-world</span></li>
                        <li><strong>Start building:</strong> In the chat, type: <em>"Turn this into a simple todo app with a clean design"</em></li>
                        <li><strong>Save to GitHub:</strong> Press <span className="font-mono bg-gray-100 px-2 py-1 rounded">Ctrl+Shift+G</span>, commit your changes</li>
                        <li><strong>Deploy:</strong> Go to Vercel, import your repository, click deploy</li>
                      </ol>
                    </div>
                    <p className="text-sm italic">🎯 In minutes, you'll have a live app with a real URL you can share with anyone!</p>
                  </div>
                </div>

                <div className="bg-gradient-to-r from-yellow-50 to-orange-50 p-8 rounded-xl mb-12">
                  <h3 className="text-xl font-bold text-gray-900 mb-6">How Everything Connects</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                    <div className="bg-white p-4 rounded-lg">
                      <div className="text-2xl mb-2">💭</div>
                      <p className="font-medium">You have an idea</p>
                      <p className="text-sm text-gray-600">Tell Cursor what you want</p>
                    </div>
                    <div className="bg-white p-4 rounded-lg">
                      <div className="text-2xl mb-2">⚡</div>
                      <p className="font-medium">Cursor writes code</p>
                      <p className="text-sm text-gray-600">Saves automatically to GitHub</p>
                    </div>
                    <div className="bg-white p-4 rounded-lg">
                      <div className="text-2xl mb-2">🌍</div>
                      <p className="font-medium">Vercel makes it live</p>
                      <p className="text-sm text-gray-600">Your app is now on the internet!</p>
                    </div>
                  </div>
                </div>

                <h2 className="text-3xl font-bold text-gray-900 mt-12 mb-6">Your Creative Potential Unleashed</h2>
                
                <p className="text-gray-700 leading-relaxed mb-8">
                  Now that you have the setup, let's talk about what you can actually build. The answer? Literally anything you can imagine.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
                  <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-6 rounded-xl">
                    <h3 className="text-lg font-bold text-purple-900 mb-4 flex items-center">
                      <Heart className="h-5 w-5 mr-2 text-purple-600" />
                      Personal Tools
                    </h3>
                    <ul className="text-purple-800 space-y-2 text-sm">
                      <li>• Habit tracker that actually motivates you</li>
                      <li>• Recipe organizer for your family favorites</li>
                      <li>• Reading list with progress tracking</li>
                      <li>• Workout planner that adapts to your schedule</li>
                      <li>• Budget tracker that makes sense to you</li>
                    </ul>
                  </div>

                  <div className="bg-gradient-to-r from-blue-50 to-cyan-50 p-6 rounded-xl">
                    <h3 className="text-lg font-bold text-blue-900 mb-4 flex items-center">
                      <Users className="h-5 w-5 mr-2 text-blue-600" />
                      Community Solutions
                    </h3>
                    <ul className="text-blue-800 space-y-2 text-sm">
                      <li>• Local event finder for your neighborhood</li>
                      <li>• Study group organizer for students</li>
                      <li>• Pet care scheduler for busy owners</li>
                      <li>• Carpooling coordinator for parents</li>
                      <li>• Book club manager for avid readers</li>
                    </ul>
                  </div>

                  <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-6 rounded-xl">
                    <h3 className="text-lg font-bold text-green-900 mb-4 flex items-center">
                      <Lightbulb className="h-5 w-5 mr-2 text-green-600" />
                      Creative Projects
                    </h3>
                    <ul className="text-green-800 space-y-2 text-sm">
                      <li>• Story prompt generator for writers</li>
                      <li>• Color palette creator for artists</li>
                      <li>• Music practice tracker for musicians</li>
                      <li>• Photography challenge app</li>
                      <li>• Cooking experiment journal</li>
                    </ul>
                  </div>

                  <div className="bg-gradient-to-r from-orange-50 to-red-50 p-6 rounded-xl">
                    <h3 className="text-lg font-bold text-orange-900 mb-4 flex items-center">
                      <Target className="h-5 w-5 mr-2 text-orange-600" />
                      Business Ideas
                    </h3>
                    <ul className="text-orange-800 space-y-2 text-sm">
                      <li>• Customer feedback collector</li>
                      <li>• Appointment scheduler for services</li>
                      <li>• Inventory tracker for small shops</li>
                      <li>• Social media content planner</li>
                      <li>• Client project status dashboard</li>
                    </ul>
                  </div>
                </div>

                <div className="bg-gradient-to-r from-yellow-50 to-orange-50 p-8 rounded-xl mb-12">
                  <h3 className="text-xl font-bold text-gray-900 mb-4">The Beautiful Truth About AI Development</h3>
                  <p className="text-gray-700 leading-relaxed mb-4">
                    You don't need to understand databases, servers, APIs, or any technical jargon. Just talk to Cursor like you're explaining your idea to a friend:
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-white p-4 rounded-lg">
                      <p className="font-medium text-green-800 mb-2">💭 What you say:</p>
                      <p className="text-sm italic">"I want an app where I can log my daily mood and see patterns over time"</p>
                    </div>
                    <div className="bg-white p-4 rounded-lg">
                      <p className="font-medium text-blue-800 mb-2">⚡ What Cursor creates:</p>
                      <p className="text-sm">A beautiful mood tracking app with charts, data storage, and insights—complete with a professional design</p>
                    </div>
                  </div>
                </div>

                <h2 className="text-3xl font-bold text-gray-900 mt-12 mb-6">Real Success Stories</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                  <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
                    <h4 className="font-bold text-gray-900 mb-2">StudentAI</h4>
                    <p className="text-sm text-gray-600 mb-3">Solo developer, no CS background</p>
                    <ul className="text-sm text-gray-700 space-y-1">
                      <li>• 3 weeks to launch</li>
                      <li>• $5,000/month revenue</li>
                      <li>• 10,000+ students</li>
                    </ul>
                  </div>

                  <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
                    <h4 className="font-bold text-gray-900 mb-2">LocalBiz Assistant</h4>
                    <p className="text-sm text-gray-600 mb-3">Small business owner turned developer</p>
                    <ul className="text-sm text-gray-700 space-y-1">
                      <li>• 6 weeks to launch</li>
                      <li>• $15,000/month revenue</li>
                      <li>• 500+ businesses</li>
                    </ul>
                  </div>

                  <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
                    <h4 className="font-bold text-gray-900 mb-2">Research Hub</h4>
                    <p className="text-sm text-gray-600 mb-3">PhD student (like Pearadox!)</p>
                    <ul className="text-sm text-gray-700 space-y-1">
                      <li>• 4 weeks to launch</li>
                      <li>• 50,000+ users</li>
                      <li>• Growing rapidly</li>
                    </ul>
                  </div>
                </div>

                <h2 className="text-3xl font-bold text-gray-900 mt-12 mb-6">Why This Changes Everything</h2>
                
                <p className="text-gray-700 leading-relaxed mb-8">
                  We're witnessing the most significant shift in creative power since the printing press. For the first time in history, the tools to build software are as accessible as a word processor. This isn't just about making apps—it's about unleashing human creativity on a global scale.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
                  <div className="bg-gradient-to-r from-red-50 to-pink-50 p-6 rounded-xl">
                    <h3 className="text-lg font-bold text-red-900 mb-4">The Old Way (Before AI)</h3>
                    <ul className="text-red-800 space-y-2 text-sm">
                      <li>❌ Need a computer science degree</li>
                      <li>❌ Hire expensive development teams</li>
                      <li>❌ Learn complex programming languages</li>
                      <li>❌ Manage servers and infrastructure</li>
                      <li>❌ Months or years to see results</li>
                      <li>❌ High risk of failure and wasted money</li>
                    </ul>
                  </div>

                  <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-6 rounded-xl">
                    <h3 className="text-lg font-bold text-green-900 mb-4">The New Way (With AI)</h3>
                    <ul className="text-green-800 space-y-2 text-sm">
                      <li>✅ Just describe what you want</li>
                      <li>✅ Build everything yourself</li>
                      <li>✅ Talk in plain English, not code</li>
                      <li>✅ Everything handled automatically</li>
                      <li>✅ See your app live in minutes</li>
                      <li>✅ Low cost, high creativity, boundless potential</li>
                    </ul>
                  </div>
                </div>

                <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-8 rounded-xl mb-12">
                  <h3 className="text-xl font-bold text-blue-900 mb-6">What This Means for You</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="text-center">
                      <div className="text-3xl mb-3">🎨</div>
                      <h4 className="font-bold text-blue-900 mb-2">Unlimited Creativity</h4>
                      <p className="text-blue-800 text-sm">Every idea, no matter how wild, can become reality. No creative constraint except your imagination.</p>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl mb-3">⚡</div>
                      <h4 className="font-bold text-blue-900 mb-2">Lightning Speed</h4>
                      <p className="text-blue-800 text-sm">Go from idea to working app in hours, not months. Test, iterate, and improve at the speed of thought.</p>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl mb-3">🌍</div>
                      <h4 className="font-bold text-blue-900 mb-2">Global Impact</h4>
                      <p className="text-blue-800 text-sm">Your local solution can instantly reach millions. Every problem you solve can help others worldwide.</p>
                    </div>
                  </div>
                </div>

                <h2 className="text-3xl font-bold text-gray-900 mt-12 mb-6">The World is Waiting for Your Ideas</h2>
                
                <p className="text-gray-700 leading-relaxed mb-8">
                  Right now, someone, somewhere, has a problem that only you can solve. Maybe it's your neighbor struggling with something you take for granted. Maybe it's a global challenge that needs a fresh perspective. Maybe it's just something that would make your own life a little bit better.
                </p>

                <p className="text-gray-700 leading-relaxed mb-8">
                  The difference between you and the next big app creator isn't talent, education, or connections. It's simply taking the first step.
                </p>

                <div className="bg-gradient-to-r from-green-600 to-blue-600 text-white p-8 rounded-xl mb-12">
                  <h3 className="text-2xl font-bold mb-4">Your Creative Journey Starts Today</h3>
                  <p className="mb-6 text-lg">
                    For less than the cost of a dinner out, you can unlock the same creative power that built Instagram, Airbnb, and every app on your phone. The only limits are the ones you set for yourself.
                  </p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                    <div className="bg-white bg-opacity-20 p-4 rounded-lg">
                      <h4 className="font-bold mb-2">🚀 Week 1</h4>
                      <p className="text-sm">Set up your toolkit and build your first working app</p>
                    </div>
                    <div className="bg-white bg-opacity-20 p-4 rounded-lg">
                      <h4 className="font-bold mb-2">📱 Week 2</h4>
                      <p className="text-sm">Add features, improve design, share with friends</p>
                    </div>
                    <div className="bg-white bg-opacity-20 p-4 rounded-lg">
                      <h4 className="font-bold mb-2">🌟 Week 3</h4>
                      <p className="text-sm">Launch publicly, gather feedback, start building your next idea</p>
                    </div>
                  </div>

                  <p className="text-center text-lg font-medium">
                    Three weeks from now, you'll have gone from "I wish there was an app for that" to "I built an app for that."
                  </p>
                </div>

                <div className="bg-gradient-to-r from-yellow-50 to-orange-50 p-8 rounded-xl mb-12">
                  <h3 className="text-xl font-bold text-gray-900 mb-4">A Personal Promise</h3>
                  <p className="text-gray-700 leading-relaxed mb-4">
                    If you follow this guide and still can't build a working app within 30 days, the problem isn't your ability—it's that we haven't explained it clearly enough. The tools are that powerful, and you are that capable.
                  </p>
                  <p className="text-gray-700 leading-relaxed">
                    Every expert was once a beginner. Every successful app started as someone's "crazy idea." The person who's going to solve tomorrow's biggest problems might be you—but only if you start today.
                  </p>
                </div>

                <div className="text-center border-t border-gray-200 pt-8">
                  <p className="text-gray-600 italic mb-6">
                    <strong>Ready to build your own app?</strong> The best ideas start with understanding the latest AI breakthroughs. Dive into Pearadox articles to see where today’s research can spark tomorrow’s super apps.
                  </p>
                  <Link 
                    to="/"
                    className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                    onClick={() => {
                      setTimeout(() => window.scrollTo({ top: 0, behavior: 'smooth' }), 100);
                    }}
                  >
                    Explore Today's Breakthroughs
                    <ArrowRight className="h-5 w-5 ml-2" />
                  </Link>
                </div>
              </div>
            )}
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
