'use client';

import React, { useState } from 'react';
import { IconCheck, IconLoader2 } from '@tabler/icons-react';

import { isSupabaseConfigured, supabase } from '@/lib/supabase/client';

const BORDER = '#1F1F1F';
const SOFT = 'rgba(255,255,255,0.62)';
const CORAL = '#C96A48';
const SUCCESS = '#30D158';
const TEXT = '#FFFFFF';

type FormState = 'idle' | 'submitting' | 'success' | 'error';

type WaitlistFormProps = {
  source?: string;
  className?: string;
};

export function WaitlistForm({ source = 'website', className = '' }: WaitlistFormProps) {
  const [email, setEmail] = useState('');
  const [state, setState] = useState<FormState>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    const trimmedEmail = email.trim().toLowerCase();
    if (!trimmedEmail) {
      setState('error');
      setErrorMessage('Enter your email to join.');
      return;
    }

    if (!isSupabaseConfigured) {
      setState('error');
      setErrorMessage('Waitlist is not configured yet. Please try again later.');
      return;
    }

    setState('submitting');

    const { error } = await supabase.from('early_access_waitlist').insert({
      email: trimmedEmail,
      source,
    });

    if (error) {
      setState('error');
      if (error.code === '23505') {
        setErrorMessage('You’re already on the list — we’ll be in touch.');
      } else {
        setErrorMessage('Something went wrong. Please try again.');
      }
      return;
    }

    setState('success');
    setEmail('');
  };

  if (state === 'success') {
    return (
      <div
        className={`rounded-[24px] border px-6 py-8 text-center sm:px-8 ${className}`}
        style={{ borderColor: BORDER, background: 'rgba(255,255,255,0.03)' }}
      >
        <div
          className="mx-auto flex h-12 w-12 items-center justify-center rounded-full"
          style={{ background: 'rgba(48,209,88,0.15)', color: SUCCESS }}
        >
          <IconCheck size={24} stroke={2.5} />
        </div>
        <h3 className="mt-4 text-xl font-bold tracking-tight">You&apos;re on the list</h3>
        <p className="mx-auto mt-2 max-w-sm text-[15px] leading-relaxed" style={{ color: SOFT }}>
          We&apos;ll email you when your spot is ready — no spam, just one note when it&apos;s time.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className={className}>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-stretch">
        <label className="min-w-0 flex-1">
          <span className="sr-only">Email</span>
          <input
            type="email"
            name="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@email.com"
            required
            autoComplete="email"
            disabled={state === 'submitting'}
            className="h-full w-full rounded-full border bg-transparent px-5 py-3.5 text-[15px] outline-none transition placeholder:opacity-40 focus:ring-2 focus:ring-white/10"
            style={{ borderColor: BORDER, color: TEXT }}
          />
        </label>

        <button
          type="submit"
          disabled={state === 'submitting'}
          className="inline-flex shrink-0 items-center justify-center gap-2 rounded-full px-6 py-3.5 text-sm font-semibold transition hover:opacity-90 disabled:opacity-60"
          style={{ background: CORAL, color: '#FFFFFF' }}
        >
          {state === 'submitting' ? (
            <>
              <IconLoader2 size={16} className="animate-spin" />
              Joining…
            </>
          ) : (
            'Join the list'
          )}
        </button>
      </div>

      {errorMessage ? (
        <p className="mt-3 text-sm font-medium" style={{ color: '#FF6B6B' }} role="alert">
          {errorMessage}
        </p>
      ) : null}
    </form>
  );
}
