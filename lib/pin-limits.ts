import type { Bookmark, Folder, Note } from '@/lib/types';

export const MAX_PINNED_ITEMS = 4;

export function countPinnedItems(
  bookmarks: Bookmark[],
  notes: Note[],
  folders: Folder[],
): number {
  return (
    bookmarks.filter((item) => item.isPinned).length +
    notes.filter((item) => item.isPinned).length +
    folders.filter((item) => item.isPinned).length
  );
}

export function canPinMore(
  bookmarks: Bookmark[],
  notes: Note[],
  folders: Folder[],
): boolean {
  return countPinnedItems(bookmarks, notes, folders) < MAX_PINNED_ITEMS;
}

export function alertPinLimitReached(): void {
  window.alert(`You can pin up to ${MAX_PINNED_ITEMS} items. Unpin one to pin something else.`);
}
