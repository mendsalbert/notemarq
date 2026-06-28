'use client';

import Image from 'next/image';
import Link from 'next/link';

import { useAppColors } from '@/hooks/use-app-colors';

export default function PublicBoardNotFound() {
  const { colors } = useAppColors();

  return (
    <div
      className="flex min-h-screen flex-col items-center justify-center px-6 text-center font-poppins"
      style={{ backgroundColor: colors.pageBackground, color: colors.text }}
    >
      <Image src="/logog.png" alt="Notemarq" width={56} height={56} className="rounded-2xl" />
      <p className="mt-6 text-xs font-semibold uppercase tracking-[0.18em]" style={{ color: colors.subtitle }}>
        Shared folder
      </p>
      <h1 className="mt-2 text-2xl font-bold tracking-tight sm:text-3xl">This link isn&apos;t public</h1>
      <p className="mt-3 max-w-md text-sm leading-relaxed" style={{ color: colors.inkSoft }}>
        It may have been unpublished, moved, or the URL might be wrong.
      </p>
      <Link
        href="/"
        className="mt-8 rounded-full px-5 py-2.5 text-sm font-bold transition hover:-translate-y-0.5"
        style={{ backgroundColor: colors.text, color: colors.invertedText }}
      >
        Back to notemarq
      </Link>
    </div>
  );
}
