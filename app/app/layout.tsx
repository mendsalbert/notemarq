import type { Metadata } from 'next';
import { Nunito } from 'next/font/google';

import { AppProviders } from '@/components/app/app-providers';

const nunito = Nunito({
  variable: '--font-nunito',
  subsets: ['latin'],
  weight: ['600', '700'],
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Notemarq',
  description: 'Your bookmarks, notes, and context — on the web.',
};

export default function AppRootLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className={nunito.variable}>
      <AppProviders>{children}</AppProviders>
    </div>
  );
}
