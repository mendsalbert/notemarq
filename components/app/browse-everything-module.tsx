'use client';

import Link from 'next/link';
import { IconBookmark, IconFolder, IconNote } from '@tabler/icons-react';

import { useAppColors } from '@/hooks/use-app-colors';
import { useAppStore } from '@/store/app-store';

export function BrowseEverythingModule() {
  const { colors } = useAppColors();
  const bookmarks = useAppStore((s) => s.bookmarks);
  const notes = useAppStore((s) => s.notes);
  const folders = useAppStore((s) => s.folders);

  const items = [
    { href: '/app', label: 'Bookmarks', count: bookmarks.length, icon: IconBookmark },
    { href: '/app/notes', label: 'Notes', count: notes.length, icon: IconNote },
    { href: '/app/folders', label: 'Folders', count: folders.length, icon: IconFolder },
  ];

  return (
    <section>
      <h2 className="mb-3 text-lg font-semibold">Browse everything</h2>
      <div className="grid gap-3 sm:grid-cols-3">
        {items.map(({ href, label, count, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className="flex items-center gap-3 rounded-2xl border p-4 transition hover:opacity-90"
            style={{ backgroundColor: colors.cardBackground, borderColor: colors.border }}
          >
            <div
              className="rounded-xl p-2.5"
              style={{ backgroundColor: colors.moduleTodayBackground, color: colors.primary }}
            >
              <Icon size={20} stroke={1.8} />
            </div>
            <div>
              <p className="font-semibold">{label}</p>
              <p className="text-sm opacity-60">{count} items</p>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
