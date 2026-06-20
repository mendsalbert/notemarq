'use client';

import { useEffect, useState } from 'react';

import { useTheme } from '@/contexts/theme-provider';
import { extractImageAccent } from '@/lib/image-color';

function readIsDark(): boolean {
  if (typeof document === 'undefined') return false;
  return document.documentElement.classList.contains('dark');
}

/** Card background tinted from the dominant hue in a preview image. */
export function useImageAccent(imageUrl: string | undefined, fallback: string): string {
  const { isDark, isReady } = useTheme();
  const [accent, setAccent] = useState(fallback);

  // Keep in sync with theme + fallback immediately (no waiting on async extraction).
  useEffect(() => {
    if (!imageUrl) {
      setAccent(fallback);
    }
  }, [imageUrl, fallback, isDark]);

  useEffect(() => {
    if (!isReady || !imageUrl) return;

    let cancelled = false;
    const dark = readIsDark();
    setAccent(fallback);

    void extractImageAccent(imageUrl, dark).then((color) => {
      if (!cancelled && color) setAccent(color);
    });

    return () => {
      cancelled = true;
    };
  }, [imageUrl, fallback, isDark, isReady]);

  return accent;
}
