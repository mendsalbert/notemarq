'use client';

import Link from 'next/link';
import { IconSkull } from '@tabler/icons-react';

import type { Bookmark } from '@/lib/types';
import { useAppColors } from '@/hooks/use-app-colors';

export function GraveyardModule({ bookmark }: { bookmark: Bookmark }) {
  const { colors } = useAppColors();

  return (
    <section
      className="rounded-3xl border p-5"
      style={{ backgroundColor: colors.graveyardCard, borderColor: colors.border }}
    >
      <div className="flex items-start gap-3">
        <div className="rounded-2xl p-2" style={{ backgroundColor: colors.cardBackground }}>
          <IconSkull size={22} stroke={1.6} />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold">Graveyard rescue</p>
          <p className="mt-1 text-sm opacity-70">
            You saved this {bookmark.dateAdded} but never opened it. Still worth keeping?
          </p>
          <Link
            href={`/app/reader/${bookmark.id}`}
            className="mt-3 inline-flex text-sm font-semibold"
            style={{ color: colors.primary }}
          >
            Review save →
          </Link>
        </div>
      </div>
    </section>
  );
}
