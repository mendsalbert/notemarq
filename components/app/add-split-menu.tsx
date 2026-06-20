'use client';

import { IconBookmark, IconNote } from '@tabler/icons-react';

interface AddSplitMenuProps {
  open: boolean;
  onClose: () => void;
  onAddBookmark: () => void;
  onAddNote: () => void;
}

export function AddSplitMenu({ open, onClose, onAddBookmark, onAddNote }: AddSplitMenuProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[60] md:hidden">
      <button type="button" className="absolute inset-0 bg-black/50" onClick={onClose} aria-label="Close menu" />
      <div className="absolute inset-x-0 bottom-0 flex h-[50vh] overflow-hidden rounded-t-[28px]">
        <button
          type="button"
          onClick={onAddNote}
          className="flex flex-1 flex-col items-center justify-center gap-3 bg-[#1C1C2E] text-white"
        >
          <IconNote size={32} stroke={1.6} />
          <span className="text-lg font-semibold">Add note</span>
        </button>
        <button
          type="button"
          onClick={onAddBookmark}
          className="flex flex-1 flex-col items-center justify-center gap-3 border-l border-white/10 bg-[#22D3EE] text-[#1C1C2E]"
        >
          <IconBookmark size={32} stroke={1.6} />
          <span className="text-lg font-semibold">Add bookmark</span>
        </button>
      </div>
    </div>
  );
}
