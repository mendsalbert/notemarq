import type { Metadata } from 'next';

import { AppProviders } from '@/components/app/app-providers';

export const metadata: Metadata = {
  title: 'Notemarq',
  description: 'Your bookmarks, notes, and context — on the web.',
};

export default function AppRootLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="font-poppins">
      <AppProviders>{children}</AppProviders>
    </div>
  );
}
