import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: "You Save Everything, You Remember Nothing — Notemarq Talk",
  description:
    "Claude Code Accra Meetup #2 talk by Albert Mends — why capture outpaced retention, and what a better second brain looks like.",
  robots: { index: false, follow: false },
};

export default function TalkLayout({ children }: { children: React.ReactNode }) {
  return children;
}
