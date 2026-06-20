import type { Bookmark, Note } from '@/lib/types';

export type EmotionId = 'happy' | 'calm' | 'curious' | 'motivated';

export interface EmotionBar {
  id: EmotionId;
  label: string;
  pct: number;
  color: string;
}

const EMOTION_META: Record<
  EmotionId,
  { label: string; color: string; keywords: string[] }
> = {
  happy: {
    label: 'Happy',
    color: '#F5A623',
    keywords: ['happy', 'grateful', 'joy', 'fun', 'love', 'celebrate', 'smile', 'gratitude'],
  },
  calm: {
    label: 'Calm',
    color: '#5E9B5C',
    keywords: ['calm', 'peace', 'rest', 'mindful', 'slow', 'reflect', 'pause', 'quiet'],
  },
  curious: {
    label: 'Curious',
    color: '#7B6FD4',
    keywords: ['learn', 'idea', 'research', 'explore', 'discover', 'read', 'article', 'study'],
  },
  motivated: {
    label: 'Motivated',
    color: '#E8876A',
    keywords: ['work', 'goal', 'build', 'plan', 'productivity', 'focus', 'project', 'ship'],
  },
};

function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter((t) => t.length > 2);
}

function scoreText(text: string, scores: Record<EmotionId, number>) {
  const tokens = tokenize(text);
  for (const token of tokens) {
    for (const [id, meta] of Object.entries(EMOTION_META) as [EmotionId, (typeof EMOTION_META)[EmotionId]][]) {
      if (meta.keywords.some((kw) => token.includes(kw) || kw.includes(token))) {
        scores[id] += 1;
      }
    }
  }
}

function stripHtml(html: string) {
  return html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
}

export function buildEmotionalGauge(bookmarks: Bookmark[], notes: Note[]): EmotionBar[] {
  const scores: Record<EmotionId, number> = {
    happy: 0,
    calm: 0,
    curious: 0,
    motivated: 0,
  };

  for (const bookmark of bookmarks) {
    scoreText(bookmark.title, scores);
    scoreText(bookmark.saveReason ?? '', scores);
    scoreText(bookmark.summary ?? '', scores);
    for (const tag of bookmark.tags) {
      scoreText(tag, scores);
    }
  }

  for (const note of notes) {
    scoreText(note.name, scores);
    scoreText(note.description ?? '', scores);
    scoreText(stripHtml(note.notes ?? ''), scores);
  }

  const total = Object.values(scores).reduce((sum, n) => sum + n, 0);

  if (total === 0) {
    return (Object.keys(EMOTION_META) as EmotionId[]).map((id) => ({
      id,
      label: EMOTION_META[id].label,
      pct: 25,
      color: EMOTION_META[id].color,
    }));
  }

  return (Object.keys(EMOTION_META) as EmotionId[]).map((id) => ({
    id,
    label: EMOTION_META[id].label,
    pct: Math.round((scores[id] / total) * 100),
    color: EMOTION_META[id].color,
  }));
}

export function getEmotionalHeadline(bookmarks: Bookmark[], notes: Note[]): string {
  const bars = buildEmotionalGauge(bookmarks, notes);
  const top = [...bars].sort((a, b) => b.pct - a.pct)[0];
  const total = bookmarks.length + notes.length;
  if (total === 0) return 'Save a few things to see your emotional landscape.';
  return `${total} saves shaping your ${top.label.toLowerCase()} side this week.`;
}
