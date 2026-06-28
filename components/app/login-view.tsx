'use client';

import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import Image from 'next/image';

import { useAuth } from '@/contexts/auth-provider';
import { useAppColors } from '@/hooks/use-app-colors';
import { forkPublicIdeaBoard } from '@/lib/supabase/publicBoards';

export function LoginView() {
  const { user, isLoading, isConfigured, signInWithGoogle } = useAuth();
  const { colors } = useAppColors();
  const router = useRouter();
  const searchParams = useSearchParams();
  const forkId = searchParams.get('fork');
  const returnTo = searchParams.get('returnTo') ?? '/app';
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (isLoading || !user) return;

    void (async () => {
      if (forkId) {
        try {
          const result = await forkPublicIdeaBoard(forkId);
          router.replace(`/app/folders/${result.folderId}`);
          return;
        } catch (err) {
          setError(err instanceof Error ? err.message : 'Could not clone this board.');
        }
      }

      router.replace(returnTo.startsWith('/') ? returnTo : '/app');
    })();
  }, [user, isLoading, forkId, returnTo, router]);

  async function handleGoogleSignIn() {
    setSubmitting(true);
    setError('');
    try {
      const redirectPath = forkId
        ? `/app/login?fork=${encodeURIComponent(forkId)}&returnTo=${encodeURIComponent(returnTo)}`
        : '/app';
      await signInWithGoogle(redirectPath);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Sign-in failed');
      setSubmitting(false);
    }
  }

  if (isLoading || user) {
    return (
      <div className="flex min-h-screen items-center justify-center" style={{ backgroundColor: colors.pageBackground }}>
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#4FC3F7] border-t-transparent" />
      </div>
    );
  }

  return (
    <div
      className="flex min-h-screen items-center justify-center px-4"
      style={{ backgroundColor: colors.pageBackground, color: colors.text }}
    >
      <div
        className="w-full max-w-md rounded-3xl border p-8 shadow-sm"
        style={{ backgroundColor: colors.cardBackground, borderColor: colors.border }}
      >
        <div className="mb-8 flex flex-col items-center text-center">
          <Image src="/logog.png" alt="Notemarq" width={56} height={56} className="rounded-2xl" />
          <h1 className="mt-4 text-2xl font-semibold">
            {forkId ? 'Save to your library' : 'Welcome to notemarq'}
          </h1>
          <p className="mt-2 text-sm leading-relaxed opacity-60">
            {forkId
              ? 'Sign in to copy this shared folder into your personal notemarq workspace.'
              : 'Sign in with the same Google account as the mobile app to sync your bookmarks and notes.'}
          </p>
        </div>

        {!isConfigured ? (
          <p className="rounded-xl bg-amber-500/10 px-4 py-3 text-sm text-amber-600 dark:text-amber-400">
            Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY to website/.env.local
          </p>
        ) : (
          <button
            type="button"
            onClick={() => void handleGoogleSignIn()}
            disabled={submitting}
            className="flex w-full items-center justify-center gap-3 rounded-full px-4 py-3.5 font-poppins text-sm font-bold text-white transition hover:opacity-95 disabled:opacity-60"
            style={{ backgroundColor: colors.coral }}
          >
            Continue with Google
          </button>
        )}

        {error ? <p className="mt-4 text-center text-sm text-red-500">{error}</p> : null}

        <p className="mt-6 text-center text-sm opacity-60">
          <Link href="/" style={{ color: colors.primary }}>
            Back to website
          </Link>
        </p>
      </div>
    </div>
  );
}
