import type { AppColors } from '@/lib/colors';

/** Stable keys stored in note.color — resolves to theme-aware bg/accent */
export const NOTE_PALETTE_KEYS = [
  'cream',
  'blush',
  'butter',
  'lavender',
  'mint',
  'peach',
  'lavenderDeep',
  'blushDeep',
] as const;

export type NotePaletteKey = (typeof NOTE_PALETTE_KEYS)[number];

const ACCENT_BY_KEY: Record<NotePaletteKey, (colors: AppColors) => string> = {
  cream: (c) => c.primary,
  blush: (c) => c.coral,
  butter: () => '#C9A227',
  lavender: () => '#8B5CF6',
  mint: () => '#10B981',
  peach: (c) => c.coral,
  lavenderDeep: () => '#7C3AED',
  blushDeep: () => '#EC4899',
};

/** Legacy light-mode hex values saved before palette keys */
const LIGHT_HEX_TO_KEY: Record<string, NotePaletteKey> = {
  '#ffffff': 'cream',
  '#fff0f3': 'blush',
  '#fff6d6': 'butter',
  '#f3eeff': 'lavender',
  '#ecf9f2': 'mint',
  '#fff4ec': 'peach',
  '#e8deff': 'lavenderDeep',
  '#ffe8ee': 'blushDeep',
};

/** Legacy accent hex from older notes */
const ACCENT_HEX_TO_KEY: Record<string, NotePaletteKey> = {
  '#4fc3f7': 'cream',
  '#e8876a': 'peach',
  '#c9a227': 'butter',
  '#8b5cf6': 'lavender',
  '#10b981': 'mint',
  '#7c3aed': 'lavenderDeep',
  '#ec4899': 'blushDeep',
};

export interface NotePaletteEntry {
  key: NotePaletteKey;
  bg: string;
  accent: string;
}

export function getNotePaletteOptions(colors: AppColors): NotePaletteEntry[] {
  return NOTE_PALETTE_KEYS.map((key) => ({
    key,
    bg: colors[key],
    accent: ACCENT_BY_KEY[key](colors),
  }));
}

export function resolveNotePalette(
  color: string | undefined,
  colors: AppColors,
): NotePaletteEntry {
  let key: NotePaletteKey = 'lavender';

  if (color && NOTE_PALETTE_KEYS.includes(color as NotePaletteKey)) {
    key = color as NotePaletteKey;
  } else if (color) {
    const normalized = color.toLowerCase();
    key = LIGHT_HEX_TO_KEY[normalized] ?? ACCENT_HEX_TO_KEY[normalized] ?? 'lavender';
  }

  return {
    key,
    bg: colors[key],
    accent: ACCENT_BY_KEY[key](colors),
  };
}
