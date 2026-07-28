'use client';

import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

import { completeXConnect, isWebXOAuthState } from '@/lib/x-connection';

const APP_CALLBACK = 'notemarq://connect/x/callback';

function XOAuthBridgeContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [message, setMessage] = useState('Returning to Notemarq…');

  useEffect(() => {
    const state = searchParams.get('state');
    const code = searchParams.get('code');
    const error = searchParams.get('error');
    const errorDescription = searchParams.get('error_description');

    if (isWebXOAuthState(state)) {
      void (async () => {
        if (error) {
          setMessage(errorDescription || error || 'X connection failed');
          router.replace(`/app/settings?import=x&error=${encodeURIComponent(errorDescription || error)}`);
          return;
        }
        if (!code) {
          setMessage('Missing authorization code');
          router.replace('/app/settings?import=x&error=missing_code');
          return;
        }
        try {
          setMessage('Connecting X…');
          await completeXConnect(code);
          router.replace('/app/settings?import=x&connected=1');
        } catch (err) {
          const msg = err instanceof Error ? err.message : 'X connection failed';
          setMessage(msg);
          router.replace(`/app/settings?import=x&error=${encodeURIComponent(msg)}`);
        }
      })();
      return;
    }

    const outgoing = new URL(APP_CALLBACK);
    for (const key of ['code', 'state', 'error', 'error_description']) {
      const value = searchParams.get(key);
      if (value) outgoing.searchParams.set(key, value);
    }
    window.location.replace(outgoing.toString());
  }, [router, searchParams]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#0a0a0a] text-white">
      <p className="text-sm text-white/70">{message}</p>
    </div>
  );
}

/** HTTPS OAuth bridge for mobile + web X connect. */
export default function XOAuthBridgePage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-[#0a0a0a] text-white">
          <p className="text-sm text-white/70">Returning to Notemarq…</p>
        </div>
      }
    >
      <XOAuthBridgeContent />
    </Suspense>
  );
}
