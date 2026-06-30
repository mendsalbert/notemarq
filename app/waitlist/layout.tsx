import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Early access — Notemarq',
  description:
    'Join the Notemarq early access waitlist. Leave your email and get an invite when your spot is ready.',
};

export default function WaitlistLayout({ children }: { children: React.ReactNode }) {
  return children;
}
