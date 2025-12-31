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
  const [isAuthChecked, setIsAuthChecked] = useState(false);
  
  // Always start with light mode - dark mode is only for logged-in users
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Apply theme class to document
  useEffect(() => {
    const root = document.documentElement;
    
    if (isDarkMode) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    
    // Only save to localStorage if user is logged in
    if (userId) {
      localStorage.setItem('pearadox-theme', isDarkMode ? 'dark' : 'light');
    }
  }, [isDarkMode, userId]);

  // Auth listener - track user ID and handle sign out
  useEffect(() => {
    let mounted = true;
    
    const checkUser = async () => {
      try {
        // Dynamic import to avoid blocking
        const { authAPI } = await import('../lib/supabase');
        
        if (!authAPI || typeof authAPI.getCurrentSession !== 'function') {
          if (mounted) setIsAuthChecked(true);
          return;
        }
        
        const { data: { session } } = await authAPI.getCurrentSession();
        
        if (mounted) {
          if (session?.user) {
            setUserId(session.user.id);
            // Load saved theme preference from localStorage for logged-in users
            const saved = localStorage.getItem('pearadox-theme');
            if (saved === 'dark') {
              setIsDarkMode(true);
            }
          } else {
            // No user - ensure light mode
            setUserId(null);
            setIsDarkMode(false);
          }
          setIsAuthChecked(true);
        }
      } catch (error) {
        console.log('ThemeContext: Could not check user session');
        if (mounted) setIsAuthChecked(true);
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
              // Load saved theme preference for newly signed-in user
              const saved = localStorage.getItem('pearadox-theme');
              if (saved === 'dark') {
                setIsDarkMode(true);
              }
            } else if (event === 'SIGNED_OUT') {
              // User signed out - revert to light mode
              setUserId(null);
              setIsDarkMode(false);
              // Clear the theme preference from localStorage
              localStorage.removeItem('pearadox-theme');
              console.log('🌓 User signed out - reverted to light mode');
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

  // Toggle dark mode - only works if user is logged in
  const toggleDarkMode = useCallback(async () => {
    // Only allow toggling if user is logged in
    if (!userId) {
      console.log('🌓 Dark mode toggle requires login');
      return;
    }
    
    const newMode = !isDarkMode;
    setIsDarkMode(newMode);
    
    // Save to database
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
  }, [isDarkMode, userId]);

  // Set dark mode directly - only works if user is logged in
  const setDarkMode = useCallback(async (enabled) => {
    // Only allow setting if user is logged in
    if (!userId) {
      console.log('🌓 Dark mode requires login');
      return;
    }
    
    setIsDarkMode(enabled);
    
    // Save to database
    try {
      const { authAPI } = await import('../lib/supabase');
      if (authAPI && typeof authAPI.updateMode === 'function') {
        await authAPI.updateMode(userId, enabled ? 'dark' : 'light');
        console.log('🌓 Mode preference saved to database:', enabled ? 'dark' : 'light');
      }
    } catch (error) {
      console.log('🌓 Could not save mode to database');
    }
  }, [userId]);

  // Function to sync mode from profile (called by AccountModal after loading profile)
  const syncModeFromProfile = useCallback((mode) => {
    // Only sync if user is logged in
    if (!userId) return;
    
    if (mode === 'dark' || mode === 'light') {
      const newIsDark = mode === 'dark';
      if (newIsDark !== isDarkMode) {
        setIsDarkMode(newIsDark);
        localStorage.setItem('pearadox-theme', mode);
        console.log('🌓 Synced mode from profile:', mode);
      }
    }
  }, [isDarkMode, userId]);

  const value = {
    isDarkMode,
    toggleDarkMode,
    setIsDarkMode: setDarkMode,
    syncModeFromProfile,
    isLoggedIn: !!userId // Expose login state so UI can show/hide toggle
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

export default ThemeContext;
