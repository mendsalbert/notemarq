'use client';

import Link from 'next/link';
import {
  IconArrowLeft,
  IconChevronRight,
  IconNote,
} from '@tabler/icons-react';

import { FolderFace } from '@/components/app/folder-face';
import { KeepBookmarkCard } from '@/components/app/keep-bookmark-card';
import { PinToggleButton } from '@/components/app/pin-toggle-button';
import { useAppColors } from '@/hooks/use-app-colors';
import { useAppStore } from '@/store/app-store';
import type { Bookmark, Note } from '@/lib/types';

function getNoteTitle(note: Note) {
  return note.name || 'Untitled note';
}

function getNotePreview(note: Note) {
  return note.description || note.notes || 'Empty note';
}

export function FolderDetailView({ id }: { id: string }) {
  const { colors } = useAppColors();
  const folders = useAppStore((s) => s.folders);
  const bookmarks = useAppStore((s) => s.bookmarks);
  const notes = useAppStore((s) => s.notes);
  const togglePinFolder = useAppStore((s) => s.togglePinFolder);
  const folder = folders.find((f) => f.id === id);

  const folderBookmarks = bookmarks
    .filter((b) => b.folderId === id)
    .sort((a, b) => new Date(b.dateAdded).getTime() - new Date(a.dateAdded).getTime());
  const folderNotes = notes.filter((n) => n.folderId === id);
  const isBookmarks = folder?.kind === 'bookmarks';
  const items = isBookmarks ? folderBookmarks : folderNotes;

  if (!folder) {
    return (
      <div className="mx-auto max-w-2xl px-5 py-16 text-center">
        <p className="font-poppins text-base font-bold" style={{ color: colors.text }}>
          Folder not found
        </p>
        <Link
          href="/app/folders"
          className="mt-4 inline-block font-poppins text-sm font-medium"
          style={{ color: colors.primary }}
        >
          Back to folders
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-[1400px] px-4 py-5 md:px-6 md:py-6">
      <header className="mb-4 flex items-center justify-between">
        <Link
          href="/app/folders"
          className="flex h-9 w-9 items-center justify-center rounded-full transition hover:scale-105"
          style={{ backgroundColor: colors.cream }}
          aria-label="Back to folders"
        >
          <IconArrowLeft size={18} stroke={2} style={{ color: colors.text }} />
        </Link>

        <div className="flex flex-col items-center gap-1">
          <FolderFace
            color={folder.color}
            emoji={folder.emoji}
            name={folder.name}
            size="sm"
            compact
          />
          <h1 className="font-poppins text-lg font-bold" style={{ color: colors.text }}>
            {folder.name}
          </h1>
        </div>

        <PinToggleButton
          pinned={folder.isPinned}
          onToggle={() => void togglePinFolder(folder.id)}
        />
      </header>

      <p
        className="mb-5 text-center font-poppins text-[13px]"
        style={{ color: colors.inkSoft }}
      >
        {items.length} {isBookmarks ? 'bookmarks' : 'notes'}
        {folder.description ? ` · ${folder.description}` : ''}
      </p>

      {items.length > 0 ? (
        isBookmarks ? (
          <div className="columns-1 gap-4 pb-10 sm:columns-2 lg:columns-3 xl:columns-4">
            {(items as Bookmark[]).map((bookmark, index) => (
              <KeepBookmarkCard key={bookmark.id} bookmark={bookmark} variant="grid" index={index} />
            ))}
          </div>
        ) : (
          <div className="mx-auto flex max-w-2xl flex-col gap-2.5 pb-10">
            {(items as Note[]).map((note) => (
              <Link
                key={note.id}
                href={`/app/notes/${note.id}`}
                className="rounded-[22px] p-4 transition-all hover:-translate-y-0.5"
                style={{
                  backgroundColor: colors.cream,
                  boxShadow: `0 2px 8px ${colors.cardShadow}`,
                }}
              >
                <div className="mb-2.5 flex items-center justify-between">
                  <span
                    className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 font-poppins text-[11px] font-medium"
                    style={{ backgroundColor: colors.lavenderDeep, color: colors.text }}
                  >
                    <IconNote size={14} stroke={2} />
                    Note
                  </span>
                  <IconChevronRight size={16} stroke={2} style={{ color: colors.inkSoft }} />
                </div>
                <p className="line-clamp-1 font-poppins text-[15px] font-bold leading-5" style={{ color: colors.text }}>
                  {getNoteTitle(note)}
                </p>
                <p className="mt-1 line-clamp-2 font-poppins text-[13px] leading-[18px]" style={{ color: colors.inkSoft }}>
                  {getNotePreview(note)}
                </p>
              </Link>
            ))}
          </div>
        )
      ) : (
        <div className="flex flex-col items-center px-6 pb-10 pt-12 text-center">
          <p className="font-poppins text-base font-bold" style={{ color: colors.text }}>
            Nothing in this folder yet
          </p>
          <p className="mt-2 font-poppins text-[13px] leading-[19px]" style={{ color: colors.inkSoft }}>
            {isBookmarks
              ? 'Move bookmarks here from your library, or save new links.'
              : 'Create a note and organize it into this folder.'}
          </p>
          <Link
            href={isBookmarks ? '/app' : '/app/notes'}
            className="mt-5 rounded-[26px] px-5 py-3.5 font-poppins text-sm font-bold text-white transition hover:opacity-90"
            style={{ backgroundColor: colors.inverted }}
          >
            {isBookmarks ? 'Go to bookmarks' : 'View notes'}
          </Link>
        </div>
      )}
    </div>
  );
}
