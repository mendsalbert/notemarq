'use client';

import { useState } from 'react';

import { createStripePortal } from '@/lib/stripe/portal';

interface ManageBillingButtonProps {
  label?: string;
  className?: string;
  style?: React.CSSProperties;
  returnUrl?: string;
}

export function ManageBillingButton({
  label = 'Cancel or manage billing',
  className,
  style,
  returnUrl,
}: ManageBillingButtonProps) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onClick() {
    setError(null);
    setBusy(true);
    try {
      const origin = typeof window !== 'undefined' ? window.location.origin : '';
      const result = await createStripePortal({
        returnUrl: returnUrl ?? `${origin}${window.location.pathname}`,
      });
      window.location.href = result.url;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not open billing portal');
      setBusy(false);
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <button
        type="button"
        onClick={() => void onClick()}
        disabled={busy}
        className={className}
        style={style}
      >
        {busy ? 'Opening…' : label}
      </button>
      {error ? (
        <p style={{ color: '#FF6B6B', fontSize: 12, margin: 0, lineHeight: 1.4 }}>{error}</p>
      ) : null}
    </div>
  );
}
