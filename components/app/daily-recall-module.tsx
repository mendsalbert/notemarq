'use client';

import Link from 'next/link';
import { IconChevronRight } from '@tabler/icons-react';

import type { RecallWindow } from '@/lib/home-dashboard';
import { useAppColors } from '@/hooks/use-app-colors';

export function DailyRecallModule({ items }: { items: RecallWindow[] }) {
  const { colors } = useAppColors();
  if (!items.length) return null;

  return (
    <section>
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-lg font-semibold">Daily recall</h2>
        <Link href="/app/explore" className="text-sm font-medium" style={{ color: colors.primary }}>
          Search
        </Link>
      </div>
      <div className="flex gap-3 overflow-x-auto pb-1">
        {items.map((item) => (
          <Link
            key={item.bookmark.id}
            href={`/app/reader/${item.bookmark.id}`}
            className="min-w-[240px] rounded-2xl border p-4 transition hover:opacity-90"
            style={{ backgroundColor: colors.recallCard, borderColor: colors.border }}
          >
            <p className="text-xs font-semibold uppercase tracking-wide opacity-60">{item.label}</p>
            <p className="mt-2 line-clamp-2 text-sm font-semibold leading-snug">
              {item.bookmark.saveReason ?? item.bookmark.title}
            </p>
            <span className="mt-3 inline-flex items-center gap-1 text-xs font-medium" style={{ color: colors.primary }}>
              Revisit <IconChevronRight size={14} />
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}
