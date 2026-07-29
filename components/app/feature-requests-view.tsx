'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import {
  IconArrowLeft,
  IconChevronDown,
  IconChevronUp,
  IconPlus,
  IconSend,
  IconX,
} from '@tabler/icons-react';

import { useAuth } from '@/contexts/auth-provider';
import { useAppColors } from '@/hooks/use-app-colors';
import { appContentClass } from '@/lib/app-layout';
import {
  castFeatureVote,
  createFeatureRequest,
  fetchFeatureRequests,
} from '@/lib/supabase/feature-requests';
import type { FeatureRequest } from '@/lib/types/feature-request';
import { cn, formatRelativeDate } from '@/lib/utils';

function FeatureRequestCard({
  request,
  isOwn,
  voting,
  onVote,
}: {
  request: FeatureRequest;
  isOwn: boolean;
  voting: boolean;
  onVote: (requestId: string, vote: 1 | -1) => void;
}) {
  const { colors } = useAppColors();
  const upActive = request.userVote === 1;
  const downActive = request.userVote === -1;
  const scoreLabel = request.score > 0 ? `+${request.score}` : String(request.score);

  return (
    <article
      className="relative overflow-hidden rounded-[22px] border"
      style={{ backgroundColor: colors.cream, borderColor: colors.border }}
    >
      <div className="flex flex-col gap-2 p-4">
        <div className="flex items-center gap-2">
          {isOwn ? (
            <span
              className="rounded-full px-2 py-0.5 font-poppins text-[10px] font-semibold"
              style={{ backgroundColor: colors.peach, color: colors.text }}
            >
              Yours
            </span>
          ) : null}
          <span className="font-poppins text-[11px]" style={{ color: colors.inkSoft }}>
            {formatRelativeDate(request.createdAt)}
          </span>
        </div>

        <h2 className="font-poppins text-[15px] font-bold leading-snug tracking-tight" style={{ color: colors.text }}>
          {request.title}
        </h2>

        {request.body ? (
          <p className="line-clamp-4 font-poppins text-[13px] leading-relaxed" style={{ color: colors.inkSoft }}>
            {request.body}
          </p>
        ) : null}

        <div className="mt-1 flex items-stretch gap-2.5 border-t pt-3" style={{ borderColor: colors.border }}>
          <button
            type="button"
            disabled={voting}
            onClick={() => onVote(request.id, 1)}
            className="flex min-h-[44px] flex-1 items-center justify-center gap-1 rounded-[14px] border px-2 py-2.5 transition disabled:opacity-60"
            style={{
              backgroundColor: upActive ? `${colors.cyan}18` : colors.lavender,
              borderColor: upActive ? `${colors.cyan}55` : colors.border,
              color: upActive ? colors.cyan : colors.text,
            }}
          >
            <IconChevronUp size={16} stroke={2.4} />
            <span className="font-poppins text-[12px] font-medium">Up</span>
          </button>

          <div
            className="flex min-h-[44px] min-w-[52px] items-center justify-center rounded-[14px] border px-3 py-2.5"
            style={{
              backgroundColor:
                request.score > 0
                  ? `${colors.cyan}12`
                  : request.score < 0
                    ? `${colors.danger}14`
                    : colors.cream,
              borderColor:
                request.score > 0
                  ? `${colors.cyan}40`
                  : request.score < 0
                    ? `${colors.danger}35`
                    : colors.border,
            }}
          >
            <span
              className="font-poppins text-[15px] font-bold"
              style={{
                color:
                  request.score > 0
                    ? colors.cyan
                    : request.score < 0
                      ? colors.danger
                      : colors.subtitle,
              }}
            >
              {scoreLabel}
            </span>
          </div>

          <button
            type="button"
            disabled={voting}
            onClick={() => onVote(request.id, -1)}
            className="flex min-h-[44px] flex-1 items-center justify-center gap-1 rounded-[14px] border px-2 py-2.5 transition disabled:opacity-60"
            style={{
              backgroundColor: downActive ? `${colors.danger}14` : colors.lavender,
              borderColor: downActive ? `${colors.danger}44` : colors.border,
              color: downActive ? colors.danger : colors.text,
            }}
          >
            <IconChevronDown size={16} stroke={2.4} />
            <span className="font-poppins text-[12px] font-medium">Down</span>
          </button>
        </div>
      </div>

      {voting ? (
        <div
          className="absolute inset-0 flex items-center justify-center"
          style={{ backgroundColor: `${colors.cream}CC` }}
        >
          <span className="h-5 w-5 animate-spin rounded-full border-2 border-transparent border-t-current" style={{ color: colors.cyan }} />
        </div>
      ) : null}
    </article>
  );
}

function ComposeModal({
  open,
  submitting,
  onClose,
  onSubmit,
}: {
  open: boolean;
  submitting: boolean;
  onClose: () => void;
  onSubmit: (title: string, body: string) => void;
}) {
  const { colors } = useAppColors();
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');

  useEffect(() => {
    if (!open) {
      setTitle('');
      setBody('');
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center sm:p-6">
      <button
        type="button"
        aria-label="Close"
        className="absolute inset-0 bg-black/40"
        onClick={onClose}
      />
      <div
        className="relative z-10 flex max-h-[90vh] w-full max-w-lg flex-col overflow-hidden rounded-t-[24px] border sm:rounded-[24px]"
        style={{ backgroundColor: colors.pageBackground, borderColor: colors.border }}
        role="dialog"
        aria-modal="true"
        aria-labelledby="compose-request-title"
      >
        <div className="flex items-center justify-between px-5 py-4">
          <button
            type="button"
            onClick={onClose}
            className="flex h-10 w-10 items-center justify-center rounded-full"
            style={{ backgroundColor: colors.cream }}
            aria-label="Close"
          >
            <IconX size={18} stroke={2.2} style={{ color: colors.text }} />
          </button>
          <h2 id="compose-request-title" className="font-poppins text-[17px] font-bold tracking-tight" style={{ color: colors.text }}>
            New request
          </h2>
          <div className="h-10 w-10" />
        </div>

        <p className="px-6 pb-4 font-poppins text-[13px] leading-relaxed" style={{ color: colors.inkSoft }}>
          Tell us what you want built. Keep the title short and add context below if you like.
        </p>

        <div className="flex flex-1 flex-col gap-2 overflow-y-auto px-6 pb-4">
          <label className="font-poppins text-[12px] font-medium uppercase tracking-wide" style={{ color: colors.subtitle }}>
            Title
          </label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Home screen widget"
            maxLength={120}
            autoFocus
            className="rounded-[18px] border px-4 py-3.5 font-poppins text-[15px] font-medium outline-none focus:ring-2"
            style={{
              backgroundColor: colors.cream,
              borderColor: colors.border,
              color: colors.text,
            }}
          />

          <label className="mt-2 font-poppins text-[12px] font-medium uppercase tracking-wide" style={{ color: colors.subtitle }}>
            Details
          </label>
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="Why would this help you?"
            maxLength={500}
            rows={5}
            className="min-h-[140px] resize-none rounded-[18px] border px-4 py-3.5 font-poppins text-[14px] outline-none focus:ring-2"
            style={{
              backgroundColor: colors.cream,
              borderColor: colors.border,
              color: colors.text,
            }}
          />
        </div>

        <div className="px-6 pb-6 pt-2">
          <button
            type="button"
            disabled={submitting || !title.trim()}
            onClick={() => onSubmit(title, body)}
            className="flex w-full items-center justify-center gap-2 rounded-2xl py-3.5 font-poppins text-[14px] font-semibold transition disabled:opacity-45"
            style={{ backgroundColor: colors.inverted, color: colors.invertedText }}
          >
            {submitting ? (
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
            ) : (
              <>
                <IconSend size={16} stroke={2.2} />
                Post request
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

export function FeatureRequestsView() {
  const { colors } = useAppColors();
  const { user } = useAuth();

  const [requests, setRequests] = useState<FeatureRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [votingId, setVotingId] = useState<string | null>(null);
  const [composeOpen, setComposeOpen] = useState(false);

  const load = useCallback(async () => {
    if (!user?.id) {
      setRequests([]);
      return;
    }
    const data = await fetchFeatureRequests(user.id);
    setRequests(data);
  }, [user?.id]);

  useEffect(() => {
    void (async () => {
      try {
        setError('');
        await load();
      } catch {
        setError('Could not load requests. Try refreshing.');
      } finally {
        setLoading(false);
      }
    })();
  }, [load]);

  async function handleSubmit(title: string, body: string) {
    if (!user?.id) return;
    const trimmed = title.trim();
    if (!trimmed) {
      setMessage('Give your idea a short, clear title.');
      return;
    }

    setSubmitting(true);
    setMessage('');
    try {
      const created = await createFeatureRequest(user.id, trimmed, body);
      setRequests((prev) => [created, ...prev.filter((item) => item.id !== created.id)]);
      setComposeOpen(false);
      setMessage('Posted — your idea is live for others to vote on.');
    } catch {
      setMessage('Could not post. Check your connection and try again.');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleVote(requestId: string, vote: 1 | -1) {
    if (!user?.id) return;

    setVotingId(requestId);
    try {
      const nextVote = await castFeatureVote(user.id, requestId, vote);
      setRequests((prev) =>
        prev
          .map((item) => {
            if (item.id !== requestId) return item;
            const previous = item.userVote;
            let score = item.score;
            if (previous === vote) {
              score -= vote;
            } else {
              if (previous !== 0) score -= previous;
              score += vote;
            }
            return { ...item, score, userVote: nextVote };
          })
          .sort((a, b) => b.score - a.score || b.createdAt.localeCompare(a.createdAt)),
      );
    } catch {
      setMessage('Vote failed. Try again in a moment.');
    } finally {
      setVotingId(null);
    }
  }

  return (
    <div className={cn('py-6 md:py-8', appContentClass)}>
      <div className="mb-4 flex items-center gap-3">
        <Link
          href="/app/settings"
          className="flex h-10 w-10 items-center justify-center rounded-full transition hover:opacity-80"
          style={{ backgroundColor: colors.cream, boxShadow: `0 4px 12px ${colors.cardShadow}` }}
          aria-label="Back to settings"
        >
          <IconArrowLeft size={20} stroke={2.2} style={{ color: colors.text }} />
        </Link>
        <h1 className="min-w-0 flex-1 font-poppins text-[28px] font-bold tracking-tight" style={{ color: colors.text }}>
          Requests
        </h1>
        <button
          type="button"
          onClick={() => setComposeOpen(true)}
          className="flex h-10 w-10 items-center justify-center rounded-full transition hover:opacity-90"
          style={{ backgroundColor: colors.peach, boxShadow: `0 4px 12px ${colors.cardShadow}` }}
          aria-label="Add feature request"
        >
          <IconPlus size={20} stroke={2.4} style={{ color: colors.text }} />
        </button>
      </div>

      {message ? (
        <p className="mb-3 font-poppins text-[13px]" style={{ color: colors.inkSoft }}>
          {message}
        </p>
      ) : null}
      {error ? (
        <p className="mb-3 font-poppins text-[13px]" style={{ color: colors.danger }}>
          {error}
        </p>
      ) : null}

      {!loading && !error ? (
        <p className="mb-4 font-poppins text-[13px] leading-relaxed" style={{ color: colors.inkSoft }}>
          {requests.length === 0
            ? 'No ideas yet. Tap + to suggest the first one.'
            : `${requests.length} idea${requests.length === 1 ? '' : 's'} · sorted by votes`}
        </p>
      ) : null}

      {loading ? (
        <div className="flex justify-center py-16">
          <span className="h-5 w-5 animate-spin rounded-full border-2 border-transparent border-t-current" style={{ color: colors.cyan }} />
        </div>
      ) : requests.length === 0 && !error ? (
        <div
          className="flex flex-col items-center gap-2 rounded-[22px] border px-6 py-8 text-center"
          style={{ backgroundColor: colors.cream, borderColor: colors.border }}
        >
          <p className="font-poppins text-[15px] font-semibold" style={{ color: colors.text }}>
            Nothing here yet
          </p>
          <p className="mb-2 max-w-sm font-poppins text-[13px] leading-relaxed" style={{ color: colors.inkSoft }}>
            Share what you want built next — the community can vote on it.
          </p>
          <button
            type="button"
            onClick={() => setComposeOpen(true)}
            className="inline-flex items-center gap-1.5 rounded-[14px] px-5 py-3 font-poppins text-[13px] font-semibold"
            style={{ backgroundColor: colors.inverted, color: colors.invertedText }}
          >
            <IconPlus size={16} stroke={2.4} />
            Add request
          </button>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {requests.map((request) => (
            <FeatureRequestCard
              key={request.id}
              request={request}
              isOwn={request.userId === user?.id}
              voting={votingId === request.id}
              onVote={(id, vote) => void handleVote(id, vote)}
            />
          ))}
        </div>
      )}

      <ComposeModal
        open={composeOpen}
        submitting={submitting}
        onClose={() => setComposeOpen(false)}
        onSubmit={(title, body) => void handleSubmit(title, body)}
      />
    </div>
  );
}
