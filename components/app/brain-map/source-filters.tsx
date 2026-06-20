'use client';

import { useMemo } from 'react';

import { useAppColors } from '@/hooks/use-app-colors';
import {
  BRAIN_MAP_FILTERS,
  filterBookmarksForBrainMap,
  type BrainMapSourceFilter,
} from '@/lib/brain-map';
import type { Bookmark } from '@/lib/types';
import { cn } from '@/lib/utils';

const FILTER_ORDER: BrainMapSourceFilter[] = [
  'all',
  'web',
  'articles',
  'youtube',
  'twitter',
  'tiktok',
];

interface BrainMapSourceFiltersProps {
  bookmarks: Bookmark[];
  activeFilter: BrainMapSourceFilter;
  onSelect: (filter: BrainMapSourceFilter) => void;
}

export function BrainMapSourceFilters({ bookmarks, activeFilter, onSelect }: BrainMapSourceFiltersProps) {
  const { colors } = useAppColors();

  const counts = useMemo(() => {
    const map = {} as Record<BrainMapSourceFilter, number>;
    for (const id of FILTER_ORDER) {
      map[id] = filterBookmarksForBrainMap(bookmarks, id).length;
    }
    return map;
  }, [bookmarks]);

  return (
    <div className="mb-4 flex gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      {FILTER_ORDER.map((id) => {
        const meta = BRAIN_MAP_FILTERS.find((f) => f.id === id);
        if (!meta) return null;
        const active = activeFilter === id;
        const count = counts[id];

        return (
          <button
            key={id}
            type="button"
            onClick={() => onSelect(id)}
            className={cn(
              'inline-flex shrink-0 items-center gap-2 rounded-full px-4 py-2.5 font-poppins text-[12px] font-semibold transition-all',
            )}
            style={
              active
                ? { backgroundColor: colors.lavenderDeep, color: colors.text }
                : { backgroundColor: colors.pageBackground, color: colors.inkSoft }
            }
          >
            {meta.label}
            <span className={cn('font-medium', active ? 'opacity-90' : 'opacity-60')}>{count}</span>
          </button>
        );
      })}
    </div>
  );
}
