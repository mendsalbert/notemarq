'use client';

import { useMemo, useState } from 'react';
import { IconNote, IconSearch } from '@tabler/icons-react';

import { NoteCard } from '@/components/app/note-card';
import { useAppColors } from '@/hooks/use-app-colors';
import { useAppStore } from '@/store/app-store';

export function NotesView() {
  const { colors } = useAppColors();
  const notes = useAppStore((s) => s.notes);
  const bookmarks = useAppStore((s) => s.bookmarks);
  const [searchQuery, setSearchQuery] = useState('');

  const filtered = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    const sorted = [...notes].sort(
      (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
    );
    if (!q) return sorted;
    return sorted.filter(
      (note) =>
        note.name.toLowerCase().includes(q) ||
        note.description.toLowerCase().includes(q) ||
        note.notes?.toLowerCase().includes(q),
    );
  }, [notes, searchQuery]);

  const notePreviews = useMemo(() => {
    const bookmarkById = new Map(bookmarks.map((bookmark) => [bookmark.id, bookmark]));
    const map = new Map<string, typeof bookmarks>();

    for (const note of notes) {
      const items = note.bookmarks
        .map((id) => bookmarkById.get(id))
        .filter((bookmark): bookmark is (typeof bookmarks)[number] => Boolean(bookmark))
        .slice(0, 3);
      map.set(note.id, items);
    }

    return map;
  }, [notes, bookmarks]);

  return (
    <div className="mx-auto w-full max-w-[1400px] px-4 py-5 md:px-6 md:py-6">
      <h1 className="mb-5 font-poppins text-[28px] font-bold tracking-tight" style={{ color: colors.text }}>
        Notes
      </h1>

      <div
        className="relative mb-5 rounded-[20px]"
        style={{ backgroundColor: colors.cream, boxShadow: `0 2px 8px ${colors.cardShadow}` }}
      >
        <IconSearch
          className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2"
          size={16}
          stroke={2}
          style={{ color: colors.inkSoft }}
        />
        <input
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search notes..."
          className="w-full rounded-[20px] border-0 bg-transparent py-3.5 pl-11 pr-4 font-poppins text-sm font-medium outline-none"
          style={{ color: colors.text }}
        />
      </div>

      {filtered.length === 0 ? (
        <div className="flex flex-col items-center px-6 py-16 text-center">
          <IconNote size={48} stroke={1.75} style={{ color: colors.inkSoft, opacity: 0.5 }} />
          <p className="mt-4 font-poppins text-base font-bold" style={{ color: colors.text }}>
            {searchQuery.trim() ? 'No notes match' : 'No notes yet'}
          </p>
          <p className="mt-2 max-w-sm font-poppins text-[13px] leading-relaxed" style={{ color: colors.inkSoft }}>
            {searchQuery.trim()
              ? 'Try a different search term.'
              : 'Create your first note on mobile or web.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-4">
          {filtered.map((note, index) => (
            <NoteCard
              key={note.id}
              note={note}
              previews={notePreviews.get(note.id)}
              index={index}
            />
          ))}
        </div>
      )}
    </div>
  );
}
