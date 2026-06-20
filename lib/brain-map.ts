import type { AppColors } from '@/lib/colors';
import type { Bookmark, BookmarkSource } from '@/lib/types';

export type BrainMapSourceFilter =
  | 'all'
  | 'social'
  | 'web'
  | 'youtube'
  | 'twitter'
  | 'tiktok'
  | 'articles';

const SOCIAL_SOURCES: BookmarkSource[] = ['youtube', 'twitter', 'tiktok'];
const WEB_SOURCES: BookmarkSource[] = ['article', 'other'];

export const BRAIN_MAP_FILTERS: { id: BrainMapSourceFilter; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'social', label: 'Social' },
  { id: 'web', label: 'Web' },
  { id: 'youtube', label: 'YouTube' },
  { id: 'twitter', label: 'X' },
  { id: 'tiktok', label: 'TikTok' },
  { id: 'articles', label: 'Articles' },
];

/** Theme-aware warm tints — resolves per light/dark */
const CLUSTER_TINT_KEYS = [
  'lavenderDeep',
  'peach',
  'mint',
  'blushDeep',
  'coral',
  'primary',
  'lavender',
  'butter',
] as const satisfies readonly (keyof AppColors)[];

export function bubbleLabelColor(fill: string, colors: AppColors): string {
  if (fill === colors.primary || fill === colors.cyan) return colors.onAccent;
  if (fill === colors.coral) return colors.invertedText;
  return colors.text;
}

const LAYOUT_PADDING = 16;
const BUBBLE_GAP = 22;

function desiredSeparation(r1: number, r2: number) {
  return r1 + r2 + BUBBLE_GAP;
}

export interface TagCluster {
  tag: string;
  count: number;
  color: string;
  size: number;
}

export interface PlacedCluster extends TagCluster {
  x: number;
  y: number;
}

export interface TagEdge {
  from: string;
  to: string;
  weight: number;
}

interface LayoutNode extends PlacedCluster {
  cx: number;
  cy: number;
  r: number;
}

function clampNode(node: LayoutNode, width: number, height: number) {
  node.cx = Math.max(node.r + LAYOUT_PADDING, Math.min(width - node.r - LAYOUT_PADDING, node.cx));
  node.cy = Math.max(node.r + LAYOUT_PADDING, Math.min(height - node.r - LAYOUT_PADDING, node.cy));
  node.x = node.cx - node.r;
  node.y = node.cy - node.r;
}

function packCircles(clusters: TagCluster[], width: number, height: number): LayoutNode[] {
  if (clusters.length === 0) return [];

  const sorted = [...clusters].sort((a, b) => b.size - a.size);
  const cx = width / 2;
  const cy = height / 2;
  const n = sorted.length;

  if (n === 1) {
    const r = sorted[0].size / 2;
    return [{ ...sorted[0], cx, cy, r, x: cx - r, y: cy - r }];
  }

  const avgSize = sorted.reduce((sum, c) => sum + c.size, 0) / n + BUBBLE_GAP;
  const outerRadius = Math.max(avgSize * n * 0.24, Math.min(width, height) * 0.22);
  const innerRadius = outerRadius * 0.72;
  const useTwoRings = n > 9;

  return sorted.map((cluster, i) => {
    const r = cluster.size / 2;
    const onOuter = !useTwoRings || i % 2 === 0;
    const ringIndex = useTwoRings ? Math.floor(i / 2) : i;
    const ringCount = useTwoRings ? Math.ceil(n / 2) : n;
    const angle = (2 * Math.PI * ringIndex) / ringCount - Math.PI / 2 + (i % 2) * 0.18;
    const radius = onOuter ? outerRadius : innerRadius;
    const px = cx + Math.cos(angle) * radius;
    const py = cy + Math.sin(angle) * radius;
    const node: LayoutNode = { ...cluster, cx: px, cy: py, r, x: px - r, y: py - r };
    clampNode(node, width, height);
    return node;
  });
}

function expandToFill(nodes: LayoutNode[], width: number, height: number) {
  if (nodes.length <= 1) return;

  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;

  for (const n of nodes) {
    minX = Math.min(minX, n.cx - n.r);
    minY = Math.min(minY, n.cy - n.r);
    maxX = Math.max(maxX, n.cx + n.r);
    maxY = Math.max(maxY, n.cy + n.r);
  }

  const boxW = maxX - minX || 1;
  const boxH = maxY - minY || 1;
  const targetW = (width - LAYOUT_PADDING * 2) * 0.78;
  const targetH = (height - LAYOUT_PADDING * 2) * 0.78;
  const scale = Math.min(targetW / boxW, targetH / boxH, 1.2);
  if (scale <= 1.02) return;

  const boxCx = (minX + maxX) / 2;
  const boxCy = (minY + maxY) / 2;

  for (const node of nodes) {
    node.cx = width / 2 + (node.cx - boxCx) * scale;
    node.cy = height / 2 + (node.cy - boxCy) * scale;
    clampNode(node, width, height);
  }
}

function relaxLayout(nodes: LayoutNode[], width: number, height: number) {
  for (let iter = 0; iter < 70; iter++) {
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const a = nodes[i];
        const b = nodes[j];
        const dx = b.cx - a.cx;
        const dy = b.cy - a.cy;
        const dist = Math.sqrt(dx * dx + dy * dy) || 0.01;
        const minDist = desiredSeparation(a.r, b.r);

        if (dist < minDist) {
          const push = ((minDist - dist) / dist) * 0.42;
          const nx = dx / dist;
          const ny = dy / dist;
          a.cx -= nx * push * dist;
          a.cy -= ny * push * dist;
          b.cx += nx * push * dist;
          b.cy += ny * push * dist;
        }
      }
    }
    for (const node of nodes) {
      clampNode(node, width, height);
    }
  }
}

export function filterBookmarksForBrainMap(
  bookmarks: Bookmark[],
  filter: BrainMapSourceFilter,
): Bookmark[] {
  switch (filter) {
    case 'social':
      return bookmarks.filter((b) => SOCIAL_SOURCES.includes(b.source));
    case 'web':
      return bookmarks.filter((b) => WEB_SOURCES.includes(b.source));
    case 'youtube':
      return bookmarks.filter((b) => b.source === 'youtube');
    case 'twitter':
      return bookmarks.filter((b) => b.source === 'twitter');
    case 'tiktok':
      return bookmarks.filter((b) => b.source === 'tiktok');
    case 'articles':
      return bookmarks.filter((b) => b.source === 'article');
    default:
      return bookmarks;
  }
}

export function buildTagClusters(bookmarks: Bookmark[], colors: AppColors): TagCluster[] {
  const map = new Map<string, number>();
  for (const b of bookmarks) {
    for (const tag of b.tags) {
      map.set(tag, (map.get(tag) ?? 0) + 1);
    }
  }

  return [...map.entries()]
    .sort((a, b) => b[1] - a[1])
    .map(([tag, count], i) => {
      const tintKey = CLUSTER_TINT_KEYS[i % CLUSTER_TINT_KEYS.length];
      return {
        tag,
        count,
        color: colors[tintKey],
        size: 80 + Math.min(count * 10, 44),
      };
    });
}

export function buildTagEdges(bookmarks: Bookmark[]): TagEdge[] {
  const edgeMap = new Map<string, number>();

  for (const b of bookmarks) {
    const tags = [...new Set(b.tags)];
    for (let i = 0; i < tags.length; i++) {
      for (let j = i + 1; j < tags.length; j++) {
        const [from, to] = tags[i] < tags[j] ? [tags[i], tags[j]] : [tags[j], tags[i]];
        const key = `${from}::${to}`;
        edgeMap.set(key, (edgeMap.get(key) ?? 0) + 1);
      }
    }
  }

  return [...edgeMap.entries()]
    .map(([key, weight]) => {
      const [from, to] = key.split('::');
      return { from, to, weight };
    })
    .sort((a, b) => b.weight - a.weight);
}

export function layoutClusters(
  clusters: TagCluster[],
  width: number,
  height: number,
  _edges: TagEdge[] = [],
): PlacedCluster[] {
  const packed = packCircles(clusters, width, height);
  relaxLayout(packed, width, height);
  expandToFill(packed, width, height);
  return packed.map(({ x, y, tag, count, color, size }) => ({ tag, count, color, size, x, y }));
}

export function getClusterCenter(cluster: PlacedCluster) {
  return { x: cluster.x + cluster.size / 2, y: cluster.y + cluster.size / 2 };
}

export function getFilterEmptyMessage(filter: BrainMapSourceFilter): string {
  switch (filter) {
    case 'social':
      return 'No social saves yet — bookmark from YouTube, X, or TikTok.';
    case 'web':
      return 'No web articles saved yet.';
    case 'youtube':
      return 'No YouTube videos in your brain map yet.';
    case 'twitter':
      return 'No X posts saved yet.';
    case 'tiktok':
      return 'No TikTok saves yet.';
    case 'articles':
      return 'No articles saved yet.';
    default:
      return 'Save a few links to grow your brain map.';
  }
}
