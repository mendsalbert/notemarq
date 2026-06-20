'use client';

import { useMemo, useState, useEffect } from 'react';
import Link from 'next/link';
import {
  IconSearch,
  IconSparkles,
  IconX,
  IconNote,
} from '@tabler/icons-react';

import { LinkPreviewThumb, SourceIcon } from '@/components/app/link-preview';
import { NoteFace } from '@/components/app/note-face';
import { useAppSearch } from '@/contexts/app-search-context';
import { useAppColors } from '@/hooks/use-app-colors';
import { useAppStore } from '@/store/app-store';
import type { Bookmark, BookmarkSource } from '@/lib/types';
import { resolveNotePalette } from '@/lib/note-palette';
import { cn } from '@/lib/utils';

type SearchFilter = 'all' | 'bookmarks' | 'notes';

const SOURCE_LABELS: Record<BookmarkSource, string> = {
  youtube: 'YouTube',
  twitter: 'X',
  tiktok: 'TikTok',
  article: 'Article',
  other: 'Link',
};

const TAG_TINTS = ['lavenderDeep', 'peach', 'blushDeep', 'mint'] as const;

interface SearchResult {
  id: string;
  kind: 'bookmark' | 'note';
  title: string;
  subtitle?: string;
  source: BookmarkSource | 'note';
  previewImage?: string;
  favicon?: string;
  tags: string[];
  href: string;
  noteColor?: string;
  noteIcon?: string;
}

function stripHtml(html: string) {
  return html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
}

function buildTags(bookmarks: Bookmark[]) {
  const set = new Set<string>();
  for (const b of bookmarks) {
    for (const tag of b.tags) {
      const t = tag.trim();
      if (t) set.add(t);
    }
  }
  return Array.from(set).sort();
}

function highlightMatch(text: string, query: string, highlightColor: string, textColor: string) {
  const q = query.trim();
  if (!q) return <span style={{ color: textColor }}>{text}</span>;

  const lowerText = text.toLowerCase();
  const lowerQuery = q.toLowerCase();
  const index = lowerText.indexOf(lowerQuery);
  if (index < 0) return <span style={{ color: textColor }}>{text}</span>;

  return (
    <span style={{ color: textColor }}>
      {text.slice(0, index)}
      <span className="font-bold" style={{ color: highlightColor }}>{text.slice(index, index + q.length)}</span>
      {text.slice(index + q.length)}
    </span>
  );
}

function SearchResultCard({
  item,
  query,
}: {
  item: SearchResult;
  query: string;
}) {
  const { colors } = useAppColors();
  const isNote = item.kind === 'note';
  const palette = item.noteColor ? resolveNotePalette(item.noteColor, colors) : null;

  return (
    <Link
      href={item.href}
      className="flex gap-3.5 rounded-[22px] p-3.5 transition-all hover:-translate-y-0.5 md:gap-4 md:p-4"
      style={{
        backgroundColor: colors.cream,
        boxShadow: `0 4px 16px ${colors.cardShadow}`,
      }}
    >
      {item.previewImage ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={item.previewImage}
          alt=""
          className="h-14 w-14 shrink-0 rounded-2xl object-cover md:h-16 md:w-16"
          loading="lazy"
          referrerPolicy="no-referrer"
        />
      ) : isNote ? (
        <div
          className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl md:h-16 md:w-16"
          style={{ backgroundColor: palette?.bg ?? colors.lavenderDeep }}
        >
          <NoteFace
            color={palette?.accent ?? colors.primary}
            emoji={item.noteIcon}
            name={item.title}
            size="sm"
            compact
          />
        </div>
      ) : (
        <LinkPreviewThumb
          favicon={item.favicon}
          source={item.source as BookmarkSource}
          className="h-14 w-14 rounded-2xl md:h-16 md:w-16"
        />
      )}

      <div className="min-w-0 flex-1">
        <div className="mb-1.5 flex items-center gap-2">
          <span
            className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 font-poppins text-[11px] font-semibold"
            style={{ backgroundColor: colors.lavenderDeep, color: colors.text }}
          >
            {isNote ? (
              <IconNote size={11} stroke={2} />
            ) : (
              <SourceIcon source={item.source as BookmarkSource} size={11} />
            )}
            {isNote ? 'Note' : SOURCE_LABELS[item.source as BookmarkSource]}
          </span>
        </div>

        <p className="line-clamp-2 font-poppins text-[15px] font-bold leading-snug">
          {highlightMatch(item.title, query, colors.cyan, colors.text)}
        </p>

        {item.subtitle ? (
          <p className="mt-1 line-clamp-2 font-poppins text-[13px] leading-relaxed" style={{ color: colors.inkSoft }}>
            {item.subtitle}
          </p>
        ) : null}

        {item.tags.length > 0 ? (
          <div className="mt-2 flex flex-wrap gap-1.5">
            {item.tags.slice(0, 3).map((tag) => (
              <span
                key={tag}
                className="max-w-[120px] truncate rounded-full px-2.5 py-0.5 font-poppins text-[10px] font-semibold"
                style={{ backgroundColor: colors.lavender, color: colors.text }}
              >
                {tag}
              </span>
            ))}
          </div>
        ) : null}
      </div>
    </Link>
  );
}

export function ExploreView() {
  const { colors } = useAppColors();
  const { query, setQuery } = useAppSearch();
  const bookmarks = useAppStore((s) => s.bookmarks);
  const notes = useAppStore((s) => s.notes);
  const [filter, setFilter] = useState<SearchFilter>('all');

  const searchQuery = query.trim();
  const hasQuery = searchQuery.length > 0;
  const allTags = useMemo(() => buildTags(bookmarks), [bookmarks]);

  useEffect(() => {
    const input = document.getElementById('app-global-search') as HTMLInputElement | null;
    input?.focus();
  }, []);

  const results = useMemo(() => {
    const q = searchQuery.toLowerCase();
    const items: SearchResult[] = [];

    if (!q) return items;

    if (filter === 'all' || filter === 'bookmarks') {
      for (const b of bookmarks) {
        const haystack = [
          b.title,
          b.summary,
          b.saveReason,
          b.personalContext,
          b.url,
          ...b.tags,
        ]
          .filter(Boolean)
          .join(' ')
          .toLowerCase();
        if (!haystack.includes(q)) continue;
        items.push({
          id: b.id,
          kind: 'bookmark',
          title: b.title,
          subtitle: b.saveReason ?? b.previewText ?? b.summary,
          source: b.source,
          previewImage: b.previewImage,
          favicon: b.favicon,
          tags: b.tags,
          href: `/app/reader/${b.id}`,
        });
      }
    }

    if (filter === 'all' || filter === 'notes') {
      for (const n of notes) {
        const body = stripHtml(n.notes ?? '');
        const haystack = [n.name, n.description, body].filter(Boolean).join(' ').toLowerCase();
        if (!haystack.includes(q)) continue;
        items.push({
          id: n.id,
          kind: 'note',
          title: n.name || 'Untitled note',
          subtitle: n.description || body,
          source: 'note',
          tags: [],
          href: `/app/notes/${n.id}`,
          noteColor: n.color,
          noteIcon: n.icon,
        });
      }
    }

    return items;
  }, [bookmarks, notes, searchQuery, filter]);

  const visibleTags = useMemo(() => {
    if (!searchQuery) return allTags;
    const q = searchQuery.toLowerCase();
    return allTags.filter((tag) => tag.toLowerCase().includes(q));
  }, [allTags, searchQuery]);

  return (
    <div className="mx-auto w-full max-w-[1400px] px-4 py-5 md:px-6 md:py-6">
      {/* Filter chips */}
      <div className="mb-5 flex gap-2">
        {(['all', 'bookmarks', 'notes'] as SearchFilter[]).map((id) => {
          const active = filter === id;
          const label = id === 'all' ? 'All' : id === 'bookmarks' ? 'Bookmarks' : 'Notes';
          return (
            <button
              key={id}
              type="button"
              onClick={() => setFilter(id)}
              className={cn(
                'flex flex-1 items-center justify-center rounded-full px-4 py-2.5 font-poppins text-[13px] font-bold transition-all',
              )}
              style={
                active
                  ? { backgroundColor: colors.lavenderDeep, color: colors.text, boxShadow: `0 2px 8px ${colors.cardShadow}` }
                  : { backgroundColor: colors.cream, color: colors.inkSoft }
              }
            >
              {label}
            </button>
          );
        })}
      </div>

      {/* Idle hero */}
      {!hasQuery ? (
        <div className="space-y-6">
          <div
            className="rounded-[28px] p-6 md:p-8"
            style={{
              background: `linear-gradient(135deg, ${colors.lavender} 0%, ${colors.blush} 100%)`,
              boxShadow: `0 8px 28px ${colors.cardShadow}`,
            }}
          >
            <div
              className="mb-4 flex h-13 w-13 items-center justify-center rounded-[18px]"
              style={{ backgroundColor: colors.cream, width: 52, height: 52 }}
            >
              <IconSparkles size={26} stroke={2} style={{ color: colors.text }} />
            </div>
            <h1 className="font-poppins text-[26px] font-bold tracking-tight md:text-[30px]" style={{ color: colors.text }}>
              Find anything you saved
            </h1>
            <p className="mt-2 max-w-lg font-poppins text-[14px] leading-relaxed" style={{ color: colors.inkSoft }}>
              Titles, tags, notes, summaries — even when you only remember the feeling.
            </p>
            {(bookmarks.length > 0 || notes.length > 0) && (
              <div className="mt-5 flex flex-wrap gap-2">
                <span
                  className="rounded-full px-3 py-1.5 font-poppins text-[12px] font-semibold"
                  style={{ backgroundColor: colors.cream, color: colors.text }}
                >
                  {bookmarks.length} bookmarks
                </span>
                <span
                  className="rounded-full px-3 py-1.5 font-poppins text-[12px] font-semibold"
                  style={{ backgroundColor: colors.cream, color: colors.text }}
                >
                  {notes.length} notes
                </span>
              </div>
            )}
          </div>

          {allTags.length > 0 ? (
            <div>
              <p
                className="mb-3 font-poppins text-[11px] font-bold uppercase tracking-widest"
                style={{ color: colors.subtitle }}
              >
                Your tags
              </p>
              <div className="flex flex-wrap gap-2">
                {visibleTags.map((tag, index) => {
                  const tint = TAG_TINTS[index % TAG_TINTS.length];
                  return (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => setQuery(tag)}
                      className="rounded-full px-3.5 py-2 font-poppins text-[13px] font-semibold transition hover:scale-[1.02]"
                      style={{ backgroundColor: colors[tint], color: colors.text }}
                    >
                      {tag}
                    </button>
                  );
                })}
              </div>
            </div>
          ) : bookmarks.length === 0 && notes.length === 0 ? (
            <div
              className="rounded-[24px] p-6 text-center"
              style={{ backgroundColor: colors.cream, boxShadow: `0 2px 10px ${colors.cardShadow}` }}
            >
              <p className="font-poppins text-[15px] font-bold" style={{ color: colors.text }}>
                Your library is quiet
              </p>
              <p className="mt-2 font-poppins text-[14px] leading-relaxed" style={{ color: colors.inkSoft }}>
                Save a bookmark or jot a note — search gets smarter as you go.
              </p>
            </div>
          ) : null}

          <p className="text-center font-poppins text-[13px]" style={{ color: colors.subtitle }}>
            Use the search bar above to start exploring
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="font-poppins text-[13px] font-medium" style={{ color: colors.inkSoft }}>
              {results.length} result{results.length === 1 ? '' : 's'}
            </p>
            <button
              type="button"
              onClick={() => setQuery('')}
              className="inline-flex items-center gap-1 rounded-full px-3 py-1 font-poppins text-[12px] font-semibold transition hover:opacity-80"
              style={{ backgroundColor: colors.lavenderDeep, color: colors.text }}
            >
              <IconX size={13} stroke={2} />
              Clear
            </button>
          </div>

          {results.length === 0 ? (
            <div
              className="flex flex-col items-center rounded-[28px] px-6 py-12 text-center"
              style={{ backgroundColor: colors.cream, boxShadow: `0 4px 16px ${colors.cardShadow}` }}
            >
              <div
                className="mb-4 flex h-13 w-13 items-center justify-center rounded-[18px]"
                style={{ backgroundColor: colors.lavender, width: 52, height: 52 }}
              >
                <IconSearch size={22} stroke={2} style={{ color: colors.inkSoft }} />
              </div>
              <p className="font-poppins text-[15px] font-bold" style={{ color: colors.text }}>
                Nothing matched &ldquo;{searchQuery}&rdquo;
              </p>
              <p className="mt-2 max-w-sm font-poppins text-[14px] leading-relaxed" style={{ color: colors.inkSoft }}>
                Try a tag, a phrase from a summary, or describe what you remember.
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-2.5">
              {results.map((item) => (
                <SearchResultCard key={`${item.kind}-${item.id}`} item={item} query={searchQuery} />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
