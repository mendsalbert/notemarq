'use client';

import { FormEvent, useEffect, useRef, useState } from 'react';
import {
  IconBrandTiktok,
  IconBrandX,
  IconBrandYoutube,
  IconCheck,
  IconLink,
  IconSparkles,
  IconWorld,
  IconX,
} from '@tabler/icons-react';

import { useAuth } from '@/contexts/auth-provider';
import { useAppColors } from '@/hooks/use-app-colors';
import { useAppStore } from '@/store/app-store';
import { youtubeThumbnailUrl } from '@/lib/link-enrichment';
import type { BookmarkSource } from '@/lib/types';

function detectSource(url: string): BookmarkSource {
  try {
    const host = new URL(url).hostname.replace(/^www\./, '');
    if (/youtube\.com|youtu\.be/.test(host)) return 'youtube';
    if (/twitter\.com|x\.com/.test(host)) return 'twitter';
    if (/tiktok\.com/.test(host)) return 'tiktok';
    if (host) return 'article';
  } catch { /* ignore */ }
  return 'other';
}

function normalizeUrl(raw: string) {
  const trimmed = raw.trim();
  if (!trimmed) return '';
  return /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
}

function SourceIcon({ source, size = 16 }: { source: BookmarkSource; size?: number }) {
  switch (source) {
    case 'youtube': return <IconBrandYoutube size={size} />;
    case 'twitter': return <IconBrandX size={size} />;
    case 'tiktok':  return <IconBrandTiktok size={size} />;
    default:        return <IconWorld size={size} />;
  }
}

const SOURCE_LABEL: Record<BookmarkSource, string> = {
  youtube: 'YouTube',
  twitter: 'X / Twitter',
  tiktok: 'TikTok',
  article: 'Article',
  other: 'Link',
};

interface EnrichedLink {
  title?: string;
  summary?: string;
  source?: BookmarkSource;
  favicon?: string;
  tags?: string[];
  previewImage?: string;
  previewText?: string;
  saveReason?: string;
  personalContext?: string;
}

function withInstantPreview(url: string, data: EnrichedLink | null): EnrichedLink | null {
  const thumbnail = youtubeThumbnailUrl(url);
  if (!thumbnail) return data;
  return {
    ...(data ?? {}),
    previewImage: data?.previewImage ?? thumbnail,
    source: data?.source ?? detectSource(url),
  };
}

async function fetchLinkEnrichment(url: string, includeContext: boolean): Promise<EnrichedLink | null> {
  try {
    const res = await fetch('/api/enrich-link', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url, includeContext }),
    });
    if (!res.ok) return withInstantPreview(url, null);
    const data = (await res.json()) as EnrichedLink;
    return withInstantPreview(url, data);
  } catch {
    return withInstantPreview(url, null);
  }
}

interface AddBookmarkDialogProps {
  open: boolean;
  onClose: () => void;
}

export function AddBookmarkDialog({ open, onClose }: AddBookmarkDialogProps) {
  const { user } = useAuth();
  const { colors } = useAppColors();
  const addBookmark = useAppStore((s) => s.addBookmark);

  const [url, setUrl] = useState('');
  const [saveReason, setSaveReason] = useState('');
  const [personalContext, setPersonalContext] = useState('');
  const [enriched, setEnriched] = useState<EnrichedLink | null>(null);
  const [saving, setSaving] = useState(false);
  const [fetching, setFetching] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState('');

  const urlInputRef = useRef<HTMLInputElement>(null);
  const enrichTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (open) {
      setUrl('');
      setSaveReason('');
      setPersonalContext('');
      setEnriched(null);
      setError('');
      setFetching(false);
      setGenerating(false);
      setTimeout(() => urlInputRef.current?.focus(), 80);
    }
  }, [open]);

  useEffect(() => {
    return () => {
      if (enrichTimerRef.current) clearTimeout(enrichTimerRef.current);
    };
  }, []);

  function handleClose() {
    onClose();
  }

  function schedulePreviewFetch(nextUrl: string) {
    if (enrichTimerRef.current) clearTimeout(enrichTimerRef.current);
    const normalized = normalizeUrl(nextUrl);
    if (!normalized) {
      setEnriched(null);
      setFetching(false);
      return;
    }

    const instant = withInstantPreview(normalized, null);
    if (instant?.previewImage) setEnriched(instant);

    setFetching(true);
    enrichTimerRef.current = setTimeout(() => {
      void (async () => {
        try {
          const data = await fetchLinkEnrichment(normalized, false);
          setEnriched(data);
        } finally {
          setFetching(false);
        }
      })();
    }, 600);
  }

  function handleUrlChange(value: string) {
    setUrl(value);
    setError('');
    schedulePreviewFetch(value);
  }

  async function handleAiSuggest() {
    const normalized = normalizeUrl(url);
    if (!normalized) {
      setError('Paste a URL first');
      return;
    }
    setGenerating(true);
    setError('');
    try {
      const data = await fetchLinkEnrichment(normalized, true);
      if (!data) throw new Error('Could not generate suggestions');
      setEnriched(data);
      if (data.saveReason) setSaveReason(data.saveReason);
      if (data.personalContext) setPersonalContext(data.personalContext);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Suggest failed');
    } finally {
      setGenerating(false);
    }
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const normalized = normalizeUrl(url);
    if (!user?.id || !normalized) {
      setError('Paste a URL first');
      return;
    }

    setSaving(true);
    setError('');
    try {
      const meta = withInstantPreview(
        normalized,
        enriched ?? (await fetchLinkEnrichment(normalized, false)),
      );
      await addBookmark(user.id, {
        url: normalized,
        title: meta?.title?.trim() || normalized,
        summary: meta?.summary?.trim() || saveReason.trim() || normalized,
        source: meta?.source ?? detectSource(normalized),
        previewImage: meta?.previewImage ?? youtubeThumbnailUrl(normalized),
        previewText: meta?.previewText,
        favicon: meta?.favicon,
        tags: meta?.tags,
        saveReason: saveReason.trim() || meta?.saveReason || undefined,
        personalContext: personalContext.trim() || undefined,
      });
      handleClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not save bookmark');
    } finally {
      setSaving(false);
    }
  }

  if (!open) return null;

  const source: BookmarkSource = enriched?.source ?? detectSource(url);
  const hasUrl = Boolean(url.trim());

  return (
    <div
      className="fixed inset-0 z-[70] flex items-end justify-center sm:items-center"
      style={{ backgroundColor: 'rgba(0,0,0,0.55)' }}
      onClick={(e) => { if (e.target === e.currentTarget) handleClose(); }}
    >
      <div
        className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-t-[32px] sm:rounded-[32px]"
        style={{ backgroundColor: colors.cream }}
      >
        <div className="flex justify-center pt-3 sm:hidden">
          <div className="h-1 w-10 rounded-full" style={{ backgroundColor: colors.border }} />
        </div>

        <div className="flex items-center justify-between px-5 pb-4 pt-4">
          <h2 className="font-poppins text-[17px] font-bold" style={{ color: colors.text }}>
            Save a link
          </h2>
          <button
            type="button"
            onClick={handleClose}
            className="flex h-8 w-8 items-center justify-center rounded-xl transition hover:opacity-70"
            style={{ backgroundColor: colors.lavender }}
            aria-label="Close"
          >
            <IconX size={16} stroke={2} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 px-5 pb-6">
          {/* URL */}
          <div
            className="flex items-center gap-3 rounded-2xl border px-4 py-3.5 focus-within:ring-2"
            style={{ backgroundColor: colors.pageBackground, borderColor: colors.border }}
          >
            <IconLink size={18} stroke={2} style={{ color: colors.inkSoft, flexShrink: 0 }} />
            <input
              ref={urlInputRef}
              value={url}
              onChange={(e) => handleUrlChange(e.target.value)}
              placeholder="Paste any URL…"
              className="min-w-0 flex-1 bg-transparent font-poppins text-[14px] outline-none placeholder:opacity-50"
              style={{ color: colors.text }}
              autoComplete="off"
              spellCheck={false}
            />
            {url && (
              <button type="button" onClick={() => handleUrlChange('')} aria-label="Clear URL">
                <IconX size={15} stroke={2} style={{ color: colors.inkSoft }} />
              </button>
            )}
          </div>

          {hasUrl && (
            <div className="flex items-center gap-2">
              <div
                className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 font-poppins text-[12px] font-semibold"
                style={{ backgroundColor: colors.lavenderDeep, color: colors.text }}
              >
                <SourceIcon source={source} size={12} />
                {SOURCE_LABEL[source]}
              </div>
              {fetching && (
                <span className="font-poppins text-[12px]" style={{ color: colors.inkSoft }}>
                  Fetching preview…
                </span>
              )}
            </div>
          )}

          {/* Preview */}
          {(enriched?.previewImage || enriched?.title) && (
            <div
              className="flex gap-3 rounded-2xl p-3"
              style={{ backgroundColor: colors.lavender }}
            >
              {enriched.previewImage ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={enriched.previewImage}
                  alt=""
                  className="h-14 w-14 shrink-0 rounded-xl object-cover"
                  referrerPolicy="no-referrer"
                />
              ) : null}
              <div className="min-w-0 flex-1">
                <p className="line-clamp-2 font-poppins text-[13px] font-bold leading-tight" style={{ color: colors.text }}>
                  {enriched.title ?? url}
                </p>
                {enriched.tags && enriched.tags.length > 0 && (
                  <div className="mt-1.5 flex flex-wrap gap-1">
                    {enriched.tags.slice(0, 4).map((tag) => (
                      <span
                        key={tag}
                        className="rounded-full px-2 py-0.5 font-poppins text-[10px] font-semibold"
                        style={{ backgroundColor: colors.lavenderDeep, color: colors.text }}
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Why saving */}
          <div>
            <div className="mb-1.5 flex items-center justify-between gap-2">
              <label className="font-poppins text-[13px] font-semibold" style={{ color: colors.text }}>
                Why are you saving this?
              </label>
              <button
                type="button"
                onClick={() => void handleAiSuggest()}
                disabled={generating || !hasUrl}
                className="inline-flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1 font-poppins text-[12px] font-bold transition disabled:opacity-50"
                style={{ backgroundColor: colors.lavenderDeep, color: colors.text }}
              >
                <IconSparkles size={13} stroke={2} />
                {generating ? 'Writing…' : 'Suggest'}
              </button>
            </div>
            <textarea
              value={saveReason}
              onChange={(e) => setSaveReason(e.target.value)}
              rows={3}
              placeholder="What caught your attention? What do you want to remember?"
              className="w-full resize-none rounded-2xl border px-4 py-3 font-poppins text-[14px] outline-none transition focus:ring-2 placeholder:opacity-40"
              style={{
                backgroundColor: colors.pageBackground,
                borderColor: colors.border,
                color: colors.text,
              }}
            />
          </div>

          {/* Extra context */}
          <div>
            <label className="mb-1.5 block font-poppins text-[13px] font-semibold" style={{ color: colors.text }}>
              Extra context <span style={{ color: colors.inkSoft }}>(optional)</span>
            </label>
            <textarea
              value={personalContext}
              onChange={(e) => setPersonalContext(e.target.value)}
              rows={2}
              placeholder="Project, idea, or why this matters to you right now…"
              className="w-full resize-none rounded-2xl border px-4 py-3 font-poppins text-[14px] outline-none transition focus:ring-2 placeholder:opacity-40"
              style={{
                backgroundColor: colors.pageBackground,
                borderColor: colors.border,
                color: colors.text,
              }}
            />
          </div>

          {error && (
            <p className="font-poppins text-[13px]" style={{ color: colors.danger }}>{error}</p>
          )}

          <button
            type="submit"
            disabled={saving || !hasUrl}
            className="flex w-full items-center justify-center gap-2 rounded-[18px] py-3.5 font-poppins text-[15px] font-bold transition disabled:opacity-50"
            style={{ backgroundColor: colors.primary, color: colors.onAccent }}
          >
            {saving ? (
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
            ) : (
              <IconCheck size={18} stroke={2.5} />
            )}
            {saving ? 'Saving…' : 'Save bookmark'}
          </button>
        </form>
      </div>
    </div>
  );
}
