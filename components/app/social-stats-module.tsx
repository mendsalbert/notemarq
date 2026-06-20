'use client';

import type { SocialStats } from '@/lib/home-dashboard';
import { useAppColors } from '@/hooks/use-app-colors';

const levelColors = {
  none: 'transparent',
  low: 'rgba(79, 195, 247, 0.35)',
  good: 'rgba(79, 195, 247, 0.65)',
  great: '#4FC3F7',
};

export function SocialStatsModule({ stats }: { stats: SocialStats }) {
  const { colors, isDark } = useAppColors();

  return (
    <section
      className="rounded-3xl border p-5"
      style={{ backgroundColor: colors.butter, borderColor: colors.border }}
    >
      <div className="mb-4 flex items-end justify-between">
        <div>
          <p className="text-sm font-medium opacity-60">Curating streak</p>
          <p className="text-3xl font-bold">{stats.streak} days</p>
        </div>
        <div className="text-right">
          <p className="text-sm font-medium opacity-60">Social saves</p>
          <p className="text-xl font-semibold">{stats.socialTotal}</p>
        </div>
      </div>

      <div className="mb-4 grid grid-cols-3 gap-2 text-center text-xs">
        <div className="rounded-2xl p-3" style={{ backgroundColor: colors.cream }}>
          <p className="font-semibold">{stats.youtube}</p>
          <p className="opacity-60">YouTube</p>
        </div>
        <div className="rounded-2xl p-3" style={{ backgroundColor: colors.cream }}>
          <p className="font-semibold">{stats.twitter}</p>
          <p className="opacity-60">X</p>
        </div>
        <div className="rounded-2xl p-3" style={{ backgroundColor: colors.cream }}>
          <p className="font-semibold">{stats.tiktok}</p>
          <p className="opacity-60">TikTok</p>
        </div>
      </div>

      <div className="flex items-end justify-between gap-2">
        {stats.weeklyActivity.map((day) => (
          <div key={`${day.label}-${day.date}`} className="flex flex-1 flex-col items-center gap-2">
            <div
              className="w-full rounded-full transition-all"
              style={{
                height: day.isFuture ? 8 : 24 + day.socialCount * 8,
                backgroundColor: day.isFuture
                  ? colors.border
                  : isDark
                    ? levelColors[day.level] === '#4FC3F7'
                      ? '#22D3EE'
                      : levelColors[day.level]
                    : levelColors[day.level],
                opacity: day.level === 'none' && !day.isFuture ? 0.25 : 1,
              }}
            />
            <span className={cnText(day.isToday)} style={{ color: day.isToday ? colors.cyan : colors.subtitle }}>
              {day.label}
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}

function cnText(isToday: boolean) {
  return `text-[11px] font-medium ${isToday ? '' : 'opacity-60'}`;
}
