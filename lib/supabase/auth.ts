import { supabase, supabaseUrl } from './client';

function getSupabaseStoragePrefix(): string | null {
  const match = supabaseUrl.match(/https:\/\/([^.]+)\.supabase\.co/);
  return match ? `sb-${match[1]}-` : null;
}

/** Wipe persisted Supabase auth keys when SDK signOut cannot reach the server. */
async function clearPersistedAuthStorage(): Promise<void> {
  const prefix = getSupabaseStoragePrefix();
  if (!prefix || typeof localStorage === 'undefined') return;

  const keys: string[] = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key?.startsWith(prefix)) keys.push(key);
  }
  for (const key of keys) {
    localStorage.removeItem(key);
  }
}

/**
 * Sign out locally even when offline. Supabase global signOut requires network;
 * if that fails the SDK keeps the session unless we clear storage ourselves.
 */
export async function signOutFromSupabase(): Promise<void> {
  const { error: remoteError } = await supabase.auth.signOut({ scope: 'global' });
  if (remoteError && process.env.NODE_ENV === 'development') {
    console.warn('[auth] remote signOut failed:', remoteError.message);
  }

  const { error: localError } = await supabase.auth.signOut({ scope: 'local' });
  if (localError && process.env.NODE_ENV === 'development') {
    console.warn('[auth] local signOut failed:', localError.message);
  }

  const { data } = await supabase.auth.getSession();
  if (data.session) {
    await clearPersistedAuthStorage();
  }
}
