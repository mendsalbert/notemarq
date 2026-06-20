'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  IconArrowRight,
  IconBolt,
  IconBookmark,
  IconBrain,
  IconBrandChrome,
  IconBrandTiktok,
  IconBrandX,
  IconBrandYoutube,
  IconCheck,
  IconDeviceLaptop,
  IconDeviceMobile,
  IconDeviceTablet,
  IconMenu,
  IconSearch,
  IconSparkles,
  IconWorld,
  IconX,
} from '@tabler/icons-react';

import { CountUp } from '@/components/landing/count-up';
import { Reveal } from '@/components/landing/reveal';

// App-matched tokens (dark home + ExperimentalPalette)
const BG = '#000000';
const PAGE = '#000000';
const CARD_BG = '#141414';
const CREAM = '#141414';
const NAV_BG = 'rgba(0,0,0,0.82)';
const BORDER = '#1F1F1F';
const TEXT = '#FFFFFF';
const INK = '#1C1C2E';
const SOFT = 'rgba(255,255,255,0.62)';
const SOFTER = 'rgba(255,255,255,0.35)';
const WEEK_RING = '#2A2A2A';

const BLUSH = '#221820';
const BLUSH_DEEP = '#2A1C22';
const LAVENDER = '#1A1828';
const LAVENDER_DEEP = '#252038';
const MINT = '#122018';
const PEACH = '#221A14';
const BUTTER = '#221E14';
const CORAL = '#C96A48';
const TAG_PURPLE = '#A99AF0';
const TAG_PINK = '#E8879A';
const CYAN = '#22D3EE';
const SUCCESS = '#30D158';
const WEEK_ACTIVE = '#E8B84A';

const APP_STORE_URL = 'https://apps.apple.com';
const CHROME_EXTENSION_URL = 'https://chrome.google.com/webstore';

const STORE_ICON_SIZE = 22;

const APP_STORE_ICON = (
  <svg width={STORE_ICON_SIZE} height={STORE_ICON_SIZE} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
    <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" />
  </svg>
);

const CHROME_ICON = <IconBrandChrome size={STORE_ICON_SIZE} aria-hidden />;

const NAV_LINKS = [
  { href: '#top', label: 'Home', id: 'top' },
  { href: '#how', label: 'How it works', id: 'how' },
  { href: '#features', label: 'Features', id: 'features' },
  { href: '#stats', label: 'Stats', id: 'stats' },
] as const;

const SCROLL_SECTION_IDS = NAV_LINKS.map((link) => link.id);

// Light tints for icon wells (readable on dark cards)
const ICON_BLUSH = '#FFF0F3';
const ICON_LAVENDER = '#F3EEFF';
const ICON_MINT = '#ECF9F2';
const ICON_BUTTER = '#FFF6D6';

function NotemarqLogo({ className = '', size = 'md' }: { className?: string; size?: 'md' | 'sm' }) {
  const box = size === 'sm' ? 'h-7 w-7 rounded-md' : 'h-8 w-8 rounded-lg sm:h-8 sm:w-8';
  const text = size === 'sm' ? 'text-base font-bold' : 'text-lg font-bold';

  return (
    <Link
      href="/#top"
      className={`inline-flex items-center gap-2 ${className}`}
      style={{ color: TEXT, letterSpacing: '-0.02em' }}
    >
      <span
        className={`flex shrink-0 items-center justify-center overflow-hidden ${box}`}
        style={{
          background: '#FFFFFF',
        }}
      >
        <Image
          src="/logog.png"
          alt="Notemarq"
          width={80}
          height={80}
          className="h-full w-full object-cover"
        />
      </span>
      <span className={`${text} tracking-tight`}>notemarq</span>
    </Link>
  );
}

function StoreButton({
  href,
  icon,
  label,
  title,
}: {
  href: string;
  icon: React.ReactNode;
  label: string;
  title: string;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-2.5 rounded-full px-5 py-2.5 transition hover:-translate-y-0.5 hover:opacity-95"
      style={{
        background: '#FFFFFF',
        color: INK,
        boxShadow: '0 6px 18px rgba(0,0,0,0.3)',
      }}
    >
      {icon}
      <div className="text-left">
        <div className="text-[9px] font-medium leading-none opacity-55">{label}</div>
        <div className="text-[12px] font-semibold leading-tight">{title}</div>
      </div>
    </a>
  );
}

function DownloadLinks({ className = '' }: { className?: string }) {
  return (
    <div
      className={`flex flex-col items-center justify-center gap-2.5 sm:flex-row sm:flex-wrap sm:gap-3 ${className}`}
    >
      <StoreButton href={APP_STORE_URL} label="Download on the" title="App Store" icon={APP_STORE_ICON} />
      <StoreButton
        href={CHROME_EXTENSION_URL}
        label="Available on the"
        title="Chrome Web Store"
        icon={CHROME_ICON}
      />
    </div>
  );
}

function LandingNavbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [activeId, setActiveId] = useState<string>('top');

  useEffect(() => {
    const syncHash = () => {
      const hash = window.location.hash.replace('#', '');
      if (SCROLL_SECTION_IDS.includes(hash as (typeof SCROLL_SECTION_IDS)[number])) {
        setActiveId(hash);
      }
    };

    syncHash();
    window.addEventListener('hashchange', syncHash);
    return () => window.removeEventListener('hashchange', syncHash);
  }, []);

  useEffect(() => {
    const sections = SCROLL_SECTION_IDS.map((id) => document.getElementById(id)).filter(Boolean) as HTMLElement[];
    if (!sections.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);
        if (visible[0]?.target.id) {
          setActiveId(visible[0].target.id);
        }
      },
      { rootMargin: '-32% 0px -55% 0px', threshold: [0, 0.15, 0.4] },
    );

    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileOpen]);

  const navLinkClass = (id: string, mobile = false) => {
    const active = activeId === id;
    return [
      'rounded-full text-sm font-medium transition',
      mobile ? 'block w-full px-4 py-3 text-left' : 'px-4 py-2',
      active ? '' : mobile ? 'hover:bg-white/10' : 'hover:bg-white/10',
    ].join(' ');
  };

  const navLinkStyle = (id: string) =>
    activeId === id
      ? { background: TEXT, color: INK }
      : { color: TEXT };

  const closeMobile = () => setMobileOpen(false);

  return (
    <header className="sticky top-0 z-50 px-4 pt-4 sm:px-6 sm:pt-5">
      <nav
        className="relative mx-auto max-w-6xl rounded-full px-4 py-3 sm:px-6 sm:py-4"
        style={{
          background: NAV_BG,
          backdropFilter: 'blur(24px)',
          WebkitBackdropFilter: 'blur(24px)',
          border: `1px solid ${BORDER}`,
        }}
      >
        <div className="flex items-center justify-between gap-4">
          <NotemarqLogo />

          <div className="hidden items-center gap-1 md:flex">
            {NAV_LINKS.map((link) => (
              <a
                key={link.id}
                href={link.href}
                className={navLinkClass(link.id)}
                style={navLinkStyle(link.id)}
              >
                {link.label}
              </a>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <a
              href="/app"
              className="hidden items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold transition hover:opacity-90 sm:inline-flex"
              style={{ background: CORAL, color: '#FFFFFF' }}
            >
              Open App <IconArrowRight size={14} stroke={2.5} />
            </a>

            <button
              type="button"
              className="inline-flex h-10 w-10 items-center justify-center rounded-full transition hover:bg-white/10 md:hidden"
              style={{ color: TEXT, border: `1px solid ${BORDER}` }}
              aria-expanded={mobileOpen}
              aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
              onClick={() => setMobileOpen((open) => !open)}
            >
              {mobileOpen ? <IconX size={20} stroke={2} /> : <IconMenu size={20} stroke={2} />}
            </button>
          </div>
        </div>

        {mobileOpen ? (
          <div
            className="mt-3 overflow-hidden rounded-[24px] border p-2 md:hidden"
            style={{ borderColor: BORDER, background: 'rgba(0,0,0,0.55)' }}
          >
            {NAV_LINKS.map((link) => (
              <a
                key={link.id}
                href={link.href}
                className={navLinkClass(link.id, true)}
                style={navLinkStyle(link.id)}
                onClick={closeMobile}
              >
                {link.label}
              </a>
            ))}
            <a
              href="/app"
              className="mt-1 flex items-center justify-center gap-2 rounded-full px-4 py-3 text-sm font-semibold"
              style={{ background: CORAL, color: '#FFFFFF' }}
              onClick={closeMobile}
            >
              Open App <IconArrowRight size={14} stroke={2.5} />
            </a>
          </div>
        ) : null}
      </nav>
    </header>
  );
}

export default function LandingPage() {
  return (
    <div className="font-jakarta" style={{ background: BG, color: TEXT }}>
      <LandingNavbar />

      <main>

        {/* Hero — headline + image in one frame */}
        <section id="top" className="scroll-mt-28 px-4 pb-0 pt-4 sm:px-6 sm:pt-6">
          <div className="mx-auto max-w-6xl">
            <Reveal direction="up">
              <div
                className="overflow-hidden rounded-[28px] sm:rounded-[36px]"
                style={{
                  background: `linear-gradient(180deg, ${LAVENDER_DEEP} 0%, ${BG} 42%)`,
                  border: `1px solid ${BORDER}`,
                  boxShadow: '0 32px 80px rgba(0,0,0,0.55)',
                }}
              >
                {/* Copy */}
                <div className="relative z-10 px-5 pb-2 pt-6 text-center sm:px-10 sm:pt-8 lg:px-12 lg:pt-9">
                  <h1 className="mx-auto max-w-3xl text-3xl font-bold leading-[1.12] tracking-tight sm:text-[2.75rem] lg:text-[3.15rem]" style={{ letterSpacing: '-0.03em' }}>
                    You save everything.
                    <br />
                    You remember{' '}
                    <span className="relative inline-block whitespace-nowrap align-baseline">
                      <span
                        aria-hidden
                        className="pointer-events-none absolute inset-x-0 bottom-[0.12em] top-[0.12em] rounded-full"
                        style={{ background: CORAL }}
                      />
                      <span className="relative px-[0.32em]" style={{ color: '#FFFFFF' }}>
                        nothing.
                      </span>
                    </span>
                  </h1>

                  <p className="mx-auto mt-4 max-w-lg text-[15px] leading-snug sm:text-base" style={{ color: SOFT }}>
                    Save links from YouTube, TikTok, X, and anywhere you scroll.
                    <br />
                    Notemarq organizes them with AI so you actually remember what you saved.
                  </p>

                  <DownloadLinks className="relative z-10 mt-5" />
                </div>

                {/* Device image — full width, no height cap */}
                <div className="relative mt-2 w-full sm:mt-3">
                  <Image
                    src="/frame.png"
                    alt="Notemarq app on iPhone"
                    width={3680}
                    height={2760}
                    priority
                    className="block h-auto w-full translate-x-[3.5%] object-contain object-bottom sm:translate-x-[2.5%]"
                  />
                </div>
              </div>
            </Reveal>
          </div>
        </section>

        {/* Platform grid — 4 cards */}
        <section className="px-4 py-16 sm:px-6 sm:py-20">
          <div className="mx-auto max-w-6xl">
            <Reveal>
              <p className="mb-8 text-center text-xs font-bold uppercase tracking-[0.18em]" style={{ color: SOFTER }}>
                Save from anywhere you scroll
              </p>
            </Reveal>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
              {[
                {
                  name: 'X / Twitter',
                  handle: '@trending',
                  color: '#FFFFFF',
                  bg: '#0a0a0a',
                  tagline: 'Capture threads before they disappear.',
                  icon: (
                    <svg viewBox="0 0 24 24" fill="currentColor" className="h-full w-full">
                      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.747l7.73-8.835L1.254 2.25H8.08l4.253 5.622zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                    </svg>
                  ),
                  hoverText: 'That thread you bookmarked? Still there.',
                },
                {
                  name: 'YouTube',
                  handle: '@anywhere',
                  color: '#FF0000',
                  bg: '#1a0000',
                  tagline: 'Save any video, chapter, or clip.',
                  icon: (
                    <svg viewBox="0 0 24 24" fill="currentColor" className="h-full w-full">
                      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                    </svg>
                  ),
                  hoverText: 'Bookmark at 2:34, pick it back up later.',
                },
                {
                  name: 'TikTok',
                  handle: '@fyp',
                  color: '#69C9D0',
                  bg: '#001214',
                  tagline: 'Never lose a viral find again.',
                  icon: (
                    <svg viewBox="0 0 24 24" fill="currentColor" className="h-full w-full">
                      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V8.69a8.27 8.27 0 0 0 4.84 1.55V6.79a4.85 4.85 0 0 1-1.07-.1z"/>
                    </svg>
                  ),
                  hoverText: 'Save the vibe, keep the recipe.',
                },
                {
                  name: 'Articles',
                  handle: 'web',
                  color: '#E8B84A',
                  bg: '#120e00',
                  tagline: 'Long reads, saved with one click.',
                  icon: (
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className="h-full w-full">
                      <circle cx="12" cy="12" r="10"/>
                      <path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
                    </svg>
                  ),
                  hoverText: 'Every article, tagged and searchable.',
                },
              ].map((p) => (
                <Reveal key={p.name} direction="up">
                  <div
                    className="group relative overflow-hidden rounded-[24px] sm:rounded-[28px]"
                    style={{
                      background: p.bg,
                      border: `1px solid rgba(255,255,255,0.07)`,
                      aspectRatio: '1 / 1',
                    }}
                  >
                    {/* Giant logo watermark */}
                    <div
                      className="absolute inset-0 flex items-center justify-center opacity-[0.07] transition-all duration-500 group-hover:opacity-[0.18] group-hover:scale-110"
                      style={{ color: p.color, padding: '15%' }}
                    >
                      {p.icon}
                    </div>

                    {/* Glow on hover */}
                    <div
                      className="absolute inset-0 rounded-[inherit] opacity-0 transition-opacity duration-500 group-hover:opacity-100"
                      style={{ boxShadow: `inset 0 0 80px 0 ${p.color}22` }}
                    />

                    {/* Default state content */}
                    <div className="absolute inset-0 flex flex-col justify-end p-5 transition-all duration-400 group-hover:opacity-0 group-hover:translate-y-2 sm:p-6">
                      <div
                        className="mb-3 flex h-10 w-10 items-center justify-center rounded-2xl sm:h-12 sm:w-12"
                        style={{ background: `${p.color}22`, color: p.color }}
                      >
                        <div className="h-5 w-5 sm:h-6 sm:w-6">{p.icon}</div>
                      </div>
                      <p className="text-base font-bold leading-tight sm:text-lg" style={{ color: TEXT }}>{p.name}</p>
                      <p className="mt-1 text-xs leading-snug sm:text-sm" style={{ color: SOFT }}>{p.tagline}</p>
                    </div>

                    {/* Hover state — slide up */}
                    <div className="absolute inset-0 flex translate-y-4 flex-col items-center justify-center p-5 text-center opacity-0 transition-all duration-400 group-hover:translate-y-0 group-hover:opacity-100 sm:p-6">
                      <div
                        className="mb-4 flex h-12 w-12 items-center justify-center rounded-full sm:h-14 sm:w-14"
                        style={{ background: p.color, color: '#000' }}
                      >
                        <div className="h-6 w-6 sm:h-7 sm:w-7">{p.icon}</div>
                      </div>
                      <p className="text-sm font-bold sm:text-base" style={{ color: TEXT }}>{p.hoverText}</p>
                      <span
                        className="mt-4 inline-flex items-center gap-1.5 rounded-full px-4 py-1.5 text-xs font-semibold"
                        style={{ background: `${p.color}22`, color: p.color }}
                      >
                        Save with notemarq
                      </span>
                    </div>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* How it works */}
        <section id="how" className="scroll-mt-28 px-4 py-20 sm:px-6 sm:py-28">
          <div className="mx-auto max-w-6xl">
            <Reveal>
              <div
                className="overflow-hidden rounded-[28px] sm:rounded-[36px]"
                style={{
                  background: `linear-gradient(180deg, ${BLUSH_DEEP} 0%, ${BG} 30%, ${BG} 100%)`,
                  border: `1px solid ${BORDER}`,
                  boxShadow: '0 32px 80px rgba(0,0,0,0.55)',
                }}
              >
                <div className="px-5 py-12 text-center sm:px-10 sm:py-16 lg:px-14 lg:py-20">
                  <span
                    className="inline-block rounded-full px-4 py-1.5 text-[11px] font-bold uppercase tracking-[0.2em]"
                    style={{ background: 'rgba(255,255,255,0.06)', color: TAG_PURPLE, border: `1px solid rgba(255,255,255,0.08)` }}
                  >
                    How it works
                  </span>
                  <h2
                    className="mx-auto mt-5 max-w-2xl text-3xl font-bold leading-[1.08] tracking-tight sm:text-[2.75rem] lg:text-5xl"
                    style={{ letterSpacing: '-0.03em' }}
                  >
                    Three steps to organized bliss
                  </h2>
                  <p className="mx-auto mt-4 max-w-lg text-[15px] leading-relaxed sm:text-base" style={{ color: SOFT }}>
                    Save in seconds. Let AI handle the filing. Find it again when it matters.
                  </p>
                </div>

                <div className="hidden items-center justify-center gap-3 px-10 pb-4 lg:flex lg:px-14">
                  {['Save', 'Organize', 'Recall'].map((label, i) => (
                    <React.Fragment key={label}>
                      <span
                        className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-semibold"
                        style={{
                          color: i === 0 ? TAG_PINK : i === 1 ? TAG_PURPLE : CYAN,
                          background: 'rgba(255,255,255,0.04)',
                          border: `1px solid ${i === 0 ? TAG_PINK : i === 1 ? TAG_PURPLE : CYAN}33`,
                        }}
                      >
                        <span
                          className="h-1.5 w-1.5 rounded-full"
                          style={{
                            background: i === 0 ? TAG_PINK : i === 1 ? TAG_PURPLE : CYAN,
                            boxShadow: `0 0 10px ${i === 0 ? TAG_PINK : i === 1 ? TAG_PURPLE : CYAN}`,
                          }}
                        />
                        0{i + 1} · {label}
                      </span>
                      {i < 2 ? (
                        <IconArrowRight size={16} stroke={1.8} style={{ color: SOFTER }} />
                      ) : null}
                    </React.Fragment>
                  ))}
                </div>

                <div className="grid gap-14 px-5 pb-12 sm:gap-16 sm:px-10 sm:pb-16 lg:grid-cols-3 lg:gap-6 lg:px-14 lg:pb-20 xl:gap-10">
                  {[
                    {
                      step: '01',
                      title: 'Save',
                      copy: 'Drop any link. Add why you\'re keeping it.',
                      accent: TAG_PINK,
                      screenshot: '/stores/save___.png',
                      screenshotAlt: 'Save a link with preview and context in Notemarq',
                    },
                    {
                      step: '02',
                      title: 'Organize',
                      copy: 'AI tags, summarizes, and files automatically.',
                      accent: TAG_PURPLE,
                      screenshot: '/stores/organize.png',
                      screenshotAlt: 'Library folders organized automatically in Notemarq',
                    },
                    {
                      step: '03',
                      title: 'Recall',
                      copy: 'Search or get reminded with context.',
                      accent: CYAN,
                      screenshot: '/stores/search.png',
                      screenshotAlt: 'Search saved bookmarks with context in Notemarq',
                    },
                  ].map((s, i) => (
                    <div key={s.step} className="relative flex flex-col items-center text-center">
                      {i < 2 ? (
                        <div
                          className="pointer-events-none absolute -right-3 top-[38%] z-10 hidden translate-x-1/2 lg:block xl:-right-5"
                          aria-hidden
                        >
                          <IconArrowRight size={18} stroke={1.6} style={{ color: SOFTER }} />
                        </div>
                      ) : null}

                      <div className="relative isolate mx-auto w-full max-w-[300px] sm:max-w-[320px] lg:max-w-[340px]">
                        <div
                          className="pointer-events-none absolute -inset-20 opacity-20 blur-[90px]"
                          style={{
                            background: `radial-gradient(circle at 50% 55%, ${s.accent} 0%, transparent 70%)`,
                          }}
                        />
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={s.screenshot}
                          alt={s.screenshotAlt}
                          width={2227}
                          height={3750}
                          className="relative block h-auto w-full max-w-none"
                          decoding="async"
                          fetchPriority={i === 0 ? 'high' : 'auto'}
                        />
                      </div>

                      <Reveal delay={i * 70} direction="up">
                        <span
                          className="mt-7 inline-flex items-center gap-2 rounded-full px-3.5 py-1 text-[11px] font-semibold uppercase tracking-[0.16em]"
                          style={{
                            color: s.accent,
                            background: 'rgba(255,255,255,0.04)',
                            border: `1px solid ${s.accent}33`,
                          }}
                        >
                          <span
                            className="h-1.5 w-1.5 rounded-full"
                            style={{ background: s.accent, boxShadow: `0 0 10px ${s.accent}` }}
                          />
                          {s.step}
                        </span>
                        <h3
                          className="mt-4 text-2xl font-bold tracking-tight sm:text-[1.75rem]"
                          style={{ letterSpacing: '-0.03em' }}
                        >
                          {s.title}
                        </h3>
                        <p className="mt-2 max-w-[240px] text-sm leading-relaxed sm:text-[15px]" style={{ color: SOFT }}>
                          {s.copy}
                        </p>
                      </Reveal>
                    </div>
                  ))}
                </div>

                <div
                  className="border-t border-white/[0.06] px-5 pb-12 pt-10 text-center sm:px-10 sm:pb-14 lg:px-14"
                >
                  <p className="mb-5 text-sm font-medium sm:text-[15px]" style={{ color: SOFT }}>
                    Ready to never lose a save?
                  </p>
                  <DownloadLinks className="justify-center" />
                </div>
              </div>
            </Reveal>
          </div>
        </section>

        {/* Features — core differentiator */}
        <section id="features" className="scroll-mt-28 px-4 py-20 sm:px-6 sm:py-28">
          <div className="mx-auto max-w-6xl">
            <Reveal>
              <div
                className="overflow-hidden rounded-[28px] sm:rounded-[36px]"
                style={{
                  background: `linear-gradient(180deg, ${LAVENDER_DEEP} 0%, ${BG} 28%, ${BG} 100%)`,
                  border: `1px solid ${BORDER}`,
                  boxShadow: '0 32px 80px rgba(0,0,0,0.55)',
                }}
              >
                <div className="px-5 py-12 text-center sm:px-10 sm:py-16 lg:px-14 lg:py-20">
                  <span
                    className="inline-block rounded-full px-4 py-1.5 text-[11px] font-bold uppercase tracking-[0.2em]"
                    style={{ background: 'rgba(255,255,255,0.06)', color: TAG_PINK, border: `1px solid rgba(255,255,255,0.08)` }}
                  >
                    Why notemarq
                  </span>
                  <h2
                    className="mx-auto mt-5 max-w-2xl text-3xl font-bold leading-[1.08] tracking-tight sm:text-[2.75rem] lg:text-5xl"
                    style={{ letterSpacing: '-0.03em' }}
                  >
                    Save with context — not just the link
                  </h2>
                  <p className="mx-auto mt-4 max-w-lg text-[15px] leading-relaxed sm:text-base" style={{ color: SOFT }}>
                    Every other app saves the URL. Notemarq saves why it mattered to you.
                  </p>
                </div>

                <div className="px-5 pb-12 sm:px-10 sm:pb-16 lg:px-14 lg:pb-20">
                  <div className="flex flex-col items-center gap-12 lg:flex-row lg:gap-20">
                    <Reveal className="relative flex-1 text-center lg:max-w-[420px] lg:text-left">
                      <span
                        aria-hidden
                        className="pointer-events-none absolute left-0 top-1/2 hidden -translate-y-1/2 select-none text-[7rem] font-bold leading-none tracking-tighter opacity-[0.035] sm:text-[8rem] lg:block xl:text-[9rem]"
                        style={{ letterSpacing: '-0.06em' }}
                      >
                        01
                      </span>

                      <span
                        className="inline-flex items-center gap-2 rounded-full px-3.5 py-1 text-[11px] font-semibold uppercase tracking-[0.16em]"
                        style={{
                          color: TAG_PINK,
                          background: 'rgba(255,255,255,0.04)',
                          border: `1px solid ${TAG_PINK}33`,
                        }}
                      >
                        <span
                          className="h-1.5 w-1.5 rounded-full"
                          style={{ background: TAG_PINK, boxShadow: `0 0 10px ${TAG_PINK}` }}
                        />
                        The difference
                      </span>

                      <h3
                        className="mt-5 text-[1.75rem] font-bold leading-[1.1] tracking-tight sm:text-4xl lg:text-[2.65rem]"
                        style={{ letterSpacing: '-0.03em' }}
                      >
                        Capture why behind every link
                      </h3>
                      <p className="mt-3 text-base font-medium sm:text-lg" style={{ color: TEXT }}>
                        Add a note when you save — or let AI suggest one.
                      </p>
                      <p className="mx-auto mt-4 max-w-md text-sm leading-relaxed sm:text-[15px] lg:mx-0" style={{ color: SOFT }}>
                        Your future self won&apos;t wonder why you bookmarked that video at 2am.
                        Context turns a pile of links into a library you actually use.
                      </p>
                    </Reveal>

                    <div className="relative isolate flex w-full flex-1 items-center justify-center lg:max-w-[520px]">
                      <div
                        className="pointer-events-none absolute -inset-20 opacity-20 blur-[90px]"
                        style={{
                          background: `radial-gradient(circle at 50% 55%, ${TAG_PINK} 0%, transparent 70%)`,
                        }}
                      />
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src="/stores/why_notemarq.png"
                        alt="Notemarq library with AI-organized folders on iPhone"
                        width={1898}
                        height={3671}
                        className="relative block h-auto w-full max-w-[320px] sm:max-w-[380px] lg:max-w-[440px] xl:max-w-[480px]"
                        decoding="async"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </Reveal>
          </div>
        </section>

        {/* Sync across all devices */}
        <section className="px-4 py-14 sm:px-6 sm:py-20">
          <div className="mx-auto max-w-6xl">
            <Reveal>
              <div className="text-center">
                <span
                  className="inline-block rounded-full px-4 py-1.5 text-xs font-bold uppercase tracking-wider"
                  style={{ background: LAVENDER_DEEP, color: TAG_PURPLE }}
                >
                  Everywhere you are
                </span>
                <h2
                  className="mx-auto mt-4 max-w-2xl text-3xl font-bold leading-tight sm:text-4xl lg:text-5xl"
                  style={{ letterSpacing: '-0.03em' }}
                >
                  Sync across all devices
                </h2>
                <p className="mx-auto mt-4 max-w-lg text-base leading-relaxed sm:text-lg" style={{ color: SOFT }}>
                  Save on your phone, pick up on your laptop, browse on your tablet.
                  Your library stays in sync — always.
                </p>
              </div>
            </Reveal>

            <Reveal delay={120} direction="up">
              <div
                className="mt-10 overflow-hidden rounded-[28px] sm:mt-14 sm:rounded-[36px]"
                style={{
                  background: BG,
                  border: `1px solid ${BORDER}`,
                  boxShadow: '0 24px 64px rgba(0,0,0,0.45)',
                }}
              >
                <Image
                  src="/sync-across-all-dev.png"
                  alt="Notemarq on phone, laptop, and tablet — synced across all devices"
                  width={6000}
                  height={4171}
                  className="block h-auto w-full object-contain"
                />
              </div>
            </Reveal>

            <Reveal delay={200}>
              <div className="mt-8 flex flex-wrap items-center justify-center gap-3 sm:gap-4">
                {[
                  { label: 'iPhone', icon: IconDeviceMobile },
                  { label: 'Mac & Windows', icon: IconDeviceLaptop },
                  { label: 'iPad & tablet', icon: IconDeviceTablet },
                ].map(({ label, icon: Icon }) => (
                  <span
                    key={label}
                    className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium"
                    style={{ background: CREAM, color: TEXT, border: `1.5px solid ${WEEK_RING}` }}
                  >
                    <Icon size={16} stroke={1.8} style={{ color: TAG_PURPLE }} />
                    {label}
                  </span>
                ))}
              </div>
            </Reveal>
          </div>
        </section>

        {/* Stats */}
        <section id="stats" className="scroll-mt-28 px-4 py-20 sm:px-6 sm:py-28">
          <div className="mx-auto max-w-6xl">
            <Reveal>
              <div
                className="overflow-hidden rounded-[28px] sm:rounded-[36px]"
                style={{
                  background: `linear-gradient(180deg, ${LAVENDER_DEEP} 0%, ${BG} 38%, ${BG} 100%)`,
                  border: `1px solid ${BORDER}`,
                  boxShadow: '0 32px 80px rgba(0,0,0,0.55)',
                }}
              >
                <div className="px-5 py-10 text-center sm:px-10 sm:py-12">
                  <span
                    className="inline-block rounded-full px-4 py-1.5 text-[11px] font-bold uppercase tracking-[0.2em]"
                    style={{ background: 'rgba(255,255,255,0.06)', color: TAG_PURPLE, border: `1px solid rgba(255,255,255,0.08)` }}
                  >
                    By the numbers
                  </span>
                  <h2
                    className="mx-auto mt-5 max-w-xl text-2xl font-bold leading-[1.12] tracking-tight sm:text-3xl lg:text-4xl"
                    style={{ letterSpacing: '-0.03em' }}
                  >
                    Built for people who save everything
                  </h2>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 sm:divide-x sm:divide-white/[0.06]">
                  {[
                    { value: 10, suffix: 'K+', label: 'Active users', accent: CORAL },
                    { value: 50, suffix: 'K+', label: 'Saves organized', accent: TAG_PURPLE },
                    { value: 4.9, decimals: 1, suffix: '★', label: 'App Store rating', accent: WEEK_ACTIVE },
                  ].map((s, i) => (
                    <Reveal key={s.label} delay={i * 80} direction="up">
                      <div
                        className={`relative px-6 py-10 text-center sm:py-12 ${
                          i < 2 ? 'border-b border-white/[0.06] sm:border-b-0' : ''
                        }`}
                      >
                        <div
                          className="pointer-events-none absolute left-1/2 top-1/2 h-32 w-32 -translate-x-1/2 -translate-y-1/2 rounded-full opacity-20 blur-3xl"
                          style={{ background: s.accent }}
                        />
                        <div
                          className="relative text-[3.25rem] font-bold leading-none tracking-tight sm:text-6xl"
                          style={{ color: s.accent, letterSpacing: '-0.04em' }}
                        >
                          <CountUp to={s.value} suffix={s.suffix} decimals={s.decimals ?? 0} />
                        </div>
                        <p className="relative mt-3 text-sm font-medium sm:text-[15px]" style={{ color: SOFT }}>
                          {s.label}
                        </p>
                      </div>
                    </Reveal>
                  ))}
                </div>
              </div>
            </Reveal>
          </div>
        </section>

        {/* Final CTA */}
        <section className="px-4 pb-20 sm:px-6 sm:pb-28">
          <div className="mx-auto max-w-6xl">
            <Reveal direction="scale">
              <div
                className="overflow-hidden rounded-[28px] sm:rounded-[36px]"
                style={{
                  background: `linear-gradient(180deg, ${BLUSH_DEEP} 0%, ${LAVENDER_DEEP} 38%, ${BG} 100%)`,
                  border: `1px solid ${BORDER}`,
                  boxShadow: '0 32px 80px rgba(0,0,0,0.55)',
                }}
              >
                <div className="px-6 py-16 text-center sm:px-12 sm:py-20 lg:px-16 lg:py-24">
                  <span
                    className="inline-block rounded-full px-4 py-1.5 text-[11px] font-bold uppercase tracking-[0.2em]"
                    style={{ background: 'rgba(255,255,255,0.06)', color: CORAL, border: `1px solid rgba(255,255,255,0.08)` }}
                  >
                    Get started
                  </span>

                  <h2
                    className="mx-auto mt-6 max-w-2xl text-3xl font-bold leading-[1.1] tracking-tight sm:text-[2.75rem] lg:text-5xl"
                    style={{ letterSpacing: '-0.03em' }}
                  >
                    Stop collecting links.
                    <br />
                    Start building{' '}
                    <span className="relative inline-block whitespace-nowrap align-baseline">
                      <span
                        aria-hidden
                        className="pointer-events-none absolute inset-x-0 bottom-[0.12em] top-[0.12em] rounded-full"
                        style={{ background: CORAL }}
                      />
                      <span className="relative px-[0.32em]" style={{ color: '#FFFFFF' }}>
                        knowledge.
                      </span>
                    </span>
                  </h2>

                  <p className="mx-auto mt-5 max-w-lg text-[15px] leading-relaxed sm:text-base" style={{ color: SOFT }}>
                    Your next great idea is already saved somewhere. Notemarq makes sure you remember it.
                  </p>

                  <DownloadLinks className="mt-8" />

                  <a
                    href="/app"
                    className="mt-5 inline-flex items-center gap-2 text-sm font-semibold transition hover:opacity-80"
                    style={{ color: TAG_PURPLE }}
                  >
                    Or open the web app
                    <IconArrowRight size={15} stroke={2.5} />
                  </a>
                </div>
              </div>
            </Reveal>
          </div>
        </section>

      </main>

      <footer className="border-t px-4 py-12 sm:px-6" style={{ borderColor: BORDER }}>
        <div className="mx-auto max-w-6xl">
          <div className="flex flex-col items-center gap-8 sm:flex-row sm:items-center sm:justify-between">
            <NotemarqLogo size="sm" />

            <nav className="flex flex-wrap items-center justify-center gap-1">
              {[
                ...NAV_LINKS,
                { href: '/app', label: 'Open App', id: 'app' },
              ].map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  className="rounded-full px-4 py-2 text-sm font-medium transition hover:bg-white/[0.06]"
                  style={{ color: SOFT }}
                >
                  {link.label}
                </a>
              ))}
            </nav>

            <p className="text-sm" style={{ color: SOFTER }}>
              © {new Date().getFullYear()} Notemarq
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
