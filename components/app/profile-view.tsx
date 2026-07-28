'use client';

import Image from 'next/image';
import Link from 'next/link';
import {
  IconBulb,
  IconChevronRight,
  IconLogout,
  IconSettings,
  IconSparkles,
} from '@tabler/icons-react';

import { useAuth } from '@/contexts/auth-provider';
import { useAppColors } from '@/hooks/use-app-colors';
import { useUserPlan } from '@/hooks/use-user-plan';
import { appContentClass } from '@/lib/app-layout';
import { isPaidPlan, planDisplayName } from '@/lib/plan';
import { cn } from '@/lib/utils';

function ActionRow({
  href,
  icon,
  label,
  subtitle,
}: {
  href: string;
  icon: React.ReactNode;
  label: string;
  subtitle: string;
}) {
  const { colors } = useAppColors();
  return (
    <Link
      href={href}
      className="flex min-h-[56px] items-center gap-3 px-4 py-3 transition hover:opacity-90"
    >
      <div
        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[11px]"
        style={{ backgroundColor: colors.lavender }}
      >
        {icon}
      </div>
      <div className="min-w-0 flex-1">
        <p className="font-poppins text-[14px] font-medium" style={{ color: colors.text }}>
          {label}
        </p>
        <p className="mt-0.5 font-poppins text-[12px]" style={{ color: colors.inkSoft }}>
          {subtitle}
        </p>
      </div>
      <IconChevronRight size={17} stroke={2} style={{ color: colors.subtitle }} />
    </Link>
  );
}

export function ProfileView() {
  const { user, signOut } = useAuth();
  const { colors } = useAppColors();
  const { plan, isPaid } = useUserPlan();

  const name =
    (user?.user_metadata?.full_name as string | undefined) ??
    (user?.user_metadata?.name as string | undefined) ??
    'Curator';
  const email = user?.email ?? 'Save smarter with notemarq';
  const photo =
    (user?.user_metadata?.avatar_url as string | undefined) ??
    (user?.user_metadata?.picture as string | undefined);

  return (
    <div className={cn('py-6 md:py-8', appContentClass)}>
      <h1 className="mb-5 font-poppins text-[28px] font-bold tracking-tight" style={{ color: colors.text }}>
        Profile
      </h1>

      <div
        className="mb-5 flex flex-col gap-4 overflow-hidden rounded-[24px] border px-5 py-5 sm:flex-row sm:items-center"
        style={{ backgroundColor: colors.cream, borderColor: colors.border }}
      >
        <div className="shrink-0">
          {photo ? (
            <Image
              src={photo}
              alt=""
              width={72}
              height={72}
              className="h-[72px] w-[72px] rounded-full object-cover"
            />
          ) : (
            <div
              className="flex h-[72px] w-[72px] items-center justify-center rounded-full text-2xl font-bold"
              style={{ backgroundColor: colors.lavender, color: colors.text }}
            >
              {name.charAt(0).toUpperCase()}
            </div>
          )}
        </div>

        <div className="min-w-0 flex-1">
          <p className="font-poppins text-[20px] font-bold" style={{ color: colors.text }}>
            {name}
          </p>
          <p className="mt-0.5 truncate font-poppins text-[13px]" style={{ color: colors.inkSoft }}>
            {email}
          </p>

          <div className="mt-3 flex flex-wrap items-center gap-2">
            {isPaid ? (
              <span
                className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 font-poppins text-[11px] font-bold uppercase tracking-wide"
                style={{ background: 'linear-gradient(90deg, #78D7FF, #22D3EE)', color: colors.text }}
              >
                <IconSparkles size={12} stroke={2.2} />
                {planDisplayName(plan)}
              </span>
            ) : (
              <span
                className="inline-flex rounded-full px-3 py-1 font-poppins text-[11px] font-bold uppercase tracking-wide"
                style={{ backgroundColor: colors.lavenderDeep, color: colors.text }}
              >
                Free plan
              </span>
            )}
            <Link
              href="/app/settings"
              className="inline-flex rounded-full px-3.5 py-1.5 font-poppins text-[12px] font-semibold transition hover:-translate-y-0.5"
              style={{ backgroundColor: colors.lavenderDeep, color: colors.text }}
            >
              Edit profile
            </Link>
          </div>

          <p className="mt-3 max-w-md font-poppins text-[12px] leading-relaxed" style={{ color: colors.inkSoft }}>
            {isPaid
              ? `You're on the ${planDisplayName(plan)} plan.`
              : 'Unlimited bookmarks & notes. Upgrade for more premium uses each month.'}
          </p>
        </div>
      </div>

      <p
        className="mb-2 px-1 font-poppins text-[11px] font-semibold uppercase tracking-widest"
        style={{ color: colors.subtitle }}
      >
        {isPaid ? 'Your plan' : 'Upgrade'}
      </p>
      <div
        className="mb-5 overflow-hidden rounded-[22px] border"
        style={{ backgroundColor: colors.cream, borderColor: colors.border }}
      >
        <ActionRow
          href="/pricing"
          icon={<IconSparkles size={18} stroke={2} style={{ color: colors.primary }} />}
          label={isPaid ? 'Manage plan' : 'View plans'}
          subtitle={
            isPaid
              ? `Change or compare plans · ${planDisplayName(plan)}`
              : 'From $4.99/mo · more each month'
          }
        />
      </div>

      <p
        className="mb-2 px-1 font-poppins text-[11px] font-semibold uppercase tracking-widest"
        style={{ color: colors.subtitle }}
      >
        Quick links
      </p>
      <div
        className="mb-5 overflow-hidden rounded-[22px] border"
        style={{ backgroundColor: colors.cream, borderColor: colors.border }}
      >
        <ActionRow
          href="/app/settings"
          icon={<IconSettings size={18} stroke={2} style={{ color: colors.text }} />}
          label="Settings"
          subtitle="Goals, imports, and account"
        />
        <div className="ml-[52px] h-px" style={{ backgroundColor: colors.border }} />
        <ActionRow
          href="mailto:hello@notemarq.app?subject=Feature%20request"
          icon={<IconBulb size={18} stroke={2} style={{ color: colors.text }} />}
          label="Feature requests"
          subtitle="Tell us what to build next"
        />
      </div>

      {user ? (
        <button
          type="button"
          onClick={() => void signOut()}
          className="flex min-h-[52px] w-full items-center gap-3 rounded-[22px] border px-4 py-3 transition hover:opacity-90"
          style={{ backgroundColor: colors.cream, borderColor: colors.border }}
        >
          <div
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[11px]"
            style={{ backgroundColor: colors.lavender }}
          >
            <IconLogout size={18} stroke={2} style={{ color: colors.danger }} />
          </div>
          <div className="min-w-0 flex-1 text-left">
            <p className="font-poppins text-[14px] font-medium" style={{ color: colors.danger }}>
              Log out
            </p>
            <p className="mt-0.5 font-poppins text-[12px]" style={{ color: colors.inkSoft }}>
              Sign out of your account
            </p>
          </div>
        </button>
      ) : null}

      {!isPaidPlan(plan) ? null : (
        <p className="mt-6 font-poppins text-[12px]" style={{ color: colors.subtitle }}>
          Thanks for supporting Notemarq.
        </p>
      )}
    </div>
  );
}
