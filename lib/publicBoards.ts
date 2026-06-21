const USERNAME_PATTERN = /^[a-z0-9_]{3,30}$/;

export function normalizeUsername(input: string) {
  return input.trim().toLowerCase().replace(/[^a-z0-9_]+/g, '_').replace(/^_+|_+$/g, '');
}

export function isValidUsername(username: string) {
  return USERNAME_PATTERN.test(username);
}

export function publicBoardPath(username: string, folderId: string) {
  return `/p/${encodeURIComponent(username)}/${folderId}`;
}

export function publicBoardUrl(username: string, folderId: string, baseUrl = getPublicWebBaseUrl()) {
  return `${baseUrl.replace(/\/$/, '')}${publicBoardPath(username, folderId)}`;
}

export function getPublicWebBaseUrl() {
  if (typeof window !== 'undefined') {
    return window.location.origin;
  }
  return process.env.NEXT_PUBLIC_SITE_URL ?? 'https://notemarq.vercel.app';
}

export interface PublicBoardOwner {
  id: string;
  username: string;
  name: string | null;
  photoUrl: string | null;
}

export interface PublicBoardFolder {
  id: string;
  name: string;
  description: string;
  color: string;
  emoji: string | null;
  kind: 'bookmarks' | 'notes';
  publishedAt: string | null;
  forkCount: number;
}

export interface PublicBoardBookmark {
  id: string;
  url: string;
  title: string;
  summary: string;
  source: 'youtube' | 'twitter' | 'tiktok' | 'article' | 'other';
  favicon: string | null;
  previewImage: string | null;
  previewText: string | null;
  dateAdded: string;
}

export interface PublicBoardNote {
  id: string;
  name: string;
  description: string;
  color: string;
  icon: string;
  content: string;
  createdAt: string;
  updatedAt: string;
}

export interface PublicIdeaBoard {
  folder: PublicBoardFolder;
  owner: PublicBoardOwner;
  bookmarks: PublicBoardBookmark[];
  notes: PublicBoardNote[];
}

export interface ForkPublicBoardResult {
  folderId: string;
  bookmarkCount?: number;
  noteCount?: number;
  alreadyForked: boolean;
  sourceOwner?: string;
}
