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
      id: 4,
      title: "What Makes an AI Agent? Understanding Agency, State, and the Path to True Agentic Systems",
      slug: "what-makes-an-ai-agent",
      excerpt: "The term 'AI Agent' is everywhere in tech today, but what does it actually mean? Beyond the buzzwords lies a fascinating question about agency, state management, and what it truly means for a system to be 'agentic'. Let's explore the spectrum from simple chatbots to autonomous agents.",
      content: `
# What Makes an AI Agent? Understanding Agency, State, and the Path to True Agentic Systems

*Cutting through the confusion to understand what makes a system truly "agentic"*

Walk into any tech conference today, scroll through LinkedIn, or browse AI startup pitches, and you'll hear the term "AI Agent" thrown around with remarkable frequency. ChatGPT is an agent. A simple Python script that calls an API is an agent. Your automated email responder is apparently an agent. Even that basic if-then workflow you built last week? Also an agent, according to some marketing materials.

But here's the uncomfortable truth: **most of what we call "AI Agents" today aren't actually agents at all.**

This isn't just semantic nitpicking. The confusion around what constitutes an "agent" versus what makes a system "agentic" reflects a deeper misunderstanding about the fundamental nature of autonomous systems. When everything becomes an agent, nothing is—and we lose sight of what we're actually building toward.

Let's cut through the noise and explore what agency really means, why state matters more than you think, and how we can build truly agentic systems that live up to the transformative potential of artificial intelligence.

## The Agent Identity Crisis

The word "agent" comes from the Latin "agere," meaning "to act." In its purest form, an agent is something that acts independently on behalf of another entity. This definition seems simple enough, but when we apply it to AI systems, things get complicated fast.

Consider these systems, all commonly called "AI Agents":

**The Chatbot**: Responds to user inputs with generated text, maintains no memory between conversations.

**The Function-Calling LLM**: Can invoke external APIs and tools based on user requests, but resets after each interaction.

**The Workflow Automator**: Follows predefined rules to process data and trigger actions, with basic conditional logic.

**The Autonomous Researcher**: Maintains long-term goals, remembers past discoveries, adapts strategies based on outcomes, and operates independently for extended periods.

Which of these is truly an "agent"? The answer depends entirely on how we define agency—and this is where the confusion begins.

## Agency: The Spectrum of Independence

Agency isn't binary. It's not a simple yes-or-no question of whether something is an agent. Instead, agency exists on a spectrum, with systems exhibiting varying degrees of autonomous behavior.

At one end, we have **reactive systems**—they respond to inputs with outputs, following predetermined patterns or learned behaviors. Think of a customer service chatbot that can answer questions about your account balance. It's useful, it processes language intelligently, and it performs actions. But it's fundamentally reactive, operating only in response to external stimuli.

Moving along the spectrum, we encounter **goal-directed systems**—these maintain objectives and can plan sequences of actions to achieve them. A system that can break down "research this topic" into subtasks like "search for relevant papers," "summarize key findings," and "identify knowledge gaps" demonstrates higher agency than a simple question-answering system.

At the far end lies **autonomous agency**—systems that can form their own goals, adapt their strategies based on outcomes, and operate independently over extended periods. These systems don't just execute predefined objectives; they can recognize when objectives should change and modify their behavior accordingly.

But agency alone isn't enough to make a system truly "agentic." There's another critical dimension that's often overlooked: **state**.

## State: The Hidden Foundation of Intelligence

State is memory with purpose. It's not just the ability to remember what happened—it's the capacity to use that memory to inform future decisions, maintain context across interactions, and build understanding over time.

Most systems we call "AI Agents" today are **stateless**. Each interaction begins fresh, with no memory of previous conversations or accumulated knowledge. Like a brilliant person with severe anterograde amnesia, they can display remarkable intelligence in the moment but cannot learn, adapt, or build on their experiences.

**Stateful systems**, by contrast, maintain persistent memory that influences future behavior. They can:

- **Remember context** across multiple interactions
- **Learn from experience** and improve their performance over time
- **Maintain long-term objectives** that span multiple sessions
- **Build relationships** and understand ongoing situations
- **Adapt strategies** based on what has and hasn't worked previously

The combination of state and agency creates something qualitatively different from either component alone. A stateless system with high agency can execute complex plans but can't learn from failure. A stateful system with low agency can remember everything but struggles to act independently on that knowledge.

## The Agentic Sweet Spot: High Agency + Statefulness

When we talk about "agentic systems," we're really describing AI that combines **high agency** with **robust statefulness**. These systems don't just respond to prompts or execute predetermined workflows—they operate more like autonomous colleagues who:

- Understand long-term objectives and work toward them persistently
- Remember what they've learned and apply those insights to new situations
- Adapt their approaches based on what succeeds and what fails
- Maintain context and relationships across extended periods
- Make independent decisions about how to allocate their time and resources

Consider the difference between these two AI systems:

**System A** (High Agency, Stateless): Can break down complex tasks, use multiple tools, and execute sophisticated plans. But every conversation starts from scratch. It might solve the same problem brilliantly a hundred times without ever recognizing it's seen it before.

**System B** (High Agency, Stateful): Does everything System A can do, but also remembers past interactions, learns from previous successes and failures, maintains ongoing projects across sessions, and builds increasingly sophisticated understanding of recurring problems.

System B is what we mean when we talk about truly agentic AI.

## Why This Distinction Matters

The conflation of "AI Agent" with "any AI system that does things" isn't just a marketing problem—it's a strategic one that affects how we design, deploy, and integrate AI into our organizations and lives.

**For Developers**: Understanding the agency-state matrix helps you choose the right architecture for your use case. Need a system to answer customer questions? A high-agency, stateless system might be perfect. Building a research assistant that improves over time? You need both agency and state.

**For Organizations**: Recognizing the difference between reactive tools and agentic systems helps set appropriate expectations and design better human-AI collaboration. Stateless agents require human coordination and memory. Stateful, agentic systems can take on roles that more closely resemble human colleagues.

**For Users**: Understanding what your AI systems can and cannot do helps you work with them more effectively. A stateless system needs context provided each time. An agentic system can build on your relationship over time.

**For the Industry**: Clear definitions help us have more productive conversations about AI capabilities, limitations, and the path forward. When we're all using "agent" to mean different things, we're not actually communicating.

## Building Toward True Agency

As we design the next generation of AI systems, the path toward true agency becomes clearer:

**Start with Purpose**: Define what autonomous behavior actually means for your specific use case. What decisions should the system make independently? What goals should it pursue without constant human guidance?

**Design for Memory**: Build systems that can maintain and utilize persistent state. This isn't just about storing conversation history—it's about creating memory systems that inform decision-making and enable learning.

**Enable Adaptation**: Create mechanisms for systems to modify their behavior based on outcomes. This might involve reinforcement learning, dynamic prompting, or sophisticated feedback loops.

**Embrace Uncertainty**: Truly agentic systems must be able to operate in ambiguous situations, make decisions with incomplete information, and adapt when their assumptions prove wrong.

**Plan for Partnership**: The most powerful agentic systems won't replace humans—they'll augment them. Design for collaboration, not automation.

## The Spectrum in Practice

In the real world, most useful AI systems will exist somewhere in the middle of the agency-state spectrum. A customer service agent might be highly stateful about customer history but limited in its ability to make independent decisions about company policy. A research assistant might have high agency in exploring topics but limited memory about past conversations.

The key is matching your system's capabilities to its intended role. Don't build a stateless system for tasks that require memory. Don't create high-agency systems for contexts where predictable, bounded behavior is essential.

## What's Next for Agentic AI?

The future of AI isn't just about making systems smarter—it's about making them more genuinely autonomous. This means:

**Better Memory Architectures**: Moving beyond simple conversation history to sophisticated knowledge graphs, episodic memory, and learned behavioral patterns.

**Improved Goal Management**: Systems that can maintain multiple objectives, resolve conflicts between goals, and adapt priorities based on changing circumstances.

**Enhanced Metacognition**: AI that can reason about its own capabilities, recognize its limitations, and seek appropriate help or resources.

**Robust Feedback Loops**: Mechanisms for systems to learn not just from explicit feedback but from the outcomes of their actions in the world.

**Ethical Agency**: Frameworks for ensuring that autonomous systems operate within appropriate boundaries and remain aligned with human values even as they adapt and learn.

## The Real Promise of Agentic AI

When we talk about AI transforming how we work, learn, and solve problems, we're really talking about the potential of truly agentic systems. Not just smart tools that respond to our requests, but intelligent partners that can maintain long-term goals, learn from experience, and operate autonomously in service of shared objectives.

This isn't science fiction—the building blocks exist today. What we need is clearer thinking about what we're building and why. We need to move beyond the label of "AI Agent" and focus on the underlying capabilities that make systems genuinely useful over time.

The next breakthrough in AI won't just be about larger models or faster inference. It will be about creating systems that combine the planning capabilities of high-agency AI with the learning capabilities of stateful systems, resulting in AI that truly deserves the title "agentic."

Because when we build AI that can genuinely act as our partners—systems that remember, learn, adapt, and pursue goals autonomously—we're not just automating tasks. We're augmenting human intelligence itself.

*The future belongs to agentic AI. But first, we need to understand what that actually means.*

---

**Want to build truly agentic systems?** Start by defining your agency requirements clearly. What decisions should your AI make independently? What memory does it need to be effective over time? How will it learn and adapt? The answers to these questions will guide you toward AI that doesn't just respond—but truly acts.

*Because the difference between a tool and a partner is the ability to grow together.*
      `,
      author: "The Pearadox Team",
      date: "2025-09-25",
      readTime: "18 min read",
      tags: ["AI Agents", "Agentic Systems", "AI Architecture", "Machine Learning", "Autonomous AI", "AI Development"],
      featured: true
    },
    {
      id: 3,
      title: "You Wouldn't Put a Truck Engine in a Ferrari: Building with an AI-First Mindset",
      slug: "ai-first-mindset-ferrari-engine",
      excerpt: "Traditional software development approaches are like putting truck engines in racing cars—they work, but they're fundamentally mismatched. When AI is your engine, everything about how you build, design, and think about products must change.",
      content: `
# You Wouldn't Put a Truck Engine in a Ferrari: Building with an AI-First Mindset

*Why traditional development approaches fail when AI becomes your core engine*

Picture this: You're building the world's most advanced Formula 1 racing car. You have the finest aerodynamic design, the lightest carbon fiber chassis, and precision-engineered components worth millions. But then, instead of installing a high-performance racing engine, you drop in a reliable diesel truck engine.

It would run. It might even be dependable. But it would fundamentally miss the point.

This is exactly what happens when we approach AI-powered products with traditional software development mindsets. We're building Ferraris with truck engines—and wondering why they don't perform like we imagined.

## The Engine Changes Everything

In traditional software development, the "engine" is relatively simple: databases store information, servers process requests, and user interfaces display results. The logic is predictable, the outputs are deterministic, and the user experience flows in linear, well-defined paths.

But when AI becomes your engine, everything changes:

- **Outputs become probabilistic**, not deterministic
- **User interactions become conversational**, not transactional  
- **The system learns and evolves**, rather than following fixed rules
- **Context and nuance matter more** than rigid logic
- **Personalization becomes native**, not an add-on feature

You cannot simply bolt AI capabilities onto a traditionally-designed product any more than you can bolt a rocket engine onto a horse-drawn carriage. The entire architecture—technical, experiential, and conceptual—must be redesigned around this fundamentally different kind of power.

## What AI-First Really Means

Building with an AI-first mindset isn't about using the latest machine learning models or having the most sophisticated algorithms. It's about recognizing that when intelligence becomes your core capability, every other aspect of your product must be reimagined to harness and showcase that intelligence effectively.

### **Traditional Mindset: AI as a Feature**

Most companies approach AI like adding a new feature to an existing product:
- "Let's add a chatbot to our website"
- "Can we use AI to improve our search results?"
- "What if we automated this manual process with machine learning?"

This results in AI that feels bolted-on, disconnected, and often underwhelming. Users interact with it like a novelty rather than a core capability.

### **AI-First Mindset: AI as the Foundation**

AI-first companies start with a fundamentally different question:
- "If intelligence was unlimited and free, how would people solve this problem?"
- "What becomes possible when the system understands context, learns from every interaction, and adapts to individual needs?"
- "How do we design experiences that feel magical because they're genuinely intelligent?"

This leads to products where AI isn't a feature—it's the reason the product exists and the lens through which every design decision is made.

## The Ferrari Architecture: Building for Intelligence

When you're building a Ferrari, every component is designed around performance. The suspension system isn't just about comfort—it's engineered to keep the tires connected to the road at 200 mph. The steering isn't just about turning—it's about providing precise feedback and control under extreme conditions.

Similarly, when building AI-first products, every component must be designed around intelligence:

### **1. Data Architecture: Fuel for Intelligence**

In traditional systems, data is often an afterthought—something you store and occasionally query. In AI-first systems, data is the primary fuel source that must be:

- **Continuously flowing**: Real-time ingestion and processing
- **Richly contextualized**: Not just what happened, but when, why, and how
- **Semantically organized**: Structured for meaning, not just storage
- **Privacy-conscious**: Intelligent without being invasive

**Traditional approach**: "We need a database to store user information"
**AI-first approach**: "We need a continuously learning system that understands user intent and context"

### **2. User Experience: Conversations, Not Transactions**

Traditional interfaces are built around menus, forms, and buttons—discrete actions with predictable outcomes. AI-first interfaces are built around understanding intent and providing intelligent responses.

**Traditional UX flow**:
1. User clicks category
2. System shows filtered results
3. User refines filters
4. System updates results
5. User selects item

**AI-first UX flow**:
1. User expresses intent ("Find me research about climate change solutions")
2. System understands context (user's background, previous interests, current events)
3. System provides personalized, relevant results with explanations
4. User refines through natural language ("More focus on renewable energy")
5. System learns and adapts for future interactions

### **3. Performance Metrics: Intelligence Indicators**

Traditional software measures success through utilitarian metrics: load times, uptime, conversion rates. AI-first products need fundamentally different success indicators:

- **Understanding accuracy**: How well does the system comprehend user intent?
- **Relevance over time**: Do recommendations improve with more data?
- **Contextual appropriateness**: Does the AI respond appropriately to different situations?
- **Learning velocity**: How quickly does the system adapt to new patterns?
- **User confidence**: Do users trust the AI's suggestions and explanations?

## Real-World AI-First Architecture: Pearadox as a Case Study

Let's examine how an AI-first mindset shapes a real product. Take Pearadox—our platform for democratizing research understanding. A traditional approach might build:

- A database of research papers
- A search interface with filters
- User accounts with saved papers
- Email notifications for new content

But with an AI-first mindset, every component is reimagined:

### **Intelligent Content Understanding**
Instead of storing papers as text files, we create AI-powered understanding layers:
- **Automatic summarization** at different expertise levels
- **Concept extraction** and relationship mapping
- **Real-time relevance scoring** based on current events and user interests
- **Cross-paper connection identification** for related research

### **Adaptive User Interfaces**
Rather than static search and filter interfaces:
- **Natural language queries**: "Show me recent breakthroughs in renewable energy storage"
- **Contextual recommendations**: Papers suggested based on reading history, expertise level, and current research trends
- **Progressive disclosure**: Complex papers broken down based on user's demonstrated understanding
- **Intelligent formatting**: Content presentation adapted to individual learning styles

### **Predictive Content Curation**
Instead of reactive content updates:
- **Trend anticipation**: Identifying emerging research areas before they become mainstream
- **Personalized research paths**: Suggesting learning sequences that build knowledge progressively
- **Collaborative intelligence**: Learning from the community to improve recommendations for everyone

## The Compound Effect of AI-First Design

When every component of your product is designed around intelligence, you don't just get additive improvements—you get compound effects that create experiences that feel genuinely magical.

### **Traditional Product Evolution**:
Version 1.0: Basic functionality
Version 2.0: Add features
Version 3.0: Improve performance
Version 4.0: Polish interface

### **AI-First Product Evolution**:
Version 1.0: Basic intelligence
Version 2.0: Intelligence learns and improves automatically
Version 3.0: Intelligence becomes predictive and proactive
Version 4.0: Intelligence creates emergent capabilities nobody explicitly programmed

The difference is profound. Traditional products require manual improvements and feature additions. AI-first products become more capable over time through use, creating value that increases exponentially rather than linearly.

## Common AI-First Design Patterns

Successful AI-first products tend to follow certain architectural patterns that maximize the potential of intelligent systems:

### **1. The Learning Loop**
Every user interaction becomes a learning opportunity:
- **Capture**: What did the user do?
- **Understand**: Why did they do it?
- **Predict**: What might they want next?
- **Improve**: How can we serve them better?
- **Generalize**: How does this help other users?

### **2. Progressive Intelligence**
Start simple but design for complexity:
- **Level 1**: Basic pattern recognition
- **Level 2**: Context awareness
- **Level 3**: Predictive capabilities
- **Level 4**: Proactive assistance
- **Level 5**: Creative collaboration

### **3. Explainable Intelligence**
AI-first doesn't mean AI-only:
- **Show your work**: Explain why the AI made specific recommendations
- **Provide controls**: Let users adjust and correct the AI's understanding
- **Maintain transparency**: Be clear about what the AI can and cannot do
- **Enable human override**: Never make the AI the final decision maker for important choices

### **4. Collaborative Intelligence**
The best AI-first products make humans and AI better together:
- **Human intuition + AI computation**: Combining emotional intelligence with processing power
- **AI pattern recognition + Human creativity**: Using AI to identify opportunities for human innovation
- **Human judgment + AI scale**: Applying human wisdom at machine-scale reach

## Avoiding the Truck Engine Trap

The biggest mistake in AI-first development is trying to apply traditional software development approaches to intelligent systems. Here are the most common traps and how to avoid them:

### **Trap 1: Feature Thinking**
**Wrong**: "Let's add AI to our existing product"
**Right**: "Let's reimagine this problem assuming infinite intelligence"

### **Trap 2: Deterministic Expectations**
**Wrong**: Designing interfaces that expect predictable, consistent outputs
**Right**: Designing for probabilistic systems that improve over time

### **Trap 3: Static Architecture**
**Wrong**: Building fixed systems that require manual updates
**Right**: Creating adaptive architectures that evolve automatically

### **Trap 4: Human vs. AI Competition**
**Wrong**: Trying to replace human capabilities with AI
**Right**: Designing AI to amplify and enhance human capabilities

### **Trap 5: Black Box Implementation**
**Wrong**: Hiding AI decision-making from users
**Right**: Making AI reasoning transparent and controllable

## The Competitive Advantage of AI-First

Companies that truly embrace AI-first thinking don't just build better products—they create entirely new categories of value that traditional approaches cannot match:

### **Network Effects Through Intelligence**
Traditional network effects come from user adoption. AI-first network effects come from collective intelligence—the more people use the system, the smarter it becomes for everyone.

### **Personalization at Scale**
Traditional personalization requires manual segmentation and rule-based customization. AI-first personalization creates unique experiences for every user automatically.

### **Proactive Value Creation**
Traditional products wait for users to request features. AI-first products anticipate needs and create value before users even realize they need it.

### **Continuous Product Evolution**
Traditional products require manual updates and feature releases. AI-first products improve continuously through use, creating compound competitive advantages.

## Building Your AI-First Team

Creating AI-first products requires teams that think differently about technology, user experience, and product development:

### **Essential AI-First Roles**:
- **AI Product Managers**: Who understand both technology capabilities and user needs
- **Data Experience Designers**: Who can design interfaces for probabilistic systems
- **Machine Learning Engineers**: Who can build systems that learn and adapt
- **AI Ethics Specialists**: Who ensure responsible development and deployment
- **User Researchers**: Who understand how people interact with intelligent systems

### **AI-First Culture Principles**:
- **Experimentation over perfection**: AI systems improve through iteration
- **Learning over knowing**: Success comes from continuous adaptation
- **Collaboration over competition**: Humans and AI achieve more together
- **Transparency over mystery**: Users should understand and control AI decisions
- **Empowerment over replacement**: AI should make humans more capable, not obsolete

## The Future is AI-First

We're still in the early days of the AI revolution, and most companies are still putting truck engines in their Ferraris. But increasingly, the winners will be those who recognize that when your engine is intelligent, everything else must be redesigned around that intelligence.

This isn't just about building better software—it's about reimagining what becomes possible when intelligence is abundant, accessible, and integrated into every aspect of how we solve problems.

### **What AI-First Success Looks Like**:
- Products that become more valuable the more you use them
- Experiences that feel personalized without being invasive
- Interfaces that understand intent, not just commands
- Systems that solve problems you didn't know you had
- Technology that makes you more capable, creative, and confident

## Your AI-First Journey

Whether you're building a new product from scratch or evolving an existing one, the transition to AI-first thinking starts with asking different questions:

Instead of *"What features should we build?"* ask *"What becomes possible when this system understands context and learns from every interaction?"*

Instead of *"How can we make this process more efficient?"* ask *"How can we make this experience more intelligent?"*

Instead of *"What do users want?"* ask *"What do users need that they don't even know to ask for?"*

The companies that answer these questions well won't just build better products—they'll define entirely new categories of human-computer collaboration.

## The Ferrari You're Building

Your AI-powered product isn't just software with some machine learning sprinkled on top. It's a Ferrari—a precision instrument designed around the incredible power of artificial intelligence.

Every line of code, every design decision, every user interaction should be optimized for one thing: unleashing the full potential of intelligent systems to create value that was impossible before.

You wouldn't put a truck engine in a Ferrari.

Don't put traditional thinking in your AI-first product.

The future belongs to those who build around intelligence—not those who bolt intelligence onto what they built before.

*What Ferrari are you building?*

---

**Ready to embrace AI-first thinking?** The tools exist, the opportunities are endless, and the time is now. Whether you're reimagining an existing product or starting fresh, the principles of AI-first design will determine not just your success, but the kind of impact you can have on the world.

*Because when intelligence becomes your engine, everything becomes possible.*
      `,
      author: "The Pearadox Team",
      date: "2025-09-10",
      readTime: "15 min read",
      tags: ["AI-First Design", "Product Development", "Architecture", "Strategy", "Innovation", "Technology"],
      featured: false
    },
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
      featured: false
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
        {/* Hero Section */}
        <section className="py-12 sm:py-20">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
            <div 
              className={`transform transition-all duration-1000 ${
                isVisible.hero ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
              }`}
            >
              <div className="max-w-5xl mx-auto">
                {/* Main Header */}
                <div className="text-center mb-8">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-6 shadow-lg" style={{ backgroundColor: '#1db954' }}>
                    <BookOpen className="h-8 w-8 text-white" />
                  </div>
                  
                  <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-4">
                    <span className="text-gray-900">Pearadox</span>
                    <span className="text-gray-900"> Blog</span>
                  </h1>
                  
                  <p className="text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">
                    Insights, perspectives, and stories about democratizing AI research and making complex science accessible to everyone.
                  </p>
                </div>

                {/* Category Pills */}
                <div className="flex flex-wrap items-center justify-center gap-3">
                  <div className="group flex items-center px-4 py-2 bg-white rounded-full shadow-sm border border-gray-100 hover:shadow-md hover:border-gray-200 transition-all duration-300 cursor-pointer">
                    <div className="w-2 h-2 rounded-full mr-3 group-hover:scale-110 transition-transform" style={{ backgroundColor: '#1db954' }}></div>
                    <Brain className="h-4 w-4 mr-2" style={{ color: '#1db954' }} />
                    <span className="text-sm font-medium text-gray-700">Research Insights</span>
                  </div>
                  
                  <div className="group flex items-center px-4 py-2 bg-white rounded-full shadow-sm border border-gray-100 hover:shadow-md hover:border-gray-200 transition-all duration-300 cursor-pointer">
                    <div className="w-2 h-2 rounded-full mr-3 group-hover:scale-110 transition-transform" style={{ backgroundColor: '#1db954' }}></div>
                    <Globe className="h-4 w-4 mr-2" style={{ color: '#1db954' }} />
                    <span className="text-sm font-medium text-gray-700">Global Impact</span>
                  </div>
                  
                  <div className="group flex items-center px-4 py-2 bg-white rounded-full shadow-sm border border-gray-100 hover:shadow-md hover:border-gray-200 transition-all duration-300 cursor-pointer">
                    <div className="w-2 h-2 rounded-full mr-3 group-hover:scale-110 transition-transform" style={{ backgroundColor: '#1db954' }}></div>
                    <Users className="h-4 w-4 mr-2" style={{ color: '#1db954' }} />
                    <span className="text-sm font-medium text-gray-700">Community Stories</span>
                  </div>
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
                    <div className="px-6 py-2" style={{ backgroundColor: '#1db954' }}>
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
                          className="px-2 sm:px-3 py-1 bg-gray-100 text-gray-700 text-xs sm:text-sm rounded-full font-medium"
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
                      className="inline-flex items-center px-6 py-3 text-white font-semibold rounded-xl hover:shadow-lg transition-all duration-300 transform hover:scale-105"
                      style={{ backgroundColor: '#1db954' }}
                      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#16a14a'}
                      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#1db954'}
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
                  className="inline-flex items-center transition-colors group"
                  style={{ color: '#1db954' }}
                  onMouseEnter={(e) => e.currentTarget.style.color = '#16a14a'}
                  onMouseLeave={(e) => e.currentTarget.style.color = '#1db954'}
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
