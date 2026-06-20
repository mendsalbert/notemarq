'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { IconBrain, IconExternalLink } from '@tabler/icons-react';

import { LinkPreviewThumb, SourceIcon } from '@/components/app/link-preview';
import { useAuth } from '@/contexts/auth-provider';
import type { PublicIdeaBoard } from '@/lib/publicBoards';
import { forkPublicIdeaBoard } from '@/lib/supabase/publicBoards';

const sourceLabels: Record<string, string> = {
  twitter: 'X',
  youtube: 'YouTube',
  tiktok: 'TikTok',
  article: 'Article',
  other: 'Link',
};

interface PublicBoardViewProps {
  board: PublicIdeaBoard;
}

export function PublicBoardView({ board }: PublicBoardViewProps) {
  const router = useRouter();
  const { user, isLoading } = useAuth();
  const [forkBusy, setForkBusy] = useState(false);
  const [forkMessage, setForkMessage] = useState('');

  const ownerLabel = board.owner.name ?? `@${board.owner.username}`;
  const loginHref = `/app/login?fork=${encodeURIComponent(board.folder.id)}&returnTo=${encodeURIComponent(
    `/p/${board.owner.username}/${board.folder.id}`,
  )}`;

  async function handleClone() {
    if (forkBusy) return;

    if (!user) {
      router.push(loginHref);
      return;
    }

    setForkBusy(true);
    setForkMessage('');
    try {
      const result = await forkPublicIdeaBoard(board.folder.id);
      setForkMessage(
        result.alreadyForked
          ? 'Already in your library — opening your copy.'
          : `Cloned ${result.bookmarkCount ?? board.bookmarks.length} links into your brain.`,
      );
      router.push(`/app/folders/${result.folderId}`);
    } catch (error) {
      setForkMessage(error instanceof Error ? error.message : 'Could not clone this board.');
      setForkBusy(false);
    }
  }

  useEffect(() => {
    if (isLoading || !user || forkBusy) return;
    const params = new URLSearchParams(window.location.search);
    if (params.get('autoFork') !== '1') return;
    void handleClone();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoading, user]);

  return (
    <div className="min-h-screen bg-black text-white">
      <header className="sticky top-0 z-20 border-b border-white/10 bg-black/85 backdrop-blur-md">
        <div className="mx-auto flex max-w-3xl items-center justify-between gap-4 px-5 py-4">
          <Link href="/" className="text-sm font-semibold tracking-wide text-white/70 hover:text-white">
            notemarq
          </Link>
          <button
            type="button"
            onClick={() => void handleClone()}
            disabled={forkBusy}
            className="inline-flex items-center gap-2 rounded-full bg-white px-5 py-2.5 text-sm font-extrabold text-black transition hover:scale-[1.02] disabled:opacity-60"
          >
            <IconBrain size={18} stroke={2.2} />
            {forkBusy ? 'Cloning…' : 'Clone to My Brain'}
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-5 py-8">
        <section className="rounded-[28px] border border-white/10 bg-[#141414] p-6">
          <div className="flex items-start gap-4">
            <div
              className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl text-3xl"
              style={{ backgroundColor: board.folder.color }}
            >
              {board.folder.emoji ?? '📁'}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm text-white/55">Public idea board by {ownerLabel}</p>
              <h1 className="mt-1 text-3xl font-bold tracking-tight">{board.folder.name}</h1>
              {board.folder.description ? (
                <p className="mt-2 text-sm leading-relaxed text-white/65">{board.folder.description}</p>
              ) : null}
              <p className="mt-3 text-xs text-white/40">
                {board.bookmarks.length} curated link{board.bookmarks.length === 1 ? '' : 's'}
                {board.folder.forkCount > 0
                  ? ` · cloned ${board.folder.forkCount} time${board.folder.forkCount === 1 ? '' : 's'}`
                  : ''}
              </p>
            </div>
          </div>

          {!user && !isLoading ? (
            <p className="mt-5 rounded-2xl bg-white/5 px-4 py-3 text-sm text-white/70">
              Create a free account to copy this entire directory into your personal workspace.
            </p>
          ) : null}

          {forkMessage ? <p className="mt-4 text-sm text-emerald-400">{forkMessage}</p> : null}
        </section>

        <section className="mt-8 space-y-4">
          {board.bookmarks.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-white/15 px-6 py-12 text-center text-white/50">
              No public links in this board yet.
            </div>
          ) : (
            board.bookmarks.map((bookmark) => (
              <article
                key={bookmark.id}
                className="overflow-hidden rounded-[24px] border border-white/10 bg-[#141414]"
              >
                <div className="flex gap-4 p-5">
                  <LinkPreviewThumb
                    previewImage={bookmark.previewImage ?? undefined}
                    favicon={bookmark.favicon ?? undefined}
                    source={bookmark.source}
                    className="h-20 w-20"
                  />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 text-xs uppercase tracking-wide text-white/45">
                      <SourceIcon source={bookmark.source} size={14} />
                      <span>{sourceLabels[bookmark.source] ?? 'Link'}</span>
                    </div>
                    <h2 className="mt-1 text-lg font-semibold leading-snug">{bookmark.title}</h2>
                    {bookmark.summary ? (
                      <p className="mt-2 text-sm leading-relaxed text-white/70">{bookmark.summary}</p>
                    ) : bookmark.previewText ? (
                      <p className="mt-2 text-sm leading-relaxed text-white/55">{bookmark.previewText}</p>
                    ) : null}
                    <a
                      href={bookmark.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-3 inline-flex items-center gap-1.5 text-sm font-medium text-cyan-300 hover:text-cyan-200"
                    >
                      Open source
                      <IconExternalLink size={14} />
                    </a>
                  </div>
                </div>
              </article>
            ))
          )}
        </section>

        <footer className="mt-10 flex flex-col items-center gap-3 pb-10 text-center">
          <button
            type="button"
            onClick={() => void handleClone()}
            disabled={forkBusy}
            className="inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 text-base font-extrabold text-black transition hover:scale-[1.02] disabled:opacity-60"
          >
            <IconBrain size={20} stroke={2.2} />
            {forkBusy ? 'Cloning…' : 'Clone to My Brain'}
          </button>
          {!user && !isLoading ? (
            <Link href={loginHref} className="text-sm text-white/55 hover:text-white/80">
              Sign in free to fork this board
            </Link>
          ) : null}
        </footer>
      </main>
    </div>
  );
}
