'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

import type { AppColorScheme } from '@/lib/colors';

interface ThemeContextValue {
  colorScheme: AppColorScheme;
  isDark: boolean;
  isReady: boolean;
  setDarkMode: (enabled: boolean) => void;
  toggleDarkMode: () => void;
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);
const STORAGE_KEY = 'notemarq-web-theme';

function readStoredTheme(): AppColorScheme | null {
  if (typeof window === 'undefined') return null;
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored === 'dark' || stored === 'light') return stored;
  return null;
}

function resolveTheme(): AppColorScheme {
  const stored = readStoredTheme();
  if (stored) return stored;
  return 'dark';
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [colorScheme, setColorScheme] = useState<AppColorScheme>(() =>
    typeof window === 'undefined' ? 'dark' : resolveTheme(),
  );
  const [isReady, setIsReady] = useState(() => typeof window !== 'undefined');

  useEffect(() => {
    const next = resolveTheme();
    setColorScheme(next);
    document.documentElement.classList.toggle('dark', next === 'dark');
    setIsReady(true);
  }, []);

  const apply = useCallback((scheme: AppColorScheme) => {
    setColorScheme(scheme);
    localStorage.setItem(STORAGE_KEY, scheme);
    document.documentElement.classList.toggle('dark', scheme === 'dark');
  }, []);

  const setDarkMode = useCallback(
    (enabled: boolean) => apply(enabled ? 'dark' : 'light'),
    [apply],
  );

  const toggleDarkMode = useCallback(() => {
    setColorScheme((current) => {
      const next = current === 'dark' ? 'light' : 'dark';
      localStorage.setItem(STORAGE_KEY, next);
      document.documentElement.classList.toggle('dark', next === 'dark');
      return next;
    });
  }, []);

  const value = useMemo(
    () => ({
      colorScheme,
      isDark: colorScheme === 'dark',
      isReady,
      setDarkMode,
      toggleDarkMode,
    }),
    [colorScheme, isReady, setDarkMode, toggleDarkMode],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider');
  return ctx;
}
