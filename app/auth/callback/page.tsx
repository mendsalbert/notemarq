'use client';

import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useState } from 'react';

import { supabase } from '@/lib/supabase/client';
import { describeSupabaseError } from '@/lib/supabase/errors';

function AuthCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState('');

  useEffect(() => {
    let mounted = true;
    let subscription: { unsubscribe: () => void } | null = null;
    let timeoutId: number | null = null;

    void (async () => {
      const next = searchParams.get('next') ?? '/app';
      const safeNext = next.startsWith('/') && !next.startsWith('//') ? next : '/app';

      const hashParams = new URLSearchParams(window.location.hash.replace(/^#/, ''));
      const queryParams = new URLSearchParams(window.location.search);
      const authError =
        hashParams.get('error_description') ||
        hashParams.get('error') ||
        queryParams.get('error_description') ||
        queryParams.get('error');

      if (authError) {
        if (mounted) {
          setError(decodeURIComponent(authError.replace(/\+/g, ' ')));
        }
        return;
      }

      const { data, error: sessionError } = await supabase.auth.getSession();

      if (!mounted) return;

      if (sessionError) {
        setError(describeSupabaseError(sessionError));
        return;
      }

      if (data.session) {
        router.replace(safeNext);
        return;
      }

      const {
        data: { subscription: authSubscription },
      } = supabase.auth.onAuthStateChange((event, session) => {
        if (!mounted) return;

        if (session && (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED')) {
          authSubscription.unsubscribe();
          router.replace(safeNext);
        }
      });

      subscription = authSubscription;

      timeoutId = window.setTimeout(() => {
        if (!mounted) return;
        subscription?.unsubscribe();
        setError('Sign-in timed out. Please try again.');
      }, 15000);
    })();

    return () => {
      mounted = false;
      subscription?.unsubscribe();
      if (timeoutId) window.clearTimeout(timeoutId);
    };
  }, [router, searchParams]);

  if (error) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center px-4 text-center">
        <p className="max-w-md text-sm text-red-500">{error}</p>
        <Link
          href="/app/login"
          className="mt-6 rounded-full bg-[#C96A48] px-5 py-2.5 text-sm font-semibold text-white"
        >
          Back to sign in
        </Link>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#4FC3F7] border-t-transparent" />
    </div>
  );
}

export default function AuthCallbackPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#4FC3F7] border-t-transparent" />
        </div>
      }
    >
      <AuthCallbackContent />
    </Suspense>
  );
}
