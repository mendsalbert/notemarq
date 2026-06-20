'use client';

import { IconNote, IconPlus } from '@tabler/icons-react';

import { useAppColors } from '@/hooks/use-app-colors';

interface QuickCaptureBarProps {
  onSaveLink: () => void;
  onAddNote: () => void;
}

export function QuickCaptureBar({ onSaveLink, onAddNote }: QuickCaptureBarProps) {
  const { colors } = useAppColors();

  return (
    <div
      className="mb-6 flex items-center gap-3 rounded-3xl px-4 py-3 transition-all"
      style={{ backgroundColor: colors.cream, boxShadow: `0 4px 16px ${colors.cardShadow}` }}
    >
      <button
        type="button"
        onClick={onSaveLink}
        className="min-w-0 flex-1 text-left text-sm transition hover:opacity-80"
        style={{ color: colors.inkSoft }}
      >
        Save a link or paste a URL…
      </button>

      <button
        type="button"
        onClick={onAddNote}
        className="flex h-10 w-10 items-center justify-center rounded-2xl transition hover:scale-105"
        style={{ backgroundColor: colors.lavenderDeep, color: colors.text }}
        aria-label="Add note"
      >
        <IconNote size={19} stroke={1.9} />
      </button>

      <button
        type="button"
        onClick={onSaveLink}
        className="flex h-10 w-10 items-center justify-center rounded-2xl transition hover:scale-105"
        style={{ backgroundColor: colors.primary, color: colors.onAccent }}
        aria-label="Save link"
      >
        <IconPlus size={20} stroke={2.2} />
      </button>
    </div>
  );
}
