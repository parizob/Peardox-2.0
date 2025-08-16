import React, { useState, useEffect } from 'react';
import { X, User, Mail, Brain, Sparkles, Settings, Bell, Shield, BookOpen, Target, Zap, Globe, Edit3, Save, Camera, Eye, EyeOff, LogIn, UserPlus, Check, Search, TrendingUp, Calendar, BarChart3 } from 'lucide-react';
import { authAPI, arxivAPI, viewedArticlesAPI } from '../lib/supabase';

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
    skillLevel: 'Beginner', // Add skill level field
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
          // Extract unique category names and sort them
          const categoryNames = categories
            .map(cat => cat.category_name)
            .filter(name => name && typeof name === 'string')
            .sort();
          
          // Remove duplicates
          const uniqueCategories = [...new Set(categoryNames)];
          console.log('Unique categories:', uniqueCategories.length);
          
          setAvailableInterests(uniqueCategories);
        }
      }
    } catch (error) {
      console.error('Error loading research interests:', error);
      // Fallback to default categories if database fails - using the 5 main page categories
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
      
      // Get user viewing stats
      const statsResult = await viewedArticlesAPI.getUserViewingStats(user.id);
      if (statsResult.success) {
        setAnalyticsData(statsResult.data);
        
        // Process weekly data for line chart
        const weeklyViews = processWeeklyData(statsResult.data.recentViews);
        setWeeklyData(weeklyViews);
        
        // Process category stats
        const categoryBreakdown = processCategoryData(statsResult.data.viewsByCategory);
        setCategoryStats(categoryBreakdown);
      }
    } catch (error) {
      console.error('Error loading analytics data:', error);
    } finally {
      setAnalyticsLoading(false);
    }
  };

  // Process viewing data for weekly chart
  const processWeeklyData = (recentViews) => {
    const last7Days = [];
    const today = new Date();
    
    // Create array of last 7 days
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      
      // Count views for this day
      const viewsCount = recentViews?.filter(view => {
        const viewDate = new Date(view.viewed_at).toISOString().split('T')[0];
        return viewDate === dateStr;
      }).length || 0;
      
      last7Days.push({
        date: dateStr,
        day: date.toLocaleDateString('en-US', { weekday: 'short' }),
        views: viewsCount
      });
    }
    
    return last7Days;
  };

  // Process category data for breakdown
  const processCategoryData = (viewsByCategory) => {
    if (!viewsByCategory || Object.keys(viewsByCategory).length === 0) {
      return [];
    }
    
    // Convert to array and sort by views
    return Object.entries(viewsByCategory)
      .map(([category, views]) => ({ category, views }))
      .sort((a, b) => b.views - a.views)
      .slice(0, 5); // Top 5 categories
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
            
            // Load profile data
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
                    skillLevel: profile.skill_level || 'Beginner', // Load skill level
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
    
    // Load research interests when modal opens
    loadResearchInterests();

    // Set up auth listener
    if (authAPI && typeof authAPI.onAuthStateChange === 'function') {
      try {
        const { data: { subscription: authSubscription } } = authAPI.onAuthStateChange(async (event, session) => {
          console.log('Auth state changed:', event);
          
          if (!mounted) return;
          
          if (event === 'SIGNED_IN' && session?.user) {
            setUser(session.user);
            setLoading(false);
            
            // Load or create profile
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
                    skillLevel: 'Beginner' // Default skill level for new users
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
                  skillLevel: profile.skill_level || 'Beginner', // Load skill level
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
              skillLevel: 'Beginner', // Reset skill level on sign out
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
          skillLevel: 'Beginner' // Default skill level for new users
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
      setAuthError(error.message);
    } finally {
      setAuthLoading(false);
    }
  };

  const handleSignOut = async () => {
    try {
      if (authAPI && typeof authAPI.signOut === 'function') {
        await authAPI.signOut();
      }
      onClose();
    } catch (error) {
      console.error('Sign out error:', error);
      onClose();
    }
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

      // Notify parent if skill level changed
      if (previousSkillLevel !== userData.skillLevel && onSkillLevelChange) {
        console.log('🎯 Skill level changed from', previousSkillLevel, 'to', userData.skillLevel);
        onSkillLevelChange(userData.skillLevel);
      }

      // Notify parent if research interests changed
      if (onResearchInterestsChange) {
        console.log('🔬 Research interests updated:', userData.researchInterests);
        onResearchInterestsChange(userData.researchInterests);
      }

      setSaveSuccess(true);
      setIsEditing(false);
      
      // Show success message briefly
      setTimeout(() => {
        setSaveSuccess(false);
      }, 2000);

    } catch (error) {
      console.error('Profile update error:', error);
      setAuthError('Failed to update profile: ' + error.message);
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
        // Remove the interest
        return {
          ...prev,
          researchInterests: currentInterests.filter(i => i !== interest)
        };
      } else {
        // Add the interest (no limit check needed since button will be disabled when needed)
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
      // Clear any previous errors
      setAuthError('');
      
      // Close the confirmation modal immediately
      setShowResetConfirm(false);
      
      // Update local state first
      setUserData(prev => ({
        ...prev,
        researchInterests: [...defaultInterests]
      }));
      
      // Save to Supabase if user is authenticated
      if (user && authAPI && typeof authAPI.updateProfile === 'function') {
        console.log('Saving reset research interests to database:', defaultInterests);
        
        // Show loading state briefly
        setAuthLoading(true);
        
        await authAPI.updateProfile(user.id, {
          research_interests: defaultInterests
        });
        
        console.log('✅ Research interests reset and saved to database');
        
        // Notify parent of research interests change
        if (onResearchInterestsChange) {
          console.log('🔬 Research interests reset:', defaultInterests);
          onResearchInterestsChange(defaultInterests);
        }
        
        // Show success with save indicator
        setSaveSuccess(true);
        setAuthError('Research interests reset to default categories and saved to your profile.');
        
        // Clear success state after a moment
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
      setAuthError(`Failed to save reset to database: ${error.message}`);
      setTimeout(() => setAuthError(''), 5000);
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
    { id: 'preferences', label: 'AI Preferences', icon: Settings },
    { id: 'achievements', label: 'Achievements', icon: Target }
  ];

  const researchInterests = [
    'Machine Learning', 'Quantum Computing', 'Neural Networks', 'Computer Vision',
    'Natural Language Processing', 'Robotics', 'Bioinformatics', 'Edge Computing'
  ];

  // Loading state
  if (loading) {
    return (
      <div className="fixed inset-0 bg-black/80 backdrop-blur-xl z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl p-8 max-w-md w-full text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Authenticated user - show futuristic profile
  if (user) {
    const initials = userData.name?.split(' ').map(n => n[0]).join('').toUpperCase() || 'U';
    
    return (
      <div className="fixed inset-0 bg-black/80 backdrop-blur-xl z-50 flex items-center justify-center p-2 sm:p-4">
        <div className="w-full max-w-6xl h-[95vh] sm:h-[90vh] flex flex-col lg:flex-row overflow-hidden">
          
          {/* Mobile Header - Only visible on mobile */}
          <div className="lg:hidden bg-white/10 backdrop-blur-2xl border border-white/20 rounded-t-3xl p-4 flex-shrink-0">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl flex items-center justify-center text-white text-lg font-bold shadow-lg">
                  {initials}
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">{userData.name}</h3>
                  <p className="text-white/70 text-sm">{userData.title}</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 text-white/70 hover:text-white hover:bg-white/10 rounded-full transition-all"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            
            {/* Mobile Navigation */}
            <nav className="flex space-x-1 bg-white/10 rounded-xl p-1">
              {tabs.map(tab => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex-1 flex flex-col items-center justify-center space-y-1 px-1 py-3 min-h-[60px] rounded-lg transition-all duration-300 text-xs ${
                      activeTab === tab.id
                        ? 'bg-gradient-to-r from-blue-500/30 to-purple-500/30 text-white shadow-lg border border-white/20'
                        : 'text-white/70 hover:text-white hover:bg-white/10'
                    }`}
                  >
                    <Icon className="h-4 w-4 flex-shrink-0" />
                    <span className="font-medium text-center leading-tight">{tab.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Desktop Sidebar - Only visible on desktop */}
          <div className="hidden lg:flex lg:w-80 bg-gradient-to-br from-white/95 to-gray-50/95 backdrop-blur-2xl border border-gray-200/50 rounded-l-3xl p-6 flex-col">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-bold text-gray-800">Account Hub</h2>
              <button
                onClick={onClose}
                className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-all"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            {/* Profile Summary */}
            <div className="relative mb-8">
              <div className="absolute inset-0 bg-gradient-to-r from-green-200/30 to-emerald-200/30 rounded-2xl blur-xl"></div>
              <div className="relative bg-white/80 backdrop-blur-sm border border-gray-200/50 rounded-2xl p-6">
                <div className="relative mb-4">
                  <div className="w-20 h-20 bg-gradient-to-r from-green-500 to-emerald-500 rounded-2xl flex items-center justify-center text-white text-2xl font-bold shadow-lg">
                    {initials}
                  </div>
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-1">{userData.name}</h3>
                <p className="text-gray-600 text-sm mb-2">{userData.title}</p>
                <p className="text-gray-500 text-xs">{userData.institution}</p>
                <button
                  onClick={handleSignOut}
                  className="mt-4 w-full px-3 py-2 bg-red-500 hover:bg-red-600 rounded-xl text-white text-sm font-medium transition-colors"
                >
                  Sign Out
                </button>
              </div>
            </div>

            {/* Navigation Tabs */}
            <nav className="space-y-1">
              {tabs.map(tab => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-xl transition-all duration-300 text-sm ${
                      activeTab === tab.id
                        ? 'bg-white text-green-600 shadow-lg border border-green-100'
                        : 'text-gray-600 hover:text-gray-800 hover:bg-white/60'
                    }`}
                  >
                    <Icon className="h-4 w-4 flex-shrink-0" />
                    <span className="font-medium">{tab.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Main Content */}
          <div className="flex-1 bg-white/95 backdrop-blur-xl border border-white/20 lg:rounded-r-3xl rounded-b-3xl lg:rounded-bl-none flex flex-col min-h-0">
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
              
              {/* Mobile Sign Out Button - Only show on Profile tab */}
              {activeTab === 'profile' && (
                <div className="lg:hidden mb-6">
                  <button
                    onClick={handleSignOut}
                    className="w-full px-4 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl font-medium transition-colors hover:from-red-600 hover:to-red-700"
                  >
                    Sign Out
                  </button>
                </div>
              )}
              
              {/* Profile Tab */}
              {activeTab === 'profile' && (
                <div className="space-y-6 lg:space-y-8">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
                    <h3 className="text-2xl lg:text-3xl font-bold bg-gradient-to-r from-gray-800 to-green-700 bg-clip-text text-transparent">
                      Profile Settings
                    </h3>
                    <button
                      onClick={() => isEditing ? handleSave() : setIsEditing(!isEditing)}
                      disabled={authLoading || (isEditing && userData.researchInterests?.length !== 5)}
                      className={`flex items-center justify-center space-x-2 px-4 lg:px-6 py-3 rounded-xl lg:rounded-2xl transition-all duration-300 disabled:opacity-50 text-sm lg:text-base ${
                        saveSuccess
                          ? 'bg-green-500 hover:bg-green-600 text-white shadow-lg'
                          : isEditing
                          ? (userData.researchInterests?.length === 5 ? 'bg-green-600 hover:bg-green-700 text-white shadow-lg hover:shadow-xl' : 'bg-gray-400 text-white shadow-lg cursor-not-allowed')
                          : 'bg-green-500 hover:bg-green-600 text-white shadow-lg hover:shadow-xl'
                      }`}
                    >
                      {authLoading ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
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

                  {authError && (
                    <div className="p-3 lg:p-4 rounded-xl bg-red-50 text-red-800 border border-red-200 text-sm lg:text-base">
                      {authError}
                    </div>
                  )}

                  {saveSuccess && !authError && (
                    <div className="p-3 lg:p-4 rounded-xl bg-green-50 text-green-800 border border-green-200 text-sm lg:text-base">
                      Profile updated successfully!
                    </div>
                  )}

                  <div className="space-y-6 lg:space-y-0 lg:grid lg:grid-cols-2 lg:gap-8">
                    {/* Basic Information */}
                    <div className="bg-white/60 backdrop-blur-sm border border-white/20 rounded-2xl p-4 lg:p-6">
                      <h4 className="text-lg lg:text-xl font-bold text-gray-900 mb-4 lg:mb-6 flex items-center">
                        <User className="h-4 w-4 lg:h-5 lg:w-5 mr-2 text-blue-500" />
                        Basic Information
                      </h4>
                      <div className="space-y-3 lg:space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
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
                            className="w-full px-3 lg:px-4 py-2 lg:py-3 bg-white/80 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50 text-sm lg:text-base"
                          />
                          {isEditing && userData.name?.length === 24 && (
                            <div className="text-xs text-amber-600 mt-1">
                              {userData.name?.length || 0}/24 characters (limit reached)
                            </div>
                          )}
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                          <input
                            type="email"
                            value={userData.email}
                            disabled
                            className="w-full px-3 lg:px-4 py-2 lg:py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-500 text-sm lg:text-base"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Professional Title</label>
                          <input
                            type="text"
                            value={userData.title}
                            onChange={(e) => setUserData(prev => ({ ...prev, title: e.target.value }))}
                            disabled={!isEditing}
                            className="w-full px-3 lg:px-4 py-2 lg:py-3 bg-white/80 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50 text-sm lg:text-base"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Institution</label>
                          <input
                            type="text"
                            value={userData.institution}
                            onChange={(e) => setUserData(prev => ({ ...prev, institution: e.target.value }))}
                            disabled={!isEditing}
                            className="w-full px-3 lg:px-4 py-2 lg:py-3 bg-white/80 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50 text-sm lg:text-base"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Combined Research & Technical Section */}
                    <div className="space-y-4 lg:space-y-6">
                      {/* Research Interests */}
                      <div className="bg-white/60 backdrop-blur-sm border border-white/20 rounded-2xl p-4 lg:p-6">
                        <h4 className="text-lg lg:text-xl font-bold text-gray-900 mb-3 lg:mb-4 flex items-center">
                          <Brain className="h-4 w-4 lg:h-5 lg:w-5 mr-2 text-purple-500" />
                          Research Interests
                          <span className="ml-2 text-xs lg:text-sm font-normal text-gray-500">
                            ({userData.researchInterests?.length || 0}/5)
                          </span>
                        </h4>
                        <div className="space-y-3">
                          <p className="text-xs lg:text-sm text-gray-600">Select exactly 5 areas of research interest</p>
                          
                          {isEditing && (
                            <div className="relative">
                              <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                              <input
                                type="text"
                                placeholder="Search research interests..."
                                value={interestSearch}
                                onChange={(e) => setInterestSearch(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 bg-white/80 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-xs lg:text-sm"
                              />
                            </div>
                          )}

                          {interestsLoading ? (
                            <div className="flex items-center justify-center py-4">
                              <div className="animate-spin rounded-full h-4 w-4 lg:h-5 lg:w-5 border-b-2 border-purple-500"></div>
                              <span className="ml-2 text-xs lg:text-sm text-gray-600">Loading...</span>
                            </div>
                          ) : (
                            <div className="max-h-24 lg:max-h-32 overflow-y-auto">
                              <div className="flex flex-wrap gap-1.5 lg:gap-2">
                                {(isEditing ? filteredInterests : availableInterests.filter(interest => 
                                  userData.researchInterests?.includes(interest)
                                )).map(interest => (
                                  <button
                                    key={interest}
                                    onClick={() => toggleResearchInterest(interest)}
                                    disabled={!isEditing}
                                    className={`px-2 lg:px-3 py-1 lg:py-1.5 rounded-full text-xs font-medium transition-all duration-200 ${
                                      userData.researchInterests?.includes(interest)
                                        ? 'bg-green-500 hover:bg-green-600 text-white shadow-md'
                                        : isEditing 
                                        ? 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-200'
                                        : 'bg-gray-100 text-gray-700'
                                    } ${!isEditing ? 'cursor-default' : 'cursor-pointer hover:scale-105'} ${
                                      isEditing && !userData.researchInterests?.includes(interest) && userData.researchInterests?.length >= 5
                                        ? 'opacity-50 cursor-not-allowed'
                                        : ''
                                    }`}
                                  >
                                    {interest}
                                  </button>
                                ))}
                              </div>
                              
                              {isEditing && filteredInterests.length === 0 && interestSearch && (
                                <div className="text-center py-2 text-gray-500 text-xs lg:text-sm">
                                  No interests found matching "{interestSearch}"
                                </div>
                              )}
                            </div>
                          )}

                          {isEditing && userData.researchInterests?.length !== 5 && (
                            <div className={`text-xs rounded-lg p-2 ${
                              userData.researchInterests?.length > 5 
                                ? 'text-red-600 bg-red-50 border border-red-200'
                                : 'text-blue-600 bg-blue-50 border border-blue-200'
                            }`}>
                              {userData.researchInterests?.length > 5 
                                ? '⚠️ Please remove some interests. You must have exactly 5 selected.'
                                : `📌 Please select ${5 - (userData.researchInterests?.length || 0)} more interest${5 - (userData.researchInterests?.length || 0) === 1 ? '' : 's'} to continue.`
                              }
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Technical Knowledge */}
                      <div className="bg-white/60 backdrop-blur-sm border border-white/20 rounded-2xl p-4 lg:p-6">
                        <h4 className="text-lg lg:text-xl font-bold text-gray-900 mb-3 lg:mb-4 flex items-center">
                          <Sparkles className="h-4 w-4 lg:h-5 lg:w-5 mr-2 text-yellow-500" />
                          Technical Knowledge
                        </h4>
                        <div className="space-y-3">
                          <p className="text-xs lg:text-sm text-gray-600">Select your technical skill level</p>
                          <div className="flex gap-2 lg:gap-3">
                            {['Beginner', 'Intermediate'].map(level => (
                              <button
                                key={level}
                                onClick={() => isEditing && setUserData(prev => ({ ...prev, skillLevel: level }))}
                                disabled={!isEditing}
                                className={`flex-1 px-3 lg:px-4 py-2 lg:py-3 rounded-lg lg:rounded-xl text-xs lg:text-sm font-medium transition-all duration-200 ${
                                  userData.skillLevel === level
                                    ? 'bg-gradient-to-r from-yellow-500 to-orange-500 text-white shadow-md'
                                    : isEditing
                                    ? 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-200'
                                    : 'bg-gray-100 text-gray-700'
                                } ${!isEditing ? 'cursor-default' : 'cursor-pointer'}`}
                              >
                                {level}
                              </button>
                            ))}
                          </div>
                          <div className="text-xs text-gray-500 mt-2">
                            {userData.skillLevel === 'Beginner' && "New to research and technical concepts"}
                            {userData.skillLevel === 'Intermediate' && "Comfortable with technical terminology and research methods"}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Reset Research Interests Button - Outside the section */}
                  <div className="mt-4 lg:mt-6 text-center">
                    <button
                      onClick={() => setShowResetConfirm(true)}
                      className="px-4 lg:px-6 py-2 lg:py-3 text-red-600 hover:text-red-800 font-medium transition-colors rounded-lg hover:bg-red-50 border border-red-200 hover:border-red-300 shadow-sm hover:shadow-md text-sm lg:text-base"
                    >
                      Reset to Default Categories
                    </button>
                  </div>
                </div>
              )}

              {/* Research Hub Tab */}
              {activeTab === 'research' && (
                <div className="space-y-6 lg:space-y-8">
                  <h3 className="text-2xl lg:text-3xl font-bold bg-gradient-to-r from-gray-800 to-green-700 bg-clip-text text-transparent">
                    Research Analytics
                  </h3>

                  {analyticsLoading ? (
                    <div className="flex items-center justify-center min-h-[300px]">
                      <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto mb-4"></div>
                        <p className="text-gray-600">Loading your research analytics...</p>
                      </div>
                    </div>
                  ) : !analyticsData ? (
                    <div className="flex items-center justify-center min-h-[300px]">
                      <div className="text-center px-4">
                        <div className="w-16 h-16 lg:w-24 lg:h-24 bg-gradient-to-r from-green-500/20 to-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-4 lg:mb-6">
                          <Brain className="h-8 w-8 lg:h-12 lg:w-12 text-green-500" />
                        </div>
                        <h4 className="text-xl lg:text-2xl font-bold text-gray-900 mb-3 lg:mb-4">Start Your Research Journey</h4>
                        <p className="text-gray-600 max-w-md mx-auto leading-relaxed text-sm lg:text-base">
                          Begin reading articles to see your personalized research analytics and insights here.
                        </p>
                        <div className="mt-4 lg:mt-6 inline-flex items-center px-3 lg:px-4 py-2 bg-green-50 text-green-700 rounded-full text-xs lg:text-sm font-medium">
                          <BookOpen className="h-3 w-3 lg:h-4 lg:w-4 mr-2" />
                          No articles viewed yet
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      {/* Stats Overview */}
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 lg:gap-6">
                        <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-4 lg:p-6 border border-green-100">
                          <div className="flex items-center">
                            <div className="p-2 bg-green-500 rounded-lg">
                              <BookOpen className="h-5 w-5 text-white" />
                            </div>
                            <div className="ml-4">
                              <p className="text-2xl lg:text-3xl font-bold text-green-700">
                                {analyticsData.totalViews || 0}
                              </p>
                              <p className="text-green-600 text-sm lg:text-base font-medium">Articles Read</p>
                            </div>
                          </div>
                        </div>

                        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4 lg:p-6 border border-blue-100">
                          <div className="flex items-center">
                            <div className="p-2 bg-blue-500 rounded-lg">
                              <BarChart3 className="h-5 w-5 text-white" />
                            </div>
                            <div className="ml-4">
                              <p className="text-2xl lg:text-3xl font-bold text-blue-700">
                                {analyticsData.categoriesViewed?.length || 0}
                              </p>
                              <p className="text-blue-600 text-sm lg:text-base font-medium">Categories</p>
                            </div>
                          </div>
                        </div>

                        <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-4 lg:p-6 border border-purple-100">
                          <div className="flex items-center">
                            <div className="p-2 bg-purple-500 rounded-lg">
                              <Calendar className="h-5 w-5 text-white" />
                            </div>
                            <div className="ml-4">
                              <p className="text-2xl lg:text-3xl font-bold text-purple-700">
                                {weeklyData.reduce((sum, day) => sum + day.views, 0)}
                              </p>
                              <p className="text-purple-600 text-sm lg:text-base font-medium">This Week</p>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Weekly Reading Chart */}
                      <div className="bg-white rounded-xl border border-gray-200 p-4 lg:p-6">
                        <div className="flex items-center mb-4">
                          <TrendingUp className="h-5 w-5 text-gray-600 mr-2" />
                          <h4 className="text-lg font-semibold text-gray-800">Articles Read This Week</h4>
                        </div>
                        <div className="space-y-3">
                          {weeklyData.map((day, index) => {
                            const maxViews = Math.max(...weeklyData.map(d => d.views), 1);
                            const percentage = (day.views / maxViews) * 100;
                            
                            return (
                              <div key={index} className="flex items-center space-x-3">
                                <div className="w-8 text-sm text-gray-600 font-medium">
                                  {day.day}
                                </div>
                                <div className="flex-1 bg-gray-100 rounded-full h-6 relative overflow-hidden">
                                  <div 
                                    className="bg-gradient-to-r from-green-500 to-emerald-500 h-full rounded-full transition-all duration-500 ease-out"
                                    style={{ width: `${percentage}%` }}
                                  ></div>
                                  <div className="absolute inset-0 flex items-center justify-center">
                                    <span className="text-xs font-medium text-gray-700">
                                      {day.views}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      {/* Top Categories */}
                      {categoryStats.length > 0 && (
                        <div className="bg-white rounded-xl border border-gray-200 p-4 lg:p-6">
                          <div className="flex items-center mb-4">
                            <BarChart3 className="h-5 w-5 text-gray-600 mr-2" />
                            <h4 className="text-lg font-semibold text-gray-800">Top Research Categories</h4>
                          </div>
                          <div className="space-y-3">
                            {categoryStats.map((category, index) => {
                              const maxViews = Math.max(...categoryStats.map(c => c.views), 1);
                              const percentage = (category.views / maxViews) * 100;
                              const colors = [
                                'from-blue-500 to-blue-600',
                                'from-green-500 to-green-600', 
                                'from-purple-500 to-purple-600',
                                'from-orange-500 to-orange-600',
                                'from-pink-500 to-pink-600'
                              ];
                              
                              return (
                                <div key={index} className="flex items-center space-x-3">
                                  <div className="w-4 text-sm text-gray-600 font-medium">
                                    #{index + 1}
                                  </div>
                                  <div className="flex-1">
                                    <div className="flex justify-between items-center mb-1">
                                      <span className="text-sm font-medium text-gray-800 truncate">
                                        {category.category}
                                      </span>
                                      <span className="text-sm text-gray-600">
                                        {category.views} article{category.views !== 1 ? 's' : ''}
                                      </span>
                                    </div>
                                    <div className="bg-gray-100 rounded-full h-3 overflow-hidden">
                                      <div 
                                        className={`bg-gradient-to-r ${colors[index]} h-full rounded-full transition-all duration-500 ease-out`}
                                        style={{ width: `${percentage}%` }}
                                      ></div>
                                    </div>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}

                      {/* Reading Insights */}
                      {analyticsData.firstView && (
                        <div className="bg-gradient-to-r from-gray-50 to-green-50 rounded-xl p-4 lg:p-6 border border-gray-200">
                          <div className="flex items-center mb-3">
                            <Brain className="h-5 w-5 text-green-600 mr-2" />
                            <h4 className="text-lg font-semibold text-gray-800">Research Insights</h4>
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                            <div>
                              <p className="text-gray-600">Member since:</p>
                              <p className="font-medium text-gray-800">
                                {new Date(analyticsData.firstView).toLocaleDateString('en-US', { 
                                  year: 'numeric', 
                                  month: 'long', 
                                  day: 'numeric' 
                                })}
                              </p>
                            </div>
                            <div>
                              <p className="text-gray-600">Most used skill level:</p>
                              <p className="font-medium text-gray-800">
                                {analyticsData.skillLevelsUsed?.[0] || 'Beginner'}
                              </p>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* AI Preferences Tab */}
              {activeTab === 'preferences' && (
                <div className="space-y-6 lg:space-y-8">
                  <h3 className="text-2xl lg:text-3xl font-bold bg-gradient-to-r from-gray-900 to-green-900 bg-clip-text text-transparent">
                    AI Preferences
                  </h3>

                  <div className="flex items-center justify-center min-h-[300px] lg:min-h-[400px]">
                    <div className="text-center px-4">
                      <div className="w-16 h-16 lg:w-24 lg:h-24 bg-gradient-to-r from-green-500/20 to-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-4 lg:mb-6">
                        <Settings className="h-8 w-8 lg:h-12 lg:w-12 text-green-500" />
                      </div>
                      <h4 className="text-xl lg:text-2xl font-bold text-gray-900 mb-3 lg:mb-4">AI Preferences Coming Soon</h4>
                      <p className="text-gray-600 max-w-md mx-auto leading-relaxed text-sm lg:text-base">
                        Customize your AI assistant, set notification preferences, and tailor your research experience. 
                        Advanced AI personalization features are in development!
                      </p>
                      <div className="mt-4 lg:mt-6 inline-flex items-center px-3 lg:px-4 py-2 bg-green-50 text-green-700 rounded-full text-xs lg:text-sm font-medium">
                        <Zap className="h-3 w-3 lg:h-4 lg:w-4 mr-2" />
                        Coming Soon
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Achievements Tab */}
              {activeTab === 'achievements' && (
                <div className="space-y-6 lg:space-y-8">
                  <h3 className="text-2xl lg:text-3xl font-bold bg-gradient-to-r from-gray-900 to-yellow-900 bg-clip-text text-transparent">
                    Research Achievements
                  </h3>

                  <div className="flex items-center justify-center min-h-[300px] lg:min-h-[400px]">
                    <div className="text-center px-4">
                      <div className="w-16 h-16 lg:w-24 lg:h-24 bg-gradient-to-r from-yellow-500/20 to-orange-500/20 rounded-full flex items-center justify-center mx-auto mb-4 lg:mb-6">
                        <Target className="h-8 w-8 lg:h-12 lg:w-12 text-yellow-500" />
                      </div>
                      <h4 className="text-xl lg:text-2xl font-bold text-gray-900 mb-3 lg:mb-4">Achievements Coming Soon</h4>
                      <p className="text-gray-600 max-w-md mx-auto leading-relaxed text-sm lg:text-base">
                        Track your research milestones, earn badges, and celebrate your scientific journey. 
                        Gamified research progress tracking is being crafted with care!
                      </p>
                      <div className="mt-4 lg:mt-6 inline-flex items-center px-3 lg:px-4 py-2 bg-yellow-50 text-yellow-700 rounded-full text-xs lg:text-sm font-medium">
                        <Globe className="h-3 w-3 lg:h-4 lg:w-4 mr-2" />
                        Coming Soon
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
              <h3 className="text-lg font-bold text-gray-900 mb-4">Reset Research Interests?</h3>
              <p className="text-gray-600 mb-6">
                This will replace your current research interests with the default 5 categories:
              </p>
              <ul className="text-sm text-gray-700 mb-6 space-y-1">
                <li>• Machine Learning</li>
                <li>• Artificial Intelligence</li>
                <li>• Computer Vision and Pattern Recognition</li>
                <li>• Robotics</li>
                <li>• Natural Language (Computation and Language)</li>
              </ul>
              <div className="flex space-x-3">
                <button
                  onClick={() => setShowResetConfirm(false)}
                  className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={resetToDefaultInterests}
                  className="flex-1 px-4 py-2 text-white bg-red-500 hover:bg-red-600 rounded-xl font-medium transition-colors"
                >
                  Reset to Default
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
    <div className="fixed inset-0 bg-black/80 backdrop-blur-xl z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-md w-full max-h-[90vh] overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="bg-gradient-to-r from-green-500 to-emerald-500 p-6 text-white">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold">
              {authMode === 'signin' ? 'Welcome Back' : 'Join Pearadox'}
            </h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-full transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          <p className="text-green-100 mt-2">
            {authMode === 'signin' 
              ? 'Sign in to access your research hub'
              : 'Create your account to start discovering research'
            }
          </p>
        </div>

        {/* Auth Form */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          <form onSubmit={handleAuthSubmit} className="space-y-4">
            {authMode === 'signup' && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                  <input
                    type="text"
                    required
                    value={authForm.name}
                    onChange={(e) => setAuthForm(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    placeholder="Dr. Jane Smith"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Professional Title</label>
                  <input
                    type="text"
                    value={authForm.title}
                    onChange={(e) => setAuthForm(prev => ({ ...prev, title: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    placeholder="Research Scientist"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Institution</label>
                  <input
                    type="text"
                    value={authForm.institution}
                    onChange={(e) => setAuthForm(prev => ({ ...prev, institution: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    placeholder="Stanford University"
                  />
                </div>
              </>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                type="email"
                required
                value={authForm.email}
                onChange={(e) => setAuthForm(prev => ({ ...prev, email: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="you@example.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={authForm.password}
                  onChange={(e) => setAuthForm(prev => ({ ...prev, password: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 pr-10"
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
                <label className="block text-sm font-medium text-gray-700 mb-1">Confirm Password</label>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={authForm.confirmPassword}
                  onChange={(e) => setAuthForm(prev => ({ ...prev, confirmPassword: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="••••••••"
                  minLength={6}
                />
              </div>
            )}

            {authError && (
              <div className={`p-3 rounded-lg text-sm ${
                authError.includes('successfully')
                  ? 'bg-green-50 text-green-800 border border-green-200'
                  : 'bg-red-50 text-red-800 border border-red-200'
              }`}>
                {authError}
              </div>
            )}

            <button
              type="submit"
              disabled={authLoading}
              className="w-full bg-gradient-to-r from-green-500 to-emerald-500 text-white py-3 rounded-lg font-medium hover:from-green-600 hover:to-emerald-600 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
            >
              {authLoading ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              ) : (
                <>
                  {authMode === 'signin' ? <LogIn className="h-4 w-4" /> : <UserPlus className="h-4 w-4" />}
                  <span>{authMode === 'signin' ? 'Sign In' : 'Create Account'}</span>
                </>
              )}
            </button>

            <div className="text-center pt-4 border-t border-gray-200">
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
                className="text-green-600 hover:text-green-800 font-medium"
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
            <h3 className="text-lg font-bold text-gray-900 mb-4">Reset Research Interests?</h3>
            <p className="text-gray-600 mb-6">
              This will replace your current research interests with the default 5 categories:
            </p>
            <ul className="text-sm text-gray-700 mb-6 space-y-1">
              <li>• Machine Learning</li>
              <li>• Artificial Intelligence</li>
              <li>• Computer Vision and Pattern Recognition</li>
              <li>• Robotics</li>
              <li>• Natural Language (Computation and Language)</li>
            </ul>
            <div className="flex space-x-3">
              <button
                onClick={() => setShowResetConfirm(false)}
                className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={resetToDefaultInterests}
                className="flex-1 px-4 py-2 text-white bg-purple-600 hover:bg-purple-700 rounded-xl font-medium transition-colors"
              >
                Reset to Default
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AccountModal; 