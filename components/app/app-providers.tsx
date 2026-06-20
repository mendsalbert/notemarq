'use client';

import { AuthProvider } from '@/contexts/auth-provider';
import { AppSearchProvider } from '@/contexts/app-search-context';
import { ThemeProvider } from '@/contexts/theme-provider';

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <AuthProvider>
        <AppSearchProvider>{children}</AppSearchProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
