'use client';

import Image from 'next/image';
import Link from 'next/link';
import { IconLogout, IconSettings } from '@tabler/icons-react';

import { useAuth } from '@/contexts/auth-provider';
import { useAppColors } from '@/hooks/use-app-colors';
import { useAppStore } from '@/store/app-store';

export function ProfileView() {
  const { user, signOut } = useAuth();
  const { colors } = useAppColors();
  const bookmarks = useAppStore((s) => s.bookmarks);
  const notes = useAppStore((s) => s.notes);

  const name =
    (user?.user_metadata?.full_name as string | undefined) ??
    (user?.user_metadata?.name as string | undefined) ??
    'Notemarq user';
  const email = user?.email ?? '';
  const photo =
    (user?.user_metadata?.avatar_url as string | undefined) ??
    (user?.user_metadata?.picture as string | undefined);

  return (
    <div className="mx-auto max-w-2xl px-3 py-5 md:px-4 md:py-6">
      {/* Header Module */}
      <div
        className="mb-6 rounded-[28px] p-6 md:p-7"
        style={{
          backgroundColor: colors.lavender,
          boxShadow: `0 2px 12px ${colors.cardShadow}`,
        }}
      >
        <div className="flex items-center gap-4">
          {photo ? (
            <Image src={photo} alt="" width={72} height={72} className="rounded-2xl" />
          ) : (
            <div
              className="flex h-[72px] w-[72px] items-center justify-center rounded-2xl text-2xl font-bold"
              style={{ backgroundColor: colors.cream, color: colors.primary }}
            >
              {name.charAt(0).toUpperCase()}
            </div>
          )}
          <div className="flex-1">
            <h1 className="text-xl font-bold" style={{ fontFamily: 'var(--font-poppins)', color: colors.text }}>
              {name}
            </h1>
            <p className="mt-1 text-sm font-medium" style={{ color: colors.inkSoft }}>
              {email}
            </p>
          </div>
        </div>

        {/* Stats */}
        <div className="mt-6 grid grid-cols-3 gap-3">
          {[
            { label: 'Bookmarks', value: bookmarks.length },
            { label: 'Notes', value: notes.length },
            { label: 'Starred', value: bookmarks.filter((b) => b.isFavorite).length },
          ].map((stat) => (
            <div
              key={stat.label}
              className="rounded-[20px] p-4 text-center"
              style={{
                backgroundColor: colors.cream,
                boxShadow: `0 2px 8px ${colors.cardShadow}`,
              }}
            >
              <p className="text-2xl font-bold" style={{ fontFamily: 'var(--font-poppins)', color: colors.text }}>
                {stat.value}
              </p>
              <p className="mt-1 text-xs font-semibold" style={{ color: colors.inkSoft }}>
                {stat.label}
              </p>
            </div>
          ))}
        </div>

        {/* Actions */}
        <div className="mt-6 flex flex-wrap gap-3">
          <Link
            href="/app/settings"
            className="inline-flex items-center gap-2.5 rounded-[18px] px-5 py-3 text-sm font-bold transition-all hover:-translate-y-0.5"
            style={{
              backgroundColor: colors.primary,
              color: colors.onAccent,
              boxShadow: `0 2px 10px ${colors.cardShadow}`,
            }}
          >
            <IconSettings size={18} stroke={2.2} />
            Settings
          </Link>
          <button
            type="button"
            onClick={() => void signOut()}
            className="inline-flex items-center gap-2.5 rounded-[18px] px-5 py-3 text-sm font-bold transition-all hover:-translate-y-0.5"
            style={{
              backgroundColor: colors.cream,
              color: colors.text,
              boxShadow: `0 2px 8px ${colors.cardShadow}`,
            }}
          >
            <IconLogout size={18} stroke={2.2} />
            Sign out
          </button>
        </div>
      </div>
    </div>
  );
}
