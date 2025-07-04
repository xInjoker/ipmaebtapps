
'use client';

import { createContext, useContext, useEffect, useState, ReactNode, useCallback } from 'react';

type Theme = 'indigo' | 'green' | 'rose';

type ColorThemeProviderProps = {
  children: ReactNode;
  defaultTheme?: Theme;
  storageKey?: string;
};

type ColorThemeProviderState = {
  theme: Theme;
  setTheme: (theme: Theme) => void;
};

const initialState: ColorThemeProviderState = {
  theme: 'indigo',
  setTheme: () => null,
};

const ColorThemeContext = createContext<ColorThemeProviderState>(initialState);

export function ColorThemeProvider({
  children,
  defaultTheme = 'indigo',
  storageKey = 'protrack-color-theme',
  ...props
}: ColorThemeProviderProps) {
  const [theme, setTheme] = useState<Theme>(() => {
    try {
      const item = window.localStorage.getItem(storageKey);
      return item ? (item as Theme) : defaultTheme;
    } catch (error) {
      return defaultTheme;
    }
  });

  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove('theme-green', 'theme-rose');

    if (theme !== 'indigo') {
      root.classList.add(`theme-${theme}`);
    }
  }, [theme]);

  const value = {
    theme,
    setTheme: useCallback((newTheme: Theme) => {
      try {
        window.localStorage.setItem(storageKey, newTheme);
      } catch (error) {
        console.error('Failed to set theme in localStorage', error);
      }
      setTheme(newTheme);
    }, [storageKey]),
  };

  return (
    <ColorThemeContext.Provider {...props} value={value}>
      {children}
    </ColorThemeContext.Provider>
  );
}

export const useColorTheme = () => {
  const context = useContext(ColorThemeContext);

  if (context === undefined)
    throw new Error('useColorTheme must be used within a ColorThemeProvider');

  return context;
};
