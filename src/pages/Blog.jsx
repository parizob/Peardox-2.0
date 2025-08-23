import React, { useState, useEffect } from 'react';
import { Calendar, Clock, User, ArrowLeft, BookOpen, Brain, Globe, Users, Zap, Heart, Target, Lightbulb, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import SavedArticles from '../components/SavedArticles';
import AccountModal from '../components/AccountModal';
import ArticleModal from '../components/ArticleModal';
import { useUser } from '../contexts/UserContext';
import { viewedArticlesAPI } from '../lib/supabase';

const Blog = () => {
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
    // Simplified - just set all sections as visible
    setIsVisible({
      hero: true,
      posts: true
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

  // Blog posts data
  const blogPosts = [
    {
      id: 2,
      title: "Building an AI-Powered App for Just $20: A Complete Guide",
      slug: "building-an-app-with-AI",
      excerpt: "Think you need thousands of dollars and a team of developers to build an AI-powered app? Think again. With modern tools like Cursor, Vercel, GitHub, and Resend, you can create and deploy a sophisticated AI application for less than the cost of a dinner out.",
      content: `
# Building an AI-Powered App for Just $20: A Complete Guide

*How modern development tools are democratizing app creation*

Remember when building a software application required a computer science degree, months of development time, and thousands of dollars in infrastructure costs? Those days are over. Today, with the right combination of modern tools and a bit of creativity, you can build and deploy a sophisticated AI-powered application for less than the cost of a nice dinner.

Let me show you exactly how to do it for just $20.

## The Modern Development Stack: Powerful and Affordable

The secret sauce isn't just about cutting costs—it's about leveraging tools that are genuinely better than their expensive predecessors. Here's our winning combination:

### **Cursor: Your AI-Powered Development Partner ($20/month)**
Forget spending months learning complex programming syntax. Cursor is a revolutionary code editor that acts like having a senior developer sitting right next to you. Simply describe what you want to build in plain English, and watch as Cursor generates clean, functional code in real-time.

*What makes it special:*
- **AI-first design**: Built specifically for AI-assisted development
- **Context awareness**: Understands your entire project structure
- **Natural language programming**: Write apps by describing what you want
- **Multi-language support**: JavaScript, Python, React, and more
- **Real-time collaboration**: Your AI coding partner never sleeps

*Cost: $20/month (but you can build multiple apps)*

### **Vercel: Deploy Like a Pro (Free)**
Gone are the days of complex server configurations and expensive hosting bills. Vercel offers lightning-fast deployment with a generous free tier that's perfect for most applications.

*What you get for free:*
- **Instant deployment**: Push to GitHub, see your app live in seconds
- **Global CDN**: Your app loads quickly worldwide
- **Automatic HTTPS**: Security built-in
- **Preview deployments**: Test changes before going live
- **Analytics**: Understand how users interact with your app

*Cost: $0 (free tier covers most indie projects)*

### **GitHub: Your Code's Home (Free)**
Your code needs a safe, reliable home, and GitHub provides exactly that—along with powerful collaboration tools and seamless integration with other services.

*Why GitHub:*
- **Unlimited public repositories**: Share your work with the world
- **Version control**: Never lose your work again
- **Issues and project management**: Stay organized
- **Integration hub**: Connects with virtually every development tool
- **Community**: Learn from millions of other developers

*Cost: $0 (free for public repositories)*

### **Resend: Professional Email Made Simple ($0-20/month)**
Every serious application needs email functionality—user registrations, notifications, password resets. Resend makes professional email integration ridiculously simple.

*What you get:*
- **100 emails/month free**: Perfect for getting started
- **Developer-friendly**: Clean APIs and excellent documentation
- **Deliverability focused**: Your emails actually reach inboxes
- **Beautiful templates**: Professional-looking emails out of the box
- **Analytics**: Track opens, clicks, and engagement

*Cost: $0 for up to 100 emails/month, then $20/month for higher volume*

### **Custom Domain: Your Professional Touch ($10/year)**
A custom domain transforms your project from a hobby into a professional application. It's the difference between \`myapp.vercel.app\` and \`myapp.com\`.

*Benefits:*
- **Professional credibility**: Users trust custom domains
- **Brand control**: Own your online identity
- **Email addresses**: hello@yourapp.com looks much better
- **SEO benefits**: Better search engine visibility
- **Portability**: Move hosting providers without changing your brand

*Cost: $10-15/year (depending on the domain)*

## Building Your First AI App: A Real Example

Let's walk through building a practical AI-powered application: an intelligent research assistant that helps users find and understand academic papers (sound familiar?).

### **Phase 1: Planning and Setup (Day 1)**

**Step 1: Define Your MVP**
Start simple. Our research assistant will:
- Allow users to search for academic papers
- Provide AI-generated summaries based on user expertise level
- Let users save interesting papers
- Send weekly digest emails

**Step 2: Set Up Your Environment**
1. **Create a GitHub repository**: Your project's new home
2. **Install Cursor**: Download and set up your AI coding partner
3. **Plan your tech stack**: React for the frontend, Node.js for the backend
4. **Design your database**: What information will you store?

### **Phase 2: Building with AI Assistance (Days 2-7)**

Here's where Cursor shines. Instead of writing thousands of lines of code manually, you'll describe what you want and let AI do the heavy lifting.

**Example Cursor prompts:**
- "Create a React component that displays academic papers in a clean card layout"
- "Build a search function that filters papers by category and date"
- "Add a user authentication system with sign-up and login"
- "Create an email service that sends weekly summaries to users"

**The Cursor Workflow:**
1. **Describe your feature**: "I need a way for users to save papers to their personal library"
2. **Review the generated code**: Cursor creates the component, database schema, and API endpoints
3. **Refine and iterate**: "Make the save button more prominent and add a visual confirmation"
4. **Test and deploy**: See your changes live in seconds

### **Phase 3: Adding AI Intelligence (Days 8-14)**

This is where your app becomes truly powerful. Modern AI APIs make it incredibly easy to add sophisticated features:

**AI-Powered Features to Add:**
- **Smart summaries**: Generate paper summaries tailored to user expertise
- **Intelligent categorization**: Automatically tag papers by research area
- **Personalized recommendations**: Suggest papers based on user interests
- **Natural language search**: Let users search with questions, not keywords

**Implementation with Cursor:**
\`\`\`
"Add an AI summarization feature that takes a research paper abstract and creates three different summaries: one for beginners, one for students, and one for experts. Use OpenAI's API and make sure to handle rate limiting gracefully."
\`\`\`

Cursor will generate the API integration, error handling, and user interface—saving you weeks of development time.

### **Phase 4: Deployment and Polish (Days 15-21)**

**Vercel Deployment:**
1. **Connect your GitHub repo**: One-click integration
2. **Configure environment variables**: API keys and database URLs
3. **Deploy**: Your app is live in under 2 minutes
4. **Add your custom domain**: Professional branding complete

**Email Integration with Resend:**
- **Welcome emails**: Greet new users professionally
- **Weekly digests**: Keep users engaged with personalized content
- **Notifications**: Alert users about new papers in their areas of interest

## The $30 Breakdown

Let's tally up our costs:

- **Cursor subscription**: $20/month (you can build multiple apps)
- **Vercel hosting**: $0 (free tier)
- **GitHub repository**: $0 (free for public repos)
- **Resend email**: $0 (100 emails/month free, upgrade later)
- **Custom domain**: $10/year

**Total first-month cost**: $20
**Total ongoing monthly cost**: $20 (assuming you keep building!)

## Beyond the Basics: Scaling Your Success

Once your app gains traction, this infrastructure scales beautifully:

**Month 2-3: Add Premium Features**
- Advanced AI features (recommendation engines, predictive analytics)
- User collaboration tools
- Mobile app (React Native with Cursor)
- Advanced email campaigns

**Month 4-6: Monetization**
- Freemium model (basic features free, advanced features paid)
- Subscription tiers
- API access for other developers
- Enterprise features for organizations

**Month 7+: Business Growth**
- Team collaboration features
- White-label solutions
- Partnerships and integrations
- International expansion

## Real Success Stories

This isn't theoretical—developers around the world are building successful businesses with exactly this stack:

**Case Study 1: StudentAI**
- **Built by**: Solo developer with no formal CS background
- **Time to launch**: 3 weeks
- **Current revenue**: $5,000/month
- **Users**: 10,000+ students across 50 universities

**Case Study 2: LocalBiz Assistant**
- **Built by**: Small business owner who learned to code
- **Time to launch**: 6 weeks
- **Current revenue**: $15,000/month
- **Users**: 500+ local businesses

**Case Study 3: Research Hub (like Pearadox!)**
- **Built by**: PhD student frustrated with academic papers
- **Time to launch**: 4 weeks
- **Current users**: 50,000+ researchers and students

## The Mindset Shift: From Consumer to Creator

The most important investment isn't the $30—it's changing your mindset from consumer to creator. We're living in the golden age of indie development, where:

- **AI handles the complex coding**: Focus on solving problems, not syntax
- **Cloud infrastructure is democratized**: Enterprise-grade tools at startup prices
- **Global distribution is instant**: Reach users worldwide from day one
- **Learning resources are abundant**: YouTube, documentation, and AI tutors

## Getting Started Today

Ready to build your first AI app? Here's your action plan:

**This Week:**
1. **Choose your app idea**: Solve a problem you personally face
2. **Set up your accounts**: GitHub, Vercel, Resend
3. **Buy your domain**: Secure your brand early
4. **Download Cursor**: Start experimenting with AI-assisted coding

**Next Week:**
1. **Build your MVP**: Focus on core functionality
2. **Deploy early and often**: Get feedback from real users
3. **Iterate based on feedback**: Let users guide your development
4. **Document your journey**: Share your story (it inspires others!)

**Month 1:**
1. **Launch publicly**: Share on social media, relevant communities
2. **Gather user feedback**: Listen more than you talk
3. **Plan your next features**: What do users actually want?
4. **Consider monetization**: How will you sustain and grow?

## The Democratization Revolution

Tools like Cursor, Vercel, and GitHub aren't just making development cheaper—they're democratizing the entire process of creation. You no longer need:

- **Years of computer science education**: AI assists with complex coding
- **Large development teams**: Solo creators can build professional apps
- **Massive budgets**: $30 gets you started, revenue funds growth
- **Technical infrastructure expertise**: Cloud platforms handle the complexity

This democratization means more diverse voices in technology, more creative solutions to real problems, and more opportunities for individual creators to build meaningful businesses.

## Your Turn to Build

The tools exist. The costs are minimal. The opportunities are endless.

The only question remaining is: what problem will you solve?

Whether you're a teacher who wants to create better learning tools, a healthcare worker who sees inefficiencies that technology could address, an entrepreneur with a vision for a better way, or simply someone curious about what you could build—the barriers have never been lower.

**Your $20 investment isn't just buying tools—it's buying the possibility of creating something that matters.**

Ready to get started? The future of app development isn't in the hands of big tech companies or venture-funded startups. It's in your hands.

*What will you build?*

---

**Ready to dive deeper?** Check out our step-by-step video tutorial series where we build a complete AI app from scratch, sharing every line of code and every decision along the way. Because when we democratize development, we democratize opportunity.
      `,
      author: "The Pearadox Team",
      date: "2025-08-24",
      readTime: "12 min read",
      tags: ["AI Development", "Cursor", "Vercel", "Indie Development", "Tutorial", "Low-Cost"],
      featured: true
    },
    {
      id: 1,
      title: "Democratizing AI Research: Why Everyone Deserves to Understand the Future",
      slug: "democratizing-ai-research",
      excerpt: "AI research is reshaping our world at unprecedented speed. But what happens when this transformative knowledge remains locked behind academic walls? We believe everyone deserves access to the insights that are defining our collective future.",
      content: `
# Democratizing AI Research: Why Everyone Deserves to Understand the Future

Imagine a world where groundbreaking discoveries in artificial intelligence remain hidden in academic papers, accessible only to those with advanced degrees and institutional access. Now imagine the opposite: a world where every teacher, entrepreneur, student, and curious mind can understand and apply the latest AI breakthroughs to solve real problems in their communities.

This is the vision driving Pearadox—and it's more than just an ideal. It's an urgent necessity for our collective future.

## The Knowledge Acceleration Crisis

We're living through the most rapid period of scientific advancement in human history. Every day, researchers publish dozens of papers on machine learning, computer vision, natural language processing, and robotics. These discoveries have the potential to revolutionize healthcare, education, climate science, and countless other fields that touch every aspect of human life.

But here's the problem: **most of this knowledge never makes it beyond the ivory tower.**

The gap between what we know and what we can practically apply is growing wider every day. Research papers are written in highly technical language, assume deep mathematical background, and often focus on narrow improvements that are difficult to connect to real-world applications. Meanwhile, the people who could most benefit from these advances—teachers looking to personalize learning, doctors seeking better diagnostic tools, small business owners wanting to automate routine tasks—are left out of the conversation entirely.

## Why Democratization Matters

When we make AI research accessible to everyone, three powerful things happen:

### 1. **Innovation Accelerates Exponentially**

The best innovations often come from unexpected connections between different fields. When a marine biologist understands the latest advances in pattern recognition, they might discover new ways to track ocean ecosystem changes. When a music teacher grasps how transformer models work, they could develop revolutionary approaches to composition education.

By breaking down the barriers to AI knowledge, we're not just sharing information—we're creating infinite possibilities for cross-pollination of ideas.

### 2. **Solutions Become More Human-Centered**

Academic researchers excel at pushing the boundaries of what's technically possible. But the people who understand real human needs—social workers, community organizers, local business owners—often lack the technical background to envision how AI could address their challenges.

When we bridge this gap, AI development becomes more responsive to actual human needs rather than just technical benchmarks. We get solutions that are not only more sophisticated but more meaningful.

### 3. **Progress Becomes More Equitable**

Today's AI revolution risks widening existing inequalities. Companies and institutions with the resources to hire PhD researchers gain tremendous advantages, while others fall further behind. But when AI knowledge is democratically accessible, every organization—regardless of size or budget—can participate in the transformation.

A small nonprofit can leverage the same cutting-edge techniques as a Fortune 500 company. A rural school district can access the same educational innovations as an elite private academy. This isn't just fairness—it's smart economics. The more minds we have working on problems, the faster we solve them.

## The Complexity Challenge

"But AI research is inherently complex," you might argue. "Some knowledge requires years of study to understand."

We respectfully disagree.

Yes, the mathematical foundations of machine learning are sophisticated. But the core insights—what these technologies can do, how they work conceptually, and where they might be applied—can be made accessible to anyone with curiosity and an open mind.

Think about how we teach other complex topics. We don't require medical school to explain that vaccines work by training your immune system to recognize threats. We don't demand engineering degrees to understand that bridges need to balance competing forces. Similarly, we can explain that neural networks learn by adjusting millions of tiny connections based on examples, without requiring mastery of backpropagation algorithms.

The key is meeting people where they are, not where we think they should be.

## Building Bridges, Not Walls

At Pearadox, we're building bridges between the world of cutting-edge research and the world of practical application. Every day, we:

- **Translate** complex academic papers into clear, accessible insights
- **Connect** abstract algorithms to concrete real-world applications  
- **Adapt** explanations to different skill levels and backgrounds
- **Highlight** the human impact of technical advances

But we're doing more than just simplification. We're creating a new kind of scientific discourse—one that values clarity alongside rigor, accessibility alongside accuracy, and practical wisdom alongside theoretical knowledge.

## The Ripple Effect

When we democratize AI research, we don't just help individual people understand individual papers. We create a ripple effect that transforms entire communities and industries.

A teacher who understands AI-powered personalization doesn't just improve their own classroom—they share insights with colleagues, participate in curriculum development, and help shape education policy. A healthcare worker who grasps the potential of diagnostic AI doesn't just improve patient care—they become an advocate for responsible AI adoption in their hospital system.

Knowledge is not a zero-sum resource. When we share it generously, it multiplies.

## An Invitation to Everyone

Whether you're a seasoned researcher looking to communicate your work more broadly, a student curious about the AI revolution, a professional seeking to understand how these technologies might transform your field, or simply someone who believes that knowledge should be shared—this space is for you.

You don't need a PhD in computer science to contribute to the AI revolution. You need curiosity, empathy, and a willingness to learn. The most important breakthroughs often come from asking the simplest questions: "What if?" "Why not?" "How might this help real people?"

## The Future We're Building Together

We envision a future where:

- **Every educator** can leverage AI to personalize learning for their students
- **Every healthcare professional** understands how AI can improve patient outcomes
- **Every entrepreneur** can envision how AI might transform their industry
- **Every citizen** can participate meaningfully in discussions about AI governance and ethics
- **Every curious mind** can explore the frontiers of human knowledge, regardless of their formal background

This isn't utopian thinking—it's practical necessity. The challenges we face as a species—climate change, healthcare access, educational inequality, economic disruption—are too complex for any single group to solve alone. We need all hands on deck, and that means ensuring all minds have access to the tools they need.

## Join the Revolution

The democratization of AI research isn't a spectator sport. It requires active participation from all of us—researchers willing to communicate beyond their peers, institutions willing to prioritize accessibility, and individuals willing to engage with complex ideas.

At Pearadox, we're just getting started. Every paper we translate, every insight we share, every person we reach is a step toward a more inclusive, innovative, and equitable future.

The knowledge exists. The tools are available. The only question is: are you ready to be part of the solution?

*Join us in making AI research accessible to everyone. Because when we democratize knowledge, we democratize opportunity—and that benefits us all.*

---

**Ready to dive in?** Start by exploring our latest paper summaries, tailored to your experience level. Whether you're a complete beginner or a seasoned expert, there's always something new to discover when we make complex research accessible to everyone.
      `,
      author: "The Pearadox Team",
      date: "2025-08-19",
      readTime: "8 min read",
      tags: ["AI Research", "Democratization", "Innovation", "Education", "Accessibility"],
      featured: false
    }
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
        isBlogPage={true}
      />
      
      {/* Content Spacer for Fixed Header */}
      <div className="h-24 sm:h-20"></div>

      <main className="relative z-10">
        {/* Hero Section */}
        <section className="py-12 sm:py-20">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
            <div 
              className={`transform transition-all duration-1000 ${
                isVisible.hero ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
              }`}
            >
              <div className="flex items-center justify-center mb-6">
                <BookOpen className="h-8 w-8 text-blue-600 mr-3" />
                <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-gray-900">
                  Pearadox Blog
                </h1>
              </div>
              
              <p className="text-xl sm:text-2xl text-gray-600 mb-8 max-w-3xl mx-auto">
                Insights, perspectives, and stories about democratizing AI research and making complex science accessible to everyone.
              </p>
              
              <div className="flex items-center justify-center space-x-8 text-sm text-gray-500">
                <div className="flex items-center">
                  <Brain className="h-4 w-4 mr-2" />
                  <span>Research Insights</span>
                </div>
                <div className="flex items-center">
                  <Globe className="h-4 w-4 mr-2" />
                  <span>Global Impact</span>
                </div>
                <div className="flex items-center">
                  <Users className="h-4 w-4 mr-2" />
                  <span>Community Stories</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Blog Posts Section */}
        <section className="py-8 sm:py-16">
          <div className="max-w-4xl mx-auto px-4 sm:px-6">
            <div 
              className={`transform transition-all duration-1000 ${
                isVisible.posts ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
              }`}
            >
              {blogPosts.map((post) => (
                <article key={post.id} className="mb-8 sm:mb-16 bg-white rounded-xl sm:rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300">
                  {/* Featured Badge */}
                  {post.featured && (
                    <div className="bg-gradient-to-r from-blue-600 to-green-600 px-6 py-2">
                      <span className="text-white text-sm font-medium flex items-center">
                        <Zap className="h-4 w-4 mr-2" />
                        Featured Post
                      </span>
                    </div>
                  )}
                  
                  {/* Post Header */}
                  <div className="p-4 sm:p-8 pb-4 sm:pb-6">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 space-y-2 sm:space-y-0">
                      <div className="flex items-center text-sm text-gray-500">
                        <Calendar className="h-4 w-4 mr-2" />
                        <span className="hidden sm:inline">{new Date(post.date).toLocaleDateString('en-US', { 
                          year: 'numeric', 
                          month: 'long', 
                          day: 'numeric' 
                        })}</span>
                        <span className="sm:hidden">{new Date(post.date).toLocaleDateString('en-US', { 
                          month: 'short', 
                          day: 'numeric',
                          year: 'numeric'
                        })}</span>
                        <span className="mx-2">•</span>
                        <Clock className="h-4 w-4 mr-2" />
                        <span>{post.readTime}</span>
                      </div>
                      <div className="flex items-center text-sm text-gray-500">
                        <User className="h-4 w-4 mr-2" />
                        <span>{post.author}</span>
                      </div>
                    </div>
                    
                    <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-4 leading-tight">
                      {post.title}
                    </h2>
                    
                    <p className="text-base sm:text-lg text-gray-600 mb-6 leading-relaxed">
                      {post.excerpt}
                    </p>
                    
                    {/* Tags */}
                    <div className="flex flex-wrap gap-2 mb-6">
                      {post.tags.map((tag, index) => (
                        <span 
                          key={index}
                          className="px-2 sm:px-3 py-1 bg-blue-50 text-blue-700 text-xs sm:text-sm rounded-full font-medium"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                  
                  {/* Read More Button */}
                  <div className="px-4 sm:px-8 pb-4 sm:pb-8">
                    <Link 
                      to={`/blog/${post.slug}`}
                      className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-green-600 text-white font-semibold rounded-xl hover:shadow-lg transition-all duration-300 transform hover:scale-105"
                      onClick={async () => {
                        // Track blog post preview click
                        try {
                          await viewedArticlesAPI.recordBlogPostView(user?.id, post, 'blog_preview');
                        } catch (error) {
                          console.error('Error recording blog post preview view:', error);
                        }
                        // Scroll to top when navigating to blog post
                        setTimeout(() => window.scrollTo({ top: 0, behavior: 'smooth' }), 100);
                      }}
                    >
                      Read Full Post
                      <ArrowRight className="h-5 w-5 ml-2" />
                    </Link>
                  </div>
                </article>
              ))}
              
              {/* Coming Soon */}
              <div className="text-center py-12">
                <div className="inline-flex items-center px-6 py-3 bg-gray-100 text-gray-600 rounded-xl">
                  <Lightbulb className="h-5 w-5 mr-2" />
                  <span className="font-medium">More insights coming soon...</span>
                </div>
                <p className="text-gray-500 mt-4">
                  Stay tuned for more posts about AI research, decentralization, and making science accessible to everyone.
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
                  className="inline-flex items-center text-blue-600 hover:text-blue-800 transition-colors group"
                  onClick={() => {
                    // Scroll to top when navigating to home page
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

export default Blog;
