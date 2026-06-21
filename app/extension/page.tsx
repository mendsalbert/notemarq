import Link from 'next/link';
import {
  IconArrowLeft,
  IconBookmark,
  IconBrandChrome,
  IconDeviceMobile,
  IconWorld,
} from '@tabler/icons-react';

export const metadata = {
  title: 'Browser Extension — Notemarq',
  description: 'Save posts from X, YouTube, TikTok, and the web with the Notemarq browser extension.',
};

const CHROME_EXTENSION_URL = 'https://chrome.google.com/webstore';
const APP_STORE_URL = 'https://apps.apple.com/app/notemarq';

export default function ExtensionPage() {
  return (
    <div className="min-h-screen bg-[#fafafa] text-[#1c1c2e]">
      <header className="mx-auto flex max-w-2xl items-center justify-between px-6 py-6">
        <Link
          href="/"
          className="inline-flex items-center gap-2 rounded-full px-3 py-2 text-sm font-medium text-[#6b7280] transition hover:bg-white hover:text-[#1c1c2e]"
        >
          <IconArrowLeft size={18} stroke={2} />
          Back
        </Link>
        <span className="font-poppins text-sm font-semibold lowercase tracking-tight">notemarq</span>
      </header>

      <main className="mx-auto max-w-2xl px-6 pb-16 pt-2">
        <p className="mb-3 font-poppins text-xs font-semibold uppercase tracking-[0.18em] text-[#6b7280]">
          Browser extension
        </p>
        <h1 className="font-poppins text-3xl font-bold leading-tight tracking-tight md:text-4xl">
          Save from X without leaving your feed
        </h1>
        <p className="mt-4 max-w-xl text-base leading-relaxed text-[#6b7280]">
          The Notemarq extension turns the bookmark button on X into a save with context. Your saves sync
          to the same library as the mobile app and web dashboard.
        </p>

        <section className="mt-10 space-y-4">
          <div className="rounded-3xl bg-white p-6 shadow-[0_8px_30px_rgba(0,0,0,0.06)]">
            <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-2xl bg-[#E0F7FA] text-[#0891B2]">
              <IconBookmark size={20} stroke={2} />
            </div>
            <h2 className="font-poppins text-lg font-semibold">How to save on X</h2>
            <ol className="mt-3 space-y-2 text-sm leading-relaxed text-[#6b7280]">
              <li>1. Sign in with Google in the extension popup.</li>
              <li>2. Open any post on X.</li>
              <li>3. Tap the bookmark icon — Notemarq opens a save sheet.</li>
              <li>4. Add why you&apos;re saving, or skip and sync instantly.</li>
            </ol>
          </div>

          <div className="rounded-3xl bg-white p-6 shadow-[0_8px_30px_rgba(0,0,0,0.06)]">
            <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-2xl bg-[#F3E8FF] text-[#7C3AED]">
              <IconWorld size={20} stroke={2} />
            </div>
            <h2 className="font-poppins text-lg font-semibold">View your full library</h2>
            <p className="mt-2 text-sm leading-relaxed text-[#6b7280]">
              The extension is built for quick capture. Open Notemarq on web or mobile to search saves,
              organize folders, use AI recall, and explore everything you&apos;ve collected.
            </p>
            <div className="mt-5 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/app"
                className="inline-flex items-center justify-center rounded-full bg-[#1c1c2e] px-5 py-3 text-sm font-semibold text-white transition hover:opacity-90"
              >
                Open web app
              </Link>
              <a
                href={APP_STORE_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 rounded-full border border-[#e5e7eb] bg-white px-5 py-3 text-sm font-semibold text-[#1c1c2e] transition hover:bg-[#fafafa]"
              >
                <IconDeviceMobile size={18} stroke={2} />
                Get mobile app
              </a>
            </div>
          </div>

          <div className="rounded-3xl bg-white p-6 shadow-[0_8px_30px_rgba(0,0,0,0.06)]">
            <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-2xl bg-[#FFF4E5] text-[#EA580C]">
              <IconBrandChrome size={20} stroke={2} />
            </div>
            <h2 className="font-poppins text-lg font-semibold">Install or update</h2>
            <p className="mt-2 text-sm leading-relaxed text-[#6b7280]">
              After code changes, reload the extension at{' '}
              <code className="rounded bg-[#f3f4f6] px-1.5 py-0.5 text-xs">chrome://extensions</code>.
              If you haven&apos;t installed it yet, grab it from the Chrome Web Store.
            </p>
            <a
              href={CHROME_EXTENSION_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-5 inline-flex items-center justify-center rounded-full border border-[#e5e7eb] bg-white px-5 py-3 text-sm font-semibold text-[#1c1c2e] transition hover:bg-[#fafafa]"
            >
              Chrome Web Store
            </a>
          </div>
        </section>
      </main>
    </div>
  );
}
