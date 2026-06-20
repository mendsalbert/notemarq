'use client';

import {
  IconBookmark,
  IconBrain,
  IconCamera,
  IconCheck,
  IconChevronRight,
  IconLogout,
  IconMinus,
  IconNote,
  IconPencil,
  IconPlus,
  IconPuzzle,
  IconSparkles,
  IconX,
} from '@tabler/icons-react';
import Image from 'next/image';
import Link from 'next/link';
import { useCallback, useEffect, useRef, useState } from 'react';

import { useAuth } from '@/contexts/auth-provider';
import { useAppColors } from '@/hooks/use-app-colors';
import { appContentClass } from '@/lib/app-layout';
import { isSupabaseConfigured, supabase } from '@/lib/supabase/client';
import { useAppStore } from '@/store/app-store';
import { cn } from '@/lib/utils';

const APP_VERSION = '0.1.0';
const MIN_WEEKLY_GOAL = 1;
const MAX_WEEKLY_BOOKMARK_GOAL = 21;
const MAX_WEEKLY_NOTE_GOAL = 14;
const BOOKMARK_GOAL_KEY = 'notemarq-web-weekly-bookmark-goal';
const NOTE_GOAL_KEY = 'notemarq-web-weekly-note-goal';

function readGoal(key: string, fallback: number) {
  if (typeof window === 'undefined') return fallback;
  const raw = localStorage.getItem(key);
  const n = raw ? Number(raw) : fallback;
  return Number.isFinite(n) ? n : fallback;
}

function Divider() {
  const { colors } = useAppColors();
  return <div className="ml-[52px] h-px" style={{ backgroundColor: colors.border }} />;
}

function SettingsCard({ children }: { children: React.ReactNode }) {
  const { colors } = useAppColors();
  return (
    <div
      className="overflow-hidden rounded-[22px]"
      style={{ backgroundColor: colors.cream, border: `1px solid ${colors.border}` }}
    >
      {children}
    </div>
  );
}

function SettingsRow({
  icon,
  iconBg,
  label,
  hint,
  href,
  onClick,
  trailing,
  danger = false,
}: {
  icon: React.ReactNode;
  iconBg?: string;
  label: string;
  hint?: string;
  href?: string;
  onClick?: () => void;
  trailing?: React.ReactNode;
  danger?: boolean;
}) {
  const { colors } = useAppColors();

  const iconBgColor = iconBg ?? colors.lavender;

  const content = (
    <>
      <div
        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[11px]"
        style={{ backgroundColor: danger ? `${colors.danger}1A` : iconBgColor }}
      >
        {icon}
      </div>
      <div className="min-w-0 flex-1">
        <p
          className="font-poppins text-[14px] font-medium leading-tight"
          style={{ color: danger ? colors.danger : colors.text }}
        >
          {label}
        </p>
        {hint ? (
          <p className="mt-0.5 font-poppins text-[12px] leading-tight" style={{ color: colors.inkSoft }}>
            {hint}
          </p>
        ) : null}
      </div>
      {trailing !== undefined ? trailing : (
        href || onClick ? (
          <IconChevronRight size={17} stroke={2} style={{ color: colors.subtitle }} />
        ) : null
      )}
    </>
  );

  const cls = 'flex min-h-[54px] items-center gap-3 px-4 py-3';

  if (href)    return <Link    href={href}  className={cls}>{content}</Link>;
  if (onClick) return <button type="button" onClick={onClick} className={cn(cls, 'w-full text-left')}>{content}</button>;
  return <div className={cls}>{content}</div>;
}

function GoalStepper({
  icon,
  iconBg,
  label,
  hint,
  value,
  min,
  max,
  onChange,
}: {
  icon: React.ReactNode;
  iconBg?: string;
  label: string;
  hint?: string;
  value: number;
  min: number;
  max: number;
  onChange: (v: number) => void;
}) {
  const { colors } = useAppColors();
  return (
    <div className="flex min-h-[54px] items-center gap-3 px-4 py-3">
      <div
        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[11px]"
        style={{ backgroundColor: iconBg ?? colors.lavender }}
      >
        {icon}
      </div>
      <div className="min-w-0 flex-1">
        <p className="font-poppins text-[14px] font-medium leading-tight" style={{ color: colors.text }}>{label}</p>
        {hint && <p className="mt-0.5 font-poppins text-[12px]" style={{ color: colors.inkSoft }}>{hint}</p>}
      </div>
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => onChange(value - 1)}
          disabled={value <= min}
          className="flex h-8 w-8 items-center justify-center rounded-[10px] transition disabled:opacity-30"
          style={{ backgroundColor: colors.lavenderDeep, color: colors.text }}
        >
          <IconMinus size={15} stroke={2.5} />
        </button>
        <span className="w-6 text-center font-poppins text-[15px] font-bold" style={{ color: colors.text }}>{value}</span>
        <button
          type="button"
          onClick={() => onChange(value + 1)}
          disabled={value >= max}
          className="flex h-8 w-8 items-center justify-center rounded-[10px] transition disabled:opacity-30"
          style={{ backgroundColor: colors.lavenderDeep, color: colors.text }}
        >
          <IconPlus size={15} stroke={2.5} />
        </button>
      </div>
    </div>
  );
}

/* ─── Profile card with editable name + photo ─── */
function ProfileHero() {
  const { user } = useAuth();
  const { colors } = useAppColors();
  const bookmarks = useAppStore((s) => s.bookmarks);
  const notes = useAppStore((s) => s.notes);

  const name = (user?.user_metadata?.full_name as string) ??
    (user?.user_metadata?.name as string) ?? '';
  const email = user?.email ?? '';
  const authPhoto = (user?.user_metadata?.avatar_url as string) ??
    (user?.user_metadata?.picture as string);

  const [displayName, setDisplayName] = useState(name);
  const [photo, setPhoto] = useState(authPhoto);
  const [editingName, setEditingName] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [saved, setSaved] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const nameInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setDisplayName(name);
    setPhoto(authPhoto);
  }, [name, authPhoto]);

  useEffect(() => {
    if (editingName) nameInputRef.current?.focus();
  }, [editingName]);
  const plan = 'free';
  const PLAN_LABEL: Record<string, string> = { free: 'Free', pro: 'Pro', plus: 'Plus' };

  async function uploadAvatar(file: File) {
    if (!user?.id || !isSupabaseConfigured) return;
    setUploading(true);
    setError('');
    try {
      const ext = file.name.split('.').pop()?.toLowerCase() ?? 'jpg';
      const path = `${user.id}/avatar.${ext}`;
      let avatarUrl: string;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(path, file, { upsert: true, contentType: file.type });

      if (uploadError) {
        avatarUrl = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = reject;
          reader.readAsDataURL(file);
        });
      } else {
        const { data } = supabase.storage.from('avatars').getPublicUrl(path);
        avatarUrl = `${data.publicUrl}?t=${Date.now()}`;
      }

      const { error: updateError } = await supabase.auth.updateUser({
        data: { avatar_url: avatarUrl, picture: avatarUrl },
      });
      if (updateError) throw updateError;
      setPhoto(avatarUrl);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch {
      setError('Could not update photo. Try a smaller image.');
    } finally {
      setUploading(false);
    }
  }

  async function saveProfile() {
    if (!isSupabaseConfigured) return;
    const trimmed = displayName.trim();
    if (!trimmed) { setError('Name cannot be empty'); return; }
    setSaving(true);
    setError('');
    try {
      const { error: updateError } = await supabase.auth.updateUser({
        data: { full_name: trimmed, name: trimmed },
      });
      if (updateError) throw updateError;
      setSaved(true);
      setEditingName(false);
      setTimeout(() => setSaved(false), 2000);
    } catch {
      setError('Could not save name. Try again.');
    } finally {
      setSaving(false);
    }
  }

  const initial = (displayName || name || email || 'U').charAt(0).toUpperCase();

  return (
    <div
      className="mb-5 overflow-hidden rounded-[22px] border"
      style={{ backgroundColor: colors.cream, borderColor: colors.border }}
    >
      <div className="px-5 py-5">
        <div className="flex items-start gap-4">
          {/* Avatar with upload */}
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="group relative shrink-0"
            aria-label="Change profile photo"
          >
            {photo ? (
              <Image
                src={photo}
                alt=""
                width={72}
                height={72}
                className="h-[72px] w-[72px] rounded-[20px] object-cover"
              />
            ) : (
              <div
                className="flex h-[72px] w-[72px] items-center justify-center rounded-[20px] text-2xl font-bold"
                style={{ backgroundColor: colors.lavender, color: colors.text }}
              >
                {initial}
              </div>
            )}
            <div
              className="absolute inset-0 flex items-center justify-center rounded-[20px] opacity-0 transition group-hover:opacity-100"
              style={{ backgroundColor: 'rgba(0,0,0,0.45)' }}
            >
              <IconCamera size={20} stroke={2} className="text-white" />
            </div>
            {uploading && (
              <div className="absolute inset-0 flex items-center justify-center rounded-[20px]" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
                <span className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
              </div>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) void uploadAvatar(file);
                e.target.value = '';
              }}
            />
          </button>

          {/* Name + email */}
          <div className="min-w-0 flex-1">
            <div className="mb-2 flex items-center gap-2">
              <span
                className="rounded-full px-2.5 py-0.5 font-poppins text-[10px] font-bold uppercase tracking-wide"
                style={{ backgroundColor: colors.lavenderDeep, color: colors.text }}
              >
                {PLAN_LABEL[plan]}
              </span>
              {saved && (
                <span className="font-poppins text-[11px] font-medium" style={{ color: colors.primary }}>
                  Saved
                </span>
              )}
            </div>

            {editingName ? (
              <div className="flex items-center gap-2">
                <input
                  ref={nameInputRef}
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') void saveProfile();
                    if (e.key === 'Escape') { setDisplayName(name); setEditingName(false); }
                  }}
                  placeholder="Your name"
                  className="min-w-0 flex-1 rounded-xl border px-3 py-1.5 font-poppins text-[16px] font-bold outline-none focus:ring-2"
                  style={{
                    backgroundColor: colors.pageBackground,
                    borderColor: colors.border,
                    color: colors.text,
                  }}
                />
                <button
                  type="button"
                  onClick={() => void saveProfile()}
                  disabled={saving || !displayName.trim()}
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl transition disabled:opacity-50"
                  style={{ backgroundColor: colors.primary }}
                  aria-label="Save name"
                >
                  <IconCheck size={15} stroke={2.5} style={{ color: colors.onAccent }} />
                </button>
                <button
                  type="button"
                  onClick={() => { setDisplayName(name); setEditingName(false); }}
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl"
                  style={{ backgroundColor: colors.lavenderDeep }}
                  aria-label="Cancel"
                >
                  <IconX size={15} stroke={2.5} />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <p className="truncate font-poppins text-[18px] font-bold" style={{ color: colors.text }}>
                  {displayName || 'Add your name'}
                </p>
                <button
                  type="button"
                  onClick={() => setEditingName(true)}
                  className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg transition hover:opacity-70"
                  style={{ backgroundColor: colors.lavenderDeep }}
                  aria-label="Edit name"
                >
                  <IconPencil size={13} stroke={2.2} />
                </button>
              </div>
            )}
            <p className="mt-1.5 truncate font-poppins text-[13px]" style={{ color: colors.inkSoft }}>{email}</p>
          </div>
        </div>

        {error && (
          <p className="mt-3 font-poppins text-[12px]" style={{ color: colors.danger }}>{error}</p>
        )}
      </div>

      {/* Stats strip */}
      <div
        className="grid grid-cols-3 border-t"
        style={{ borderColor: colors.border }}
      >
        {[
          { label: 'Bookmarks', value: bookmarks.length },
          { label: 'Notes', value: notes.length },
          { label: 'Tags', value: new Set(bookmarks.flatMap((b) => b.tags)).size },
        ].map((stat, i) => (
          <div
            key={stat.label}
            className={cn('flex flex-col items-center py-3.5', i < 2 && 'border-r')}
            style={{ borderColor: colors.border }}
          >
            <span className="font-poppins text-[20px] font-bold leading-none" style={{ color: colors.text }}>
              {stat.value}
            </span>
            <span className="mt-1 font-poppins text-[11px] font-medium" style={{ color: colors.inkSoft }}>
              {stat.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function SettingsView() {
  const { colors } = useAppColors();
  const { signOut } = useAuth();

  const [weeklyBookmarkGoal, setWeeklyBookmarkGoal] = useState(5);
  const [weeklyNoteGoal, setWeeklyNoteGoal] = useState(3);

  useEffect(() => {
    setWeeklyBookmarkGoal(readGoal(BOOKMARK_GOAL_KEY, 5));
    setWeeklyNoteGoal(readGoal(NOTE_GOAL_KEY, 3));
  }, []);

  const persistBookmarkGoal = useCallback((value: number) => {
    const next = Math.min(MAX_WEEKLY_BOOKMARK_GOAL, Math.max(MIN_WEEKLY_GOAL, value));
    setWeeklyBookmarkGoal(next);
    localStorage.setItem(BOOKMARK_GOAL_KEY, String(next));
  }, []);

  const persistNoteGoal = useCallback((value: number) => {
    const next = Math.min(MAX_WEEKLY_NOTE_GOAL, Math.max(MIN_WEEKLY_GOAL, value));
    setWeeklyNoteGoal(next);
    localStorage.setItem(NOTE_GOAL_KEY, String(next));
  }, []);

  return (
    <div className={cn('py-6 md:py-8', appContentClass)}>
      <ProfileHero />

      <div className="space-y-3">
        {/* Account */}
        <p className="mb-1 px-1 font-poppins text-[11px] font-semibold uppercase tracking-widest" style={{ color: colors.subtitle }}>
          Account
        </p>
        <SettingsCard>
          <SettingsRow
            icon={<IconSparkles size={18} stroke={2} style={{ color: colors.primary }} />}
            iconBg={colors.lavender}
            label="Upgrade to Pro"
            hint="Unlimited saves, smart search & more"
            href="/app/pricing"
          />
          <Divider />
          <SettingsRow
            icon={<IconPuzzle size={18} stroke={2} style={{ color: colors.text }} />}
            iconBg={colors.mint}
            label="Browser extension"
            hint="Save links from Chrome or Safari"
            href="https://chrome.google.com/webstore"
          />
          <Divider />
          <SettingsRow
            icon={<IconBrain size={18} stroke={2} style={{ color: colors.text }} />}
            iconBg={colors.peach}
            label="Brain map"
            hint="Explore topics across your saves"
            href="/app/brain-map"
          />
        </SettingsCard>

        {/* Weekly goals */}
        <p className="mb-1 mt-2 px-1 font-poppins text-[11px] font-semibold uppercase tracking-widest" style={{ color: colors.subtitle }}>
          Weekly Goals
        </p>
        <SettingsCard>
          <GoalStepper
            icon={<IconBookmark size={18} stroke={2} style={{ color: colors.text }} />}
            iconBg={colors.lavender}
            label="Bookmarks per week"
            hint="Your weekly save target"
            value={weeklyBookmarkGoal}
            min={MIN_WEEKLY_GOAL}
            max={MAX_WEEKLY_BOOKMARK_GOAL}
            onChange={persistBookmarkGoal}
          />
          <Divider />
          <GoalStepper
            icon={<IconNote size={18} stroke={2} style={{ color: colors.text }} />}
            iconBg={colors.blushDeep}
            label="Notes per week"
            hint="Your weekly note target"
            value={weeklyNoteGoal}
            min={MIN_WEEKLY_GOAL}
            max={MAX_WEEKLY_NOTE_GOAL}
            onChange={persistNoteGoal}
          />
        </SettingsCard>

        {/* Danger */}
        <div className="mt-2">
          <SettingsCard>
            <SettingsRow
              icon={<IconLogout size={18} stroke={2} style={{ color: colors.danger }} />}
              label="Log out"
              hint="You can sign back in any time"
              onClick={() => void signOut()}
              danger
            />
          </SettingsCard>
        </div>
      </div>

      <p className="mt-8 text-center font-poppins text-[12px]" style={{ color: colors.subtitle }}>
        Notemarq v{APP_VERSION}
      </p>
    </div>
  );
}
