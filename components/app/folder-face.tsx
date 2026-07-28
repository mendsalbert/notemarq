'use client';

import type { ComponentType, CSSProperties } from 'react';
import {
  IconBook,
  IconBrain,
  IconBrandX,
  IconBrandYoutube,
  IconBriefcase,
  IconBulb,
  IconCamera,
  IconCode,
  IconDeviceGamepad2,
  IconFlame,
  IconHeart,
  IconHeadphones,
  IconMap,
  IconMusic,
  IconNote,
  IconPalette,
  IconPlanet,
  IconPlant,
  IconRocket,
  IconShoppingBag,
  IconSparkles,
  IconStar,
  IconWorld,
} from '@tabler/icons-react';

type FolderFaceSize = 'xs' | 'sm' | 'md' | 'lg';

type IconComponent = ComponentType<{ size?: number; stroke?: number; style?: CSSProperties }>;

const CUTE_ICONS: IconComponent[] = [
  IconSparkles,
  IconStar,
  IconHeart,
  IconFlame,
  IconPlanet,
  IconPlant,
  IconRocket,
  IconBulb,
  IconBrain,
  IconPalette,
  IconHeadphones,
  IconBook,
  IconNote,
  IconCamera,
  IconCode,
  IconMusic,
  IconMap,
  IconWorld,
  IconBriefcase,
  IconShoppingBag,
  IconDeviceGamepad2,
];

const KEYWORD_ICONS: { match: RegExp; icon: IconComponent }[] = [
  { match: /youtube|yt\b/i, icon: IconBrandYoutube },
  { match: /\bx\b|twitter|tweet/i, icon: IconBrandX },
  { match: /tiktok|music|song|audio/i, icon: IconMusic },
  { match: /note|journal|writ/i, icon: IconNote },
  { match: /read|article|blog|book/i, icon: IconBook },
  { match: /design|art|creat/i, icon: IconPalette },
  { match: /code|dev|tech|eng/i, icon: IconCode },
  { match: /food|cook|recipe/i, icon: IconFlame },
  { match: /travel|trip|map/i, icon: IconMap },
  { match: /work|job|career/i, icon: IconBriefcase },
  { match: /idea|brain|think/i, icon: IconBulb },
  { match: /love|favou?rite|star/i, icon: IconStar },
  { match: /shop|buy|wish/i, icon: IconShoppingBag },
  { match: /game|play/i, icon: IconDeviceGamepad2 },
  { match: /photo|image|pic/i, icon: IconCamera },
  { match: /listen|headphone|podcast/i, icon: IconHeadphones },
  { match: /plant|nature|green/i, icon: IconPlant },
  { match: /space|planet|astro/i, icon: IconPlanet },
  { match: /rocket|launch|start/i, icon: IconRocket },
  { match: /spark|magic|cute/i, icon: IconSparkles },
];

function hashSeed(input: string) {
  let hash = 0;
  for (let i = 0; i < input.length; i += 1) {
    hash = (hash * 31 + input.charCodeAt(i)) >>> 0;
  }
  return hash;
}

function cuteIconFor(name?: string, color?: string): IconComponent {
  const label = name?.trim() ?? '';
  for (const { match, icon } of KEYWORD_ICONS) {
    if (label && match.test(label)) return icon;
  }
  const seed = hashSeed(`${label}|${color ?? ''}`);
  return CUTE_ICONS[seed % CUTE_ICONS.length];
}

const SIZE_MAP: Record<
  FolderFaceSize,
  { wrap: number; radius: number; icon: number }
> = {
  xs: { wrap: 28, radius: 9, icon: 15 },
  sm: { wrap: 36, radius: 11, icon: 18 },
  md: { wrap: 44, radius: 13, icon: 22 },
  lg: { wrap: 56, radius: 16, icon: 28 },
};

interface FolderFaceProps {
  color: string;
  /** Ignored — folders use icons, not emoji glyphs. */
  emoji?: string;
  name?: string;
  size?: FolderFaceSize;
  /** @deprecated Kept for call-site compatibility. */
  compact?: boolean;
}

export function FolderFace({
  color,
  name,
  size = 'md',
}: FolderFaceProps) {
  const dims = SIZE_MAP[size];
  const Icon = cuteIconFor(name, color);

  return (
    <span
      className="inline-flex shrink-0 items-center justify-center"
      style={{
        width: dims.wrap,
        height: dims.wrap,
        borderRadius: dims.radius,
        backgroundColor: `${color}24`,
      }}
      aria-hidden
    >
      <Icon size={dims.icon} stroke={1.85} style={{ color }} />
    </span>
  );
}
