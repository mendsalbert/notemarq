import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import { PublicBoardView } from '@/components/public/public-board-view';
import { fetchPublicIdeaBoard } from '@/lib/supabase/publicBoards';

interface PublicBoardPageProps {
  params: Promise<{ username: string; folderId: string }>;
}

export async function generateMetadata({ params }: PublicBoardPageProps): Promise<Metadata> {
  const { username, folderId } = await params;

  try {
    const board = await fetchPublicIdeaBoard(username, folderId);
    if (!board) {
      return { title: 'Board not found · notemarq' };
    }

    return {
      title: `${board.folder.name} · ${board.owner.name ?? `@${board.owner.username}`} · notemarq`,
      description:
        board.folder.description ||
        `${board.bookmarks.length} curated links with AI summaries on notemarq.`,
      openGraph: {
        title: board.folder.name,
        description: board.folder.description || 'A public idea board on notemarq',
        type: 'website',
      },
    };
  } catch {
    return { title: 'Public idea board · notemarq' };
  }
}

export default async function PublicBoardPage({ params }: PublicBoardPageProps) {
  const { username, folderId } = await params;
  const board = await fetchPublicIdeaBoard(username, folderId);

  if (!board) {
    notFound();
  }

  return <PublicBoardView board={board} />;
}
