'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import { IconArrowRight, IconChevronRight, IconNote } from '@tabler/icons-react';

import { FolderFace } from '@/components/app/folder-face';
import { KeepBookmarkCard } from '@/components/app/keep-bookmark-card';
import { useAuth } from '@/contexts/auth-provider';
import { useAppColors } from '@/hooks/use-app-colors';
import { appContentClass } from '@/lib/app-layout';
import type { ForkPublicBoardResult, PublicBoardNote, PublicIdeaBoard } from '@/lib/publicBoards';
import { forkPublicIdeaBoard } from '@/lib/supabase/publicBoards';
import type { Bookmark, BookmarkSource } from '@/lib/types';

interface PublicBoardViewProps {
  board: PublicIdeaBoard;
}

function getNoteTitle(note: PublicBoardNote) {
  return note.name || 'Untitled note';
}

function getNotePreview(note: PublicBoardNote) {
  const text = note.description || note.content;
  if (!text.trim()) return 'Empty note';
  return text.length > 160 ? `${text.slice(0, 160)}…` : text;
}

function toBookmark(bookmark: PublicIdeaBoard['bookmarks'][number]): Bookmark {
  const source = (
    ['youtube', 'twitter', 'tiktok', 'article', 'other'].includes(bookmark.source)
      ? bookmark.source
      : 'other'
  ) as BookmarkSource;

  return {
    id: bookmark.id,
    url: bookmark.url,
    title: bookmark.title,
    summary: bookmark.summary,
    source,
    favicon: bookmark.favicon ?? undefined,
    tags: [],
    dateAdded: bookmark.dateAdded,
    isFavorite: false,
    isPinned: false,
    category: '',
    previewImage: bookmark.previewImage ?? undefined,
    previewText: bookmark.previewText ?? undefined,
  };
}

function formatSaveMessage(result: ForkPublicBoardResult, board: PublicIdeaBoard) {
  if (result.alreadyForked) return 'Opening your copy…';

  const isNotes = board.folder.kind === 'notes';
  const count = isNotes
    ? result.noteCount ?? board.notes.length
    : result.bookmarkCount ?? board.bookmarks.length;
  const label = isNotes ? 'note' : 'bookmark';

  return `Saved ${count} ${label}${count === 1 ? '' : 's'}.`;
}

function PublicNav() {
  const { colors } = useAppColors();

  return (
    <header className="sticky top-0 z-50 px-4 pt-4 sm:px-6">
      <nav
        className="mx-auto flex max-w-[1400px] items-center justify-between gap-3 rounded-full px-4 py-2.5 sm:px-5"
        style={{
          background: `${colors.pageBackground}d9`,
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          border: `1px solid ${colors.border}`,
        }}
      >
        <Link href="/" className="inline-flex min-w-0 items-center gap-2">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-white">
            <Image src="/logog.png" alt="Notemarq" width={32} height={32} className="h-full w-full object-cover" />
          </span>
          <span className="truncate font-poppins text-sm font-bold tracking-tight sm:text-base">notemarq</span>
        </Link>
        <Link
          href="/app"
          className="inline-flex shrink-0 items-center gap-1.5 rounded-full px-4 py-2 font-poppins text-xs font-semibold sm:text-sm"
          style={{ backgroundColor: colors.coral, color: '#FFFFFF' }}
        >
          Open app
          <IconArrowRight size={14} stroke={2.5} />
        </Link>
      </nav>
    </header>
  );
}

export function PublicBoardView({ board }: PublicBoardViewProps) {
  const router = useRouter();
  const { colors } = useAppColors();
  const { user, isLoading } = useAuth();
  const [saveBusy, setSaveBusy] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');

  const isNotesFolder = board.folder.kind === 'notes';
  const itemCount = isNotesFolder ? board.notes.length : board.bookmarks.length;
  const ownerLabel = board.owner.name ?? `@${board.owner.username}`;
  const loginHref = `/app/login?fork=${encodeURIComponent(board.folder.id)}&returnTo=${encodeURIComponent(
    `/p/${board.owner.username}/${board.folder.id}`,
  )}`;

  const bookmarks = useMemo(
    () => board.bookmarks.map(toBookmark),
    [board.bookmarks],
  );

  async function handleSave() {
    if (saveBusy) return;

    if (!user) {
      router.push(loginHref);
      return;
    }

    setSaveBusy(true);
    setSaveMessage('');
    try {
      const result = await forkPublicIdeaBoard(board.folder.id);
      setSaveMessage(formatSaveMessage(result, board));
      router.push(`/app/folders/${result.folderId}`);
    } catch (error) {
      setSaveMessage(error instanceof Error ? error.message : 'Could not save folder.');
      setSaveBusy(false);
    }
  }

  useEffect(() => {
    if (isLoading || !user || saveBusy) return;
    const params = new URLSearchParams(window.location.search);
    if (params.get('autoFork') !== '1') return;
    void handleSave();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoading, user]);

  return (
    <div
      className="min-h-screen pb-28 font-poppins"
      style={{ backgroundColor: colors.pageBackground, color: colors.text }}
    >
      <PublicNav />

      <div className={`${appContentClass} py-5 md:py-6`}>
        {/* Same header rhythm as FolderDetailView */}
        <header className="mb-2 flex items-center justify-between gap-3">
          <Link
            href="/"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full transition hover:scale-105"
            style={{ backgroundColor: colors.cream }}
            aria-label="Back to notemarq"
          >
            <span className="text-lg leading-none" style={{ color: colors.text }}>
              ←
            </span>
          </Link>

          <div className="flex min-w-0 flex-1 flex-col items-center gap-1 px-2">
            <FolderFace
              color={board.folder.color}
              emoji={board.folder.emoji ?? undefined}
              name={board.folder.name}
              size="sm"
              compact
            />
            <h1 className="line-clamp-2 text-center text-lg font-bold leading-tight">{board.folder.name}</h1>
          </div>

          <button
            type="button"
            onClick={() => void handleSave()}
            disabled={saveBusy}
            className="flex h-9 shrink-0 items-center justify-center rounded-full px-3.5 font-poppins text-[12px] font-bold transition hover:opacity-90 disabled:opacity-50 sm:px-4 sm:text-[13px]"
            style={{ backgroundColor: colors.coral, color: '#FFFFFF' }}
          >
            {saveBusy ? '…' : 'Save'}
          </button>
        </header>

        <p className="mb-1 text-center text-[13px]" style={{ color: colors.inkSoft }}>
          {itemCount} {isNotesFolder ? 'notes' : 'bookmarks'}
          {board.folder.description ? ` · ${board.folder.description}` : ''}
        </p>

        <div className="mb-6 flex items-center justify-center gap-2">
          {board.owner.photoUrl ? (
            <Image
              src={board.owner.photoUrl}
              alt=""
              width={20}
              height={20}
              className="rounded-full"
              unoptimized
            />
          ) : null}
          <p className="text-center text-[12px] font-medium" style={{ color: colors.subtitle }}>
            Shared by {ownerLabel}
            {board.folder.forkCount > 0
              ? ` · saved ${board.folder.forkCount}×`
              : ''}
          </p>
        </div>

        {saveMessage ? (
          <p className="mb-4 text-center text-sm font-semibold" style={{ color: colors.primary }}>
            {saveMessage}
          </p>
        ) : null}

        {itemCount > 0 ? (
          isNotesFolder ? (
            <div className="mx-auto flex max-w-2xl flex-col gap-2.5 pb-6">
              {board.notes.map((note) => (
                <div
                  key={note.id}
                  className="rounded-[22px] p-4"
                  style={{
                    backgroundColor: colors.cream,
                    boxShadow: `0 2px 8px ${colors.cardShadow}`,
                  }}
                >
                  <div className="mb-2.5 flex items-center justify-between">
                    <span
                      className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-medium"
                      style={{ backgroundColor: colors.lavenderDeep, color: colors.text }}
                    >
                      <IconNote size={14} stroke={2} />
                      Note
                    </span>
                  </div>
                  <p className="line-clamp-1 text-[15px] font-bold leading-5">{getNoteTitle(note)}</p>
                  <p className="mt-1 line-clamp-3 text-[13px] leading-[18px]" style={{ color: colors.inkSoft }}>
                    {getNotePreview(note)}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <div className="columns-1 gap-4 pb-6 sm:columns-2 lg:columns-3 xl:columns-4">
              {bookmarks.map((bookmark, index) => (
                <KeepBookmarkCard
                  key={bookmark.id}
                  bookmark={bookmark}
                  variant="grid"
                  index={index}
                  readOnly
                />
              ))}
            </div>
          )
        ) : (
          <div className="flex flex-col items-center px-6 pb-10 pt-16 text-center">
            <p className="text-base font-bold">Nothing in this folder yet</p>
            <p className="mt-2 max-w-sm text-[13px] leading-[19px]" style={{ color: colors.inkSoft }}>
              The owner hasn&apos;t added {isNotesFolder ? 'notes' : 'bookmarks'} to this shared folder.
            </p>
          </div>
        )}
      </div>

      {/* Bottom save bar — one clear action, matches app dock energy */}
      <div
        className="fixed inset-x-0 bottom-0 z-40 border-t px-4 pb-[max(1rem,env(safe-area-inset-bottom))] pt-3 sm:px-6"
        style={{
          backgroundColor: `${colors.cardBackground}f5`,
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          borderColor: colors.border,
        }}
      >
        <div className={`${appContentClass} flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between`}>
          <div className="min-w-0 hidden sm:block">
            <p className="truncate text-sm font-bold">{board.folder.name}</p>
            <p className="truncate text-[12px]" style={{ color: colors.subtitle }}>
              {itemCount} {isNotesFolder ? 'notes' : 'bookmarks'} · {ownerLabel}
            </p>
          </div>

          <button
            type="button"
            onClick={() => void handleSave()}
            disabled={saveBusy}
            className="inline-flex w-full items-center justify-center gap-2 rounded-full px-5 py-3.5 text-sm font-bold transition hover:opacity-95 disabled:opacity-60 sm:w-auto sm:min-w-[220px]"
            style={{ backgroundColor: colors.coral, color: '#FFFFFF' }}
          >
            {saveBusy ? (
              <>
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                Saving…
              </>
            ) : user ? (
              <>
                Save to my library
                <IconArrowRight size={16} stroke={2.5} />
              </>
            ) : (
              <>
                Sign in to save
                <IconChevronRight size={16} stroke={2.5} />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
