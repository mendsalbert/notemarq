import { Suspense } from 'react';

import { MainBookmarksView } from '@/components/app/main-bookmarks-view';

export default function AppHomePage() {
  return (
    <Suspense fallback={null}>
      <MainBookmarksView />
    </Suspense>
  );
}
