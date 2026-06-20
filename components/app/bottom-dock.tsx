'use client';

import { IconBookmark, IconHome, IconPlus, IconSparkles } from '@tabler/icons-react';
import { IconBrain } from '@tabler/icons-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';

import { AddSplitMenu } from '@/components/app/add-split-menu';
import { useAppColors } from '@/hooks/use-app-colors';
import { cn } from '@/lib/utils';

interface BottomDockProps {
  onAddBookmark: () => void;
  onAddNote: () => void;
}

const NAV = [
  { href: '/app', label: 'Home', icon: IconHome, exact: true },
  { href: '/app/library', label: 'Library', icon: IconBookmark },
  { href: '/app/brain-map', label: 'Brain', icon: IconBrain },
  { href: '/app/explore', label: 'Explore', icon: IconSparkles },
];

export function BottomDock({ onAddBookmark, onAddNote }: BottomDockProps) {
  const pathname = usePathname();
  const { colors, isDark } = useAppColors();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <>
      <AddSplitMenu
        open={menuOpen}
        onClose={() => setMenuOpen(false)}
        onAddBookmark={() => {
          setMenuOpen(false);
          onAddBookmark();
        }}
        onAddNote={() => {
          setMenuOpen(false);
          onAddNote();
        }}
      />

      <div className="pointer-events-none fixed inset-x-0 bottom-0 z-50 flex justify-center pb-6 md:hidden">
        <div className="pointer-events-auto relative w-[min(100%,420px)] px-6">
          <div
            className="flex items-center justify-between rounded-[40px] border px-5 py-3 shadow-[0_6px_20px_rgba(0,0,0,0.08)] dark:shadow-[0_6px_20px_rgba(0,0,0,0.45)]"
            style={{ backgroundColor: colors.navBackground, borderColor: colors.border }}
          >
            {NAV.slice(0, 2).map(({ href, icon: Icon, exact }) => {
              const active = exact ? pathname === href : pathname.startsWith(href);
              return (
                <Link
                  key={href}
                  href={href}
                  className="relative flex h-11 w-11 items-center justify-center rounded-full"
                >
                  <Icon
                    size={26}
                    stroke={1.8}
                    color={active ? colors.text : colors.icon}
                  />
                  {active ? (
                    <span
                      className="absolute bottom-1 h-1 w-1 rounded-full"
                      style={{ backgroundColor: colors.cyan }}
                    />
                  ) : null}
                </Link>
              );
            })}

            <div className="w-14" />

            {NAV.slice(2).map(({ href, icon: Icon }) => {
              const active = pathname.startsWith(href);
              return (
                <Link
                  key={href}
                  href={href}
                  className="relative flex h-11 w-11 items-center justify-center rounded-full"
                >
                  <Icon
                    size={26}
                    stroke={1.8}
                    color={active ? colors.text : colors.icon}
                  />
                  {active ? (
                    <span
                      className="absolute bottom-1 h-1 w-1 rounded-full"
                      style={{ backgroundColor: colors.cyan }}
                    />
                  ) : null}
                </Link>
              );
            })}
          </div>

          <button
            type="button"
            onClick={() => setMenuOpen((v) => !v)}
            className={cn(
              'absolute left-1/2 top-0 flex h-[58px] w-[58px] -translate-x-1/2 -translate-y-[22px] items-center justify-center rounded-full shadow-lg transition-colors',
              menuOpen ? 'bg-[#22D3EE]' : isDark ? 'bg-white text-black' : 'bg-[#1C1C2E] text-white',
            )}
            aria-label="Add"
          >
            <IconPlus
              size={28}
              stroke={2.5}
              className={cn('transition-transform', menuOpen && 'rotate-45')}
            />
          </button>
        </div>
      </div>
    </>
  );
}
