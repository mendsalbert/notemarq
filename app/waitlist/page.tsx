'use client';

import Image from 'next/image';
import Link from 'next/link';
import { WaitlistForm } from '@/components/landing/waitlist-form';
import { Reveal } from '@/components/landing/reveal';
import { APP_ENTRY_HREF, APP_ENTRY_LABEL } from '@/lib/marketing';

const BG = '#000000';
const BORDER = '#1F1F1F';
const TEXT = '#FFFFFF';
const SOFT = 'rgba(255,255,255,0.62)';
const SOFTER = 'rgba(255,255,255,0.35)';
const NAV_BG = 'rgba(0,0,0,0.82)';
const LAVENDER_DEEP = '#252038';
const BLUSH_DEEP = '#2A1C22';
const CORAL = '#C96A48';
const TAG_PURPLE = '#A99AF0';

function NotemarqLogo() {
  return (
    <Link
      href="/"
      className="inline-flex items-center gap-2"
      style={{ color: TEXT, letterSpacing: '-0.02em' }}
    >
      <span
        className="flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-lg"
        style={{ background: '#FFFFFF' }}
      >
        <Image src="/logog.png" alt="Notemarq" width={80} height={80} className="h-full w-full object-cover" />
      </span>
      <span className="text-lg font-bold tracking-tight">notemarq</span>
    </Link>
  );
}

export default function WaitlistPage() {
  return (
    <div className="font-jakarta min-h-screen" style={{ background: BG, color: TEXT }}>
      <header className="sticky top-0 z-50 px-4 pt-4 sm:px-6 sm:pt-5">
        <nav
          className="mx-auto flex max-w-6xl items-center justify-between gap-4 rounded-full px-4 py-3 sm:px-6 sm:py-4"
          style={{
            background: NAV_BG,
            backdropFilter: 'blur(24px)',
            WebkitBackdropFilter: 'blur(24px)',
            border: `1px solid ${BORDER}`,
          }}
        >
          <NotemarqLogo />
          <div className="flex items-center gap-2">
            <Link
              href="/"
              className="hidden rounded-full px-4 py-2 text-sm font-medium transition hover:bg-white/10 sm:inline-flex"
              style={{ color: SOFT }}
            >
              Home
            </Link>
            <span
              className="inline-flex items-center rounded-full px-5 py-2.5 text-sm font-semibold"
              style={{ background: 'rgba(255,255,255,0.08)', color: SOFT, border: `1px solid ${BORDER}` }}
            >
              {APP_ENTRY_LABEL}
            </span>
          </div>
        </nav>
      </header>

      <main className="px-4 py-12 sm:px-6 sm:py-20">
        <div className="mx-auto max-w-3xl">
          <Reveal direction="up">
            <div
              className="overflow-hidden rounded-[28px] sm:rounded-[36px]"
              style={{
                background: `linear-gradient(180deg, ${BLUSH_DEEP} 0%, ${LAVENDER_DEEP} 38%, ${BG} 100%)`,
                border: `1px solid ${BORDER}`,
                boxShadow: '0 32px 80px rgba(0,0,0,0.55)',
              }}
            >
              <div className="px-6 py-14 text-center sm:px-12 sm:py-20 lg:px-16">
                <span
                  className="inline-block rounded-full px-4 py-1.5 text-[11px] font-bold uppercase tracking-[0.2em]"
                  style={{
                    background: 'rgba(255,255,255,0.06)',
                    color: TAG_PURPLE,
                    border: '1px solid rgba(255,255,255,0.08)',
                  }}
                >
                  Early access
                </span>

                <h1
                  className="mx-auto mt-6 max-w-2xl text-3xl font-bold leading-[1.1] tracking-tight sm:text-[2.75rem] lg:text-5xl"
                  style={{ letterSpacing: '-0.03em' }}
                >
                  Your notes,{' '}
                  <span className="relative inline-block whitespace-nowrap align-baseline">
                    <span
                      aria-hidden
                      className="pointer-events-none absolute inset-x-0 bottom-[0.12em] top-[0.12em] rounded-full"
                      style={{ background: CORAL }}
                    />
                    <span className="relative px-[0.32em]" style={{ color: '#FFFFFF' }}>
                      finally connected.
                    </span>
                  </span>
                </h1>

                <p className="mx-auto mt-5 max-w-lg text-[15px] leading-relaxed sm:text-base" style={{ color: SOFT }}>
                  Notemarq is opening to a small group first. Leave your email and you&apos;ll get an invite as soon as
                  your spot is ready — no spam, just one note when it&apos;s time.
                </p>

                <div className="mx-auto mt-10 max-w-md text-left">
                  <WaitlistForm source="waitlist-page" />
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </main>

      <footer className="border-t px-4 py-12 sm:px-6" style={{ borderColor: BORDER }}>
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-6 sm:flex-row">
          <NotemarqLogo />
          <nav className="flex flex-wrap items-center justify-center gap-1">
            {[
              { href: '/', label: 'Home' },
              { href: APP_ENTRY_HREF, label: APP_ENTRY_LABEL },
              { href: '/policy', label: 'Privacy' },
              { href: '/terms', label: 'Terms' },
            ].map((link) => (
              <Link
                key={link.label}
                href={link.href}
                className="rounded-full px-4 py-2 text-sm font-medium transition hover:bg-white/[0.06]"
                style={{ color: SOFT }}
              >
                {link.label}
              </Link>
            ))}
          </nav>
          <p className="text-sm" style={{ color: SOFTER }}>
            © {new Date().getFullYear()} Notemarq
          </p>
        </div>
      </footer>
    </div>
  );
}
