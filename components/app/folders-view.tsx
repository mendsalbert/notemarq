'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import {
  IconBookmark,
  IconDots,
  IconFolder,
  IconHash,
  IconLayoutGrid,
  IconList,
  IconNote,
  IconPencil,
  IconPinFilled,
  IconPlus,
  IconSearch,
  IconTrash,
} from '@tabler/icons-react';

import { CreateFolderDialog } from '@/components/app/create-folder-dialog';
import { FolderCard } from '@/components/app/folder-card';
import { FolderFace } from '@/components/app/folder-face';
import { useAppColors } from '@/hooks/use-app-colors';
import { sortWithPinsFirst } from '@/lib/pin-sort';
import type { Folder, LibraryKind } from '@/lib/types';
import { useAppStore } from '@/store/app-store';

type OrganizeTab = 'folders' | 'tags';
type KindFilter = 'all' | LibraryKind;
type ViewMode = 'table' | 'grid';

const TAG_TINTS = ['lavender', 'peach', 'mint', 'blushDeep', 'butter', 'cream'] as const;
const TAGS_PAGE_SIZE = 18;

function formatUpdated(value: string) {
  if (!value) return '—';
  const date = new Date(value.length <= 10 ? `${value}T00:00:00` : value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
}

function FolderRowMenu({ folder }: { folder: Folder }) {
  const { colors } = useAppColors();
  const updateFolder = useAppStore((s) => s.updateFolder);
  const deleteFolder = useAppStore((s) => s.deleteFolder);
  const togglePinFolder = useAppStore((s) => s.togglePinFolder);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!menuOpen) return;

    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [menuOpen]);

  async function handleEdit() {
    setMenuOpen(false);
    const nextName = window.prompt('Rename folder', folder.name)?.trim();
    if (!nextName || nextName === folder.name) return;
    await updateFolder(folder.id, { name: nextName });
  }

  async function handleDelete() {
    setMenuOpen(false);
    const confirmed = window.confirm(
      `Delete "${folder.name}"? Items inside will stay in your library, just unfiled.`,
    );
    if (!confirmed) return;
    await deleteFolder(folder.id);
  }

  return (
    <div ref={menuRef} className="relative">
      <button
        type="button"
        className="flex h-8 w-8 items-center justify-center rounded-full transition hover:scale-105"
        style={{ backgroundColor: colors.lavender }}
        aria-label="Folder options"
        onClick={(event) => {
          event.preventDefault();
          event.stopPropagation();
          setMenuOpen((open) => !open);
        }}
      >
        <IconDots size={16} stroke={2} style={{ color: colors.text }} />
      </button>

      {menuOpen ? (
        <div
          className="absolute right-0 top-9 z-20 min-w-[140px] overflow-hidden rounded-2xl py-1"
          style={{
            backgroundColor: colors.cream,
            boxShadow: `0 8px 24px ${colors.cardShadow}`,
            border: `1px solid ${colors.border}`,
          }}
        >
          <button
            type="button"
            className="flex w-full items-center gap-2 px-3 py-2.5 font-poppins text-[13px] font-medium transition hover:opacity-80"
            style={{ color: colors.text }}
            onClick={() => void handleEdit()}
          >
            <IconPencil size={15} stroke={2} />
            Rename
          </button>
          <button
            type="button"
            className="flex w-full items-center gap-2 px-3 py-2.5 font-poppins text-[13px] font-medium transition hover:opacity-80"
            style={{ color: colors.text }}
            onClick={() => {
              setMenuOpen(false);
              void togglePinFolder(folder.id);
            }}
          >
            <IconPinFilled size={15} stroke={2} />
            {folder.isPinned ? 'Unpin' : 'Pin'}
          </button>
          <button
            type="button"
            className="flex w-full items-center gap-2 px-3 py-2.5 font-poppins text-[13px] font-medium transition hover:opacity-80"
            style={{ color: colors.danger }}
            onClick={() => void handleDelete()}
          >
            <IconTrash size={15} stroke={2} />
            Delete
          </button>
        </div>
      ) : null}
    </div>
  );
}

export function FoldersView() {
  const { colors } = useAppColors();
  const allFolders = useAppStore((s) => s.folders);
  const bookmarks = useAppStore((s) => s.bookmarks);
  const [activeTab, setActiveTab] = useState<OrganizeTab>('folders');
  const [kindFilter, setKindFilter] = useState<KindFilter>('all');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [tagsVisibleCount, setTagsVisibleCount] = useState(TAGS_PAGE_SIZE);
  const [createOpen, setCreateOpen] = useState(false);

  const folders = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    const sorted = sortWithPinsFirst(
      allFolders,
      (folder) => folder.isPinned,
      (a, b) => a.name.localeCompare(b.name),
    );
    return sorted.filter((folder) => {
      if (kindFilter !== 'all' && folder.kind !== kindFilter) return false;
      if (!q) return true;
      return (
        folder.name.toLowerCase().includes(q) ||
        folder.description.toLowerCase().includes(q)
      );
    });
  }, [allFolders, searchQuery, kindFilter]);

  const folderPreviews = useMemo(() => {
    const map = new Map<string, typeof bookmarks>();
    for (const folder of allFolders) {
      if (folder.kind !== 'bookmarks') continue;
      const items = bookmarks
        .filter((bookmark) => bookmark.folderId === folder.id)
        .sort((a, b) => new Date(b.dateAdded).getTime() - new Date(a.dateAdded).getTime())
        .slice(0, 3);
      map.set(folder.id, items);
    }
    return map;
  }, [allFolders, bookmarks]);

  const stats = useMemo(() => {
    const linkFolders = allFolders.filter((f) => f.kind === 'bookmarks').length;
    const noteFolders = allFolders.filter((f) => f.kind === 'notes').length;
    const totalItems = allFolders.reduce((sum, f) => sum + f.itemCount, 0);
    return { total: allFolders.length, linkFolders, noteFolders, totalItems };
  }, [allFolders]);

  const tags = useMemo(() => {
    const counts = new Map<string, number>();
    for (const bookmark of bookmarks) {
      for (const tag of bookmark.tags) {
        const key = tag.trim();
        if (!key) continue;
        counts.set(key, (counts.get(key) ?? 0) + 1);
      }
    }
    return Array.from(counts.entries())
      .map(([name, count]) => ({ id: name, name, count }))
      .sort((a, b) => b.count - a.count);
  }, [bookmarks]);

  const visibleTags = tags.slice(0, tagsVisibleCount);
  const hasMoreTags = tagsVisibleCount < tags.length;

  const kindChips: { id: KindFilter; label: string; icon: typeof IconFolder }[] = [
    { id: 'all', label: 'All', icon: IconFolder },
    { id: 'bookmarks', label: 'Links', icon: IconBookmark },
    { id: 'notes', label: 'Notes', icon: IconNote },
  ];

  return (
    <div className="mx-auto w-full max-w-[1400px] px-4 py-5 md:px-6 md:py-6">
      <div className="mb-5 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1
            className="font-poppins text-[28px] font-bold tracking-tight"
            style={{ color: colors.text }}
          >
            Folders
          </h1>
          <p className="mt-1 font-poppins text-[13px]" style={{ color: colors.inkSoft }}>
            {stats.total === 0
              ? 'Organize saves and notes into collections.'
              : `${stats.total} folder${stats.total === 1 ? '' : 's'} · ${stats.totalItems} item${stats.totalItems === 1 ? '' : 's'}`}
          </p>
        </div>
        <button
          type="button"
          onClick={() => setCreateOpen(true)}
          className="inline-flex items-center gap-2 rounded-full px-4 py-2.5 font-poppins text-[13px] font-semibold transition hover:scale-[1.02]"
          style={{ backgroundColor: colors.primary, color: colors.onAccent }}
        >
          <IconPlus size={16} stroke={2.5} />
          New folder
        </button>
      </div>

      <div className="mb-4 flex gap-2">
        <button
          type="button"
          onClick={() => setActiveTab('folders')}
          className="flex flex-1 items-center justify-center gap-2 rounded-full px-4 py-3 font-poppins text-[13px] font-bold transition-all sm:flex-none sm:px-6"
          style={
            activeTab === 'folders'
              ? { backgroundColor: colors.lavenderDeep, color: colors.text }
              : { color: colors.inkSoft }
          }
        >
          <IconFolder size={18} stroke={2} />
          Folders
        </button>
        <button
          type="button"
          onClick={() => {
            setActiveTab('tags');
            setTagsVisibleCount(TAGS_PAGE_SIZE);
          }}
          className="flex flex-1 items-center justify-center gap-2 rounded-full px-4 py-3 font-poppins text-[13px] font-bold transition-all sm:flex-none sm:px-6"
          style={
            activeTab === 'tags'
              ? { backgroundColor: colors.lavenderDeep, color: colors.text }
              : { color: colors.inkSoft }
          }
        >
          <IconHash size={18} stroke={2} />
          Tags
        </button>
      </div>

      {activeTab === 'folders' ? (
        <>
          <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center">
            <div
              className="relative min-w-0 flex-1 rounded-[20px]"
              style={{ backgroundColor: colors.cream, boxShadow: `0 2px 8px ${colors.cardShadow}` }}
            >
              <IconSearch
                className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2"
                size={16}
                stroke={2}
                style={{ color: colors.inkSoft }}
              />
              <input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search folders..."
                className="w-full rounded-[20px] border-0 bg-transparent py-3.5 pl-11 pr-4 font-poppins text-sm font-medium outline-none"
                style={{ color: colors.text }}
              />
            </div>

            <div className="flex items-center gap-2">
              <div
                className="flex rounded-full p-1"
                style={{ backgroundColor: colors.cream }}
              >
                {kindChips.map(({ id, label, icon: Icon }) => {
                  const active = kindFilter === id;
                  return (
                    <button
                      key={id}
                      type="button"
                      onClick={() => setKindFilter(id)}
                      className="inline-flex items-center gap-1.5 rounded-full px-3 py-2 font-poppins text-[12px] font-semibold transition"
                      style={
                        active
                          ? { backgroundColor: colors.lavenderDeep, color: colors.text }
                          : { color: colors.inkSoft }
                      }
                    >
                      <Icon size={14} stroke={2} />
                      <span className="hidden sm:inline">{label}</span>
                    </button>
                  );
                })}
              </div>

              <div
                className="hidden rounded-full p-1 sm:flex"
                style={{ backgroundColor: colors.cream }}
              >
                <button
                  type="button"
                  onClick={() => setViewMode('table')}
                  className="flex h-9 w-9 items-center justify-center rounded-full transition"
                  style={
                    viewMode === 'table'
                      ? { backgroundColor: colors.lavenderDeep, color: colors.text }
                      : { color: colors.inkSoft }
                  }
                  aria-label="Table view"
                >
                  <IconList size={16} stroke={2} />
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode('grid')}
                  className="flex h-9 w-9 items-center justify-center rounded-full transition"
                  style={
                    viewMode === 'grid'
                      ? { backgroundColor: colors.lavenderDeep, color: colors.text }
                      : { color: colors.inkSoft }
                  }
                  aria-label="Grid view"
                >
                  <IconLayoutGrid size={16} stroke={2} />
                </button>
              </div>
            </div>
          </div>

          {folders.length === 0 ? (
            <div
              className="flex flex-col items-center rounded-[28px] px-6 py-16 text-center"
              style={{
                backgroundColor: colors.cream,
                boxShadow: `0 2px 10px ${colors.cardShadow}`,
              }}
            >
              <div
                className="flex h-16 w-16 items-center justify-center rounded-full"
                style={{ backgroundColor: colors.lavender }}
              >
                <IconFolder size={28} stroke={1.75} style={{ color: colors.text }} />
              </div>
              <p className="mt-4 font-poppins text-base font-bold" style={{ color: colors.text }}>
                {searchQuery.trim() || kindFilter !== 'all' ? 'No folders match' : 'No folders yet'}
              </p>
              <p
                className="mt-2 max-w-sm font-poppins text-[13px] leading-relaxed"
                style={{ color: colors.inkSoft }}
              >
                {searchQuery.trim() || kindFilter !== 'all'
                  ? 'Try a different search or filter.'
                  : 'Create your first folder to organize saves and notes.'}
              </p>
              {!searchQuery.trim() && kindFilter === 'all' ? (
                <button
                  type="button"
                  onClick={() => setCreateOpen(true)}
                  className="mt-5 inline-flex items-center gap-2 rounded-full px-4 py-2.5 font-poppins text-[13px] font-semibold transition hover:scale-[1.02]"
                  style={{ backgroundColor: colors.primary, color: colors.onAccent }}
                >
                  <IconPlus size={16} stroke={2.5} />
                  New folder
                </button>
              ) : null}
            </div>
          ) : viewMode === 'table' ? (
            <>
              <div
                className="hidden overflow-hidden rounded-[24px] sm:block"
                style={{
                  backgroundColor: colors.cream,
                  boxShadow: `0 2px 10px ${colors.cardShadow}`,
                  border: `1px solid ${colors.border}`,
                }}
              >
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[640px] border-collapse text-left">
                    <thead>
                      <tr style={{ borderBottom: `1px solid ${colors.border}` }}>
                        {['Folder', 'Type', 'Items', 'Updated', ''].map((label) => (
                          <th
                            key={label || 'actions'}
                            className="px-4 py-3.5 font-poppins text-[11px] font-semibold uppercase tracking-wider first:pl-5 last:pr-5"
                            style={{ color: colors.subtitle }}
                          >
                            {label}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {folders.map((folder, index) => {
                        const countLabel = folder.kind === 'bookmarks' ? 'links' : 'notes';
                        const KindIcon = folder.kind === 'bookmarks' ? IconBookmark : IconNote;
                        return (
                          <tr
                            key={folder.id}
                            className="group transition-colors hover:bg-black/[0.02] dark:hover:bg-white/[0.03]"
                            style={{
                              borderBottom:
                                index === folders.length - 1
                                  ? undefined
                                  : `1px solid ${colors.border}`,
                            }}
                          >
                            <td className="px-4 py-3.5 first:pl-5">
                              <Link
                                href={`/app/folders/${folder.id}`}
                                className="flex min-w-0 items-center gap-3"
                              >
                                <FolderFace
                                  color={folder.color}
                                  emoji={folder.emoji}
                                  name={folder.name}
                                  size="md"
                                />
                                <div className="min-w-0">
                                  <div className="flex items-center gap-1.5">
                                    <span
                                      className="truncate font-poppins text-[14px] font-bold"
                                      style={{ color: colors.text }}
                                    >
                                      {folder.name}
                                    </span>
                                    {folder.isPinned ? (
                                      <IconPinFilled
                                        size={13}
                                        stroke={2}
                                        style={{ color: colors.primary, flexShrink: 0 }}
                                      />
                                    ) : null}
                                  </div>
                                  {folder.description ? (
                                    <p
                                      className="mt-0.5 line-clamp-1 font-poppins text-[12px]"
                                      style={{ color: colors.inkSoft }}
                                    >
                                      {folder.description}
                                    </p>
                                  ) : null}
                                </div>
                              </Link>
                            </td>
                            <td className="px-4 py-3.5">
                              <span
                                className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 font-poppins text-[11px] font-semibold"
                                style={{ backgroundColor: colors.lavender, color: colors.text }}
                              >
                                <KindIcon size={12} stroke={2} />
                                {folder.kind === 'bookmarks' ? 'Links' : 'Notes'}
                              </span>
                            </td>
                            <td className="px-4 py-3.5">
                              <span
                                className="font-poppins text-[13px] font-semibold tabular-nums"
                                style={{ color: colors.text }}
                              >
                                {folder.itemCount}
                              </span>
                              <span
                                className="ml-1 font-poppins text-[12px]"
                                style={{ color: colors.inkSoft }}
                              >
                                {countLabel}
                              </span>
                            </td>
                            <td className="px-4 py-3.5">
                              <span
                                className="font-poppins text-[13px]"
                                style={{ color: colors.inkSoft }}
                              >
                                {formatUpdated(folder.updatedAt)}
                              </span>
                            </td>
                            <td className="px-4 py-3.5 last:pr-5">
                              <div className="flex justify-end">
                                <FolderRowMenu folder={folder} />
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="space-y-2 sm:hidden">
                {folders.map((folder) => {
                  const countLabel = folder.kind === 'bookmarks' ? 'links' : 'notes';
                  return (
                    <div
                      key={`mobile-${folder.id}`}
                      className="flex items-center gap-3 rounded-[20px] p-3"
                      style={{
                        backgroundColor: colors.cream,
                        boxShadow: `0 2px 8px ${colors.cardShadow}`,
                      }}
                    >
                      <Link
                        href={`/app/folders/${folder.id}`}
                        className="flex min-w-0 flex-1 items-center gap-3"
                      >
                        <FolderFace
                          color={folder.color}
                          emoji={folder.emoji}
                          name={folder.name}
                          size="md"
                        />
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5">
                            <p
                              className="truncate font-poppins text-[14px] font-bold"
                              style={{ color: colors.text }}
                            >
                              {folder.name}
                            </p>
                            {folder.isPinned ? (
                              <IconPinFilled size={12} stroke={2} style={{ color: colors.primary }} />
                            ) : null}
                          </div>
                          <p className="font-poppins text-[11px]" style={{ color: colors.inkSoft }}>
                            {folder.itemCount} {countLabel} ·{' '}
                            {folder.kind === 'bookmarks' ? 'Links' : 'Notes'}
                          </p>
                        </div>
                      </Link>
                      <FolderRowMenu folder={folder} />
                    </div>
                  );
                })}
              </div>
            </>
          ) : (
            <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-4">
              {folders.map((folder, index) => (
                <FolderCard
                  key={folder.id}
                  folder={folder}
                  previews={folderPreviews.get(folder.id)}
                  index={index}
                />
              ))}
            </div>
          )}
        </>
      ) : tags.length > 0 ? (
        <div>
          <div className="flex flex-wrap gap-2.5">
            {visibleTags.map((tag, index) => {
              const tint = TAG_TINTS[index % TAG_TINTS.length];
              return (
                <div
                  key={tag.id}
                  className="inline-flex items-center gap-2 rounded-full px-4 py-2.5 font-poppins text-[13px] font-semibold"
                  style={{
                    backgroundColor: colors[tint],
                    color: colors.text,
                    boxShadow: `0 2px 8px ${colors.cardShadow}`,
                  }}
                >
                  <span>#{tag.name}</span>
                  <span
                    className="rounded-full px-2 py-0.5 text-[11px] font-bold"
                    style={{ backgroundColor: colors.cream, color: colors.inkSoft }}
                  >
                    {tag.count}
                  </span>
                </div>
              );
            })}
          </div>
          {hasMoreTags ? (
            <div className="mt-5 flex justify-center">
              <button
                type="button"
                onClick={() => setTagsVisibleCount((n) => n + TAGS_PAGE_SIZE)}
                className="rounded-full px-5 py-2.5 font-poppins text-[13px] font-bold transition-all hover:-translate-y-0.5"
                style={{
                  backgroundColor: colors.lavenderDeep,
                  color: colors.text,
                  boxShadow: `0 2px 8px ${colors.cardShadow}`,
                }}
              >
                Load more ({tags.length - tagsVisibleCount} left)
              </button>
            </div>
          ) : null}
        </div>
      ) : (
        <div className="flex flex-col items-center px-6 py-16 text-center">
          <IconHash size={48} stroke={1.75} style={{ color: colors.inkSoft, opacity: 0.5 }} />
          <p className="mt-4 font-poppins text-base font-bold" style={{ color: colors.text }}>
            No tags yet
          </p>
          <p className="mt-2 max-w-sm font-poppins text-[13px] leading-relaxed" style={{ color: colors.inkSoft }}>
            Tags appear when you add them to bookmarks.
          </p>
        </div>
      )}

      <CreateFolderDialog open={createOpen} onClose={() => setCreateOpen(false)} />
    </div>
  );
}
