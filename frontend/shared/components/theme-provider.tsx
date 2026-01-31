'use client';

import { useEffect } from 'react';

export default function ThemeProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    const updateTheme = () => {
      const isDark = mediaQuery.matches;
      document.documentElement.classList.toggle('dark', isDark);
    };
    
    updateTheme();
    
    mediaQuery.addEventListener('change', updateTheme);
    
    return () => {
      mediaQuery.removeEventListener('change', updateTheme);
    };
  }, []);

  return <>{children}</>;
}