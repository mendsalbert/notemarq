'use client';

import { FormEvent, useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { IconBookmark, IconNote, IconX } from '@tabler/icons-react';

import { FolderFace } from '@/components/app/folder-face';
import { useAuth } from '@/contexts/auth-provider';
import { useAppColors } from '@/hooks/use-app-colors';
import { DEFAULT_FOLDER_COLOR, FOLDER_COLORS } from '@/lib/folder-options';
import type { LibraryKind } from '@/lib/types';
import { useAppStore } from '@/store/app-store';

interface CreateFolderDialogProps {
  open: boolean;
  onClose: () => void;
  defaultKind?: LibraryKind;
}

export function CreateFolderDialog({
  open,
  onClose,
  defaultKind = 'bookmarks',
}: CreateFolderDialogProps) {
  const router = useRouter();
  const { user } = useAuth();
  const { colors } = useAppColors();
  const createFolder = useAppStore((s) => s.createFolder);

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [kind, setKind] = useState<LibraryKind>(defaultKind);
  const [color, setColor] = useState(DEFAULT_FOLDER_COLOR);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const nameRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!open) return;
    setName('');
    setDescription('');
    setKind(defaultKind);
    setColor(DEFAULT_FOLDER_COLOR);
    setError('');
    setSaving(false);
    const t = setTimeout(() => nameRef.current?.focus(), 80);
    return () => clearTimeout(t);
  }, [open, defaultKind]);

  if (!open) return null;

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    const trimmed = name.trim();
    if (!trimmed || !user?.id || saving) return;

    setSaving(true);
    setError('');
    try {
      const { id } = await createFolder(user.id, {
        name: trimmed,
        description: description.trim(),
        color,
        kind,
        isPinned: false,
      });
      onClose();
      router.push(`/app/folders/${id}`);
    } catch (err) {
      console.error('[CreateFolderDialog] failed:', err);
      setError('Could not create folder. Please try again.');
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-[80] flex items-end justify-center p-4 sm:items-center">
      <button
        type="button"
        aria-label="Close"
        className="absolute inset-0 bg-black/40 backdrop-blur-[2px]"
        onClick={onClose}
      />
      <form
        onSubmit={(e) => void handleSubmit(e)}
        className="relative z-10 w-full max-w-md overflow-hidden rounded-[28px] p-5 shadow-2xl sm:p-6"
        style={{ backgroundColor: colors.cream, border: `1px solid ${colors.border}` }}
      >
        <div className="mb-5 flex items-start justify-between gap-3">
          <div>
            <h2 className="font-poppins text-lg font-bold" style={{ color: colors.text }}>
              New folder
            </h2>
            <p className="mt-1 font-poppins text-[13px]" style={{ color: colors.inkSoft }}>
              Group links or notes in one place.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-full transition hover:scale-105"
            style={{ backgroundColor: colors.lavender }}
            aria-label="Close dialog"
          >
            <IconX size={16} stroke={2} style={{ color: colors.text }} />
          </button>
        </div>

        <div className="mb-5 flex items-center gap-3">
          <FolderFace color={color} name={name || 'F'} size="lg" />
          <div className="min-w-0 flex-1">
            <input
              ref={nameRef}
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Folder name"
              maxLength={60}
              className="w-full rounded-2xl border-0 px-4 py-3 font-poppins text-sm font-semibold outline-none"
              style={{ backgroundColor: colors.lavender, color: colors.text }}
            />
          </div>
        </div>

        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Short description (optional)"
          rows={2}
          maxLength={160}
          className="mb-4 w-full resize-none rounded-2xl border-0 px-4 py-3 font-poppins text-sm outline-none"
          style={{ backgroundColor: colors.lavender, color: colors.text }}
        />

        <div className="mb-4 flex gap-2">
          {(
            [
              { id: 'bookmarks' as const, label: 'Links', icon: IconBookmark },
              { id: 'notes' as const, label: 'Notes', icon: IconNote },
            ] as const
          ).map(({ id, label, icon: Icon }) => {
            const active = kind === id;
            return (
              <button
                key={id}
                type="button"
                onClick={() => setKind(id)}
                className="flex flex-1 items-center justify-center gap-2 rounded-2xl px-3 py-2.5 font-poppins text-[13px] font-semibold transition"
                style={
                  active
                    ? { backgroundColor: colors.lavenderDeep, color: colors.text }
                    : { backgroundColor: colors.pageBackground, color: colors.inkSoft }
                }
              >
                <Icon size={15} stroke={2} />
                {label}
              </button>
            );
          })}
        </div>

        <div className="mb-5">
          <p className="mb-2 px-1 font-poppins text-[11px] font-semibold uppercase tracking-wider" style={{ color: colors.subtitle }}>
            Color
          </p>
          <div className="flex flex-wrap gap-2">
            {FOLDER_COLORS.slice(0, 8).map((swatch) => {
              const active = color === swatch;
              return (
                <button
                  key={swatch}
                  type="button"
                  onClick={() => setColor(swatch)}
                  className="h-8 w-8 rounded-full transition hover:scale-110"
                  style={{
                    backgroundColor: swatch,
                    boxShadow: active ? `0 0 0 3px ${colors.cream}, 0 0 0 5px ${swatch}` : undefined,
                  }}
                  aria-label={`Color ${swatch}`}
                />
              );
            })}
          </div>
        </div>

        {error ? (
          <p className="mb-3 font-poppins text-[13px] font-medium" style={{ color: colors.danger }}>
            {error}
          </p>
        ) : null}

        <button
          type="submit"
          disabled={!name.trim() || saving || !user?.id}
          className="flex w-full items-center justify-center rounded-2xl py-3.5 font-poppins text-[14px] font-semibold transition hover:-translate-y-0.5 disabled:opacity-50"
          style={{ backgroundColor: colors.primary, color: colors.onAccent }}
        >
          {saving ? 'Creating…' : 'Create folder'}
        </button>
      </form>
    </div>
  );
}
