export type LibraryKind = 'bookmarks' | 'notes';
export type BookmarkSource = 'youtube' | 'twitter' | 'tiktok' | 'article' | 'other';

export interface Bookmark {
  id: string;
  url: string;
  title: string;
  summary: string;
  source: BookmarkSource;
  favicon?: string;
  tags: string[];
  dateAdded: string;
  isFavorite: boolean;
  isPinned: boolean;
  category: string;
  previewImage?: string;
  previewText?: string;
  ideaId?: string;
  folderId?: string;
  saveReason?: string;
  personalContext?: string;
  lastTouchedAt?: string;
}

export interface Note {
  id: string;
  name: string;
  description: string;
  bookmarks: string[];
  createdAt: string;
  updatedAt: string;
  color: string;
  icon: string;
  notes?: string;
  folderId?: string;
  isPinned: boolean;
}

export interface Folder {
  id: string;
  name: string;
  description: string;
  color: string;
  emoji?: string;
  kind: LibraryKind;
  itemCount: number;
  isPinned: boolean;
  isPublic?: boolean;
  publishedAt?: string;
  forkCount?: number;
  createdAt: string;
  updatedAt: string;
}

export interface DbBookmark {
  id: string;
  user_id: string;
  url: string;
  title: string;
  summary: string;
  source: BookmarkSource;
  favicon: string | null;
  tags: string[] | null;
  date_added: string;
  is_favorite: boolean;
  is_pinned: boolean;
  category: string;
  preview_image: string | null;
  preview_text: string | null;
  folder_id: string | null;
  save_reason: string | null;
  personal_context: string | null;
  last_touched_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface DbNote {
  id: string;
  user_id: string;
  name: string;
  description: string;
  color: string;
  icon: string;
  content: string;
  folder_id: string | null;
  is_pinned: boolean;
  created_at: string;
  updated_at: string;
}

export interface DbFolder {
  id: string;
  user_id: string;
  name: string;
  description: string;
  color: string;
  emoji: string | null;
  kind: LibraryKind;
  is_pinned: boolean;
  is_public?: boolean;
  published_at?: string | null;
  fork_count?: number;
  created_at: string;
  updated_at: string;
}
