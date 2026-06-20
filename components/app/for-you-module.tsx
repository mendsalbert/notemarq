'use client';

import Link from 'next/link';

import type { Bookmark } from '@/lib/types';
import { useAppColors } from '@/hooks/use-app-colors';

export function ForYouModule({ featured }: { featured?: Bookmark }) {
  const { colors } = useAppColors();
  if (!featured) return null;

  return (
    <section
      className="rounded-3xl border p-5"
      style={{ backgroundColor: colors.blush, borderColor: colors.border }}
    >
      <p className="text-xs font-semibold uppercase tracking-wide opacity-60">For you</p>
      <h2 className="mt-2 text-xl font-semibold leading-snug">{featured.title}</h2>
      <p className="mt-3 line-clamp-3 text-sm leading-relaxed opacity-70">
        {featured.saveReason ?? featured.summary}
      </p>
      <Link
        href={`/app/reader/${featured.id}`}
        className="mt-4 inline-flex rounded-full px-4 py-2 text-sm font-semibold"
        style={{ backgroundColor: colors.primary, color: colors.onAccent }}
      >
        Open save
      </Link>
    </section>
  );
}
