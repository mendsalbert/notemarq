'use client';

import { useEffect, useMemo, useRef, useState } from 'react';

import { useAppColors } from '@/hooks/use-app-colors';
import {
  buildTagEdges,
  bubbleLabelColor,
  getClusterCenter,
  layoutClusters,
  type PlacedCluster,
  type TagCluster,
} from '@/lib/brain-map';
import type { Bookmark } from '@/lib/types';
import { cn } from '@/lib/utils';

interface BrainMapBubbleCloudProps {
  clusters: TagCluster[];
  bookmarks: Bookmark[];
  onTagPress?: (tag: string) => void;
}

function curvedPath(x1: number, y1: number, x2: number, y2: number, bend = 0.22) {
  const mx = (x1 + x2) / 2;
  const my = (y1 + y2) / 2;
  const dx = x2 - x1;
  const dy = y2 - y1;
  const len = Math.sqrt(dx * dx + dy * dy) || 1;
  const nx = (-dy / len) * len * bend;
  const ny = (dx / len) * len * bend;
  return `M ${x1} ${y1} Q ${mx + nx} ${my + ny} ${x2} ${y2}`;
}

function GraphEdges({
  placed,
  edges,
  width,
  height,
  strokeColor,
}: {
  placed: PlacedCluster[];
  edges: ReturnType<typeof buildTagEdges>;
  width: number;
  height: number;
  strokeColor: string;
}) {
  const byTag = new Map(placed.map((c) => [c.tag, c]));
  const maxWeight = Math.max(1, ...edges.map((e) => e.weight));

  return (
    <svg width={width} height={height} className="pointer-events-none absolute left-0 top-0">
      {edges.map((edge) => {
        const from = byTag.get(edge.from);
        const to = byTag.get(edge.to);
        if (!from || !to) return null;

        const a = getClusterCenter(from);
        const b = getClusterCenter(to);
        const strength = edge.weight / maxWeight;
        const strokeWidth = 1.2 + strength * 2.2;
        const opacity = 0.2 + strength * 0.45;

        return (
          <path
            key={`${edge.from}-${edge.to}`}
            d={curvedPath(a.x, a.y, b.x, b.y)}
            stroke={strokeColor}
            strokeWidth={strokeWidth}
            strokeOpacity={opacity}
            fill="none"
            strokeLinecap="round"
          />
        );
      })}
    </svg>
  );
}

export function BrainMapBubbleCloud({ clusters, bookmarks, onTagPress }: BrainMapBubbleCloudProps) {
  const { colors } = useAppColors();
  const arenaRef = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(0);

  const edges = useMemo(() => buildTagEdges(bookmarks), [bookmarks]);
  const canvasHeight = useMemo(() => Math.max(440, 120 + clusters.length * 46), [clusters.length]);

  const placed = useMemo(
    () => (width > 0 ? layoutClusters(clusters, width, canvasHeight, edges) : []),
    [clusters, width, canvasHeight, edges],
  );

  useEffect(() => {
    const el = arenaRef.current;
    if (!el) return;

    const observer = new ResizeObserver((entries) => {
      const next = entries[0]?.contentRect.width ?? 0;
      setWidth(next);
    });
    observer.observe(el);
    setWidth(el.clientWidth);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={arenaRef} className="relative w-full" style={{ minHeight: canvasHeight }}>
      {width > 0 && (
        <>
          <GraphEdges
            placed={placed}
            edges={edges}
            width={width}
            height={canvasHeight}
            strokeColor={colors.primary}
          />
          {placed.map((cluster, index) => {
            const labelColor = bubbleLabelColor(cluster.color, colors);
            return (
            <button
              key={cluster.tag}
              type="button"
              onClick={() => onTagPress?.(cluster.tag)}
              className={cn(
                'absolute flex flex-col items-center justify-center rounded-full border px-2',
                'animate-brain-bob',
              )}
              style={{
                left: cluster.x,
                top: cluster.y,
                width: cluster.size,
                height: cluster.size,
                backgroundColor: cluster.color,
                borderColor: `${colors.border}`,
                animationDelay: `${index * 140}ms`,
                color: labelColor,
              }}
              title={`${cluster.tag} (${cluster.count})`}
            >
              <span className="line-clamp-2 text-center font-poppins text-[13px] font-semibold leading-tight">
                {cluster.tag}
              </span>
              <span className="mt-0.5 font-poppins text-[12px] font-medium opacity-80">{cluster.count}</span>
            </button>
            );
          })}
        </>
      )}
    </div>
  );
}
