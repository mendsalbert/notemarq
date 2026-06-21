'use client';

import { useMemo, useState } from 'react';
import { IconFolder, IconHash, IconSearch } from '@tabler/icons-react';

import { FolderCard } from '@/components/app/folder-card';
import { useAppColors } from '@/hooks/use-app-colors';
import { sortWithPinsFirst } from '@/lib/pin-sort';
import { useAppStore } from '@/store/app-store';

type OrganizeTab = 'folders' | 'tags';

const TAG_TINTS = ['lavender', 'peach', 'mint', 'blushDeep', 'butter', 'cream'] as const;

export function FoldersView() {
  const { colors } = useAppColors();
  const allFolders = useAppStore((s) => s.folders);
  const bookmarks = useAppStore((s) => s.bookmarks);
  const [activeTab, setActiveTab] = useState<OrganizeTab>('folders');
  const [searchQuery, setSearchQuery] = useState('');

  const folders = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    const sorted = sortWithPinsFirst(
      allFolders,
      (folder) => folder.isPinned,
      (a, b) => a.name.localeCompare(b.name),
    );
    if (!q) return sorted;
    return sorted.filter(
      (folder) =>
        folder.name.toLowerCase().includes(q) ||
        folder.description.toLowerCase().includes(q),
    );
  }, [allFolders, searchQuery]);

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

  return (
    <div className="mx-auto w-full max-w-[1400px] px-4 py-5 md:px-6 md:py-6">
      <h1 className="mb-5 font-poppins text-[28px] font-bold tracking-tight" style={{ color: colors.text }}>
        Organize
      </h1>

      <div className="mb-4 flex gap-2">
        <button
          type="button"
          onClick={() => setActiveTab('folders')}
          className="flex flex-1 items-center justify-center gap-2 rounded-full px-4 py-3 font-poppins text-[13px] font-bold transition-all"
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
          onClick={() => setActiveTab('tags')}
          className="flex flex-1 items-center justify-center gap-2 rounded-full px-4 py-3 font-poppins text-[13px] font-bold transition-all"
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
          <div
            className="relative mb-5 rounded-[20px]"
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

          {folders.length === 0 ? (
            <div className="flex flex-col items-center px-6 py-16 text-center">
              <IconFolder size={48} stroke={1.75} style={{ color: colors.inkSoft, opacity: 0.5 }} />
              <p className="mt-4 font-poppins text-base font-bold" style={{ color: colors.text }}>
                {searchQuery.trim() ? 'No folders match' : 'No folders yet'}
              </p>
              <p className="mt-2 max-w-sm font-poppins text-[13px] leading-relaxed" style={{ color: colors.inkSoft }}>
                {searchQuery.trim()
                  ? 'Try a different search term.'
                  : 'Create your first folder to organize saves and notes.'}
              </p>
            </div>
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
        <div className="flex flex-wrap gap-2.5">
          {tags.map((tag, index) => {
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
    </div>
  );
}
