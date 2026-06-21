'use client';

import { IconPlus } from '@tabler/icons-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

import { AddBookmarkDialog } from '@/components/app/add-bookmark-dialog';
import { AppHeader } from '@/components/app/app-header';
import { AppSidebar } from '@/components/app/app-sidebar';
import { useAuth } from '@/contexts/auth-provider';
import { useAppColors } from '@/hooks/use-app-colors';
import { cn } from '@/lib/utils';
import { useAppStore } from '@/store/app-store';

export function AppShell({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { user } = useAuth();
  const addNote = useAppStore((s) => s.addNote);
  const { colors } = useAppColors();
  const [addOpen, setAddOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [creatingNote, setCreatingNote] = useState(false);

  useEffect(() => {
    function openAdd() {
      setAddOpen(true);
    }
    document.addEventListener('notemarq:open-add-bookmark', openAdd);
    return () => document.removeEventListener('notemarq:open-add-bookmark', openAdd);
  }, []);

  function closeSidebar() {
    setSidebarOpen(false);
  }

  async function handleAddNote() {
    if (!user?.id || creatingNote) return;
    setCreatingNote(true);
    closeSidebar();
    try {
      const note = await addNote(user.id, { name: 'Untitled note' });
      router.push(`/app/notes/${note.id}`);
    } finally {
      setCreatingNote(false);
    }
  }

  return (
    <div
      className="flex min-h-screen transition-colors"
      style={{ backgroundColor: colors.pageBackground, color: colors.text }}
    >
      {/* Desktop sidebar — logo lives here */}
      <div
        className="hidden shrink-0 border-r md:block"
        style={{ borderColor: colors.border }}
      >
        <AppSidebar onAddBookmark={() => setAddOpen(true)} onAddNote={() => void handleAddNote()} className="sticky top-0 h-screen" />
      </div>

      {/* Main column */}
      <div className="flex min-w-0 flex-1 flex-col">
        <AppHeader onMenuClick={() => setSidebarOpen((v) => !v)} sidebarOpen={sidebarOpen} />
        <main className="min-h-0 flex-1 overflow-x-hidden overflow-y-auto">{children}</main>
      </div>

      {/* Mobile drawer */}
      {sidebarOpen ? (
        <>
          <button
            type="button"
            className="fixed inset-0 z-40 bg-black/40 md:hidden"
            aria-label="Close menu overlay"
            onClick={closeSidebar}
          />
          <div
            className="fixed inset-y-0 left-0 z-50 shadow-xl md:hidden"
            style={{ backgroundColor: colors.pageBackground }}
          >
            <AppSidebar
              onAddBookmark={() => {
                setAddOpen(true);
                closeSidebar();
              }}
              onAddNote={() => void handleAddNote()}
              onNavigate={closeSidebar}
              className="h-full overflow-y-auto pt-16"
            />
          </div>
        </>
      ) : null}

      {/* Mobile FAB */}
      <button
        type="button"
        onClick={() => setAddOpen(true)}
        className={cn(
          'fixed bottom-6 right-6 z-40 flex h-14 w-14 items-center justify-center rounded-2xl shadow-lg transition hover:scale-105 md:hidden',
        )}
        style={{ backgroundColor: colors.primary, color: colors.onAccent }}
        aria-label="Save link"
      >
        <IconPlus size={26} stroke={2.5} />
      </button>

      <AddBookmarkDialog open={addOpen} onClose={() => setAddOpen(false)} />
    </div>
  );
}
