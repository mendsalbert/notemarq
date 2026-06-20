'use client';

import { createContext, useCallback, useContext, useMemo, useState } from 'react';

type ViewMode = 'grid' | 'list';

interface AppSearchContextValue {
  query: string;
  setQuery: (query: string) => void;
  viewMode: ViewMode;
  setViewMode: (mode: ViewMode) => void;
  toggleViewMode: () => void;
}

const AppSearchContext = createContext<AppSearchContextValue | undefined>(undefined);

export function AppSearchProvider({ children }: { children: React.ReactNode }) {
  const [query, setQuery] = useState('');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');

  const toggleViewMode = useCallback(() => {
    setViewMode((mode) => (mode === 'grid' ? 'list' : 'grid'));
  }, []);

  const value = useMemo(
    () => ({ query, setQuery, viewMode, setViewMode, toggleViewMode }),
    [query, viewMode, toggleViewMode],
  );

  return <AppSearchContext.Provider value={value}>{children}</AppSearchContext.Provider>;
}

export function useAppSearch() {
  const ctx = useContext(AppSearchContext);
  if (!ctx) throw new Error('useAppSearch must be used within AppSearchProvider');
  return ctx;
}
