import type { Bookmark } from '@/lib/types';

export const GRAVEYARD_STALE_DAYS = 3;

function parseDate(dateAdded: string): Date {
  return new Date(`${dateAdded}T12:00:00`);
}

export function formatLocalDateKey(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function getStartOfWeek(date: Date): Date {
  const d = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const day = d.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diff);
  return d;
}

function daysSince(dateAdded: string): number {
  const saved = parseDate(dateAdded);
  const now = new Date();
  const startToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startSaved = new Date(saved.getFullYear(), saved.getMonth(), saved.getDate());
  return Math.round((startToday.getTime() - startSaved.getTime()) / (1000 * 60 * 60 * 24));
}

export interface RecallWindow {
  label: string;
  targetDays: number;
  bookmark: Bookmark;
}

export function getDailyRecall(bookmarks: Bookmark[]): RecallWindow[] {
  const windows = [
    { label: '1 month ago', targetDays: 30, tolerance: 10 },
    { label: '3 months ago', targetDays: 90, tolerance: 20 },
    { label: '1 year ago', targetDays: 365, tolerance: 45 },
  ];

  const used = new Set<string>();
  const results: RecallWindow[] = [];

  for (const window of windows) {
    const match = bookmarks.find((b) => {
      if (used.has(b.id)) return false;
      const days = daysSince(b.dateAdded);
      return Math.abs(days - window.targetDays) <= window.tolerance;
    });

    if (match) {
      used.add(match.id);
      results.push({ label: window.label, targetDays: window.targetDays, bookmark: match });
    }
  }

  if (results.length < 3) {
    const fallbacks = [...bookmarks]
      .sort((a, b) => daysSince(b.dateAdded) - daysSince(a.dateAdded))
      .filter((b) => !used.has(b.id))
      .slice(0, 3 - results.length);

    fallbacks.forEach((bookmark, i) => {
      const labels = ['A while back', 'From your archives', 'Remember this?'];
      results.push({ label: labels[i] ?? 'Earlier', targetDays: daysSince(bookmark.dateAdded), bookmark });
    });
  }

  return results.slice(0, 3);
}

export interface ActiveProject {
  topic: string;
  count: number;
  bookmarks: Bookmark[];
}

export function getActiveProject(bookmarks: Bookmark[]): ActiveProject | null {
  const recent = bookmarks.filter((b) => daysSince(b.dateAdded) <= 14);
  if (recent.length === 0) return null;

  const tagCounts = new Map<string, number>();
  for (const b of recent) {
    const tag = b.tags[0] ?? 'General';
    tagCounts.set(tag, (tagCounts.get(tag) ?? 0) + 1);
  }

  let topTag = '';
  let topCount = 0;
  for (const [tag, count] of tagCounts) {
    if (count > topCount) {
      topTag = tag;
      topCount = count;
    }
  }

  if (!topTag) return null;

  return {
    topic: topTag,
    count: topCount,
    bookmarks: recent.filter((b) => (b.tags[0] ?? 'General') === topTag).slice(0, 3),
  };
}

export function hasBeenTouched(bookmark: Bookmark): boolean {
  return Boolean(bookmark.lastTouchedAt);
}

export function isGraveyardCandidate(bookmark: Bookmark): boolean {
  return daysSince(bookmark.dateAdded) >= GRAVEYARD_STALE_DAYS && !hasBeenTouched(bookmark);
}

export function getGraveyardBookmark(bookmarks: Bookmark[], excludeId?: string): Bookmark | null {
  const candidates = bookmarks.filter((b) => b.id !== excludeId && isGraveyardCandidate(b));
  if (candidates.length === 0) return null;

  return [...candidates].sort(
    (a, b) => parseDate(a.dateAdded).getTime() - parseDate(b.dateAdded).getTime(),
  )[0];
}

export function getCuratingStreak(bookmarks: Bookmark[]): number {
  if (bookmarks.length === 0) return 0;

  const saveDays = new Set(bookmarks.map((b) => b.dateAdded));
  const today = new Date();
  let streak = 0;

  for (let i = 0; i < 365; i++) {
    const d = new Date(today.getFullYear(), today.getMonth(), today.getDate() - i);
    const key = formatLocalDateKey(d);
    if (saveDays.has(key)) {
      streak++;
    } else if (i === 0) {
      continue;
    } else {
      break;
    }
  }

  return streak;
}

const SOCIAL_SOURCES = new Set(['youtube', 'twitter', 'tiktok']);

export interface WeekDayActivity {
  label: string;
  date: number;
  socialCount: number;
  totalCount: number;
  isToday: boolean;
  isFuture: boolean;
  level: 'none' | 'low' | 'good' | 'great';
}

export interface SocialStats {
  streak: number;
  socialTotal: number;
  thisWeek: number;
  youtube: number;
  twitter: number;
  tiktok: number;
  weeklyActivity: WeekDayActivity[];
}

const DAY_LABELS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

function getDayLevel(socialCount: number, totalCount: number): WeekDayActivity['level'] {
  if (socialCount >= 2) return 'great';
  if (socialCount >= 1) return 'good';
  if (totalCount >= 1) return 'low';
  return 'none';
}

export function getWeeklyActivity(bookmarks: Bookmark[]): WeekDayActivity[] {
  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const weekStart = getStartOfWeek(todayStart);
  const days: WeekDayActivity[] = [];

  for (let i = 0; i < 7; i++) {
    const d = new Date(weekStart.getFullYear(), weekStart.getMonth(), weekStart.getDate() + i);
    const key = formatLocalDateKey(d);
    const dayBookmarks = bookmarks.filter((b) => b.dateAdded === key);
    const socialCount = dayBookmarks.filter((b) => SOCIAL_SOURCES.has(b.source)).length;
    const isToday = d.getTime() === todayStart.getTime();
    const isFuture = d.getTime() > todayStart.getTime();

    days.push({
      label: DAY_LABELS[d.getDay()],
      date: d.getDate(),
      socialCount,
      totalCount: dayBookmarks.length,
      isToday,
      isFuture,
      level: isFuture ? 'none' : getDayLevel(socialCount, dayBookmarks.length),
    });
  }

  return days;
}

export function getSocialStats(bookmarks: Bookmark[]): SocialStats {
  const social = bookmarks.filter((b) => SOCIAL_SOURCES.has(b.source));
  const now = new Date();
  const weekStart = getStartOfWeek(new Date(now.getFullYear(), now.getMonth(), now.getDate()));
  weekStart.setHours(0, 0, 0, 0);

  const thisWeek = social.filter((b) => parseDate(b.dateAdded) >= weekStart).length;

  return {
    streak: getCuratingStreak(bookmarks),
    socialTotal: social.length,
    thisWeek,
    youtube: bookmarks.filter((b) => b.source === 'youtube').length,
    twitter: bookmarks.filter((b) => b.source === 'twitter').length,
    tiktok: bookmarks.filter((b) => b.source === 'tiktok').length,
    weeklyActivity: getWeeklyActivity(bookmarks),
  };
}

export function sortByRecent(bookmarks: Bookmark[]): Bookmark[] {
  return [...bookmarks].sort(
    (a, b) => parseDate(b.dateAdded).getTime() - parseDate(a.dateAdded).getTime(),
  );
}
