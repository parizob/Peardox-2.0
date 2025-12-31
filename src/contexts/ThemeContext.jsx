import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

const ThemeContext = createContext();

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export const ThemeProvider = ({ children }) => {
  // Track current user ID for database syncing
  const [userId, setUserId] = useState(null);
  
  // Initialize from localStorage or default to light mode
  const [isDarkMode, setIsDarkMode] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('pearadox-theme');
      if (saved) {
        return saved === 'dark';
      }
      // Check system preference as fallback
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return false;
  });

  // Apply theme class to document
  useEffect(() => {
    const root = document.documentElement;
    
    if (isDarkMode) {
      root.classList.add('dark');
      localStorage.setItem('pearadox-theme', 'dark');
    } else {
      root.classList.remove('dark');
      localStorage.setItem('pearadox-theme', 'light');
    }
  }, [isDarkMode]);

  // Simple auth listener - just track user ID, don't load profile here
  // Profile loading is handled by AccountModal to avoid conflicts
  useEffect(() => {
    let mounted = true;
    
    const checkUser = async () => {
      try {
        // Dynamic import to avoid blocking
        const { authAPI } = await import('../lib/supabase');
        
        if (!authAPI || typeof authAPI.getCurrentSession !== 'function') {
          return;
        }
        
        const { data: { session } } = await authAPI.getCurrentSession();
        
        if (session?.user && mounted) {
          setUserId(session.user.id);
        }
      } catch (error) {
        console.log('ThemeContext: Could not check user session');
      }
    };

    checkUser();

    // Set up auth listener
    const setupAuthListener = async () => {
      try {
        const { authAPI } = await import('../lib/supabase');
        
        if (authAPI && typeof authAPI.onAuthStateChange === 'function') {
          const result = authAPI.onAuthStateChange((event, session) => {
            if (!mounted) return;
            
            if (event === 'SIGNED_IN' && session?.user) {
              setUserId(session.user.id);
            } else if (event === 'SIGNED_OUT') {
              setUserId(null);
            }
          });
          
          return result?.data?.subscription;
        }
      } catch (error) {
        console.log('ThemeContext: Could not set up auth listener');
      }
      return null;
    };

    let subscription = null;
    setupAuthListener().then(sub => {
      subscription = sub;
    });

    return () => {
      mounted = false;
      if (subscription) {
        try {
          subscription.unsubscribe();
        } catch (error) {
          // Ignore cleanup errors
        }
      }
    };
  }, []);

  // Listen for system preference changes
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    const handleChange = (e) => {
      // Only auto-switch if user hasn't manually set a preference and isn't logged in
      const saved = localStorage.getItem('pearadox-theme');
      if (!saved && !userId) {
        setIsDarkMode(e.matches);
      }
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [userId]);

  // Toggle dark mode and save to database if user is authenticated
  const toggleDarkMode = useCallback(async () => {
    const newMode = !isDarkMode;
    setIsDarkMode(newMode);
    
    // Save to database if user is authenticated
    if (userId) {
      try {
        const { authAPI } = await import('../lib/supabase');
        if (authAPI && typeof authAPI.updateMode === 'function') {
          await authAPI.updateMode(userId, newMode ? 'dark' : 'light');
          console.log('🌓 Mode preference saved to database:', newMode ? 'dark' : 'light');
        }
      } catch (error) {
        // Mode column might not exist yet - that's okay, localStorage still works
        console.log('🌓 Could not save mode to database');
      }
    }
  }, [isDarkMode, userId]);

  // Set dark mode directly (also saves to database)
  const setDarkMode = useCallback(async (enabled) => {
    setIsDarkMode(enabled);
    
    // Save to database if user is authenticated
    if (userId) {
      try {
        const { authAPI } = await import('../lib/supabase');
        if (authAPI && typeof authAPI.updateMode === 'function') {
          await authAPI.updateMode(userId, enabled ? 'dark' : 'light');
          console.log('🌓 Mode preference saved to database:', enabled ? 'dark' : 'light');
        }
      } catch (error) {
        console.log('🌓 Could not save mode to database');
      }
    }
  }, [userId]);

  // Function to sync mode from profile (called by AccountModal after loading profile)
  const syncModeFromProfile = useCallback((mode) => {
    if (mode === 'dark' || mode === 'light') {
      const newIsDark = mode === 'dark';
      if (newIsDark !== isDarkMode) {
        setIsDarkMode(newIsDark);
        localStorage.setItem('pearadox-theme', mode);
        console.log('🌓 Synced mode from profile:', mode);
      }
    }
  }, [isDarkMode]);

  const value = {
    isDarkMode,
    toggleDarkMode,
    setIsDarkMode: setDarkMode,
    syncModeFromProfile
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

export default ThemeContext;
