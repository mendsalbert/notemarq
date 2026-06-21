'use client';

import { AuthProvider } from '@/contexts/auth-provider';
import { ThemeProvider } from '@/contexts/theme-provider';

export default function PublicBoardLayout({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <AuthProvider>{children}</AuthProvider>
    </ThemeProvider>
  );
}
