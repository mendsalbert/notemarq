import { AuthGate } from '@/components/app/auth-gate';

export default function AppMainLayout({ children }: { children: React.ReactNode }) {
  return <AuthGate>{children}</AuthGate>;
}
