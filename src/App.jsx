import React, { useState, useMemo, useEffect, useRef } from 'react';
import { BookOpen, Loader2, AlertCircle, Search, Filter, Bookmark, Brain, Eye, Bot, Wrench, Code, ChevronLeft, ChevronRight, Cpu, Zap, Shield, Microscope, Network, Database, Globe, Smartphone, Camera, FileText, Users, TrendingUp, BarChart, Settings, Lightbulb, Atom, Dna, Activity, Monitor, Wifi, ArrowRight, User, UserPlus, Unlock, Target, Clock, Building2, MessageCircle, Smartphone as SmartphoneIcon, CheckCircle } from 'lucide-react';
import Header from './components/Header';
import ArticleCard from './components/ArticleCard';
import ArticleModal from './components/ArticleModal';
import SavedArticles from './components/SavedArticles';
import AccountModal from './components/AccountModal';
import Footer from './components/Footer';
import ContactModal from './components/ContactModal';
import { arxivAPI, authAPI, savedArticlesAPI, supabase } from './lib/supabase';

// Comprehensive category to icon mapping
const getCategoryIcon = (categoryName) => {
  const iconMap = {
    // AI & Machine Learning
    'Artificial Intelligence': Bot,
    'Machine Learning': Brain,
    'Deep Learning': Network,
    'Neural Networks': Network,
    'Reinforcement Learning': TrendingUp,
    'Supervised Learning': BarChart,
    'Unsupervised Learning': Lightbulb,
    
    // Computer Vision & Graphics
    'Computer Vision': Eye,
    'Computer Vision and Pattern Recognition': Eye,
    'Image Processing': Camera,
    'Computer Graphics': Monitor,
    'Pattern Recognition': Eye,
    'Graphics': Monitor,
    'Multimedia': Camera,
    
    // Natural Language & Communication
    'Natural Language Processing': Code,
    'Computation and Language': Code,
    'Natural Language': Code,
    'Speech Recognition': Smartphone,
    'Text Mining': FileText,
    'Language Models': FileText,
    'Computational Linguistics': Code,
    'Information Extraction': FileText,
    
    // Robotics & Systems
    'Robotics': Wrench,
    'Human-Computer Interaction': Users,
    'Systems and Control': Settings,
    'Autonomous Systems': Cpu,
    'Control Systems': Settings,
    'Automation': Wrench,
    
    // Computing & Technology
    'Distributed Computing': Network,
    'Parallel Computing': Cpu,
    'Cloud Computing': Globe,
    'Edge Computing': Zap,
    'Quantum Computing': Atom,
    'High Performance Computing': Cpu,
    'Grid Computing': Network,
    'Ubiquitous Computing': Smartphone,
    'Mobile Computing': Smartphone,
    'Embedded Systems': Cpu,
    
    // Security & Privacy
    'Cryptography and Security': Shield,
    'Computer Security': Shield,
    'Privacy': Shield,
    'Network Security': Wifi,
    'Information Security': Shield,
    'Cybersecurity': Shield,
    
    // Data & Information
    'Information Retrieval': Database,
    'Data Mining': BarChart,
    'Information Theory': FileText,
    'Knowledge Representation': Brain,
    'Databases': Database,
    'Data Science': BarChart,
    'Big Data': Database,
    'Data Analytics': TrendingUp,
    'Information Systems': Database,
    
    // Interdisciplinary & Applied
    'Computational Biology': Dna,
    'Bioinformatics': Microscope,
    'Medical Informatics': Activity,
    'Digital Libraries': BookOpen,
    'Social Networks': Users,
    'Human Factors': Users,
    'E-commerce': Globe,
    'E-learning': BookOpen,
    'Digital Humanities': BookOpen,
    'Computational Finance': TrendingUp,
    'Computational Physics': Atom,
    'Computational Chemistry': Atom,
    
    // Theory & Methods
    'Computational Complexity': Brain,
    'Algorithms': Settings,
    'Data Structures': Database,
    'Mathematical Optimization': TrendingUp,
    'Statistics': BarChart,
    'Logic': Brain,
    'Formal Methods': Settings,
    'Theoretical Computer Science': Brain,
    'Discrete Mathematics': BarChart,
    
    // Software & Engineering
    'Software Engineering': Code,
    'Programming Languages': Code,
    'Computer Architecture': Cpu,
    'Operating Systems': Monitor,
    'Compilers': Code,
    'Software Development': Code,
    'Web Technologies': Globe,
    'Internet Technologies': Wifi,
    
    // Networking & Communications
    'Computer Networks': Network,
    'Wireless Networks': Wifi,
    'Network Protocols': Network,
    'Telecommunications': Smartphone,
    'Signal Processing': Activity,
    'Communications': Wifi,
    
    // Specialized Areas
    'Game Development': Monitor,
    'Virtual Reality': Eye,
    'Augmented Reality': Camera,
    'Simulation': Monitor,
    'Modeling': BarChart,
    'Visualization': Eye,
    'User Interface Design': Users,
    'Digital Signal Processing': Activity,
    'Image Analysis': Camera,
    'Computer Animation': Monitor,
    
    // Default fallbacks based on common keywords
    'General': BookOpen,
    'Other': Lightbulb,
    'Technology': Cpu,
    'Science': Microscope,
    'Research': BookOpen,
    'Analysis': BarChart,
    'Design': Users,
    'Development': Code,
    'Management': Settings,
    'Innovation': Lightbulb
  };
  
  // First, try exact match
  if (iconMap[categoryName]) {
    return iconMap[categoryName];
  }
  
  // If no exact match, try partial matching for compound categories
  const lowerCategoryName = categoryName.toLowerCase();
  
  // Check for key terms in the category name
  if (lowerCategoryName.includes('machine learning') || lowerCategoryName.includes('ml')) return Brain;
  if (lowerCategoryName.includes('artificial intelligence') || lowerCategoryName.includes('ai')) return Bot;
  if (lowerCategoryName.includes('computer vision') || lowerCategoryName.includes('vision')) return Eye;
  if (lowerCategoryName.includes('natural language') || lowerCategoryName.includes('nlp') || lowerCategoryName.includes('language')) return Code;
  if (lowerCategoryName.includes('robotics') || lowerCategoryName.includes('robot')) return Wrench;
  if (lowerCategoryName.includes('quantum')) return Atom;
  if (lowerCategoryName.includes('security') || lowerCategoryName.includes('crypto')) return Shield;
  if (lowerCategoryName.includes('network') || lowerCategoryName.includes('distributed')) return Network;
  if (lowerCategoryName.includes('database') || lowerCategoryName.includes('data')) return Database;
  if (lowerCategoryName.includes('image') || lowerCategoryName.includes('graphics')) return Camera;
  if (lowerCategoryName.includes('web') || lowerCategoryName.includes('internet')) return Globe;
  if (lowerCategoryName.includes('mobile') || lowerCategoryName.includes('wireless')) return Smartphone;
  if (lowerCategoryName.includes('algorithm') || lowerCategoryName.includes('optimization')) return Settings;
  if (lowerCategoryName.includes('statistics') || lowerCategoryName.includes('analytics')) return BarChart;
  if (lowerCategoryName.includes('bio') || lowerCategoryName.includes('medical')) return Microscope;
  if (lowerCategoryName.includes('user') || lowerCategoryName.includes('human')) return Users;
  if (lowerCategoryName.includes('software') || lowerCategoryName.includes('programming')) return Code;
  if (lowerCategoryName.includes('system') || lowerCategoryName.includes('computing')) return Cpu;
  
  // Final fallback: use a variety of icons instead of always Brain
  const fallbackIcons = [Settings, Database, Code, Network, Cpu, Globe, FileText, TrendingUp, BarChart, Lightbulb];
  const hash = categoryName.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return fallbackIcons[hash % fallbackIcons.length];
};

// Generate category color based on index (fixed 5 colors)
const getCategoryColor = (categoryName, index = 0) => {
  const colorSchemes = [
    'bg-blue-50 hover:bg-blue-100 border-blue-200',      // Blue
    'bg-purple-50 hover:bg-purple-100 border-purple-200', // Purple  
    'bg-green-50 hover:bg-green-100 border-green-200',    // Green
    'bg-orange-50 hover:bg-orange-100 border-orange-200', // Orange
    'bg-pink-50 hover:bg-pink-100 border-pink-200'        // Pink/Red
  ];
  
  // Use index to cycle through the 5 colors
  return colorSchemes[index % 5];
};

// Shorten category names for display
const shortenCategoryName = (categoryName) => {
  const shorteningMap = {
    'Computer Vision and Pattern Recognition': 'Computer Vision',
    'Computation and Language': 'Natural Language',
    'Natural Language Processing': 'Natural Language',
    'Human-Computer Interaction': 'HCI',
    'Cryptography and Security': 'Security',
    'Information Retrieval': 'Info Retrieval',
    'High Performance Computing': 'HPC',
    'Computational Biology': 'Comp Biology',
    'Mathematical Optimization': 'Optimization',
    'Computational Complexity': 'Complexity',
    'Distributed Computing': 'Distributed',
    'Machine Learning Theory': 'ML Theory'
  };
  
  return shorteningMap[categoryName] || categoryName;
};

function App() {
  const [selectedArticle, setSelectedArticle] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [favorites, setFavorites] = useState(new Set());
  const [isSavedArticlesOpen, setIsSavedArticlesOpen] = useState(false);
  const [isAccountOpen, setIsAccountOpen] = useState(false);
  const [isContactOpen, setIsContactOpen] = useState(false);
  
  // User state for authentication and skill level
  const [user, setUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [userSkillLevel, setUserSkillLevel] = useState('Beginner');
  const [userResearchInterests, setUserResearchInterests] = useState([]);
  
  // Default research interests fallback
  const defaultResearchInterests = [
    'Machine Learning',
    'Artificial Intelligence', 
    'Computer Vision and Pattern Recognition',
    'Robotics',
    'Computation and Language'
  ];
  
  // Data state
  const [articles, setArticles] = useState([]);
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [savedArticlesFromDB, setSavedArticlesFromDB] = useState([]);
  const [isLoadingSavedArticles, setIsLoadingSavedArticles] = useState(false);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const articlesPerPage = 30; // Show 50 articles per page (30 pages for 1500 articles)

  // Ref for scrolling to results
  const resultsRef = useRef(null);

  // Handle shared article URLs
  useEffect(() => {
    const handleSharedArticle = () => {
      const path = window.location.pathname;
      const articleMatch = path.match(/\/article\/(\d+)/);
      
      if (articleMatch) {
        const articleId = parseInt(articleMatch[1]);
        console.log('📤 Shared article ID detected:', articleId);
        
        // Wait for articles to load, then open the modal
        const checkArticles = () => {
          if (articles.length > 0) {
            const sharedArticle = articles.find(article => article.id === articleId);
            if (sharedArticle) {
              console.log('📖 Opening shared article:', sharedArticle.title);
              setSelectedArticle(sharedArticle);
              setIsModalOpen(true);
              
              // Update page title and meta tags
              updatePageMeta(sharedArticle);
            } else {
              console.warn('⚠️ Shared article not found:', articleId);
            }
          } else if (!isLoading) {
            console.warn('⚠️ No articles loaded and not loading');
          }
        };
        
        if (articles.length > 0) {
          checkArticles();
        } else {
          // Check again after a short delay if articles are still loading
          const timer = setTimeout(checkArticles, 1000);
          return () => clearTimeout(timer);
        }
      }
    };

    handleSharedArticle();
  }, [articles, isLoading]);

  // Update page meta tags for shared articles
  const updatePageMeta = (article) => {
    if (article) {
      // Update page title
      document.title = `${article.title} | Pearadox`;
      
      // Update or create meta tags with more robust handling
      const updateMetaTag = (property, content, isName = false, isItemprop = false) => {
        let selector;
        if (isName) {
          selector = `meta[name="${property}"]`;
        } else if (isItemprop) {
          selector = `meta[itemprop="${property}"]`;
        } else {
          selector = `meta[property="${property}"]`;
        }
        
        let meta = document.querySelector(selector);
        
        if (!meta) {
          meta = document.createElement('meta');
          if (isName) {
            meta.setAttribute('name', property);
          } else if (isItemprop) {
            meta.setAttribute('itemprop', property);
          } else {
            meta.setAttribute('property', property);
          }
          document.head.appendChild(meta);
        }
        
        meta.setAttribute('content', content);
      };

      // Update page title meta tag
      updateMetaTag('title', `${article.title} | Pearadox`, true);
      updateMetaTag('description', article.shortDescription, true);

      // Update Open Graph tags for social media
      updateMetaTag('og:title', `${article.title} | Pearadox`);
      updateMetaTag('og:description', article.shortDescription);
      updateMetaTag('og:url', `${window.location.origin}/article/${article.id}`);
      updateMetaTag('og:type', 'article');
      updateMetaTag('og:site_name', 'Pearadox');
      
      // Update Twitter Card tags
      updateMetaTag('twitter:card', 'summary_large_image', true);
      updateMetaTag('twitter:title', `${article.title} | Pearadox`, true);
      updateMetaTag('twitter:description', article.shortDescription, true);
      updateMetaTag('twitter:site', '@pearadox', true);
      
      // Keep the same image as the main site
      const imageUrl = `${window.location.origin}/logo512.png`;
      updateMetaTag('og:image', imageUrl);
      updateMetaTag('og:image:width', '512');
      updateMetaTag('og:image:height', '512');
      updateMetaTag('og:image:type', 'image/png');
      updateMetaTag('twitter:image', imageUrl, true);
      
      // Additional structured data
      updateMetaTag('name', `${article.title} | Pearadox`, false, true);
      updateMetaTag('description', article.shortDescription, false, true);
      
      console.log('📄 Updated meta tags for article:', article.title);
    }
  };

  // Check user authentication and load their skill level
  useEffect(() => {
    const checkAuth = async () => {
      try {
        if (authAPI && typeof authAPI.getCurrentSession === 'function') {
          const { data: { session } } = await authAPI.getCurrentSession();
          if (session?.user) {
            setUser(session.user);
            
            // Load user profile to get skill level
            try {
              if (authAPI.getProfile) {
                const profile = await authAPI.getProfile(session.user.id);
                if (profile) {
                  setUserProfile(profile); // Store the full profile
                  console.log('👤 User profile loaded:', profile);
                  console.log('👤 User full_name:', profile.full_name);
                  const skillLevel = profile.skill_level || 'Beginner';
                  setUserSkillLevel(skillLevel);
                  console.log('👤 User skill level:', skillLevel);
                  
                  // Load user's research interests (limit to 5)
                  const researchInterests = profile.research_interests || defaultResearchInterests;
                  const userInterests = Array.isArray(researchInterests) 
                    ? researchInterests.slice(0, 5)
                    : defaultResearchInterests;
                  
                  // Ensure we always have exactly 5 interests
                  while (userInterests.length < 5) {
                    const remaining = defaultResearchInterests.filter(interest => !userInterests.includes(interest));
                    if (remaining.length > 0) {
                      userInterests.push(remaining[0]);
                    } else {
                      break;
                    }
                  }
                  
                  setUserResearchInterests(userInterests);
                  console.log('🔬 User research interests:', userInterests);
                }
              }
            } catch (profileError) {
              console.error('Error loading user profile:', profileError);
              setUserSkillLevel('Beginner'); // Default fallback
              setUserResearchInterests(defaultResearchInterests);
            }
          } else {
            setUser(null);
            setUserSkillLevel('Beginner'); // Default for non-authenticated users
            setUserResearchInterests(defaultResearchInterests);
          }
        }
      } catch (error) {
        console.error('Auth check error:', error);
        setUser(null);
        setUserSkillLevel('Beginner');
      }
    };

    checkAuth();
  }, []);

  // Simple auth listener for CTA updates only
  useEffect(() => {
    if (!authAPI || typeof authAPI.onAuthStateChange !== 'function') return;

    const { data: { subscription } } = authAPI.onAuthStateChange((event, session) => {
      console.log('🔄 Auth changed for CTA:', event);
      
      if (event === 'SIGNED_IN' && session?.user) {
        setUser(session.user);
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
        setUserProfile(null);
      }
    });

    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  // Load data from Supabase with skill-level specific summaries
  useEffect(() => {
    loadData();
  }, [userSkillLevel]); // Reload when skill level changes

  // Load user's saved articles
  useEffect(() => {
    if (user) {
      loadUserSavedArticles();
    } else {
      // Clear saved articles when user logs out
      setSavedArticlesFromDB([]);
      setFavorites(new Set());
    }
  }, [user, userSkillLevel]); // Depend on user and skill level

  // Scroll to results when category is selected
  useEffect(() => {
    if (selectedCategory && resultsRef.current) {
      const headerHeight = 80; // Account for fixed header height
      const elementPosition = resultsRef.current.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - headerHeight;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
  }, [selectedCategory]);

  // Function to scroll to articles section
  const scrollToArticles = () => {
    const categoriesSection = document.getElementById('categories-section');
    if (categoriesSection) {
      const headerHeight = 80; // Account for fixed header height
      const elementPosition = categoriesSection.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - headerHeight;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
  };

  const loadData = async () => {
    console.log('🚀 Loading data from Supabase with skill level:', userSkillLevel);
    setIsLoading(true);
    setError(null);
    
    try {
      // Calculate date 2 weeks ago
      const twoWeeksAgo = new Date();
      twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);
      const twoWeeksAgoISO = twoWeeksAgo.toISOString();
      
      console.log('📡 Loading articles from last 2 weeks with skill-level summaries...');
      console.log('📅 Fetching articles published after:', twoWeeksAgoISO);
      
      // Try to get papers with skill-level summaries first
      let papersData;
      try {
        papersData = await arxivAPI.getAllPapersWithSummaries(userSkillLevel);
        console.log(`📝 Loaded ${papersData.length} papers with summaries`);
      } catch (summaryError) {
        console.log('⚠️ Failed to load summaries, falling back to basic papers');
        papersData = await arxivAPI.getAllPapers();
      }
      
      // Filter for papers from last 2 weeks
      const recentPapers = papersData.filter(paper => {
        const paperDate = paper.published_date || paper.created_at;
        if (!paperDate) return false;
        
        const publishedDate = new Date(paperDate);
        return publishedDate >= twoWeeksAgo;
      });
      
      console.log(`📅 Found ${recentPapers.length} papers from last 2 weeks`);
      
      if (recentPapers.length === 0) {
        console.log('⚠️ No recent papers found, showing latest available papers');
        // If no papers from last 2 weeks, show the most recent ones
        const sortedPapers = papersData.sort((a, b) => {
          const dateA = new Date(a.published_date || a.created_at || 0);
          const dateB = new Date(b.published_date || b.created_at || 0);
          return dateB - dateA;
        });
        papersData = sortedPapers.slice(0, 500); // Show latest 500 papers
      } else {
        papersData = recentPapers;
      }
      
      // Transform papers to article format with skill-level aware content
      const transformedArticles = papersData.map(paper => ({
        id: paper.id,
        // Use skill-level specific title if available, otherwise simplify original
        title: paper.summaryTitle || simplifyTitle(paper.title || 'Untitled'),
        // Use skill-level specific overview if available, otherwise simplify abstract  
        shortDescription: paper.summaryOverview || simplifyDescription(paper.abstract || 'No description available'),
        originalTitle: paper.title || 'Untitled',
        originalAbstract: paper.abstract || 'No abstract available',
        // Add skill-level specific summary content
        summaryContent: paper.summaryContent || null,
        hasSummary: !!(paper.summaryTitle || paper.summaryOverview || paper.summaryContent),
        skillLevel: paper.skillLevel || userSkillLevel,
        category: Array.isArray(paper.categories_name) && paper.categories_name.length > 0 
          ? paper.categories_name[0] 
          : 'General',
        categories: Array.isArray(paper.categories_name) ? paper.categories_name : [paper.categories_name || 'General'],
        subjectClasses: Array.isArray(paper.categories) ? paper.categories : [paper.categories || 'general'],
        categoriesName: Array.isArray(paper.categories_name) && paper.categories_name.length > 0 
          ? paper.categories_name[0] 
          : 'General',
        arxivId: paper.arxiv_id || '',
        url: paper.pdf_url || paper.abstract_url || `https://arxiv.org/pdf/${paper.arxiv_id}`,
        authors: Array.isArray(paper.authors) ? paper.authors.join(', ') : (paper.authors || 'Unknown Authors'),
        publishedDate: formatDate(paper.published_date || paper.created_at),
        tags: generateTags(paper.categories_name, paper.title, paper.abstract),
        _original: paper
      }));
      
      setArticles(transformedArticles);
      
      // Load categories
      try {
        const categoriesData = await arxivAPI.getCategories();
      setCategories(categoriesData);
        console.log(`📋 Loaded ${categoriesData.length} categories`);
      } catch (categoryError) {
        console.log('⚠️ Failed to load categories, generating from articles');
        // Generate categories from articles as fallback
        const categorySet = new Set();
        transformedArticles.forEach(article => {
          article.categories.forEach(cat => categorySet.add(cat));
        });
        
        const basicCategories = Array.from(categorySet).map(categoryName => ({
          subject_class: categoryName.toLowerCase().replace(/\s+/g, '_'),
          category_name: categoryName
        }));
        
        setCategories(basicCategories);
      }
      
      console.log(`✅ App loaded successfully with ${transformedArticles.length} articles`);
      console.log(`📝 Articles with skill-level summaries: ${transformedArticles.filter(a => a.hasSummary).length}`);
      
    } catch (err) {
      console.error('💥 Error loading data:', err);
      setError('Unable to connect to the database. Please check your internet connection and try again.');
      
      // Ultimate fallback: show some demo data so the app isn't completely broken
      const demoArticles = [
        {
          id: 1,
          title: 'Demo Article: AI Research Loading...',
          shortDescription: 'We are currently loading the latest AI research papers. Please check your internet connection and try refreshing the page.',
          originalTitle: 'Demo Article',
          originalAbstract: 'Demo abstract',
          summaryContent: null,
          hasSummary: false,
          skillLevel: userSkillLevel,
          category: 'Machine Learning',
          categories: ['Machine Learning'],
          subjectClasses: ['machine_learning'],
          categoriesName: 'Machine Learning',
          arxivId: 'demo',
          url: '#',
          authors: 'Pearadox Team',
          publishedDate: formatDate(new Date().toISOString()),
          tags: ['Demo'],
          _original: {}
        }
      ];
      
      setArticles(demoArticles);
      setCategories([{ subject_class: 'machine_learning', category_name: 'Machine Learning' }]);
      
    } finally {
      setIsLoading(false);
    }
  };

  const loadUserSavedArticles = async () => {
    if (!user || !savedArticlesAPI) {
      console.log('❌ Cannot load saved articles: no user or API');
      setSavedArticlesFromDB([]);
      setFavorites(new Set());
      setIsLoadingSavedArticles(false);
      return;
    }

    setIsLoadingSavedArticles(true);
    try {
      console.log('📚 Loading saved articles for user:', user.id, 'with skill level:', userSkillLevel);
      
      // Get saved articles with full details directly from database
      const savedArticlesWithDetails = await savedArticlesAPI.getUserSavedArticlesWithDetails(user.id, userSkillLevel);
      console.log('📚 Loaded saved articles with details:', savedArticlesWithDetails.length);
      console.log('📚 Sample article data from API:', savedArticlesWithDetails.slice(0, 1).map(a => ({ 
        id: a.id, 
        title: a.title?.substring(0, 50), 
        shortDescription: a.shortDescription?.substring(0, 50),
        hasSummary: a.hasSummary,
        skillLevel: a.skillLevel
      })));
      
      // Get just the IDs for the favorites set (for heart icons in main feed)
      const savedArticleIds = savedArticlesWithDetails.map(article => article.id);
      
      // Update favorites Set for heart icons (ensure same type as article IDs)
      const favoriteIds = new Set(savedArticleIds.map(id => {
        // Ensure the ID type matches what the articles use
        return typeof id === 'string' ? parseInt(id) || id : id;
      }));
      setFavorites(favoriteIds);
      
      // The savedArticlesWithDetails already comes properly formatted from the API
      // Just need to add missing fields that the UI expects without overriding skill-level content
      const formattedSavedArticles = savedArticlesWithDetails.map(article => ({
        ...article,
        // Only add missing fields, don't override existing skill-level content
        subjectClasses: Array.isArray(article.categories) ? article.categories : [article.categories || 'general'],
        tags: article.tags || generateTags(article.categories_name, article.title, article.abstract),
        _original: article
      }));
      
      console.log('📚 Formatted saved articles:', formattedSavedArticles.length);
      console.log('📚 Sample saved articles:', formattedSavedArticles.slice(0, 2).map(a => ({ id: a.id, title: a.title?.substring(0, 30), savedAt: a.savedAt })));
      
      setSavedArticlesFromDB(formattedSavedArticles);
      
    } catch (error) {
      console.error('❌ Error loading saved articles:', error);
      setSavedArticlesFromDB([]);
    } finally {
      setIsLoadingSavedArticles(false);
    }
  };

  // Helper functions
  const simplifyTitle = (title) => {
    return title
      .replace(/^(A|An|The)\s+/i, '')
      .replace(/:\s*.*$/, '')
      .replace(/\b(Novel|New|Improved|Enhanced|Advanced|Efficient)\b/gi, '')
      .trim();
  };

  const simplifyDescription = (abstract) => {
    const sentences = abstract.split(/[.!?]+/);
    const firstSentence = sentences[0]?.trim();
    
    if (!firstSentence) return abstract.substring(0, 200) + '...';
    
    return firstSentence
      .replace(/\b(methodology|framework|paradigm|algorithm)\b/gi, 'approach')
      .replace(/\b(demonstrate|illustrate|show)\b/gi, 'prove')
      .replace(/\b(significant|substantial|considerable)\b/gi, 'major')
      .replace(/\b(state-of-the-art|cutting-edge)\b/gi, 'advanced')
      + '.';
  };

  const formatDate = (dateString) => {
    if (!dateString) return new Date().toISOString().split('T')[0];
    
    try {
      const date = new Date(dateString);
      // Format as UTC date to show the actual published date from database
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        timeZone: 'UTC' // Force UTC timezone
      });
    } catch {
      return new Date().toISOString().split('T')[0];
    }
  };

  const generateTags = (categories, title, abstract) => {
    const tags = [];
    
    // Add categories as tags
    if (Array.isArray(categories)) {
      tags.push(...categories);
    } else if (categories) {
      tags.push(categories);
    }
    
    const content = `${title} ${abstract}`.toLowerCase();
    const keywordMap = {
      'AI': ['artificial intelligence', 'machine learning', 'neural network'],
      'Deep Learning': ['deep learning', 'CNN', 'transformer'],
      'Computer Vision': ['computer vision', 'image', 'visual'],
      'NLP': ['natural language', 'text', 'language model'],
      'Quantum': ['quantum', 'qubit'],
      'Robotics': ['robot', 'autonomous'],
      'Security': ['security', 'encryption', 'privacy']
    };
    
    Object.entries(keywordMap).forEach(([tag, keywords]) => {
      if (keywords.some(keyword => content.includes(keyword))) {
        tags.push(tag);
      }
    });
    
    return [...new Set(tags)];
  };

  const filteredArticles = useMemo(() => {
    const filtered = articles.filter(article => {
      const matchesSearch = searchTerm === '' || 
        article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        article.shortDescription.toLowerCase().includes(searchTerm.toLowerCase()) ||
        article.originalTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
        article.authors.toLowerCase().includes(searchTerm.toLowerCase()) ||
        article.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase())) ||
        // Also search in summary content if available
        (article.summaryContent && article.summaryContent.toLowerCase().includes(searchTerm.toLowerCase()));
      
      // Check if selected category matches any of the article's categories_name
      const matchesCategory = selectedCategory === '' || 
        article.categories.includes(selectedCategory);
      
      return matchesSearch && matchesCategory;
    });

    // Sort by ID (highest first) to maintain the order from backend
    const sortedFiltered = filtered.sort((a, b) => {
      return b.id - a.id; // Highest ID first
    });

    // Reset to first page when filters change
    setCurrentPage(1);
    
    return sortedFiltered;
  }, [articles, searchTerm, selectedCategory]);

  // Calculate pagination
  const totalPages = Math.ceil(filteredArticles.length / articlesPerPage);
  const startIndex = (currentPage - 1) * articlesPerPage;
  const endIndex = startIndex + articlesPerPage;
  const currentArticles = filteredArticles.slice(startIndex, endIndex);

  // Get the latest published date from all articles (in UTC)
  const getLatestPublishedDate = () => {
    if (filteredArticles.length === 0) return null;
    
    // Sort articles by published date to find the latest
    const sortedByDate = [...filteredArticles].sort((a, b) => {
      const dateA = new Date(a._original?.published_date || a._original?.created_at || '1970-01-01');
      const dateB = new Date(b._original?.published_date || b._original?.created_at || '1970-01-01');
      return dateB - dateA; // Newest first
    });
    
    const latestArticle = sortedByDate[0];
    if (latestArticle && (latestArticle._original?.published_date || latestArticle._original?.created_at)) {
      const latestDate = new Date(latestArticle._original?.published_date || latestArticle._original?.created_at);
      return latestDate.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        timeZone: 'UTC' // Force UTC timezone
      });
    }
    
    return null;
  };

  // Update the results header to show the selected category name
  const selectedCategoryDisplay = selectedCategory ? selectedCategory : null;
  const latestPublishedDate = getLatestPublishedDate();

  const savedArticles = useMemo(() => {
    return savedArticlesFromDB;
  }, [savedArticlesFromDB]);

  const handleArticleClick = (article) => {
    setSelectedArticle(article);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedArticle(null);
    
    // Clean up URL if it was a shared article
    const path = window.location.pathname;
    if (path.startsWith('/article/')) {
      window.history.replaceState(null, '', '/');
      
      // Reset page title and meta tags to defaults
      document.title = 'Pearadox – AI Research, Simplified';
      
      // Reset meta tags to default with same robust function
      const updateMetaTag = (property, content, isName = false, isItemprop = false) => {
        let selector;
        if (isName) {
          selector = `meta[name="${property}"]`;
        } else if (isItemprop) {
          selector = `meta[itemprop="${property}"]`;
        } else {
          selector = `meta[property="${property}"]`;
        }
        const meta = document.querySelector(selector);
        if (meta) {
          meta.setAttribute('content', content);
        }
      };

      // Reset to default meta tags
      updateMetaTag('title', 'Pearadox – AI Research, Simplified', true);
      updateMetaTag('description', 'Bite-sized breakdowns of the world\'s most important AI discoveries. Stay ahead without the jargon.', true);
      
      updateMetaTag('og:title', 'Pearadox – AI Research, Simplified');
      updateMetaTag('og:description', 'Bite-sized breakdowns of the world\'s most important AI discoveries. Stay ahead without the jargon.');
      updateMetaTag('og:url', window.location.origin);
      updateMetaTag('og:type', 'website');
      
      updateMetaTag('twitter:title', 'Pearadox – AI Research, Simplified', true);
      updateMetaTag('twitter:description', 'Bite-sized breakdowns of the world\'s most important AI discoveries. Stay ahead without the jargon.', true);
      
      // Reset to default image
      const defaultImageUrl = `${window.location.origin}/pearadox-preview.png`;
      updateMetaTag('og:image', defaultImageUrl);
      updateMetaTag('twitter:image', defaultImageUrl, true);
      
      console.log('🔄 Reset meta tags to defaults');
    }
  };

  const handleToggleFavorite = async (articleId) => {
    console.log('💛 handleToggleFavorite called with articleId:', articleId);
    
    if (!user) {
      console.log('❌ User not authenticated, cannot save article');
      return;
    }

    try {
      const isFavorited = favorites.has(articleId);
      console.log('💖 Article currently favorited:', isFavorited);
      
      if (isFavorited) {
        // Remove from database
        await savedArticlesAPI.unsaveArticle(user.id, articleId);
        console.log('✅ Article removed from saved');
        
        // Update local state
        setFavorites(prev => {
          const newFavorites = new Set(prev);
          newFavorites.delete(articleId);
          return newFavorites;
        });
        
      } else {
        // Save to database
        await savedArticlesAPI.saveArticle(user.id, articleId);
        console.log('✅ Article saved');
        
        // Update local state
        setFavorites(prev => {
          const newFavorites = new Set(prev);
          newFavorites.add(articleId);
          return newFavorites;
        });
      }
      
      // Reload saved articles panel to reflect the change
      await loadUserSavedArticles();
      
    } catch (error) {
      console.error('❌ Error toggling favorite:', error);
      // Show user-friendly error message
      alert(`Failed to ${favorites.has(articleId) ? 'remove' : 'save'} article. Please try again.`);
    }
  };

  const handleShowSavedArticles = () => {
    setIsSavedArticlesOpen(true);
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

  const handleShowContact = () => {
    setIsContactOpen(true);
  };

  const handleCloseContact = () => {
    setIsContactOpen(false);
  };

  // Handle skill level changes from account modal
  const handleSkillLevelChange = (newSkillLevel) => {
    console.log('🎯 Skill level changed to:', newSkillLevel);
    setUserSkillLevel(newSkillLevel);
    // loadData will be triggered automatically by the useEffect dependency
  };

  // Handle research interests changes from account modal
  const handleResearchInterestsChange = (newInterests) => {
    console.log('🔬 Research interests changed to:', newInterests);
    
    // Ensure we have exactly 5 interests
    const updatedInterests = Array.isArray(newInterests) 
      ? newInterests.slice(0, 5)
      : defaultResearchInterests;
    
    // Fill up to 5 with defaults if needed
    while (updatedInterests.length < 5) {
      const remaining = defaultResearchInterests.filter(interest => !updatedInterests.includes(interest));
      if (remaining.length > 0) {
        updatedInterests.push(remaining[0]);
      } else {
        break;
      }
    }
    
    setUserResearchInterests(updatedInterests);
    
    // Clear selected category if it's no longer in user's interests
    if (selectedCategory && !updatedInterests.includes(selectedCategory)) {
      setSelectedCategory('');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50/30 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-blue-400/10 to-transparent rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-tr from-purple-400/10 to-transparent rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-to-r from-cyan-300/5 via-blue-300/5 to-purple-300/5 rounded-full blur-3xl"></div>
      </div>

      <Header 
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        selectedCategory={selectedCategory}
        onCategoryChange={setSelectedCategory}
        categories={categories}
        onShowSavedArticles={handleShowSavedArticles}
        onShowAccount={handleShowAccount}
        savedCount={savedArticlesFromDB.length}
        user={user}
        userSkillLevel={userSkillLevel}
      />

      {/* Content Spacer for Fixed Header */}
      <div className="h-24 sm:h-20"></div>

      <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-12">
        {/* Loading State */}
        {isLoading && (
          <div className="text-center py-12 sm:py-20">
            <div className="relative inline-block mb-6 sm:mb-8">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-2xl blur-xl"></div>
              <Loader2 className="relative mx-auto h-16 w-16 sm:h-24 sm:w-24 text-blue-500 animate-spin" />
            </div>
            <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3 sm:mb-4">Loading Research Papers</h3>
            <p className="text-gray-500 max-w-md mx-auto text-sm sm:text-base px-4">
              Connecting to database and fetching latest scientific discoveries...
            </p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="mb-6 sm:mb-8 bg-red-50 border border-red-200 rounded-2xl p-4 sm:p-6 mx-4 sm:mx-0">
            <div className="flex items-start space-x-3">
              <AlertCircle className="h-5 w-5 sm:h-6 sm:w-6 text-red-500 flex-shrink-0 mt-0.5" />
              <div className="flex-1 min-w-0">
                <h3 className="text-base sm:text-lg font-semibold text-red-900">Connection Error</h3>
                <p className="text-red-700 text-sm sm:text-base mt-1">{error}</p>
                <button
                  onClick={loadData}
                  className="mt-3 px-3 sm:px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm sm:text-base"
                >
                  Try Again
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Main Hero Section with CTA */}
        {!isLoading && !error && !searchTerm && (
          <div className="pt-8 sm:pt-8 pb-12 sm:pb-20 mb-8 sm:mb-12">
            <div className="mx-auto max-w-6xl px-4 sm:px-6">
              <div className="text-center mb-8 sm:mb-12">
                <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 mb-3 sm:mb-4 leading-tight px-2">
                  AI Research, Simplified
                </h2>
                <p className="text-base sm:text-lg text-gray-600 max-w-3xl mx-auto leading-relaxed px-4">
                  From beginner to expert: explore AI breakthroughs at the level you need, in minutes
                </p>
              </div>



              {/* Side-by-side CTA and Ready to Explore Sections */}
              <div className="mb-12 sm:mb-16">
                <div className="mx-auto max-w-7xl px-4 sm:px-6">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    
                    {/* Left Side - Enhanced CTA Section */}
                    <div className="bg-gradient-to-br from-white to-blue-50 rounded-3xl shadow-lg border border-blue-100 p-8 sm:p-10 h-full flex flex-col justify-between">
                      <div>
                        <div className="text-center mb-8">
                          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl mb-6 shadow-md">
                            <UserPlus className="h-8 w-8 text-white" />
                          </div>
                          <h3 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-4">
                            Join the Revolution
                          </h3>
                          <p className="text-gray-600 text-base sm:text-lg leading-relaxed">
                            Get instant access to AI research that matches your expertise level. Start your journey today.
                          </p>
                        </div>
                        
                        <div className="space-y-4 mb-8">
                          <div className="flex items-center text-sm text-gray-600">
                            <CheckCircle className="h-5 w-5 text-green-500 mr-3 flex-shrink-0" />
                            <span>Personalized content for your skill level</span>
                          </div>
                          <div className="flex items-center text-sm text-gray-600">
                            <CheckCircle className="h-5 w-5 text-green-500 mr-3 flex-shrink-0" />
                            <span>Save and organize your favorite papers</span>
                          </div>
                          <div className="flex items-center text-sm text-gray-600">
                            <CheckCircle className="h-5 w-5 text-green-500 mr-3 flex-shrink-0" />
                            <span>Weekly digest of breakthrough research</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="text-center">
                        {user ? (
                          <div className="flex items-center justify-center text-green-600 font-medium">
                            <CheckCircle className="w-5 h-5 mr-2" />
                            Welcome back, {(() => {
                              const displayName = userProfile?.full_name || user.email?.split('@')[0] || 'there';
                              console.log('👤 CTA Display name:', displayName, 'from profile:', userProfile?.full_name, 'from email:', user.email?.split('@')[0]);
                              return displayName;
                            })()}!
                          </div>
                        ) : (
                          <button
                            onClick={handleShowAccount}
                            className="w-full inline-flex items-center justify-center px-6 py-4 text-lg font-semibold text-white bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-300 hover:from-blue-600 hover:to-blue-700"
                          >
                            Create Free Account
                            <ArrowRight className="ml-3 w-5 h-5" />
                          </button>
                        )}
                          </div>
                    </div>

                    {/* Right Side - Ready to Explore Section */}
                    <div className="bg-gradient-to-br from-white to-green-50 rounded-3xl shadow-lg border border-green-100 p-8 sm:p-10 h-full flex flex-col justify-between">
                      <div>
                        <div className="text-center mb-8">
                          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-6 shadow-md" style={{ backgroundColor: '#1db954' }}>
                            <Zap className="h-8 w-8 text-white" />
                          </div>
                          <h3 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-4">
                            Ready to Explore?
                          </h3>
                          <p className="text-gray-600 text-base sm:text-lg leading-relaxed">
                            Jump straight into cutting-edge AI research. No signup required to start exploring.
                          </p>
                        </div>
                        
                        <div className="grid grid-cols-3 gap-4 mb-8">
                          <div className="text-center p-3 bg-white/80 rounded-xl border border-green-100">
                            <div className="text-lg font-bold text-green-600">1M+</div>
                            <div className="text-xs text-gray-600">Authors</div>
                          </div>
                          <div className="text-center p-3 bg-white/80 rounded-xl border border-green-100">
                            <div className="text-lg font-bold text-green-700">Daily</div>
                            <div className="text-xs text-gray-600">Updates</div>
                          </div>
                          <div className="text-center p-3 bg-white/80 rounded-xl border border-green-100">
                            <div className="text-lg font-bold text-green-600">AI</div>
                            <div className="text-xs text-gray-600">Summarized</div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="text-center">
                          <button
                          onClick={scrollToArticles}
                          className="w-full group inline-flex items-center justify-center px-6 py-4 text-lg font-semibold text-white rounded-xl shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-300"
                          style={{ 
                            backgroundColor: '#1db954'
                          }}
                          onMouseEnter={(e) => e.target.style.backgroundColor = '#16a14a'}
                          onMouseLeave={(e) => e.target.style.backgroundColor = '#1db954'}
                        >
                          <span>See Latest Breakthroughs</span>
                          <svg 
                            className="ml-3 w-5 h-5 transform group-hover:translate-y-1 transition-transform duration-300" 
                            fill="none" 
                            stroke="currentColor" 
                            viewBox="0 0 24 24"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                          </svg>
                          </button>
                    </div>
                    </div>
                    
                  </div>
                </div>
              </div>

               {/* Democratizing Discovery Section */}
               <div className="mb-12 sm:mb-16">
                 <div className="mx-auto max-w-6xl px-4 sm:px-6">
                   <div className="relative bg-gradient-to-br from-white to-gray-50 rounded-3xl shadow-lg border border-gray-100 p-8 sm:p-12 overflow-hidden">
                     {/* Background decoration */}
                     <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-bl from-gray-200/20 to-transparent rounded-full blur-2xl"></div>
                     <div className="absolute bottom-0 left-0 w-32 h-32 bg-gradient-to-tr from-gray-300/20 to-transparent rounded-full blur-2xl"></div>
                     
                     <div className="relative">
                       <div className="text-center mb-10 sm:mb-12">
                         <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-gray-600 to-gray-700 rounded-2xl mb-6 shadow-md">
                           <Users className="h-8 w-8 text-white" />
                         </div>
                         <h3 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-800 mb-4 leading-tight">
                           Democratizing Discovery
                         </h3>
                         <p className="text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
                           The future belongs to those who understand it. We're making sure that's everyone.
                         </p>
                       </div>

                       <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-10">
                         <div className="text-center p-4 sm:p-6 bg-white rounded-2xl border border-gray-200 shadow-sm">
                           <div className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-800 mb-1 sm:mb-2">1.5K+</div>
                           <div className="text-gray-600 font-medium text-sm sm:text-base">Papers Simplified</div>
                         </div>
                         
                         <div className="text-center p-4 sm:p-6 bg-white rounded-2xl border border-gray-200 shadow-sm">
                           <div className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-800 mb-1 sm:mb-2">200+</div>
                           <div className="text-gray-600 font-medium text-sm sm:text-base">Active Users</div>
                         </div>
                         
                         <div className="text-center p-4 sm:p-6 bg-white rounded-2xl border border-gray-200 shadow-sm">
                           <div className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-800 mb-1 sm:mb-2">50+</div>
                           <div className="text-gray-600 font-medium text-sm sm:text-base">Universities</div>
                         </div>
                         
                         <div className="text-center p-4 sm:p-6 bg-white rounded-2xl border border-gray-200 shadow-sm">
                           <div className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-800 mb-1 sm:mb-2">50+</div>
                           <div className="text-gray-600 font-medium text-sm sm:text-base">Countries</div>
                         </div>
                       </div>

                       <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
                         <div className="bg-white rounded-2xl p-6 shadow-lg border border-green-100 hover:shadow-xl transition-all duration-300 group">
                           <div className="flex items-center space-x-4 mb-4">
                             <div className="p-3 rounded-xl bg-green-100 text-green-600 group-hover:scale-110 transition-transform duration-300">
                               <Building2 className="h-6 w-6" />
                             </div>
                             <div>
                               <div className="text-xl font-bold text-gray-900">Fortune 500</div>
                               <div className="text-gray-600 text-sm">Trusted By The Best</div>
                             </div>
                           </div>
                           <p className="text-gray-600 leading-relaxed">
                             Used by employees at 50+ Fortune 500 companies to cut through AI noise and get straight to what matters.
                           </p>
                         </div>

                         <div className="bg-white rounded-2xl p-6 shadow-lg border border-green-100 hover:shadow-xl transition-all duration-300 group">
                           <div className="flex items-center space-x-4 mb-4">
                             <div className="p-3 rounded-xl bg-blue-100 text-blue-600 group-hover:scale-110 transition-transform duration-300">
                               <Microscope className="h-6 w-6" />
                             </div>
                             <div>
                               <div className="text-xl font-bold text-gray-900">Top Insights</div>
                               <div className="text-gray-600 text-sm">From Research to Reality</div>
                             </div>
                           </div>
                           <p className="text-gray-600 leading-relaxed">
                             Distill breakthroughs from MIT, Stanford, and leading AI labs into plain English—so you can apply them immediately.
                           </p>
                         </div>

                         <div className="bg-white rounded-2xl p-6 shadow-lg border border-green-100 hover:shadow-xl transition-all duration-300 group">
                           <div className="flex items-center space-x-4 mb-4">
                             <div className="p-3 rounded-xl bg-purple-100 text-purple-600 group-hover:scale-110 transition-transform duration-300">
                               <TrendingUp className="h-6 w-6" />
                             </div>
                             <div>
                               <div className="text-xl font-bold text-gray-900">Rapid Growth</div>
                               <div className="text-gray-600 text-sm">Grow Smarter Every Day</div>
                             </div>
                           </div>
                           <p className="text-gray-600 leading-relaxed">
                             Our community is exploding because busy people don't have time to read 40-page papers. We do it for you.
                           </p>
                         </div>
                       </div>

                       {/* Trust badge section */}
                       <div className="mt-10 pt-8 border-t border-gray-200">
                         <div className="text-center">
                           <p className="text-gray-500 text-sm mb-4">Trusted by professionals at</p>
                           <div className="flex flex-wrap justify-center items-center gap-6 text-gray-500 text-sm font-medium">
                             <span className="bg-white px-4 py-2 rounded-lg border border-gray-200 shadow-sm">Google</span>
                             <span className="bg-white px-4 py-2 rounded-lg border border-gray-200 shadow-sm">Microsoft</span>
                             <span className="bg-white px-4 py-2 rounded-lg border border-gray-200 shadow-sm">Verizon</span>
                             <span className="bg-white px-4 py-2 rounded-lg border border-gray-200 shadow-sm">Leidos</span>
                             <span className="bg-white px-4 py-2 rounded-lg border border-gray-200 shadow-sm">MIT</span>
                             <span className="bg-white px-4 py-2 rounded-lg border border-gray-200 shadow-sm">Cresta</span>
                           </div>
                         </div>
                       </div>
                     </div>
                   </div>
                 </div>
               </div>

              {/* Decorative Line Break */}
              <div className="my-16 sm:my-20">
                <div className="mx-auto max-w-3xl px-4 sm:px-6">
                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-gray-200"></div>
                    </div>
                    <div className="relative flex justify-center">
                      <span className="bg-white px-6 text-gray-400 text-sm font-medium">
                        •••
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div id="categories-section" className="text-center mb-6 sm:mb-10">
                <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2 sm:mb-3 px-4">
                  Pick a Category 
                </h3>
                <p className="text-gray-600 text-sm sm:text-base px-4">
                  Explore Breakthroughs Shaping the Future
                </p>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-6 max-w-5xl mx-auto px-4">
                {userResearchInterests.map((researchInterest, index) => {
                  const Icon = getCategoryIcon(researchInterest);
                  const colorClass = getCategoryColor(researchInterest, index);
                  const isSelected = selectedCategory === researchInterest;

                  return (
                    <button
                      key={researchInterest}
                      onClick={() => {
                        setSelectedCategory(isSelected ? '' : researchInterest);
                      }}
                      className={`group p-4 sm:p-8 rounded-xl sm:rounded-2xl border-2 transition-all duration-300 hover:scale-105 hover:shadow-lg ${colorClass} ${
                        isSelected
                          ? 'ring-2 ring-indigo-500 shadow-lg'
                          : ''
                      } ${
                        // Center the 5th item on mobile when it's alone on a row
                        index === 4 ? 'col-span-2 sm:col-span-1 justify-self-center' : ''
                      }`}
                    >
                      <div className="flex flex-col items-center justify-center space-y-2 sm:space-y-3 h-20 sm:h-28">
                        <div className="p-2 sm:p-3 rounded-lg sm:rounded-xl bg-white shadow-sm group-hover:shadow-md transition-shadow flex-shrink-0">
                          <Icon className="h-5 w-5 sm:h-8 sm:w-8 text-indigo-600" />
                        </div>
                        <span className="text-xs sm:text-sm font-semibold text-gray-900 leading-tight text-center min-h-[2.5rem] sm:min-h-[3rem] flex items-center justify-center px-1">
                          {shortenCategoryName(researchInterest)}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Results Header */}
        {!isLoading && !error && (
          <div className="mb-6 sm:mb-8 px-4 sm:px-0" ref={resultsRef}>
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-1 sm:mb-2">
                  {selectedCategoryDisplay ? `${categories.find(c => c.category_name === selectedCategoryDisplay)?.category_name || selectedCategoryDisplay}` : 'Latest Research'}
                </h3>
                <p className="text-gray-600 text-sm sm:text-base">
                  {latestPublishedDate ? `Publication Date: ${latestPublishedDate}` : 'No articles found'}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Articles Grid */}
        {!isLoading && !error && filteredArticles.length > 0 ? (
          <div className="px-4 sm:px-0">
            <div className="grid gap-4 sm:gap-6 md:gap-8 md:grid-cols-2 lg:grid-cols-3">
              {currentArticles.map(article => (
                <ArticleCard 
                  key={article.id} 
                  article={article} 
                  onClick={handleArticleClick}
                  isFavorite={favorites.has(article.id)}
                  onToggleFavorite={handleToggleFavorite}
                />
              ))}
            </div>

            {/* Pagination - Mobile optimized */}
            {totalPages > 1 && (
              <div className="flex flex-col sm:flex-row items-center justify-center space-y-3 sm:space-y-0 sm:space-x-2 mt-8 sm:mt-12 px-4">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="w-full sm:w-auto flex items-center justify-center px-4 py-3 sm:py-2 rounded-lg border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronLeft className="h-4 w-4 mr-1" />
                  Previous
                </button>

                <div className="flex items-center space-x-1 overflow-x-auto py-2 max-w-full">
                  {Array.from({ length: totalPages }, (_, i) => {
                    const pageNum = i + 1;
                    const isActive = pageNum === currentPage;
                    
                    // Show first page, last page, current page, and pages around current
                    const showPage = pageNum === 1 || 
                                   pageNum === totalPages || 
                                   Math.abs(pageNum - currentPage) <= 1;
                    
                    if (!showPage && pageNum === 2 && currentPage > 4) {
                      return <span key={pageNum} className="px-2 text-gray-400 text-sm">...</span>;
                    }
                    
                    if (!showPage && pageNum === totalPages - 1 && currentPage < totalPages - 3) {
                      return <span key={pageNum} className="px-2 text-gray-400 text-sm">...</span>;
                    }
                    
                    if (!showPage) return null;

                    return (
                      <button
                        key={pageNum}
                        onClick={() => setCurrentPage(pageNum)}
                        className={`px-3 py-2 rounded-lg font-medium transition-colors text-sm sm:text-base ${
                          isActive
                            ? 'bg-blue-600 text-white'
                            : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                </div>

                <button
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="w-full sm:w-auto flex items-center justify-center px-4 py-3 sm:py-2 rounded-lg border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Next
                  <ChevronRight className="h-4 w-4 ml-1" />
                </button>
              </div>
            )}
          </div>
        ) : !isLoading && !error && (
          <div className="text-center py-12 sm:py-20 px-4">
            <div className="relative inline-block mb-6 sm:mb-8">
              <div className="absolute inset-0 bg-gradient-to-r from-gray-300/20 to-gray-400/20 rounded-2xl blur-xl"></div>
              <BookOpen className="relative mx-auto h-16 w-16 sm:h-24 sm:w-24 text-gray-400" />
            </div>
            <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3 sm:mb-4">No Research Found</h3>
            <p className="text-gray-500 max-w-md mx-auto text-sm sm:text-base">
              Try adjusting your search terms or exploring different categories to discover new research.
            </p>
          </div>
        )}
      </main>

      <ArticleModal 
        article={selectedArticle}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        isFavorite={selectedArticle ? favorites.has(selectedArticle.id) : false}
        onToggleFavorite={handleToggleFavorite}
      />

      <SavedArticles
        isOpen={isSavedArticlesOpen}
        onClose={handleCloseSavedArticles}
        savedArticles={savedArticles}
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

      <ContactModal
        isOpen={isContactOpen}
        onClose={handleCloseContact}
      />

      <Footer onContactClick={handleShowContact} />
    </div>
  );
}

export default App;