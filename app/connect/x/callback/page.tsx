'use client';

import { Suspense, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';

const APP_CALLBACK = 'notemarq://connect/x/callback';

function XOAuthBridgeContent() {
  const searchParams = useSearchParams();

  useEffect(() => {
    const outgoing = new URL(APP_CALLBACK);
    for (const key of ['code', 'state', 'error', 'error_description']) {
      const value = searchParams.get(key);
      if (value) outgoing.searchParams.set(key, value);
    }
    window.location.replace(outgoing.toString());
  }, [searchParams]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#0a0a0a] text-white">
      <p className="text-sm text-white/70">Returning to Notemarq…</p>
    </div>
  );
}

/** HTTPS OAuth bridge for mobile X connect (also usable if EXPO_PUBLIC_WEB_URL is set). */
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
