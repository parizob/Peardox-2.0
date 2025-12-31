import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '../lib/supabase';

const ThemeContext = createContext();

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export const ThemeProvider = ({ children }) => {
  // Track current user ID - set by AccountModal
  const userIdRef = useRef(null);
  
  // Dark mode state
  const [isDarkMode, setIsDarkMode] = useState(false);
  const isDarkModeRef = useRef(false);

  // Keep isDarkModeRef in sync
  useEffect(() => {
    isDarkModeRef.current = isDarkMode;
  }, [isDarkMode]);

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

  // On mount, check if there's a session and load theme
  useEffect(() => {
    const loadInitialTheme = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session?.user) {
          userIdRef.current = session.user.id;
          
          // Load from localStorage first
          const savedMode = localStorage.getItem('pearadox-theme');
          if (savedMode === 'dark') {
            setIsDarkMode(true);
            isDarkModeRef.current = true;
          }
        }
      } catch (e) {
        console.log('ThemeContext: Error loading initial theme');
      }
    };
    
    loadInitialTheme();
  }, []);

  // Toggle dark mode
  const toggleDarkMode = useCallback(() => {
    const currentUserId = userIdRef.current;
    const currentIsDark = isDarkModeRef.current;
    
    if (!currentUserId) {
      console.log('ThemeContext: Toggle requires login');
      return;
    }
    
    const newMode = !currentIsDark;
    const modeString = newMode ? 'dark' : 'light';
    
    // Update UI immediately
    setIsDarkMode(newMode);
    isDarkModeRef.current = newMode;
    localStorage.setItem('pearadox-theme', modeString);
    
    // Save to database in background
    supabase
      .from('profiles')
      .update({ mode: modeString })
      .eq('id', currentUserId)
      .then(({ error }) => {
        if (error) {
          console.error('ThemeContext: DB error:', error.message);
        } else {
          console.log('ThemeContext: Saved to DB:', modeString);
        }
      });
  }, []);

  // Sync mode from profile (called by AccountModal after loading profile)
  const syncModeFromProfile = useCallback((mode, userId) => {
    if (userId) {
      userIdRef.current = userId;
    }
    
    if (mode === 'dark' || mode === 'light') {
      const newIsDark = mode === 'dark';
      setIsDarkMode(newIsDark);
      isDarkModeRef.current = newIsDark;
      localStorage.setItem('pearadox-theme', mode);
    }
  }, []);

  // Set user ID (called by AccountModal after auth)
  const setCurrentUserId = useCallback((uid) => {
    userIdRef.current = uid;
    
    if (!uid) {
      // User signed out - reset to light mode
      setIsDarkMode(false);
      isDarkModeRef.current = false;
      localStorage.removeItem('pearadox-theme');
    }
  }, []);

  const value = {
    isDarkMode,
    toggleDarkMode,
    syncModeFromProfile,
    setCurrentUserId,
    isLoggedIn: !!userIdRef.current
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

export default ThemeContext;
