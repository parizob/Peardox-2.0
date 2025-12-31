import React, { useState, useEffect } from 'react';
import { X, User, Mail, Brain, Sparkles, Bell, Shield, BookOpen, Target, Zap, Globe, Edit3, Save, Camera, Eye, EyeOff, LogIn, UserPlus, Check, Search, TrendingUp, Calendar, BarChart3, Moon, Sun } from 'lucide-react';
import { authAPI, arxivAPI, viewedArticlesAPI } from '../lib/supabase';
import { useTheme } from '../contexts/ThemeContext';

const AccountModal = ({ isOpen, onClose, userSkillLevel, onSkillLevelChange, onResearchInterestsChange }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authMode, setAuthMode] = useState('signin');
  const [showPassword, setShowPassword] = useState(false);
  const [authError, setAuthError] = useState('');
  const [authLoading, setAuthLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState('profile');
  const [saveSuccess, setSaveSuccess] = useState(false);
  
  // Theme context for dark mode
  const { isDarkMode, toggleDarkMode } = useTheme();

  // Research interests state
  const [availableInterests, setAvailableInterests] = useState([]);
  const [interestsLoading, setInterestsLoading] = useState(false);
  const [interestSearch, setInterestSearch] = useState('');
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  // Analytics state for Research Hub
  const [analyticsData, setAnalyticsData] = useState(null);
  const [analyticsLoading, setAnalyticsLoading] = useState(false);
  const [weeklyData, setWeeklyData] = useState([]);
  const [categoryStats, setCategoryStats] = useState([]);

  // Auth form state
  const [authForm, setAuthForm] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    name: '',
    title: '',
    institution: ''
  });

  // Profile data state - populated from public.profiles
  const [userData, setUserData] = useState({
    name: '',
    email: '',
    title: '',
    institution: '',
    researchInterests: [],
    skillLevel: 'Beginner',
    aiPreferences: {
      summaryStyle: 'detailed',
      notificationFrequency: 'daily',
      researchLevel: 'expert'
    },
    achievements: {
      articlesRead: 247,
      papersSaved: 89,
      researchHours: 156,
      insightsGenerated: 42
    }
  });

  // Load research interests from database
  const loadResearchInterests = async () => {
    try {
      setInterestsLoading(true);
      console.log('Loading research interests from v_arxiv_categories...');
      
      if (arxivAPI && typeof arxivAPI.getCategories === 'function') {
        const categories = await arxivAPI.getCategories();
        console.log('Loaded categories:', categories?.length || 0);
        
        if (categories && Array.isArray(categories)) {
          const categoryNames = categories
            .map(cat => cat.category_name)
            .filter(name => name && typeof name === 'string')
            .sort();
          
          const uniqueCategories = [...new Set(categoryNames)];
          console.log('Unique categories:', uniqueCategories.length);
          
          setAvailableInterests(uniqueCategories);
        }
      }
    } catch (error) {
      console.error('Error loading research interests:', error);
      setAvailableInterests([
        'Machine Learning', 'Artificial Intelligence', 'Computer Vision and Pattern Recognition', 'Robotics', 
        'Computation and Language', 'Quantum Computing', 'Neural Networks', 'Bioinformatics', 'Edge Computing'
      ]);
    } finally {
      setInterestsLoading(false);
    }
  };

  // Load analytics data for Research Hub
  const loadAnalyticsData = async () => {
    if (!user?.id) return;
    
    try {
      setAnalyticsLoading(true);
      console.log('Loading analytics data for user:', user.id);
      
      const statsResult = await viewedArticlesAPI.getUserViewingStats(user.id);
      if (statsResult.success) {
        setAnalyticsData(statsResult.data);
        
        const weeklyViews = processWeeklyData(statsResult.data.recentViews);
        setWeeklyData(weeklyViews);
        
        const categoryBreakdown = processCategoryData(statsResult.data.viewsByCategory);
        setCategoryStats(categoryBreakdown);
      }
    } catch (error) {
      console.error('Error loading analytics data:', error);
    } finally {
      setAnalyticsLoading(false);
    }
  };

  // Process viewing data for weekly chart (Sunday to Saturday)
  const processWeeklyData = (recentViews) => {
    const weekDays = [];
    const today = new Date();
    
    const currentDay = today.getDay();
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - currentDay);
    
    for (let i = 0; i < 7; i++) {
      const date = new Date(startOfWeek);
      date.setDate(startOfWeek.getDate() + i);
      const dateStr = date.toISOString().split('T')[0];
      
      const viewsCount = recentViews?.filter(view => {
        const viewDate = new Date(view.viewed_at).toISOString().split('T')[0];
        return viewDate === dateStr && view.article_id !== 'blog';
      }).length || 0;
      
      weekDays.push({
        date: dateStr,
        day: date.toLocaleDateString('en-US', { weekday: 'long' }),
        dayShort: date.toLocaleDateString('en-US', { weekday: 'short' }),
        views: viewsCount,
        isToday: dateStr === today.toISOString().split('T')[0]
      });
    }
    
    return weekDays;
  };

  // Process category data for breakdown
  const processCategoryData = (viewsByCategory) => {
    if (!viewsByCategory || Object.keys(viewsByCategory).length === 0) {
      return [];
    }
    
    return Object.entries(viewsByCategory)
      .map(([category, views]) => ({ category, views }))
      .sort((a, b) => b.views - a.views)
      .slice(0, 5);
  };

  // Check authentication on modal open
  useEffect(() => {
    if (!isOpen) return;

    let mounted = true;
    let subscription = null;

    const checkAuth = async () => {
      try {
        console.log('Checking authentication...');
        
        if (!authAPI || typeof authAPI.getCurrentSession !== 'function') {
          console.log('AuthAPI not available');
          if (mounted) {
            setUser(null);
            setLoading(false);
          }
          return;
        }

        const { data: { session } } = await authAPI.getCurrentSession();
        
        if (mounted) {
          if (session?.user) {
            console.log('User found:', session.user.email);
            setUser(session.user);
            
            try {
              if (authAPI.getProfile) {
                const profile = await authAPI.getProfile(session.user.id);
                if (profile && mounted) {
                  setUserData({
                    name: profile.full_name || session.user.email?.split('@')[0] || '',
                    email: session.user.email || '',
                    title: profile.professional_title || '',
                    institution: profile.institution || '',
                    researchInterests: profile.research_interests || [
                      'Machine Learning', 
                      'Artificial Intelligence', 
                      'Computer Vision and Pattern Recognition', 
                      'Robotics', 
                      'Computation and Language'
                    ],
                    skillLevel: profile.skill_level || 'Beginner',
                    aiPreferences: {
                      summaryStyle: 'detailed',
                      notificationFrequency: 'daily',
                      researchLevel: 'expert'
                    },
                    achievements: {
                      articlesRead: 247,
                      papersSaved: 89,
                      researchHours: 156,
                      insightsGenerated: 42
                    }
                  });
                }
              }
            } catch (profileError) {
              console.error('Error loading profile:', profileError);
            }
          } else {
            setUser(null);
          }
          setLoading(false);
        }
      } catch (error) {
        console.error('Auth check error:', error);
        if (mounted) {
          setUser(null);
          setLoading(false);
        }
      }
    };

    setLoading(true);
    checkAuth();
    loadResearchInterests();

    if (authAPI && typeof authAPI.onAuthStateChange === 'function') {
      try {
        const { data: { subscription: authSubscription } } = authAPI.onAuthStateChange(async (event, session) => {
          console.log('Auth state changed:', event);
          
          if (!mounted) return;
          
          if (event === 'SIGNED_IN' && session?.user) {
            setUser(session.user);
            setLoading(false);
            
            try {
              let profile = null;
              if (authAPI.getProfile) {
                profile = await authAPI.getProfile(session.user.id);
              }
              
              if (!profile && authAPI.createProfile) {
                const signupData = JSON.parse(localStorage.getItem('signupData') || '{}');
                try {
                  await authAPI.createProfile(session.user.id, {
                    name: signupData.name || session.user.email?.split('@')[0] || '',
                    title: signupData.title || '',
                    institution: signupData.institution || '',
                    researchInterests: [
                      'Machine Learning', 
                      'Artificial Intelligence', 
                      'Computer Vision and Pattern Recognition', 
                      'Robotics', 
                      'Computation and Language'
                    ],
                    skillLevel: 'Beginner'
                  });
                  localStorage.removeItem('signupData');
                  if (authAPI.getProfile) {
                    profile = await authAPI.getProfile(session.user.id);
                  }
                } catch (createError) {
                  console.error('Error creating profile:', createError);
                }
              }
              
              if (profile && mounted) {
                setUserData({
                  name: profile.full_name || session.user.email?.split('@')[0] || '',
                  email: session.user.email || '',
                  title: profile.professional_title || '',
                  institution: profile.institution || '',
                  researchInterests: profile.research_interests || [
                    'Machine Learning', 
                    'Artificial Intelligence', 
                    'Computer Vision and Pattern Recognition', 
                    'Robotics', 
                    'Computation and Language'
                  ],
                  skillLevel: profile.skill_level || 'Beginner',
                  aiPreferences: {
                    summaryStyle: 'detailed',
                    notificationFrequency: 'daily',
                    researchLevel: 'expert'
                  },
                  achievements: {
                    articlesRead: 247,
                    papersSaved: 89,
                    researchHours: 156,
                    insightsGenerated: 42
                  }
                });
              }
            } catch (error) {
              console.error('Error handling profile after sign in:', error);
            }
          }
          
          if (event === 'SIGNED_OUT') {
            setUser(null);
            setUserData({
              name: '',
              email: '',
              title: '',
              institution: '',
              researchInterests: [],
              skillLevel: 'Beginner',
              aiPreferences: {
                summaryStyle: 'detailed',
                notificationFrequency: 'daily',
                researchLevel: 'expert'
              },
              achievements: {
                articlesRead: 247,
                papersSaved: 89,
                researchHours: 156,
                insightsGenerated: 42
              }
            });
          }
        });
        
        subscription = authSubscription;
      } catch (error) {
        console.error('Error setting up auth listener:', error);
      }
    }

    return () => {
      mounted = false;
      if (subscription) {
        try {
          subscription.unsubscribe();
        } catch (error) {
          console.error('Error unsubscribing:', error);
        }
      }
    };
  }, [isOpen]);

  // Load analytics data when research tab is active and user is authenticated
  useEffect(() => {
    if (activeTab === 'research' && user?.id) {
      loadAnalyticsData();
    }
  }, [activeTab, user?.id]);

  if (!isOpen) return null;

  const handleAuthSubmit = async (e) => {
    e.preventDefault();
    setAuthError('');
    setAuthLoading(true);

    try {
      if (!authAPI) {
        throw new Error('Authentication service not available');
      }

      if (authMode === 'forgot') {
        if (!authForm.email) {
          throw new Error('Please enter your email address');
        }
        
        if (typeof authAPI.resetPassword !== 'function') {
          throw new Error('Password reset not available');
        }

        await authAPI.resetPassword(authForm.email);
        setAuthError('Password reset link sent! Please check your email inbox.');
        setAuthLoading(false);
        return;
      }

      if (authMode === 'signup') {
        if (authForm.password !== authForm.confirmPassword) {
          throw new Error('Passwords do not match');
        }
        if (authForm.password.length < 6) {
          throw new Error('Password must be at least 6 characters');
        }

        localStorage.setItem('signupData', JSON.stringify({
          name: authForm.name,
          title: authForm.title,
          institution: authForm.institution
        }));

        if (typeof authAPI.signUp !== 'function') {
          throw new Error('Sign up not available');
        }

        console.log('🚀 Starting signup process with data:', {
          email: authForm.email,
          name: authForm.name,
          title: authForm.title,
          institution: authForm.institution
        });

        const signupResult = await authAPI.signUp(authForm.email, authForm.password, {
          name: authForm.name,
          title: authForm.title,
          institution: authForm.institution,
          researchInterests: [
            'Machine Learning', 
            'Artificial Intelligence', 
            'Computer Vision and Pattern Recognition', 
            'Robotics', 
            'Computation and Language'
          ],
          skillLevel: 'Beginner'
        });
        
        console.log('✅ Signup completed:', signupResult);
        setAuthError('Account created successfully! Please check your email to verify your account.');
      } else {
        if (typeof authAPI.signIn !== 'function') {
          throw new Error('Sign in not available');
        }
        await authAPI.signIn(authForm.email, authForm.password);
      }
    } catch (error) {
      if (error instanceof ReferenceError || error.message.includes('is not defined')) {
        console.error('Reference error during auth:', error);
      } else {
        setAuthError(error.message);
      }
    } finally {
      setAuthLoading(false);
    }
  };

  const handleSignOut = async (e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    console.log('🚪 Sign out button clicked');
    
    try {
      // Import supabase client directly
      const { supabase } = await import('../lib/supabase');
      console.log('🔐 Calling supabase.auth.signOut...');
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('❌ Sign out error:', error);
      } else {
        console.log('✅ Sign out completed successfully');
      }
    } catch (error) {
      console.error('❌ Sign out exception:', error);
    }
    
    // Close modal
    onClose();
    
    // Navigate to home and reload
    window.location.href = '/';
  };

  const handleSave = async () => {
    try {
      if (!authAPI || typeof authAPI.updateProfile !== 'function') {
        throw new Error('Profile update not available');
      }

      const previousSkillLevel = userSkillLevel;
      setAuthLoading(true);
      setSaveSuccess(false);
      setAuthError('');

      console.log('Saving profile data:', {
        name: userData.name,
        title: userData.title,
        institution: userData.institution,
        research_interests: userData.researchInterests,
        skill_level: userData.skillLevel
      });

      await authAPI.updateProfile(user.id, {
        name: userData.name,
        title: userData.title,
        institution: userData.institution,
        research_interests: userData.researchInterests,
        skill_level: userData.skillLevel
      });

      if (previousSkillLevel !== userData.skillLevel && onSkillLevelChange) {
        console.log('🎯 Skill level changed from', previousSkillLevel, 'to', userData.skillLevel);
        onSkillLevelChange(userData.skillLevel);
      }

      if (onResearchInterestsChange) {
        console.log('🔬 Research interests updated:', userData.researchInterests);
        onResearchInterestsChange(userData.researchInterests);
      }

      setSaveSuccess(true);
      setIsEditing(false);
      
      setTimeout(() => {
        setSaveSuccess(false);
      }, 2000);

    } catch (error) {
      console.error('Profile update error:', error);
      if (error instanceof ReferenceError || error.message.includes('is not defined')) {
        console.error('Reference error during profile update:', error);
      } else {
        setAuthError('Failed to update profile: ' + error.message);
      }
    } finally {
      setAuthLoading(false);
    }
  };

  const toggleResearchInterest = (interest) => {
    if (!isEditing) return;
    
    setUserData(prev => {
      const currentInterests = prev.researchInterests || [];
      const isSelected = currentInterests.includes(interest);
      
      if (isSelected) {
        return {
          ...prev,
          researchInterests: currentInterests.filter(i => i !== interest)
        };
      } else {
        return {
          ...prev,
          researchInterests: [...currentInterests, interest]
        };
      }
    });
  };

  const resetToDefaultInterests = async () => {
    const defaultInterests = [
      'Machine Learning', 
      'Artificial Intelligence', 
      'Computer Vision and Pattern Recognition', 
      'Robotics', 
      'Computation and Language'
    ];
    
    try {
      setAuthError('');
      setShowResetConfirm(false);
      
      setUserData(prev => ({
        ...prev,
        researchInterests: [...defaultInterests]
      }));
      
      if (user && authAPI && typeof authAPI.updateProfile === 'function') {
        console.log('Saving reset research interests to database:', defaultInterests);
        
        setAuthLoading(true);
        
        await authAPI.updateProfile(user.id, {
          research_interests: defaultInterests
        });
        
        console.log('✅ Research interests reset and saved to database');
        
        if (onResearchInterestsChange) {
          console.log('🔬 Research interests reset:', defaultInterests);
          onResearchInterestsChange(defaultInterests);
        }
        
        setSaveSuccess(true);
        setAuthError('Research interests reset to default categories and saved to your profile.');
        
        setTimeout(() => {
          setSaveSuccess(false);
        }, 2000);
        
      } else {
        console.log('⚠️ User not authenticated or authAPI not available');
        setAuthError('Research interests reset to default categories (not saved - please sign in).');
      }
      
      setTimeout(() => setAuthError(''), 4000);
      
    } catch (error) {
      console.error('❌ Error saving reset research interests:', error);
      if (error instanceof ReferenceError || error.message.includes('is not defined')) {
        console.error('Reference error during reset:', error);
      } else {
        setAuthError(`Failed to save reset to database: ${error.message}`);
        setTimeout(() => setAuthError(''), 5000);
      }
    } finally {
      setAuthLoading(false);
    }
  };

  // Filter interests based on search
  const filteredInterests = availableInterests.filter(interest =>
    interest.toLowerCase().includes(interestSearch.toLowerCase())
  );

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'research', label: 'Research Hub', icon: Brain },
    { id: 'achievements', label: 'Achievements', icon: Target }
  ];

  // Loading state
  if (loading) {
    return (
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl p-8 max-w-md w-full text-center shadow-2xl border border-gray-100">
          <div className="w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-4" style={{ backgroundColor: '#1db954' }}>
            <div className="animate-spin rounded-full h-6 w-6 border-2 border-white border-t-transparent"></div>
          </div>
          <p className="text-gray-600 font-medium">Loading your account...</p>
        </div>
      </div>
    );
  }

  // Authenticated user - show profile
  if (user) {
    const initials = userData.name?.split(' ').map(n => n[0]).join('').toUpperCase() || 'U';
    
    return (
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-2 sm:p-4">
        <div className={`w-full max-w-5xl h-[85vh] sm:h-[88vh] rounded-2xl shadow-2xl border flex flex-col lg:flex-row overflow-hidden ${
          isDarkMode ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'
        }`}>
          
          {/* Mobile Header */}
          <div className="lg:hidden bg-white border-b border-gray-100 p-4 flex-shrink-0">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="w-11 h-11 rounded-xl flex items-center justify-center text-white text-base font-bold" style={{ backgroundColor: '#1db954' }}>
                  {initials}
                </div>
                <div>
                  <h3 className="text-base font-bold text-gray-900">{userData.name}</h3>
                  <p className="text-gray-500 text-xs">{userData.title || 'Pearadox Member'}</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl transition-all"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            {/* Mobile Navigation */}
            <nav className="flex space-x-1 bg-gray-50 rounded-xl p-1">
              {tabs.map(tab => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex-1 flex flex-col items-center justify-center space-y-1 px-1 py-2.5 rounded-lg transition-all duration-200 text-xs ${
                      activeTab === tab.id
                        ? 'bg-white text-gray-900 shadow-sm'
                        : 'text-gray-500 hover:text-gray-700'
                    }`}
                    style={activeTab === tab.id ? { color: '#1db954' } : {}}
                  >
                    <Icon className="h-4 w-4 flex-shrink-0" />
                    <span className="font-medium text-center leading-tight">{tab.label.split(' ')[0]}</span>
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Desktop Sidebar */}
          <div className={`hidden lg:flex lg:w-72 border-r p-6 flex-col ${
            isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-gray-50 border-gray-100'
          }`}>
            <div className="flex items-center justify-between mb-6">
              <h2 className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Account</h2>
              <button
                onClick={onClose}
                className={`p-2 rounded-xl transition-all ${
                  isDarkMode ? 'text-gray-400 hover:text-gray-200 hover:bg-gray-700' : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'
                }`}
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Profile Card */}
            <div className={`rounded-2xl border p-5 mb-6 shadow-sm ${
              isDarkMode ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'
            }`}>
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-14 h-14 rounded-xl flex items-center justify-center text-white text-xl font-bold" style={{ backgroundColor: '#1db954' }}>
                  {initials}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className={`text-base font-bold truncate ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{userData.name}</h3>
                  <p className={`text-sm truncate ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>{userData.title || 'Pearadox Member'}</p>
                </div>
              </div>
              {userData.institution && (
                <p className={`text-xs mb-4 truncate ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>{userData.institution}</p>
              )}
              <button
                onClick={handleSignOut}
                className={`w-full px-4 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                  isDarkMode ? 'bg-gray-700 hover:bg-gray-600 text-gray-300' : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                }`}
              >
                Sign Out
              </button>
            </div>

            {/* Navigation Tabs */}
            <nav className="space-y-1 flex-1">
              {tabs.map(tab => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 text-sm ${
                      isActive
                        ? 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow-sm border border-gray-200 dark:border-gray-700'
                        : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-white/60 dark:hover:bg-gray-800/60'
                    }`}
                    style={isActive ? { color: '#1db954' } : {}}
                  >
                    <Icon className="h-4 w-4 flex-shrink-0" />
                    <span className="font-medium">{tab.label}</span>
                  </button>
                );
              })}
            </nav>

            {/* Dark Mode Toggle */}
            <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between px-4 py-3 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
                <div className="flex items-center space-x-3">
                  {isDarkMode ? (
                    <Moon className="h-4 w-4 text-indigo-500" />
                  ) : (
                    <Sun className="h-4 w-4 text-amber-500" />
                  )}
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    {isDarkMode ? 'Dark Mode' : 'Light Mode'}
                  </span>
                </div>
                <button
                  onClick={toggleDarkMode}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 ${
                    isDarkMode ? 'bg-green-500' : 'bg-gray-300'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform duration-200 ${
                      isDarkMode ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className={`flex-1 flex flex-col min-h-0 ${isDarkMode ? 'bg-gray-900' : 'bg-white'}`}>
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
              
              {/* Mobile Sign Out Button */}
              {activeTab === 'profile' && (
                <div className="lg:hidden mb-6">
                  <button
                    onClick={handleSignOut}
                    className="w-full px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-medium transition-colors"
                  >
                    Sign Out
                  </button>
                </div>
              )}
              
              {/* Profile Tab */}
              {activeTab === 'profile' && (
                <div className="space-y-6">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                      <h3 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Profile Settings</h3>
                      <p className={`text-sm mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Manage your account information</p>
                    </div>
                    <button
                      onClick={() => isEditing ? handleSave() : setIsEditing(!isEditing)}
                      disabled={authLoading || (isEditing && userData.researchInterests?.length !== 5)}
                      className={`flex items-center justify-center space-x-2 px-5 py-2.5 rounded-xl transition-all duration-200 disabled:opacity-50 text-sm font-medium ${
                        saveSuccess
                          ? 'bg-green-100 text-green-700'
                          : isEditing
                          ? (userData.researchInterests?.length === 5 ? 'text-white' : 'bg-gray-200 text-gray-500 cursor-not-allowed')
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                      style={isEditing && userData.researchInterests?.length === 5 && !saveSuccess ? { backgroundColor: '#1db954' } : {}}
                    >
                      {authLoading ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-current border-t-transparent"></div>
                      ) : saveSuccess ? (
                        <Check className="h-4 w-4" />
                      ) : isEditing ? (
                        <Save className="h-4 w-4" />
                      ) : (
                        <Edit3 className="h-4 w-4" />
                      )}
                      <span>
                        {saveSuccess ? 'Saved!' : isEditing ? 'Save Changes' : 'Edit Profile'}
                      </span>
                    </button>
                  </div>

                  {authError && authError.trim() && (
                    <div className={`p-4 rounded-xl text-sm ${
                      authError.includes('successfully') || authError.includes('saved') || authError.includes('reset')
                        ? 'bg-green-50 text-green-800 border border-green-200'
                        : 'bg-red-50 text-red-800 border border-red-200'
                    }`}>
                      {authError}
                    </div>
                  )}

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Basic Information */}
                    <div className="bg-gray-50 rounded-2xl p-5 border border-gray-100">
                      <h4 className="text-base font-semibold text-gray-900 mb-4 flex items-center">
                        <User className="h-4 w-4 mr-2" style={{ color: '#1db954' }} />
                        Basic Information
                      </h4>
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1.5">Full Name</label>
                          <input
                            type="text"
                            value={userData.name}
                            onChange={(e) => {
                              const value = e.target.value;
                              if (value.length <= 24) {
                                setUserData(prev => ({ ...prev, name: value }));
                              }
                            }}
                            disabled={!isEditing}
                            maxLength={24}
                            className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 disabled:bg-gray-100 disabled:text-gray-500 text-sm transition-all"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
                          <input
                            type="email"
                            value={userData.email}
                            disabled
                            className="w-full px-4 py-2.5 bg-gray-100 border border-gray-200 rounded-xl text-gray-500 text-sm"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1.5">Professional Title</label>
                          <input
                            type="text"
                            value={userData.title}
                            onChange={(e) => setUserData(prev => ({ ...prev, title: e.target.value }))}
                            disabled={!isEditing}
                            placeholder="e.g. Research Scientist"
                            className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 disabled:bg-gray-100 disabled:text-gray-500 text-sm transition-all"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1.5">Institution</label>
                          <input
                            type="text"
                            value={userData.institution}
                            onChange={(e) => setUserData(prev => ({ ...prev, institution: e.target.value }))}
                            disabled={!isEditing}
                            placeholder="e.g. Stanford University"
                            className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 disabled:bg-gray-100 disabled:text-gray-500 text-sm transition-all"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Research & Technical Section */}
                    <div className="space-y-6">
                      {/* Research Interests */}
                      <div className="bg-gray-50 rounded-2xl p-5 border border-gray-100">
                        <h4 className="text-base font-semibold text-gray-900 mb-3 flex items-center">
                          <Brain className="h-4 w-4 mr-2" style={{ color: '#1db954' }} />
                          Research Interests
                          <span className="ml-2 text-xs font-normal text-gray-500 bg-gray-200 px-2 py-0.5 rounded-full">
                            {userData.researchInterests?.length || 0}/5
                          </span>
                        </h4>
                        <div className="space-y-3">
                          <p className="text-xs text-gray-500">Select exactly 5 areas of research interest</p>
                          
                          {isEditing && (
                            <div className="relative">
                              <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                              <input
                                type="text"
                                placeholder="Search interests..."
                                value={interestSearch}
                                onChange={(e) => setInterestSearch(e.target.value)}
                                className="w-full pl-9 pr-4 py-2 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 text-sm"
                              />
                            </div>
                          )}

                          {interestsLoading ? (
                            <div className="flex items-center justify-center py-4">
                              <div className="animate-spin rounded-full h-5 w-5 border-2 border-t-transparent" style={{ borderColor: '#1db954', borderTopColor: 'transparent' }}></div>
                            </div>
                          ) : (
                            <div className="max-h-40 overflow-y-auto overflow-x-hidden pr-1">
                              <div className="flex flex-wrap gap-1.5">
                                {(isEditing ? filteredInterests : availableInterests.filter(interest => 
                                  userData.researchInterests?.includes(interest)
                                )).map(interest => {
                                  const isSelected = userData.researchInterests?.includes(interest);
                                  const isDisabled = !isEditing || (!isSelected && userData.researchInterests?.length >= 5);
                                  return (
                                    <button
                                      key={interest}
                                      onClick={() => toggleResearchInterest(interest)}
                                      disabled={isDisabled}
                                      className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all duration-200 whitespace-nowrap ${
                                        isSelected
                                          ? 'text-white'
                                          : isEditing 
                                          ? 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
                                          : 'bg-gray-100 text-gray-600'
                                      } ${isDisabled && !isSelected ? 'opacity-40 cursor-not-allowed' : ''}`}
                                      style={isSelected ? { backgroundColor: '#1db954' } : {}}
                                    >
                                      {interest}
                                    </button>
                                  );
                                })}
                              </div>
                            </div>
                          )}

                          {isEditing && userData.researchInterests?.length !== 5 && (
                            <div className="text-xs rounded-lg p-2.5 bg-amber-50 text-amber-700 border border-amber-200">
                              {userData.researchInterests?.length > 5 
                                ? '⚠️ Please remove some interests. You must have exactly 5 selected.'
                                : `📌 Select ${5 - (userData.researchInterests?.length || 0)} more interest${5 - (userData.researchInterests?.length || 0) === 1 ? '' : 's'} to save.`
                              }
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Technical Knowledge */}
                      <div className="bg-gray-50 rounded-2xl p-5 border border-gray-100">
                        <h4 className="text-base font-semibold text-gray-900 mb-3 flex items-center">
                          <Sparkles className="h-4 w-4 mr-2" style={{ color: '#1db954' }} />
                          Technical Level
                        </h4>
                        <div className="space-y-3">
                          <div className="flex gap-3">
                            {['Beginner', 'Intermediate'].map(level => (
                              <button
                                key={level}
                                onClick={() => isEditing && setUserData(prev => ({ ...prev, skillLevel: level }))}
                                disabled={!isEditing}
                                className={`flex-1 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                                  userData.skillLevel === level
                                    ? 'text-white shadow-sm'
                                    : isEditing
                                    ? 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
                                    : 'bg-gray-100 text-gray-500'
                                } ${!isEditing ? 'cursor-default' : ''}`}
                                style={userData.skillLevel === level ? { backgroundColor: '#1db954' } : {}}
                              >
                                {level}
                              </button>
                            ))}
                          </div>
                          <p className="text-xs text-gray-500">
                            {userData.skillLevel === 'Beginner' && "AI summaries will use simpler language and more explanations"}
                            {userData.skillLevel === 'Intermediate' && "AI summaries will include technical terminology and detailed insights"}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Reset Button */}
                  <div className="pt-4 border-t border-gray-100">
                    <button
                      onClick={() => setShowResetConfirm(true)}
                      className="text-sm text-gray-500 hover:text-red-600 font-medium transition-colors"
                    >
                      Reset to Default Categories
                    </button>
                  </div>
                </div>
              )}

              {/* Research Hub Tab */}
              {activeTab === 'research' && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900">Research Analytics</h3>
                    <p className="text-gray-500 text-sm mt-1">Track your reading progress and insights</p>
                  </div>

                  {analyticsLoading ? (
                    <div className="flex items-center justify-center min-h-[300px]">
                      <div className="text-center">
                        <div className="w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-4" style={{ backgroundColor: '#1db954' }}>
                          <div className="animate-spin rounded-full h-6 w-6 border-2 border-white border-t-transparent"></div>
                        </div>
                        <p className="text-gray-500">Loading analytics...</p>
                      </div>
                    </div>
                  ) : !analyticsData ? (
                    <div className="flex items-center justify-center min-h-[300px]">
                      <div className="text-center px-4">
                        <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                          <Brain className="h-8 w-8 text-gray-400" />
                        </div>
                        <h4 className="text-xl font-bold text-gray-900 mb-2">Start Your Research Journey</h4>
                        <p className="text-gray-500 max-w-sm mx-auto text-sm">
                          Begin reading articles to see your personalized analytics here.
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      {/* Stats Grid */}
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div className="bg-gray-50 rounded-xl p-5 border border-gray-100">
                          <div className="flex items-center">
                            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: '#1db954' }}>
                              <BookOpen className="h-5 w-5 text-white" />
                            </div>
                            <div className="ml-4">
                              <p className="text-2xl font-bold text-gray-900">{analyticsData.totalViews || 0}</p>
                              <p className="text-gray-500 text-sm">Total Papers Read</p>
                            </div>
                          </div>
                        </div>

                        <div className="bg-gray-50 rounded-xl p-5 border border-gray-100">
                          <div className="flex items-center">
                            <div className="w-10 h-10 rounded-xl bg-blue-500 flex items-center justify-center">
                              <BarChart3 className="h-5 w-5 text-white" />
                            </div>
                            <div className="ml-4">
                              <p className="text-2xl font-bold text-gray-900">{analyticsData.categoriesViewed?.length || 0}</p>
                              <p className="text-gray-500 text-sm">Total Topics Covered</p>
                            </div>
                          </div>
                        </div>

                        <div className="bg-gray-50 rounded-xl p-5 border border-gray-100">
                          <div className="flex items-center">
                            <div className="w-10 h-10 rounded-xl bg-purple-500 flex items-center justify-center">
                              <Calendar className="h-5 w-5 text-white" />
                            </div>
                            <div className="ml-4">
                              <p className="text-2xl font-bold text-gray-900">{weeklyData.reduce((sum, day) => sum + day.views, 0)}</p>
                              <p className="text-gray-500 text-sm">Papers This Week</p>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Weekly Chart */}
                      <div className="bg-gray-50 rounded-xl p-5 border border-gray-100">
                        <div className="flex items-center mb-4">
                          <TrendingUp className="h-5 w-5 text-gray-600 mr-2" />
                          <h4 className="text-base font-semibold text-gray-900">This Week</h4>
                        </div>
                        <div className="space-y-3">
                          {weeklyData.map((day, index) => {
                            const maxViews = Math.max(...weeklyData.map(d => d.views), 1);
                            const percentage = (day.views / maxViews) * 100;
                            
                            return (
                              <div key={index} className="flex items-center space-x-3">
                                <div className={`w-16 text-sm font-medium ${day.isToday ? 'font-semibold' : 'text-gray-500'}`} style={day.isToday ? { color: '#1db954' } : {}}>
                                  {day.dayShort}
                                </div>
                                <div className="flex-1 bg-gray-200 rounded-full h-6 overflow-hidden">
                                  <div 
                                    className="h-full rounded-full transition-all duration-500 flex items-center justify-center"
                                    style={{ width: `${Math.max(percentage, day.views > 0 ? 15 : 0)}%`, backgroundColor: '#1db954' }}
                                  >
                                    {day.views > 0 && (
                                      <span className="text-xs font-medium text-white">
                                        {day.views}
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      {/* Top Categories */}
                      {categoryStats.length > 0 && (
                        <div className="bg-gray-50 rounded-xl p-5 border border-gray-100">
                          <div className="flex items-center mb-4">
                            <BarChart3 className="h-5 w-5 text-gray-600 mr-2" />
                            <h4 className="text-base font-semibold text-gray-900">Top Categories</h4>
                          </div>
                          <div className="space-y-3">
                            {categoryStats.map((category, index) => {
                              const maxViews = Math.max(...categoryStats.map(c => c.views), 1);
                              const percentage = (category.views / maxViews) * 100;
                              
                              return (
                                <div key={index} className="space-y-1.5">
                                  <div className="flex items-center justify-between text-sm">
                                    <span className="text-gray-700 font-medium truncate flex-1">{category.category}</span>
                                    <span className="text-gray-500 ml-2">{category.views}</span>
                                  </div>
                                  <div className="bg-gray-200 rounded-full h-2 overflow-hidden">
                                    <div 
                                      className="h-full rounded-full transition-all duration-500"
                                      style={{ width: `${percentage}%`, backgroundColor: '#1db954' }}
                                    ></div>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* Achievements Tab */}
              {activeTab === 'achievements' && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900">Achievements</h3>
                    <p className="text-gray-500 text-sm mt-1">Track your research milestones</p>
                  </div>

                  <div className="flex items-center justify-center min-h-[300px]">
                    <div className="text-center px-4">
                      <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                        <Target className="h-8 w-8 text-gray-400" />
                      </div>
                      <h4 className="text-xl font-bold text-gray-900 mb-2">Coming Soon</h4>
                      <p className="text-gray-500 max-w-sm mx-auto text-sm">
                        Earn badges, track milestones, and celebrate your research journey.
                      </p>
                      <div className="mt-4 inline-flex items-center px-3 py-1.5 bg-gray-100 text-gray-600 rounded-full text-xs font-medium">
                        <Globe className="h-3 w-3 mr-1.5" />
                        In Development
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
        
        {/* Reset Confirmation Modal */}
        {showResetConfirm && (
          <div className="fixed inset-0 bg-black/50 z-[60] flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl">
              <h3 className="text-lg font-bold text-gray-900 mb-3">Reset Research Interests?</h3>
              <p className="text-gray-600 text-sm mb-4">
                This will replace your current interests with the default 5 categories.
              </p>
              <div className="flex space-x-3">
                <button
                  onClick={() => setShowResetConfirm(false)}
                  className="flex-1 px-4 py-2.5 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl font-medium transition-colors text-sm"
                >
                  Cancel
                </button>
                <button
                  onClick={resetToDefaultInterests}
                  className="flex-1 px-4 py-2.5 text-white bg-red-500 hover:bg-red-600 rounded-xl font-medium transition-colors text-sm"
                >
                  Reset
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Not authenticated - show sign in/up forms
  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-md w-full max-h-[90vh] overflow-hidden shadow-2xl border border-gray-100">
        {/* Header */}
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: '#1db954' }}>
                {authMode === 'signin' ? <LogIn className="h-5 w-5 text-white" /> : authMode === 'forgot' ? <Mail className="h-5 w-5 text-white" /> : <UserPlus className="h-5 w-5 text-white" />}
              </div>
              <h2 className="text-xl font-bold text-gray-900">
                {authMode === 'signin' ? 'Welcome Back' : authMode === 'forgot' ? 'Reset Password' : 'Join Pearadox'}
              </h2>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          <p className="text-gray-500 text-sm">
            {authMode === 'signin' 
              ? 'Sign in to access your research hub'
              : authMode === 'forgot'
              ? 'Enter your email to receive a reset link'
              : 'Create your account to start discovering research'
            }
          </p>
        </div>

        {/* Auth Form */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
          <form onSubmit={handleAuthSubmit} className="space-y-4">
            {authMode === 'signup' && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Full Name</label>
                  <input
                    type="text"
                    required
                    value={authForm.name}
                    onChange={(e) => setAuthForm(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 text-sm transition-all"
                    placeholder="Dr. Jane Smith"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Professional Title</label>
                  <input
                    type="text"
                    value={authForm.title}
                    onChange={(e) => setAuthForm(prev => ({ ...prev, title: e.target.value }))}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 text-sm transition-all"
                    placeholder="Research Scientist"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Institution</label>
                  <input
                    type="text"
                    value={authForm.institution}
                    onChange={(e) => setAuthForm(prev => ({ ...prev, institution: e.target.value }))}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 text-sm transition-all"
                    placeholder="Stanford University"
                  />
                </div>
              </>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
              <input
                type="email"
                required
                value={authForm.email}
                onChange={(e) => setAuthForm(prev => ({ ...prev, email: e.target.value }))}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 text-sm transition-all"
                placeholder="you@example.com"
              />
            </div>

            {authMode !== 'forgot' && (
              <>
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-sm font-medium text-gray-700">Password</label>
                    {authMode === 'signin' && (
                      <button
                        type="button"
                        onClick={() => {
                          setAuthMode('forgot');
                          setAuthError('');
                        }}
                        className="text-sm font-medium hover:underline"
                        style={{ color: '#1db954' }}
                      >
                        Forgot password?
                      </button>
                    )}
                  </div>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={authForm.password}
                      onChange={(e) => setAuthForm(prev => ({ ...prev, password: e.target.value }))}
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 pr-10 text-sm transition-all"
                      placeholder="••••••••"
                      minLength={6}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                {authMode === 'signup' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Confirm Password</label>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={authForm.confirmPassword}
                      onChange={(e) => setAuthForm(prev => ({ ...prev, confirmPassword: e.target.value }))}
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 text-sm transition-all"
                      placeholder="••••••••"
                      minLength={6}
                    />
                  </div>
                )}
              </>
            )}

            {authError && authError.trim() && (
              <div className={`p-3 rounded-xl text-sm ${
                authError.includes('successfully') || authError.includes('sent')
                  ? 'bg-green-50 text-green-800 border border-green-100'
                  : 'bg-red-50 text-red-800 border border-red-100'
              }`}>
                {authError}
              </div>
            )}

            <button
              type="submit"
              disabled={authLoading}
              className="w-full text-white py-3 rounded-xl font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
              style={{ backgroundColor: '#1db954' }}
            >
              {authLoading ? (
                <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
              ) : (
                <>
                  {authMode === 'signin' ? <LogIn className="h-4 w-4" /> : authMode === 'forgot' ? <Mail className="h-4 w-4" /> : <UserPlus className="h-4 w-4" />}
                  <span>{authMode === 'signin' ? 'Sign In' : authMode === 'forgot' ? 'Send Reset Link' : 'Create Account'}</span>
                </>
              )}
            </button>

            {authMode === 'forgot' && (
              <div className="text-center">
                <button
                  type="button"
                  onClick={() => {
                    setAuthMode('signin');
                    setAuthError('');
                  }}
                  className="text-sm font-medium hover:underline"
                  style={{ color: '#1db954' }}
                >
                  ← Back to Sign In
                </button>
              </div>
            )}

            <div className="text-center pt-4 border-t border-gray-100">
              <button
                type="button"
                onClick={() => {
                  setAuthMode(authMode === 'signin' ? 'signup' : 'signin');
                  setAuthError('');
                  setAuthForm({
                    email: '',
                    password: '',
                    confirmPassword: '',
                    name: '',
                    title: '',
                    institution: ''
                  });
                }}
                className="text-sm font-medium hover:underline"
                style={{ color: '#1db954' }}
              >
                {authMode === 'signin' 
                  ? "Don't have an account? Sign up"
                  : 'Already have an account? Sign in'
                }
              </button>
            </div>
          </form>
        </div>
      </div>
      
      {/* Reset Confirmation Modal */}
      {showResetConfirm && (
        <div className="fixed inset-0 bg-black/50 z-[60] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl">
            <h3 className="text-lg font-bold text-gray-900 mb-3">Reset Research Interests?</h3>
            <p className="text-gray-600 text-sm mb-4">
              This will replace your current interests with the default 5 categories.
            </p>
            <div className="flex space-x-3">
              <button
                onClick={() => setShowResetConfirm(false)}
                className="flex-1 px-4 py-2.5 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl font-medium transition-colors text-sm"
              >
                Cancel
              </button>
              <button
                onClick={resetToDefaultInterests}
                className="flex-1 px-4 py-2.5 text-white bg-red-500 hover:bg-red-600 rounded-xl font-medium transition-colors text-sm"
              >
                Reset
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AccountModal;
