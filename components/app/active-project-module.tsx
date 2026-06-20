'use client';

import Link from 'next/link';

import type { ActiveProject } from '@/lib/home-dashboard';
import { useAppColors } from '@/hooks/use-app-colors';

export function ActiveProjectModule({ project }: { project: ActiveProject }) {
  const { colors } = useAppColors();

  return (
    <section
      className="rounded-3xl border p-5"
      style={{ backgroundColor: colors.lavender, borderColor: colors.border }}
    >
      <p className="text-xs font-semibold uppercase tracking-wide opacity-60">Active project</p>
      <h2 className="mt-1 text-lg font-semibold">{project.topic}</h2>
      <p className="mt-1 text-sm opacity-70">{project.count} recent saves</p>
      <div className="mt-4 space-y-2">
        {project.bookmarks.map((bookmark) => (
          <Link
            key={bookmark.id}
            href={`/app/reader/${bookmark.id}`}
            className="block rounded-xl px-3 py-2 text-sm transition hover:opacity-80"
            style={{ backgroundColor: colors.lavenderDeep }}
          >
            {bookmark.saveReason ?? bookmark.title}
          </Link>
        ))}
      </div>
    </section>
  );
}
