'use client';

import { useState } from 'react';
import { isSupabaseConfigured, supabase } from '@/lib/supabase/client';
import { createStripeCheckout, type PaidPlanId } from '@/lib/stripe/checkout';

interface PricingCheckoutButtonProps {
  plan: PaidPlanId;
  label: string;
  highlight?: boolean;
}

export function PricingCheckoutButton({ plan, label, highlight }: PricingCheckoutButtonProps) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onClick() {
    setError(null);

    if (!isSupabaseConfigured) {
      setError('Billing is not configured yet.');
      return;
    }

    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session?.user) {
      window.location.href = `/app/login?next=${encodeURIComponent('/pricing')}`;
      return;
    }

    setBusy(true);
    try {
      const origin = window.location.origin;
      const result = await createStripeCheckout({
        plan,
        billing: 'monthly',
        redirectUrl: `${origin}/pricing?checkout=success`,
        cancelUrl: `${origin}/pricing?checkout=cancelled`,
      });
      window.location.href = result.url;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Checkout failed');
      setBusy(false);
    }
  }

  return (
    <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: 8 }}>
      <button
        type="button"
        onClick={() => void onClick()}
        disabled={busy}
        style={{
          textAlign: 'center',
          background: highlight ? '#22D3EE' : '#fff',
          color: '#000',
          padding: '12px 14px',
          borderRadius: 999,
          fontWeight: 700,
          border: 'none',
          fontSize: 14,
          cursor: busy ? 'wait' : 'pointer',
          opacity: busy ? 0.7 : 1,
          fontFamily: 'inherit',
        }}
      >
        {busy ? 'Opening checkout…' : label}
      </button>
      {error ? (
        <p style={{ color: '#FF6B6B', fontSize: 12, margin: 0, lineHeight: 1.4 }}>{error}</p>
      ) : null}
    </div>
  );
}
