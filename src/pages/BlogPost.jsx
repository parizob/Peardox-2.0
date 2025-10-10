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
    "what-makes-an-ai-agent": {
      id: 4,
      title: "What Makes an AI Agent? Understanding Agency, State, and the Path to True Agentic Systems",
      slug: "what-makes-an-ai-agent",
      excerpt: "The term 'AI Agent' is everywhere in tech today, but what does it actually mean? Beyond the buzzwords lies a fascinating question about agency, state management, and what it truly means for a system to be 'agentic'. Let's explore the spectrum from simple chatbots to autonomous agents.",
      author: "The Pearadox Team",
      date: "2025-09-25",
      readTime: "18 min read",
      tags: ["AI Agents", "Agentic Systems", "AI Architecture", "Machine Learning", "Autonomous AI", "AI Development"],
      featured: true
    },
    "ai-first-mindset-ferrari-engine": {
      id: 3,
      title: "You Wouldn't Put a Truck Engine in a Ferrari: Building with an AI-First Mindset",
      slug: "ai-first-mindset-ferrari-engine",
      excerpt: "Traditional software development approaches are like putting truck engines in racing cars—they work, but they're fundamentally mismatched. When AI is your engine, everything about how you build, design, and think about products must change.",
      author: "The Pearadox Team",
      date: "2025-09-10",
      readTime: "15 min read",
      tags: ["AI-First Design", "Product Development", "Architecture", "Strategy", "Innovation", "Technology"],
      featured: false
    },
    "building-an-app-with-AI": {
      id: 2,
      title: "Building an AI-Powered App for Just $20: A Complete Guide",
      slug: "building-an-app-with-AI",
      excerpt: "Think you need thousands of dollars and a team of developers to build an AI-powered app? Think again. With modern tools like Cursor, Vercel, GitHub, and Resend, you can create and deploy a sophisticated AI application for less than the cost of a dinner out.",
      author: "The Pearadox Team",
      date: "2025-08-24",
      readTime: "12 min read",
      tags: ["AI Development", "Cursor", "Vercel", "Indie Development", "Tutorial", "Low-Cost"],
      featured: false
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
      featured: false
    }
  };

  const blogPost = blogPosts[slug];

  // Track blog post view
  useEffect(() => {
    const trackBlogPostView = async () => {
      if (blogPost) {
        try {
          console.log('🔍 Tracking blog post view for:', {
            userId: user?.id || 'anonymous',
            blogTitle: blogPost.title,
            blogSlug: blogPost.slug
          });
          await viewedArticlesAPI.recordBlogPostView(user?.id, blogPost, 'blog_post');
          console.log('✅ Blog post view tracking completed');
        } catch (error) {
          console.error('❌ Error recording blog post view:', error);
        }
      }
    };

    // Track immediately when component mounts, regardless of user state
    trackBlogPostView();
  }, [slug, blogPost]); // Removed user?.id from dependencies to ensure tracking happens for unauthenticated users


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
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Post Not Found</h1>
          <p className="text-gray-600 mb-8">The blog post you're looking for doesn't exist.</p>
          <Link 
            to="/blog"
            className="inline-flex items-center px-6 py-3 text-white rounded-xl transition-colors"
            style={{ backgroundColor: '#1db954' }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#16a14a'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#1db954'}
          >
            <ArrowLeft className="h-5 w-5 mr-2" />
            Back to Blog
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
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
            className="inline-flex items-center transition-colors mb-8"
            style={{ color: '#1db954' }}
            onMouseEnter={(e) => e.currentTarget.style.color = '#16a14a'}
            onMouseLeave={(e) => e.currentTarget.style.color = '#1db954'}
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
                <div className="inline-flex items-center px-4 py-2 text-white text-sm font-medium rounded-full mb-6" style={{ backgroundColor: '#1db954' }}>
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
                    className="px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-full font-medium"
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
            {slug === 'what-makes-an-ai-agent' && (
              <div className="prose prose-lg max-w-none">
                
                <p className="text-xl text-gray-700 leading-relaxed mb-8">
                  Walk into any tech conference today, scroll through LinkedIn, or browse AI startup pitches, and you'll hear the term "AI Agent" thrown around with remarkable frequency. ChatGPT is an agent. A simple Python script that calls an API is an agent. Your automated email responder is apparently an agent. Even that basic if-then workflow you built last week? Also an agent, according to some marketing materials.
                </p>

                <p className="text-gray-700 leading-relaxed mb-8">
                  But here's the uncomfortable truth: <strong>most of what we call "AI Agents" today aren't actually agents at all.</strong>
                </p>

                <p className="text-gray-700 leading-relaxed mb-8">
                  This isn't just semantic nitpicking. The confusion around what constitutes an "agent" versus what makes a system "agentic" reflects a deeper misunderstanding about the fundamental nature of autonomous systems. When everything becomes an agent, nothing is—and we lose sight of what we're actually building toward.
                </p>

                <p className="text-gray-700 leading-relaxed mb-8">
                  Let's cut through the noise and explore what agency really means, why state matters more than you think, and how we can build truly agentic systems that live up to the transformative potential of artificial intelligence.
                </p>

                <h2 className="text-2xl font-bold text-gray-900 mt-12 mb-6">The Agent Identity Crisis</h2>

                <p className="text-gray-700 leading-relaxed mb-8">
                  The word "agent" comes from the Latin "agere," meaning "to act." In its purest form, an agent is something that acts independently on behalf of another entity. This definition seems simple enough, but when we apply it to AI systems, things get complicated fast.
                </p>

                <p className="text-gray-700 leading-relaxed mb-6">
                  Consider these systems, all commonly called "AI Agents":
                </p>

                <div className="bg-gray-50 rounded-lg p-6 mb-8">
                  <ul className="space-y-4">
                    <li><strong>The Chatbot</strong>: Responds to user inputs with generated text, maintains no memory between conversations.</li>
                    <li><strong>The Function-Calling LLM</strong>: Can invoke external APIs and tools based on user requests, but resets after each interaction.</li>
                    <li><strong>The Workflow Automator</strong>: Follows predefined rules to process data and trigger actions, with basic conditional logic.</li>
                    <li><strong>The Autonomous Researcher</strong>: Maintains long-term goals, remembers past discoveries, adapts strategies based on outcomes, and operates independently for extended periods.</li>
                  </ul>
                </div>

                <p className="text-gray-700 leading-relaxed mb-8">
                  Which of these is truly an "agent"? The answer depends entirely on how we define agency—and this is where the confusion begins.
                </p>

                <h2 className="text-2xl font-bold text-gray-900 mt-12 mb-6">Agency: The Spectrum of Independence</h2>

                <p className="text-gray-700 leading-relaxed mb-8">
                  Agency isn't binary. It's not a simple yes-or-no question of whether something is an agent. Instead, agency exists on a spectrum, with systems exhibiting varying degrees of autonomous behavior.
                </p>

                <p className="text-gray-700 leading-relaxed mb-8">
                  At one end, we have <strong>reactive systems</strong>—they respond to inputs with outputs, following predetermined patterns or learned behaviors. Think of a customer service chatbot that can answer questions about your account balance. It's useful, it processes language intelligently, and it performs actions. But it's fundamentally reactive, operating only in response to external stimuli.
                </p>

                <p className="text-gray-700 leading-relaxed mb-8">
                  Moving along the spectrum, we encounter <strong>goal-directed systems</strong>—these maintain objectives and can plan sequences of actions to achieve them. A system that can break down "research this topic" into subtasks like "search for relevant papers," "summarize key findings," and "identify knowledge gaps" demonstrates higher agency than a simple question-answering system.
                </p>

                <p className="text-gray-700 leading-relaxed mb-8">
                  At the far end lies <strong>autonomous agency</strong>—systems that can form their own goals, adapt their strategies based on outcomes, and operate independently over extended periods. These systems don't just execute predefined objectives; they can recognize when objectives should change and modify their behavior accordingly.
                </p>

                <p className="text-gray-700 leading-relaxed mb-8">
                  But agency alone isn't enough to make a system truly "agentic." There's another critical dimension that's often overlooked: <strong>state</strong>.
                </p>

                <h2 className="text-2xl font-bold text-gray-900 mt-12 mb-6">State: The Hidden Foundation of Intelligence</h2>

                <p className="text-gray-700 leading-relaxed mb-8">
                  State is memory with purpose. It's not just the ability to remember what happened—it's the capacity to use that memory to inform future decisions, maintain context across interactions, and build understanding over time.
                </p>

                <p className="text-gray-700 leading-relaxed mb-8">
                  Most systems we call "AI Agents" today are <strong>stateless</strong>. Each interaction begins fresh, with no memory of previous conversations or accumulated knowledge. Like a brilliant person with severe anterograde amnesia, they can display remarkable intelligence in the moment but cannot learn, adapt, or build on their experiences.
                </p>

                <p className="text-gray-700 leading-relaxed mb-6">
                  <strong>Stateful systems</strong>, by contrast, maintain persistent memory that influences future behavior. They can:
                </p>

                <div className="bg-blue-50 rounded-lg p-6 mb-8">
                  <ul className="space-y-3">
                    <li className="flex items-start">
                      <CheckCircle className="h-5 w-5 text-blue-600 mr-3 mt-0.5 flex-shrink-0" />
                      <span><strong>Remember context</strong> across multiple interactions</span>
                    </li>
                    <li className="flex items-start">
                      <CheckCircle className="h-5 w-5 text-blue-600 mr-3 mt-0.5 flex-shrink-0" />
                      <span><strong>Learn from experience</strong> and improve their performance over time</span>
                    </li>
                    <li className="flex items-start">
                      <CheckCircle className="h-5 w-5 text-blue-600 mr-3 mt-0.5 flex-shrink-0" />
                      <span><strong>Maintain long-term objectives</strong> that span multiple sessions</span>
                    </li>
                    <li className="flex items-start">
                      <CheckCircle className="h-5 w-5 text-blue-600 mr-3 mt-0.5 flex-shrink-0" />
                      <span><strong>Build relationships</strong> and understand ongoing situations</span>
                    </li>
                    <li className="flex items-start">
                      <CheckCircle className="h-5 w-5 text-blue-600 mr-3 mt-0.5 flex-shrink-0" />
                      <span><strong>Adapt strategies</strong> based on what has and hasn't worked previously</span>
                    </li>
                  </ul>
                </div>

                <p className="text-gray-700 leading-relaxed mb-8">
                  The combination of state and agency creates something qualitatively different from either component alone. A stateless system with high agency can execute complex plans but can't learn from failure. A stateful system with low agency can remember everything but struggles to act independently on that knowledge.
                </p>

                <h2 className="text-2xl font-bold text-gray-900 mt-12 mb-6">The Agentic Sweet Spot: High Agency + Statefulness</h2>

                <p className="text-gray-700 leading-relaxed mb-8">
                  When we talk about "agentic systems," we're really describing AI that combines <strong>high agency</strong> with <strong>robust statefulness</strong>. These systems don't just respond to prompts or execute predetermined workflows—they operate more like autonomous colleagues who:
                </p>

                <div className="bg-green-50 rounded-lg p-6 mb-8">
                  <ul className="space-y-3">
                    <li>• Understand long-term objectives and work toward them persistently</li>
                    <li>• Remember what they've learned and apply those insights to new situations</li>
                    <li>• Adapt their approaches based on what succeeds and what fails</li>
                    <li>• Maintain context and relationships across extended periods</li>
                    <li>• Make independent decisions about how to allocate their time and resources</li>
                  </ul>
                </div>

                <p className="text-gray-700 leading-relaxed mb-6">
                  Consider the difference between these two AI systems:
                </p>

                <div className="grid md:grid-cols-2 gap-6 mb-8">
                  <div className="bg-orange-50 border border-orange-200 rounded-lg p-6">
                    <h3 className="font-semibold text-orange-900 mb-3">System A (High Agency, Stateless)</h3>
                    <p className="text-orange-800 text-sm">
                      Can break down complex tasks, use multiple tools, and execute sophisticated plans. But every conversation starts from scratch. It might solve the same problem brilliantly a hundred times without ever recognizing it's seen it before.
                    </p>
                  </div>
                  <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                    <h3 className="font-semibold text-green-900 mb-3">System B (High Agency, Stateful)</h3>
                    <p className="text-green-800 text-sm">
                      Does everything System A can do, but also remembers past interactions, learns from previous successes and failures, maintains ongoing projects across sessions, and builds increasingly sophisticated understanding of recurring problems.
                    </p>
                  </div>
                </div>

                <p className="text-gray-700 leading-relaxed mb-8">
                  System B is what we mean when we talk about truly agentic AI.
                </p>

                <h2 className="text-2xl font-bold text-gray-900 mt-12 mb-6">Why This Distinction Matters</h2>

                <p className="text-gray-700 leading-relaxed mb-8">
                  The conflation of "AI Agent" with "any AI system that does things" isn't just a marketing problem—it's a strategic one that affects how we design, deploy, and integrate AI into our organizations and lives.
                </p>

                <div className="grid md:grid-cols-2 gap-8 mb-8">
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
                      <Users className="h-5 w-5 text-blue-600 mr-2" />
                      For Developers
                    </h3>
                    <p className="text-gray-700 text-sm">
                      Understanding the agency-state matrix helps you choose the right architecture for your use case. Need a system to answer customer questions? A high-agency, stateless system might be perfect. Building a research assistant that improves over time? You need both agency and state.
                    </p>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
                      <Target className="h-5 w-5 text-green-600 mr-2" />
                      For Organizations
                    </h3>
                    <p className="text-gray-700 text-sm">
                      Recognizing the difference between reactive tools and agentic systems helps set appropriate expectations and design better human-AI collaboration. Stateless agents require human coordination and memory. Stateful, agentic systems can take on roles that more closely resemble human colleagues.
                    </p>
                  </div>
                </div>

                <h2 className="text-2xl font-bold text-gray-900 mt-12 mb-6">Building Toward True Agency</h2>

                <p className="text-gray-700 leading-relaxed mb-8">
                  As we design the next generation of AI systems, the path toward true agency becomes clearer:
                </p>

                <div className="space-y-6 mb-8">
                  <div className="border-l-4 border-blue-600 pl-6">
                    <h3 className="font-semibold text-gray-900 mb-2">Start with Purpose</h3>
                    <p className="text-gray-700">
                      Define what autonomous behavior actually means for your specific use case. What decisions should the system make independently? What goals should it pursue without constant human guidance?
                    </p>
                  </div>
                  <div className="border-l-4 border-green-600 pl-6">
                    <h3 className="font-semibold text-gray-900 mb-2">Design for Memory</h3>
                    <p className="text-gray-700">
                      Build systems that can maintain and utilize persistent state. This isn't just about storing conversation history—it's about creating memory systems that inform decision-making and enable learning.
                    </p>
                  </div>
                  <div className="border-l-4 border-purple-600 pl-6">
                    <h3 className="font-semibold text-gray-900 mb-2">Enable Adaptation</h3>
                    <p className="text-gray-700">
                      Create mechanisms for systems to modify their behavior based on outcomes. This might involve reinforcement learning, dynamic prompting, or sophisticated feedback loops.
                    </p>
                  </div>
                </div>

                <h2 className="text-2xl font-bold text-gray-900 mt-12 mb-6">The Real Promise of Agentic AI</h2>

                <p className="text-gray-700 leading-relaxed mb-8">
                  When we talk about AI transforming how we work, learn, and solve problems, we're really talking about the potential of truly agentic systems. Not just smart tools that respond to our requests, but intelligent partners that can maintain long-term goals, learn from experience, and operate autonomously in service of shared objectives.
                </p>

                <p className="text-gray-700 leading-relaxed mb-8">
                  This isn't science fiction—the building blocks exist today. What we need is clearer thinking about what we're building and why. We need to move beyond the label of "AI Agent" and focus on the underlying capabilities that make systems genuinely useful over time.
                </p>

                <p className="text-gray-700 leading-relaxed mb-8">
                  The next breakthrough in AI won't just be about larger models or faster inference. It will be about creating systems that combine the planning capabilities of high-agency AI with the learning capabilities of stateful systems, resulting in AI that truly deserves the title "agentic."
                </p>

                <p className="text-gray-700 leading-relaxed mb-8">
                  Because when we build AI that can genuinely act as our partners—systems that remember, learn, adapt, and pursue goals autonomously—we're not just automating tasks. We're augmenting human intelligence itself.
                </p>

                <p className="text-lg font-medium text-gray-900 mb-8 italic">
                  The future belongs to agentic AI. But first, we need to understand what that actually means.
                </p>

                <div className="bg-gradient-to-r from-blue-50 to-green-50 rounded-xl p-8 mb-12">
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">Ready to Build Truly Agentic Systems?</h3>
                  <p className="text-gray-700 mb-6">
                    Start by defining your agency requirements clearly. What decisions should your AI make independently? What memory does it need to be effective over time? How will it learn and adapt? The answers to these questions will guide you toward AI that doesn't just respond—but truly acts.
                  </p>
                  <p className="text-lg font-medium text-gray-900 italic">
                    Because the difference between a tool and a partner is the ability to grow together.
                  </p>
                </div>

                <div className="text-center pt-8">
                  <Link 
                    to="/"
                    className="inline-flex items-center px-8 py-4 text-white font-semibold rounded-xl hover:shadow-lg transition-all duration-300 transform hover:scale-105"
                    style={{ backgroundColor: '#1db954' }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#16a14a'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#1db954'}
                    onClick={() => {
                      setTimeout(() => window.scrollTo({ top: 0, behavior: 'smooth' }), 100);
                    }}
                  >
                    Explore AI Research Papers
                    <ArrowRight className="h-5 w-5 ml-2" />
                  </Link>
                </div>
              </div>
            )}

            {slug === 'ai-first-mindset-ferrari-engine' && (
              <div className="prose prose-lg max-w-none">
                
                <p className="text-xl text-gray-700 leading-relaxed mb-8">
                  Picture this: You're building the world's most advanced Formula 1 racing car. You have the finest aerodynamic design, the lightest carbon fiber chassis, and precision-engineered components worth millions. But then, instead of installing a high-performance racing engine, you drop in a reliable diesel truck engine.
                </p>

                <p className="text-gray-700 leading-relaxed mb-8">
                  It would run. It might even be dependable. But it would fundamentally miss the point.
                </p>

                <p className="text-gray-700 leading-relaxed mb-8">
                  This is exactly what happens when we approach AI-powered products with traditional software development mindsets. We're building Ferraris with truck engines—and wondering why they don't perform like we imagined.
                </p>

                <h2 className="text-3xl font-bold text-gray-900 mt-12 mb-6">The Engine Changes Everything</h2>
                
                <div className="bg-blue-50 border-l-4 border-blue-400 p-6 mb-8">
                  <div className="flex items-start">
                    <TrendingUp className="h-6 w-6 text-blue-600 mr-3 mt-1 flex-shrink-0" />
                    <div>
                      <h3 className="font-semibold text-blue-800 mb-2">Traditional vs AI-Powered Systems</h3>
                      <p className="text-blue-700">In traditional software, the logic is predictable and outputs are deterministic. But when AI becomes your engine, everything changes: outputs become probabilistic, interactions become conversational, and the system learns and evolves.</p>
                    </div>
                  </div>
                </div>

                <p className="text-gray-700 leading-relaxed mb-8">
                  In traditional software development, the "engine" is relatively simple: databases store information, servers process requests, and user interfaces display results. The logic is predictable, the outputs are deterministic, and the user experience flows in linear, well-defined paths.
                </p>

                <p className="text-gray-700 leading-relaxed mb-8">
                  But when AI becomes your engine, everything changes:
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
                  <div className="bg-red-50 p-6 rounded-xl">
                    <h4 className="font-semibold text-red-800 mb-3 flex items-center">
                      <Target className="h-5 w-5 mr-2" />
                      Traditional Systems
                    </h4>
                    <ul className="text-red-700 space-y-2 text-sm">
                      <li>• Predictable, deterministic outputs</li>
                      <li>• Linear user experience flows</li>
                      <li>• Fixed rules and logic</li>
                      <li>• Manual feature updates</li>
                    </ul>
                  </div>
                  
                  <div className="bg-green-50 p-6 rounded-xl">
                    <h4 className="font-semibold text-green-800 mb-3 flex items-center">
                      <CheckCircle className="h-5 w-5 mr-2" />
                      AI-First Systems
                    </h4>
                    <ul className="text-green-700 space-y-2 text-sm">
                      <li>• Probabilistic, learning outputs</li>
                      <li>• Conversational interactions</li>
                      <li>• Context and nuance awareness</li>
                      <li>• Native personalization</li>
                    </ul>
                  </div>
                </div>

                <p className="text-gray-700 leading-relaxed mb-8">
                  You cannot simply bolt AI capabilities onto a traditionally-designed product any more than you can bolt a rocket engine onto a horse-drawn carriage. The entire architecture—technical, experiential, and conceptual—must be redesigned around this fundamentally different kind of power.
                </p>

                <h2 className="text-3xl font-bold text-gray-900 mt-12 mb-6">What AI-First Really Means</h2>

                <p className="text-gray-700 leading-relaxed mb-8">
                  Building with an AI-first mindset isn't about using the latest machine learning models or having the most sophisticated algorithms. It's about recognizing that when intelligence becomes your core capability, every other aspect of your product must be reimagined to harness and showcase that intelligence effectively.
                </p>

                <div className="space-y-8 mb-12">
                  <div className="flex items-start">
                    <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center mr-4 mt-1 flex-shrink-0">
                      <span className="text-red-600 font-bold">✕</span>
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-3">Traditional Mindset: AI as a Feature</h3>
                      <p className="text-gray-700 leading-relaxed mb-4">
                        Most companies approach AI like adding a new feature to an existing product: "Let's add a chatbot," "Can we use AI to improve search?" or "What if we automated this with machine learning?"
                      </p>
                      <div className="bg-red-50 p-4 rounded-lg">
                        <p className="text-red-800 text-sm italic">
                          This results in AI that feels bolted-on, disconnected, and often underwhelming. Users interact with it like a novelty rather than a core capability.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-start">
                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mr-4 mt-1 flex-shrink-0">
                      <span className="text-green-600 font-bold">✓</span>
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-3">AI-First Mindset: AI as the Foundation</h3>
                      <p className="text-gray-700 leading-relaxed mb-4">
                        AI-first companies start with fundamentally different questions: "If intelligence was unlimited and free, how would people solve this problem?" and "What becomes possible when the system understands context and learns from every interaction?"
                      </p>
                      <div className="bg-green-50 p-4 rounded-lg">
                        <p className="text-green-800 text-sm italic">
                          This leads to products where AI isn't a feature—it's the reason the product exists and the lens through which every design decision is made.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <h2 className="text-3xl font-bold text-gray-900 mt-12 mb-6">The Ferrari Architecture: Building for Intelligence</h2>

                <p className="text-gray-700 leading-relaxed mb-8">
                  When you're building a Ferrari, every component is designed around performance. The suspension isn't just about comfort—it's engineered to keep the tires connected to the road at 200 mph. Similarly, when building AI-first products, every component must be designed around intelligence.
                </p>

                <div className="bg-gradient-to-r from-purple-100 to-pink-100 rounded-2xl p-8 mb-12">
                  <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">Real-World AI-First Architecture: Pearadox Case Study</h3>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <div>
                      <h4 className="font-semibold text-purple-900 mb-4">Traditional Approach Would Build:</h4>
                      <ul className="text-purple-800 space-y-2 text-sm">
                        <li>• A database of research papers</li>
                        <li>• A search interface with filters</li>
                        <li>• User accounts with saved papers</li>
                        <li>• Email notifications for new content</li>
                      </ul>
                    </div>
                    
                    <div>
                      <h4 className="font-semibold text-purple-900 mb-4">AI-First Approach Reimagines:</h4>
                      <ul className="text-purple-800 space-y-2 text-sm">
                        <li>• Intelligent content understanding layers</li>
                        <li>• Natural language query interfaces</li>
                        <li>• Adaptive, personalized recommendations</li>
                        <li>• Predictive content curation</li>
                      </ul>
                    </div>
                  </div>
                </div>

                <h2 className="text-3xl font-bold text-gray-900 mt-12 mb-6">Avoiding the Truck Engine Trap</h2>

                <p className="text-gray-700 leading-relaxed mb-8">
                  The biggest mistake in AI-first development is trying to apply traditional software development approaches to intelligent systems. Here are the most common traps and how to avoid them:
                </p>

                <div className="space-y-6 mb-12">
                  <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
                    <div className="flex items-start">
                      <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center mr-4 mt-1 flex-shrink-0">
                        <span className="text-gray-900 font-bold text-lg">1</span>
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900 mb-2">Feature Thinking</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <p className="text-red-700 text-sm mb-2"><strong>Wrong:</strong></p>
                            <p className="text-red-600 text-sm italic">"Let's add AI to our existing product"</p>
                          </div>
                          <div>
                            <p className="text-green-700 text-sm mb-2"><strong>Right:</strong></p>
                            <p className="text-green-600 text-sm italic">"Let's approach this problem assuming infinite intelligence"</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
                    <div className="flex items-start">
                      <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center mr-4 mt-1 flex-shrink-0">
                        <span className="text-gray-900 font-bold text-lg">2</span>
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900 mb-2">Deterministic Expectations</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <p className="text-red-700 text-sm mb-2"><strong>Wrong:</strong></p>
                            <p className="text-red-600 text-sm italic">Designing interfaces that expect predictable, consistent outputs</p>
                          </div>
                          <div>
                            <p className="text-green-700 text-sm mb-2"><strong>Right:</strong></p>
                            <p className="text-green-600 text-sm italic">Designing for probabilistic systems that improve over time</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
                    <div className="flex items-start">
                      <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center mr-4 mt-1 flex-shrink-0">
                        <span className="text-gray-900 font-bold text-lg">3</span>
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900 mb-2">Human vs. AI Competition</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <p className="text-red-700 text-sm mb-2"><strong>Wrong:</strong></p>
                            <p className="text-red-600 text-sm italic">Trying to replace human capabilities with AI</p>
                          </div>
                          <div>
                            <p className="text-green-700 text-sm mb-2"><strong>Right:</strong></p>
                            <p className="text-green-600 text-sm italic">Designing AI to amplify and enhance human capabilities</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <h2 className="text-3xl font-bold text-gray-900 mt-12 mb-6">The Competitive Advantage of AI-First</h2>

                <p className="text-gray-700 leading-relaxed mb-8">
                  Companies that truly embrace AI-first thinking don't just build better products—they create entirely new categories of value that traditional approaches cannot match.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
                  <div className="bg-gradient-to-r from-blue-50 to-cyan-50 p-6 rounded-xl">
                    <h3 className="text-lg font-bold text-blue-900 mb-4 flex items-center">
                      <Users className="h-6 w-6 mr-3 text-blue-600" />
                      Network Effects Through Intelligence
                    </h3>
                    <p className="text-blue-800 text-sm leading-relaxed">
                      Traditional network effects come from user adoption. AI-first network effects come from collective intelligence—the more people use the system, the smarter it becomes for everyone.
                    </p>
                  </div>

                  <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-6 rounded-xl">
                    <h3 className="text-lg font-bold text-green-900 mb-4 flex items-center">
                      <Target className="h-6 w-6 mr-3 text-green-600" />
                      Personalization at Scale
                    </h3>
                    <p className="text-green-800 text-sm leading-relaxed">
                      Traditional personalization requires manual segmentation. AI-first personalization creates unique experiences for every user automatically.
                    </p>
                  </div>

                  <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-6 rounded-xl">
                    <h3 className="text-lg font-bold text-purple-900 mb-4 flex items-center">
                      <Lightbulb className="h-6 w-6 mr-3 text-purple-600" />
                      Proactive Value Creation
                    </h3>
                    <p className="text-purple-800 text-sm leading-relaxed">
                      Traditional products wait for users to request features. AI-first products anticipate needs and create value before users realize they need it.
                    </p>
                  </div>

                  <div className="bg-gradient-to-r from-orange-50 to-red-50 p-6 rounded-xl">
                    <h3 className="text-lg font-bold text-orange-900 mb-4 flex items-center">
                      <TrendingUp className="h-6 w-6 mr-3 text-orange-600" />
                      Continuous Evolution
                    </h3>
                    <p className="text-orange-800 text-sm leading-relaxed">
                      Traditional products require manual updates. AI-first products improve continuously through use, creating compound competitive advantages.
                    </p>
                  </div>
                </div>

                <h2 className="text-3xl font-bold text-gray-900 mt-12 mb-6">The Ferrari You're Building</h2>

                <p className="text-gray-700 leading-relaxed mb-8">
                  Your AI-powered product isn't just software with some machine learning sprinkled on top. It's a Ferrari—a precision instrument designed around the incredible power of artificial intelligence.
                </p>

                <p className="text-gray-700 leading-relaxed mb-8">
                  Every line of code, every design decision, every user interaction should be optimized for one thing: unleashing the full potential of intelligent systems to create value that was impossible before.
                </p>

                <div className="bg-gradient-to-r from-gray-900 to-blue-900 text-white rounded-2xl p-8 mb-12">
                  <h3 className="text-2xl font-bold mb-4 text-center">You wouldn't put a truck engine in a Ferrari.</h3>
                  <p className="text-xl text-center mb-6 text-gray-200">
                    Don't put traditional thinking in your AI-first product.
                  </p>
                  <p className="text-lg text-center text-gray-300">
                    The future belongs to those who build around intelligence—not those who bolt intelligence onto what they built before.
                  </p>
                </div>

                <div className="text-center border-t border-gray-200 pt-8">
                  <p className="text-gray-600 italic mb-6">
                    <strong>Ready to embrace AI-first thinking?</strong> The tools exist, the opportunities are endless, and the time is now. Whether you're reimagining an existing product or starting fresh, the principles of AI-first design will determine your success.
                  </p>
                  <Link 
                    to="/"
                    className="inline-flex items-center px-6 py-3 text-white rounded-lg hover:shadow-lg transition-all transform hover:scale-105 font-medium"
                    style={{ backgroundColor: '#1db954' }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#16a14a'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#1db954'}
                    onClick={() => {
                      setTimeout(() => window.scrollTo({ top: 0, behavior: 'smooth' }), 100);
                    }}
                  >
                    Explore AI Research
                    <ArrowRight className="h-5 w-5 ml-2" />
                  </Link>
                </div>
              </div>
            )}

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
                  className="inline-flex items-center px-8 py-4 text-white font-semibold rounded-xl hover:shadow-lg transition-all duration-300 transform hover:scale-105"
                  style={{ backgroundColor: '#1db954' }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#16a14a'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#1db954'}
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
                  No computer science degree. No development team. No massive budget. Just you, your ideas, and $20 to turn them into reality. Let me show you exactly how to unlock your creative potential and join the ranks of solo app creators changing the world.
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
                      <h3 className="font-semibold text-yellow-800 mb-2">The $20 Breakdown</h3>
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

                <div className="bg-gradient-to-r from-orange-50 to-red-50 p-4 sm:p-8 rounded-xl mb-12 overflow-hidden">
                  <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-4 sm:mb-6 flex items-center">
                    <CheckCircle className="h-5 w-5 sm:h-6 sm:w-6 mr-2 sm:mr-3 text-orange-600 flex-shrink-0" />
                    Step 4: Create Your First App (10 minutes)
                  </h3>
                  <div className="space-y-4 text-gray-700">
                    <p><strong>The magic moment:</strong> Watch your idea become reality in real-time.</p>
                    <div className="bg-white p-3 sm:p-4 rounded-lg overflow-hidden">
                      <p className="font-medium mb-2">Action steps:</p>
                      <ol className="list-decimal list-inside space-y-2 text-sm">
                        <li><strong>In Cursor:</strong> Press <span className="font-mono bg-gray-100 px-2 py-1 rounded text-xs sm:text-sm">Ctrl+Shift+P</span> (or Cmd on Mac)</li>
                        <li className="break-words">Type "Clone Repository" and paste: 
                          <div className="mt-1">
                            <span className="font-mono bg-gray-100 px-2 py-1 rounded text-xs break-all block sm:inline">https://github.com/vercel/next.js/tree/canary/examples/hello-world</span>
                          </div>
                        </li>
                        <li><strong>Start building:</strong> In the chat, type: <em>"Turn this into a simple todo app with a clean design"</em></li>
                        <li><strong>Save to GitHub:</strong> Press <span className="font-mono bg-gray-100 px-2 py-1 rounded text-xs sm:text-sm">Ctrl+Shift+G</span>, commit your changes</li>
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
                    className="inline-flex items-center px-6 py-3 text-white rounded-lg transition-colors font-medium"
                    style={{ backgroundColor: '#1db954' }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#16a14a'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#1db954'}
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
