import { Suspense } from 'react';

import { LoginView } from '@/components/app/login-view';

export default function AppLoginPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-black">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#4FC3F7] border-t-transparent" />
        </div>
      }
    >
      <LoginView />
    </Suspense>
  );
}
