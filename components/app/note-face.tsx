'use client';

type NoteFaceSize = 'xs' | 'sm' | 'md' | 'lg';

/** Reject icon-name strings like "document-outline" — only allow real emoji. */
function isRealEmoji(value?: string): boolean {
  if (!value) return false;
  // Icon names are ASCII words joined by hyphens, e.g. "document-outline"
  if (/^[a-z0-9-]+$/.test(value)) return false;
  return true;
}

const SIZE_MAP: Record<
  NoteFaceSize,
  { wrap: number; radius: number; emoji: number; letter: number }
> = {
  xs: { wrap: 24, radius: 8, emoji: 14, letter: 11 },
  sm: { wrap: 28, radius: 9, emoji: 16, letter: 12 },
  md: { wrap: 42, radius: 13, emoji: 24, letter: 18 },
  lg: { wrap: 56, radius: 16, emoji: 32, letter: 24 },
};

interface NoteFaceProps {
  color: string;
  emoji?: string;
  name?: string;
  size?: NoteFaceSize;
  compact?: boolean;
}

export function NoteFace({
  color,
  emoji: rawEmoji,
  name,
  size = 'md',
  compact = false,
}: NoteFaceProps) {
  const dims = SIZE_MAP[size];
  const initial = (name?.trim().charAt(0) || 'N').toUpperCase();
  const emoji = isRealEmoji(rawEmoji) ? rawEmoji : undefined;

  if (compact) {
    if (emoji) {
      return <span style={{ fontSize: dims.emoji, lineHeight: 1 }}>{emoji}</span>;
    }

    return (
      <span
        className="flex items-center justify-center font-poppins font-bold"
        style={{
          width: dims.wrap,
          height: dims.wrap,
          borderRadius: dims.radius,
          fontSize: dims.letter,
          backgroundColor: `${color}33`,
          color,
        }}
      >
        {initial}
      </span>
    );
  }

  return (
    <div
      className="flex items-center justify-center"
      style={{
        width: dims.wrap,
        height: dims.wrap,
        borderRadius: dims.radius,
        backgroundColor: `${color}22`,
      }}
    >
      {emoji ? (
        <span style={{ fontSize: dims.emoji, lineHeight: 1 }}>{emoji}</span>
      ) : (
        <span className="font-poppins font-bold" style={{ fontSize: dims.letter, color }}>
          {initial}
        </span>
      )}
    </div>
  );
}
