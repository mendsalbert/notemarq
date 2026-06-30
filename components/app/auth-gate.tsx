'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

import { AppShell } from '@/components/app/app-shell';
import { useAuth } from '@/contexts/auth-provider';
import { APP_ENTRY_HREF } from '@/lib/marketing';

function hasOAuthCallbackParams() {
  if (typeof window === 'undefined') return false;

  const hash = new URLSearchParams(window.location.hash.replace(/^#/, ''));
  const query = new URLSearchParams(window.location.search);

  return Boolean(
    hash.get('access_token') ||
      hash.get('code') ||
      query.get('code') ||
      hash.get('error') ||
      query.get('error'),
  );
}

export function AuthGate({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isLoading || user || hasOAuthCallbackParams()) return;
    router.replace(APP_ENTRY_HREF);
  }, [user, isLoading, router]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#FAFAF8]">
        <p className="text-sm text-[#6B7280]">Loading your workspace…</p>
      </div>
    );
  }

  if (!user) return null;

  return <AppShell>{children}</AppShell>;
}
