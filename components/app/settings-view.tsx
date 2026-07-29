'use client';

import {
  IconBrandX,
  IconBrandYoutube,
  IconBookmark,
  IconBulb,
  IconCamera,
  IconCheck,
  IconChevronRight,
  IconLogout,
  IconMinus,
  IconNote,
  IconPencil,
  IconPlus,
  IconPuzzle,
  IconRefresh,
  IconSparkles,
  IconX,
} from '@tabler/icons-react';
import Image from 'next/image';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Suspense, useCallback, useEffect, useRef, useState } from 'react';

import { useAuth } from '@/contexts/auth-provider';
import { useAppColors } from '@/hooks/use-app-colors';
import { useUserPlan } from '@/hooks/use-user-plan';
import { ManageBillingButton } from '@/components/manage-billing-button';
import { appContentClass } from '@/lib/app-layout';
import { planDisplayName } from '@/lib/plan';
import { isSupabaseConfigured, supabase } from '@/lib/supabase/client';
import { useAppStore } from '@/store/app-store';
import {
  disconnectX,
  fetchXConnectionStatus,
  formatXLastSynced,
  isXConnectionConfigured,
  startXConnect,
  syncXBookmarks,
  type XConnectionStatus,
} from '@/lib/x-connection';
import {
  disconnectYoutube,
  fetchYoutubeConnectionStatus,
  formatYoutubeLastSynced,
  isYoutubeConnectionConfigured,
  startYoutubeConnect,
  syncYoutubeSaves,
  type YoutubeConnectionStatus,
} from '@/lib/youtube-connection';
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
  id,
}: {
  icon: React.ReactNode;
  iconBg?: string;
  label: string;
  hint?: string;
  href?: string;
  onClick?: () => void;
  trailing?: React.ReactNode;
  danger?: boolean;
  id?: string;
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
      {trailing !== undefined ? (
        trailing
      ) : href || onClick ? (
        <IconChevronRight size={17} stroke={2} style={{ color: colors.subtitle }} />
      ) : null}
    </>
  );

  const cls = 'flex min-h-[54px] items-center gap-3 px-4 py-3';

  if (href) {
    return (
      <Link id={id} href={href} className={cls}>
        {content}
      </Link>
    );
  }
  if (onClick) {
    return (
      <button id={id} type="button" onClick={onClick} className={cn(cls, 'w-full text-left')}>
        {content}
      </button>
    );
  }
  return (
    <div id={id} className={cls}>
      {content}
    </div>
  );
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
        <p className="font-poppins text-[14px] font-medium leading-tight" style={{ color: colors.text }}>
          {label}
        </p>
        {hint ? (
          <p className="mt-0.5 font-poppins text-[12px]" style={{ color: colors.inkSoft }}>
            {hint}
          </p>
        ) : null}
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
        <span className="w-6 text-center font-poppins text-[15px] font-bold" style={{ color: colors.text }}>
          {value}
        </span>
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

function ProfileHero() {
  const { user } = useAuth();
  const { colors } = useAppColors();
  const { plan } = useUserPlan();
  const bookmarks = useAppStore((s) => s.bookmarks);
  const notes = useAppStore((s) => s.notes);

  const name =
    (user?.user_metadata?.full_name as string) ?? (user?.user_metadata?.name as string) ?? '';
  const email = user?.email ?? '';
  const authPhoto =
    (user?.user_metadata?.avatar_url as string) ?? (user?.user_metadata?.picture as string);

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
    if (!trimmed) {
      setError('Name cannot be empty');
      return;
    }
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
            {uploading ? (
              <div
                className="absolute inset-0 flex items-center justify-center rounded-[20px]"
                style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
              >
                <span className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
              </div>
            ) : null}
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

          <div className="min-w-0 flex-1">
            <div className="mb-2 flex items-center gap-2">
              <span
                className="rounded-full px-2.5 py-0.5 font-poppins text-[10px] font-bold uppercase tracking-wide"
                style={{ backgroundColor: colors.lavenderDeep, color: colors.text }}
              >
                {planDisplayName(plan)}
              </span>
              {saved ? (
                <span className="font-poppins text-[11px] font-medium" style={{ color: colors.primary }}>
                  Saved
                </span>
              ) : null}
            </div>

            {editingName ? (
              <div className="flex items-center gap-2">
                <input
                  ref={nameInputRef}
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') void saveProfile();
                    if (e.key === 'Escape') {
                      setDisplayName(name);
                      setEditingName(false);
                    }
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
                  onClick={() => {
                    setDisplayName(name);
                    setEditingName(false);
                  }}
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
            <p className="mt-1.5 truncate font-poppins text-[13px]" style={{ color: colors.inkSoft }}>
              {email}
            </p>
          </div>
        </div>

        {error ? (
          <p className="mt-3 font-poppins text-[12px]" style={{ color: colors.danger }}>
            {error}
          </p>
        ) : null}
      </div>

      <div className="grid grid-cols-3 border-t" style={{ borderColor: colors.border }}>
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

function ImportsSection() {
  const { user } = useAuth();
  const { colors } = useAppColors();
  const hydrate = useAppStore((s) => s.hydrate);
  const searchParams = useSearchParams();

  const [xStatus, setXStatus] = useState<XConnectionStatus>({ connected: false });
  const [youtubeStatus, setYoutubeStatus] = useState<YoutubeConnectionStatus>({ connected: false });
  const [xConnecting, setXConnecting] = useState(false);
  const [youtubeConnecting, setYoutubeConnecting] = useState(false);
  const [xSyncing, setXSyncing] = useState(false);
  const [youtubeSyncing, setYoutubeSyncing] = useState(false);
  const [message, setMessage] = useState('');

  const refreshStatus = useCallback(async () => {
    if (!user?.id) return;
    try {
      if (isXConnectionConfigured()) {
        setXStatus(await fetchXConnectionStatus());
      }
    } catch {
      setXStatus({ connected: false });
    }
    try {
      if (isYoutubeConnectionConfigured()) {
        setYoutubeStatus(await fetchYoutubeConnectionStatus());
      }
    } catch {
      setYoutubeStatus({ connected: false });
    }
  }, [user?.id]);

  useEffect(() => {
    void refreshStatus();
  }, [refreshStatus]);

  useEffect(() => {
    const hash = typeof window !== 'undefined' ? window.location.hash : '';
    if (hash === '#import-x' || hash === '#import-youtube') {
      document.getElementById(hash.slice(1))?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, []);

  useEffect(() => {
    const connected = searchParams.get('connected');
    const importSource = searchParams.get('import');
    const error = searchParams.get('error');
    if (error) {
      setMessage(decodeURIComponent(error));
      return;
    }
    if (connected === '1' && importSource) {
      setMessage(
        importSource === 'youtube'
          ? 'YouTube connected. Tap sync to import saves.'
          : 'X connected. Tap sync to import bookmarks.',
      );
      void refreshStatus();
    }
  }, [searchParams, refreshStatus]);

  async function handleConnectX() {
    if (!user?.id) {
      setMessage('Sign in to connect your X account.');
      return;
    }
    if (!isXConnectionConfigured()) {
      setMessage('X import is not configured yet.');
      return;
    }
    setXConnecting(true);
    setMessage('');
    try {
      await startXConnect();
    } catch (err) {
      setMessage(err instanceof Error ? err.message : 'Could not connect X');
      setXConnecting(false);
    }
  }

  async function handleConnectYoutube() {
    if (!user?.id) {
      setMessage('Sign in to connect your YouTube account.');
      return;
    }
    if (!isYoutubeConnectionConfigured()) {
      setMessage('YouTube import is not configured yet.');
      return;
    }
    setYoutubeConnecting(true);
    setMessage('');
    try {
      await startYoutubeConnect();
    } catch (err) {
      setMessage(err instanceof Error ? err.message : 'Could not connect YouTube');
      setYoutubeConnecting(false);
    }
  }

  async function handleSyncX() {
    if (!user?.id) return;
    setXSyncing(true);
    setMessage('');
    try {
      const result = await syncXBookmarks();
      await hydrate(user.id);
      setXStatus(await fetchXConnectionStatus());
      if (result.imported > 0) {
        const suffix = result.has_more ? ' Tap sync again if you have more on X.' : '';
        setMessage(`Added ${result.imported} bookmark${result.imported === 1 ? '' : 's'} from X.${suffix}`);
      } else {
        setMessage('No new X bookmarks to import.');
      }
    } catch (err) {
      setMessage(err instanceof Error ? err.message : 'X sync failed');
    } finally {
      setXSyncing(false);
    }
  }

  async function handleSyncYoutube() {
    if (!user?.id) return;
    setYoutubeSyncing(true);
    setMessage('');
    try {
      const result = await syncYoutubeSaves();
      await hydrate(user.id);
      setYoutubeStatus(await fetchYoutubeConnectionStatus());
      if (result.imported > 0) {
        const suffix = result.has_more ? ' Tap sync again if you have more on YouTube.' : '';
        setMessage(
          `Added ${result.imported} YouTube video${result.imported === 1 ? '' : 's'}.${suffix}`,
        );
      } else {
        setMessage('No new YouTube saves to import.');
      }
    } catch (err) {
      setMessage(err instanceof Error ? err.message : 'YouTube sync failed');
    } finally {
      setYoutubeSyncing(false);
    }
  }

  return (
    <>
      <p
        className="mb-1 mt-2 px-1 font-poppins text-[11px] font-semibold uppercase tracking-widest"
        style={{ color: colors.subtitle }}
      >
        Import
      </p>
      {message ? (
        <p className="mb-2 px-1 font-poppins text-[12px]" style={{ color: colors.inkSoft }}>
          {message}
        </p>
      ) : null}
      <SettingsCard>
        <SettingsRow
          id="import-x"
          icon={<IconBrandX size={18} stroke={2} style={{ color: colors.text }} />}
          iconBg={colors.lavender}
          label={xStatus.connected ? 'X account' : 'Import from X'}
          hint={
            xStatus.connected
              ? xStatus.x_username
                ? `@${xStatus.x_username} · ${formatXLastSynced(xStatus.last_synced_at)}`
                : formatXLastSynced(xStatus.last_synced_at)
              : 'Import your X bookmarks into Notemarq'
          }
          onClick={xStatus.connected ? undefined : () => void handleConnectX()}
          trailing={
            xConnecting ? (
              <span className="font-poppins text-[12px]" style={{ color: colors.inkSoft }}>
                Connecting…
              </span>
            ) : undefined
          }
        />
        {xStatus.connected ? (
          <>
            <Divider />
            <SettingsRow
              icon={<IconRefresh size={18} stroke={2} style={{ color: colors.text }} />}
              iconBg={colors.mint}
              label="Sync X bookmarks"
              hint={xSyncing ? 'Importing…' : 'Pull new bookmarks from X'}
              onClick={() => void handleSyncX()}
            />
            <Divider />
            <SettingsRow
              icon={<IconLogout size={18} stroke={2} style={{ color: colors.danger }} />}
              label="Disconnect X"
              hint="Stop syncing bookmarks from X"
              danger
              onClick={() => {
                void (async () => {
                  try {
                    await disconnectX();
                    setXStatus({ connected: false });
                    setMessage('X account disconnected.');
                  } catch (err) {
                    setMessage(err instanceof Error ? err.message : 'Could not disconnect X');
                  }
                })();
              }}
            />
          </>
        ) : null}

        <Divider />

        <SettingsRow
          id="import-youtube"
          icon={<IconBrandYoutube size={18} stroke={2} style={{ color: colors.text }} />}
          iconBg={colors.peach}
          label={youtubeStatus.connected ? 'YouTube account' : 'Import from YouTube'}
          hint={
            youtubeStatus.connected
              ? youtubeStatus.youtube_channel_title
                ? `${youtubeStatus.youtube_channel_title} · ${formatYoutubeLastSynced(youtubeStatus.last_synced_at)}`
                : formatYoutubeLastSynced(youtubeStatus.last_synced_at)
              : 'Import Watch Later and liked videos'
          }
          onClick={youtubeStatus.connected ? undefined : () => void handleConnectYoutube()}
          trailing={
            youtubeConnecting ? (
              <span className="font-poppins text-[12px]" style={{ color: colors.inkSoft }}>
                Connecting…
              </span>
            ) : undefined
          }
        />
        {youtubeStatus.connected ? (
          <>
            <Divider />
            <SettingsRow
              icon={<IconRefresh size={18} stroke={2} style={{ color: colors.text }} />}
              iconBg={colors.mint}
              label="Sync YouTube saves"
              hint={youtubeSyncing ? 'Importing…' : 'Pull Watch Later and liked videos'}
              onClick={() => void handleSyncYoutube()}
            />
            <Divider />
            <SettingsRow
              icon={<IconLogout size={18} stroke={2} style={{ color: colors.danger }} />}
              label="Disconnect YouTube"
              hint="Stop syncing videos from YouTube"
              danger
              onClick={() => {
                void (async () => {
                  try {
                    await disconnectYoutube();
                    setYoutubeStatus({ connected: false });
                    setMessage('YouTube account disconnected.');
                  } catch (err) {
                    setMessage(err instanceof Error ? err.message : 'Could not disconnect YouTube');
                  }
                })();
              }}
            />
          </>
        ) : null}
      </SettingsCard>
    </>
  );
}

function SettingsBody() {
  const { colors } = useAppColors();
  const { signOut } = useAuth();
  const { plan, isPaid, hasWebSubscription } = useUserPlan();

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
        <p
          className="mb-1 px-1 font-poppins text-[11px] font-semibold uppercase tracking-widest"
          style={{ color: colors.subtitle }}
        >
          {isPaid ? 'Your plan' : 'Account'}
        </p>
        <SettingsCard>
          <SettingsRow
            icon={<IconSparkles size={18} stroke={2} style={{ color: colors.primary }} />}
            iconBg={colors.lavender}
            label={isPaid ? 'Manage plan' : 'Upgrade to Pro'}
            hint={
              isPaid
                ? `You're on ${planDisplayName(plan)} · change or compare plans`
                : 'Unlimited saves, smart search & more'
            }
            href="/pricing"
          />
          {isPaid && hasWebSubscription ? (
            <>
              <Divider />
              <div className="px-4 py-3">
                <ManageBillingButton
                  label="Cancel subscription"
                  className="w-full rounded-full px-4 py-2.5 font-poppins text-[13px] font-semibold transition hover:opacity-90"
                  style={{
                    backgroundColor: colors.blushDeep,
                    color: colors.danger,
                    border: `1px solid ${colors.border}`,
                    cursor: 'pointer',
                  }}
                />
              </div>
            </>
          ) : null}
          <Divider />
          <SettingsRow
            icon={<IconPuzzle size={18} stroke={2} style={{ color: colors.text }} />}
            iconBg={colors.mint}
            label="Browser extension"
            hint="Save links from Chrome or Safari"
            href="/extension"
          />
          <Divider />
          <SettingsRow
            icon={<IconBulb size={18} stroke={2} style={{ color: colors.text }} />}
            iconBg={colors.peach}
            label="Feature requests"
            hint="Suggest ideas and vote on what to build next"
            href="/app/feature-requests"
          />
        </SettingsCard>

        <ImportsSection />

        <p
          className="mb-1 mt-2 px-1 font-poppins text-[11px] font-semibold uppercase tracking-widest"
          style={{ color: colors.subtitle }}
        >
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

export function SettingsView() {
  return (
    <Suspense fallback={null}>
      <SettingsBody />
    </Suspense>
  );
}
