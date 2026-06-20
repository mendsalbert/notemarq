import type { Bookmark, DbBookmark, DbFolder, DbNote, Folder, Note } from '@/lib/types';
import { wrapSyncStep } from './errors';
import { supabase } from './client';

export function bookmarkFromRow(row: DbBookmark, ideaId?: string): Bookmark {
  return {
    id: row.id,
    url: row.url,
    title: row.title,
    summary: row.summary,
    source: row.source,
    favicon: row.favicon ?? undefined,
    tags: row.tags ?? [],
    dateAdded: row.date_added,
    isFavorite: row.is_favorite,
    category: row.category,
    previewImage: row.preview_image ?? undefined,
    previewText: row.preview_text ?? undefined,
    folderId: row.folder_id ?? undefined,
    ideaId,
    saveReason: row.save_reason ?? undefined,
    personalContext: row.personal_context ?? undefined,
    lastTouchedAt: row.last_touched_at ?? undefined,
  };
}

export function noteFromRow(row: DbNote, bookmarkIds: string[] = []): Note {
  const createdAt = row.created_at?.slice(0, 10) ?? '';
  const updatedAt = row.updated_at?.slice(0, 10) ?? createdAt;
  return {
    id: row.id,
    name: row.name,
    description: row.description,
    bookmarks: bookmarkIds,
    createdAt,
    updatedAt,
    color: row.color,
    icon: row.icon,
    notes: row.content,
    folderId: row.folder_id ?? undefined,
  };
}

export function folderFromRow(row: DbFolder, itemCount = 0): Folder {
  const createdAt = row.created_at?.slice(0, 10) ?? '';
  const updatedAt = row.updated_at?.slice(0, 10) ?? createdAt;
  return {
    id: row.id,
    name: row.name,
    description: row.description,
    color: row.color,
    emoji: row.emoji ?? undefined,
    kind: row.kind,
    itemCount,
    isPublic: row.is_public ?? false,
    publishedAt: row.published_at ?? undefined,
    forkCount: row.fork_count ?? 0,
    createdAt,
    updatedAt,
  };
}

function attachIdeaIds(bookmarks: Bookmark[], notes: Note[]): Bookmark[] {
  const ideaByBookmark = new Map<string, string>();
  for (const note of notes) {
    for (const bookmarkId of note.bookmarks) {
      if (!ideaByBookmark.has(bookmarkId)) ideaByBookmark.set(bookmarkId, note.id);
    }
  }
  return bookmarks.map((b) => ({
    ...b,
    ideaId: ideaByBookmark.get(b.id) ?? b.ideaId,
  }));
}

export async function fetchBookmarks(userId: string): Promise<Bookmark[]> {
  const { data, error } = await supabase
    .from('bookmarks')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return (data as DbBookmark[]).map((row) => bookmarkFromRow(row));
}

export async function fetchNotes(userId: string): Promise<Note[]> {
  const { data: notes, error: notesError } = await supabase
    .from('notes')
    .select('*')
    .eq('user_id', userId)
    .order('updated_at', { ascending: false });
  if (notesError) throw notesError;

  const { data: links, error: linksError } = await supabase
    .from('note_bookmarks')
    .select('note_id, bookmark_id')
    .eq('user_id', userId);
  if (linksError) throw linksError;

  const byNote = new Map<string, string[]>();
  for (const link of links ?? []) {
    const list = byNote.get(link.note_id) ?? [];
    list.push(link.bookmark_id);
    byNote.set(link.note_id, list);
  }

  return (notes as DbNote[]).map((row) => noteFromRow(row, byNote.get(row.id) ?? []));
}

export async function fetchFolders(userId: string): Promise<Folder[]> {
  const { data: folders, error: foldersError } = await supabase
    .from('folders')
    .select('*')
    .eq('user_id', userId)
    .order('updated_at', { ascending: false });
  if (foldersError) throw foldersError;

  const [{ data: bookmarkCounts }, { data: noteCounts }] = await Promise.all([
    supabase.from('bookmarks').select('folder_id').eq('user_id', userId).not('folder_id', 'is', null),
    supabase.from('notes').select('folder_id').eq('user_id', userId).not('folder_id', 'is', null),
  ]);

  const counts = new Map<string, number>();
  for (const row of bookmarkCounts ?? []) {
    if (row.folder_id) counts.set(row.folder_id, (counts.get(row.folder_id) ?? 0) + 1);
  }
  for (const row of noteCounts ?? []) {
    if (row.folder_id) counts.set(row.folder_id, (counts.get(row.folder_id) ?? 0) + 1);
  }

  return (folders as DbFolder[]).map((row) => folderFromRow(row, counts.get(row.id) ?? 0));
}

export async function syncUserData(userId: string) {
  const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
  if (sessionError) throw wrapSyncStep('auth.getSession', sessionError);
  if (!sessionData.session?.access_token) {
    throw new Error('[auth] Missing access token — sign in again');
  }
  if (sessionData.session.user.id !== userId) {
    throw new Error('[auth] Session user mismatch — sign in again');
  }

  const expiresAt = sessionData.session.expires_at ?? 0;
  const now = Math.floor(Date.now() / 1000);
  if (expiresAt - now < 60) {
    const { error: refreshError } = await supabase.auth.refreshSession();
    if (refreshError) throw wrapSyncStep('auth.refreshSession', refreshError);
  }

  let bookmarks: Bookmark[];
  let notes: Note[];
  let folders: Folder[];

  try {
    bookmarks = await fetchBookmarks(userId);
  } catch (error) {
    throw wrapSyncStep('bookmarks', error);
  }

  try {
    notes = await fetchNotes(userId);
  } catch (error) {
    throw wrapSyncStep('notes', error);
  }

  try {
    folders = await fetchFolders(userId);
  } catch (error) {
    throw wrapSyncStep('folders', error);
  }

  return { bookmarks: attachIdeaIds(bookmarks, notes), notes, folders };
}

export async function insertUserBookmark(
  userId: string,
  payload: {
    url: string;
    title: string;
    summary: string;
    source: Bookmark['source'];
    saveReason?: string;
    personalContext?: string;
    previewImage?: string;
    previewText?: string;
    favicon?: string;
    tags?: string[];
  },
): Promise<Bookmark> {
  const today = new Date();
  const dateAdded = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

  const { data, error } = await supabase
    .from('bookmarks')
    .insert({
      user_id: userId,
      url: payload.url,
      title: payload.title,
      summary: payload.summary,
      source: payload.source,
      tags: payload.tags ?? [],
      date_added: dateAdded,
      is_favorite: false,
      category: payload.source === 'article' ? 'articles' : payload.source,
      favicon: payload.favicon ?? null,
      preview_image: payload.previewImage ?? null,
      preview_text: payload.previewText ?? (payload.summary.slice(0, 280) || null),
      save_reason: payload.saveReason ?? null,
      personal_context: payload.personalContext ?? null,
      last_touched_at: new Date().toISOString(),
    })
    .select('*')
    .single();

  if (error) throw error;
  return bookmarkFromRow(data as DbBookmark);
}

export async function insertUserNote(
  userId: string,
  payload: { name: string; description?: string; icon?: string; color?: string },
): Promise<Note> {
  const { data, error } = await supabase
    .from('notes')
    .insert({
      user_id: userId,
      name: payload.name,
      description: payload.description ?? '',
      color: payload.color ?? '#4FC3F7',
      icon: payload.icon ?? '📝',
      content: '',
    })
    .select('*')
    .single();

  if (error) throw error;
  return noteFromRow(data as DbNote, []);
}

function isMissingEmojiColumnError(error: { message?: string; code?: string } | null) {
  if (!error) return false;
  const message = error.message?.toLowerCase() ?? '';
  return error.code === '42703' || message.includes('emoji');
}

export async function updateFolderRow(
  userId: string,
  id: string,
  updates: Partial<Pick<DbFolder, 'name' | 'description' | 'color' | 'emoji' | 'kind'>>,
): Promise<Folder> {
  const first = await supabase
    .from('folders')
    .update(updates)
    .eq('id', id)
    .eq('user_id', userId)
    .select('*')
    .single();

  if (!first.error && first.data) {
    return folderFromRow(first.data as DbFolder);
  }

  if (isMissingEmojiColumnError(first.error) && updates.emoji !== undefined) {
    const { emoji: _ignored, ...withoutEmoji } = updates;
    const retry = await supabase
      .from('folders')
      .update(withoutEmoji)
      .eq('id', id)
      .eq('user_id', userId)
      .select('*')
      .single();
    if (retry.error) throw retry.error;
    return folderFromRow(retry.data as DbFolder);
  }

  throw first.error;
}

export async function deleteFolderRow(userId: string, id: string): Promise<void> {
  const { error } = await supabase.from('folders').delete().eq('id', id).eq('user_id', userId);
  if (error) throw error;
}

export async function deleteBookmarkRow(userId: string, id: string): Promise<void> {
  const { error } = await supabase
    .from('bookmarks')
    .delete()
    .eq('id', id)
    .eq('user_id', userId);

  if (error) throw error;
}

export async function updateBookmarkRow(
  userId: string,
  id: string,
  updates: Partial<Pick<DbBookmark, 'save_reason' | 'personal_context'>>,
): Promise<Bookmark> {
  const { data, error } = await supabase
    .from('bookmarks')
    .update(updates)
    .eq('id', id)
    .eq('user_id', userId)
    .select('*')
    .single();

  if (error) throw error;
  return bookmarkFromRow(data as DbBookmark);
}

export async function updateNoteRow(
  userId: string,
  id: string,
  updates: Partial<Pick<DbNote, 'name' | 'description' | 'color' | 'icon' | 'content'>>,
): Promise<Note> {
  const { data, error } = await supabase
    .from('notes')
    .update(updates)
    .eq('id', id)
    .eq('user_id', userId)
    .select('*')
    .single();

  if (error) throw error;
  return noteFromRow(data as DbNote);
}

export async function deleteNoteRow(userId: string, id: string): Promise<void> {
  const { error } = await supabase.from('notes').delete().eq('id', id).eq('user_id', userId);
  if (error) throw error;
}
