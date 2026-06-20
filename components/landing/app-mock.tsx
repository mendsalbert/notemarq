'use client';

import {
  IconBolt,
  IconBookmark,
  IconBrain,
  IconBrandTiktok,
  IconBrandX,
  IconBrandYoutube,
  IconCheck,
  IconClock,
  IconFolders,
  IconLink,
  IconSearch,
  IconSparkles,
} from '@tabler/icons-react';

// Exact tokens from the real app (Colors.light + ExperimentalPalette)
const PAGE = '#F6F4F1';
const CREAM = '#FFFFFF';
const BORDER = '#E8E8F0';
const INK = '#1C1C2E';
const INK_SOFT = 'rgba(28,28,46,0.55)';
const SHADOW = 'rgba(28,28,46,0.07)';
const PRIMARY = '#4FC3F7';    // sky-blue
const LAVENDER = '#F3EEFF';
const LAVENDER_DEEP = '#E8DEFF';
const MINT = '#ECF9F2';
const BLUSH = '#FFF0F3';
const PEACH = '#FFF4EC';
const BUTTER = '#FFF6D6';
const CORAL = '#E8876A';

const card = (bg: string) => ({
  background: bg,
  borderRadius: 22,
  boxShadow: `0 4px 14px ${SHADOW}`,
});

function AppScreen({
  children,
  modal = false,
}: {
  children: React.ReactNode;
  modal?: boolean;
}) {
  return (
    <div className="flex h-full w-full flex-col overflow-hidden" style={{ background: PAGE }}>
      <div className="flex items-center justify-between px-7 pb-1 pt-3.5">
        <span className="font-poppins text-[11px] font-semibold tabular-nums" style={{ color: INK }}>
          9:41
        </span>
        <div className="flex items-center gap-1.5">
          <svg width="16" height="10" viewBox="0 0 16 10" fill="none" aria-hidden>
            <rect x="0" y="6" width="2.5" height="4" rx="0.6" fill={INK} fillOpacity="0.35" />
            <rect x="4" y="4" width="2.5" height="6" rx="0.6" fill={INK} fillOpacity="0.55" />
            <rect x="8" y="2" width="2.5" height="8" rx="0.6" fill={INK} fillOpacity="0.75" />
            <rect x="12" y="0" width="2.5" height="10" rx="0.6" fill={INK} />
          </svg>
          <svg width="14" height="10" viewBox="0 0 14 10" fill="none" aria-hidden>
            <path
              d="M7 1.8C4.8 1.8 2.8 2.8 1.4 4.4L0 3C1.8 1.1 4.3 0 7 0s5.2 1.1 7 3l-1.4 1.4C11.2 2.8 9.2 1.8 7 1.8zM7 5.2c-1.2 0-2.3.5-3.1 1.3L2.5 5.1c1.1-1.1 2.6-1.7 4.2-1.7s3.1.6 4.2 1.7l-1.4 1.4c-.8-.8-1.9-1.3-3.1-1.3zM7 8.4c-.6 0-1.1.2-1.5.6L7 10l1.5-.9c-.4-.4-.9-.7-1.5-.7z"
              fill={INK}
              fillOpacity="0.85"
            />
          </svg>
          <div
            className="flex h-[10px] w-[20px] items-center rounded-[3px] p-px"
            style={{ border: `1px solid ${INK}55` }}
          >
            <div className="h-full w-[72%] rounded-[2px]" style={{ background: INK }} />
          </div>
        </div>
      </div>

      <div className="relative min-h-0 flex-1 overflow-hidden">
        {modal ? (
          <>
            <div
              className="absolute inset-0"
              style={{
                background: `linear-gradient(180deg, ${LAVENDER} 0%, ${PAGE} 55%)`,
                opacity: 0.55,
              }}
            />
            <div className="absolute inset-0 bg-[rgba(28,28,46,0.12)] backdrop-blur-[1px]" />
          </>
        ) : null}
        <div className={`relative h-full ${modal ? 'z-10' : ''}`}>{children}</div>
      </div>

      <div className="flex justify-center pb-2.5 pt-1">
        <div className="h-1 w-[108px] rounded-full" style={{ background: INK, opacity: 0.1 }} />
      </div>
    </div>
  );
}

/** Bookmark library — mirrors the real app home */
export function LibraryMock() {
  const cards = [
    { title: 'App Branding Masterclass', sub: 'youtube', tint: BUTTER, tall: true },
    { title: 'My New Life As a Monk', sub: 'youtube', tint: BLUSH, tall: false },
    { title: 'Claude Mythos: 12-min animated build', sub: 'twitter', tint: LAVENDER, tall: true },
    { title: 'An insane side-hustle opportunity', sub: 'tiktok', tint: MINT, tall: false },
    { title: 'Glucose spikes from fruit, explained', sub: 'tiktok', tint: PEACH, tall: false },
    { title: 'If Alvarez is worth €150m…', sub: 'twitter', tint: LAVENDER, tall: true },
  ];

  function SrcIcon({ s }: { s: string }) {
    if (s === 'youtube') return <IconBrandYoutube size={10} />;
    if (s === 'twitter') return <IconBrandX size={10} />;
    if (s === 'tiktok') return <IconBrandTiktok size={10} />;
    return <IconLink size={10} />;
  }

  return (
    <div className="flex h-full w-full flex-col" style={{ background: PAGE }}>
      {/* header */}
      <div className="flex items-center gap-2.5 px-4 py-3" style={{ background: CREAM, borderBottom: `1px solid ${BORDER}` }}>
        <div className="flex flex-1 items-center gap-2 rounded-full px-3 py-1.5" style={{ background: PAGE }}>
          <IconSearch size={12} style={{ color: INK_SOFT }} />
          <span className="font-poppins text-[10px]" style={{ color: INK_SOFT }}>What are you looking for?</span>
        </div>
        <div className="h-6 w-6 rounded-xl" style={{ background: LAVENDER_DEEP }}>
          <div className="flex h-full items-center justify-center font-poppins text-[9px] font-bold" style={{ color: INK }}>S</div>
        </div>
      </div>

      {/* filter chips */}
      <div className="flex gap-1.5 px-4 pb-2 pt-2.5">
        {[{ l: 'All 13', a: true }, { l: 'YouTube 4', a: false }, { l: 'X 3', a: false }, { l: 'TikTok 6', a: false }].map(c => (
          <span key={c.l} className="rounded-full px-2 py-0.5 font-poppins text-[9px] font-semibold"
            style={c.a ? { background: INK, color: CREAM } : { background: CREAM, color: INK_SOFT, border: `1px solid ${BORDER}` }}>
            {c.l}
          </span>
        ))}
      </div>

      {/* bento grid */}
      <div className="grid flex-1 grid-cols-3 gap-2 overflow-hidden p-4 pt-1.5">
        {cards.map(c => (
          <div key={c.title} className="flex flex-col gap-1.5 self-start p-2" style={card(c.tint)}>
            <span className="inline-flex w-fit items-center gap-1 rounded-full px-1.5 py-0.5 font-poppins text-[8px] font-semibold"
              style={{ background: CREAM, color: INK_SOFT }}>
              <SrcIcon s={c.sub} />
            </span>
            <p className="font-poppins text-[9px] font-bold leading-tight" style={{ color: INK }}>{c.title}</p>
            <div className="w-full rounded-lg" style={{ background: 'rgba(28,28,46,0.05)', height: c.tall ? 46 : 24 }} />
          </div>
        ))}
      </div>
    </div>
  );
}

/** Save a link modal — with context */
export function SaveContextMock() {
  return (
    <AppScreen modal>
      <div className="flex h-full items-center justify-center px-4 pb-2">
        <div
          className="w-full rounded-[24px] p-4"
          style={{ background: CREAM, boxShadow: `0 16px 48px rgba(28,28,46,0.14)` }}
        >
          <div className="flex items-center justify-between">
            <span className="font-poppins text-[13px] font-bold" style={{ color: INK }}>Save a link</span>
            <span className="font-poppins text-[15px]" style={{ color: INK_SOFT }}>×</span>
          </div>

          <div
            className="mt-3.5 flex items-center gap-2 rounded-2xl px-3.5 py-3"
            style={{ background: PAGE, border: `1px solid ${BORDER}` }}
          >
            <IconLink size={13} style={{ color: INK_SOFT }} />
            <span className="font-poppins text-[11px]" style={{ color: INK_SOFT }}>youtube.com/watch?v=…</span>
          </div>

          <div className="mt-3 flex items-center gap-2.5 rounded-2xl p-2.5" style={{ background: BUTTER }}>
            <div className="h-10 w-10 shrink-0 rounded-xl" style={{ background: PEACH }} />
            <div>
              <p className="font-poppins text-[11px] font-bold" style={{ color: INK }}>App Branding Masterclass</p>
              <span
                className="mt-0.5 inline-block rounded-full px-2 py-0.5 font-poppins text-[9px]"
                style={{ background: CREAM, color: INK_SOFT }}
              >
                YouTube
              </span>
            </div>
          </div>

          <div className="mt-3.5 flex items-center justify-between">
            <span className="font-poppins text-[11px] font-semibold" style={{ color: INK }}>Why are you saving this?</span>
            <span
              className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 font-poppins text-[9px] font-semibold"
              style={{ background: LAVENDER, color: PRIMARY }}
            >
              <IconSparkles size={9} /> AI suggest
            </span>
          </div>
          <div className="mt-2 rounded-2xl p-3" style={{ background: PAGE, border: `1px solid ${BORDER}` }}>
            <p className="font-poppins text-[10px] leading-relaxed" style={{ color: INK }}>
              Reference for the rebrand — loved the color system at 4:12. Revisit before Q3 pitch.
            </p>
          </div>

          <div
            className="mt-3.5 flex items-center justify-center gap-1.5 rounded-2xl py-3 font-poppins text-[12px] font-bold"
            style={{ background: PRIMARY, color: INK }}
          >
            <IconCheck size={13} stroke={2.5} /> Save bookmark
          </div>
        </div>
      </div>
    </AppScreen>
  );
}

/** AI auto-organize into folders */
export function AiOrganizeMock() {
  const collections = [
    { name: 'Design & Branding', count: 8, bg: LAVENDER, icon: <IconSparkles size={13} style={{ color: PRIMARY }} /> },
    { name: 'Health & Habits', count: 5, bg: MINT, icon: <IconBolt size={13} style={{ color: CORAL }} /> },
    { name: 'Build Ideas', count: 11, bg: PEACH, icon: <IconBrain size={13} style={{ color: '#7C6AF7' }} /> },
    { name: 'Saved Videos', count: 7, bg: BUTTER, icon: <IconFolders size={13} style={{ color: CORAL }} /> },
  ];

  return (
    <AppScreen>
      <div className="flex h-full flex-col gap-2.5 px-4 pb-2 pt-1">
        <div className="flex items-center gap-2.5 rounded-[20px] px-3.5 py-3" style={{ background: LAVENDER }}>
          <span className="flex h-8 w-8 items-center justify-center rounded-xl" style={{ background: CREAM }}>
            <IconBrain size={15} style={{ color: PRIMARY }} />
          </span>
          <div className="flex-1">
            <span className="font-poppins text-[11px] font-bold" style={{ color: INK }}>AI organized 24 saves</span>
            <p className="font-poppins text-[9px]" style={{ color: INK_SOFT }}>into 4 folders automatically</p>
          </div>
          <IconSparkles size={13} style={{ color: PRIMARY }} />
        </div>

        {collections.map((c) => (
          <div key={c.name} className="flex items-center gap-3 rounded-[20px] p-3" style={card(CREAM)}>
            <span className="flex h-10 w-10 items-center justify-center rounded-xl" style={{ background: c.bg }}>
              {c.icon}
            </span>
            <div className="flex-1">
              <p className="font-poppins text-[11px] font-bold" style={{ color: INK }}>{c.name}</p>
              <p className="font-poppins text-[9px]" style={{ color: INK_SOFT }}>{c.count} saves · auto-tagged</p>
            </div>
            <span className="flex h-7 w-7 items-center justify-center rounded-full" style={{ background: MINT }}>
              <IconCheck size={12} stroke={2.5} style={{ color: '#30D158' }} />
            </span>
          </div>
        ))}
      </div>
    </AppScreen>
  );
}

/** Semantic search — find by meaning */
export function SearchMock() {
  const results = [
    { title: 'App Branding Masterclass', tag: 'YouTube', tint: BUTTER, match: 'color system' },
    { title: 'My New Life As a Monk', tag: 'Article', tint: BLUSH, match: 'monk lifestyle' },
    { title: 'Claude Mythos: animated build', tag: 'X', tint: LAVENDER, match: 'design reference' },
  ];

  return (
    <AppScreen>
      <div className="flex h-full flex-col">
        <div className="px-4 py-3" style={{ background: CREAM, borderBottom: `1px solid ${BORDER}` }}>
          <div className="flex items-center gap-2 rounded-full px-3.5 py-2.5" style={{ background: PRIMARY, color: INK }}>
            <IconSearch size={13} />
            <span className="font-poppins text-[11px] font-semibold">color system rebrand</span>
          </div>
          <p className="mt-2 font-poppins text-[9px]" style={{ color: INK_SOFT }}>3 results · searched by meaning</p>
        </div>

        <div className="flex flex-1 flex-col gap-2.5 p-4">
          {results.map((r) => (
            <div key={r.title} className="rounded-[20px] p-3.5" style={card(r.tint)}>
              <div className="flex items-center justify-between gap-2">
                <p className="font-poppins text-[11px] font-bold leading-tight" style={{ color: INK }}>{r.title}</p>
                <span
                  className="shrink-0 rounded-full px-2 py-0.5 font-poppins text-[8px] font-semibold"
                  style={{ background: CREAM, color: INK_SOFT }}
                >
                  {r.tag}
                </span>
              </div>
              <p className="mt-2 font-poppins text-[9px]" style={{ color: INK_SOFT }}>
                Matched: <span style={{ color: PRIMARY, fontWeight: 600 }}>{r.match}</span>
              </p>
            </div>
          ))}
        </div>
      </div>
    </AppScreen>
  );
}

/** Smart recall — "remember why you saved this" */
export function RecallMock() {
  return (
    <AppScreen modal>
      <div className="flex h-full items-end justify-center px-4 pb-5">
        <div
          className="w-full rounded-[24px] p-4"
          style={{ background: CREAM, boxShadow: `0 16px 48px rgba(28,28,46,0.14)` }}
        >
          <div className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-xl" style={{ background: LAVENDER }}>
              <IconClock size={14} style={{ color: PRIMARY }} />
            </span>
            <span className="font-poppins text-[11px] font-semibold" style={{ color: PRIMARY }}>Remember this?</span>
            <span className="ml-auto font-poppins text-[9px]" style={{ color: INK_SOFT }}>2 weeks ago</span>
          </div>

          <div className="mt-3.5 rounded-[20px] p-3" style={{ background: BUTTER }}>
            <div className="flex items-center gap-2.5">
              <div className="h-9 w-9 shrink-0 rounded-xl" style={{ background: PEACH }} />
              <p className="font-poppins text-[11px] font-bold" style={{ color: INK }}>App Branding Masterclass</p>
            </div>
          </div>

          <div className="mt-3 rounded-[20px] p-3" style={{ background: LAVENDER }}>
            <p className="font-poppins text-[10px] leading-relaxed" style={{ color: INK_SOFT }}>
              You saved this because:{' '}
              <span style={{ color: INK, fontWeight: 600 }}>
                &ldquo;loved the color system — revisit before Q3 pitch.&rdquo;
              </span>
            </p>
          </div>

          <div className="mt-3.5 flex gap-2">
            <span
              className="flex flex-1 items-center justify-center gap-1 rounded-2xl py-2.5 font-poppins text-[11px] font-bold"
              style={{ background: PRIMARY, color: INK }}
            >
              <IconBookmark size={12} /> Open
            </span>
            <span
              className="flex flex-1 items-center justify-center rounded-2xl py-2.5 font-poppins text-[11px] font-semibold"
              style={{ background: PAGE, color: INK_SOFT, border: `1px solid ${BORDER}` }}
            >
              Later
            </span>
          </div>
        </div>
      </div>
    </AppScreen>
  );
}
