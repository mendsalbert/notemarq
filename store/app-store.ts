'use client';

import { create } from 'zustand';

import {
  deleteBookmarkRow,
  deleteFolderRow,
  deleteNoteRow,
  insertUserBookmark,
  insertUserNote,
  syncUserData,
  updateFolderRow,
  updateNoteRow,
  updateBookmarkRow,
} from '@/lib/supabase/data';
import { describeSupabaseError } from '@/lib/supabase/errors';
import { alertPinLimitReached, canPinMore } from '@/lib/pin-limits';
import type { Bookmark, Folder, Note } from '@/lib/types';

interface AppStore {
  bookmarks: Bookmark[];
  notes: Note[];
  folders: Folder[];
  isLoading: boolean;
  userId: string | null;
  syncError: string | null;
  hydrate: (userId: string) => Promise<void>;
  reset: () => void;
  addBookmark: (
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
  ) => Promise<void>;
  addNote: (
    userId: string,
    payload: { name: string; description?: string; icon?: string; color?: string },
  ) => Promise<Note>;
  updateFolder: (id: string, updates: Partial<Pick<Folder, 'name' | 'description' | 'color' | 'emoji' | 'kind'>>) => Promise<void>;
  deleteFolder: (id: string) => Promise<void>;
  updateNote: (id: string, updates: Partial<Pick<Note, 'name' | 'description' | 'color' | 'icon' | 'notes'>>) => Promise<void>;
  deleteNote: (id: string) => Promise<void>;
  updateBookmark: (
    id: string,
    updates: Partial<Pick<Bookmark, 'saveReason' | 'personalContext' | 'isFavorite' | 'isPinned'>>,
  ) => Promise<void>;
  toggleFavorite: (id: string) => Promise<void>;
  togglePinBookmark: (id: string) => Promise<void>;
  togglePinNote: (id: string) => Promise<void>;
  togglePinFolder: (id: string) => Promise<void>;
  deleteBookmark: (id: string) => Promise<void>;
}

const empty = {
  bookmarks: [] as Bookmark[],
  notes: [] as Note[],
  folders: [] as Folder[],
  isLoading: false,
  userId: null as string | null,
  syncError: null as string | null,
};

let hydratePromise: Promise<void> | null = null;
let hydrateUserId: string | null = null;

export const useAppStore = create<AppStore>((set, get) => ({
  ...empty,

  hydrate: async (userId) => {
    if (hydratePromise && hydrateUserId === userId) {
      return hydratePromise;
    }

    hydrateUserId = userId;
    hydratePromise = (async () => {
      const previous = get();
      set({ isLoading: true, userId, syncError: null });

      try {
        const { bookmarks, notes, folders } = await syncUserData(userId);
        set({ bookmarks, notes, folders, isLoading: false, userId, syncError: null });
      } catch (error) {
        const message = describeSupabaseError(error);
        console.error('[web appStore] hydrate failed:', message, error);
        set({
          bookmarks: previous.bookmarks,
          notes: previous.notes,
          folders: previous.folders,
          isLoading: false,
          userId,
          syncError: message || 'Could not sync your library. Refresh to retry.',
        });
      } finally {
        hydratePromise = null;
      }
    })();

    return hydratePromise;
  },

  reset: () => set(empty),

  addBookmark: async (userId, payload) => {
    const bookmark = await insertUserBookmark(userId, payload);
    set((state) => ({ bookmarks: [bookmark, ...state.bookmarks] }));
  },

  addNote: async (userId, payload) => {
    const note = await insertUserNote(userId, payload);
    set((state) => ({ notes: [note, ...state.notes] }));
    return note;
  },

  updateFolder: async (id, updates) => {
    const userId = get().userId;
    if (!userId) return;

    const previous = get().folders;
    set((state) => ({
      folders: state.folders.map((folder) =>
        folder.id === id
          ? { ...folder, ...updates, updatedAt: new Date().toISOString().slice(0, 10) }
          : folder,
      ),
    }));

    try {
      const rowUpdates: Parameters<typeof updateFolderRow>[2] = {};
      if (updates.name !== undefined) rowUpdates.name = updates.name;
      if (updates.description !== undefined) rowUpdates.description = updates.description;
      if (updates.color !== undefined) rowUpdates.color = updates.color;
      if (updates.emoji !== undefined) rowUpdates.emoji = updates.emoji ?? null;
      if (updates.kind !== undefined) rowUpdates.kind = updates.kind;

      const row = await updateFolderRow(userId, id, rowUpdates);
      set((state) => ({
        folders: state.folders.map((folder) =>
          folder.id === id ? { ...folder, ...row } : folder,
        ),
      }));
    } catch (error) {
      console.error('[web appStore] updateFolder failed:', error);
      set({ folders: previous });
    }
  },

  deleteFolder: async (id) => {
    const userId = get().userId;
    if (!userId) return;

    const previousFolders = get().folders;
    const previousBookmarks = get().bookmarks;
    const previousNotes = get().notes;

    set((state) => ({
      folders: state.folders.filter((folder) => folder.id !== id),
      bookmarks: state.bookmarks.map((bookmark) =>
        bookmark.folderId === id ? { ...bookmark, folderId: undefined } : bookmark,
      ),
      notes: state.notes.map((note) =>
        note.folderId === id ? { ...note, folderId: undefined } : note,
      ),
    }));

    try {
      await deleteFolderRow(userId, id);
    } catch (error) {
      console.error('[web appStore] deleteFolder failed:', error);
      set({
        folders: previousFolders,
        bookmarks: previousBookmarks,
        notes: previousNotes,
      });
    }
  },

  updateNote: async (id, updates) => {
    const userId = get().userId;
    if (!userId) return;

    const previous = get().notes;
    set((state) => ({
      notes: state.notes.map((note) =>
        note.id === id
          ? { ...note, ...updates, updatedAt: new Date().toISOString().slice(0, 10) }
          : note,
      ),
    }));

    try {
      const rowUpdates: Parameters<typeof updateNoteRow>[2] = {};
      if (updates.name !== undefined) rowUpdates.name = updates.name;
      if (updates.description !== undefined) rowUpdates.description = updates.description;
      if (updates.color !== undefined) rowUpdates.color = updates.color;
      if (updates.icon !== undefined) rowUpdates.icon = updates.icon;
      if (updates.notes !== undefined) rowUpdates.content = updates.notes;

      const updated = await updateNoteRow(userId, id, rowUpdates);
      const bookmarkIds = previous.find((note) => note.id === id)?.bookmarks ?? [];
      set((state) => ({
        notes: state.notes.map((note) =>
          note.id === id ? { ...updated, bookmarks: bookmarkIds } : note,
        ),
      }));
    } catch (error) {
      console.error('[web appStore] updateNote failed:', error);
      set({ notes: previous });
    }
  },

  deleteNote: async (id) => {
    const userId = get().userId;
    if (!userId) return;

    const previousNotes = get().notes;
    const previousBookmarks = get().bookmarks;

    set((state) => ({
      notes: state.notes.filter((note) => note.id !== id),
      bookmarks: state.bookmarks.map((bookmark) =>
        bookmark.ideaId === id ? { ...bookmark, ideaId: undefined } : bookmark,
      ),
    }));

    try {
      await deleteNoteRow(userId, id);
    } catch (error) {
      console.error('[web appStore] deleteNote failed:', error);
      set({
        notes: previousNotes,
        bookmarks: previousBookmarks,
      });
    }
  },

  deleteBookmark: async (id) => {
    const userId = get().userId;
    if (!userId) return;

    const previousBookmarks = get().bookmarks;
    const previousNotes = get().notes;

    set((state) => ({
      bookmarks: state.bookmarks.filter((bookmark) => bookmark.id !== id),
      notes: state.notes.map((note) => ({
        ...note,
        bookmarks: note.bookmarks.filter((bookmarkId) => bookmarkId !== id),
      })),
    }));

    try {
      await deleteBookmarkRow(userId, id);
    } catch (error) {
      console.error('[web appStore] deleteBookmark failed:', error);
      set({
        bookmarks: previousBookmarks,
        notes: previousNotes,
      });
    }
  },

  updateBookmark: async (id, updates) => {
    const userId = get().userId;
    if (!userId) return;

    const previous = get().bookmarks;
    set((state) => ({
      bookmarks: state.bookmarks.map((bookmark) =>
        bookmark.id === id ? { ...bookmark, ...updates } : bookmark,
      ),
    }));

    try {
      const rowUpdates: Parameters<typeof updateBookmarkRow>[2] = {};
      if (updates.saveReason !== undefined) rowUpdates.save_reason = updates.saveReason;
      if (updates.personalContext !== undefined) rowUpdates.personal_context = updates.personalContext;
      if (updates.isFavorite !== undefined) rowUpdates.is_favorite = updates.isFavorite;
      if (updates.isPinned !== undefined) rowUpdates.is_pinned = updates.isPinned;

      const updated = await updateBookmarkRow(userId, id, rowUpdates);
      set((state) => ({
        bookmarks: state.bookmarks.map((bookmark) =>
          bookmark.id === id ? updated : bookmark,
        ),
      }));
    } catch (error) {
      console.error('[web appStore] updateBookmark failed:', error);
      set({ bookmarks: previous });
    }
  },

  toggleFavorite: async (id) => {
    const bookmark = get().bookmarks.find((item) => item.id === id);
    if (!bookmark) return;
    await get().updateBookmark(id, { isFavorite: !bookmark.isFavorite });
  },

  togglePinBookmark: async (id) => {
    const userId = get().userId;
    if (!userId) return;

    const bookmark = get().bookmarks.find((item) => item.id === id);
    if (!bookmark) return;

    const nextPinned = !bookmark.isPinned;
    if (nextPinned && !canPinMore(get().bookmarks, get().notes, get().folders)) {
      alertPinLimitReached();
      return;
    }

    const previous = get().bookmarks;
    set((state) => ({
      bookmarks: state.bookmarks.map((item) =>
        item.id === id ? { ...item, isPinned: nextPinned } : item,
      ),
    }));

    try {
      const updated = await updateBookmarkRow(userId, id, { is_pinned: nextPinned });
      set((state) => ({
        bookmarks: state.bookmarks.map((item) => (item.id === id ? updated : item)),
      }));
    } catch (error) {
      console.error('[web appStore] togglePinBookmark failed:', error);
      set({ bookmarks: previous });
    }
  },

  togglePinNote: async (id) => {
    const userId = get().userId;
    if (!userId) return;

    const note = get().notes.find((item) => item.id === id);
    if (!note) return;

    const nextPinned = !note.isPinned;
    if (nextPinned && !canPinMore(get().bookmarks, get().notes, get().folders)) {
      alertPinLimitReached();
      return;
    }

    const previous = get().notes;
    set((state) => ({
      notes: state.notes.map((item) =>
        item.id === id ? { ...item, isPinned: nextPinned } : item,
      ),
    }));

    try {
      const updated = await updateNoteRow(userId, id, { is_pinned: nextPinned });
      const bookmarkIds = previous.find((item) => item.id === id)?.bookmarks ?? [];
      set((state) => ({
        notes: state.notes.map((item) =>
          item.id === id ? { ...updated, bookmarks: bookmarkIds } : item,
        ),
      }));
    } catch (error) {
      console.error('[web appStore] togglePinNote failed:', error);
      set({ notes: previous });
    }
  },

  togglePinFolder: async (id) => {
    const userId = get().userId;
    if (!userId) return;

    const folder = get().folders.find((item) => item.id === id);
    if (!folder) return;

    const nextPinned = !folder.isPinned;
    if (nextPinned && !canPinMore(get().bookmarks, get().notes, get().folders)) {
      alertPinLimitReached();
      return;
    }

    const previous = get().folders;
    set((state) => ({
      folders: state.folders.map((item) =>
        item.id === id ? { ...item, isPinned: nextPinned } : item,
      ),
    }));

    try {
      const row = await updateFolderRow(userId, id, { is_pinned: nextPinned });
      set((state) => ({
        folders: state.folders.map((item) => (item.id === id ? row : item)),
      }));
    } catch (error) {
      console.error('[web appStore] togglePinFolder failed:', error);
      set({ folders: previous });
    }
  },
}));

/** @deprecated use useAppStore */
export const useBookmarkStore = useAppStore;
