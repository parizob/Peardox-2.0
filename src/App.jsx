import React, { useState, useMemo, useEffect, useRef } from 'react';
import { BookOpen, Loader2, AlertCircle, Search, Filter, Bookmark, Brain, Eye, Bot, Wrench, Code, ChevronLeft, ChevronRight, Cpu, Zap, Shield, Microscope, Network, Database, Globe, Smartphone, Camera, FileText, Users, TrendingUp, BarChart, Settings, Lightbulb, Atom, Dna, Activity, Monitor, Wifi, ArrowRight, User, UserPlus, Unlock, Target, Clock, Building2, MessageCircle, Smartphone as SmartphoneIcon, CheckCircle, Sparkles } from 'lucide-react';
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
import { arxivAPI, authAPI, savedArticlesAPI, viewedArticlesAPI, supabase } from './lib/supabase';

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
  // TODO: In the future, replace this with a function that fetches specifically curated/trending articles
  // For example: await arxivAPI.getSpotlightArticle() or await arxivAPI.getTrendingArticle()
  const selectSpotlightArticle = () => {
    if (articles.length > 0) {
      // Create a date-based seed that changes daily
      const today = new Date();
      const dateString = `${today.getFullYear()}-${today.getMonth()}-${today.getDate()}`;
      
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

  // For authenticated users: use session interests if available, otherwise user interests or defaults
  // For unauthenticated users: ALWAYS use default categories (never session interests)
  const displayResearchInterests = user 
    ? (sessionResearchInterests || userResearchInterests || defaultResearchInterests)
    : defaultResearchInterests;

  // handleSkillLevelChange and handleResearchInterestsChange are now provided by UserContext

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

        

        {/* Main Hero Section with CTA */}
        {!error && !searchTerm && (
          <div className="pt-2 sm:pt-2 pb-12 sm:pb-20 mb-8 sm:mb-12">
            <div className="mx-auto max-w-6xl px-4 sm:px-6">
              <div className="text-center mb-8 sm:mb-12">
                <h2 className="font-sans text-4xl sm:text-5xl md:text-6xl font-bold text-gray-900 mb-3 sm:mb-4 leading-tight px-2">
                  AI Research, Simplified
                </h2>
                <p className="text-base sm:text-lg text-gray-600 max-w-3xl mx-auto leading-relaxed px-4">
                From learning the basics to mastering the latest — AI research made clear in minutes.
                </p>
              </div>

              {/* Research Of The Day Spotlight - Side by side with Start Exploring */}
              <div id="spotlight-section" className="mb-8 sm:mb-12">
                <div className="mx-auto max-w-7xl px-4 sm:px-6">
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                    {/* Spotlight Article - Takes 8 columns on large screens */}
                    <div className="lg:col-span-8">
                  {!spotlightArticle ? (
                    <div className="relative bg-gradient-to-br from-white via-amber-50/30 to-orange-50 rounded-3xl shadow-2xl border-2 border-amber-200 overflow-hidden h-full min-h-[320px]">
                      {/* Subtle animated background */}
                      <div className="absolute inset-0 bg-gradient-to-br from-amber-50/30 to-orange-50/30"></div>
                      
                      {/* Content with gentle fade */}
                      <div className="relative h-full flex flex-col p-6 sm:p-8 animate-pulse">
                        {/* Top badges skeleton - subtle */}
                        <div className="flex items-center space-x-2 mb-6 pt-2">
                          <div className="h-7 w-28 bg-amber-200/40 rounded-full"></div>
                          <div className="h-7 w-32 bg-gray-200/40 rounded-full"></div>
                        </div>
                        
                        {/* Today's Spotlight text - elegant and simple */}
                        <div className="flex-1 flex flex-col items-center justify-center">
                          <div className="text-center space-y-3">
                            <h3 className="text-2xl sm:text-3xl font-bold text-amber-600/80">
                              Today's Spotlight
                            </h3>
                            <div className="h-1 w-24 bg-gradient-to-r from-transparent via-amber-400/60 to-transparent rounded-full"></div>
                          </div>
                        </div>
                        
                        {/* Bottom skeleton - very subtle */}
                        <div className="space-y-3">
                          <div className="h-4 bg-gray-200/40 rounded-lg w-3/4"></div>
                          <div className="flex items-center justify-between">
                            <div className="h-8 w-32 bg-amber-100/40 rounded-lg"></div>
                            <div className="h-10 w-28 bg-amber-200/40 rounded-xl"></div>
                          </div>
                        </div>
                      </div>
                      
                      {/* Trending badge - subtle */}
                      <div className="absolute top-6 right-6 animate-pulse">
                        <div className="bg-gradient-to-br from-amber-200/50 to-orange-200/50 rounded-xl px-4 py-2 shadow-md">
                          <div className="text-center">
                            <div className="text-2xl font-bold text-amber-600/60 leading-none mb-0.5">⭐</div>
                            <div className="text-[10px] font-semibold text-amber-700/60 uppercase tracking-wide">Featured</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="animate-[fadeIn_0.6s_ease-in]">
                      <div 
                        className="relative bg-gradient-to-br from-white via-amber-50/30 to-orange-50 rounded-3xl shadow-2xl border-2 border-amber-200 hover:border-amber-300 hover:shadow-3xl transition-all duration-500 cursor-pointer group overflow-hidden h-full min-h-[320px]"
                      onClick={() => handleArticleClick(spotlightArticle)}
                    >
                      {/* Animated background decorations */}
                        <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-bl from-amber-300/20 to-transparent rounded-full blur-3xl animate-pulse"></div>
                        <div className="absolute bottom-0 left-0 w-32 h-32 bg-gradient-to-tr from-orange-300/20 to-transparent rounded-full blur-2xl animate-pulse" style={{ animationDelay: '1s' }}></div>
                      
                      {/* Glowing border effect */}
                      <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-amber-400 via-orange-400 to-amber-400 opacity-0 group-hover:opacity-20 transition-opacity duration-500 blur-sm"></div>
                        
                        {/* Top right corner badge - hidden on mobile */}
                        <div className="hidden sm:block absolute top-6 right-6">
                          <div className="bg-gradient-to-br from-amber-400 to-orange-500 text-white rounded-xl px-4 py-2 shadow-lg transform group-hover:scale-110 transition-transform duration-300">
                            <div className="text-center">
                              <div className="text-2xl font-bold leading-none mb-0.5">#1</div>
                              <div className="text-[10px] font-semibold uppercase tracking-wide">Trending</div>
                            </div>
                          </div>
                        </div>
                      
                      {/* Content area */}
                        <div className="relative h-full flex flex-col p-4 sm:p-6 lg:p-8">
                          {/* Top section - badges with extra spacing */}
                          <div className="flex items-center space-x-2 mb-3 sm:mb-6 pt-1 sm:pt-2">
                            <span className="inline-flex items-center px-2 sm:px-3 py-1 sm:py-1.5 rounded-full text-[10px] sm:text-xs font-bold bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-md">
                              ⭐ SPOTLIGHT
                            </span>
                            <span className="inline-flex items-center px-2 sm:px-3 py-1 sm:py-1.5 rounded-full text-[10px] sm:text-xs font-semibold bg-white/80 text-gray-800 border border-amber-200 truncate max-w-[120px] sm:max-w-none">
                              {spotlightArticle.category}
                            </span>
                          </div>
                          
                          {/* Middle section - title and description with better spacing */}
                          <div className="flex-1 mb-4 sm:mb-6 mt-1 sm:mt-2">
                            <h4 className="text-lg sm:text-2xl lg:text-3xl font-bold text-gray-900 mb-2 sm:mb-5 leading-tight group-hover:text-amber-700 transition-colors sm:line-clamp-2">
                            {spotlightArticle.title}
                          </h4>
                          
                            <p className="text-gray-700 text-sm sm:text-base leading-relaxed line-clamp-3 sm:line-clamp-3">
                            {spotlightArticle.shortDescription}
                          </p>
                        </div>
                        
                          {/* Bottom section - metadata and CTA */}
                          <div className="space-y-2 sm:space-y-3">
                            <div className="flex items-center text-xs sm:text-sm text-gray-600">
                              <User className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2 flex-shrink-0" />
                              <span className="truncate text-xs sm:text-sm">{spotlightArticle.authors.split(',')[0]}{spotlightArticle.authors.split(',').length > 1 ? ' et al.' : ''}</span>
                              <span className="mx-1 sm:mx-2 hidden xs:inline">•</span>
                              <span className="flex-shrink-0 text-xs sm:text-sm hidden xs:inline">{spotlightArticle.publishedDate}</span>
                          </div>
                          
                            <div className="flex items-center justify-between pt-1 sm:pt-2 gap-2">
                              <div className="text-[10px] sm:text-xs text-amber-700 font-medium bg-amber-50 px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg whitespace-nowrap">
                                📖 Featured
                            </div>
                              <div className="inline-flex items-center px-3 sm:px-5 py-2 sm:py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-xl font-semibold text-xs sm:text-sm shadow-md hover:shadow-lg transform group-hover:scale-105 transition-all whitespace-nowrap">
                                <span>Read Now</span>
                                <ArrowRight className="h-3 w-3 sm:h-4 sm:w-4 ml-1 sm:ml-2 group-hover:translate-x-1 transition-transform" />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
                          </div>
                          
                    {/* Start Exploring Section - Takes 4 columns on large screens */}
                    <div className="lg:col-span-4">
                      <div className="bg-gradient-to-br from-white via-green-50/30 to-white rounded-3xl shadow-2xl border border-gray-200 p-4 sm:p-6 lg:p-8 lg:h-full lg:min-h-[320px] flex flex-col lg:justify-between relative overflow-hidden group hover:shadow-3xl transition-all duration-500">
                        {/* Decorative Elements */}
                        <div className="absolute top-0 left-0 w-48 h-48 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-700" style={{ background: 'radial-gradient(circle, rgba(29, 185, 84, 0.12) 0%, rgba(22, 161, 74, 0.04) 100%)' }}></div>
                        
                        <div className="relative z-10">
                          {/* Title - matching spotlight title size */}
                          <h3 className="text-lg sm:text-2xl lg:text-3xl font-bold text-gray-900 mb-2 sm:mb-5 leading-tight">
                            Start Exploring Instantly
                          </h3>
                          
                          {/* Description - matching spotlight description */}
                          <p className="text-gray-700 text-sm sm:text-base leading-relaxed mb-4 sm:mb-6 line-clamp-3">
                            Dive into cutting-edge AI research immediately. Browse thousands of papers from top researchers.
                          </p>
                          
                          {/* Free Access badge */}
                          <div className="flex items-center space-x-2 mb-3">
                            <span className="inline-flex items-center px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg text-[10px] sm:text-xs font-medium whitespace-nowrap" style={{ backgroundColor: 'rgba(29, 185, 84, 0.1)', color: '#16a14a' }}>
                              🌟 Free Access
                            </span>
                            <span className="inline-flex items-center px-2 sm:px-3 py-1 sm:py-1.5 rounded-full text-[10px] sm:text-xs font-semibold bg-white/80 text-gray-800 border truncate max-w-[120px] sm:max-w-none" style={{ borderColor: 'rgba(29, 185, 84, 0.3)' }}>
                              No Account Required
                            </span>
                        </div>
                      </div>
                      
                        {/* Button row - matching spotlight bottom section */}
                        <div className="relative z-10 space-y-2 sm:space-y-3">
                          <div className="flex items-center text-xs sm:text-sm text-gray-600">
                            <span className="font-semibold" style={{ color: '#1db954' }}>1M+ Authors</span>
                            <span className="mx-1 sm:mx-2">•</span>
                            <span className="font-semibold" style={{ color: '#1db954' }}>10k+ Papers</span>
                            <span className="mx-1 sm:mx-2">•</span>
                            <span className="flex-shrink-0 font-semibold" style={{ color: '#1db954' }}>1 Place</span>
                          </div>
                          
                          <div className="pt-1 sm:pt-2">
                          <button
                              onClick={scrollToArticles}
                              className="w-full inline-flex items-center justify-center px-3 sm:px-5 py-2 sm:py-2.5 text-white rounded-xl font-semibold text-xs sm:text-sm shadow-md hover:shadow-lg transform group-hover:scale-105 transition-all relative overflow-hidden group/btn"
                              style={{ backgroundColor: '#1db954' }}
                              onMouseEnter={(e) => e.target.style.backgroundColor = '#16a14a'}
                              onMouseLeave={(e) => e.target.style.backgroundColor = '#1db954'}
                          >
                            {/* Shimmer effect */}
                              <div className="absolute inset-0 -translate-x-full group-hover/btn:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/30 to-transparent"></div>
                              <span className="relative z-10">Explore Now</span>
                          </button>
                      </div>
                    </div>
                          </div>
                    </div>

                    {/* Personalize Your Research Section - Takes 6 columns on large screens, positioned below Spotlight */}
                    <div className="lg:col-span-6">
                    <div className="bg-gradient-to-br from-white via-gray-50 to-white rounded-3xl shadow-2xl border border-gray-200 p-6 sm:p-8 h-full flex flex-col justify-between relative overflow-hidden group hover:shadow-3xl transition-all duration-500">
                      {/* Decorative Elements */}
                      <div className="absolute top-0 right-0 w-64 h-64 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-700" style={{ background: 'radial-gradient(circle, rgba(29, 185, 84, 0.1) 0%, rgba(22, 161, 74, 0.03) 100%)' }}></div>
                      <div className="absolute -bottom-10 -left-10 w-40 h-40 rounded-full blur-2xl" style={{ background: 'radial-gradient(circle, rgba(29, 185, 84, 0.08) 0%, rgba(22, 161, 74, 0.02) 100%)' }}></div>
                      
                      <div className="relative z-10">
                        {/* Title and badge */}
                        <div className="mb-6">
                          <div className="inline-flex items-center px-3 py-1 rounded-full mb-3" style={{ backgroundColor: 'rgba(29, 185, 84, 0.1)' }}>
                            <span className="text-xs font-bold uppercase tracking-wider" style={{ color: '#1db954' }}>
                              ✨ Tailored For You
                            </span>
                          </div>
                          <h3 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3 leading-tight">
                            Personalize Your Research Journey
                          </h3>
                          <p className="text-gray-600 text-sm sm:text-base leading-relaxed">
                            AI-curated research that adapts to your expertise and interests.
                          </p>
                        </div>
                        
                        {/* Feature highlights - dynamic based on user status */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
                          {user ? (
                            <>
                              {/* Logged in: Show user metrics from analytics */}
                              <div className="flex flex-col items-center justify-center p-3 bg-white/80 backdrop-blur-sm rounded-xl border border-gray-200 hover:border-gray-300 transition-all">
                                <div className="text-2xl font-bold" style={{ color: '#1db954' }}>
                                  {analyticsData?.totalViews || 0}
                          </div>
                                <div className="text-[10px] font-semibold text-gray-600 mt-1">Articles Read</div>
                      </div>
                      
                              <div className="flex flex-col items-center justify-center p-3 bg-white/80 backdrop-blur-sm rounded-xl border border-gray-200 hover:border-gray-300 transition-all">
                                <div className="text-2xl font-bold" style={{ color: '#1db954' }}>
                                  {analyticsData?.categoriesViewed?.length || 0}
                    </div>
                                <div className="text-[10px] font-semibold text-gray-600 mt-1">Categories</div>
                    </div>
                    
                              <div className="flex flex-col items-center justify-center p-3 bg-white/80 backdrop-blur-sm rounded-xl border border-gray-200 hover:border-gray-300 transition-all">
                                <div className="text-2xl font-bold" style={{ color: '#1db954' }}>
                                  {weeklyData.reduce((sum, day) => sum + day.views, 0)}
                  </div>
                                <div className="text-[10px] font-semibold text-gray-600 mt-1">This Week</div>
                </div>
                            </>
                          ) : (
                            <>
                              {/* Not logged in: Show benefits */}
                              <div className="flex items-center space-x-2 p-3 bg-white/80 backdrop-blur-sm rounded-xl border border-gray-200 hover:border-gray-300 transition-all">
                                <div className="flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: 'rgba(29, 185, 84, 0.1)' }}>
                                  <CheckCircle className="h-4 w-4" style={{ color: '#1db954' }} />
                                </div>
                                <div className="text-xs font-semibold text-gray-900">Personalized</div>
              </div>

                              <div className="flex items-center space-x-2 p-3 bg-white/80 backdrop-blur-sm rounded-xl border border-gray-200 hover:border-gray-300 transition-all">
                                <div className="flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: 'rgba(29, 185, 84, 0.1)' }}>
                                  <CheckCircle className="h-4 w-4" style={{ color: '#1db954' }} />
                         </div>
                                <div className="text-xs font-semibold text-gray-900">Save & Organize</div>
                       </div>

                              <div className="flex items-center space-x-2 p-3 bg-white/80 backdrop-blur-sm rounded-xl border border-gray-200 hover:border-gray-300 transition-all">
                                <div className="flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: 'rgba(29, 185, 84, 0.1)' }}>
                                  <CheckCircle className="h-4 w-4" style={{ color: '#1db954' }} />
                        </div>
                                <div className="text-xs font-semibold text-gray-900">Track Progress</div>
                        </div>
                            </>
                          )}
                        </div>
                         </div>
                         
                      {/* CTA Button */}
                      <div className="text-center relative z-10">
                        {user ? (
                          <div className="flex items-center justify-center p-4 bg-white/80 backdrop-blur-sm rounded-2xl border-2 border-gray-200">
                            <div className="w-10 h-10 rounded-full flex items-center justify-center mr-3" style={{ backgroundColor: 'rgba(29, 185, 84, 0.1)' }}>
                              <CheckCircle className="w-5 h-5" style={{ color: '#1db954' }} />
                         </div>
                            <div className="text-left">
                              <div className="font-bold text-gray-900">Welcome back!</div>
                              <div className="text-gray-600 text-sm">
                                {(() => {
                              const displayName = userProfile?.full_name || user.email?.split('@')[0] || 'there';
                              console.log('👤 CTA Display name:', displayName, 'from profile:', userProfile?.full_name, 'from email:', user.email?.split('@')[0]);
                              return displayName;
                                })()}
                       </div>
                             </div>
                             </div>
                        ) : (
                          <button
                            onClick={handleShowAccount}
                            className="w-full inline-flex items-center justify-center px-8 py-4 text-base font-bold text-white rounded-2xl shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300 relative overflow-hidden group/btn"
                            style={{ backgroundColor: '#1db954' }}
                            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#16a14a'}
                            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#1db954'}
                          >
                            {/* Shimmer effect */}
                            <div className="absolute inset-0 -translate-x-full group-hover/btn:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/30 to-transparent"></div>
                            <span className="relative z-10">Create Free Account</span>
                            <ArrowRight className="ml-3 w-5 h-5 relative z-10 group-hover/btn:translate-x-1 transition-transform" />
                          </button>
                        )}
                      </div>
                    </div>
                    </div>

                    {/* What Our Readers Say Section - Takes 6 columns on large screens, next to Personalize */}
                    <div className="lg:col-span-6">
                      <TestimonialCarousel />
                    </div>

                    {/* Democratizing Discovery Section - Takes full 12 columns */}
                    <div className="lg:col-span-12">
                      <div className="relative bg-gradient-to-br from-white via-green-50/20 to-white rounded-3xl shadow-2xl border border-gray-200 p-6 sm:p-8 overflow-hidden group hover:shadow-3xl transition-all duration-500 min-h-[320px]">
                        {/* Background decoration */}
                        <div className="absolute top-0 right-0 w-64 h-64 rounded-full blur-3xl opacity-30 group-hover:opacity-50 transition-opacity duration-700" style={{ background: 'radial-gradient(circle, rgba(29, 185, 84, 0.2) 0%, rgba(22, 161, 74, 0.05) 100%)' }}></div>
                        <div className="absolute -bottom-10 -left-10 w-56 h-56 rounded-full blur-3xl opacity-20" style={{ background: 'radial-gradient(circle, rgba(29, 185, 84, 0.15) 0%, transparent 100%)' }}></div>
                        
                        <div className="relative z-10 flex flex-col gap-6">
                          {/* Top Row: Stats Grid (left) + Mission Statement (right) */}
                          <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
                            {/* Left: Visual Stats Grid */}
                            <div className="flex-1 grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6">
                              <div className="group relative bg-white/80 backdrop-blur-sm rounded-2xl p-4 sm:p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 border-2 border-transparent hover:border-green-300">
                                <div className="absolute -top-2 -right-2 w-8 h-8 rounded-full animate-pulse" style={{ backgroundColor: 'rgba(29, 185, 84, 0.2)' }}></div>
                                <div className="text-center">
                                  <div className="text-3xl sm:text-4xl font-black mb-2 bg-gradient-to-br from-green-600 to-green-400 bg-clip-text text-transparent">10K+</div>
                                  <div className="text-gray-700 font-bold text-xs sm:text-sm">Papers</div>
                                </div>
                              </div>
                              
                              <div className="group relative bg-white/80 backdrop-blur-sm rounded-2xl p-4 sm:p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 border-2 border-transparent hover:border-green-300">
                                <div className="absolute -top-2 -right-2 w-8 h-8 rounded-full animate-pulse delay-75" style={{ backgroundColor: 'rgba(29, 185, 84, 0.2)' }}></div>
                                <div className="text-center">
                                  <div className="text-3xl sm:text-4xl font-black mb-2 bg-gradient-to-br from-green-600 to-green-400 bg-clip-text text-transparent">500+</div>
                                  <div className="text-gray-700 font-bold text-xs sm:text-sm">Users</div>
                                </div>
                              </div>
                              
                              <div className="group relative bg-white/80 backdrop-blur-sm rounded-2xl p-4 sm:p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 border-2 border-transparent hover:border-green-300">
                                <div className="absolute -top-2 -right-2 w-8 h-8 rounded-full animate-pulse delay-150" style={{ backgroundColor: 'rgba(29, 185, 84, 0.2)' }}></div>
                                <div className="text-center">
                                  <div className="text-3xl sm:text-4xl font-black mb-2 bg-gradient-to-br from-green-600 to-green-400 bg-clip-text text-transparent">50+</div>
                                  <div className="text-gray-700 font-bold text-xs sm:text-sm">Universities</div>
                                </div>
                              </div>
                              
                              <div className="group relative bg-white/80 backdrop-blur-sm rounded-2xl p-4 sm:p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 border-2 border-transparent hover:border-green-300">
                                <div className="absolute -top-2 -right-2 w-8 h-8 rounded-full animate-pulse delay-200" style={{ backgroundColor: 'rgba(29, 185, 84, 0.2)' }}></div>
                                <div className="text-center">
                                  <div className="text-3xl sm:text-4xl font-black mb-2 bg-gradient-to-br from-green-600 to-green-400 bg-clip-text text-transparent">50+</div>
                                  <div className="text-gray-700 font-bold text-xs sm:text-sm">Countries</div>
                                </div>
                              </div>
                            </div>

                            {/* Right: Mission Statement with Icon */}
                            <div className="flex-shrink-0 text-center lg:text-right lg:max-w-md">
                              <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-4 shadow-xl animate-bounce" style={{ backgroundColor: '#1db954' }}>
                                <Users className="h-8 w-8 text-white" />
                              </div>
                              <h3 className="text-2xl sm:text-3xl font-black text-gray-900 mb-3 leading-tight">
                                Research for <span className="bg-gradient-to-r from-green-600 to-green-400 bg-clip-text text-transparent">Everyone</span>
                              </h3>
                              <div className="flex flex-wrap justify-center lg:justify-end gap-2">
                                <span className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-bold bg-white/90 backdrop-blur-sm border border-green-200 text-gray-700 shadow-sm hover:shadow-md hover:scale-105 transition-all">
                                  🌍 Global
                                </span>
                                <span className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-bold bg-white/90 backdrop-blur-sm border border-green-200 text-gray-700 shadow-sm hover:shadow-md hover:scale-105 transition-all">
                                  ⚡ Fast
                                </span>
                                <span className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-bold bg-white/90 backdrop-blur-sm border border-green-200 text-gray-700 shadow-sm hover:shadow-md hover:scale-105 transition-all">
                                  🎯 Clear
                                </span>
                              </div>
                            </div>
                          </div>
                          
                          {/* Bottom Row: Trust Badges - Centered */}
                          <div className="text-center pt-4 border-t border-gray-200">
                            <p className="text-gray-500 text-xs mb-3 font-semibold">Trusted by professionals at</p>
                            <div className="flex flex-wrap justify-center items-center gap-2 sm:gap-3">
                              <span className="px-2.5 py-1 bg-white/90 rounded-lg border border-gray-200 hover:border-green-300 shadow-sm hover:shadow-md transition-all font-semibold text-gray-700 text-[11px] hover:scale-105">Google</span>
                              <span className="px-2.5 py-1 bg-white/90 rounded-lg border border-gray-200 hover:border-green-300 shadow-sm hover:shadow-md transition-all font-semibold text-gray-700 text-[11px] hover:scale-105">Microsoft</span>
                              <span className="px-2.5 py-1 bg-white/90 rounded-lg border border-gray-200 hover:border-green-300 shadow-sm hover:shadow-md transition-all font-semibold text-gray-700 text-[11px] hover:scale-105">Verizon</span>
                              <span className="px-2.5 py-1 bg-white/90 rounded-lg border border-gray-200 hover:border-green-300 shadow-sm hover:shadow-md transition-all font-semibold text-gray-700 text-[11px] hover:scale-105">MIT</span>
                              <span className="px-2.5 py-1 bg-white/90 rounded-lg border border-gray-200 hover:border-green-300 shadow-sm hover:shadow-md transition-all font-semibold text-gray-700 text-[11px] hover:scale-105">UCF</span>
                              <span className="px-2.5 py-1 bg-white/90 rounded-lg border border-gray-200 hover:border-green-300 shadow-sm hover:shadow-md transition-all font-semibold text-gray-700 text-[11px] hover:scale-105">Cresta</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Elegant Section Divider */}
              <div className="my-16 sm:my-20 relative">
                <div className="mx-auto max-w-4xl px-4 sm:px-6">
                  <div className="relative py-8">
                    {/* Subtle gradient background */}
                    <div className="absolute inset-0 overflow-hidden opacity-30">
                      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-16 rounded-full blur-3xl" style={{ background: 'radial-gradient(circle, rgba(29, 185, 84, 0.15), transparent)' }}></div>
                    </div>
                    
                    {/* Main divider line */}
                    <div className="relative flex items-center">
                      <div className="flex-1 h-px bg-gradient-to-r from-transparent via-gray-200 to-gray-300"></div>
                      
                      {/* Center icon - minimal */}
                      <div className="mx-4 flex items-center space-x-3">
                        <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: 'rgba(29, 185, 84, 0.4)' }}></div>
                        <div className="w-8 h-8 rounded-full flex items-center justify-center border border-gray-200 bg-white shadow-sm">
                          <svg className="w-4 h-4" style={{ color: '#1db954' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                          </svg>
                        </div>
                        <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: 'rgba(29, 185, 84, 0.4)' }}></div>
                      </div>
                      
                      <div className="flex-1 h-px bg-gradient-to-r from-gray-300 via-gray-200 to-transparent"></div>
                    </div>
                    
                    {/* Optional text - very subtle */}
                    <div className="text-center mt-4">
                      <p className="text-xs text-gray-400 font-medium tracking-wide">Research Hub</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Field Quiz Button */}
              <div id="quiz-section">
                <FieldQuizButton onClick={handleOpenFieldQuiz} />
              </div>

              <div id="categories-section" className="text-center mb-8 sm:mb-12">
                <div className="inline-flex items-center px-4 py-1.5 rounded-full mb-4" style={{ backgroundColor: 'rgba(29, 185, 84, 0.1)' }}>
                  <span className="text-xs font-bold uppercase tracking-wider" style={{ color: '#1db954' }}>
                    ✨ Curated Categories
                  </span>
                </div>
                <h3 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3 px-4">
                  Pick a Category 
                </h3>
                <p className="text-gray-600 text-base sm:text-lg px-4 max-w-2xl mx-auto">
                  Explore cutting-edge research breakthroughs shaping the future
                </p>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 sm:gap-6 max-w-6xl mx-auto px-4 mb-8">
                {displayResearchInterests.map((researchInterest, index) => {
                  const Icon = getCategoryIcon(researchInterest);
                  const colorScheme = getCategoryColor(researchInterest, index);
                  const isSelected = selectedCategory === researchInterest;

                  return (
                    <button
                      key={researchInterest}
                      onClick={() => {
                        setSelectedCategory(isSelected ? '' : researchInterest);
                      }}
                      className={`group relative p-5 sm:p-8 rounded-2xl sm:rounded-3xl border-2 transition-all duration-500 hover:scale-105 hover:shadow-2xl ${colorScheme.bg} ${colorScheme.border} ${colorScheme.hoverBorder} ${
                        isSelected
                          ? `${colorScheme.selectedBorder} shadow-2xl ring-4 ring-offset-2`
                          : 'shadow-lg hover:shadow-xl'
                      }`}
                      style={{
                        ...(isSelected && { 
                          boxShadow: `0 20px 25px -5px ${colorScheme.glow}, 0 10px 10px -5px ${colorScheme.glow}`,
                          ringColor: colorScheme.glow
                        })
                      }}
                    >
                      {/* Hover gradient overlay */}
                      <div className="absolute inset-0 rounded-2xl sm:rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" 
                        style={{ 
                          background: `radial-gradient(circle at top, ${colorScheme.glow}, transparent)` 
                        }}
                      ></div>

                      {/* Selected indicator */}
                      {isSelected && (
                        <div className="absolute -top-2 -right-2 w-7 h-7 rounded-full flex items-center justify-center shadow-lg animate-bounce" style={{ backgroundColor: '#1db954' }}>
                          <CheckCircle className="h-4 w-4 text-white" />
                        </div>
                      )}

                      <div className="relative flex flex-col items-center justify-center space-y-3 sm:space-y-4 h-24 sm:h-32">
                        {/* Icon container with enhanced styling */}
                        <div className={`relative p-3 sm:p-4 rounded-xl sm:rounded-2xl ${colorScheme.iconBg} shadow-md group-hover:shadow-xl transition-all duration-500 flex-shrink-0 transform group-hover:scale-110 group-hover:-rotate-3`}>
                          <div className="absolute inset-0 rounded-xl sm:rounded-2xl blur-md opacity-0 group-hover:opacity-50 transition-opacity duration-500" 
                            style={{ backgroundColor: colorScheme.glow.replace('0.15', '0.3') }}
                          ></div>
                          <Icon className={`relative h-6 w-6 sm:h-10 sm:w-10 ${colorScheme.iconColor} transition-transform duration-500`} />
                        </div>

                        {/* Category name with improved typography */}
                        <span className="text-xs sm:text-sm font-bold text-gray-900 leading-tight text-center min-h-[2.5rem] sm:min-h-[3rem] flex items-center justify-center px-2">
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

        {/* Loading State - Appears below Pick a Category */}
        {isLoading && (
          <div className="text-center py-12 sm:py-16">
            <div className="relative inline-block mb-6 sm:mb-8">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-2xl blur-xl"></div>
              <Loader2 className="relative mx-auto h-16 w-16 sm:h-20 sm:w-20 text-blue-500 animate-spin" />
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
                <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-1 sm:mb-2">
                  {selectedCategoryDisplay ? `${categories.find(c => c.category_name === selectedCategoryDisplay)?.category_name || selectedCategoryDisplay}` : 'Latest Research'}
                </h3>
                <p className="text-gray-600 text-sm sm:text-base">
                  {lastRefreshDate ? `Last Refresh: ${lastRefreshDate}` : 'Data loading...'}
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
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
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