import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';

const ThemeContext = createContext();

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export const ThemeProvider = ({ children }) => {
  // Track current user ID
  const [userId, setUserId] = useState(null);
  const userIdRef = useRef(null);
  
  // Always start with light mode
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isReady, setIsReady] = useState(false);

  // Keep ref in sync with state
  useEffect(() => {
    userIdRef.current = userId;
  }, [userId]);

  // Apply theme class to document
  useEffect(() => {
    const root = document.documentElement;
    
    if (isDarkMode) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    
    // Save to localStorage if user is logged in
    if (userIdRef.current) {
      localStorage.setItem('pearadox-theme', isDarkMode ? 'dark' : 'light');
    }
  }, [isDarkMode]);

  // Initial auth check - only runs once on mount
  useEffect(() => {
    let mounted = true;
    
    const init = async () => {
      try {
        const { supabase } = await import('../lib/supabase');
        const { data: { session } } = await supabase.auth.getSession();
        
        if (mounted && session?.user) {
          const uid = session.user.id;
          setUserId(uid);
          userIdRef.current = uid;
          
          // Try to load saved mode from localStorage first (faster)
          const savedMode = localStorage.getItem('pearadox-theme');
          if (savedMode === 'dark') {
            setIsDarkMode(true);
          }
          
          // Then try to get from database
          try {
            const { data } = await supabase
              .from('profiles')
              .select('mode')
              .eq('id', uid)
              .single();
            
            if (mounted && data?.mode) {
              const dbDark = data.mode === 'dark';
              if (dbDark !== (savedMode === 'dark')) {
                setIsDarkMode(dbDark);
                localStorage.setItem('pearadox-theme', data.mode);
              }
            }
          } catch (e) {
            // Ignore profile load errors - use localStorage fallback
            console.log('ThemeContext: Could not load mode from profile');
          }
        }
      } catch (e) {
        console.log('ThemeContext: Init error', e);
      }
      
      if (mounted) {
        setIsReady(true);
      }
    };
    
    init();
    
    return () => {
      mounted = false;
    };
  }, []);

  // Listen for auth changes (sign in/out)
  useEffect(() => {
    let subscription = null;
    
    const setupListener = async () => {
      try {
        const { supabase } = await import('../lib/supabase');
        
        const { data: { subscription: sub } } = supabase.auth.onAuthStateChange(async (event, session) => {
          console.log('ThemeContext: Auth event:', event);
          
          if (event === 'SIGNED_OUT') {
            setUserId(null);
            userIdRef.current = null;
            setIsDarkMode(false);
            localStorage.removeItem('pearadox-theme');
          } else if (event === 'SIGNED_IN' && session?.user) {
            const uid = session.user.id;
            setUserId(uid);
            userIdRef.current = uid;
            
            // Load mode from database on sign in
            try {
              const { data } = await supabase
                .from('profiles')
                .select('mode')
                .eq('id', uid)
                .single();
              
              if (data?.mode === 'dark') {
                setIsDarkMode(true);
                localStorage.setItem('pearadox-theme', 'dark');
              } else {
                setIsDarkMode(false);
                localStorage.setItem('pearadox-theme', 'light');
              }
            } catch (e) {
              console.log('ThemeContext: Could not load mode on sign in');
            }
          }
        });
        
        subscription = sub;
      } catch (e) {
        console.log('ThemeContext: Could not set up auth listener');
      }
    };
    
    setupListener();
    
    return () => {
      if (subscription) {
        subscription.unsubscribe();
      }
    };
  }, []);

  // Toggle dark mode
  const toggleDarkMode = useCallback(async () => {
    const currentUserId = userIdRef.current;
    
    if (!currentUserId) {
      console.log('ThemeContext: Toggle requires login');
      return;
    }
    
    const newMode = !isDarkMode;
    const modeString = newMode ? 'dark' : 'light';
    
    // Update UI immediately
    setIsDarkMode(newMode);
    localStorage.setItem('pearadox-theme', modeString);
    
    // Save to database in background
    try {
      const { supabase } = await import('../lib/supabase');
      await supabase
        .from('profiles')
        .update({ mode: modeString })
        .eq('id', currentUserId);
      console.log('ThemeContext: Saved mode to database:', modeString);
    } catch (e) {
      console.log('ThemeContext: Could not save mode to database');
    }
  }, [isDarkMode]);

  // Set dark mode directly
  const setDarkModeValue = useCallback(async (enabled) => {
    const currentUserId = userIdRef.current;
    
    if (!currentUserId) {
      console.log('ThemeContext: Set mode requires login');
      return;
    }
    
    const modeString = enabled ? 'dark' : 'light';
    
    setIsDarkMode(enabled);
    localStorage.setItem('pearadox-theme', modeString);
    
    try {
      const { supabase } = await import('../lib/supabase');
      await supabase
        .from('profiles')
        .update({ mode: modeString })
        .eq('id', currentUserId);
    } catch (e) {
      console.log('ThemeContext: Could not save mode to database');
    }
  }, []);

  // Sync mode from profile (called by AccountModal after loading profile)
  const syncModeFromProfile = useCallback((mode) => {
    if (mode === 'dark' || mode === 'light') {
      const newIsDark = mode === 'dark';
      setIsDarkMode(newIsDark);
      localStorage.setItem('pearadox-theme', mode);
    }
  }, []);

  // Set user ID (called by AccountModal after auth)
  const setCurrentUserId = useCallback((uid) => {
    setUserId(uid);
    userIdRef.current = uid;
    
    if (!uid) {
      // User signed out
      setIsDarkMode(false);
      localStorage.removeItem('pearadox-theme');
    }
  }, []);

  const value = {
    isDarkMode,
    toggleDarkMode,
    setIsDarkMode: setDarkModeValue,
    syncModeFromProfile,
    setCurrentUserId,
    isLoggedIn: !!userId,
    isReady
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

export default ThemeContext;
