import type { ForkPublicBoardResult, PublicIdeaBoard } from '@/lib/publicBoards';

import { supabase } from './client';
import { createServerSupabaseClient } from './server';

function mapPublicBoard(payload: Record<string, unknown>): PublicIdeaBoard {
  const folder = payload.folder as Record<string, unknown>;
  const owner = payload.owner as Record<string, unknown>;
  const bookmarks = (payload.bookmarks as Record<string, unknown>[] | null) ?? [];

  return {
    folder: {
      id: String(folder.id),
      name: String(folder.name ?? ''),
      description: String(folder.description ?? ''),
      color: String(folder.color ?? '#78D7FF'),
      emoji: folder.emoji ? String(folder.emoji) : null,
      kind: folder.kind === 'notes' ? 'notes' : 'bookmarks',
      publishedAt: folder.published_at ? String(folder.published_at) : null,
      forkCount: Number(folder.fork_count ?? 0),
    },
    owner: {
      id: String(owner.id),
      username: String(owner.username ?? ''),
      name: owner.name ? String(owner.name) : null,
      photoUrl: owner.photo_url ? String(owner.photo_url) : null,
    },
    bookmarks: bookmarks.map((bookmark) => ({
      id: String(bookmark.id),
      url: String(bookmark.url ?? ''),
      title: String(bookmark.title ?? ''),
      summary: String(bookmark.summary ?? ''),
      source:
        bookmark.source === 'youtube' ||
        bookmark.source === 'twitter' ||
        bookmark.source === 'tiktok' ||
        bookmark.source === 'article'
          ? bookmark.source
          : 'other',
      favicon: bookmark.favicon ? String(bookmark.favicon) : null,
      previewImage: bookmark.preview_image ? String(bookmark.preview_image) : null,
      previewText: bookmark.preview_text ? String(bookmark.preview_text) : null,
      dateAdded: String(bookmark.date_added ?? ''),
    })),
  };
}

export async function fetchPublicIdeaBoard(
  username: string,
  folderId: string,
): Promise<PublicIdeaBoard | null> {
  const client = createServerSupabaseClient();
  const { data, error } = await client.rpc('get_public_idea_board', {
    p_username: username,
    p_folder_id: folderId,
  });

  if (error) throw error;
  if (!data || typeof data !== 'object') return null;
  return mapPublicBoard(data as Record<string, unknown>);
}

export async function forkPublicIdeaBoard(folderId: string): Promise<ForkPublicBoardResult> {
  const { data, error } = await supabase.rpc('fork_public_idea_board', {
    p_folder_id: folderId,
  });

  if (error) throw error;

  const payload = (data ?? {}) as Record<string, unknown>;
  return {
    folderId: String(payload.folder_id),
    bookmarkCount: payload.bookmark_count != null ? Number(payload.bookmark_count) : undefined,
    alreadyForked: Boolean(payload.already_forked),
    sourceOwner: payload.source_owner ? String(payload.source_owner) : undefined,
  };
}
