'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { IconClock, IconDots, IconStarFilled, IconTrash } from '@tabler/icons-react';

import { LinkPreviewThumb, SourceIcon } from '@/components/app/link-preview';
import type { Bookmark } from '@/lib/types';
import { useAppColors } from '@/hooks/use-app-colors';
import { useImageAccent } from '@/hooks/use-image-accent';
import { useAppStore } from '@/store/app-store';
import { cn, formatRelativeDate } from '@/lib/utils';

const sourceLabels: Record<string, string> = {
  twitter: 'X',
  youtube: 'YouTube',
  tiktok: 'TikTok',
  article: 'Article',
  other: 'Link',
};

/** Rotating tints when no preview image is available. */
const TINT_KEYS = ['blushDeep', 'peach', 'lavender', 'mint'] as const;

function getDomain(url: string) {
  try {
    return new URL(url).hostname.replace(/^www\./, '');
  } catch {
    return url;
  }
}

interface KeepBookmarkCardProps {
  bookmark: Bookmark;
  variant?: 'grid' | 'list';
  index?: number;
}

export function KeepBookmarkCard({ bookmark, variant = 'grid', index = 0 }: KeepBookmarkCardProps) {
  const { colors } = useAppColors();
  const deleteBookmark = useAppStore((s) => s.deleteBookmark);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const snippet = bookmark.saveReason ?? bookmark.previewText ?? bookmark.summary;
  const domain = getDomain(bookmark.url);
  const relative = formatRelativeDate(bookmark.dateAdded);
  const hasImage = Boolean(bookmark.previewImage);
  const tintKey = TINT_KEYS[index % TINT_KEYS.length];
  const fallbackBg = hasImage ? colors.lavender : (colors[tintKey] as string);
  const cardBg = useImageAccent(hasImage ? bookmark.previewImage : undefined, fallbackBg);

  useEffect(() => {
    if (!menuOpen) return;

    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [menuOpen]);

  async function handleDelete() {
    setMenuOpen(false);
    const confirmed = window.confirm(`Delete "${bookmark.title}"? This cannot be undone.`);
    if (!confirmed) return;
    await deleteBookmark(bookmark.id);
  }

  const menu = (
    <div ref={menuRef} className="relative z-10">
      <button
        type="button"
        className="flex h-7 w-7 items-center justify-center rounded-full transition hover:scale-105"
        style={{ backgroundColor: colors.cream }}
        aria-label="Bookmark options"
        onClick={(event) => {
          event.preventDefault();
          event.stopPropagation();
          setMenuOpen((open) => !open);
        }}
      >
        <IconDots size={15} stroke={2} style={{ color: colors.text }} />
      </button>

      {menuOpen ? (
        <div
          className="absolute right-0 top-9 min-w-[132px] overflow-hidden rounded-2xl py-1"
          style={{
            backgroundColor: colors.cream,
            boxShadow: `0 8px 24px ${colors.cardShadow}`,
            border: `1px solid ${colors.border}`,
          }}
        >
          <button
            type="button"
            className="flex w-full items-center gap-2 px-3 py-2.5 font-poppins text-[13px] font-medium transition hover:opacity-80"
            style={{ color: colors.danger }}
            onClick={() => void handleDelete()}
          >
            <IconTrash size={15} stroke={2} />
            Delete
          </button>
        </div>
      ) : null}
    </div>
  );

  if (variant === 'list') {
    return (
      <div
        className="group relative flex gap-4 rounded-[22px] p-3 transition-all hover:-translate-y-0.5"
        style={{
          backgroundColor: colors.cream,
          boxShadow: `0 4px 16px ${colors.cardShadow}`,
        }}
      >
        <div className="absolute right-3 top-3">{menu}</div>
        <Link href={`/app/reader/${bookmark.id}`} className="flex min-w-0 flex-1 gap-4">
          <LinkPreviewThumb
            previewImage={bookmark.previewImage}
            favicon={bookmark.favicon}
            source={bookmark.source}
            className="h-16 w-16 rounded-2xl"
          />
          <div className="min-w-0 flex-1 pr-8">
            <div className="flex items-start justify-between gap-2">
              <h3 className="line-clamp-1 text-sm font-bold leading-snug">{bookmark.title}</h3>
              {bookmark.isFavorite ? (
                <IconStarFilled size={14} className="shrink-0" style={{ color: colors.cyan }} />
              ) : null}
            </div>
            {snippet ? (
              <p className="mt-1 line-clamp-2 text-[13px] leading-relaxed" style={{ color: colors.inkSoft }}>
                {snippet}
              </p>
            ) : null}
            <div className="mt-2 flex items-center gap-2">
              <span
                className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold"
                style={{ backgroundColor: colors.lavenderDeep, color: colors.text }}
              >
                <SourceIcon source={bookmark.source} size={11} />
                {sourceLabels[bookmark.source] ?? 'Link'}
              </span>
              <span className="text-[11px]" style={{ color: colors.subtitle }}>
                {domain}
              </span>
            </div>
          </div>
        </Link>
      </div>
    );
  }

  return (
    <div
      className={cn(
        'group relative mb-4 block break-inside-avoid overflow-hidden rounded-[28px] transition-all duration-200 hover:-translate-y-1',
      )}
      style={{
        backgroundColor: cardBg,
        boxShadow: `0 5px 18px ${colors.cardShadow}`,
      }}
    >
      <div className="absolute right-3 top-3 z-10">{menu}</div>

      <Link href={`/app/reader/${bookmark.id}`} className="block p-4">
        <div className="flex items-start justify-between gap-2 pr-8">
          <span
            className="inline-flex max-w-[78%] items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-semibold"
            style={{ backgroundColor: colors.cream, color: colors.text }}
          >
            <SourceIcon source={bookmark.source} size={12} />
            <span className="truncate">{sourceLabels[bookmark.source] ?? 'Link'}</span>
          </span>
          <div className="flex shrink-0 items-center gap-1.5">
            {bookmark.isFavorite ? (
              <IconStarFilled size={14} style={{ color: colors.cyan }} />
            ) : null}
          </div>
        </div>

        <h3 className="mt-3 line-clamp-3 text-[15px] font-bold leading-snug" style={{ color: colors.text }}>
          {bookmark.title}
        </h3>

        {hasImage ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={bookmark.previewImage}
            alt=""
            className="mt-3 w-full rounded-2xl object-cover"
            style={{ maxHeight: 180 }}
            loading="lazy"
            referrerPolicy="no-referrer"
          />
        ) : snippet ? (
          <p className="mt-2 line-clamp-4 text-[13px] leading-relaxed" style={{ color: colors.inkSoft }}>
            {snippet}
          </p>
        ) : null}

        <div className="mt-3 flex items-center justify-between gap-2">
          <div className="flex min-w-0 items-center gap-1.5">
            {bookmark.tags.slice(0, 2).map((tag) => (
              <span
                key={tag}
                className="truncate rounded-full px-2.5 py-1 text-[10px] font-medium"
                style={{ backgroundColor: colors.cream, color: colors.inkSoft }}
              >
                {tag}
              </span>
            ))}
          </div>
          {relative ? (
            <span className="flex shrink-0 items-center gap-1 text-[10px]" style={{ color: colors.subtitle }}>
              <IconClock size={11} />
              {relative}
            </span>
          ) : null}
        </div>
      </Link>
    </div>
  );
}
