'use client';

import {
  IconBrandX,
  IconBrandYoutube,
  IconBookmark,
  IconChevronDown,
  IconFolder,
  IconNote,
  IconPinFilled,
  IconPlus,
  IconSettings,
} from '@tabler/icons-react';
import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import { Suspense, useMemo, useState } from 'react';

import { FolderFace } from '@/components/app/folder-face';
import { useAppColors } from '@/hooks/use-app-colors';
import { useUserPlan } from '@/hooks/use-user-plan';
import { APP_SIDEBAR_WIDTH } from '@/lib/app-layout';
import { planDisplayName } from '@/lib/plan';
import type { Folder } from '@/lib/types';
import { cn } from '@/lib/utils';
import { useAppStore } from '@/store/app-store';

const SIDEBAR_ICON_SIZE = 20;
const SIDEBAR_ICON_STROKE = 2;
const SIDEBAR_TEXT_CLASS = 'font-poppins text-[14px] font-medium';
const SIDEBAR_FOLDER_PAGE = 4;

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

function SidebarFolderRow({
  folder,
  active,
  onNavigate,
}: {
  folder: Folder;
  active: boolean;
  onNavigate?: () => void;
}) {
  const { colors } = useAppColors();
  const countLabel = folder.kind === 'bookmarks' ? 'links' : 'notes';

  return (
    <Link
      href={`/app/folders/${folder.id}`}
      onClick={onNavigate}
      className={cn(
        'group relative flex items-center gap-3 rounded-[18px] px-4 py-2.5 transition-all duration-200',
        active ? 'font-semibold' : 'hover:translate-x-0.5',
      )}
      style={
        active
          ? { backgroundColor: colors.lavender, color: colors.text }
          : { color: colors.inkSoft }
      }
    >
      {active ? (
        <div
          className="absolute left-0 top-1/2 h-5 w-1 -translate-y-1/2 rounded-r-full"
          style={{ backgroundColor: colors.primary }}
        />
      ) : null}
      <FolderFace color={folder.color} emoji={folder.emoji} name={folder.name} size="xs" />
      <span className="min-w-0 flex-1">
        <span
          className="flex items-center gap-1 truncate font-poppins text-[13px] font-semibold leading-tight"
          style={{ color: colors.text }}
        >
          <span className="truncate">{folder.name}</span>
          {folder.isPinned ? (
            <IconPinFilled size={11} stroke={2} style={{ color: colors.primary, flexShrink: 0 }} />
          ) : null}
        </span>
        <span
          className="mt-0.5 block truncate font-poppins text-[11px] font-medium leading-none"
          style={{ color: colors.subtitle }}
        >
          {folder.itemCount} {countLabel}
        </span>
      </span>
    </Link>
  );
}

function AppSidebarInner({ onAddBookmark, onAddNote, onNavigate, className }: AppSidebarProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { colors } = useAppColors();
  const { plan } = useUserPlan();
  const folders = useAppStore((s) => s.folders);
  const [folderVisibleCount, setFolderVisibleCount] = useState(SIDEBAR_FOLDER_PAGE);

  const source = searchParams.get('source');
  const isSourceTwitter = source === 'twitter' || source === 'x';
  const isSourceYoutube = source === 'youtube';
  const isBookmarks =
    (pathname === '/app' || pathname.startsWith('/app/reader')) &&
    !isSourceTwitter &&
    !isSourceYoutube;

  const sortedFolders = useMemo(() => {
    const pinned = folders.filter((folder) => folder.isPinned);
    const rest = folders
      .filter((folder) => !folder.isPinned)
      .sort((a, b) => a.name.localeCompare(b.name));
    return [...pinned, ...rest];
  }, [folders]);

  const visibleFolders = sortedFolders.slice(0, folderVisibleCount);
  const remainingFolders = Math.max(0, sortedFolders.length - folderVisibleCount);

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
            className="font-poppins text-2xl font-bold tracking-tight"
            style={{ color: '#FFFFFF' }}
          >
            notemarq
          </span>
        </Link>
        <span
          className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full px-2 py-0.5 font-poppins text-[10px] font-bold uppercase tracking-wide"
          style={{ backgroundColor: colors.lavenderDeep, color: colors.text }}
        >
          {planDisplayName(plan)}
        </span>
      </div>

      <div className="flex min-h-0 flex-1 flex-col overflow-y-auto px-3 py-4">
      <Link
        href="/app"
        className="mb-5 px-2 transition-opacity hover:opacity-80 md:hidden"
        onClick={onNavigate}
      >
        <span
          className="font-poppins text-xl font-bold tracking-tight"
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
          href="/app/notes"
          label="Notes"
          icon={IconNote}
          active={pathname.startsWith('/app/notes')}
          onNavigate={onNavigate}
        />
      </nav>

      <div className="mt-4">
        <div className="mb-2.5 flex items-center gap-2 px-2">
          <div className="h-px flex-1" style={{ backgroundColor: colors.border }} />
          <span
            className="font-poppins text-[10px] font-semibold uppercase tracking-wider"
            style={{ color: colors.subtitle }}
          >
            Import
          </span>
          <div className="h-px flex-1" style={{ backgroundColor: colors.border }} />
        </div>
        <nav className="flex flex-col gap-1">
          <Link
            href="/app?source=twitter"
            onClick={onNavigate}
            className={cn(
              'group relative flex items-center gap-3 rounded-[18px] px-4 py-3 transition-all duration-200',
              SIDEBAR_TEXT_CLASS,
              isSourceTwitter ? 'font-semibold' : 'hover:translate-x-0.5',
            )}
            style={
              isSourceTwitter
                ? { backgroundColor: colors.lavender, color: colors.text }
                : { color: colors.inkSoft }
            }
          >
            {isSourceTwitter ? (
              <div
                className="absolute left-0 top-1/2 h-5 w-1 -translate-y-1/2 rounded-r-full"
                style={{ backgroundColor: colors.primary }}
              />
            ) : null}
            <IconBrandX size={SIDEBAR_ICON_SIZE} stroke={SIDEBAR_ICON_STROKE} className="shrink-0" />
            <span className="truncate">Import from X</span>
          </Link>
          <Link
            href="/app?source=youtube"
            onClick={onNavigate}
            className={cn(
              'group relative flex items-center gap-3 rounded-[18px] px-4 py-3 transition-all duration-200',
              SIDEBAR_TEXT_CLASS,
              isSourceYoutube ? 'font-semibold' : 'hover:translate-x-0.5',
            )}
            style={
              isSourceYoutube
                ? { backgroundColor: colors.lavender, color: colors.text }
                : { color: colors.inkSoft }
            }
          >
            {isSourceYoutube ? (
              <div
                className="absolute left-0 top-1/2 h-5 w-1 -translate-y-1/2 rounded-r-full"
                style={{ backgroundColor: colors.primary }}
              />
            ) : null}
            <IconBrandYoutube size={SIDEBAR_ICON_SIZE} stroke={SIDEBAR_ICON_STROKE} className="shrink-0" />
            <span className="truncate">Import from YouTube</span>
          </Link>
        </nav>
      </div>

      <div className="mt-4">
        <div className="mb-2.5 flex items-center gap-2 px-2">
          <div className="h-px flex-1" style={{ backgroundColor: colors.border }} />
          <span
            className="font-poppins text-[10px] font-semibold uppercase tracking-wider"
            style={{ color: colors.subtitle }}
          >
            Folders
          </span>
          <div className="h-px flex-1" style={{ backgroundColor: colors.border }} />
        </div>
        <nav className="flex flex-col gap-0.5">
          <NavItem
            href="/app/folders"
            label="All folders"
            icon={IconFolder}
            active={pathname === '/app/folders'}
            onNavigate={onNavigate}
          />
          {visibleFolders.map((folder) => (
            <SidebarFolderRow
              key={folder.id}
              folder={folder}
              active={pathname === `/app/folders/${folder.id}`}
              onNavigate={onNavigate}
            />
          ))}
          {remainingFolders > 0 ? (
            <button
              type="button"
              onClick={() => setFolderVisibleCount((n) => n + SIDEBAR_FOLDER_PAGE)}
              className="mt-0.5 flex w-full items-center justify-center gap-1 rounded-[18px] px-4 py-2 font-poppins text-[12px] font-semibold transition hover:translate-x-0.5"
              style={{ color: colors.subtitle }}
            >
              <IconChevronDown size={14} stroke={2} />
              Load more ({remainingFolders})
            </button>
          ) : null}
        </nav>
      </div>

      <div className="mt-auto space-y-1 pt-3">
        <div className="mb-2.5 h-px" style={{ backgroundColor: colors.border }} />

        <NavItem
          href="/app/settings"
          label="Settings"
          icon={IconSettings}
          active={pathname.startsWith('/app/settings')}
          onNavigate={onNavigate}
        />

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

export function AppSidebar(props: AppSidebarProps) {
  return (
    <Suspense fallback={null}>
      <AppSidebarInner {...props} />
    </Suspense>
  );
}
