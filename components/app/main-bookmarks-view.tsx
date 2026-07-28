'use client';

import { IconNote, IconPinFilled, IconSparkles } from '@tabler/icons-react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';

import { KeepBookmarkCard } from '@/components/app/keep-bookmark-card';
import { NoteCard } from '@/components/app/note-card';
import { useAppSearch } from '@/contexts/app-search-context';
import { useAppColors } from '@/hooks/use-app-colors';
import { sortWithPinsFirst } from '@/lib/pin-sort';
import type { Bookmark, BookmarkSource, Note } from '@/lib/types';
import { cn } from '@/lib/utils';
import { useAppStore } from '@/store/app-store';

const PAGE_SIZE = 24;

interface MainBookmarksViewProps {
  filter?: 'all' | 'starred';
}

type HomeFilter = 'all' | 'starred' | 'notes' | BookmarkSource;

const ALWAYS_VISIBLE_FILTERS = new Set<HomeFilter>(['all', 'starred', 'notes', 'twitter', 'youtube']);

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

function parseSourceFilter(raw: string | null): HomeFilter | null {
  if (!raw) return null;
  if (raw === 'x') return 'twitter';
  if (
    raw === 'starred' ||
    raw === 'notes' ||
    raw === 'youtube' ||
    raw === 'twitter' ||
    raw === 'tiktok' ||
    raw === 'article' ||
    raw === 'other'
  ) {
    return raw;
  }
  return null;
}

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
  const searchParams = useSearchParams();
  const bookmarks = useAppStore((s) => s.bookmarks);
  const notes = useAppStore((s) => s.notes);
  const isLoading = useAppStore((s) => s.isLoading);

  const sourceParam = searchParams.get('source');
  const sourceFromUrl = parseSourceFilter(sourceParam);

  const [homeFilter, setHomeFilter] = useState<HomeFilter>(
    sourceFromUrl ?? (filter === 'starred' ? 'starred' : 'all'),
  );
  const [renderedCount, setRenderedCount] = useState(PAGE_SIZE);
  const isNotesFilter = homeFilter === 'notes';

  // Sidebar Import links change ?source= — apply that once per URL change, no remount loops
  useEffect(() => {
    if (!sourceFromUrl) return;
    setHomeFilter(sourceFromUrl);
    setRenderedCount(PAGE_SIZE);
  }, [sourceFromUrl]);

  useEffect(() => {
    setRenderedCount(PAGE_SIZE);
  }, [query, viewMode]);

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

  const unpinnedNotes = useMemo(
    () =>
      homeFilter === 'notes' && !query.trim()
        ? visibleNotes.filter((note) => !note.isPinned)
        : visibleNotes,
    [homeFilter, query, visibleNotes],
  );

  const visibleCount = isNotesFilter ? visibleNotes.length : visibleBookmarks.length;
  const listToRender = isNotesFilter ? unpinnedNotes : unpinnedBookmarks;
  const renderedItems = listToRender.slice(0, renderedCount);
  const remaining = listToRender.length - renderedCount;
  const hasMore = remaining > 0;

  // Keep existing cards visible while the first hydrate finishes in the background
  const showInitialLoading = isLoading && bookmarks.length === 0 && notes.length === 0;

  function selectFilter(next: HomeFilter) {
    setHomeFilter(next);
    setRenderedCount(PAGE_SIZE);
  }

  return (
    <div className="mx-auto w-full max-w-[1400px] px-4 py-5 md:px-6 md:py-6">
      <div className="-mx-1 mb-6 flex gap-2 overflow-x-auto px-1 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {HOME_FILTERS.map((f) => {
          const active = homeFilter === f.id;
          const count = counts[f.id];
          if (!ALWAYS_VISIBLE_FILTERS.has(f.id) && count === 0) return null;
          return (
            <button
              key={f.id}
              type="button"
              onClick={() => selectFilter(f.id)}
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

      {showInitialLoading ? (
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
                : homeFilter === 'twitter'
                  ? 'No X bookmarks yet'
                  : homeFilter === 'youtube'
                    ? 'No YouTube saves yet'
                    : 'Nothing here yet'}
          </p>
          <p className="text-[13px]" style={{ color: colors.inkSoft }}>
            {query.trim()
              ? 'Try a different keyword or tag.'
              : isNotesFilter
                ? 'Create your first note to see it here.'
                : homeFilter === 'twitter'
                  ? 'Connect and sync X in Settings to pull your bookmarks here.'
                  : homeFilter === 'youtube'
                    ? 'Connect and sync YouTube in Settings to pull your saves here.'
                    : 'Save your first link — it belongs on this shelf.'}
          </p>
          {(homeFilter === 'twitter' || homeFilter === 'youtube') && !query.trim() ? (
            <Link
              href={
                homeFilter === 'twitter'
                  ? '/app/settings#import-x'
                  : '/app/settings#import-youtube'
              }
              className="mt-1 rounded-full px-4 py-2 text-[13px] font-semibold transition hover:-translate-y-0.5"
              style={{ backgroundColor: colors.lavenderDeep, color: colors.text }}
            >
              Open import settings
            </Link>
          ) : null}
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
            {(renderedItems as Note[]).map((note, index) => (
              <NoteCard
                key={note.id}
                note={note}
                previews={notePreviews.get(note.id)}
                index={index}
              />
            ))}
          </div>
          {hasMore ? (
            <div className="mt-6 flex justify-center">
              <button
                type="button"
                onClick={() => setRenderedCount((n) => n + PAGE_SIZE)}
                className="rounded-full px-5 py-2.5 font-poppins text-[13px] font-bold transition hover:-translate-y-0.5"
                style={{
                  backgroundColor: colors.lavenderDeep,
                  color: colors.text,
                  boxShadow: `0 2px 8px ${colors.cardShadow}`,
                }}
              >
                Load more ({remaining} left)
              </button>
            </div>
          ) : null}
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
              {(renderedItems as Bookmark[]).map((b, i) => (
                <KeepBookmarkCard key={b.id} bookmark={b} variant="list" index={i} />
              ))}
            </div>
          ) : (
            <div className="columns-1 gap-4 sm:columns-2 lg:columns-3 xl:columns-4">
              {(renderedItems as Bookmark[]).map((b, i) => (
                <KeepBookmarkCard key={b.id} bookmark={b} variant="grid" index={i} />
              ))}
            </div>
          )}
          {hasMore ? (
            <div className="mt-6 flex justify-center">
              <button
                type="button"
                onClick={() => setRenderedCount((n) => n + PAGE_SIZE)}
                className="rounded-full px-5 py-2.5 font-poppins text-[13px] font-bold transition hover:-translate-y-0.5"
                style={{
                  backgroundColor: colors.lavenderDeep,
                  color: colors.text,
                  boxShadow: `0 2px 8px ${colors.cardShadow}`,
                }}
              >
                Load more ({remaining} left)
              </button>
            </div>
          ) : null}
        </>
      )}
    </div>
  );
}
