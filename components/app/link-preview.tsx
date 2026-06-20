'use client';

import {
  IconBrandTiktok,
  IconBrandX,
  IconBrandYoutube,
  IconWorld,
} from '@tabler/icons-react';

import { useAppColors } from '@/hooks/use-app-colors';
import type { BookmarkSource } from '@/lib/types';

export function SourceIcon({ source, size = 16 }: { source: BookmarkSource; size?: number }) {
  switch (source) {
    case 'youtube':
      return <IconBrandYoutube size={size} />;
    case 'twitter':
      return <IconBrandX size={size} />;
    case 'tiktok':
      return <IconBrandTiktok size={size} />;
    default:
      return <IconWorld size={size} />;
  }
}

export function LinkPreviewThumb({
  previewImage,
  favicon,
  source,
  className = '',
}: {
  previewImage?: string;
  favicon?: string;
  source: BookmarkSource;
  className?: string;
}) {
  const { colors } = useAppColors();

  if (previewImage) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={previewImage}
        alt=""
        className={`shrink-0 rounded-xl object-cover ${className}`}
        loading="lazy"
        referrerPolicy="no-referrer"
      />
    );
  }

  return (
    <div
      className={`flex shrink-0 items-center justify-center rounded-xl ${className}`}
      style={{ backgroundColor: colors.moduleTodayBackground }}
    >
      {favicon ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={favicon} alt="" className="h-5 w-5 rounded-sm object-contain" referrerPolicy="no-referrer" />
      ) : (
        <SourceIcon source={source} size={18} />
      )}
    </div>
  );
}

export function LinkPreviewHero({
  previewImage,
  title,
}: {
  previewImage?: string;
  title: string;
}) {
  if (!previewImage) return null;

  return (
    <div className="overflow-hidden rounded-2xl border">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={previewImage}
        alt={title}
        className="aspect-[2/1] w-full object-cover"
        loading="lazy"
        referrerPolicy="no-referrer"
      />
    </div>
  );
}
