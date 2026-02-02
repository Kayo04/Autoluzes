'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

type Theme = 'light' | 'dark';

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
  mounted: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>('light');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    
    // Load theme from localStorage
    const savedTheme = localStorage.getItem('theme') as Theme;
    console.log('🎨 Loading theme from localStorage:', savedTheme);
    
    if (savedTheme && (savedTheme === 'light' || savedTheme === 'dark')) {
      setTheme(savedTheme);
      applyTheme(savedTheme);
    } else {
      // Default to light mode
      const defaultTheme: Theme = 'light';
      setTheme(defaultTheme);
      applyTheme(defaultTheme);
      localStorage.setItem('theme', defaultTheme);
    }
  }, []);

  const applyTheme = (newTheme: Theme) => {
    console.log('🎨 Applying theme:', newTheme);
    const html = document.documentElement;
    
    if (newTheme === 'dark') {
      html.classList.add('dark');
      console.log('✅ Added dark class. Classes:', html.className);
    } else {
      html.classList.remove('dark');
      console.log('✅ Removed dark class. Classes:', html.className);
    }
  };

  const toggleTheme = () => {
    console.log('🔄 Toggle theme clicked. Current theme:', theme);
    const newTheme: Theme = theme === 'light' ? 'dark' : 'light';
    console.log('🔄 New theme will be:', newTheme);
    
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    applyTheme(newTheme);
  };

  // Always render the provider
  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, mounted }}>
      {/* Script to avoid FOUC (Flash of Unstyled Content) for theme */}
      <script
        dangerouslySetInnerHTML={{
          __html: `
            (function() {
              try {
                var localTheme = localStorage.getItem('theme');
                console.log('⚡ Initial script - theme from storage:', localTheme);
                if (localTheme === 'dark') {
                  document.documentElement.classList.add('dark');
                  console.log('⚡ Initial script - added dark class');
                } else {
                  document.documentElement.classList.remove('dark');
                  console.log('⚡ Initial script - removed dark class');
                }
              } catch (e) {
                console.error('⚡ Initial script error:', e);
              }
            })();
          `,
        }}
      />
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
}
