import React, { createContext, useContext, useState, useEffect } from 'react';
import { authAPI, savedArticlesAPI } from '../lib/supabase';

const UserContext = createContext(undefined);

export const UserProvider = ({ children }) => {
  // User state
  const [user, setUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [userSkillLevel, setUserSkillLevel] = useState('Beginner');
  const [userResearchInterests, setUserResearchInterests] = useState([]);
  
  // Saved articles state
  const [savedArticlesFromDB, setSavedArticlesFromDB] = useState([]);
  const [isLoadingSavedArticles, setIsLoadingSavedArticles] = useState(false);
  const [favorites, setFavorites] = useState(new Set());

  // Initialize auth state
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const session = await authAPI.getCurrentSession();
        if (session?.user) {
          setUser(session.user);
          const profile = await authAPI.getProfile(session.user.id);
          if (profile) {
            setUserProfile(profile);
            setUserSkillLevel(profile.skill_level || 'Beginner');
            setUserResearchInterests(profile.research_interests || []);
          }
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
      }
    };

    initializeAuth();

    // Listen for auth changes
    const { unsubscribe } = authAPI.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        setUser(session.user);
        // Load profile
        authAPI.getProfile(session.user.id).then(profile => {
          if (profile) {
            setUserProfile(profile);
            setUserSkillLevel(profile.skill_level || 'Beginner');
            setUserResearchInterests(profile.research_interests || []);
          }
        });
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
        setUserProfile(null);
        setUserSkillLevel('Beginner');
        setUserResearchInterests([]);
        setSavedArticlesFromDB([]);
        setFavorites(new Set());
      }
    });

    return () => unsubscribe?.();
  }, []);

  // Load saved articles when user changes
  useEffect(() => {
    if (user) {
      loadUserSavedArticles();
    } else {
      setSavedArticlesFromDB([]);
      setFavorites(new Set());
    }
  }, [user, userSkillLevel]);

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
      
      // Get just the IDs for the favorites set (for heart icons in main feed)
      const favoriteIds = savedArticlesWithDetails.map(article => article.id);
      const favoritesSet = new Set(favoriteIds);
      console.log('💝 Setting favorites:', favoriteIds.length, 'articles');
      setFavorites(favoritesSet);
      
      // Generate tags function (simplified version)
      const generateTags = (categoryName, title, abstract) => {
        const tags = [];
        if (categoryName) tags.push(categoryName);
        return tags;
      };

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
      setSavedArticlesFromDB(formattedSavedArticles);
      
    } catch (error) {
      console.error('❌ Error loading saved articles:', error);
      setSavedArticlesFromDB([]);
    } finally {
      setIsLoadingSavedArticles(false);
    }
  };

  const handleSkillLevelChange = async (newSkillLevel) => {
    setUserSkillLevel(newSkillLevel);
    if (user) {
      try {
        await authAPI.updateProfile(user.id, { skill_level: newSkillLevel });
        setUserProfile(prev => ({ ...prev, skill_level: newSkillLevel }));
      } catch (error) {
        console.error('Error updating skill level:', error);
      }
    }
  };

  const handleResearchInterestsChange = async (newInterests) => {
    setUserResearchInterests(newInterests);
    if (user) {
      try {
        await authAPI.updateProfile(user.id, { research_interests: newInterests });
        setUserProfile(prev => ({ ...prev, research_interests: newInterests }));
      } catch (error) {
        console.error('Error updating research interests:', error);
      }
    }
  };

  const handleToggleFavorite = async (articleId) => {
    if (!user) {
      console.log('User must be logged in to save articles');
      return;
    }

    try {
      const isFavorited = favorites.has(articleId);
      
      // Optimistic update
      const newFavorites = new Set(favorites);
      if (isFavorited) {
        newFavorites.delete(articleId);
      } else {
        newFavorites.add(articleId);
      }
      setFavorites(newFavorites);
      
      // Make API call
      if (isFavorited) {
        await savedArticlesAPI.removeSavedArticle(user.id, articleId);
        console.log('✅ Article removed from saved articles');
      } else {
        await savedArticlesAPI.saveArticle(user.id, articleId, userSkillLevel);
        console.log('✅ Article saved to saved articles');
      }
      
      // Reload saved articles panel to reflect the change
      await loadUserSavedArticles();
      
    } catch (error) {
      console.error('❌ Error toggling favorite:', error);
      // Revert optimistic update on error
      loadUserSavedArticles();
      // Show user-friendly error message
      alert(`Failed to ${favorites.has(articleId) ? 'remove' : 'save'} article. Please try again.`);
    }
  };

  const value = {
    // User state
    user,
    userProfile,
    userSkillLevel,
    userResearchInterests,
    
    // Saved articles state
    savedArticlesFromDB,
    isLoadingSavedArticles,
    favorites,
    
    // Functions
    loadUserSavedArticles,
    handleSkillLevelChange,
    handleResearchInterestsChange,
    handleToggleFavorite,
    
    // Setters (for components that need direct access)
    setUser,
    setUserProfile,
    setUserSkillLevel,
    setUserResearchInterests
  };

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  );
};

// Add display name for better debugging and Fast Refresh compatibility
UserProvider.displayName = 'UserProvider';

// Hook must be defined after the component for Fast Refresh compatibility
export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};
