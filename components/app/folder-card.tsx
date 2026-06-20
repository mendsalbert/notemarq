'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { IconDots, IconPencil, IconTrash } from '@tabler/icons-react';

import { FolderFace } from '@/components/app/folder-face';
import { LinkPreviewThumb } from '@/components/app/link-preview';
import { useAppColors } from '@/hooks/use-app-colors';
import { useAppStore } from '@/store/app-store';
import type { Bookmark, Folder } from '@/lib/types';

const FOLDER_TINTS = ['lavender', 'peach', 'mint', 'blushDeep', 'butter'] as const;

interface FolderCardProps {
  folder: Folder;
  previews?: Bookmark[];
  index?: number;
}

export function FolderCard({ folder, previews = [], index = 0 }: FolderCardProps) {
  const { colors } = useAppColors();
  const updateFolder = useAppStore((s) => s.updateFolder);
  const deleteFolder = useAppStore((s) => s.deleteFolder);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const tintKey = FOLDER_TINTS[index % FOLDER_TINTS.length];
  const cardBg = colors[tintKey];
  const countLabel = folder.kind === 'bookmarks' ? 'links' : 'notes';
  const previewItems = previews.slice(0, 3);

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
    <div
      className="relative flex min-h-[200px] flex-col rounded-[22px] transition-all hover:-translate-y-1"
      style={{
        backgroundColor: cardBg,
        boxShadow: `0 2px 10px ${colors.cardShadow}`,
      }}
    >
      <div ref={menuRef} className="absolute right-3 top-3 z-10">
        <button
          type="button"
          className="flex h-7 w-7 items-center justify-center rounded-full transition hover:scale-105"
          style={{ backgroundColor: colors.cream }}
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
            className="absolute right-0 top-9 min-w-[132px] overflow-hidden rounded-2xl py-1"
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
              Edit
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

      <Link href={`/app/folders/${folder.id}`} className="flex flex-1 flex-col gap-3 p-4">
        <FolderFace
          color={folder.color}
          emoji={folder.emoji}
          name={folder.name}
          size="sm"
          compact
        />

        <div className="min-w-0 flex-1 pr-6">
          <p
            className="line-clamp-2 font-poppins text-[14px] font-bold leading-tight tracking-tight"
            style={{ color: colors.text }}
          >
            {folder.name}
          </p>
          <p className="mt-1 font-poppins text-[11px] font-medium" style={{ color: colors.inkSoft }}>
            {folder.itemCount} {countLabel}
          </p>
        </div>

        {folder.kind === 'bookmarks' && previewItems.length > 0 ? (
          previewItems.length === 1 ? (
            <div className="mt-auto overflow-hidden rounded-xl">
              <LinkPreviewThumb
                previewImage={previewItems[0].previewImage}
                favicon={previewItems[0].favicon}
                source={previewItems[0].source}
                className="max-h-32 w-full rounded-xl object-cover object-center"
              />
            </div>
          ) : (
            <div className="mt-auto flex gap-1.5">
              {previewItems.map((bookmark) => (
                <LinkPreviewThumb
                  key={bookmark.id}
                  previewImage={bookmark.previewImage}
                  favicon={bookmark.favicon}
                  source={bookmark.source}
                  className={`flex-1 rounded-lg ${previewItems.length === 2 ? 'h-16' : 'h-10'}`}
                />
              ))}
              {folder.itemCount > previewItems.length ? (
                <div
                  className={`flex shrink-0 items-center justify-center rounded-lg font-poppins text-[10px] font-bold ${previewItems.length === 2 ? 'h-16 w-16' : 'h-10 w-10'}`}
                  style={{ backgroundColor: colors.cream, color: colors.inkSoft }}
                >
                  +{folder.itemCount - previewItems.length}
                </div>
              ) : null}
            </div>
          )
        ) : null}
      </Link>
    </div>
  );
}
