'use client';

import { useAppColors } from '@/hooks/use-app-colors';
import type { EmotionBar } from '@/lib/emotional-gauge';

interface BrainMapEmotionalGaugeProps {
  bars: EmotionBar[];
  headline: string;
  totalSaves: number;
}

export function BrainMapEmotionalGauge({ bars, headline, totalSaves }: BrainMapEmotionalGaugeProps) {
  const { colors } = useAppColors();
  const maxPct = Math.max(...bars.map((b) => b.pct), 1);

  return (
    <div
      className="mb-5 rounded-[28px] p-5 md:p-6"
      style={{ backgroundColor: colors.cream }}
    >
      <div className="mb-5 flex items-start gap-4">
        <div className="shrink-0">
          <p className="font-poppins text-[36px] font-bold leading-none tracking-tight" style={{ color: colors.text }}>
            {totalSaves}
          </p>
          <p className="mt-1 font-poppins text-[11px] font-medium" style={{ color: colors.inkSoft }}>
            saves mapped
          </p>
        </div>
        <p className="flex-1 pt-1.5 font-poppins text-[13px] leading-relaxed" style={{ color: colors.inkSoft }}>
          {headline}
        </p>
      </div>

      <p className="mb-3 font-poppins text-[13px] font-bold" style={{ color: colors.text }}>
        Emotional gauge
      </p>

      <div className="grid grid-cols-4 gap-2">
        {bars.map((bar) => {
          const heightPct = Math.max(12, Math.round((bar.pct / maxPct) * 100));
          return (
            <div key={bar.id} className="flex flex-col items-center gap-1.5">
              <span className="font-poppins text-[11px] font-bold" style={{ color: colors.text }}>
                {bar.pct}%
              </span>
              <div
                className="flex w-full items-end rounded-2xl px-1.5 pb-1.5"
                style={{ height: 88, backgroundColor: colors.lavender }}
              >
                <div
                  className="w-full rounded-xl"
                  style={{ height: `${heightPct}%`, backgroundColor: bar.color, minHeight: 8 }}
                />
              </div>
              <span className="text-center font-poppins text-[10px] font-medium" style={{ color: colors.inkSoft }}>
                {bar.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
