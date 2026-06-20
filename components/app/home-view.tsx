'use client';

import { useMemo } from 'react';

import { ActiveProjectModule } from '@/components/app/active-project-module';
import { BrowseEverythingModule } from '@/components/app/browse-everything-module';
import { DailyRecallModule } from '@/components/app/daily-recall-module';
import { ForYouModule } from '@/components/app/for-you-module';
import { GraveyardModule } from '@/components/app/graveyard-module';
import { SocialStatsModule } from '@/components/app/social-stats-module';
import { useAuth } from '@/contexts/auth-provider';
import { useAppColors } from '@/hooks/use-app-colors';
import {
  getActiveProject,
  getDailyRecall,
  getGraveyardBookmark,
  getSocialStats,
  sortByRecent,
} from '@/lib/home-dashboard';
import { useAppStore } from '@/store/app-store';

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
}

export function HomeView() {
  const { user } = useAuth();
  const { colors } = useAppColors();
  const bookmarks = useAppStore((s) => s.bookmarks);
  const isLoading = useAppStore((s) => s.isLoading);
  const syncError = useAppStore((s) => s.syncError);
  const hydrate = useAppStore((s) => s.hydrate);
  const userId = useAppStore((s) => s.userId);

  const firstName = useMemo(() => {
    const name =
      (user?.user_metadata?.full_name as string | undefined) ??
      (user?.user_metadata?.name as string | undefined) ??
      '';
    return name.trim().split(/\s+/)[0] || null;
  }, [user]);

  const sorted = useMemo(() => sortByRecent(bookmarks), [bookmarks]);
  const socialStats = useMemo(() => getSocialStats(bookmarks), [bookmarks]);
  const dailyRecall = useMemo(() => getDailyRecall(bookmarks), [bookmarks]);
  const activeProject = useMemo(() => getActiveProject(bookmarks), [bookmarks]);
  const featured = sorted[0];
  const graveyard = useMemo(
    () => getGraveyardBookmark(bookmarks, featured?.id),
    [bookmarks, featured?.id],
  );

  return (
    <div className="mx-auto max-w-3xl space-y-8 px-2 py-4 md:px-4 md:py-6">
      <header>
        <h1 className="text-2xl font-semibold">Today</h1>
        {firstName ? (
          <p className="mt-1 text-sm opacity-60">
            {getGreeting()}, {firstName}
          </p>
        ) : null}
      </header>

      {syncError ? (
        <div
          className="rounded-2xl border px-4 py-3 text-sm"
          style={{ borderColor: colors.border, backgroundColor: colors.cardBackground }}
        >
          <p className="opacity-80">{syncError}</p>
          {userId ? (
            <button
              type="button"
              className="mt-2 font-medium underline underline-offset-2"
              onClick={() => void hydrate(userId)}
            >
              Retry sync
            </button>
          ) : null}
        </div>
      ) : null}

      {isLoading ? (
        <p className="text-sm opacity-60">Loading your library…</p>
      ) : (
        <>
          <SocialStatsModule stats={socialStats} />

          {sorted.length > 0 ? (
            <>
              <DailyRecallModule items={dailyRecall} />
              <ForYouModule featured={featured} />
              {activeProject ? <ActiveProjectModule project={activeProject} /> : null}
              {graveyard ? <GraveyardModule bookmark={graveyard} /> : null}
            </>
          ) : (
            <div
              className="rounded-3xl border border-dashed p-10 text-center"
              style={{ borderColor: colors.border, backgroundColor: colors.cardBackground }}
            >
              <p className="text-sm opacity-70">
                No saves yet. Tap + to save your first link or note.
              </p>
            </div>
          )}

          <BrowseEverythingModule />
        </>
      )}
    </div>
  );
}
