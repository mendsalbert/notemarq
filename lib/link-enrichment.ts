import type { BookmarkSource } from '@/lib/types';

type DetectedPlatform = 'youtube' | 'twitter' | 'tiktok' | 'article' | 'other';

export interface EnrichedLink {
  title: string;
  summary: string;
  source: BookmarkSource;
  platform: DetectedPlatform;
  tags: string[];
  favicon?: string;
  previewImage?: string;
  previewText?: string;
  saveReason?: string;
  personalContext?: string;
}

function hostnameFromUrl(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, '');
  } catch {
    return '';
  }
}

function detectPlatform(url: string): DetectedPlatform {
  const host = hostnameFromUrl(url);
  if (/^(youtube\.com|m\.youtube\.com|youtu\.be)$/.test(host)) return 'youtube';
  if (/^(twitter\.com|x\.com|mobile\.twitter\.com)$/.test(host)) return 'twitter';
  if (/^(tiktok\.com|vm\.tiktok\.com|vt\.tiktok\.com)$/.test(host)) return 'tiktok';
  if (host) return 'article';
  return 'other';
}

function platformToSource(platform: DetectedPlatform): BookmarkSource {
  if (platform === 'youtube' || platform === 'twitter' || platform === 'tiktok') return platform;
  if (platform === 'article') return 'article';
  return 'other';
}

/** Extract a YouTube video ID for thumbnail fallback when oEmbed is unavailable. */
export function extractYouTubeVideoId(url: string): string | null {
  try {
    const parsed = new URL(url);
    const host = parsed.hostname.replace(/^www\./, '');
    if (host === 'youtu.be') {
      const id = parsed.pathname.split('/').filter(Boolean)[0];
      return id && /^[\w-]{11}$/.test(id) ? id : null;
    }
    if (/^(youtube\.com|m\.youtube\.com)$/.test(host)) {
      const v = parsed.searchParams.get('v');
      if (v && /^[\w-]{11}$/.test(v)) return v;
      const parts = parsed.pathname.split('/').filter(Boolean);
      const embedIdx = parts.indexOf('embed');
      if (embedIdx >= 0 && parts[embedIdx + 1] && /^[\w-]{11}$/.test(parts[embedIdx + 1])) {
        return parts[embedIdx + 1];
      }
      const shortsIdx = parts.indexOf('shorts');
      if (shortsIdx >= 0 && parts[shortsIdx + 1] && /^[\w-]{11}$/.test(parts[shortsIdx + 1])) {
        return parts[shortsIdx + 1];
      }
    }
  } catch {
    /* ignore */
  }
  return null;
}

export function youtubeThumbnailUrl(url: string): string | undefined {
  const id = extractYouTubeVideoId(url);
  return id ? `https://i.ytimg.com/vi/${id}/hqdefault.jpg` : undefined;
}

async function fetchJson(url: string): Promise<Record<string, unknown> | null> {
  try {
    const response = await fetch(url, {
      headers: { Accept: 'application/json' },
      signal: AbortSignal.timeout(8000),
    });
    if (!response.ok) return null;
    return (await response.json()) as Record<string, unknown>;
  } catch {
    return null;
  }
}

function pickString(value: unknown): string | undefined {
  return typeof value === 'string' && value.trim() ? value.trim() : undefined;
}

interface RawPreview {
  title?: string;
  description?: string;
  author?: string;
  thumbnail?: string;
}

async function fetchYouTubeOEmbed(url: string): Promise<RawPreview | null> {
  const data = await fetchJson(
    `https://www.youtube.com/oembed?url=${encodeURIComponent(url)}&format=json`,
  );
  if (!data) return null;
  const title = pickString(data.title);
  if (!title) return null;
  return {
    title,
    author: pickString(data.author_name),
    thumbnail: pickString(data.thumbnail_url) ?? youtubeThumbnailUrl(url),
    description: title,
  };
}

async function fetchTikTokOEmbed(url: string): Promise<RawPreview | null> {
  const data = await fetchJson(`https://www.tiktok.com/oembed?url=${encodeURIComponent(url)}`);
  if (!data) return null;
  const title = pickString(data.title);
  if (!title) return null;
  return {
    title,
    author: pickString(data.author_name),
    thumbnail: pickString(data.thumbnail_url),
    description: title,
  };
}

async function fetchNoembed(url: string): Promise<RawPreview | null> {
  const data = await fetchJson(`https://noembed.com/embed?url=${encodeURIComponent(url)}`);
  if (!data || data.error) return null;
  const title = pickString(data.title);
  if (!title) return null;
  return {
    title,
    author: pickString(data.author_name),
    thumbnail: pickString(data.thumbnail_url),
    description: title,
  };
}

async function gatherRawPreview(url: string, platform: DetectedPlatform): Promise<RawPreview> {
  if (platform === 'youtube') {
    const preview = await fetchYouTubeOEmbed(url);
    if (preview?.title) return preview;
    const thumbnail = youtubeThumbnailUrl(url);
    if (thumbnail) return { thumbnail, title: 'YouTube Video' };
    return (await fetchNoembed(url)) ?? {};
  }

  if (platform === 'tiktok') {
    const preview = await fetchTikTokOEmbed(url);
    if (preview?.title) return preview;
    return (await fetchNoembed(url)) ?? {};
  }

  return (await fetchNoembed(url)) ?? {};
}

function fallbackTitle(platform: DetectedPlatform, author?: string): string {
  const labels: Record<DetectedPlatform, string> = {
    youtube: 'YouTube Video',
    twitter: 'Post on X',
    tiktok: 'TikTok Video',
    article: 'Web Article',
    other: 'Saved Link',
  };
  if (author) return `${author} — ${labels[platform]}`;
  return labels[platform];
}

/** Local enrichment when the Supabase edge function is unavailable. */
export async function enrichLinkLocally(url: string): Promise<EnrichedLink> {
  const normalized = url.trim().startsWith('http') ? url.trim() : `https://${url.trim()}`;
  const platform = detectPlatform(normalized);
  const raw = await gatherRawPreview(normalized, platform);
  const host = hostnameFromUrl(normalized);

  return {
    title: raw.title || fallbackTitle(platform, raw.author),
    summary: raw.description || `Saved from ${host || platform}.`,
    source: platformToSource(platform),
    platform,
    tags: [platform === 'twitter' ? 'X' : platform.charAt(0).toUpperCase() + platform.slice(1)],
    favicon: host ? `https://www.google.com/s2/favicons?domain=${host}&sz=64` : undefined,
    previewImage: raw.thumbnail ?? (platform === 'youtube' ? youtubeThumbnailUrl(normalized) : undefined),
    previewText: raw.description?.slice(0, 160),
  };
}
