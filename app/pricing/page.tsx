import type { Metadata } from 'next';
import Link from 'next/link';
import { PricingCheckoutButton } from '@/components/pricing-checkout-button';
import type { PaidPlanId } from '@/lib/stripe/checkout';

export const metadata: Metadata = {
  title: 'Pricing — Notemarq',
  description: 'Choose Notemarq Plus, Pro, or Super Pro. Sync your saves and unlock smarter AI features.',
};

const TIERS: {
  plan: PaidPlanId;
  name: string;
  price: string;
  period: string;
  tagline: string;
  features: string[];
  highlight: boolean;
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
    highlight: false,
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
    highlight: true,
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
    highlight: false,
  },
];

type PageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

export default async function PricingPage({ searchParams }: PageProps) {
  const params = (await searchParams) ?? {};
  const checkout = typeof params.checkout === 'string' ? params.checkout : '';
  const success = checkout === 'success';
  const cancelled = checkout === 'cancelled';

  return (
    <main
      style={{
        minHeight: '100vh',
        background: '#000',
        color: '#fff',
        fontFamily: 'var(--font-jakarta), system-ui, sans-serif',
      }}
    >
      <div style={{ maxWidth: 960, margin: '0 auto', padding: '48px 20px 80px' }}>
        <Link
          href="/"
          style={{ color: 'rgba(255,255,255,0.55)', textDecoration: 'none', fontSize: 14 }}
        >
          ← Notemarq
        </Link>

        {success ? (
          <section
            style={{
              marginTop: 32,
              padding: '28px 24px',
              borderRadius: 20,
              background: '#122018',
              border: '1px solid #1F3A2A',
            }}
          >
            <p style={{ color: '#30D158', fontSize: 13, fontWeight: 600, margin: 0 }}>Payment received</p>
            <h1 style={{ fontSize: 28, margin: '8px 0 10px', letterSpacing: '-0.03em' }}>
              You&apos;re all set
            </h1>
            <p style={{ color: 'rgba(255,255,255,0.65)', margin: 0, lineHeight: 1.55, maxWidth: 520 }}>
              Your plan updates automatically in Notemarq. Open the app or extension and refresh if it still shows Free
              for a moment.
            </p>
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginTop: 20 }}>
              <a
                href="https://www.notemarq.app"
                style={{
                  background: '#22D3EE',
                  color: '#000',
                  padding: '12px 18px',
                  borderRadius: 999,
                  fontWeight: 700,
                  textDecoration: 'none',
                  fontSize: 14,
                }}
              >
                Back to home
              </a>
              <a
                href="#plans"
                style={{
                  background: '#141414',
                  color: '#fff',
                  padding: '12px 18px',
                  borderRadius: 999,
                  fontWeight: 600,
                  textDecoration: 'none',
                  fontSize: 14,
                  border: '1px solid #2A2A2A',
                }}
              >
                View plans
              </a>
            </div>
          </section>
        ) : cancelled ? (
          <section
            style={{
              marginTop: 32,
              padding: '28px 24px',
              borderRadius: 20,
              background: '#1A1612',
              border: '1px solid #3A3020',
            }}
          >
            <p style={{ color: '#FFB020', fontSize: 13, fontWeight: 600, margin: 0 }}>Checkout cancelled</p>
            <h1 style={{ fontSize: 28, margin: '8px 0 10px', letterSpacing: '-0.03em' }}>No worries</h1>
            <p style={{ color: 'rgba(255,255,255,0.65)', margin: 0, lineHeight: 1.55, maxWidth: 520 }}>
              You can upgrade anytime. Pick a plan below when you&apos;re ready.
            </p>
          </section>
        ) : (
          <header style={{ marginTop: 36 }}>
            <p style={{ color: '#22D3EE', fontSize: 13, fontWeight: 600, margin: 0 }}>Pricing</p>
            <h1 style={{ fontSize: 36, margin: '8px 0 12px', letterSpacing: '-0.04em' }}>Choose your plan</h1>
            <p style={{ color: 'rgba(255,255,255,0.6)', maxWidth: 520, lineHeight: 1.55, margin: 0 }}>
              Bookmarks and notes stay free. Paid plans unlock higher import limits and more AI Ask, Suggest, and Auto
              organize.
            </p>
          </header>
        )}

        <section id="plans" style={{ marginTop: 40 }}>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
              gap: 16,
            }}
          >
            {TIERS.map((tier) => (
              <article
                key={tier.plan}
                style={{
                  background: tier.highlight ? '#1A1828' : '#141414',
                  border: tier.highlight ? '1px solid #3A3560' : '1px solid #1F1F1F',
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
                    {tier.highlight ? (
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
                  <p style={{ color: 'rgba(255,255,255,0.55)', fontSize: 13, margin: '6px 0 0' }}>{tier.tagline}</p>
                </div>
                <p style={{ margin: 0 }}>
                  <span style={{ fontSize: 32, fontWeight: 800, letterSpacing: '-0.03em' }}>{tier.price}</span>
                  <span style={{ color: 'rgba(255,255,255,0.45)', fontSize: 14 }}> {tier.period}</span>
                </p>
                <ul style={{ margin: 0, paddingLeft: 18, color: 'rgba(255,255,255,0.72)', fontSize: 14, lineHeight: 1.55 }}>
                  {tier.features.map((feature) => (
                    <li key={feature}>{feature}</li>
                  ))}
                </ul>
                <PricingCheckoutButton
                  plan={tier.plan}
                  label={`Get ${tier.name}`}
                  highlight={tier.highlight}
                />
              </article>
            ))}
          </div>
          <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 13, marginTop: 24, lineHeight: 1.5 }}>
            Checkout is powered by Stripe. iOS subscriptions are handled through the App Store.
          </p>
        </section>
      </div>
    </main>
  );
}
