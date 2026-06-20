'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { IconDots, IconPencil, IconTrash } from '@tabler/icons-react';

import { NoteFace } from '@/components/app/note-face';
import { LinkPreviewThumb } from '@/components/app/link-preview';
import { useAppColors } from '@/hooks/use-app-colors';
import { useAppStore } from '@/store/app-store';
import type { Bookmark, Note } from '@/lib/types';
import { resolveNotePalette } from '@/lib/note-palette';

function getNotePreview(note: Note) {
  return note.description || note.notes || 'Empty note';
}

interface NoteCardProps {
  note: Note;
  previews?: Bookmark[];
  index?: number;
}

export function NoteCard({ note, previews = [], index = 0 }: NoteCardProps) {
  const { colors } = useAppColors();
  const updateNote = useAppStore((s) => s.updateNote);
  const deleteNote = useAppStore((s) => s.deleteNote);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const palette = resolveNotePalette(note.color, colors);
  const cardBg = palette.bg;
  const faceAccent = palette.accent;
  const previewItems = previews.slice(0, 3);

  useEffect(() => {
    if (!menuOpen) return;

    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [menuOpen]);

  async function handleEdit() {
    setMenuOpen(false);
    const nextName = window.prompt('Rename note', note.name)?.trim();
    if (!nextName || nextName === note.name) return;
    await updateNote(note.id, { name: nextName });
  }

  async function handleDelete() {
    setMenuOpen(false);
    const confirmed = window.confirm(
      `Delete "${note.name}"? Linked bookmarks will stay in your library.`,
    );
    if (!confirmed) return;
    await deleteNote(note.id);
  }

  return (
    <div
      className="relative flex min-h-[200px] flex-col rounded-[22px] transition-all hover:-translate-y-1"
      style={{
        backgroundColor: cardBg,
        boxShadow: `0 2px 10px ${colors.cardShadow}`,
      }}
    >
      <div ref={menuRef} className="absolute right-3 top-3 z-10">
        <button
          type="button"
          className="flex h-7 w-7 items-center justify-center rounded-full transition hover:scale-105"
          style={{ backgroundColor: colors.cream }}
          aria-label="Note options"
          onClick={(event) => {
            event.preventDefault();
            event.stopPropagation();
            setMenuOpen((open) => !open);
          }}
        >
          <IconDots size={16} stroke={2} style={{ color: colors.text }} />
        </button>

        {menuOpen ? (
          <div
            className="absolute right-0 top-9 min-w-[132px] overflow-hidden rounded-2xl py-1"
            style={{
              backgroundColor: colors.cream,
              boxShadow: `0 8px 24px ${colors.cardShadow}`,
              border: `1px solid ${colors.border}`,
            }}
          >
            <button
              type="button"
              className="flex w-full items-center gap-2 px-3 py-2.5 font-poppins text-[13px] font-medium transition hover:opacity-80"
              style={{ color: colors.text }}
              onClick={() => void handleEdit()}
            >
              <IconPencil size={15} stroke={2} />
              Edit
            </button>
            <button
              type="button"
              className="flex w-full items-center gap-2 px-3 py-2.5 font-poppins text-[13px] font-medium transition hover:opacity-80"
              style={{ color: colors.danger }}
              onClick={() => void handleDelete()}
            >
              <IconTrash size={15} stroke={2} />
              Delete
            </button>
          </div>
        ) : null}
      </div>

      <Link href={`/app/notes/${note.id}`} className="flex flex-1 flex-col gap-3 p-4">
        <NoteFace
          color={faceAccent}
          emoji={note.icon}
          name={note.name}
          size="sm"
          compact
        />

        <div className="min-w-0 flex-1 pr-6">
          <p
            className="line-clamp-2 font-poppins text-[14px] font-bold leading-tight tracking-tight"
            style={{ color: colors.text }}
          >
            {note.name}
          </p>
          <p className="mt-1 line-clamp-2 font-poppins text-[11px] font-medium leading-relaxed" style={{ color: colors.inkSoft }}>
            {getNotePreview(note)}
          </p>
          <p className="mt-1 font-poppins text-[11px] font-medium" style={{ color: colors.inkSoft }}>
            {note.bookmarks.length} linked
          </p>
        </div>

        {previewItems.length > 0 ? (
          <div className="mt-auto flex gap-1.5">
            {previewItems.map((bookmark) => (
              <LinkPreviewThumb
                key={bookmark.id}
                previewImage={bookmark.previewImage}
                favicon={bookmark.favicon}
                source={bookmark.source}
                className="h-10 flex-1 rounded-lg"
              />
            ))}
            {note.bookmarks.length > previewItems.length ? (
              <div
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg font-poppins text-[10px] font-bold"
                style={{ backgroundColor: colors.cream, color: colors.inkSoft }}
              >
                +{note.bookmarks.length - previewItems.length}
              </div>
            ) : null}
          </div>
        ) : null}
      </Link>
    </div>
  );
}
