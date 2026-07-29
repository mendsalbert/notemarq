import type { Metadata } from 'next';
import Link from 'next/link';
import { PricingPlans } from '@/components/pricing-plans';

export const metadata: Metadata = {
  title: 'Pricing — Notemarq',
  description: 'Choose Notemarq Plus, Pro, or Super Pro. Sync your saves and unlock smarter AI features.',
};

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
          <PricingPlans />
          <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 13, marginTop: 24, lineHeight: 1.5 }}>
            Checkout is powered by Stripe. iOS subscriptions are handled through the App Store.
          </p>
        </section>
      </div>
    </main>
  );
}
