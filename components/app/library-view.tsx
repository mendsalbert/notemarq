'use client';

import { useMemo, useState } from 'react';
import { IconFolder, IconNote, IconSearch, IconLibrary } from '@tabler/icons-react';
import Link from 'next/link';

import { KeepBookmarkCard } from '@/components/app/keep-bookmark-card';
import { useAppColors } from '@/hooks/use-app-colors';
import { useAppStore } from '@/store/app-store';

type LibraryTab = 'bookmarks' | 'notes' | 'folders';

export function LibraryView() {
  const { colors } = useAppColors();
  const bookmarks = useAppStore((s) => s.bookmarks);
  const notes = useAppStore((s) => s.notes);
  const folders = useAppStore((s) => s.folders);
  const isLoading = useAppStore((s) => s.isLoading);
  const [tab, setTab] = useState<LibraryTab>('bookmarks');
  const [query, setQuery] = useState('');

  const filteredBookmarks = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return bookmarks;
    return bookmarks.filter(
      (b) =>
        b.title.toLowerCase().includes(q) ||
        b.summary.toLowerCase().includes(q) ||
        b.saveReason?.toLowerCase().includes(q) ||
        b.url.toLowerCase().includes(q),
    );
  }, [bookmarks, query]);

  const filteredNotes = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return notes;
    return notes.filter(
      (n) =>
        n.name.toLowerCase().includes(q) ||
        n.description.toLowerCase().includes(q) ||
        n.notes?.toLowerCase().includes(q),
    );
  }, [notes, query]);

  const tabs: { id: LibraryTab; label: string; count: number }[] = [
    { id: 'bookmarks', label: 'Bookmarks', count: bookmarks.length },
    { id: 'notes', label: 'Notes', count: notes.length },
    { id: 'folders', label: 'Folders', count: folders.length },
  ];

  return (
    <div className="mx-auto max-w-5xl px-3 py-5 md:px-4 md:py-6">
      {/* Header Module */}
      <div
        className="mb-6 rounded-[28px] p-6 md:p-7"
        style={{
          backgroundColor: colors.cream,
          boxShadow: `0 2px 12px ${colors.cardShadow}`,
        }}
      >
        <div className="flex items-center gap-3">
          <div
            className="flex h-12 w-12 items-center justify-center rounded-2xl"
            style={{ backgroundColor: colors.lavender }}
          >
            <IconLibrary size={24} stroke={2.2} style={{ color: colors.primary }} />
          </div>
          <div>
            <h1 className="text-2xl font-bold" style={{ fontFamily: 'var(--font-poppins)' }}>
              Library
            </h1>
            <p className="mt-0.5 text-sm font-medium" style={{ color: colors.inkSoft }}>
              All your bookmarks, notes, and folders
            </p>
          </div>
        </div>
      </div>

      {/* Filter Chips */}
      <div className="mb-5 flex gap-2 overflow-x-auto pb-1">
        {tabs.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className="shrink-0 rounded-full px-5 py-2.5 text-sm font-bold transition-all"
            style={{
              fontFamily: 'var(--font-poppins)',
              backgroundColor: tab === t.id ? colors.primary : colors.cream,
              color: tab === t.id ? '#FFFFFF' : colors.text,
              boxShadow: tab === t.id ? `0 2px 8px ${colors.cardShadow}` : 'none',
            }}
          >
            {t.label} · {t.count}
          </button>
        ))}
      </div>

      {/* Search Bar */}
      <div
        className="relative mb-6 rounded-2xl"
        style={{
          backgroundColor: colors.cream,
          boxShadow: `0 2px 8px ${colors.cardShadow}`,
        }}
      >
        <IconSearch
          className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2"
          size={17}
          stroke={2}
          style={{ color: colors.inkSoft }}
        />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search library…"
          className="w-full rounded-2xl border-0 py-3 pl-11 pr-4 text-sm font-medium outline-none"
          style={{
            fontFamily: 'var(--font-poppins)',
            backgroundColor: 'transparent',
            color: colors.text,
          }}
        />
      </div>

      {/* Content */}
      {isLoading ? (
        <p className="text-sm font-medium" style={{ color: colors.inkSoft }}>
          Loading…
        </p>
      ) : tab === 'bookmarks' ? (
        filteredBookmarks.length ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filteredBookmarks.map((b) => (
              <KeepBookmarkCard key={b.id} bookmark={b} variant="grid" />
            ))}
          </div>
        ) : (
          <Empty label="No bookmarks yet" />
        )
      ) : tab === 'notes' ? (
        filteredNotes.length ? (
          <div className="grid gap-4 sm:grid-cols-2">
            {filteredNotes.map((note) => (
              <Link
                key={note.id}
                href={`/app/notes/${note.id}`}
                className="rounded-[28px] p-5 transition-all hover:-translate-y-1"
                style={{
                  backgroundColor: colors.lavender,
                  boxShadow: `0 2px 12px ${colors.cardShadow}`,
                }}
              >
                <div className="flex items-start gap-3">
                  <span className="text-3xl">{note.icon}</span>
                  <div className="min-w-0 flex-1">
                    <p className="font-bold" style={{ fontFamily: 'var(--font-poppins)', color: colors.text }}>
                      {note.name}
                    </p>
                    <p className="mt-1.5 line-clamp-2 text-sm font-medium" style={{ color: colors.inkSoft }}>
                      {note.description || note.notes || 'Empty note'}
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <Empty label="No notes yet" icon={IconNote} />
        )
      ) : folders.length ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {folders.map((folder) => (
            <Link
              key={folder.id}
              href={`/app/folders/${folder.id}`}
              className="rounded-[28px] p-5 transition-all hover:-translate-y-1"
              style={{
                backgroundColor: colors.blush,
                boxShadow: `0 2px 12px ${colors.cardShadow}`,
              }}
            >
              <div className="flex items-center gap-3">
                <div
                  className="flex h-14 w-14 items-center justify-center rounded-2xl text-2xl"
                  style={{ backgroundColor: colors.cream }}
                >
                  {folder.emoji ?? '📁'}
                </div>
                <div className="flex-1">
                  <p className="font-bold" style={{ fontFamily: 'var(--font-poppins)', color: colors.text }}>
                    {folder.name}
                  </p>
                  <p className="mt-1 text-sm font-medium" style={{ color: colors.inkSoft }}>
                    {folder.itemCount} items
                  </p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <Empty label="No folders yet" icon={IconFolder} />
      )}
    </div>
  );
}

function Empty({ label, icon: Icon }: { label: string; icon?: typeof IconNote }) {
  const { colors } = useAppColors();
  return (
    <div
      className="rounded-[28px] p-12 text-center"
      style={{
        backgroundColor: colors.peach,
        boxShadow: `0 2px 12px ${colors.cardShadow}`,
      }}
    >
      {Icon ? (
        <div
          className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl"
          style={{ backgroundColor: colors.cream }}
        >
          <Icon size={32} stroke={2} style={{ color: colors.inkSoft, opacity: 0.5 }} />
        </div>
      ) : null}
      <p className="text-base font-semibold" style={{ fontFamily: 'var(--font-poppins)', color: colors.text }}>
        {label}
      </p>
    </div>
  );
}
