'use client';

import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';
import Image from 'next/image';

import { GoogleSignInButton } from '@/components/google-sign-in-button';
import { useAuth } from '@/contexts/auth-provider';
import { getGoogleWebClientId } from '@/lib/google-client-id';
import { forkPublicIdeaBoard } from '@/lib/supabase/publicBoards';

const BG = '#000000';
const CARD = '#141414';
const BORDER = '#1F1F1F';
const TEXT = '#FFFFFF';
const SOFT = 'rgba(255,255,255,0.62)';
const SOFTER = 'rgba(255,255,255,0.38)';
const CORAL = '#C96A48';
const CYAN = '#22D3EE';
const LAVENDER = '#1A1828';
const MINT = '#122018';
const PEACH = '#221A14';

export function LoginView() {
  const { user, isLoading, isConfigured, signInWithGoogleIdToken } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const forkId = searchParams.get('fork');
  const returnTo =
    searchParams.get('returnTo') ?? searchParams.get('next') ?? '/app';
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const googleConfigured = Boolean(getGoogleWebClientId());

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

  const handleCredential = useCallback(
    async (idToken: string) => {
      setSubmitting(true);
      setError('');
      try {
        await signInWithGoogleIdToken(idToken);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Sign-in failed');
        setSubmitting(false);
      }
    },
    [signInWithGoogleIdToken],
  );

  const handleGoogleError = useCallback((message: string) => {
    setError(message);
    setSubmitting(false);
  }, []);

  if (isLoading || user) {
    return (
      <div className="flex min-h-screen items-center justify-center" style={{ backgroundColor: BG }}>
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#22D3EE] border-t-transparent" />
      </div>
    );
  }

  return (
    <div
      className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-5 py-16 font-poppins"
      style={{ backgroundColor: BG, color: TEXT }}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background: `
            radial-gradient(ellipse 70% 50% at 15% 10%, ${LAVENDER} 0%, transparent 55%),
            radial-gradient(ellipse 55% 45% at 90% 20%, ${PEACH} 0%, transparent 50%),
            radial-gradient(ellipse 60% 50% at 50% 100%, ${MINT} 0%, transparent 55%)
          `,
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.35]"
        style={{
          backgroundImage:
            'radial-gradient(rgba(255,255,255,0.06) 1px, transparent 1px)',
          backgroundSize: '24px 24px',
          maskImage: 'radial-gradient(ellipse 70% 60% at 50% 40%, black 20%, transparent 75%)',
        }}
      />

      <div className="relative z-10 w-full max-w-[400px]">
        <div className="mb-10 flex flex-col items-center text-center">
          <div
            className="mb-5 flex h-14 w-14 items-center justify-center overflow-hidden rounded-2xl"
            style={{ background: '#FFFFFF', boxShadow: '0 0 0 1px rgba(255,255,255,0.08)' }}
          >
            <Image
              src="/logog.png"
              alt="Notemarq"
              width={56}
              height={56}
              className="h-full w-full object-cover"
              priority
            />
          </div>
          <p
            className="text-[2rem] font-bold leading-none tracking-tight sm:text-[2.25rem]"
            style={{ letterSpacing: '-0.04em' }}
          >
            notemarq
          </p>
          <p className="mt-3 max-w-sm text-[14px] leading-relaxed" style={{ color: SOFT }}>
            {forkId
              ? 'Sign in to copy this shared folder into your personal workspace.'
              : 'Sign in with the same Google account as the mobile app to sync bookmarks and notes.'}
          </p>
        </div>

        <div
          className="rounded-[28px] border p-6 sm:p-7"
          style={{
            backgroundColor: CARD,
            borderColor: BORDER,
            boxShadow: '0 24px 80px rgba(0,0,0,0.45)',
          }}
        >
          {!isConfigured ? (
            <p
              className="rounded-2xl px-4 py-3 text-sm"
              style={{ background: 'rgba(232,135,106,0.12)', color: '#E8876A' }}
            >
              Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY to website/.env.local
            </p>
          ) : !googleConfigured ? (
            <p
              className="rounded-2xl px-4 py-3 text-sm"
              style={{ background: 'rgba(232,135,106,0.12)', color: '#E8876A' }}
            >
              Add NEXT_PUBLIC_GOOGLE_WEB_CLIENT_ID to website/.env.local
            </p>
          ) : (
            <GoogleSignInButton
              disabled={submitting}
              onCredential={(idToken) => void handleCredential(idToken)}
              onError={handleGoogleError}
              className="w-full"
            >
              <div
                className="flex w-full items-center justify-center gap-3 rounded-full px-4 py-3.5 text-sm font-bold text-white transition hover:opacity-95 active:scale-[0.99]"
                style={{ backgroundColor: CORAL }}
              >
                {submitting ? 'Signing in…' : 'Continue with Google'}
              </div>
            </GoogleSignInButton>
          )}

          {error ? (
            <p className="mt-4 text-center text-sm" style={{ color: '#FF6961' }}>
              {error}
            </p>
          ) : null}

          <p className="mt-5 text-center text-[12px] leading-relaxed" style={{ color: SOFTER }}>
            Bookmarks and notes stay free. Paid plans unlock higher AI limits.
          </p>
        </div>

        <p className="mt-8 text-center text-sm" style={{ color: SOFTER }}>
          <Link href="/" className="transition hover:opacity-90" style={{ color: CYAN }}>
            Back to website
          </Link>
        </p>
      </div>
    </div>
  );
}
