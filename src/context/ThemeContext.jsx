import React, { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

export const themes = [
  { id: 'purple', name: 'AI Purple', color: '#6d28d9', className: '' },
  { id: 'dark', name: 'Deep Blue', color: '#3b82f6', className: 'theme-dark' },
  { id: 'midnight', name: 'Midnight', color: '#1e3a8a', className: 'theme-midnight' },
  { id: 'neon', name: 'Neon Cyber', color: '#d946ef', className: 'theme-neon' },
  { id: 'emerald', name: 'Emerald', color: '#10b981', className: 'theme-emerald' },
  { id: 'cyber', name: 'Matrix', color: '#00ff41', className: 'theme-cyber' },
];

export const ThemeProvider = ({ children }) => {
  const [currentTheme, setCurrentTheme] = useState(localStorage.getItem('admin_theme') || 'purple');

  useEffect(() => {
    // Remove all theme classes first
    const root = window.document.documentElement;
    themes.forEach(theme => {
      if (theme.className) root.classList.remove(theme.className);
    });
    
    // Add current theme class
    const themeObj = themes.find(t => t.id === currentTheme);
    if (themeObj && themeObj.className) {
      root.classList.add(themeObj.className);
    }
    
    localStorage.setItem('admin_theme', currentTheme);
  }, [currentTheme]);

  return (
    <ThemeContext.Provider value={{ currentTheme, setCurrentTheme, themes }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
