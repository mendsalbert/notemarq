'use client';

import {
  IconMenu2,
  IconRefresh,
  IconSearch,
} from '@tabler/icons-react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';

import { useAuth } from '@/contexts/auth-provider';
import { useAppSearch } from '@/contexts/app-search-context';
import { useAppColors } from '@/hooks/use-app-colors';
import { appContentClass } from '@/lib/app-layout';
import { useAppStore } from '@/store/app-store';
import { cn } from '@/lib/utils';

interface AppHeaderProps {
  onMenuClick: () => void;
  sidebarOpen: boolean;
}

function HeaderActions({
  isLoading,
  onRefresh,
  photo,
  firstName,
  colors,
  showProfile = true,
}: {
  isLoading: boolean;
  onRefresh: () => void;
  photo?: string;
  firstName: string;
  colors: ReturnType<typeof useAppColors>['colors'];
  showProfile?: boolean;
}) {
  return (
    <div className="flex shrink-0 items-center gap-1.5">
      <button
        type="button"
        onClick={onRefresh}
        disabled={isLoading}
        className="hidden h-9 w-9 items-center justify-center rounded-xl transition hover:opacity-80 disabled:opacity-40 sm:flex"
        style={{ backgroundColor: colors.cream }}
        aria-label="Refresh"
      >
        <IconRefresh size={18} stroke={2} className={cn(isLoading && 'animate-spin')} />
      </button>

      {showProfile ? (
        <Link
          href="/app/profile"
          className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-xl transition hover:opacity-80"
          style={{ backgroundColor: colors.lavender }}
          aria-label="Profile"
        >
          {photo ? (
            <Image src={photo} alt="" width={36} height={36} className="h-9 w-9 object-cover" />
          ) : (
            <span className="text-sm font-bold" style={{ color: colors.text }}>
              {firstName.charAt(0).toUpperCase()}
            </span>
          )}
        </Link>
      ) : null}
    </div>
  );
}

function HeaderSearch({
  query,
  isExplore,
  onChange,
  onFocus,
  colors,
}: {
  query: string;
  isExplore: boolean;
  onChange: (value: string) => void;
  onFocus: () => void;
  colors: ReturnType<typeof useAppColors>['colors'];
}) {
  return (
    <div className="relative min-w-0 flex-1">
      <IconSearch
        size={17}
        stroke={2}
        className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2"
        style={{ color: colors.inkSoft }}
      />
      <input
        id="app-global-search"
        value={query}
        onChange={(e) => onChange(e.target.value)}
        onFocus={onFocus}
        placeholder="What are you looking for?"
        className="h-11 w-full rounded-2xl border px-11 text-sm outline-none transition focus:ring-2"
        style={{
          backgroundColor: colors.cream,
          color: colors.text,
          borderColor: isExplore ? colors.lavenderDeep : colors.border,
        }}
      />
    </div>
  );
}

export function AppHeader({ onMenuClick, sidebarOpen }: AppHeaderProps) {
  const router = useRouter();
  const pathname = usePathname();
  const isExplore = pathname === '/app/explore';
  const isBrainMap = pathname === '/app/brain-map';
  const hideHeaderProfile = isExplore || isBrainMap;
  const { user } = useAuth();
  const { colors } = useAppColors();
  const { query, setQuery } = useAppSearch();
  const userId = useAppStore((s) => s.userId);
  const hydrate = useAppStore((s) => s.hydrate);
  const isLoading = useAppStore((s) => s.isLoading);

  const photo =
    (user?.user_metadata?.avatar_url as string | undefined) ??
    (user?.user_metadata?.picture as string | undefined);
  const firstName =
    ((user?.user_metadata?.full_name as string | undefined) ??
      (user?.user_metadata?.name as string | undefined) ??
      '')
      .trim()
      .split(/\s+/)[0] || 'U';

  async function handleRefresh() {
    if (userId) await hydrate(userId);
  }

  function goToExplore() {
    if (!isExplore) router.push('/app/explore');
  }

  function handleSearchChange(value: string) {
    setQuery(value);
    if (!isExplore) router.push('/app/explore');
  }

  return (
    <header
      className="sticky top-0 z-50 h-16 shrink-0"
      style={{ backgroundColor: colors.pageBackground, borderBottom: `1px solid ${colors.border}` }}
    >
      {/* Mobile */}
      <div className={cn('flex h-full items-center gap-3 md:hidden', appContentClass)}>
        <button
          type="button"
          onClick={onMenuClick}
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl transition hover:opacity-80"
          style={{ backgroundColor: colors.cream }}
          aria-label={sidebarOpen ? 'Close menu' : 'Open menu'}
        >
          <IconMenu2 size={19} stroke={2} />
        </button>

        <HeaderSearch
          query={query}
          isExplore={isExplore}
          onChange={handleSearchChange}
          onFocus={goToExplore}
          colors={colors}
        />

        <HeaderActions
          isLoading={isLoading}
          onRefresh={handleRefresh}
          photo={photo}
          firstName={firstName}
          colors={colors}
          showProfile={!hideHeaderProfile}
        />
      </div>

      {/* Desktop */}
      <div className={cn('hidden h-full items-center gap-4 md:flex', appContentClass)}>
        <HeaderSearch
          query={query}
          isExplore={isExplore}
          onChange={handleSearchChange}
          onFocus={goToExplore}
          colors={colors}
        />

        <HeaderActions
          isLoading={isLoading}
          onRefresh={handleRefresh}
          photo={photo}
          firstName={firstName}
          colors={colors}
          showProfile={!hideHeaderProfile}
        />
      </div>
    </header>
  );
}
