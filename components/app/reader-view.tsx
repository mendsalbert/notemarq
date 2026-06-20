'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  IconArrowLeft,
  IconExternalLink,
  IconStarFilled,
  IconBookmark,
  IconBulb,
  IconMessageCircle,
  IconFolder,
  IconNote,
  IconClock,
  IconPencil,
  IconCheck,
  IconX,
  IconTrash,
} from '@tabler/icons-react';

import { LinkPreviewThumb, SourceIcon } from '@/components/app/link-preview';
import { useAppColors } from '@/hooks/use-app-colors';
import { useImageAccent } from '@/hooks/use-image-accent';
import { useAppStore } from '@/store/app-store';
import type { BookmarkSource } from '@/lib/types';
import { formatRelativeDate } from '@/lib/utils';

const sourceLabels: Record<BookmarkSource, string> = {
  twitter: 'X',
  youtube: 'YouTube',
  tiktok: 'TikTok',
  article: 'Article',
  other: 'Link',
};

const SOURCE_TINTS: Record<BookmarkSource, 'peach' | 'lavender' | 'mint' | 'butter' | 'blushDeep'> = {
  youtube: 'peach',
  twitter: 'lavender',
  tiktok: 'mint',
  article: 'butter',
  other: 'blushDeep',
};

function getDomain(url: string) {
  try {
    return new URL(url).hostname.replace(/^www\./, '');
  } catch {
    return url;
  }
}

function formatLongDate(value: string) {
  const parsed = /^\d{4}-\d{2}-\d{2}$/.test(value)
    ? new Date(`${value}T12:00:00`)
    : new Date(value);
  if (Number.isNaN(parsed.getTime())) return '';
  return parsed.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
}

interface InsightCardProps {
  title: string;
  icon: React.ReactNode;
  iconBg: string;
  cardBg: string;
  value: string;
  placeholder: string;
  editing: boolean;
  draft: string;
  onEdit: () => void;
  onDraftChange: (value: string) => void;
  onSave: () => void;
  onCancel: () => void;
  colors: ReturnType<typeof useAppColors>['colors'];
}

function InsightCard({
  title,
  icon,
  iconBg,
  cardBg,
  value,
  placeholder,
  editing,
  draft,
  onEdit,
  onDraftChange,
  onSave,
  onCancel,
  colors,
}: InsightCardProps) {
  return (
    <div
      className="rounded-[22px] p-5 md:p-6"
      style={{ backgroundColor: cardBg }}
    >
      <div className="mb-3 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span
            className="flex h-8 w-8 items-center justify-center rounded-full"
            style={{ backgroundColor: iconBg }}
          >
            {icon}
          </span>
          <h2 className="font-poppins text-[13px] font-bold uppercase tracking-wider" style={{ color: colors.text }}>
            {title}
          </h2>
        </div>
        {editing ? (
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={onSave}
              className="flex h-8 w-8 items-center justify-center rounded-full transition hover:scale-105"
              style={{ backgroundColor: colors.cream, color: colors.text }}
              aria-label="Save"
            >
              <IconCheck size={15} stroke={2.5} />
            </button>
            <button
              type="button"
              onClick={onCancel}
              className="flex h-8 w-8 items-center justify-center rounded-full transition hover:scale-105"
              style={{ backgroundColor: colors.cream, color: colors.inkSoft }}
              aria-label="Cancel"
            >
              <IconX size={15} stroke={2} />
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={onEdit}
            className="flex h-8 w-8 items-center justify-center rounded-full transition hover:scale-105"
            style={{ backgroundColor: colors.cream, color: colors.inkSoft }}
            aria-label={`Edit ${title}`}
          >
            <IconPencil size={14} stroke={2} />
          </button>
        )}
      </div>

      {editing ? (
        <textarea
          value={draft}
          onChange={(e) => onDraftChange(e.target.value)}
          placeholder={placeholder}
          rows={4}
          className="w-full resize-none rounded-xl border-0 bg-transparent font-poppins text-[14px] leading-[1.7] outline-none placeholder:opacity-40"
          style={{ color: colors.text, backgroundColor: colors.cream }}
          autoFocus
        />
      ) : (
        <p className="font-poppins text-[14px] leading-[1.7]" style={{ color: colors.inkSoft }}>
          {value.trim() || placeholder}
        </p>
      )}
    </div>
  );
}

export function ReaderView({ id }: { id: string }) {
  const router = useRouter();
  const { colors } = useAppColors();
  const bookmarks = useAppStore((s) => s.bookmarks);
  const notes = useAppStore((s) => s.notes);
  const folders = useAppStore((s) => s.folders);
  const updateBookmark = useAppStore((s) => s.updateBookmark);
  const deleteBookmark = useAppStore((s) => s.deleteBookmark);
  const bookmark = bookmarks.find((b) => b.id === id);

  const [editingReason, setEditingReason] = useState(false);
  const [editingContext, setEditingContext] = useState(false);
  const [reasonDraft, setReasonDraft] = useState('');
  const [contextDraft, setContextDraft] = useState('');

  const linkedNote = notes.find((n) => n.id === bookmark?.ideaId);
  const folder = folders.find((f) => f.id === bookmark?.folderId);
  const fallbackBg = bookmark
    ? bookmark.previewImage
      ? colors.lavender
      : colors[SOURCE_TINTS[bookmark.source]]
    : colors.lavender;
  const cardBg = useImageAccent(bookmark?.previewImage, fallbackBg);

  useEffect(() => {
    if (!bookmark) return;
    if (!editingReason) setReasonDraft(bookmark.saveReason ?? '');
    if (!editingContext) setContextDraft(bookmark.personalContext ?? '');
  }, [bookmark, editingReason, editingContext]);

  if (!bookmark) {
    return (
      <div className="mx-auto max-w-2xl px-5 py-16 text-center">
        <p className="font-poppins text-base font-bold" style={{ color: colors.text }}>
          Save not found
        </p>
        <Link
          href="/app"
          className="mt-4 inline-block font-poppins text-sm font-medium"
          style={{ color: colors.primary }}
        >
          Back to library
        </Link>
      </div>
    );
  }

  const previewSnippet = bookmark.previewText ?? bookmark.summary;
  const domain = getDomain(bookmark.url);
  const savedWhen = formatRelativeDate(bookmark.dateAdded);
  const savedDate = formatLongDate(bookmark.dateAdded);

  async function handleDelete() {
    const confirmed = window.confirm(`Delete "${bookmark!.title}"? This cannot be undone.`);
    if (!confirmed) return;
    await deleteBookmark(bookmark!.id);
    router.push('/app');
  }

  async function saveReason() {
    await updateBookmark(bookmark!.id, { saveReason: reasonDraft.trim() });
    setEditingReason(false);
  }

  async function saveContext() {
    await updateBookmark(bookmark!.id, { personalContext: contextDraft.trim() });
    setEditingContext(false);
  }

  return (
    <div className="mx-auto w-full max-w-[1400px] px-4 py-5 md:px-6 md:py-6">
      <div className="flex items-center justify-between gap-3">
        <Link
          href="/app"
          className="inline-flex h-9 w-9 items-center justify-center rounded-full transition hover:scale-105"
          style={{ backgroundColor: colors.cream, boxShadow: `0 2px 8px ${colors.cardShadow}` }}
          aria-label="Back to library"
        >
          <IconArrowLeft size={18} stroke={2} style={{ color: colors.text }} />
        </Link>
        <button
          type="button"
          onClick={() => void handleDelete()}
          className="inline-flex items-center gap-2 rounded-full px-4 py-2 font-poppins text-[13px] font-semibold transition hover:opacity-80"
          style={{ backgroundColor: colors.cream, color: colors.danger, boxShadow: `0 2px 8px ${colors.cardShadow}` }}
        >
          <IconTrash size={15} stroke={2} />
          Delete
        </button>
      </div>

      <article
        className="mt-5 overflow-hidden rounded-[28px]"
        style={{
          backgroundColor: cardBg,
          boxShadow: `0 8px 32px ${colors.cardShadow}`,
        }}
      >
        {bookmark.previewImage ? (
          <div
            className="relative flex w-full items-center justify-center"
            style={{ backgroundColor: colors.cream }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={bookmark.previewImage}
              alt=""
              className="block max-h-[min(52vh,480px)] w-full object-contain object-center"
              loading="eager"
              decoding="async"
              referrerPolicy="no-referrer"
            />
            {bookmark.isFavorite ? (
              <span
                className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full"
                style={{ backgroundColor: colors.cream }}
              >
                <IconStarFilled size={16} style={{ color: colors.cyan }} />
              </span>
            ) : null}
          </div>
        ) : (
          <div
            className="flex items-center justify-center px-6 py-14"
            style={{ backgroundColor: colors.cream }}
          >
            <LinkPreviewThumb
              favicon={bookmark.favicon}
              source={bookmark.source}
              className="h-24 w-24 rounded-[22px]"
            />
          </div>
        )}

        <div className="p-6 md:p-10">
          <div className="mb-5 flex flex-wrap items-center gap-2">
            <span
              className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 font-poppins text-[11px] font-semibold"
              style={{ backgroundColor: colors.cream, color: colors.text }}
            >
              <SourceIcon source={bookmark.source} size={13} />
              {sourceLabels[bookmark.source]}
            </span>
            <span
              className="inline-flex items-center rounded-full px-3 py-1.5 font-poppins text-[11px] font-semibold"
              style={{ backgroundColor: colors.lavenderDeep, color: colors.text }}
            >
              {domain}
            </span>
            {savedWhen ? (
              <span
                className="inline-flex items-center gap-1 rounded-full px-3 py-1.5 font-poppins text-[11px] font-semibold"
                style={{ backgroundColor: colors.mint, color: colors.text }}
              >
                <IconClock size={12} stroke={2} />
                Saved {savedWhen}
              </span>
            ) : null}
            {folder ? (
              <Link
                href={`/app/folders/${folder.id}`}
                className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 font-poppins text-[11px] font-semibold transition hover:opacity-80"
                style={{ backgroundColor: colors.peach, color: colors.text }}
              >
                <IconFolder size={12} stroke={2} />
                {folder.emoji ? `${folder.emoji} ` : ''}{folder.name}
              </Link>
            ) : null}
          </div>

          <h1
            className="font-poppins text-[30px] font-bold leading-[1.15] tracking-tight md:text-[38px]"
            style={{ color: colors.text }}
          >
            {bookmark.title}
          </h1>

          {savedDate ? (
            <p className="mt-3 font-poppins text-[13px]" style={{ color: colors.inkSoft }}>
              {savedDate}
            </p>
          ) : null}

          {previewSnippet ? (
            <p
              className="mt-6 max-w-3xl font-poppins text-[16px] leading-[1.75] md:text-[17px]"
              style={{ color: colors.inkSoft }}
            >
              {previewSnippet}
            </p>
          ) : null}

          {bookmark.tags.length > 0 ? (
            <div className="mt-6 flex flex-wrap gap-2">
              {bookmark.tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-full px-3 py-1 font-poppins text-[11px] font-semibold"
                  style={{ backgroundColor: colors.cream, color: colors.inkSoft }}
                >
                  #{tag}
                </span>
              ))}
            </div>
          ) : null}

          <div className="mt-8 grid gap-4 md:grid-cols-2">
            <InsightCard
              title="Why you saved this"
              icon={<IconBulb size={16} stroke={2} style={{ color: colors.text }} />}
              iconBg={colors.lavenderDeep}
              cardBg={colors.lavender}
              value={bookmark.saveReason ?? ''}
              placeholder="No reason captured yet — tap edit to add one."
              editing={editingReason}
              draft={reasonDraft}
              onEdit={() => setEditingReason(true)}
              onDraftChange={setReasonDraft}
              onSave={() => void saveReason()}
              onCancel={() => {
                setReasonDraft(bookmark.saveReason ?? '');
                setEditingReason(false);
              }}
              colors={colors}
            />

            <InsightCard
              title="Your context"
              icon={<IconMessageCircle size={16} stroke={2} style={{ color: colors.text }} />}
              iconBg={colors.cream}
              cardBg={colors.mint}
              value={bookmark.personalContext ?? ''}
              placeholder="No personal notes yet — tap edit to add your thoughts."
              editing={editingContext}
              draft={contextDraft}
              onEdit={() => setEditingContext(true)}
              onDraftChange={setContextDraft}
              onSave={() => void saveContext()}
              onCancel={() => {
                setContextDraft(bookmark.personalContext ?? '');
                setEditingContext(false);
              }}
              colors={colors}
            />
          </div>

          <div className="mt-8 flex flex-wrap items-center gap-3">
            <a
              href={bookmark.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-full px-5 py-3 font-poppins text-[13px] font-bold transition hover:opacity-90"
              style={{ backgroundColor: colors.inverted, color: colors.invertedText }}
            >
              <IconExternalLink size={16} stroke={2} />
              Open original
            </a>
            {bookmark.isFavorite ? (
              <span
                className="inline-flex items-center gap-1.5 rounded-full px-4 py-2.5 font-poppins text-[12px] font-semibold"
                style={{ backgroundColor: colors.cream, color: colors.text }}
              >
                <IconStarFilled size={14} style={{ color: colors.cyan }} />
                Starred
              </span>
            ) : null}
          </div>
        </div>
      </article>

      {linkedNote ? (
        <section className="mt-8">
          <h2
            className="mb-4 font-poppins text-[11px] font-bold uppercase tracking-widest"
            style={{ color: colors.subtitle }}
          >
            Linked note
          </h2>
          <Link
            href={`/app/notes/${linkedNote.id}`}
            className="flex items-center gap-4 rounded-[22px] p-5 transition-all hover:-translate-y-0.5"
            style={{
              backgroundColor: colors.lavenderDeep,
              boxShadow: `0 4px 16px ${colors.cardShadow}`,
            }}
          >
            <span
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[14px]"
              style={{ backgroundColor: colors.cream }}
            >
              <IconNote size={20} stroke={2} style={{ color: colors.text }} />
            </span>
            <div className="min-w-0 flex-1">
              <p className="font-poppins text-[15px] font-bold leading-tight" style={{ color: colors.text }}>
                {linkedNote.name || 'Untitled note'}
              </p>
              <p className="mt-1 line-clamp-2 font-poppins text-[13px] leading-relaxed" style={{ color: colors.inkSoft }}>
                {linkedNote.description || linkedNote.notes || 'Open note'}
              </p>
            </div>
            <IconBookmark size={18} stroke={2} style={{ color: colors.inkSoft }} />
          </Link>
        </section>
      ) : null}
    </div>
  );
}
