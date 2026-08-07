'use client';

import Image from 'next/image';
import Link from 'next/link';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  IconArrowLeft,
  IconArrowRight,
  IconBrandX,
  IconBrandYoutube,
  IconMaximize,
  IconMinimize,
} from '@tabler/icons-react';

const BG = '#000000';
const CARD = '#141414';
const BORDER = '#1F1F1F';
const TEXT = '#FFFFFF';
const SOFT = 'rgba(255,255,255,0.62)';
const SOFTER = 'rgba(255,255,255,0.35)';
const CORAL = '#C96A48';
const WEEK = '#E8B84A';
const CYAN = '#22D3EE';
const LAVENDER_DEEP = '#252038';
const MINT = '#122018';
const PEACH = '#221A14';
const BLUSH = '#221820';
const SUCCESS = '#30D158';
const TAG_PURPLE = '#A99AF0';

type Slide = {
  id: string;
  minutes?: string;
  render: (active: boolean) => React.ReactNode;
};

function Eyebrow({ children, color = SOFTER }: { children: React.ReactNode; color?: string }) {
  return (
    <p
      className="mb-4 text-xs font-bold uppercase tracking-[0.2em] sm:mb-5 sm:text-[13px]"
      style={{ color }}
    >
      {children}
    </p>
  );
}

function Title({ children }: { children: React.ReactNode }) {
  return (
    <h1
      className="max-w-5xl text-[clamp(1.85rem,5.2vw,4rem)] font-bold leading-[1.05] tracking-tight"
      style={{ letterSpacing: '-0.035em', color: TEXT }}
    >
      {children}
    </h1>
  );
}

function Sub({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <p
      className={`mt-5 max-w-2xl text-[clamp(1rem,2.1vw,1.3rem)] leading-relaxed ${className}`}
      style={{ color: SOFT }}
    >
      {children}
    </p>
  );
}

function Highlight({ children }: { children: React.ReactNode }) {
  return (
    <span className="relative inline-block whitespace-nowrap align-baseline">
      <span
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-[0.1em] top-[0.1em] rounded-full"
        style={{ background: CORAL }}
      />
      <span className="relative px-[0.28em]" style={{ color: '#FFFFFF' }}>
        {children}
      </span>
    </span>
  );
}

function Card({
  children,
  accent,
  className = '',
}: {
  children: React.ReactNode;
  accent?: string;
  className?: string;
}) {
  return (
    <div
      className={`rounded-[24px] border p-5 sm:rounded-[28px] sm:p-6 ${className}`}
      style={{
        background: accent ?? CARD,
        borderColor: BORDER,
        boxShadow: '0 24px 60px rgba(0,0,0,0.4)',
      }}
    >
      {children}
    </div>
  );
}

const SLIDES: Slide[] = [
  // Slide 1 — Title
  {
    id: 'title',
    minutes: '0:00',
    render: () => (
      <div className="flex h-full flex-col justify-center">
        <div className="mb-8 flex items-center gap-4">
          <div
            className="h-20 w-20 overflow-hidden rounded-full"
            style={{ 
              background: 'linear-gradient(135deg, #0EA5E9 0%, #06B6D4 100%)',
              border: '3px solid rgba(255,255,255,0.1)'
            }}
          >
            <Image 
              src="/logo/albertmends-logo.jpg" 
              alt="Albert Mends" 
              width={80} 
              height={80} 
              className="h-full w-full object-cover"
            />
          </div>
        </div>
        <Title>
          You Save Everything,
          <br />
          You Remember <Highlight>Nothing</Highlight>
        </Title>
        <div className="mt-10 flex flex-wrap items-center gap-6 border-t pt-8" style={{ borderColor: BORDER }}>
          <div>
            <p className="text-2xl font-bold" style={{ color: TEXT }}>
              Albert Mends
            </p>
            <p className="mt-1 text-lg" style={{ color: SOFT }}>
              Claude Code Accra #2
            </p>
          </div>
        </div>
      </div>
    ),
  },
  // Slide 2 — Opening claim
  {
    id: 'opening-claim',
    minutes: '0:01',
    render: () => (
      <div className="flex h-full flex-col justify-center">
        <Title>
          Haven&apos;t written a line of code
          <br />
          in <Highlight>6 months</Highlight>
        </Title>
        <Sub className="mt-8 text-2xl" style={{ color: TEXT }}>
          Coding is solved. Engineering isn&apos;t.
        </Sub>
      </div>
    ),
  },
  // Slide 3 — Before agentic coding
  {
    id: 'before-agentic',
    minutes: '0:02',
    render: () => (
      <div>
        <Eyebrow color={CORAL}>Before agentic coding</Eyebrow>
        <Title>The pre-LLM debugging ritual</Title>
        <div className="mt-10 space-y-6">
          <Card accent={PEACH}>
            <p className="text-xl leading-relaxed" style={{ color: SOFT }}>
              Walk to a colleague
              <br />
              Explain the bug
              <br />
              <span className="text-2xl font-bold" style={{ color: WEEK }}>
                Explaining the code <em>was</em> the debugging
              </span>
            </p>
          </Card>
          <Card accent={MINT}>
            <p className="text-2xl font-bold" style={{ color: SUCCESS }}>
              Now: 5 projects a week, solo
            </p>
          </Card>
        </div>
      </div>
    ),
  },
  // Slide 4 — The catch
  {
    id: 'the-catch',
    minutes: '0:04',
    render: () => (
      <div>
        <Eyebrow color={WEEK}>The catch</Eyebrow>
        <Title>
          Interesting time to build
          <br />
          but <Highlight>speed without process</Highlight> = failing faster, 5× over
        </Title>
        <Sub className="mt-8">
          Tonight: what makes this work properly + an app built from scratch
        </Sub>
      </div>
    ),
  },
  // Slide 5 — Section header: Part One
  {
    id: 'part-one',
    minutes: '0:05',
    render: () => (
      <div className="flex h-full items-center justify-center">
        <div className="text-center">
          <Eyebrow color={CYAN}>Part One</Eyebrow>
          <Title>
            Things About Claude
            <br />
            People Don&apos;t Talk About
          </Title>
        </div>
      </div>
    ),
  },
  // Slide 6 — Core prompting principle
  {
    id: 'prompting-principle',
    minutes: '0:06',
    render: () => (
      <div>
        <Title>
          &ldquo;Poor prompting is inextricably linked
          <br />
          to a <Highlight>poor user experience</Highlight>.&rdquo;
        </Title>
        <Sub className="mt-8">
          Claude Code ≠ chatbot prompting
          <br />
          Treat it like a new hire, not a search bar
        </Sub>
      </div>
    ),
  },
  // Slide 7 — CLAUDE.md
  {
    id: 'claude-md',
    minutes: '0:08',
    render: () => (
      <div>
        <Eyebrow color={CYAN}>CLAUDE.md</Eyebrow>
        <Title>A persistent memory file Claude Code reads every session</Title>
        <div className="mt-8 grid gap-4 lg:grid-cols-3">
          {['Conventions', 'Architecture', 'Gotchas'].map((item) => (
            <Card key={item}>
              <p className="text-2xl font-bold">{item}</p>
              <p className="mt-3 text-base" style={{ color: SOFT }}>
                Write once, benefit every session
              </p>
            </Card>
          ))}
        </div>
      </div>
    ),
  },
  // Slide 8 — Plan before you build
  {
    id: 'plan-mode',
    minutes: '0:10',
    render: () => (
      <div>
        <Eyebrow color={WEEK}>Plan before you build</Eyebrow>
        <Title>Plan mode: approach first, code second</Title>
        <Sub className="mt-8">
          Separate &ldquo;what are we doing&rdquo; from &ldquo;now do it&rdquo;
        </Sub>
        <div className="mt-8 grid gap-4 lg:grid-cols-2">
          <Card accent={BLUSH}>
            <p className="text-sm font-bold uppercase tracking-[0.14em]" style={{ color: CORAL }}>
              Without plan mode
            </p>
            <p className="mt-4 text-lg" style={{ color: SOFT }}>
              Jump straight into code, realize halfway through it&apos;s the wrong approach
            </p>
          </Card>
          <Card accent={MINT}>
            <p className="text-sm font-bold uppercase tracking-[0.14em]" style={{ color: SUCCESS }}>
              With plan mode
            </p>
            <p className="mt-4 text-lg" style={{ color: SOFT }}>
              Align on architecture, then execute confidently
            </p>
          </Card>
        </div>
      </div>
    ),
  },
  // Slide 9 — Subagents
  {
    id: 'subagents',
    minutes: '0:12',
    render: () => (
      <div>
        <Eyebrow color={TAG_PURPLE}>Subagents</Eyebrow>
        <Title>
          Specialized agents for review, testing
          <br />
          <Highlight>Own context window</Highlight>
        </Title>
        <Sub className="mt-8 text-xl" style={{ color: WEEK }}>
          Most underused feature in the room tonight
        </Sub>
      </div>
    ),
  },
  // Slide 10 — Hooks
  {
    id: 'hooks',
    minutes: '0:14',
    render: () => (
      <div>
        <Eyebrow color={SUCCESS}>Hooks</Eyebrow>
        <Title>Auto-run linters/tests on every edit</Title>
        <Sub className="mt-8">Quality becomes automatic, not remembered</Sub>
        <Card className="mt-8" accent={MINT}>
          <p className="text-xl" style={{ color: SOFT }}>
            Set it once, never think about it again
          </p>
        </Card>
      </div>
    ),
  },
  // Slide 11 - MCP
  {
    id: 'mcp',
    minutes: '0:15',
    render: () => (
      <div>
        <Eyebrow color={CYAN}>MCP</Eyebrow>
        <Title>Connects Claude Code to Drive, Slack, Jira, Figma</Title>
        <Sub className="mt-8">Turns it from &ldquo;a coder&rdquo; into a teammate</Sub>
        <div className="mt-8 grid gap-3 sm:grid-cols-4">
          {[
            { name: 'Google Drive', logo: 'https://cdn.simpleicons.org/googledrive/FFFFFF' },
            { name: 'Slack', logo: '/logo/brand-slack.svg' },
            { name: 'Jira', logo: 'https://cdn.simpleicons.org/jira/FFFFFF' },
            { name: 'Figma', logo: 'https://cdn.simpleicons.org/figma/FFFFFF' },
          ].map((tool) => (
            <Card key={tool.name}>
              <div className="flex flex-col items-center justify-center gap-3 py-2 text-center">
                <img
                  src={tool.logo}
                  alt={tool.name}
                  className="h-12 w-12"
                  style={{ filter: 'brightness(0) invert(1)' }}
                />
                <p className="text-base font-bold">{tool.name}</p>
              </div>
            </Card>
          ))}
        </div>
      </div>
    ),
  },
  // Slide 12 — Section header: Part Two
  {
    id: 'part-two',
    minutes: '0:17',
    render: () => (
      <div className="flex h-full items-center justify-center">
        <div className="text-center">
          <Eyebrow color={CORAL}>Part Two</Eyebrow>
          <Title>
            Can Claude Build a
            <br />
            Production App From Scratch?
          </Title>
        </div>
      </div>
    ),
  },
  // Slide 13 — The honest middle
  {
    id: 'honest-middle',
    minutes: '0:18',
    render: () => (
      <div>
        <Eyebrow>The honest middle</Eyebrow>
        <div className="mt-8 grid gap-4 lg:grid-cols-2">
          <Card accent={MINT}>
            <p className="text-sm font-bold uppercase tracking-[0.14em]" style={{ color: SUCCESS }}>
              Yes
            </p>
            <ul className="mt-4 space-y-2" style={{ color: SOFT }}>
              <li>• Scaffolding</li>
              <li>• CRUD</li>
              <li>• Auth</li>
              <li>• Integrations</li>
              <li>• Complex features</li>
            </ul>
          </Card>
          <Card accent={BLUSH}>
            <p className="text-sm font-bold uppercase tracking-[0.14em]" style={{ color: CORAL }}>
              No
            </p>
            <p className="mt-4 text-lg" style={{ color: SOFT }}>
              Not unsupervised
            </p>
          </Card>
        </div>
      </div>
    ),
  },
  // Slide 14 — What still needs you
  {
    id: 'needs-you',
    minutes: '0:20',
    render: () => (
      <div>
        <Eyebrow color={WEEK}>What still needs you</Eyebrow>
        <Title>The human parts</Title>
        <div className="mt-8 space-y-3">
          {[
            'Product judgment',
            'Architecture decisions with long-term consequences',
            'Security review',
            'Taste',
          ].map((item) => (
            <Card key={item}>
              <p className="text-xl font-bold">{item}</p>
            </Card>
          ))}
        </div>
      </div>
    ),
  },
  // Slide 15 — The verdict
  {
    id: 'verdict',
    minutes: '0:22',
    render: () => (
      <div className="flex h-full flex-col justify-center">
        <Title>
          Tool got faster.
          <br />
          <Highlight>Judgment is still yours.</Highlight>
        </Title>
        <Sub className="mt-8">
          Compresses idea → software
          <br />
          Doesn&apos;t remove the human
        </Sub>
      </div>
    ),
  },
  // Slide 16 — Section header: Part Three
  {
    id: 'part-three',
    minutes: '0:24',
    render: () => (
      <div className="flex h-full items-center justify-center">
        <div className="text-center">
          <Eyebrow color={WEEK}>Part Three</Eyebrow>
          <Title>Notemarq</Title>
        </div>
      </div>
    ),
  },
  // Slide 17 — The problem
  {
    id: 'problem',
    minutes: '0:25',
    render: () => (
      <div>
        <Eyebrow color={CORAL}>The problem</Eyebrow>
        <Title>
          AI made capturing effortless
          <br />
          Didn&apos;t make <Highlight>retrieving/using it</Highlight> any easier
        </Title>
      </div>
    ),
  },
  // Slide 18 — Design decisions
  {
    id: 'design-decisions',
    minutes: '0:26',
    render: () => (
      <div>
        <Eyebrow>Design decisions</Eyebrow>
        <Title>What Notemarq does differently</Title>
        <div className="mt-8 space-y-4">
          <Card>
            <p className="text-xl font-bold" style={{ color: WEEK }}>
              Decision 1
            </p>
            <p className="mt-2" style={{ color: SOFT }}>
              Resurfacing, not just storage - context-aware retrieval that brings back
              what matters when you need it
            </p>
          </Card>
          <Card>
            <p className="text-xl font-bold" style={{ color: CYAN }}>
              Decision 2
            </p>
            <p className="mt-2" style={{ color: SOFT }}>
              AI enrichment on save - automatically adds context so future-you
              understands why past-you saved it
            </p>
          </Card>
          <Card accent={LAVENDER_DEEP}>
            <p className="text-xl font-bold" style={{ color: TAG_PURPLE }}>
              A real Claude Code build moment
            </p>
            <p className="mt-2" style={{ color: SOFT }}>
              Built the entire embedding + RAG pipeline by prompting the loop,
              not individual functions
            </p>
          </Card>
        </div>
      </div>
    ),
  },
  // Slide 19 — Live demo
  {
    id: 'demo',
    minutes: '0:28',
    render: () => (
      <div className="flex h-full items-center justify-center">
        <div className="text-center">
          <Eyebrow color={SUCCESS}>Live demo</Eyebrow>
          <Title>
            <a
              href="https://notemarq.app"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:opacity-80"
              style={{ color: WEEK }}
            >
              notemarq.app
            </a>
          </Title>
        </div>
      </div>
    ),
  },
  // Slide 20 — Closing
  {
    id: 'closing',
    minutes: '0:30',
    render: () => (
      <div>
        <Title>
          Coding is solved.
          <br />
          Engineering isn&apos;t.
        </Title>
        <div className="mt-10 space-y-4">
          <Card>
            <p className="text-xl" style={{ color: SOFT }}>
              Capturing is cheap
            </p>
          </Card>
          <Card>
            <p className="text-xl" style={{ color: SOFT }}>
              Building is fast
            </p>
          </Card>
          <Card accent={PEACH}>
            <p className="text-2xl font-bold" style={{ color: CORAL }}>
              Remembering is still the hard part
            </p>
          </Card>
        </div>
        <Sub className="mt-8">Notemarq = my attempt at solving it</Sub>
      </div>
    ),
  },
  // Slide 21 - Self-intro + thanks
  {
    id: 'thanks',
    minutes: '0:32',
    render: () => (
      <div className="flex h-full flex-col justify-between gap-10">
        <div>
          <Title><strong>Thank You</strong></Title>
          <Sub className="mt-6">
            Albert Mends · AI Researcher · Funcstart
          </Sub>
          <Sub className="mt-2">
            20k audience across social media
          </Sub>
        </div>
        <div className="grid gap-4 sm:grid-cols-3">
          <Card>
            <a
              href="https://notemarq.app"
              target="_blank"
              rel="noopener noreferrer"
              className="flex flex-col items-center gap-3 py-2 text-center hover:opacity-80"
            >
              <span
                className="inline-flex h-12 w-12 items-center justify-center overflow-hidden rounded-xl"
                style={{ background: '#FFFFFF' }}
              >
                <Image src="/logog.png" alt="Notemarq" width={48} height={48} className="h-full w-full object-cover" />
              </span>
              <p className="text-sm font-bold uppercase tracking-[0.14em]" style={{ color: SOFTER }}>
                Product
              </p>
              <p className="text-lg font-semibold" style={{ color: WEEK }}>
                notemarq.app
              </p>
            </a>
          </Card>
          <Card>
            <a
              href="https://x.com/mendsalbert"
              target="_blank"
              rel="noopener noreferrer"
              className="flex flex-col items-center gap-3 py-2 text-center hover:opacity-80"
            >
              <IconBrandX size={48} stroke={1.5} style={{ color: TEXT }} />
              <p className="text-sm font-bold uppercase tracking-[0.14em]" style={{ color: SOFTER }}>
                Twitter / X
              </p>
              <p className="text-lg font-semibold" style={{ color: WEEK }}>
                @mendsalbert
              </p>
            </a>
          </Card>
          <Card>
            <a
              href="https://youtube.com/@mendsalbert"
              target="_blank"
              rel="noopener noreferrer"
              className="flex flex-col items-center gap-3 py-2 text-center hover:opacity-80"
            >
              <IconBrandYoutube size={48} stroke={1.5} style={{ color: TEXT }} />
              <p className="text-sm font-bold uppercase tracking-[0.14em]" style={{ color: SOFTER }}>
                YouTube
              </p>
              <p className="text-lg font-semibold" style={{ color: WEEK }}>
                @mendsalbert
              </p>
            </a>
          </Card>
        </div>
      </div>
    ),
  },
];

export default function TalkPresentationPage() {
  const [index, setIndex] = useState(0);
  const [entered, setEntered] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const stageRef = useRef<HTMLDivElement>(null);
  const total = SLIDES.length;
  const slide = SLIDES[index];

  const go = useCallback(
    (next: number) => {
      const clamped = Math.max(0, Math.min(total - 1, next));
      if (clamped === index) return;
      setEntered(false);
      window.setTimeout(() => {
        setIndex(clamped);
        setEntered(true);
      }, 120);
    },
    [index, total],
  );

  const next = useCallback(() => go(index + 1), [go, index]);
  const prev = useCallback(() => go(index - 1), [go, index]);

  const toggleFullscreen = useCallback(async () => {
    const node = stageRef.current;
    if (!node) return;
    try {
      if (!document.fullscreenElement) {
        await node.requestFullscreen();
      } else {
        await document.exitFullscreen();
      }
    } catch {
      // Browser may block without gesture; button click is a gesture.
    }
  }, []);

  useEffect(() => {
    const onFs = () => setIsFullscreen(Boolean(document.fullscreenElement));
    document.addEventListener('fullscreenchange', onFs);
    return () => document.removeEventListener('fullscreenchange', onFs);
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === ' ' || e.key === 'PageDown') {
        e.preventDefault();
        next();
      } else if (e.key === 'ArrowLeft' || e.key === 'PageUp') {
        e.preventDefault();
        prev();
      } else if (e.key === 'Home') {
        e.preventDefault();
        go(0);
      } else if (e.key === 'End') {
        e.preventDefault();
        go(total - 1);
      } else if (e.key === 'f' || e.key === 'F') {
        e.preventDefault();
        void toggleFullscreen();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [go, next, prev, total, toggleFullscreen]);

  const progress = useMemo(() => ((index + 1) / total) * 100, [index, total]);

  return (
    <div
      ref={stageRef}
      className="font-jakarta relative flex h-[100dvh] min-h-[100dvh] flex-col overflow-hidden"
      style={{
        background: BG,
        color: TEXT,
        backgroundImage: `radial-gradient(ellipse 80% 50% at 50% -20%, ${LAVENDER_DEEP} 0%, transparent 55%)`,
      }}
    >
      <div className="absolute inset-x-0 top-0 z-40 h-1" style={{ background: BORDER }}>
        <div
          className="h-full transition-[width] duration-300 ease-out"
          style={{ width: `${progress}%`, background: CORAL }}
        />
      </div>

      <div className="relative z-30 flex shrink-0 items-center justify-between px-4 pb-2 pt-5 sm:px-8 sm:pt-6">
        <div className="flex items-center gap-3">
          <span
            className="inline-flex h-8 w-8 items-center justify-center overflow-hidden rounded-lg"
            style={{ background: '#FFFFFF' }}
          >
            <Image src="/logog.png" alt="" width={32} height={32} className="h-full w-full object-cover" />
          </span>
          <div className="leading-tight">
            <p className="text-sm font-bold tracking-tight">notemarq</p>
            <p className="text-[11px] font-medium uppercase tracking-[0.14em]" style={{ color: SOFTER }}>
              Talk deck · Accra
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 sm:gap-3 text-sm font-medium" style={{ color: SOFT }}>
          <span className="hidden sm:inline" style={{ color: SOFTER }}>
            {slide.minutes}
          </span>
          <button
            type="button"
            onClick={() => void toggleFullscreen()}
            className="inline-flex h-9 w-9 items-center justify-center rounded-full transition hover:bg-white/10"
            style={{ border: `1px solid ${BORDER}`, background: CARD, color: TEXT }}
            aria-label={isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
            title={isFullscreen ? 'Exit fullscreen (F)' : 'Fullscreen (F)'}
          >
            {isFullscreen ? <IconMinimize size={18} /> : <IconMaximize size={18} />}
          </button>
          <span className="rounded-full px-3 py-1.5 tabular-nums" style={{ background: CARD, border: `1px solid ${BORDER}` }}>
            {index + 1} / {total}
          </span>
        </div>
      </div>

      <main className="relative z-10 mx-auto flex w-full max-w-6xl flex-1 flex-col justify-center overflow-y-auto px-4 pb-28 pt-4 sm:px-8 sm:pt-6">
        <div
          key={slide.id}
          className="flex flex-col justify-center"
          style={{
            opacity: entered ? 1 : 0,
            transform: entered ? 'translateY(0)' : 'translateY(16px)',
            transition: 'opacity 0.35s cubic-bezier(0.22,1,0.36,1), transform 0.35s cubic-bezier(0.22,1,0.36,1)',
          }}
        >
          {slide.render(entered)}
        </div>
      </main>

      <div className="absolute inset-x-0 bottom-0 z-50 px-4 pb-5 sm:px-8">
        <div
          className="mx-auto flex max-w-6xl items-center justify-between gap-3 rounded-full px-3 py-2.5 sm:px-4"
          style={{
            background: 'rgba(0,0,0,0.82)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            border: `1px solid ${BORDER}`,
          }}
        >
          <button
            type="button"
            onClick={prev}
            disabled={index === 0}
            className="inline-flex items-center gap-2 rounded-full px-4 py-2.5 text-sm font-semibold transition disabled:opacity-30"
            style={{ color: TEXT }}
            aria-label="Previous slide"
          >
            <IconArrowLeft size={18} />
            <span className="hidden sm:inline">Back</span>
          </button>

          <p className="hidden text-center text-xs font-medium uppercase tracking-[0.16em] md:block" style={{ color: SOFTER }}>
            ← → · space · F fullscreen
          </p>

          <button
            type="button"
            onClick={next}
            disabled={index === total - 1}
            className="inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold transition disabled:opacity-30 hover:opacity-90"
            style={{ background: CORAL, color: '#FFFFFF' }}
            aria-label="Next slide"
          >
            <span className="hidden sm:inline">Next</span>
            <IconArrowRight size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}
