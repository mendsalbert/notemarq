import Link from 'next/link';
import {
  IconArrowLeft,
  IconBookmark,
  IconBrandChrome,
  IconDeviceMobile,
  IconWorld,
} from '@tabler/icons-react';

import { ScreenshotSlot } from '@/components/extension/screenshot-slot';
import { APP_ENTRY_HREF, APP_ENTRY_LABEL } from '@/lib/marketing';

export const metadata = {
  title: 'Browser Extension — Notemarq',
  description:
    'Save from X, YouTube, TikTok, and any webpage with the Notemarq browser extension.',
};

const CHROME_EXTENSION_URL =
  'https://chromewebstore.google.com/detail/mplejdgebegogkgpjhnfgngcficcmodn';

const HOW_IT_WORKS = [
  {
    step: '01',
    title: 'Install & sign in',
    description:
      'Add the extension from the Chrome Web Store, then sign in with Google in the popup.',
    imageFile: 'step-1-install.jpg',
  },
  {
    step: '02',
    title: 'Save from anywhere',
    description:
      'On X, YouTube, TikTok, or any webpage — open what you want to keep and tap save.',
    imageFile: 'step-2-anywhere.jpg',
  },
  {
    step: '03',
    title: 'Save with context',
    description:
      "Notemarq opens a save sheet. Add why it matters, hit Suggest, or skip and sync instantly.",
    imageFile: 'step-3-save-sheet.jpg',
  },
  {
    step: '04',
    title: 'Find it later',
    description:
      'Your saves sync to the web and mobile library — search, folders, and smart recall included.',
    imageFile: 'step-4-library.jpg',
  },
] as const;

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
          Save from X, YouTube, TikTok &amp; the web
        </h1>
        <p className="mt-4 max-w-xl text-base leading-relaxed text-[#6b7280]">
          The Notemarq extension captures posts, videos, and pages with context — without leaving
          the tab. Everything syncs to the same library as the mobile app and web dashboard.
        </p>

        <section className="mt-12">
          <h2 className="font-poppins text-xl font-semibold tracking-tight">How it works</h2>
          <p className="mt-2 text-sm leading-relaxed text-[#6b7280]">
            Four quick steps from install to your first save.
          </p>

          <ol className="mt-8 space-y-10">
            {HOW_IT_WORKS.map((item) => (
              <li key={item.step}>
                <div className="flex items-baseline gap-3">
                  <span className="font-poppins text-xs font-semibold tracking-[0.14em] text-[#9ca3af]">
                    {item.step}
                  </span>
                  <h3 className="font-poppins text-lg font-semibold">{item.title}</h3>
                </div>
                <p className="mt-2 text-sm leading-relaxed text-[#6b7280]">{item.description}</p>
                <ScreenshotSlot step={item.step} imageFile={item.imageFile} />
              </li>
            ))}
          </ol>
        </section>

        <section className="mt-12 space-y-4">
          <div className="rounded-3xl bg-white p-6 shadow-[0_8px_30px_rgba(0,0,0,0.06)]">
            <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-2xl bg-[#E0F7FA] text-[#0891B2]">
              <IconBookmark size={20} stroke={2} />
            </div>
            <h2 className="font-poppins text-lg font-semibold">How to save</h2>
            <ol className="mt-3 space-y-2 text-sm leading-relaxed text-[#6b7280]">
              <li>1. Sign in with Google in the extension popup.</li>
              <li>2. Open a post, video, or page on X, YouTube, TikTok, or the web.</li>
              <li>3. Tap save — Notemarq opens a save sheet.</li>
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
              organize folders, use smart recall, and explore everything you&apos;ve collected.
            </p>
            <div className="mt-5 flex flex-col gap-3 sm:flex-row">
              <Link
                href={APP_ENTRY_HREF}
                className="inline-flex items-center justify-center rounded-full bg-[#1c1c2e] px-5 py-3 text-sm font-semibold text-white transition hover:opacity-90"
              >
                {APP_ENTRY_LABEL}
              </Link>
              <span
                className="inline-flex cursor-default items-center justify-center gap-2 rounded-full border border-[#e5e7eb] bg-white px-5 py-3 text-sm font-semibold text-[#1c1c2e] opacity-80"
                aria-label="Mobile app — coming soon"
              >
                <IconDeviceMobile size={18} stroke={2} />
                Mobile app — coming soon
              </span>
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
