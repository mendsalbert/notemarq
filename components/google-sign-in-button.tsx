'use client';

import React, { useEffect, useRef, useState } from 'react';

import { getGoogleWebClientId } from '@/lib/google-client-id';

const GSI_SCRIPT_ID = 'google-gsi-client';

type GoogleCredentialResponse = {
  credential?: string;
};

type GoogleIdApi = {
  initialize: (config: {
    client_id: string;
    callback: (response: GoogleCredentialResponse) => void;
    auto_select?: boolean;
    cancel_on_tap_outside?: boolean;
  }) => void;
  renderButton: (
    parent: HTMLElement,
    options: {
      type?: string;
      theme?: string;
      size?: string;
      text?: string;
      width?: number;
    },
  ) => void;
};

declare global {
  interface Window {
    google?: {
      accounts: {
        id: GoogleIdApi;
      };
    };
  }
}

export interface GoogleSignInButtonProps {
  disabled?: boolean;
  onCredential: (idToken: string) => void;
  onError: (message: string) => void;
  className?: string;
  style?: React.CSSProperties;
  children: React.ReactNode;
}

function loadGoogleScript(): Promise<void> {
  if (typeof window === 'undefined') {
    return Promise.reject(new Error('Google sign-in is only available in the browser.'));
  }

  if (window.google?.accounts?.id) {
    return Promise.resolve();
  }

  const existing = document.getElementById(GSI_SCRIPT_ID) as HTMLScriptElement | null;
  if (existing) {
    return new Promise((resolve, reject) => {
      existing.addEventListener('load', () => resolve(), { once: true });
      existing.addEventListener('error', () => reject(new Error('Failed to load Google sign-in.')), {
        once: true,
      });
    });
  }

  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.id = GSI_SCRIPT_ID;
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('Failed to load Google sign-in.'));
    document.head.appendChild(script);
  });
}

export function GoogleSignInButton({
  disabled = false,
  onCredential,
  onError,
  className = '',
  style,
  children,
}: GoogleSignInButtonProps) {
  const hostRef = useRef<HTMLDivElement>(null);
  const gsiRef = useRef<HTMLDivElement>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const clientId = getGoogleWebClientId();
    if (!clientId) {
      onError('Google sign-in is not configured.');
      return;
    }

    let cancelled = false;

    void loadGoogleScript()
      .then(() => {
        if (cancelled || !gsiRef.current || !window.google?.accounts?.id) return;

        window.google.accounts.id.initialize({
          client_id: clientId,
          callback: (response) => {
            if (response.credential) {
              onCredential(response.credential);
              return;
            }
            onError('No credential received from Google.');
          },
          auto_select: false,
          cancel_on_tap_outside: true,
        });

        const width = hostRef.current?.offsetWidth ?? 320;
        gsiRef.current.innerHTML = '';
        window.google.accounts.id.renderButton(gsiRef.current, {
          type: 'standard',
          theme: 'outline',
          size: 'large',
          text: 'continue_with',
          width: Math.max(200, Math.round(width)),
        });

        setReady(true);
      })
      .catch((error: unknown) => {
        if (!cancelled) {
          onError(error instanceof Error ? error.message : 'Failed to load Google sign-in.');
        }
      });

    return () => {
      cancelled = true;
    };
  }, [onCredential, onError]);

  return (
    <div
      ref={hostRef}
      className={`relative ${className}`}
      style={style}
      aria-disabled={disabled || undefined}
    >
      <div className={disabled ? 'pointer-events-none opacity-60' : 'pointer-events-none'}>{children}</div>
      <div
        ref={gsiRef}
        className={`absolute inset-0 z-10 overflow-hidden ${disabled || !ready ? 'pointer-events-none opacity-0' : 'opacity-[0.01]'}`}
        aria-hidden={!ready}
      />
    </div>
  );
}
