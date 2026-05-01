import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, useInView, AnimatePresence } from 'framer-motion';
import { BookOpen, Loader2, AlertCircle, Search, Filter, Bookmark, Brain, Eye, Bot, Wrench, Code, ChevronLeft, ChevronRight, Cpu, Zap, Shield, Microscope, Network, Database, Globe, Smartphone, Camera, FileText, Users, TrendingUp, BarChart, Settings, Lightbulb, Atom, Dna, Activity, Monitor, Wifi, ArrowRight, ArrowDown, User, UserPlus, Unlock, Target, Clock, Building2, MessageCircle, Smartphone as SmartphoneIcon, CheckCircle, Sparkles, Shuffle, GraduationCap, Coins, Play } from 'lucide-react';
import { useTheme } from './contexts/ThemeContext';
import Header from './components/Header';
import ArticleCard from './components/ArticleCard';
import ArticleModal from './components/ArticleModal';
import SavedArticles from './components/SavedArticles';
import AccountModal from './components/AccountModal';
import Footer from './components/Footer';
import ContactModal from './components/ContactModal';
import TestimonialCarousel from './components/TestimonialCarousel';
import FieldQuiz from './components/FieldQuiz';
import FieldQuizButton from './components/FieldQuizButton';
import { useUser } from './contexts/UserContext';
import { arxivAPI, authAPI, savedArticlesAPI, viewedArticlesAPI, quizAPI, redemptionAPI, supabase } from './lib/supabase';

function RevealOnScroll({ children, delay = 0, className = '' }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-80px' });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 40 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, delay, ease: 'easeOut' }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

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

// Generate category color based on index (fixed 5 colors) - Modern design
const getCategoryColor = (categoryName, index = 0) => {
  const colorSchemes = [
    { 
      bg: 'bg-gradient-to-br from-white to-blue-50/50',
      border: 'border-gray-200',
      hoverBorder: 'hover:border-blue-300',
      iconBg: 'bg-blue-50',
      iconColor: 'text-blue-600',
      selectedBorder: 'border-blue-500',
      glow: 'rgba(59, 130, 246, 0.15)' // blue
    },
    { 
      bg: 'bg-gradient-to-br from-white to-purple-50/50',
      border: 'border-gray-200',
      hoverBorder: 'hover:border-purple-300',
      iconBg: 'bg-purple-50',
      iconColor: 'text-purple-600',
      selectedBorder: 'border-purple-500',
      glow: 'rgba(168, 85, 247, 0.15)' // purple
    },
    { 
      bg: 'bg-gradient-to-br from-white to-green-50/50',
      border: 'border-gray-200',
      hoverBorder: 'hover:border-green-300',
      iconBg: 'bg-green-50',
      iconColor: 'text-green-600',
      selectedBorder: 'border-green-500',
      glow: 'rgba(29, 185, 84, 0.15)' // green
    },
    { 
      bg: 'bg-gradient-to-br from-white to-orange-50/50',
      border: 'border-gray-200',
      hoverBorder: 'hover:border-orange-300',
      iconBg: 'bg-orange-50',
      iconColor: 'text-orange-600',
      selectedBorder: 'border-orange-500',
      glow: 'rgba(249, 115, 22, 0.15)' // orange
    },
    { 
      bg: 'bg-gradient-to-br from-white to-pink-50/50',
      border: 'border-gray-200',
      hoverBorder: 'hover:border-pink-300',
      iconBg: 'bg-pink-50',
      iconColor: 'text-pink-600',
      selectedBorder: 'border-pink-500',
      glow: 'rgba(236, 72, 153, 0.15)' // pink
    }
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

// Generate slug from paper title and arxiv ID for URL generation
function generateSlug(title, arxivId) {
  const cleanTitle = title
    .toLowerCase()
    .replace(/[^\w\s-]/g, '') // Remove special characters
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with single
    .trim();
  
  // Limit length for better URLs
  const truncatedTitle = cleanTitle.length > 60 ? cleanTitle.substring(0, 60).replace(/-[^-]*$/, '') : cleanTitle;
  
  return `${arxivId}-${truncatedTitle}`;
};

function App() {
  const navigate = useNavigate();
  const [selectedArticle, setSelectedArticle] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [isSavedArticlesOpen, setIsSavedArticlesOpen] = useState(false);
  const [isAccountOpen, setIsAccountOpen] = useState(false);
  const [isContactOpen, setIsContactOpen] = useState(false);
  
  // Field quiz state
  const [selectedField, setSelectedField] = useState(null);
  const [sessionResearchInterests, setSessionResearchInterests] = useState(null);
  const [isFieldQuizOpen, setIsFieldQuizOpen] = useState(false);
  const [lastRefreshDate, setLastRefreshDate] = useState(null);
  const [spotlightArticle, setSpotlightArticle] = useState(null);
  const [isLoadingSpecificArticle, setIsLoadingSpecificArticle] = useState(false);
  const [spotlightTypingComplete, setSpotlightTypingComplete] = useState(false);
  
  // Start typing animation timer on mount
  useEffect(() => {
    const typingTimer = setTimeout(() => {
      setSpotlightTypingComplete(true);
    }, 3200); // 2s typing + 1.2s pause before showing spotlight
    return () => clearTimeout(typingTimer);
  }, []);
  
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
  
  // PEAR token state
  const [pearTokenCount, setPearTokenCount] = useState(0);
  const [totalRedeemed, setTotalRedeemed] = useState(0);
  const [isLoadingTokens, setIsLoadingTokens] = useState(false);
  
  // Calculate available balance (earned - redeemed)
  const availableBalance = pearTokenCount - totalRedeemed;
  
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
  
  // Analytics state for dashboard metrics
  const [analyticsData, setAnalyticsData] = useState(null);
  const [weeklyData, setWeeklyData] = useState([]);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const articlesPerPage = 30; // Show 50 articles per page (30 pages for 1500 articles)

  // Ref for scrolling to results
  const resultsRef = useRef(null);

  // Handle shared article URLs
  useEffect(() => {
    const handleSharedArticle = async () => {
      const path = window.location.pathname;
      const href = window.location.href;
      console.log('🔄 handleSharedArticle triggered. Path:', path, 'Full URL:', href, 'Articles loaded:', articles.length, 'IsLoading:', isLoading, 'UserSkillLevel:', userSkillLevel);
      
      // Updated to match new slug format: /article/arxiv-id-title-slug
      const articleMatch = path.match(/\/article\/(\d{4}\.\d{4,5}v?\d*)-/);
      
      if (articleMatch) {
        const arxivId = articleMatch[1];
        console.log('📤 Direct navigation to article detected:', arxivId, 'from URL:', path);
        
        // Function to find and display article
        const findAndDisplayArticle = async (articlesArray) => {
          const sharedArticle = articlesArray.find(article => {
            // More flexible matching to handle version numbers
            return article.arxivId === arxivId || 
                   article.arxivId?.replace(/v\d+$/, '') === arxivId.replace(/v\d+$/, '');
          });
          
          if (sharedArticle) {
            console.log('📖 Opening shared article:', sharedArticle.title);
            setSelectedArticle(sharedArticle);
            setIsModalOpen(true);
            
            // Update page title and meta tags
            updatePageMeta(sharedArticle);
            
            // Record article view for analytics (same as regular clicks)
            // Use a retry mechanism to ensure user authentication is captured
            const recordViewWithRetry = async (retryCount = 0) => {
              try {
                // Get the most current user state or check session directly
                const sessionData = await authAPI.getCurrentSession();
                const currentUser = user || sessionData?.data?.session?.user;
                
                console.log('🔍 Recording direct article view for user:', currentUser?.id || 'anonymous');

                // If no user found and we haven't retried enough, try again
                if (!currentUser && retryCount < 3) {
                  console.log('⏰ No user found, retrying in 1 second...');
                  setTimeout(() => recordViewWithRetry(retryCount + 1), 1000);
                  return;
                }

                await viewedArticlesAPI.recordArticleView(currentUser?.id, sharedArticle, userSkillLevel);
                console.log('📊 Direct article view recorded for analytics', currentUser ? 'authenticated' : 'anonymous');
              } catch (error) {
                console.warn('⚠️ Failed to record direct article view (non-critical):', error);
              }
            };
            
            // Start the retry process after a small delay
            setTimeout(() => recordViewWithRetry(), 500);
            
            return true;
          }
          return false;
        };
        
        // If articles are already loaded, try to find the article
        if (articles.length > 0) {
          const found = await findAndDisplayArticle(articles);
          if (found) return;
        }
        
        // If articles not loaded yet, or article not found, try to load it directly
        if (isLoading || articles.length === 0) {
          console.log('🔄 Articles still loading, waiting...');
          
          // Set up a more persistent check
          const maxAttempts = 10;
          let attempts = 0;
          
          const checkInterval = setInterval(async () => {
            attempts++;
            console.log(`🔍 Attempt ${attempts}: Checking for article ${arxivId}...`);
            
            if (articles.length > 0) {
              const found = await findAndDisplayArticle(articles);
              if (found) {
                clearInterval(checkInterval);
                return;
              }
            }
            
            // If we've tried enough times and still no luck, try loading from database directly
            if (attempts >= maxAttempts) {
              clearInterval(checkInterval);
              console.log('⚠️ Article not found in current articles, trying direct database fetch...');
              
              // Try to fetch the specific article from database
              fetchSpecificArticle(arxivId);
            }
          }, 500); // Check every 500ms
          
          // Clean up interval after 10 seconds maximum
          setTimeout(() => {
            clearInterval(checkInterval);
          }, 10000);
          
          // Return cleanup function
          return () => {
            clearInterval(checkInterval);
          };
        }
      }
    };

    handleSharedArticle();
  }, [articles, isLoading, userSkillLevel, user]);

  // Function to fetch a specific article directly from database
  const fetchSpecificArticle = async (arxivId) => {
    try {
      setIsLoadingSpecificArticle(true);
      console.log('🔍 Fetching specific article from database:', arxivId, 'UserSkillLevel:', userSkillLevel);
      
      // Ensure userSkillLevel is valid before proceeding
      const skillLevel = userSkillLevel || 'Beginner'; // Fallback to default
      console.log('🎯 Using skill level:', skillLevel);
      
      // Try to get the article using the same pattern as getAllPapersWithSummaries
      const specificPapers = await arxivAPI.getAllPapersWithSummaries(skillLevel);
      
      const foundArticle = specificPapers.find(paper => {
        return paper.arxiv_id === arxivId || 
               paper.arxiv_id?.replace(/v\d+$/, '') === arxivId.replace(/v\d+$/, '');
      });
      
      if (foundArticle) {
        console.log('✅ Found article in database:', foundArticle.title);
        
        // Transform to match app format
        const transformedArticle = {
          id: foundArticle.id,
          title: foundArticle.summaryTitle || foundArticle.title || 'Untitled',
          shortDescription: foundArticle.summaryOverview || (foundArticle.abstract?.substring(0, 200) + '...') || 'No description available',
          originalTitle: foundArticle.title,
          quiz: foundArticle.quiz || null,
          originalAbstract: foundArticle.abstract,
          summaryContent: foundArticle.summaryContent,
          hasSummary: !!(foundArticle.summaryTitle || foundArticle.summaryOverview || foundArticle.summaryContent),
          skillLevel: skillLevel,
          category: Array.isArray(foundArticle.categories_name) && foundArticle.categories_name.length > 0 
            ? foundArticle.categories_name[0] 
            : 'General',
          categories: Array.isArray(foundArticle.categories_name) ? foundArticle.categories_name : [foundArticle.categories_name || 'General'],
          subjectClasses: Array.isArray(foundArticle.categories) ? foundArticle.categories : [foundArticle.categories || 'general'],
          categoriesName: Array.isArray(foundArticle.categories_name) && foundArticle.categories_name.length > 0 
            ? foundArticle.categories_name[0] 
            : 'General',
          arxivId: foundArticle.arxiv_id,
          url: foundArticle.pdf_url || foundArticle.abstract_url || `https://arxiv.org/pdf/${foundArticle.arxiv_id}`,
          authors: Array.isArray(foundArticle.authors) ? foundArticle.authors.join(', ') : (foundArticle.authors || 'Unknown Authors'),
          publishedDate: formatDate(foundArticle.published_date || foundArticle.created_at),
          tags: generateTags(foundArticle.categories_name, foundArticle.title, foundArticle.abstract),
          _original: foundArticle
        };
        
        // Add to articles array if not already there
        setArticles(prevArticles => {
          const exists = prevArticles.find(a => a.arxivId === transformedArticle.arxivId);
          if (!exists) {
            return [transformedArticle, ...prevArticles];
          }
          return prevArticles;
        });
        
        // Open the modal
        setSelectedArticle(transformedArticle);
        setIsModalOpen(true);
        updatePageMeta(transformedArticle);
        
        // Record article view for analytics (same as regular clicks)
        // Use a retry mechanism to ensure user authentication is captured
        const recordViewWithRetry = async (retryCount = 0) => {
          try {
            // Get the most current user state or check session directly
            const sessionData = await authAPI.getCurrentSession();
            const currentUser = user || sessionData?.data?.session?.user;
            
            console.log('🔍 Recording database-fetched article view for user:', currentUser?.id || 'anonymous');

            // If no user found and we haven't retried enough, try again
            if (!currentUser && retryCount < 3) {
              console.log('⏰ No user found, retrying in 1 second...');
              setTimeout(() => recordViewWithRetry(retryCount + 1), 1000);
              return;
            }

            await viewedArticlesAPI.recordArticleView(currentUser?.id, transformedArticle, userSkillLevel);
            console.log('📊 Database-fetched article view recorded for analytics', currentUser ? 'authenticated' : 'anonymous');
          } catch (error) {
            console.warn('⚠️ Failed to record database article view (non-critical):', error);
          }
        };
        
        // Start the retry process after a small delay
        setTimeout(() => recordViewWithRetry(), 500);
        
        console.log('🎉 Successfully loaded and displayed article from database');
      } else {
        console.warn('⚠️ Article not found in database either:', arxivId);
        // You could show a "article not found" message here
      }
    } catch (error) {
      console.error('❌ Error fetching specific article:', error);
    } finally {
      setIsLoadingSpecificArticle(false);
    }
  };

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

  // Load PEAR token count and redemptions for authenticated users
  useEffect(() => {
    const loadPearTokens = async () => {
      if (user) {
        setIsLoadingTokens(true);
        try {
          // Load earned tokens
          const correctAnswers = await quizAPI.getUserCorrectAnswers(user.id);
          setPearTokenCount(correctAnswers.length);
          
          // Load total redeemed
          const redeemed = await redemptionAPI.getUserTotalRedeemed(user.id);
          setTotalRedeemed(redeemed);
          
          console.log(`🪙 User has ${correctAnswers.length} earned, ${redeemed} redeemed, ${correctAnswers.length - redeemed} available PEAR tokens`);
        } catch (error) {
          console.error('❌ Error loading PEAR tokens:', error);
          setPearTokenCount(0);
          setTotalRedeemed(0);
        } finally {
          setIsLoadingTokens(false);
        }
      } else {
        setPearTokenCount(0);
        setTotalRedeemed(0);
      }
    };

    loadPearTokens();
  }, [user]);

  // Load data from Supabase with skill-level specific summaries
  useEffect(() => {
    loadData();
    loadLastRefreshDate();
  }, [userSkillLevel]); // Reload when skill level changes

  // Load analytics data when user logs in/out
  useEffect(() => {
    loadAnalyticsData();
  }, [user]);

  // Select spotlight article when articles are loaded or date changes
  useEffect(() => {
    if (articles.length > 0) {
      // Always run selection to handle date changes
      selectSpotlightArticle();
    }
  }, [articles]);

  // Load user's saved articles
  // The user context now handles loading saved articles

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

  // Function to scroll to articles section (including quiz button)
  const scrollToArticles = () => {
    const quizSection = document.getElementById('quiz-section');
    if (quizSection) {
      const headerHeight = 80; // Account for fixed header height
      const additionalOffset = 20; // Add some padding above the quiz button
      const elementPosition = quizSection.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - headerHeight - additionalOffset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
  };

  const loadLastRefreshDate = async () => {
    try {
      const refreshDate = await arxivAPI.getLastRefreshDate();
      setLastRefreshDate(refreshDate);
    } catch (error) {
      console.error('Error loading last refresh date:', error);
    }
  };

  // Select a consistent daily article for the Research Of The Day spotlight
  // Uses date-based seeding to ensure the same article shows for the entire day
  // Implements caching for instant load on subsequent visits
  const selectSpotlightArticle = () => {
    const today = new Date();
    const dateString = `${today.getFullYear()}-${today.getMonth()}-${today.getDate()}`;
    const cacheKey = `spotlight_${dateString}`;
    
    // Try to load from cache first
    try {
      const cached = localStorage.getItem(cacheKey);
      if (cached) {
        const cachedArticle = JSON.parse(cached);
        setSpotlightArticle(cachedArticle);
        console.log('📌 Loaded spotlight from cache:', cachedArticle?.title);
        return;
      }
    } catch (e) {
      console.log('Cache read error, selecting new article');
    }
    
    if (articles.length > 0) {
      // Simple hash function to convert date string to a number
      let hash = 0;
      for (let i = 0; i < dateString.length; i++) {
        const char = dateString.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash; // Convert to 32-bit integer
      }
      
      // Use absolute value and modulo to get a consistent index for today
      const availableArticles = Math.min(articles.length, 50); // Pick from top 50 most recent
      const dailyIndex = Math.abs(hash) % availableArticles;
      
      const selectedArticle = articles[dailyIndex];
      setSpotlightArticle(selectedArticle);
      
      // Cache for instant load on next visit
      try {
        // Clear old cache entries
        Object.keys(localStorage).forEach(key => {
          if (key.startsWith('spotlight_') && key !== cacheKey) {
            localStorage.removeItem(key);
          }
        });
        localStorage.setItem(cacheKey, JSON.stringify(selectedArticle));
      } catch (e) {
        console.log('Cache write error');
      }
      
      console.log('📌 Selected daily spotlight article:', selectedArticle?.title, `(index: ${dailyIndex} for date: ${dateString})`);
    }
  };

  // Load analytics data for dashboard metrics
  const loadAnalyticsData = async () => {
    if (!user?.id) {
      setAnalyticsData(null);
      setWeeklyData([]);
      return;
    }
    
    try {
      console.log('📊 Loading analytics data for user:', user.id);
      
      // Helper function to process weekly data (EXACT same logic as AccountModal)
      const processWeeklyData = (recentViews) => {
        const weekDays = [];
        const today = new Date();
        
        // Get the start of current week (Sunday)
        const currentDay = today.getDay(); // 0 = Sunday, 1 = Monday, etc.
        const startOfWeek = new Date(today);
        startOfWeek.setDate(today.getDate() - currentDay);
        
        // Create array for current week (Sunday to Saturday)
        for (let i = 0; i < 7; i++) {
          const date = new Date(startOfWeek);
          date.setDate(startOfWeek.getDate() + i);
          const dateStr = date.toISOString().split('T')[0];
          
          // Count views for this day (exclude blog entries)
          const viewsCount = recentViews?.filter(view => {
            const viewDate = new Date(view.viewed_at).toISOString().split('T')[0];
            return viewDate === dateStr && view.article_id !== 'blog';
          }).length || 0;
          
          weekDays.push({
            date: dateStr,
            day: date.toLocaleDateString('en-US', { weekday: 'long' }), // Full day name
            dayShort: date.toLocaleDateString('en-US', { weekday: 'short' }), // Short day name
            views: viewsCount,
            isToday: dateStr === today.toISOString().split('T')[0]
          });
        }
        
        return weekDays;
      };
      
      // Get user viewing stats
      const statsResult = await viewedArticlesAPI.getUserViewingStats(user.id);
      if (statsResult.success) {
        setAnalyticsData(statsResult.data);
        
        // Process weekly data for "This Week" metric
        const weeklyViews = processWeeklyData(statsResult.data.recentViews);
        setWeeklyData(weeklyViews);
        
        console.log('✅ Analytics data loaded:', statsResult.data);
      }
    } catch (error) {
      console.error('❌ Error loading analytics data:', error);
      setAnalyticsData(null);
      setWeeklyData([]);
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
      
        // Try to get papers with skill-level summaries first (paginated and cached)
        let papersData;
        try {
          papersData = await arxivAPI.getAllPapersWithSummaries(userSkillLevel, 1, 1000);
          console.log(`📝 Loaded ${papersData.length} papers with summaries`);
        } catch (summaryError) {
          console.log('⚠️ Failed to load summaries, falling back to basic papers');
          papersData = await arxivAPI.getAllPapers(1, 1000, true); // Use lightweight version for fallback
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
        // Add quiz data if available
        quiz: paper.quiz || null,
        _original: paper
      }));
      
      // Log quiz data for debugging
      const articlesWithQuizzes = transformedArticles.filter(a => a.quiz !== null);
      console.log(`🧠 Found ${articlesWithQuizzes.length} articles with quiz data out of ${transformedArticles.length} total`);
      if (articlesWithQuizzes.length > 0) {
        console.log('🧠 Sample article with quiz:', {
          id: articlesWithQuizzes[0].id,
          title: articlesWithQuizzes[0].title?.substring(0, 50),
          hasQuiz: !!articlesWithQuizzes[0].quiz,
          quizQuestion: articlesWithQuizzes[0].quiz?.question?.substring(0, 50)
        });
      }
      
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

  // loadUserSavedArticles is now provided by UserContext

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

  const handleArticleClick = async (article) => {
    setSelectedArticle(article);
    setIsModalOpen(true);
    
    // Debug article structure
    console.log('🔍 Article object for URL generation:', {
      title: article.title,
      arxivId: article.arxivId,
      id: article.id
    });
    
    // Update URL to include article ID and title for SEO and sharing
    const slug = generateSlug(article.title, article.arxivId);
    const articleUrl = `/article/${slug}`;
    window.history.pushState({ articleId: article.id }, '', articleUrl);
    
    // Update page meta tags for better SEO and social sharing
    updatePageMeta(article);
    
    // Record article view for analytics (for both authenticated and anonymous users)
    try {
      await viewedArticlesAPI.recordArticleView(user?.id, article, userSkillLevel);
      console.log('📊 Article view recorded for analytics');
    } catch (error) {
      console.warn('⚠️ Failed to record article view (non-critical):', error);
      // Don't block the user experience if analytics fails
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedArticle(null);
    
    // Clean up URL if it was a shared article
    const path = window.location.pathname;
    if (path.startsWith('/article/')) {
      // Simply replace the URL without navigating - this keeps the modal working properly
      window.history.replaceState(window.history.state, '', '/');
      
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

  // handleToggleFavorite is now provided by UserContext

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

  // Field quiz handlers
  const handleOpenFieldQuiz = () => {
    setIsFieldQuizOpen(true);
  };

  const handleCloseFieldQuiz = () => {
    setIsFieldQuizOpen(false);
  };

  const handleFieldSelect = (fieldId) => {
    setSelectedField(fieldId);
    
    if (fieldId) {
      // Define field-specific categories
      const fieldCategories = {
        medicine: [
          'Computational Biology',
          'Medical Informatics', 
          'Computer Vision and Pattern Recognition',
          'Machine Learning',
          'Computation and Language'
        ],
        finance: [
          'Machine Learning',
          'Data Mining',
          'Statistics',
          'Computation and Language',
          'Computational Economics'
        ],
        education: [
          'Human-Computer Interaction',
          'Computation and Language',
          'Machine Learning',
          'Educational Technology',
          'Cognitive Science'
        ],
        tech: [
          'Machine Learning',
          'Artificial Intelligence',
          'Computer Vision and Pattern Recognition',
          'Computation and Language',
          'Robotics'
        ]
      };

      // Only update session interests for authenticated users
      if (user) {
        // For authenticated users, session interests can override their profile
        // This allows temporary preview before saving
      } else {
        // For unauthenticated users, don't update session interests
        // Categories will always remain as defaults
      }
    } else {
      // Reset session interests when no field selected (only for authenticated users)
      if (user) {
        setSessionResearchInterests(null);
      }
    }
  };

  const handleSaveFieldCategoriesToProfile = async (categories) => {
    if (!user) return;
    
    try {
      await handleResearchInterestsChange(categories);
      console.log('✅ Field quiz categories saved to profile:', categories);
    } catch (error) {
      console.error('❌ Failed to save field quiz categories:', error);
      throw error;
    }
  };

  // Handle random category selection
  const handleRandomCategory = () => {
    // Get all available categories from the displayed interests
    const availableCategories = displayResearchInterests.filter(cat => cat !== selectedCategory);
    
    if (availableCategories.length > 0) {
      const randomIndex = Math.floor(Math.random() * availableCategories.length);
      const randomCategory = availableCategories[randomIndex];
      setSelectedCategory(randomCategory);
      
      // Scroll to results
      if (resultsRef.current) {
        const headerHeight = 80;
        const elementPosition = resultsRef.current.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.pageYOffset - headerHeight;
        
        window.scrollTo({
          top: offsetPosition,
          behavior: 'smooth'
        });
      }
    }
  };

  // For authenticated users: use session interests if available, otherwise user interests or defaults
  // For unauthenticated users: ALWAYS use default categories (never session interests)
  const displayResearchInterests = user 
    ? (sessionResearchInterests || userResearchInterests || defaultResearchInterests)
    : defaultResearchInterests;

  // handleSkillLevelChange and handleResearchInterestsChange are now provided by UserContext

  // Get dark mode state
  const { isDarkMode } = useTheme();

  return (
    <div className={`min-h-screen relative overflow-hidden transition-colors duration-300 ${
      isDarkMode 
        ? 'bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950' 
        : 'bg-gradient-to-br from-[#f5f0e8] via-[#faf7f2] to-[#ede8df]'
    }`}>
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className={`absolute top-0 right-0 w-96 h-96 rounded-full blur-3xl ${
          isDarkMode ? 'bg-gradient-to-bl from-green-900/20 to-transparent' : 'bg-gradient-to-bl from-blue-400/10 to-transparent'
        }`}></div>
        <div className={`absolute bottom-0 left-0 w-96 h-96 rounded-full blur-3xl ${
          isDarkMode ? 'bg-gradient-to-tr from-emerald-900/20 to-transparent' : 'bg-gradient-to-tr from-purple-400/10 to-transparent'
        }`}></div>
        <div className={`absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full blur-3xl ${
          isDarkMode ? 'bg-gradient-to-r from-green-900/10 via-emerald-900/10 to-teal-900/10' : 'bg-gradient-to-r from-cyan-300/5 via-blue-300/5 to-purple-300/5'
        }`}></div>
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

      <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-2">
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

        

        {/* ═══════ REDESIGNED HOME PAGE ═══════ */}
        {!error && !searchTerm && (
          <>
            {/* ── SECTION 1: CINEMATIC HERO ── */}
            <section className="relative pt-4 sm:pt-8 pb-16 sm:pb-24 overflow-hidden">
              <div className={`absolute inset-0 ${isDarkMode ? 'dot-grid' : 'dot-grid-light'} opacity-40`} />
              <div className="absolute top-20 left-1/4 w-72 h-72 rounded-full blur-[120px] animate-glow-pulse" style={{ background: 'rgba(29,185,84,0.12)' }} />
              <div className="absolute bottom-10 right-1/4 w-96 h-96 rounded-full blur-[140px] animate-glow-pulse" style={{ background: 'rgba(245,158,11,0.08)', animationDelay: '1.5s' }} />

              <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center min-h-[420px] sm:min-h-[480px]">
                  {/* Left -- Headline + CTAs */}
                  <motion.div
                    initial={{ opacity: 0, x: -30 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.7, ease: 'easeOut' }}
                  >
                    <h1 className={`text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-[1.1] tracking-tight mb-5 ${
                      isDarkMode ? 'text-gradient-hero' : 'text-gradient-hero-light'
                    }`}>
                      AI Research,{' '}
                      <span className="text-gradient-pear">Simplified.</span>
                    </h1>

                    <p className={`text-base sm:text-lg leading-relaxed max-w-lg mb-8 ${
                      isDarkMode ? 'text-gray-400' : 'text-gray-600'
                    }`}>
                      Browse thousands of cutting-edge papers, learn with AI-powered summaries, and earn rewards&nbsp;for&nbsp;what you discover.
                    </p>

                    <div className="flex flex-wrap gap-3">
                      <button
                        onClick={scrollToArticles}
                        className="inline-flex items-center px-6 py-3 text-sm font-semibold text-white rounded-xl transition-all hover:shadow-lg hover:shadow-emerald-500/20 hover:scale-[1.02] active:scale-[0.98]"
                        style={{ backgroundColor: '#1db954' }}
                      >
                        Explore Papers
                        <ArrowDown className="ml-2 w-4 h-4" />
                      </button>
                      <button
                        onClick={handleOpenFieldQuiz}
                        className={`inline-flex items-center px-6 py-3 text-sm font-semibold rounded-xl border transition-all hover:shadow-md hover:scale-[1.02] active:scale-[0.98] ${
                          isDarkMode
                            ? 'border-gray-700 text-gray-200 hover:bg-gray-800'
                            : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        <Sparkles className="mr-2 w-4 h-4" style={{ color: '#1db954' }} />
                        Personalize Feed
                      </button>
                    </div>

                    {/* Floating stat pills */}
                    <div className="flex flex-wrap gap-3 mt-8">
                      {[
                        { label: 'Papers', value: '10k+' },
                        { label: 'Authors', value: '1M+' },
                        { label: 'Access', value: 'Free' },
                      ].map((stat, i) => (
                        <motion.div
                          key={stat.label}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.5 + i * 0.12, duration: 0.5 }}
                          className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl border text-sm ${
                            isDarkMode
                              ? 'bg-gray-800/70 border-gray-700 text-gray-300'
                              : 'bg-white/80 border-gray-200 text-gray-700 shadow-sm'
                          }`}
                        >
                          <span className="font-bold" style={{ color: '#1db954' }}>{stat.value}</span>
                          <span className={`${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>{stat.label}</span>
                        </motion.div>
                      ))}
                    </div>
                  </motion.div>

                  {/* Right -- Spotlight Paper Card */}
                  <motion.div
                    initial={{ opacity: 0, x: 30 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.7, delay: 0.15, ease: 'easeOut' }}
                    className="flex justify-center lg:justify-end"
                  >
                    <AnimatePresence mode="wait">
                    {!spotlightArticle || !spotlightTypingComplete ? (
                      <motion.div
                        key="loading"
                        exit={{ opacity: 0, y: -8 }}
                        transition={{ duration: 0.35 }}
                        className="w-full"
                      >
                      <div className={`relative rounded-2xl border overflow-hidden w-full min-h-[280px] ${
                        isDarkMode ? 'bg-gray-800/80 border-gray-700' : 'bg-white/80 border-gray-200'
                      } ${isDarkMode ? 'glass' : 'glass-light'}`}>
                        <div className="h-full flex flex-col p-8 justify-center items-center min-h-[280px]">
                          <div className="text-center w-full">
                            <h3 className={`text-xl sm:text-2xl font-bold mb-3 overflow-hidden whitespace-nowrap border-r-2 pr-1 animate-typing mx-auto ${
                              isDarkMode ? 'text-white border-gray-400' : 'text-gray-900 border-gray-800'
                            }`} style={{ fontFamily: "'Fira Code', monospace" }}>
                              Welcome to <span className="animate-syntaxHighlight">Pearadox</span>
                            </h3>
                            <p className={`text-sm animate-fadeInDelayed opacity-0 italic ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                              Surfacing something worth reading...
                            </p>
                          </div>
                        </div>
                        <style>{`
                          @import url('https://fonts.googleapis.com/css2?family=Fira+Code:wght@400;600&display=swap');
                          @keyframes typing { from { width: 0ch } to { width: 19ch } }
                          @keyframes blink { 0%, 100% { border-color: transparent } 50% { border-color: currentColor } }
                          @keyframes syntaxHighlight { 0%, 60% { color: inherit } 100% { color: #1db954 } }
                          @keyframes fadeInDelayed { 0%, 60% { opacity: 0 } 100% { opacity: 1 } }
                          .animate-typing { display: inline-block; width: 0ch; overflow: hidden; animation: typing 2s steps(19, end) forwards, blink 0.75s step-end 4; }
                          .animate-fadeInDelayed { animation: fadeInDelayed 2.5s ease-out forwards; }
                          .animate-syntaxHighlight { animation: syntaxHighlight 2s ease-out forwards; }
                        `}</style>
                      </div>
                      </motion.div>
                    ) : (
                      <motion.div
                        key="spotlight"
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, ease: 'easeOut' }}
                        className="w-full"
                      >
                      <div
                        className={`relative rounded-2xl border overflow-hidden w-full cursor-pointer group transition-all duration-300 hover:-translate-y-1 ${
                          isDarkMode
                            ? 'bg-gray-800/80 border-amber-600/40 hover:border-amber-500 glow-amber'
                            : 'bg-white/90 border-amber-200 hover:border-amber-400 shadow-lg hover:shadow-xl'
                        } ${isDarkMode ? 'glass' : 'glass-light'}`}
                        onClick={() => handleArticleClick(spotlightArticle)}
                      >
                        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-400 via-orange-400 to-amber-400" />

                        <div className="p-5 sm:p-6 flex flex-col h-full">
                          <div className="flex items-center gap-2 mb-4">
                            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${
                              isDarkMode ? 'bg-amber-900/50 text-amber-300' : 'bg-amber-100 text-amber-700'
                            }`}>
                              <Sparkles className="w-3 h-3" /> Today's Spotlight
                            </span>
                            <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                              isDarkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-600'
                            }`}>
                              {spotlightArticle.category}
                            </span>
                          </div>

                          <h4 className={`text-lg sm:text-xl font-bold leading-tight mb-3 line-clamp-2 group-hover:text-amber-500 transition-colors ${
                            isDarkMode ? 'text-white' : 'text-gray-900'
                          }`}>
                            {spotlightArticle.title}
                          </h4>

                          <p className={`text-sm leading-relaxed line-clamp-3 mb-4 flex-1 ${
                            isDarkMode ? 'text-gray-400' : 'text-gray-600'
                          }`}>
                            {spotlightArticle.shortDescription}
                          </p>

                          <div className={`flex items-center justify-between pt-3 border-t ${
                            isDarkMode ? 'border-gray-700' : 'border-gray-100'
                          }`}>
                            <div className={`flex items-center text-xs ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                              <User className="w-3 h-3 mr-1.5" />
                              <span className="truncate max-w-[140px]">{spotlightArticle.authors?.split(',')[0]}{spotlightArticle.authors?.split(',').length > 1 ? ' et al.' : ''}</span>
                            </div>
                            <span className="inline-flex items-center px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-white rounded-lg font-medium text-xs transition-colors">
                              Read <ArrowRight className="w-3 h-3 ml-1.5" />
                            </span>
                          </div>
                        </div>
                      </div>
                      </motion.div>
                    )}
                    </AnimatePresence>
                  </motion.div>
                </div>
              </div>
            </section>

            {/* ── SECTION 2: SOCIAL PROOF (TESTIMONIALS + TRUSTED BY) ── */}
            <RevealOnScroll>
              <section className="py-10 sm:py-14 overflow-hidden">
                <div className="mx-auto max-w-7xl">
                  <TestimonialCarousel />
                </div>
              </section>
            </RevealOnScroll>

            {/* ── SECTION 3: HOW IT WORKS ── */}
            <RevealOnScroll>
              <section className="py-12 sm:py-16">
                <div className="mx-auto max-w-5xl px-4 sm:px-6">
                  <div className="text-center mb-10 sm:mb-14">
                    <h2 className={`text-2xl sm:text-3xl lg:text-4xl font-bold mb-3 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                      How It Works
                    </h2>
                    <p className={`text-sm sm:text-base max-w-xl mx-auto ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                      From complex papers to real understanding — in three steps
                    </p>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
                    {[
                      {
                        icon: BookOpen,
                        title: 'Browse',
                        desc: '10,000+ papers simplified for any skill level. Filter by topic and discover research that matters to you.',
                        accent: '#1db954',
                      },
                      {
                        icon: GraduationCap,
                        title: 'Learn',
                        desc: 'AI-generated summaries break down complex findings. Quizzes test and reinforce what you learn.',
                        accent: '#3b82f6',
                      },
                      {
                        icon: Coins,
                        title: 'Earn',
                        desc: 'Answer quiz questions correctly to earn PEAR tokens. Redeem them in the store for real rewards.',
                        accent: '#f59e0b',
                      },
                    ].map((step, i) => (
                      <motion.div
                        key={step.title}
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, margin: '-60px' }}
                        transition={{ delay: i * 0.15, duration: 0.5 }}
                        className={`relative rounded-2xl border p-6 sm:p-8 text-center transition-all duration-300 hover:shadow-lg hover:-translate-y-1 group ${
                          isDarkMode ? 'bg-gray-800/70 border-gray-700' : 'bg-white border-gray-200'
                        }`}
                      >
                        <div className="absolute -top-px left-1/2 -translate-x-1/2 w-12 h-1 rounded-b-full" style={{ backgroundColor: step.accent }} />
                        <div
                          className="w-14 h-14 rounded-2xl mx-auto mb-5 flex items-center justify-center transition-transform group-hover:scale-110"
                          style={{ backgroundColor: `${step.accent}15` }}
                        >
                          <step.icon className="w-7 h-7" style={{ color: step.accent }} />
                        </div>
                        <div className={`text-xs font-bold uppercase tracking-wider mb-2 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                          Step {i + 1}
                        </div>
                        <h3 className={`text-lg font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{step.title}</h3>
                        <p className={`text-sm leading-relaxed ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>{step.desc}</p>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </section>
            </RevealOnScroll>

            {/* ── SECTION 4: FEATURED PAPERS GRID ── */}
            {!isLoading && filteredArticles.length >= 6 && (
              <RevealOnScroll>
                <section className="py-12 sm:py-16">
                  <div className="mx-auto max-w-7xl px-4 sm:px-6">
                    <div className="flex items-end justify-between mb-8 sm:mb-10">
                      <div>
                        <h2 className={`text-2xl sm:text-3xl font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                          Featured Research
                        </h2>
                        <p className={`text-sm sm:text-base ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                          Hand-picked papers from today's feed
                        </p>
                      </div>
                      <button
                        onClick={scrollToArticles}
                        className={`hidden sm:inline-flex items-center gap-1.5 text-sm font-medium transition-colors ${
                          isDarkMode ? 'text-gray-400 hover:text-white' : 'text-gray-500 hover:text-gray-900'
                        }`}
                      >
                        View all <ArrowRight className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                      {filteredArticles.slice(0, 6).map((article, i) => (
                        <motion.div
                          key={article.id}
                          initial={{ opacity: 0, y: 20 }}
                          whileInView={{ opacity: 1, y: 0 }}
                          viewport={{ once: true }}
                          transition={{ delay: i * 0.08, duration: 0.5 }}
                          className="cursor-pointer group"
                          onClick={() => handleArticleClick(article)}
                        >
                          <div className={`rounded-2xl border p-5 sm:p-6 h-full flex flex-col transition-all duration-300 hover:shadow-md hover:-translate-y-0.5 ${
                            isDarkMode ? 'bg-gray-800/80 border-gray-700 hover:border-gray-600' : 'bg-white border-gray-200 hover:border-gray-300'
                          }`}>
                            <div className="flex flex-wrap gap-1.5 mb-3">
                              {article.categories?.filter(c => !c.includes('.') && !c.includes(',')).slice(0, 2).map((cat, ci) => (
                                <span key={ci} className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                                  isDarkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-600'
                                }`}>{cat}</span>
                              ))}
                            </div>
                            <h4 className={`text-base font-bold leading-snug mb-2 line-clamp-2 group-hover:text-emerald-500 transition-colors ${
                              isDarkMode ? 'text-white' : 'text-gray-900'
                            }`}>{article.title}</h4>
                            <p className={`text-sm leading-relaxed line-clamp-2 mb-4 flex-1 ${
                              isDarkMode ? 'text-gray-400' : 'text-gray-600'
                            }`}>{article.shortDescription}</p>
                            <div className={`flex items-center justify-between pt-3 border-t ${isDarkMode ? 'border-gray-700' : 'border-gray-100'}`}>
                              <span className={`text-xs ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>{article.publishedDate}</span>
                              <span className="text-xs font-semibold" style={{ color: '#1db954' }}>Read →</span>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                </section>
              </RevealOnScroll>
            )}

            {/* ── SECTION 5: PEAR TOKENS + RESEARCH HUB (COMBINED) ── */}
            <RevealOnScroll>
              <section className="py-12 sm:py-16">
                <div className="mx-auto max-w-7xl px-4 sm:px-6">
                  <div className={`relative rounded-3xl border overflow-hidden ${
                    isDarkMode
                      ? 'bg-gradient-to-br from-gray-800 via-gray-800/95 to-gray-900 border-gray-700'
                      : 'bg-white border-gray-300 shadow-md'
                  }`}>
                    <div className="absolute top-0 right-0 w-60 h-60 rounded-full blur-[100px] opacity-30" style={{ background: 'rgba(245,158,11,0.25)' }} />
                    <div className="absolute bottom-0 left-0 w-48 h-48 rounded-full blur-[80px] opacity-20" style={{ background: 'rgba(29,185,84,0.2)' }} />

                    <div className="relative grid grid-cols-1 lg:grid-cols-2 gap-0 lg:gap-0">
                      {/* Left -- PEAR Tokens */}
                      <div className={`p-6 sm:p-8 lg:p-10 ${isDarkMode ? '' : ''}`}>
                        <div className="flex items-center gap-3 mb-5">
                          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-yellow-500 flex items-center justify-center shadow-md">
                            <Coins className="w-5 h-5 text-white" />
                          </div>
                          <h3 className="text-xl font-bold bg-gradient-to-r from-amber-500 to-yellow-500 bg-clip-text text-transparent">PEAR Tokens</h3>
                        </div>

                        {user ? (
                          <div className="space-y-5">
                            <div className="flex items-center gap-4">
                              <div className="relative group/token cursor-pointer flex-shrink-0">
                                <div className="absolute inset-0 rounded-full bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-400 blur-md opacity-60 group-hover/token:opacity-100 animate-pulse" />
                                <div className="absolute -inset-1 rounded-full bg-gradient-to-r from-yellow-400 to-amber-500 opacity-30 blur-sm" />
                                <div className="relative w-16 h-16 rounded-full bg-gradient-to-br from-amber-300 via-yellow-400 to-amber-500 flex items-center justify-center shadow-lg border-2 border-yellow-300/50 group-hover/token:scale-110 transition-transform duration-300">
                                  <div className="absolute inset-1 rounded-full bg-gradient-to-br from-white/40 via-transparent to-transparent" />
                                  <div className="absolute inset-0 rounded-full overflow-hidden">
                                    <div className="absolute -inset-full bg-gradient-to-r from-transparent via-white/30 to-transparent rotate-45 translate-x-[-100%] group-hover/token:translate-x-[200%] transition-transform duration-1000" />
                                  </div>
                                  <span className="relative text-2xl font-bold text-white drop-shadow-md">
                                    {isLoadingTokens ? '...' : availableBalance}
                                  </span>
                                </div>
                              </div>
                              <div>
                                <div className={`text-sm font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Available Balance</div>
                                <div className={`text-xs ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>Earn more by answering quizzes correctly</div>
                              </div>
                            </div>
                            <button
                              onClick={() => { navigate('/store'); setTimeout(() => window.scrollTo({ top: 0, behavior: 'instant' }), 0); }}
                              className="inline-flex items-center px-5 py-2.5 text-sm font-semibold text-white rounded-xl bg-gradient-to-r from-amber-500 to-yellow-600 transition-all hover:shadow-lg hover:scale-[1.02] active:scale-[0.98]"
                            >
                              Redeem in Store
                              <ArrowRight className="ml-2 w-4 h-4" />
                            </button>
                          </div>
                        ) : (
                          <div className="space-y-4">
                            <p className={`text-sm leading-relaxed ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                              Answer quiz questions to earn PEAR tokens and unlock exclusive rewards in the store.
                            </p>
                            <button
                              onClick={() => setIsAccountOpen(true)}
                              className="inline-flex items-center px-5 py-2.5 text-sm font-semibold text-white rounded-xl bg-gradient-to-r from-amber-500 to-yellow-600 transition-all hover:shadow-lg"
                            >
                              Start Earning <ArrowRight className="ml-2 w-4 h-4" />
                            </button>
                          </div>
                        )}
                      </div>

                      {/* Right -- Research Hub */}
                      <div className={`p-6 sm:p-8 lg:p-10 border-t lg:border-t-0 lg:border-l ${
                        isDarkMode ? 'border-gray-700' : 'border-gray-200'
                      }`}>
                        <div className="flex items-center gap-3 mb-5">
                          <div className="w-10 h-10 rounded-xl flex items-center justify-center shadow-md" style={{ backgroundColor: '#1db954' }}>
                            <User className="w-5 h-5 text-white" />
                          </div>
                          <div>
                            <h3 className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                              {user ? 'Your Research Hub' : 'Personalize Your Feed'}
                            </h3>
                            <p className={`text-xs ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                              {user ? `Welcome back, ${userProfile?.full_name || user.email?.split('@')[0] || 'researcher'}` : 'Track your learning journey'}
                            </p>
                          </div>
                        </div>

                        {user ? (
                          <div className="grid grid-cols-3 gap-3">
                            {[
                              { value: analyticsData?.totalViews || 0, label: 'Papers Read' },
                              { value: analyticsData?.categoriesViewed?.length || 0, label: 'Topics Covered' },
                              { value: weeklyData.reduce((sum, day) => sum + day.views, 0), label: 'This Week' },
                            ].map((stat) => (
                              <div key={stat.label} className={`rounded-xl p-3 text-center border ${
                                isDarkMode ? 'bg-gray-700/50 border-gray-600' : 'bg-gray-50 border-gray-200 shadow-sm'
                              }`}>
                                <div className="text-2xl font-bold" style={{ color: '#1db954' }}>{stat.value}</div>
                                <div className={`text-[10px] font-medium mt-0.5 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>{stat.label}</div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="space-y-4">
                            <p className={`text-sm leading-relaxed ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                              Create a free account to save articles, track your reading stats, and get personalized recommendations.
                            </p>
                            <button
                              onClick={handleShowAccount}
                              className="inline-flex items-center px-5 py-2.5 text-sm font-semibold text-white rounded-xl transition-all hover:shadow-lg hover:shadow-emerald-500/20"
                              style={{ backgroundColor: '#1db954' }}
                            >
                              Get Started Free <ArrowRight className="ml-2 w-4 h-4" />
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </section>
            </RevealOnScroll>

            {/* ── SECTION 6: FIELD QUIZ + BROWSE BY TOPIC ── */}
            <RevealOnScroll>
              <section className="py-12 sm:py-16">
                <div id="quiz-section" className="mb-8">
                  <FieldQuizButton onClick={handleOpenFieldQuiz} />
                </div>

                <div id="categories-section" className="text-center mb-6 sm:mb-8">
                  <h3 className={`text-xl sm:text-2xl font-bold mb-2 px-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    Browse by Topic
                  </h3>
                  <p className={`text-sm sm:text-base px-4 max-w-xl mx-auto ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    Select a research area to filter articles
                  </p>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4 max-w-5xl mx-auto px-4 mb-8">
                  {displayResearchInterests.map((researchInterest, index) => {
                    const Icon = getCategoryIcon(researchInterest);
                    const isSelected = selectedCategory === researchInterest;

                    return (
                      <motion.button
                        key={researchInterest}
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, margin: '-40px' }}
                        transition={{ delay: index * 0.04, duration: 0.4 }}
                        onClick={() => setSelectedCategory(isSelected ? '' : researchInterest)}
                        className={`group relative p-4 sm:p-5 rounded-xl border-2 transition-all duration-200 hover:shadow-md ${
                          isSelected
                            ? 'bg-gray-900 border-gray-900 shadow-lg'
                            : isDarkMode
                              ? 'bg-gray-800 border-gray-700 hover:border-gray-600'
                              : 'bg-white border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className="flex flex-col items-center justify-center space-y-2 sm:space-y-3">
                          <div className={`p-2.5 sm:p-3 rounded-xl transition-colors ${
                            isSelected
                              ? 'bg-white/10'
                              : isDarkMode
                                ? 'bg-gray-700 group-hover:bg-gray-600'
                                : 'bg-gray-100 group-hover:bg-gray-200'
                          }`}>
                            <Icon className={`h-5 w-5 sm:h-6 sm:w-6 transition-colors ${
                              isSelected ? 'text-white' : isDarkMode ? 'text-gray-300' : 'text-gray-600'
                            }`} />
                          </div>
                          <span className={`text-xs sm:text-sm font-semibold leading-tight text-center ${
                            isSelected ? 'text-white' : isDarkMode ? 'text-gray-300' : 'text-gray-700'
                          }`}>
                            {shortenCategoryName(researchInterest)}
                          </span>
                        </div>
                        {isSelected && (
                          <div className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full flex items-center justify-center" style={{ backgroundColor: '#1db954' }}>
                            <CheckCircle className="h-3 w-3 text-white" />
                          </div>
                        )}
                      </motion.button>
                    );
                  })}

                  <button
                    onClick={handleRandomCategory}
                    className={`group relative p-4 rounded-xl border-2 border-dashed transition-all duration-200 sm:hidden ${
                      isDarkMode
                        ? 'border-gray-600 bg-gray-800 hover:bg-gray-700 hover:border-gray-500'
                        : 'border-gray-300 bg-gray-50 hover:bg-gray-100 hover:border-gray-400'
                    }`}
                  >
                    <div className="flex flex-col items-center justify-center space-y-2">
                      <div className={`p-2.5 rounded-xl ${isDarkMode ? 'bg-gray-700' : 'bg-white'}`}>
                        <Shuffle className={`h-5 w-5 group-hover:rotate-180 transition-transform duration-300 ${
                          isDarkMode ? 'text-gray-400' : 'text-gray-500'
                        }`} />
                      </div>
                      <span className={`text-xs font-semibold ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        Surprise Me
                      </span>
                    </div>
                  </button>
                </div>
              </section>
            </RevealOnScroll>
          </>
        )}

        {/* Loading State - Appears below Pick a Category */}
        {isLoading && (
          <div className="text-center py-12 sm:py-16">
            <div className="relative inline-block mb-6 sm:mb-8">
              <div className="absolute inset-0 bg-gradient-to-r from-green-500/20 to-emerald-500/20 rounded-2xl blur-xl"></div>
              <Loader2 className="relative mx-auto h-16 w-16 sm:h-20 sm:w-20 animate-spin" style={{ color: '#1db954' }} />
            </div>
            <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3 sm:mb-4">Loading Research Papers</h3>
            <p className="text-gray-500 max-w-md mx-auto text-sm sm:text-base px-4">
              Connecting to database and fetching latest scientific discoveries...
            </p>
          </div>
        )}

        {/* Results Header */}
        {!isLoading && !error && (
          <div className="mb-6 sm:mb-8 px-4 sm:px-0" ref={resultsRef}>
            <div className="flex items-center justify-between">
              <div>
                <h3 className={`text-xl sm:text-2xl font-bold mb-1 sm:mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  {selectedCategoryDisplay ? `${categories.find(c => c.category_name === selectedCategoryDisplay)?.category_name || selectedCategoryDisplay}` : 'Latest Research'}
                </h3>
                <p className={`text-sm sm:text-base ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  {lastRefreshDate ? `Last Refresh: ${lastRefreshDate}` : 'Data loading...'}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Articles Grid */}
        {!isLoading && !error && filteredArticles.length > 0 ? (
          <div id="articles-grid" className="px-4 sm:px-0 scroll-mt-24">
            <div className="grid gap-4 sm:gap-6 md:gap-8 md:grid-cols-2 lg:grid-cols-3">
              {currentArticles.map((article, i) => (
                <motion.div
                  key={article.id}
                  initial={{ opacity: 0, y: 24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-40px' }}
                  transition={{ delay: Math.min(i * 0.05, 0.4), duration: 0.45 }}
                >
                  <ArticleCard
                    article={article}
                    onClick={handleArticleClick}
                    isFavorite={favorites.has(article.id)}
                    onToggleFavorite={handleToggleFavorite}
                  />
                </motion.div>
              ))}
            </div>

            {/* Pagination - Mobile optimized */}
            {totalPages > 1 && (
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mt-8 sm:mt-12 px-4">
                {/* Previous Button */}
                <button
                  onClick={() => {
                    setCurrentPage(prev => Math.max(prev - 1, 1));
                    setTimeout(() => {
                      const articlesSection = document.getElementById('articles-grid');
                      if (articlesSection) {
                        articlesSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
                      }
                    }, 50);
                  }}
                  disabled={currentPage === 1}
                  className={`w-full sm:w-auto flex items-center justify-center px-5 py-2.5 rounded-xl border disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-200 font-medium text-sm ${
                    isDarkMode 
                      ? 'border-gray-700 bg-gray-800 text-gray-300 hover:bg-gray-700 hover:border-gray-600' 
                      : 'border-gray-200 bg-white text-gray-700 hover:bg-gray-50 hover:border-gray-300'
                  }`}
                >
                  <ChevronLeft className="h-4 w-4 mr-1.5" />
                  Previous
                </button>

                {/* Page Numbers */}
                <div className="flex items-center justify-center gap-1.5 py-2">
                  {Array.from({ length: totalPages }, (_, i) => {
                    const pageNum = i + 1;
                    const isActive = pageNum === currentPage;
                    
                    // Show first page, last page, current page, and pages around current
                    const showPage = pageNum === 1 || 
                                   pageNum === totalPages || 
                                   Math.abs(pageNum - currentPage) <= 1;
                    
                    if (!showPage && pageNum === 2 && currentPage > 4) {
                      return <span key={pageNum} className={`w-10 text-center text-sm ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>...</span>;
                    }
                    
                    if (!showPage && pageNum === totalPages - 1 && currentPage < totalPages - 3) {
                      return <span key={pageNum} className={`w-10 text-center text-sm ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>...</span>;
                    }
                    
                    if (!showPage) return null;

                    return (
                      <button
                        key={pageNum}
                        onClick={() => {
                          setCurrentPage(pageNum);
                          setTimeout(() => {
                            const articlesSection = document.getElementById('articles-grid');
                            if (articlesSection) {
                              articlesSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
                            }
                          }, 50);
                        }}
                        className={`w-10 h-10 rounded-xl font-medium transition-all duration-200 text-sm flex items-center justify-center ${
                          isActive
                            ? 'text-white shadow-md'
                            : isDarkMode 
                              ? 'bg-gray-800 border border-gray-700 text-gray-300 hover:bg-gray-700 hover:border-gray-600' 
                              : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 hover:border-gray-300'
                        }`}
                        style={isActive ? { backgroundColor: '#1db954' } : {}}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                </div>

                {/* Next Button */}
                <button
                  onClick={() => {
                    setCurrentPage(prev => Math.min(prev + 1, totalPages));
                    setTimeout(() => {
                      const articlesSection = document.getElementById('articles-grid');
                      if (articlesSection) {
                        articlesSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
                      }
                    }, 50);
                  }}
                  disabled={currentPage === totalPages}
                  className={`w-full sm:w-auto flex items-center justify-center px-5 py-2.5 rounded-xl border disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-200 font-medium text-sm ${
                    isDarkMode 
                      ? 'border-gray-700 bg-gray-800 text-gray-300 hover:bg-gray-700 hover:border-gray-600' 
                      : 'border-gray-200 bg-white text-gray-700 hover:bg-gray-50 hover:border-gray-300'
                  }`}
                >
                  Next
                  <ChevronRight className="h-4 w-4 ml-1.5" />
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
        user={user}
        onOpenAccountModal={() => setIsAccountOpen(true)}
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

      <FieldQuiz 
        onFieldSelect={handleFieldSelect}
        selectedField={selectedField}
        user={user}
        onSaveToProfile={handleSaveFieldCategoriesToProfile}
        isOpen={isFieldQuizOpen}
        onClose={handleCloseFieldQuiz}
        onOpenAccount={handleShowAccount}
      />

      <Footer onContactClick={handleShowContact} />

      {/* Loading indicator for direct article access - only show if modal is not open */}
      {isLoadingSpecificArticle && !isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-8 shadow-2xl max-w-sm w-full mx-4">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto mb-4" style={{ borderColor: '#1db954' }}></div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Loading Article...</h3>
              <p className="text-sm text-gray-600">Fetching the latest research content for you.</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;