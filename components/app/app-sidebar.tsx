'use client';

import {
  IconBookmark,
  IconBrain,
  IconFolder,
  IconLogout,
  IconNote,
  IconPlus,
  IconSettings,
  IconSparkles,
  IconUser,
} from '@tabler/icons-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useMemo } from 'react';

import { useAuth } from '@/contexts/auth-provider';
import { useAppColors } from '@/hooks/use-app-colors';
import { APP_SIDEBAR_WIDTH } from '@/lib/app-layout';
import { useAppStore } from '@/store/app-store';
import { cn } from '@/lib/utils';

const SIDEBAR_ICON_SIZE = 20;
const SIDEBAR_ICON_STROKE = 2;
const SIDEBAR_TEXT_CLASS = 'font-poppins text-[14px] font-medium';

interface AppSidebarProps {
  onAddBookmark: () => void;
  onAddNote?: () => void;
  onNavigate?: () => void;
  className?: string;
}

function NavItem({
  href,
  label,
  icon: Icon,
  active,
  onNavigate,
}: {
  href: string;
  label: string;
  icon: typeof IconBookmark;
  active: boolean;
  onNavigate?: () => void;
}) {
  const { colors } = useAppColors();

  return (
    <Link
      href={href}
      onClick={onNavigate}
      className={cn(
        'group relative flex items-center gap-3 rounded-[18px] px-4 py-3 transition-all duration-200',
        SIDEBAR_TEXT_CLASS,
        active ? 'font-semibold' : 'hover:translate-x-0.5',
      )}
      style={
        active
          ? { backgroundColor: colors.lavender, color: colors.text }
          : { color: colors.inkSoft }
      }
    >
      {active && (
        <div
          className="absolute left-0 top-1/2 h-5 w-1 -translate-y-1/2 rounded-r-full"
          style={{ backgroundColor: colors.primary }}
        />
      )}
      <Icon size={SIDEBAR_ICON_SIZE} stroke={SIDEBAR_ICON_STROKE} />
      <span className="truncate">{label}</span>
    </Link>
  );
}

export function AppSidebar({ onAddBookmark, onAddNote, onNavigate, className }: AppSidebarProps) {
  const pathname = usePathname();
  const { user, signOut } = useAuth();
  const { colors } = useAppColors();
  const bookmarks = useAppStore((s) => s.bookmarks);
  const notes = useAppStore((s) => s.notes);

  const isBookmarks = pathname === '/app' || pathname.startsWith('/app/reader');

  const recentItems = useMemo(() => {
    const items: Array<{ type: 'bookmark' | 'note'; date: string; id: string; title: string }> = [
      ...bookmarks.map((b) => ({
        type: 'bookmark' as const,
        date: b.dateAdded,
        id: b.id,
        title: b.title,
      })),
      ...notes.map((n) => ({
        type: 'note' as const,
        date: n.createdAt || '',
        id: n.id,
        title: n.name,
      })),
    ];
    return items
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 4);
  }, [bookmarks, notes]);

  return (
    <aside
      className={cn('flex h-full shrink-0 flex-col font-poppins', className)}
      style={{ width: APP_SIDEBAR_WIDTH, backgroundColor: colors.pageBackground }}
    >
      <div
        className="relative hidden h-16 shrink-0 items-center border-b px-3 md:flex"
        style={{ borderColor: colors.border }}
      >
        <Link
          href="/app"
          className="px-4 transition-opacity hover:opacity-80"
          onClick={onNavigate}
        >
          <span
            className="font-[family-name:var(--font-nunito)] text-2xl font-bold tracking-tight"
            style={{ color: '#FFFFFF' }}
          >
            notemarq
          </span>
        </Link>
        <span
          className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full px-2 py-0.5 font-poppins text-[10px] font-bold uppercase tracking-wide"
          style={{ backgroundColor: colors.lavenderDeep, color: colors.text }}
        >
          Free
        </span>
      </div>

      <div className="flex min-h-0 flex-1 flex-col overflow-y-auto px-3 py-4">
      <Link
        href="/app"
        className="mb-5 px-2 transition-opacity hover:opacity-80 md:hidden"
        onClick={onNavigate}
      >
        <span
          className="font-[family-name:var(--font-nunito)] text-xl font-bold tracking-tight"
          style={{ color: '#FFFFFF' }}
        >
          notemarq
        </span>
      </Link>

      <nav className="flex flex-col gap-1">
        <NavItem
          href="/app"
          label="Bookmarks"
          icon={IconBookmark}
          active={isBookmarks}
          onNavigate={onNavigate}
        />
        <NavItem
          href="/app/folders"
          label="Folders"
          icon={IconFolder}
          active={pathname.startsWith('/app/folders')}
          onNavigate={onNavigate}
        />
        <NavItem
          href="/app/notes"
          label="Notes"
          icon={IconNote}
          active={pathname.startsWith('/app/notes')}
          onNavigate={onNavigate}
        />
      </nav>

      {recentItems.length > 0 && (
        <div className="mt-4">
          <div className="mb-2.5 flex items-center gap-2 px-2">
            <div className="h-px flex-1" style={{ backgroundColor: colors.border }} />
            <span
              className="font-poppins text-[10px] font-semibold uppercase tracking-wider"
              style={{ color: colors.subtitle }}
            >
              Recent
            </span>
            <div className="h-px flex-1" style={{ backgroundColor: colors.border }} />
          </div>
          <nav className="flex flex-col gap-1">
            {recentItems.map((item) => {
              const href =
                item.type === 'bookmark' ? `/app/reader/${item.id}` : `/app/notes/${item.id}`;
              const active = pathname === href;
              const ItemIcon = item.type === 'note' ? IconNote : IconBookmark;

              return (
                <Link
                  key={`${item.type}-${item.id}`}
                  href={href}
                  onClick={onNavigate}
                  className={cn(
                    'group flex items-center gap-3 rounded-[18px] px-4 py-3 transition-all duration-200',
                    SIDEBAR_TEXT_CLASS,
                    active ? 'font-semibold' : 'hover:translate-x-0.5',
                  )}
                  style={
                    active
                      ? { backgroundColor: colors.butter, color: colors.text }
                      : { color: colors.inkSoft }
                  }
                >
                  <ItemIcon size={SIDEBAR_ICON_SIZE} stroke={SIDEBAR_ICON_STROKE} className="shrink-0" />
                  <span className="truncate">{item.title}</span>
                </Link>
              );
            })}
          </nav>
          {bookmarks.length + notes.length > 4 && (
            <Link
              href="/app/library"
              className={cn(
                'mt-2 flex items-center justify-center rounded-[18px] px-4 py-3 transition-all hover:translate-x-0.5',
                SIDEBAR_TEXT_CLASS,
              )}
              style={{ color: colors.inkSoft }}
            >
              Load more
            </Link>
          )}
        </div>
      )}

      <div className="mt-auto space-y-1 pt-3">
        <div className="mb-2.5 h-px" style={{ backgroundColor: colors.border }} />

        <NavItem
          href="/app/profile"
          label="Profile"
          icon={IconUser}
          active={pathname.startsWith('/app/profile')}
          onNavigate={onNavigate}
        />
        <NavItem
          href="/app/settings"
          label="Settings"
          icon={IconSettings}
          active={pathname.startsWith('/app/settings')}
          onNavigate={onNavigate}
        />
        <NavItem
          href="/app/explore"
          label="Explore"
          icon={IconSparkles}
          active={pathname === '/app/explore'}
          onNavigate={onNavigate}
        />
        <NavItem
          href="/app/brain-map"
          label="Brain map"
          icon={IconBrain}
          active={pathname === '/app/brain-map'}
          onNavigate={onNavigate}
        />

        {user ? (
          <button
            type="button"
            onClick={() => {
              void signOut();
              onNavigate?.();
            }}
            className={cn(
              'mt-1 flex w-full items-center gap-3 rounded-[18px] px-4 py-3 transition-all duration-200 hover:translate-x-0.5',
              SIDEBAR_TEXT_CLASS,
            )}
            style={{ color: colors.danger }}
          >
            <IconLogout size={SIDEBAR_ICON_SIZE} stroke={SIDEBAR_ICON_STROKE} />
            <span className="truncate">Log out</span>
          </button>
        ) : null}

        <button
          type="button"
          onClick={onAddBookmark}
          className="mt-3 flex w-full items-center justify-center gap-2 rounded-[18px] py-3 font-poppins text-[14px] font-semibold transition-all duration-200 hover:-translate-y-0.5"
          style={{
            backgroundColor: colors.primary,
            color: colors.onAccent,
            boxShadow: `0 4px 14px ${colors.cardShadow}`,
          }}
        >
          <IconPlus size={SIDEBAR_ICON_SIZE} stroke={SIDEBAR_ICON_STROKE} />
          Save link
        </button>
        {onAddNote ? (
          <button
            type="button"
            onClick={onAddNote}
            className="mt-2 flex w-full items-center justify-center gap-2 rounded-[18px] py-3 font-poppins text-[14px] font-semibold transition-all duration-200 hover:-translate-y-0.5"
            style={{
              backgroundColor: colors.lavenderDeep,
              color: colors.text,
              boxShadow: `0 4px 14px ${colors.cardShadow}`,
            }}
          >
            <IconNote size={SIDEBAR_ICON_SIZE} stroke={SIDEBAR_ICON_STROKE} />
            New note
          </button>
        ) : null}
      </div>
      </div>
    </aside>
  );
}
