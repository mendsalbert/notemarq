'use client';

import { Colors } from '@/lib/colors';
import { useTheme } from '@/contexts/theme-provider';

export function useAppColors() {
  const { colorScheme, isDark } = useTheme();
  return { colors: Colors[colorScheme], isDark, colorScheme };
}
