'use client';

import { AuthProvider } from '@/contexts/auth-provider';

export default function PublicBoardLayout({ children }: { children: React.ReactNode }) {
  return <AuthProvider>{children}</AuthProvider>;
}
