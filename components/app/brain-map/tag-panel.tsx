'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import { IconX } from '@tabler/icons-react';

import { LinkPreviewThumb } from '@/components/app/link-preview';
import { useAppColors } from '@/hooks/use-app-colors';
import type { Bookmark } from '@/lib/types';

interface BrainMapTagPanelProps {
  tag: string | null;
  color?: string;
  bookmarks: Bookmark[];
  onClose: () => void;
}

export function BrainMapTagPanel({ tag, color, bookmarks, onClose }: BrainMapTagPanelProps) {
  const { colors } = useAppColors();

  const matches = useMemo(
    () => (tag ? bookmarks.filter((b) => b.tags.includes(tag)) : []),
    [bookmarks, tag],
  );

  const relatedTags = useMemo(() => {
    if (!tag) return [];
    const counts = new Map<string, number>();
    for (const b of matches) {
      for (const t of b.tags) {
        if (t !== tag) counts.set(t, (counts.get(t) ?? 0) + 1);
      }
    }
    return [...counts.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6)
      .map(([t]) => t);
  }, [matches, tag]);

  if (!tag) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-end justify-center sm:items-center sm:p-4">
      <button
        type="button"
        className="absolute inset-0 bg-black/30 backdrop-blur-[2px]"
        onClick={onClose}
        aria-label="Close"
      />
      <div
        className="relative z-10 flex max-h-[85vh] w-full max-w-lg flex-col overflow-hidden rounded-t-[28px] sm:rounded-[28px]"
        style={{ backgroundColor: colors.cream }}
      >
        <div className="flex items-center gap-3 border-b px-5 py-4" style={{ borderColor: colors.border }}>
          <div
            className="h-3 w-3 shrink-0 rounded-full"
            style={{ backgroundColor: color ?? colors.cyan }}
          />
          <div className="min-w-0 flex-1">
            <p className="truncate font-poppins text-[17px] font-bold" style={{ color: colors.text }}>
              {tag}
            </p>
            <p className="font-poppins text-[12px] font-medium" style={{ color: colors.inkSoft }}>
              {matches.length} save{matches.length === 1 ? '' : 's'}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full transition hover:opacity-80"
            style={{ backgroundColor: colors.lavenderDeep }}
            aria-label="Close"
          >
            <IconX size={16} stroke={2} />
          </button>
        </div>

        {relatedTags.length > 0 && (
          <div className="flex flex-wrap gap-2 px-5 py-3" style={{ borderBottom: `1px solid ${colors.border}` }}>
            {relatedTags.map((t) => (
              <span
                key={t}
                className="rounded-full px-2.5 py-1 font-poppins text-[11px] font-semibold"
                style={{ backgroundColor: colors.lavender, color: colors.text }}
              >
                {t}
              </span>
            ))}
          </div>
        )}

        <div className="flex-1 overflow-y-auto px-5 py-3">
          {matches.map((bookmark) => (
            <Link
              key={bookmark.id}
              href={`/app/reader/${bookmark.id}`}
              onClick={onClose}
              className="mb-2 flex items-center gap-3 rounded-[18px] p-3 transition hover:-translate-y-0.5"
              style={{ backgroundColor: colors.lavender }}
            >
              <LinkPreviewThumb
                favicon={bookmark.favicon}
                source={bookmark.source}
                previewImage={bookmark.previewImage}
                className="h-11 w-11 shrink-0 rounded-xl"
              />
              <div className="min-w-0 flex-1">
                <p className="line-clamp-2 font-poppins text-[14px] font-bold leading-snug" style={{ color: colors.text }}>
                  {bookmark.title}
                </p>
                {bookmark.saveReason ? (
                  <p className="mt-0.5 line-clamp-1 font-poppins text-[12px]" style={{ color: colors.inkSoft }}>
                    {bookmark.saveReason}
                  </p>
                ) : null}
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
