'use client';

import { IconPin, IconPinFilled } from '@tabler/icons-react';

import { useAppColors } from '@/hooks/use-app-colors';
import { cn } from '@/lib/utils';

interface PinToggleButtonProps {
  pinned: boolean;
  onToggle: () => void;
  size?: number;
  className?: string;
  disabled?: boolean;
}

export function PinToggleButton({
  pinned,
  onToggle,
  size = 18,
  className,
  disabled = false,
}: PinToggleButtonProps) {
  const { colors } = useAppColors();
  const Icon = pinned ? IconPinFilled : IconPin;

  return (
    <button
      type="button"
      onClick={onToggle}
      disabled={disabled}
      aria-label={pinned ? 'Unpin' : 'Pin'}
      className={cn(
        'inline-flex h-9 w-9 items-center justify-center rounded-full transition hover:scale-105 disabled:opacity-40',
        className,
      )}
      style={{
        backgroundColor: pinned ? `${colors.cyan}22` : colors.cream,
        color: pinned ? colors.cyan : colors.text,
      }}
    >
      <Icon size={size} stroke={2.2} />
    </button>
  );
}
