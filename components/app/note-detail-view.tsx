'use client';

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  IconArrowLeft,
  IconBold,
  IconItalic,
  IconUnderline,
  IconList,
  IconListNumbers,
  IconBlockquote,
  IconH1,
  IconH2,
  IconTrash,
  IconPalette,
  IconArrowBackUp,
  IconArrowForwardUp,
  IconLetterA,
  IconFolder,
  IconNote,
  IconPhoto,
  IconLink,
} from '@tabler/icons-react';

import { KeepBookmarkCard } from '@/components/app/keep-bookmark-card';
import { PinToggleButton } from '@/components/app/pin-toggle-button';
import { useAppColors } from '@/hooks/use-app-colors';
import { useAppStore } from '@/store/app-store';
import {
  getNotePaletteOptions,
  resolveNotePalette,
  type NotePaletteKey,
} from '@/lib/note-palette';

function plainPreview(html: string) {
  return html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 240);
}

function formatLongDate(value: string) {
  const parsed = /^\d{4}-\d{2}-\d{2}$/.test(value)
    ? new Date(`${value}T12:00:00`)
    : new Date(value);
  if (Number.isNaN(parsed.getTime())) return '';
  return parsed.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
}

function exec(cmd: string, val?: string) {
  document.execCommand(cmd, false, val);
}

function escapeAttr(value: string) {
  return value.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');
}

interface PopoverBtnProps {
  label: string;
  active?: boolean;
  onClick: () => void;
  children: React.ReactNode;
  inkSoft: string;
}

function PopoverBtn({ label, active, onClick, children, inkSoft, secondary }: PopoverBtnProps & { secondary: string }) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      className="flex h-9 w-9 items-center justify-center rounded-full transition-all hover:scale-105"
      style={{
        color: inkSoft,
        backgroundColor: active ? secondary : 'transparent',
      }}
    >
      {children}
    </button>
  );
}

interface FormatItemProps {
  label: string;
  onClick: () => void;
  children: React.ReactNode;
  text: string;
}

function FormatItem({ label, onClick, children, text, secondary }: FormatItemProps & { secondary: string }) {
  return (
    <button
      type="button"
      aria-label={label}
      onMouseDown={(e) => { e.preventDefault(); onClick(); }}
      className="flex h-9 w-9 items-center justify-center rounded-full transition"
      style={{ color: text }}
      onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = secondary; }}
      onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; }}
    >
      {children}
    </button>
  );
}

export function NoteDetailView({ id }: { id: string }) {
  const router = useRouter();
  const { colors } = useAppColors();
  const notes = useAppStore((s) => s.notes);
  const bookmarks = useAppStore((s) => s.bookmarks);
  const folders = useAppStore((s) => s.folders);
  const updateNote = useAppStore((s) => s.updateNote);
  const deleteNote = useAppStore((s) => s.deleteNote);
  const togglePinNote = useAppStore((s) => s.togglePinNote);

  const note = notes.find((n) => n.id === id);
  const linked = useMemo(
    () => bookmarks.filter((b) => note?.bookmarks.includes(b.id)),
    [bookmarks, note?.bookmarks],
  );
  const folder = folders.find((f) => f.id === note?.folderId);

  const [title, setTitle] = useState('');
  const [paletteKey, setPaletteKey] = useState<NotePaletteKey>('lavender');
  const [formatOpen, setFormatOpen] = useState(false);
  const [colorOpen, setColorOpen] = useState(false);

  const palette = useMemo(
    () => resolveNotePalette(paletteKey, colors),
    [paletteKey, colors],
  );
  const paletteOptions = useMemo(() => getNotePaletteOptions(colors), [colors]);
  const noteBg = palette.bg;
  const noteAccent = palette.accent;

  const editorRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLTextAreaElement>(null);
  const loadedIdRef = useRef<string | null>(null);
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isSavingRef = useRef(false);
  const formatRef = useRef<HTMLDivElement>(null);
  const colorRef = useRef<HTMLDivElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!note) return;
    if (loadedIdRef.current === note.id) return;
    loadedIdRef.current = note.id;
    setTitle(note.name);
    setPaletteKey(resolveNotePalette(note.color, colors).key);
    const content = note.notes ?? '';
    if (editorRef.current) {
      const isHtml = /<[a-z][\s\S]*>/i.test(content);
      editorRef.current.innerHTML = isHtml ? content : content.replace(/\n/g, '<br>');
    }
  }, [note, colors]);

  useEffect(() => {
    const el = titleRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${el.scrollHeight}px`;
  }, [title]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (formatRef.current && !formatRef.current.contains(e.target as Node)) {
        setFormatOpen(false);
      }
      if (colorRef.current && !colorRef.current.contains(e.target as Node)) {
        setColorOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getBody = useCallback(() => editorRef.current?.innerHTML ?? '', []);

  const persist = useCallback(async () => {
    if (!note || isSavingRef.current) return;
    const nextTitle = title.trim() || 'Untitled note';
    const nextBody = getBody();
    const nextDescription = plainPreview(nextBody) || nextTitle;
    if (
      nextTitle === note.name &&
      nextBody === (note.notes ?? '') &&
      nextDescription === note.description &&
      paletteKey === resolveNotePalette(note.color, colors).key
    ) return;
    isSavingRef.current = true;
    try {
      await updateNote(note.id, {
        name: nextTitle,
        notes: nextBody,
        description: nextDescription,
        color: paletteKey,
      });
    } finally {
      isSavingRef.current = false;
    }
  }, [getBody, note, paletteKey, colors, title, updateNote]);

  function scheduleSave() {
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(() => void persist(), 900);
  }

  useEffect(() => () => { void persist(); }, [persist]);

  async function handleDelete() {
    if (!note) return;
    if (!window.confirm(`Delete "${note.name}"? This can't be undone.`)) return;
    await deleteNote(note.id);
    router.push('/app/notes');
  }

  function applyFormat(cmd: string, val?: string) {
    exec(cmd, val);
    setFormatOpen(false);
    editorRef.current?.focus();
    scheduleSave();
  }

  async function pickBackground(key: NotePaletteKey) {
    setPaletteKey(key);
    setColorOpen(false);
    if (!note) return;
    await updateNote(note.id, { color: key });
  }

  function insertLink() {
    const url = window.prompt('Paste a link');
    if (!url?.trim()) return;
    const href = /^https?:\/\//i.test(url.trim()) ? url.trim() : `https://${url.trim()}`;
    const safeHref = escapeAttr(href);
    editorRef.current?.focus();
    const selection = window.getSelection();
    if (!selection || selection.isCollapsed) {
      exec(
        'insertHTML',
        `<a href="${safeHref}" target="_blank" rel="noopener noreferrer">${safeHref}</a>`,
      );
    } else {
      exec('createLink', href);
    }
    scheduleSave();
  }

  function insertImage(file: File) {
    const reader = new FileReader();
    reader.onload = () => {
      const src = reader.result as string;
      editorRef.current?.focus();
      exec(
        'insertHTML',
        `<img src="${src}" alt="Note image" style="max-width:100%;border-radius:12px;margin:8px 0;display:block;" />`,
      );
      scheduleSave();
    };
    reader.readAsDataURL(file);
  }

  function handleImagePick(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) insertImage(file);
    e.target.value = '';
  }

  if (!note) {
    return (
      <div className="mx-auto max-w-2xl px-5 py-16 text-center">
        <p className="font-poppins text-base font-bold" style={{ color: colors.text }}>Note not found</p>
        <Link href="/app/notes" className="mt-4 inline-block font-poppins text-sm font-medium" style={{ color: colors.primary }}>
          Back to notes
        </Link>
      </div>
    );
  }

  return (
    <div className="relative mx-auto w-full max-w-[1400px] px-4 py-5 md:px-6 md:py-6">
      <div className="canvas-grid pointer-events-none absolute inset-0" />

      {/* Header */}
      <header className="relative z-10 mb-5 flex items-center justify-between gap-3">
        <Link
          href="/app/notes"
          className="inline-flex h-9 w-9 items-center justify-center rounded-full transition hover:scale-105"
          style={{ backgroundColor: colors.cream, boxShadow: `0 2px 8px ${colors.cardShadow}` }}
          aria-label="Back to notes"
        >
          <IconArrowLeft size={18} stroke={2} style={{ color: colors.text }} />
        </Link>
        <PinToggleButton
          pinned={note.isPinned}
          onToggle={() => void togglePinNote(note.id)}
        />
      </header>

      {/* Note card */}
      <div
        className="relative z-10 flex min-h-[calc(100vh-14rem)] flex-col rounded-[28px] px-6 py-8 md:px-10 md:py-10"
        style={{
          backgroundColor: noteBg,
          boxShadow: `0 4px 18px ${colors.cardShadow}`,
          transition: 'background-color 0.25s ease',
        }}
      >
        <p className="mb-3 font-poppins text-[13px]" style={{ color: colors.inkSoft }}>
          {formatLongDate(note.updatedAt)}
        </p>

        <textarea
          ref={titleRef}
          value={title}
          onChange={(e) => { setTitle(e.target.value); scheduleSave(); }}
          placeholder="Morning reflection"
          rows={1}
          className="mb-4 w-full resize-none overflow-hidden border-0 bg-transparent font-poppins text-[28px] font-bold leading-tight tracking-tight outline-none placeholder:opacity-30"
          style={{ color: colors.text }}
        />

        <div className="mb-6 flex flex-wrap gap-2">
          <span
            className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 font-poppins text-[11px] font-semibold"
            style={{ backgroundColor: colors.lavenderDeep, color: colors.text }}
          >
            <IconNote size={13} stroke={2} />
            Note
          </span>
          {folder && (
            <span
              className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 font-poppins text-[11px] font-semibold"
              style={{ backgroundColor: colors.peach, color: colors.text }}
            >
              <IconFolder size={13} stroke={2} />
              {folder.emoji ? `${folder.emoji} ` : ''}{folder.name}
            </span>
          )}
        </div>

        <div
          ref={editorRef}
          contentEditable
          suppressContentEditableWarning
          onInput={() => {
            scheduleSave();
          }}
          data-placeholder="Start writing your thoughts…"
          className="prose-editor min-h-[calc(100vh-32rem)] flex-1 w-full outline-none"
          style={{
            color: colors.text,
            fontFamily: "'Poppins', sans-serif",
            fontSize: '16px',
            lineHeight: '1.6',
            caretColor: noteAccent,
          }}
        />

        {/* Google Keep-style toolbar */}
        <div
          className="relative mt-6 flex items-center gap-1 overflow-visible border-t pt-4"
          style={{ borderColor: `${colors.border}` }}
        >
          {/* Format — "A" button with popover */}
          <div className="relative" ref={formatRef}>
            <PopoverBtn
              label="Text formatting"
              active={formatOpen}
              onClick={() => { setFormatOpen((v) => !v); setColorOpen(false); }}
              inkSoft={colors.inkSoft}
              secondary={colors.secondary}
            >
              <span className="flex flex-col items-center leading-none">
                <IconLetterA size={16} stroke={2} />
                <span className="mt-0.5 h-0.5 w-3 rounded-full" style={{ backgroundColor: colors.inkSoft }} />
              </span>
            </PopoverBtn>

            {formatOpen && (
              <div
                className="absolute bottom-full left-0 z-30 mb-2 w-max rounded-2xl px-2 py-2"
                style={{
                  backgroundColor: colors.cream,
                  boxShadow: `0 8px 28px ${colors.cardShadow}`,
                  border: `1px solid ${colors.border}`,
                }}
              >
                <div className="flex items-center gap-1">
                <FormatItem label="Bold" onClick={() => applyFormat('bold')} text={colors.text} secondary={colors.secondary}>
                  <IconBold size={16} stroke={2.2} />
                </FormatItem>
                <FormatItem label="Italic" onClick={() => applyFormat('italic')} text={colors.text} secondary={colors.secondary}>
                  <IconItalic size={16} stroke={2.2} />
                </FormatItem>
                <FormatItem label="Underline" onClick={() => applyFormat('underline')} text={colors.text} secondary={colors.secondary}>
                  <IconUnderline size={16} stroke={2.2} />
                </FormatItem>
                <div className="mx-1 h-5 w-px" style={{ backgroundColor: colors.border }} />
                <FormatItem label="Heading 1" onClick={() => applyFormat('formatBlock', '<h1>')} text={colors.text} secondary={colors.secondary}>
                  <IconH1 size={16} stroke={2} />
                </FormatItem>
                <FormatItem label="Heading 2" onClick={() => applyFormat('formatBlock', '<h2>')} text={colors.text} secondary={colors.secondary}>
                  <IconH2 size={16} stroke={2} />
                </FormatItem>
                <div className="mx-1 h-5 w-px" style={{ backgroundColor: colors.border }} />
                <FormatItem label="Bullet list" onClick={() => applyFormat('insertUnorderedList')} text={colors.text} secondary={colors.secondary}>
                  <IconList size={16} stroke={2} />
                </FormatItem>
                <FormatItem label="Numbered list" onClick={() => applyFormat('insertOrderedList')} text={colors.text} secondary={colors.secondary}>
                  <IconListNumbers size={16} stroke={2} />
                </FormatItem>
                <FormatItem label="Quote" onClick={() => applyFormat('formatBlock', '<blockquote>')} text={colors.text} secondary={colors.secondary}>
                  <IconBlockquote size={16} stroke={2} />
                </FormatItem>
                </div>
              </div>
            )}
          </div>

          {/* Background color — palette button with popover */}
          <div className="relative" ref={colorRef}>
            <PopoverBtn
              label="Background color"
              active={colorOpen}
              onClick={() => { setColorOpen((v) => !v); setFormatOpen(false); }}
              inkSoft={colors.inkSoft}
              secondary={colors.secondary}
            >
              <IconPalette size={18} stroke={2} />
            </PopoverBtn>

            {colorOpen && (
              <div
                className="absolute bottom-full left-0 z-30 mb-2 rounded-2xl p-3"
                style={{
                  backgroundColor: colors.cream,
                  boxShadow: `0 8px 28px ${colors.cardShadow}`,
                  border: `1px solid ${colors.border}`,
                  width: '10.75rem',
                }}
              >
                <div className="grid grid-cols-4 gap-2">
                  {paletteOptions.map((entry) => (
                    <button
                      key={entry.key}
                      type="button"
                      aria-label="Note background color"
                      onClick={() => void pickBackground(entry.key)}
                      className="h-8 w-8 shrink-0 rounded-full transition hover:scale-110"
                      style={{
                        backgroundColor: entry.bg,
                        boxShadow: paletteKey === entry.key
                          ? `0 0 0 2px ${colors.cream}, 0 0 0 4px ${entry.accent}`
                          : `inset 0 0 0 1px ${colors.border}`,
                      }}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>

          <input
            ref={imageInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleImagePick}
          />

          <PopoverBtn
            label="Add image"
            onClick={() => imageInputRef.current?.click()}
            inkSoft={colors.inkSoft}
            secondary={colors.secondary}
          >
            <IconPhoto size={18} stroke={2} />
          </PopoverBtn>

          <PopoverBtn
            label="Add link"
            onClick={insertLink}
            inkSoft={colors.inkSoft}
            secondary={colors.secondary}
          >
            <IconLink size={18} stroke={2} />
          </PopoverBtn>

          <div className="mx-2 h-5 w-px" style={{ backgroundColor: colors.border }} />

          <PopoverBtn label="Undo" onClick={() => exec('undo')} inkSoft={colors.inkSoft} secondary={colors.secondary}>
            <IconArrowBackUp size={18} stroke={2} />
          </PopoverBtn>
          <PopoverBtn label="Redo" onClick={() => exec('redo')} inkSoft={colors.inkSoft} secondary={colors.secondary}>
            <IconArrowForwardUp size={18} stroke={2} />
          </PopoverBtn>

          <div className="ml-auto flex items-center gap-1">
            <button
              type="button"
              onClick={() => void handleDelete()}
              className="flex h-9 w-9 items-center justify-center rounded-full transition hover:scale-105"
              style={{ color: colors.danger }}
              aria-label="Delete note"
            >
              <IconTrash size={17} stroke={2} />
            </button>
            <Link
              href="/app/notes"
              onClick={() => void persist()}
              className="rounded-full px-4 py-2 font-poppins text-[13px] font-bold transition hover:opacity-80"
              style={{ color: colors.text }}
            >
              Close
            </Link>
          </div>
        </div>
      </div>

      {linked.length > 0 && (
        <section className="relative z-10 mt-10 pb-10">
          <h2
            className="mb-4 font-poppins text-[11px] font-bold uppercase tracking-widest"
            style={{ color: colors.subtitle }}
          >
            Linked saves
          </h2>
          <div className="columns-1 gap-4 sm:columns-2 lg:columns-3 xl:columns-4">
            {linked.map((bookmark, index) => (
              <KeepBookmarkCard key={bookmark.id} bookmark={bookmark} variant="grid" index={index} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
