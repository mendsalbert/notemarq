'use client';

import { useEffect, useMemo, useState } from 'react';
import { IconBookmark, IconFlame, IconNote, IconPinFilled, IconSparkles } from '@tabler/icons-react';

import { KeepBookmarkCard } from '@/components/app/keep-bookmark-card';
import { NoteCard } from '@/components/app/note-card';
import { useAppSearch } from '@/contexts/app-search-context';
import { useAppColors } from '@/hooks/use-app-colors';
import { getSocialStats } from '@/lib/home-dashboard';
import { sortWithPinsFirst } from '@/lib/pin-sort';
import { useAppStore } from '@/store/app-store';
import type { Bookmark, BookmarkSource, Note } from '@/lib/types';
import { cn } from '@/lib/utils';

const BOOKMARK_GOAL_KEY = 'notemarq-web-weekly-bookmark-goal';
const NOTE_GOAL_KEY = 'notemarq-web-weekly-note-goal';

function readGoal(key: string, fallback: number) {
  if (typeof window === 'undefined') return fallback;
  const raw = localStorage.getItem(key);
  const n = raw ? Number(raw) : fallback;
  return Number.isFinite(n) && n > 0 ? n : fallback;
}

function startOfWeek(date: Date) {
  const d = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const day = d.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

function ProgressRing({
  percent,
  color,
  trackColor,
  size = 68,
  stroke = 5,
}: {
  percent: number;
  color: string;
  trackColor: string;
  size?: number;
  stroke?: number;
}) {
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const clamped = Math.max(0, Math.min(1, percent));
  const offset = circumference * (1 - clamped);
  return (
    <svg width={size} height={size} className="block">
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke={trackColor}
        strokeWidth={stroke}
      />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke={color}
        strokeWidth={stroke}
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        strokeLinecap="round"
        transform={`rotate(-90 ${size / 2} ${size / 2})`}
        style={{ transition: 'stroke-dashoffset 600ms ease' }}
      />
    </svg>
  );
}

function WeeklyGoalCard({
  saves,
  notes,
  streak,
  saveGoal,
  noteGoal,
}: {
  saves: number;
  notes: number;
  streak: number;
  saveGoal: number;
  noteGoal: number;
}) {
  const { colors, isDark } = useAppColors();

  const ringTrack = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(28,28,46,0.07)';
  const blue = '#4FC3F7';
  const green = '#22C55E';
  const orange = '#F59E0B';

  const totalGoal = saveGoal + noteGoal;
  const totalThisWeek = saves + notes;

  return (
    <div
      className="mx-auto mt-6 w-full max-w-[440px] rounded-[32px] p-6"
      style={{
        backgroundColor: colors.cream,
        border: `1px solid ${colors.border}`,
        boxShadow: `0 10px 30px ${colors.cardShadow}`,
      }}
    >
      {/* Header */}
      <p
        className="text-[11px] font-semibold uppercase"
        style={{ color: colors.subtitle, letterSpacing: '0.14em' }}
      >
        Total this week
      </p>

      {/* Main row: big number + flame */}
      <div className="mt-2 flex items-start justify-between">
        <div className="flex items-baseline gap-2">
          <span
            className="text-[44px] font-bold leading-none tracking-tight"
            style={{ color: colors.text }}
          >
            {totalThisWeek.toLocaleString()}
          </span>
          <span className="text-[22px] font-medium" style={{ color: colors.subtitle }}>
            saves
          </span>
        </div>
        <div className="flex h-12 w-12 items-center justify-center">
          <IconFlame size={44} stroke={1.6} style={{ color: orange }} />
        </div>
      </div>

      {/* Goal subtitle */}
      <p className="mt-2 text-[15px]" style={{ color: colors.inkSoft }}>
        Goal: {totalGoal.toLocaleString()} saves
      </p>

      {/* Divider */}
      <div className="my-5 h-px w-full" style={{ backgroundColor: colors.border }} />

      {/* Progress rings */}
      <div className="grid grid-cols-3 gap-2">
        <RingStat
          color={blue}
          trackColor={ringTrack}
          icon={<IconBookmark size={16} stroke={2} style={{ color: blue }} />}
          label="Saves"
          value={saves}
          goal={saveGoal}
        />
        <RingStat
          color={green}
          trackColor={ringTrack}
          icon={<IconNote size={16} stroke={2} style={{ color: green }} />}
          label="Notes"
          value={notes}
          goal={noteGoal}
        />
        <RingStat
          color={orange}
          trackColor={ringTrack}
          icon={<IconFlame size={16} stroke={2} style={{ color: orange }} />}
          label="Streak"
          value={streak}
          goal={7}
          unit="d"
        />
      </div>
    </div>
  );
}

function RingStat({
  color,
  trackColor,
  icon,
  label,
  value,
  goal,
  unit,
}: {
  color: string;
  trackColor: string;
  icon: React.ReactNode;
  label: string;
  value: number;
  goal: number;
  unit?: string;
}) {
  const { colors } = useAppColors();
  const percent = goal > 0 ? value / goal : 0;
  return (
    <div className="flex flex-col items-center gap-2">
      <ProgressRing percent={percent} color={color} trackColor={trackColor} />
      <div className="flex items-center gap-1.5">
        {icon}
        <span className="text-[14px] font-medium" style={{ color: colors.text }}>
          {label}
        </span>
      </div>
      <span className="text-[13px]" style={{ color: colors.inkSoft }}>
        {value}
        {unit ?? ''}/{goal}
        {unit ?? ''}
      </span>
    </div>
  );
}

interface MainBookmarksViewProps {
  filter?: 'all' | 'starred';
}

type HomeFilter = 'all' | 'starred' | 'notes' | BookmarkSource;

const HOME_FILTERS: { id: HomeFilter; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'starred', label: 'Starred' },
  { id: 'notes', label: 'Notes' },
  { id: 'youtube', label: 'YouTube' },
  { id: 'twitter', label: 'X' },
  { id: 'tiktok', label: 'TikTok' },
  { id: 'article', label: 'Articles' },
  { id: 'other', label: 'Links' },
];

function filterBookmarks(bookmarks: Bookmark[], query: string) {
  const q = query.trim().toLowerCase();
  if (!q) return bookmarks;
  return bookmarks.filter(
    (b) =>
      b.title.toLowerCase().includes(q) ||
      b.summary.toLowerCase().includes(q) ||
      b.saveReason?.toLowerCase().includes(q) ||
      b.personalContext?.toLowerCase().includes(q) ||
      b.url.toLowerCase().includes(q) ||
      b.tags.some((t) => t.toLowerCase().includes(q)),
  );
}

function filterNotes(notes: Note[], query: string) {
  const q = query.trim().toLowerCase();
  const sorted = sortWithPinsFirst(
    notes,
    (note) => note.isPinned,
    (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
  );
  if (!q) return sorted;
  return sorted.filter(
    (note) =>
      note.name.toLowerCase().includes(q) ||
      note.description.toLowerCase().includes(q) ||
      note.notes?.toLowerCase().includes(q),
  );
}

export function MainBookmarksView({ filter = 'all' }: MainBookmarksViewProps) {
  const { colors } = useAppColors();
  const { query, viewMode } = useAppSearch();
  const bookmarks = useAppStore((s) => s.bookmarks);
  const notes = useAppStore((s) => s.notes);
  const isLoading = useAppStore((s) => s.isLoading);

  const [homeFilter, setHomeFilter] = useState<HomeFilter>(
    filter === 'starred' ? 'starred' : 'all',
  );

  const isNotesFilter = homeFilter === 'notes';

  const stats = useMemo(() => getSocialStats(bookmarks), [bookmarks]);

  const notePreviews = useMemo(() => {
    const bookmarkById = new Map(bookmarks.map((bookmark) => [bookmark.id, bookmark]));
    const map = new Map<string, Bookmark[]>();
    for (const note of notes) {
      const items = note.bookmarks
        .map((id) => bookmarkById.get(id))
        .filter((bookmark): bookmark is Bookmark => Boolean(bookmark))
        .slice(0, 3);
      map.set(note.id, items);
    }
    return map;
  }, [notes, bookmarks]);

  const counts = useMemo(() => {
    const base: Record<HomeFilter, number> = {
      all: bookmarks.length,
      starred: bookmarks.filter((b) => b.isFavorite).length,
      notes: notes.length,
      youtube: 0,
      twitter: 0,
      tiktok: 0,
      article: 0,
      other: 0,
    };
    for (const b of bookmarks) base[b.source] += 1;
    return base;
  }, [bookmarks, notes]);

  const visibleBookmarks = useMemo(() => {
    let list = filterBookmarks(bookmarks, query);
    if (homeFilter === 'starred') list = list.filter((b) => b.isFavorite);
    else if (homeFilter !== 'all' && homeFilter !== 'notes') {
      list = list.filter((b) => b.source === homeFilter);
    }
    return sortWithPinsFirst(
      list,
      (item) => item.isPinned,
      (a, b) => new Date(b.dateAdded).getTime() - new Date(a.dateAdded).getTime(),
    );
  }, [bookmarks, query, homeFilter]);

  const visibleNotes = useMemo(
    () => (isNotesFilter ? filterNotes(notes, query) : []),
    [isNotesFilter, notes, query],
  );

  const pinnedBookmarks = useMemo(
    () => visibleBookmarks.filter((bookmark) => bookmark.isPinned),
    [visibleBookmarks],
  );

  const pinnedNotes = useMemo(
    () => visibleNotes.filter((note) => note.isPinned),
    [visibleNotes],
  );

  const unpinnedBookmarks = useMemo(
    () => (homeFilter === 'all' ? visibleBookmarks.filter((bookmark) => !bookmark.isPinned) : visibleBookmarks),
    [homeFilter, visibleBookmarks],
  );

  const visibleCount = isNotesFilter ? visibleNotes.length : visibleBookmarks.length;

  const [saveGoal, setSaveGoal] = useState(5);
  const [noteGoal, setNoteGoal] = useState(3);
  useEffect(() => {
    setSaveGoal(readGoal(BOOKMARK_GOAL_KEY, 5));
    setNoteGoal(readGoal(NOTE_GOAL_KEY, 3));
  }, []);

  const weeklyTotals = useMemo(() => {
    const weekStart = startOfWeek(new Date());
    const savesThisWeek = bookmarks.filter(
      (b) => new Date(`${b.dateAdded}T12:00:00`) >= weekStart,
    ).length;
    const notesThisWeek = notes.filter(
      (n) => new Date(n.createdAt) >= weekStart,
    ).length;
    return { savesThisWeek, notesThisWeek };
  }, [bookmarks, notes]);

  return (
    <div className="mx-auto w-full max-w-[1400px] px-4 py-5 md:px-6 md:py-6">
      {/* Filter chips */}
      <div className="-mx-1 mb-6 flex gap-2 overflow-x-auto px-1 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {HOME_FILTERS.map((f) => {
          const active = homeFilter === f.id;
          const count = counts[f.id];
          if (f.id !== 'all' && f.id !== 'starred' && f.id !== 'notes' && count === 0) return null;
          return (
            <button
              key={f.id}
              type="button"
              onClick={() => setHomeFilter(f.id)}
              className={cn(
                'flex shrink-0 items-center gap-1.5 rounded-full px-4 py-2 text-[13px] font-semibold transition hover:scale-[1.02]',
              )}
              style={
                active
                  ? { backgroundColor: colors.inverted, color: colors.invertedText }
                  : { border: `1.5px solid ${colors.border}`, color: colors.text }
              }
            >
              {f.label}
              <span style={{ color: active ? colors.invertedText : colors.subtitle, opacity: active ? 0.7 : 1 }}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Content */}
      {isLoading ? (
        <p className="py-16 text-center text-sm" style={{ color: colors.inkSoft }}>
          Loading your shelf…
        </p>
      ) : visibleCount === 0 ? (
        <div
          className="mx-auto flex max-w-md flex-col items-center gap-3 rounded-[28px] p-10 text-center"
          style={{ backgroundColor: colors.peach, boxShadow: `0 5px 18px ${colors.cardShadow}` }}
        >
          <div
            className="flex h-12 w-12 items-center justify-center rounded-2xl"
            style={{ backgroundColor: colors.cream }}
          >
            {isNotesFilter ? (
              <IconNote size={22} stroke={2} style={{ color: colors.cyan }} />
            ) : (
              <IconSparkles size={22} style={{ color: colors.cyan }} />
            )}
          </div>
          <p className="text-[15px] font-bold">
            {query.trim()
              ? 'Nothing matches that search'
              : isNotesFilter
                ? 'No notes yet'
                : 'Nothing here yet'}
          </p>
          <p className="text-[13px]" style={{ color: colors.inkSoft }}>
            {query.trim()
              ? 'Try a different keyword or tag.'
              : isNotesFilter
                ? 'Create your first note to see it here.'
                : 'Save your first link — it belongs on this shelf.'}
          </p>
        </div>
      ) : isNotesFilter ? (
        <>
          {pinnedNotes.length > 0 && !query.trim() ? (
            <section className="mb-8">
              <div className="mb-3 flex items-center gap-2">
                <IconPinFilled size={16} stroke={2} style={{ color: colors.cyan }} />
                <h2 className="font-poppins text-[15px] font-bold" style={{ color: colors.text }}>
                  Pinned
                </h2>
              </div>
              <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-4">
                {pinnedNotes.map((note, index) => (
                  <NoteCard
                    key={note.id}
                    note={note}
                    previews={notePreviews.get(note.id)}
                    index={index}
                  />
                ))}
              </div>
            </section>
          ) : null}
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-4">
            {(homeFilter === 'notes' && !query.trim()
              ? visibleNotes.filter((note) => !note.isPinned)
              : visibleNotes
            ).map((note, index) => (
              <NoteCard
                key={note.id}
                note={note}
                previews={notePreviews.get(note.id)}
                index={index}
              />
            ))}
          </div>
        </>
      ) : (
        <>
          {pinnedBookmarks.length > 0 && homeFilter === 'all' && !query.trim() ? (
            <section className="mb-8">
              <div className="mb-3 flex items-center gap-2">
                <IconPinFilled size={16} stroke={2} style={{ color: colors.cyan }} />
                <h2 className="font-poppins text-[15px] font-bold" style={{ color: colors.text }}>
                  Pinned
                </h2>
              </div>
              {viewMode === 'list' ? (
                <div className="mx-auto flex max-w-3xl flex-col gap-2.5">
                  {pinnedBookmarks.map((b, i) => (
                    <KeepBookmarkCard key={b.id} bookmark={b} variant="list" index={i} />
                  ))}
                </div>
              ) : (
                <div className="columns-1 gap-4 sm:columns-2 lg:columns-3 xl:columns-4">
                  {pinnedBookmarks.map((b, i) => (
                    <KeepBookmarkCard key={b.id} bookmark={b} variant="grid" index={i} />
                  ))}
                </div>
              )}
            </section>
          ) : null}

          {viewMode === 'list' ? (
            <div className="mx-auto flex max-w-3xl flex-col gap-2.5">
              {unpinnedBookmarks.map((b, i) => (
                <KeepBookmarkCard key={b.id} bookmark={b} variant="list" index={i} />
              ))}
            </div>
          ) : (
            <div className="columns-1 gap-4 sm:columns-2 lg:columns-3 xl:columns-4">
              {unpinnedBookmarks.map((b, i) => (
                <KeepBookmarkCard key={b.id} bookmark={b} variant="grid" index={i} />
              ))}
            </div>
          )}

          {/* Weekly goal card */}
          <WeeklyGoalCard
            saves={weeklyTotals.savesThisWeek}
            notes={weeklyTotals.notesThisWeek}
            streak={stats.streak}
            saveGoal={saveGoal}
            noteGoal={noteGoal}
          />
        </>
      )}
    </div>
  );
}
