'use client';

import Link from 'next/link';
import { IconExternalLink } from '@tabler/icons-react';

import { LinkPreviewThumb } from '@/components/app/link-preview';
import type { Bookmark } from '@/lib/types';
import { useAppColors } from '@/hooks/use-app-colors';

const sourceLabels: Record<string, string> = {
  twitter: 'X',
  youtube: 'YouTube',
  tiktok: 'TikTok',
  article: 'Article',
  other: 'Link',
};

export function BookmarkCard({ bookmark }: { bookmark: Bookmark }) {
  const { colors } = useAppColors();
  const reason = bookmark.saveReason ?? bookmark.summary;
  const snippet = bookmark.previewText ?? reason;

  return (
    <Link
      href={`/app/reader/${bookmark.id}`}
      className="group block overflow-hidden rounded-2xl border transition hover:opacity-90"
      style={{ backgroundColor: colors.cardBackground, borderColor: colors.border }}
    >
      {bookmark.previewImage ? (
        <LinkPreviewThumb
          previewImage={bookmark.previewImage}
          source={bookmark.source}
          className="h-28 w-full rounded-none"
        />
      ) : null}

      <div className="flex gap-3 p-4">
        {!bookmark.previewImage ? (
          <LinkPreviewThumb
            favicon={bookmark.favicon}
            source={bookmark.source}
            className="h-14 w-14"
          />
        ) : null}

        <div className="min-w-0 flex-1">
          <div className="mb-2 flex items-center justify-between gap-2">
            <span
              className="rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide"
              style={{ backgroundColor: colors.moduleTodayBackground, color: colors.primary }}
            >
              {sourceLabels[bookmark.source] ?? 'Link'}
            </span>
            <IconExternalLink size={14} className="opacity-0 transition group-hover:opacity-50" />
          </div>
          <h3 className="line-clamp-2 text-sm font-semibold leading-snug">{bookmark.title}</h3>
          {snippet ? (
            <p className="mt-2 line-clamp-2 text-sm leading-relaxed opacity-60">{snippet}</p>
          ) : null}
          {bookmark.tags[0] ? (
            <span
              className="mt-2 inline-block rounded-full px-2 py-0.5 text-[11px] font-medium opacity-70"
              style={{ backgroundColor: colors.moduleTodayBackground }}
            >
              {bookmark.tags[0]}
            </span>
          ) : null}
        </div>
      </div>
    </Link>
  );
}
