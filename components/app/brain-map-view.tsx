'use client';

import { useMemo, useState } from 'react';
import { IconSparkles } from '@tabler/icons-react';

import { BrainMapBubbleCloud } from '@/components/app/brain-map/bubble-cloud';
import { BrainMapEmotionalGauge } from '@/components/app/brain-map/emotional-gauge';
import { BrainMapSourceFilters } from '@/components/app/brain-map/source-filters';
import { BrainMapTagPanel } from '@/components/app/brain-map/tag-panel';
import { useAppColors } from '@/hooks/use-app-colors';
import {
  buildTagClusters,
  buildTagEdges,
  filterBookmarksForBrainMap,
  getFilterEmptyMessage,
  type BrainMapSourceFilter,
} from '@/lib/brain-map';
import { buildEmotionalGauge, getEmotionalHeadline } from '@/lib/emotional-gauge';
import { useAppStore } from '@/store/app-store';

export function BrainMapView() {
  const { colors } = useAppColors();
  const bookmarks = useAppStore((s) => s.bookmarks);
  const notes = useAppStore((s) => s.notes);
  const [filter, setFilter] = useState<BrainMapSourceFilter>('all');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);

  const filtered = useMemo(
    () => filterBookmarksForBrainMap(bookmarks, filter),
    [bookmarks, filter],
  );
  const clusters = useMemo(() => buildTagClusters(filtered, colors), [filtered, colors]);
  const connectionCount = useMemo(() => buildTagEdges(filtered).length, [filtered]);
  const emotionBars = useMemo(() => buildEmotionalGauge(bookmarks, notes), [bookmarks, notes]);
  const emotionHeadline = useMemo(() => getEmotionalHeadline(bookmarks, notes), [bookmarks, notes]);

  const topCluster = clusters[0];
  const selectedColor = clusters.find((c) => c.tag === selectedTag)?.color;

  return (
    <div className="mx-auto w-full max-w-[1400px] px-4 py-5 md:px-6 md:py-6">
      <BrainMapEmotionalGauge
        bars={emotionBars}
        headline={emotionHeadline}
        totalSaves={bookmarks.length + notes.length}
      />

      {topCluster ? (
        <div
          className="mb-5 flex items-start gap-2 rounded-[18px] px-4 py-3"
          style={{ backgroundColor: colors.peach }}
        >
          <IconSparkles size={14} stroke={2.2} className="mt-0.5 shrink-0" style={{ color: colors.text }} />
          <p className="font-poppins text-[12px] leading-relaxed" style={{ color: colors.inkSoft }}>
            Top theme:{' '}
            <span className="font-bold" style={{ color: colors.text }}>
              {topCluster.tag}
            </span>
            {' · '}
            {clusters.length} topic{clusters.length === 1 ? '' : 's'}
            {' · '}
            {connectionCount} link{connectionCount === 1 ? '' : 's'}
          </p>
        </div>
      ) : null}

      <div className="mb-1">
        <h1 className="font-poppins text-[18px] font-bold tracking-tight" style={{ color: colors.text }}>
          Your topics
        </h1>
        <p className="mt-1 font-poppins text-[12px]" style={{ color: colors.inkSoft }}>
          Tap a bubble to explore saves
        </p>
      </div>

      <BrainMapSourceFilters bookmarks={bookmarks} activeFilter={filter} onSelect={setFilter} />

      <div
        className="overflow-hidden rounded-[28px]"
        style={{ backgroundColor: colors.lavender }}
      >
        {clusters.length > 0 ? (
          <BrainMapBubbleCloud
            clusters={clusters}
            bookmarks={filtered}
            onTagPress={setSelectedTag}
          />
        ) : (
          <div className="flex min-h-[280px] flex-col items-center justify-center px-6 py-12 text-center">
            <div
              className="mb-4 flex h-[72px] w-[72px] items-center justify-center rounded-[24px]"
              style={{ backgroundColor: colors.lavender }}
            >
              <IconSparkles size={28} stroke={2} style={{ color: colors.text }} />
            </div>
            <p className="font-poppins text-[15px] font-bold" style={{ color: colors.text }}>
              Nothing to map yet
            </p>
            <p className="mt-2 max-w-sm font-poppins text-[13px] leading-relaxed" style={{ color: colors.inkSoft }}>
              {getFilterEmptyMessage(filter)}
            </p>
          </div>
        )}
      </div>

      <BrainMapTagPanel
        tag={selectedTag}
        color={selectedColor}
        bookmarks={filtered}
        onClose={() => setSelectedTag(null)}
      />
    </div>
  );
}
