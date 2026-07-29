'use client';

import { useEffect, useState } from 'react';
import { ManageBillingButton } from '@/components/manage-billing-button';
import { PricingCheckoutButton } from '@/components/pricing-checkout-button';
import { isPaidPlan, normalizePlan, type UserPlan } from '@/lib/plan';
import { isSupabaseConfigured, supabase } from '@/lib/supabase/client';
import type { PaidPlanId } from '@/lib/stripe/checkout';

const TIERS: {
  plan: PaidPlanId;
  name: string;
  price: string;
  period: string;
  tagline: string;
  features: string[];
  popular: boolean;
}[] = [
  {
    plan: 'plus',
    name: 'Plus',
    price: '$4.99',
    period: '/ month',
    tagline: 'More power for everyday saving',
    features: [
      'Higher X / YouTube import limits',
      '50 Ask / Suggest / Auto organize per month',
      'Sync across all devices',
    ],
    popular: false,
  },
  {
    plan: 'pro',
    name: 'Pro',
    price: '$9.99',
    period: '/ month',
    tagline: 'For power users who save constantly',
    features: [
      '500 bookmarks per sync',
      '80 AI uses per month',
      'Weekly digest & priority support',
    ],
    popular: true,
  },
  {
    plan: 'super_pro',
    name: 'Super Pro',
    price: '$17.99',
    period: '/ month',
    tagline: 'Unlimited smart features',
    features: [
      'Unlimited Ask, Suggest & Auto organize',
      'Unlimited imports',
      'Shared folders & early access',
    ],
    popular: false,
  },
];

async function resolveStrictPlan(userId: string): Promise<{
  plan: UserPlan;
  hasWebSubscription: boolean;
}> {
  const { data: profile } = await supabase
    .from('profiles')
    .select('plan')
    .eq('id', userId)
    .maybeSingle();

  const profilePlan = normalizePlan(profile?.plan as string | undefined);
  if (profilePlan === 'free') {
    return { plan: 'free', hasWebSubscription: false };
  }

  const { data: subs } = await supabase
    .from('subscriptions')
    .select('plan, status, expires_at, platform')
    .eq('user_id', userId)
    .eq('plan', profilePlan)
    .in('status', ['active', 'grace_period', 'cancelled']);

  const now = Date.now();
  let valid = false;
  let hasWebSubscription = false;

  for (const sub of subs ?? []) {
    const stillValid =
      sub.status === 'active' ||
      sub.status === 'grace_period' ||
      (sub.status === 'cancelled' &&
        (!sub.expires_at || new Date(sub.expires_at as string).getTime() > now));
    if (!stillValid) continue;
    valid = true;
    if (sub.platform === 'web') hasWebSubscription = true;
  }

  return {
    plan: valid ? profilePlan : 'free',
    hasWebSubscription: valid && hasWebSubscription,
  };
}

export function PricingPlans() {
  const [currentPlan, setCurrentPlan] = useState<UserPlan>('free');
  const [hasWebSubscription, setHasWebSubscription] = useState(false);

  useEffect(() => {
    if (!isSupabaseConfigured) return;

    let cancelled = false;

    void (async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session?.user?.id || cancelled) return;

      const result = await resolveStrictPlan(session.user.id);
      if (!cancelled) {
        setCurrentPlan(result.plan);
        setHasWebSubscription(result.hasWebSubscription);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {isPaidPlan(currentPlan) && hasWebSubscription ? (
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 12,
            padding: '16px 18px',
            borderRadius: 16,
            background: '#0F1C1E',
            border: '1px solid #1F3A3A',
          }}
        >
          <div>
            <p style={{ margin: 0, fontSize: 14, fontWeight: 600 }}>Manage your subscription</p>
            <p style={{ margin: '4px 0 0', fontSize: 13, color: 'rgba(255,255,255,0.55)' }}>
              Cancel anytime in Stripe. Paid access continues until the billing period ends.
            </p>
          </div>
          <ManageBillingButton
            label="Cancel or manage billing"
            style={{
              background: '#141414',
              color: '#fff',
              padding: '10px 16px',
              borderRadius: 999,
              fontWeight: 700,
              border: '1px solid #2A2A2A',
              fontSize: 13,
              cursor: 'pointer',
              fontFamily: 'inherit',
            }}
          />
        </div>
      ) : null}

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: 16,
        }}
      >
        {TIERS.map((tier) => {
          const isCurrent = currentPlan === tier.plan;
          const showPopular = !isCurrent && tier.popular && currentPlan === 'free';
          const emphasized = isCurrent || showPopular;

          return (
            <article
              key={tier.plan}
              style={{
                background: isCurrent ? '#0F1C1E' : showPopular ? '#1A1828' : '#141414',
                border: isCurrent
                  ? '1px solid #22D3EE'
                  : showPopular
                    ? '1px solid #3A3560'
                    : '1px solid #1F1F1F',
                borderRadius: 20,
                padding: 22,
                display: 'flex',
                flexDirection: 'column',
                gap: 14,
              }}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <h2 style={{ fontSize: 20, margin: 0 }}>{tier.name}</h2>
                  {isCurrent ? (
                    <span
                      style={{
                        fontSize: 11,
                        fontWeight: 700,
                        color: '#22D3EE',
                        background: 'rgba(34,211,238,0.12)',
                        padding: '3px 8px',
                        borderRadius: 999,
                      }}
                    >
                      Current
                    </span>
                  ) : showPopular ? (
                    <span
                      style={{
                        fontSize: 11,
                        fontWeight: 700,
                        color: '#A99AF0',
                        background: 'rgba(169,154,240,0.15)',
                        padding: '3px 8px',
                        borderRadius: 999,
                      }}
                    >
                      Popular
                    </span>
                  ) : null}
                </div>
                <p style={{ color: 'rgba(255,255,255,0.55)', fontSize: 13, margin: '6px 0 0' }}>
                  {tier.tagline}
                </p>
              </div>
              <p style={{ margin: 0 }}>
                <span style={{ fontSize: 32, fontWeight: 800, letterSpacing: '-0.03em' }}>
                  {tier.price}
                </span>
                <span style={{ color: 'rgba(255,255,255,0.45)', fontSize: 14 }}> {tier.period}</span>
              </p>
              <ul
                style={{
                  margin: 0,
                  paddingLeft: 18,
                  color: 'rgba(255,255,255,0.72)',
                  fontSize: 14,
                  lineHeight: 1.55,
                }}
              >
                {tier.features.map((feature) => (
                  <li key={feature}>{feature}</li>
                ))}
              </ul>
              <PricingCheckoutButton
                plan={tier.plan}
                label={isCurrent ? 'Current plan' : `Get ${tier.name}`}
                highlight={emphasized}
                disabled={isCurrent}
              />
            </article>
          );
        })}
      </div>
    </div>
  );
}
