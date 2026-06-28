import Image from 'next/image';
import Link from 'next/link';
import { IconArrowLeft } from '@tabler/icons-react';

export function LegalPageShell({
  title,
  lastUpdated,
  children,
}: {
  title: string;
  lastUpdated: string;
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#fafafa] text-[#1c1c2e]">
      <header className="mx-auto flex max-w-3xl items-center justify-between px-6 py-6">
        <Link
          href="/"
          className="inline-flex items-center gap-2 rounded-full px-3 py-2 text-sm font-medium text-[#6b7280] transition hover:bg-white hover:text-[#1c1c2e]"
        >
          <IconArrowLeft size={18} stroke={2} />
          Back
        </Link>
        <Link href="/" className="inline-flex items-center gap-2 font-poppins text-sm font-semibold lowercase tracking-tight">
          <span className="flex h-7 w-7 shrink-0 items-center justify-center overflow-hidden rounded-md bg-white">
            <Image src="/logog.png" alt="Notemarq" width={28} height={28} className="h-full w-full object-cover" />
          </span>
          notemarq
        </Link>
      </header>

      <main className="mx-auto max-w-3xl px-6 pb-16 pt-2">
        <p className="mb-3 font-poppins text-xs font-semibold uppercase tracking-[0.18em] text-[#6b7280]">
          Legal
        </p>
        <h1 className="font-poppins text-3xl font-bold leading-tight tracking-tight md:text-4xl">{title}</h1>
        <p className="mt-3 text-sm text-[#6b7280]">Last updated: {lastUpdated}</p>

        <article className="prose-legal mt-10 space-y-8 text-[15px] leading-relaxed text-[#374151]">
          {children}
        </article>

        <footer className="mt-14 flex flex-wrap gap-4 border-t border-[#e5e7eb] pt-8 text-sm text-[#6b7280]">
          <Link href="/policy" className="font-medium transition hover:text-[#1c1c2e]">
            Privacy Policy
          </Link>
          <Link href="/terms" className="font-medium transition hover:text-[#1c1c2e]">
            Terms of Service
          </Link>
          <Link href="/" className="font-medium transition hover:text-[#1c1c2e]">
            Home
          </Link>
        </footer>
      </main>
    </div>
  );
}

export function LegalSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="font-poppins text-xl font-semibold text-[#1c1c2e]">{title}</h2>
      <div className="mt-3 space-y-3">{children}</div>
    </section>
  );
}
