'use client';

import type { Session, User } from '@supabase/supabase-js';
import { useRouter } from 'next/navigation';
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';

import { signOutFromSupabase } from '@/lib/supabase/auth';
import { isSupabaseConfigured, supabase } from '@/lib/supabase/client';
import { describeSupabaseError } from '@/lib/supabase/errors';
import { useAppStore } from '@/store/app-store';

interface AuthContextValue {
  session: Session | null;
  user: User | null;
  isLoading: boolean;
  isConfigured: boolean;
  signInWithGoogleIdToken: (idToken: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(isSupabaseConfigured);
  const hydrate = useAppStore((s) => s.hydrate);
  const reset = useAppStore((s) => s.reset);
  const hydrateTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const user = session?.user ?? null;

  useEffect(() => {
    if (!isSupabaseConfigured) {
      setIsLoading(false);
      return;
    }

    let mounted = true;

    void supabase.auth.getSession().then(({ data, error }) => {
      if (!mounted) return;
      if (data.session) {
        setSession(data.session);
      } else if (error) {
        console.warn('[auth] getSession failed:', describeSupabaseError(error));
      }
      setIsLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (hydrateTimer.current) {
      clearTimeout(hydrateTimer.current);
      hydrateTimer.current = null;
    }

    if (isLoading) return;

    if (user?.id && isSupabaseConfigured) {
      hydrateTimer.current = setTimeout(() => {
        void (async () => {
          const { data, error } = await supabase.auth.getSession();
          if (error) {
            console.warn('[auth] hydrate skipped — session error:', describeSupabaseError(error));
            return;
          }
          if (!data.session?.access_token) {
            console.warn('[auth] hydrate skipped — missing access token');
            return;
          }
          await hydrate(user.id);
        })();
      }, 300);
      return () => {
        if (hydrateTimer.current) clearTimeout(hydrateTimer.current);
      };
    }

    reset();
  }, [user?.id, isLoading, hydrate, reset]);

  const signInWithGoogleIdToken = useCallback(async (idToken: string) => {
    const { error } = await supabase.auth.signInWithIdToken({
      provider: 'google',
      token: idToken,
    });
    if (error) throw error;
  }, []);

  const signOut = useCallback(async () => {
    if (hydrateTimer.current) {
      clearTimeout(hydrateTimer.current);
      hydrateTimer.current = null;
    }

    await signOutFromSupabase();
    setSession(null);
    reset();
    router.replace('/app/login');
  }, [reset, router]);

  const value = useMemo(
    () => ({
      session,
      user,
      isLoading,
      isConfigured: isSupabaseConfigured,
      signInWithGoogleIdToken,
      signOut,
    }),
    [session, user, isLoading, signInWithGoogleIdToken, signOut],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
