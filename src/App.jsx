import React, { useState, useMemo, useEffect, useRef } from 'react';
import { BookOpen, Loader2, AlertCircle, Search, Filter, Bookmark, Brain, Eye, Bot, Wrench, Code, ChevronLeft, ChevronRight, Cpu, Zap, Shield, Microscope, Network, Database, Globe, Smartphone, Camera, FileText, Users, TrendingUp, BarChart, Settings, Lightbulb, Atom, Dna, Activity, Monitor, Wifi } from 'lucide-react';
import Header from './components/Header';
import ArticleCard from './components/ArticleCard';
import ArticleModal from './components/ArticleModal';
import SavedArticles from './components/SavedArticles';
import AccountModal from './components/AccountModal';
import Footer from './components/Footer';
import ContactModal from './components/ContactModal';
import { arxivAPI, authAPI, savedArticlesAPI } from './lib/supabase';

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
  }, [user, userSkillLevel, articles]); // Reload when user, skill level, or articles change

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

  const loadData = async () => {
    console.log('🚀 Loading data from Supabase with skill level:', userSkillLevel);
    setIsLoading(true);
    setError(null);
    
    try {
      // Create a timeout to prevent infinite loading
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Request timeout')), 15000)
      );
      
      // Load articles with summaries and categories from Supabase
      const dataPromise = Promise.all([
        arxivAPI.getAllPapersWithSummaries(userSkillLevel),
        arxivAPI.getCategories()
      ]);
      
      const [papersData, categoriesData] = await Promise.race([dataPromise, timeoutPromise]);
      
      // Transform papers to article format
      const transformedArticles = papersData.map(paper => ({
        id: paper.id,
        // Use summary title if available, otherwise simplify original title
        title: paper.summaryTitle || simplifyTitle(paper.title || 'Untitled'),
        // Use summary overview if available, otherwise simplify abstract
        shortDescription: paper.summaryOverview || simplifyDescription(paper.abstract || 'No description available'),
        originalTitle: paper.title || 'Untitled',
        originalAbstract: paper.abstract || 'No abstract available',
        // Add summary content for detailed view
        summaryContent: paper.summaryContent || null,
        hasSummary: !!(paper.summaryTitle || paper.summaryOverview || paper.summaryContent),
        skillLevel: paper.skillLevel || userSkillLevel,
        // Keep the first category name for backwards compatibility
        category: Array.isArray(paper.categories_name) && paper.categories_name.length > 0 
          ? paper.categories_name[0] 
          : 'General',
        // Store all categories from the array
        categories: Array.isArray(paper.categories_name) ? paper.categories_name : [paper.categories_name || 'General'],
        // Store subject classes for filtering
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
      setCategories(categoriesData);
      
      console.log(`✅ Loaded ${transformedArticles.length} articles with summaries for ${userSkillLevel} level`);
      console.log(`📋 Found ${categoriesData.length} categories`);
      console.log(`📝 Articles with summaries: ${transformedArticles.filter(a => a.hasSummary).length}`);
      
      // Debug: Show ID range to verify we're getting the highest IDs
      if (transformedArticles.length > 0) {
        const sortedByIdDesc = [...transformedArticles].sort((a, b) => b.id - a.id);
        const highestId = sortedByIdDesc[0]?.id;
        const lowestId = sortedByIdDesc[sortedByIdDesc.length - 1]?.id;
        console.log(`📊 ID Range: ${highestId} (highest) to ${lowestId} (lowest) - Total: ${transformedArticles.length} articles`);
      }
      
    } catch (err) {
      console.error('💥 Error loading data:', err);
      setError('Failed to load articles from database. Please try again.');
      
      // Fallback: try to load without summaries
      try {
        console.log('🔄 Attempting fallback to basic articles...');
        const [papersData, categoriesData] = await Promise.all([
          arxivAPI.getAllPapers(),
          arxivAPI.getCategories()
        ]);
        
        const transformedArticles = papersData.map(paper => ({
          id: paper.id,
          title: simplifyTitle(paper.title || 'Untitled'),
          shortDescription: simplifyDescription(paper.abstract || 'No description available'),
          originalTitle: paper.title || 'Untitled',
          originalAbstract: paper.abstract || 'No abstract available',
          summaryContent: null,
          hasSummary: false,
          skillLevel: userSkillLevel,
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
        setCategories(categoriesData);
        setError(null); // Clear error if fallback succeeds
        console.log(`✅ Fallback successful: Loaded ${transformedArticles.length} basic articles`);
        
      } catch (fallbackErr) {
        console.error('💥 Fallback also failed:', fallbackErr);
        setError('Unable to load articles. Please check your connection and try again.');
      }
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

    if (articles.length === 0) {
      console.log('❌ No main articles loaded yet, skipping saved articles load');
      return;
    }

    setIsLoadingSavedArticles(true);
    try {
      console.log('📚 Loading saved articles for user:', user.id);
      
      // Get saved article IDs
      const savedArticleIds = await savedArticlesAPI.getUserSavedArticleIds(user.id);
      console.log('📚 Saved article IDs:', savedArticleIds);
      
      // Update favorites Set for heart icons (ensure same type as article IDs)
      const favoriteIds = new Set(savedArticleIds.map(id => {
        // Ensure the ID type matches what the articles use
        return typeof id === 'string' ? parseInt(id) || id : id;
      }));
      setFavorites(favoriteIds);
      
      // Filter main articles to get saved ones for the saved articles panel
      const savedArticles = articles.filter(article => {
        // Check both string and number versions for compatibility
        return savedArticleIds.includes(article.id) || 
               savedArticleIds.includes(String(article.id)) ||
               savedArticleIds.includes(Number(article.id));
      });
      console.log('📚 Available articles count:', articles.length);
      console.log('📚 Sample article IDs:', articles.slice(0, 5).map(a => ({ id: a.id, type: typeof a.id })));
      console.log('📚 Saved article IDs:', savedArticleIds.map(id => ({ id, type: typeof id })));
      console.log('📚 Found saved articles in main feed:', savedArticles.length);
      console.log('📚 Sample saved articles:', savedArticles.slice(0, 2).map(a => ({ id: a.id, title: a.title?.substring(0, 30) })));
      
      setSavedArticlesFromDB(savedArticles);
      
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
      
      // Reload saved articles for the panel
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

        {/* Category Filter Section */}
        {!isLoading && !error && !searchTerm && (
          <div className="pt-8 sm:pt-8 pb-12 sm:pb-20 mb-8 sm:mb-12">
            <div className="mx-auto max-w-6xl px-4 sm:px-6">
              <div className="text-center mb-8 sm:mb-12">
                <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 mb-3 sm:mb-4 leading-tight px-2">
                  Your Daily Dose of Discovery
                </h2>
                <p className="text-base sm:text-lg text-gray-600 max-w-3xl mx-auto leading-relaxed px-4">
                We break down the latest AI breakthroughs into words you can actually understand
                </p>
              </div>

              <div className="text-center mb-6 sm:mb-10">
                <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2 sm:mb-3 px-4">
                  Explore Research Categories
                </h3>
                <p className="text-gray-600 text-sm sm:text-base px-4">
                  Click any category to discover the latest breakthroughs
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
                  {latestPublishedDate ? `Latest: ${latestPublishedDate} (UTC)` : 'No articles found'}
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