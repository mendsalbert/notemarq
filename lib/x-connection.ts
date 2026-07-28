import { generateCodeChallenge, generateCodeVerifier } from '@/lib/oauth-pkce';
import { isSupabaseConfigured, supabase } from '@/lib/supabase/client';

const X_AUTH_URL = 'https://x.com/i/oauth2/authorize';
const X_SCOPES = 'tweet.read users.read bookmark.read offline.access';
const PKCE_KEY = 'notemarq-web-x-pkce';
const WEB_OAUTH_STATE = 'nmweb';

export interface XConnectionStatus {
  connected: boolean;
  x_username?: string | null;
  x_user_id?: string;
  last_synced_at?: string | null;
  connected_at?: string;
}

export interface XSyncResult {
  imported: number;
  skipped: number;
  has_more: boolean;
  folder_id: string | null;
}

function getXClientId(): string | null {
  return process.env.NEXT_PUBLIC_X_CLIENT_ID?.trim() || null;
}

function getSupabaseUrl(): string | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  return url ? url.replace(/\/$/, '') : null;
}

export function getXOAuthRedirectUri(): string | null {
  const supabaseUrl = getSupabaseUrl();
  if (!supabaseUrl) return null;
  return `${supabaseUrl}/functions/v1/x-oauth-redirect`;
}

export function isXConnectionConfigured(): boolean {
  return Boolean(getXClientId() && getXOAuthRedirectUri());
}

async function getAuthHeaders(): Promise<Record<string, string>> {
  const { data } = await supabase.auth.getSession();
  const token = data.session?.access_token;
  if (!token) throw new Error('Sign in to connect X');
  return { Authorization: `Bearer ${token}` };
}

export async function fetchXConnectionStatus(): Promise<XConnectionStatus> {
  if (!isSupabaseConfigured) return { connected: false };
  const headers = await getAuthHeaders();
  const { data, error } = await supabase.functions.invoke<XConnectionStatus>('x-connection', {
    body: { action: 'status' },
    headers,
  });
  if (error) throw new Error(error.message || 'Could not load X connection');
  return data ?? { connected: false };
}

export async function disconnectX(): Promise<void> {
  const headers = await getAuthHeaders();
  const { error } = await supabase.functions.invoke('x-connection', {
    body: { action: 'disconnect' },
    headers,
  });
  if (error) throw new Error(error.message || 'Could not disconnect X');
}

export async function syncXBookmarks(): Promise<XSyncResult> {
  const headers = await getAuthHeaders();
  const { data, error } = await supabase.functions.invoke<XSyncResult & { error?: string }>(
    'sync-x-bookmarks',
    { body: {}, headers },
  );
  const serverMessage =
    data && typeof data === 'object' && 'error' in data && data.error
      ? String(data.error)
      : null;
  if (error) throw new Error(serverMessage ?? error.message ?? 'Bookmark sync failed');
  if (serverMessage) throw new Error(serverMessage);
  return {
    imported: data?.imported ?? 0,
    skipped: data?.skipped ?? 0,
    has_more: data?.has_more ?? false,
    folder_id: data?.folder_id ?? null,
  };
}

/** Starts browser OAuth — redirects away from the current page. */
export async function startXConnect(): Promise<void> {
  const clientId = getXClientId();
  const redirectUri = getXOAuthRedirectUri();
  if (!clientId) throw new Error('X integration is not configured');
  if (!redirectUri) throw new Error('X OAuth redirect is not configured');

  const codeVerifier = generateCodeVerifier();
  const codeChallenge = await generateCodeChallenge(codeVerifier);
  sessionStorage.setItem(PKCE_KEY, JSON.stringify({ codeVerifier, redirectUri }));

  const authUrl = new URL(X_AUTH_URL);
  authUrl.searchParams.set('response_type', 'code');
  authUrl.searchParams.set('client_id', clientId);
  authUrl.searchParams.set('redirect_uri', redirectUri);
  authUrl.searchParams.set('scope', X_SCOPES);
  authUrl.searchParams.set('state', WEB_OAUTH_STATE);
  authUrl.searchParams.set('code_challenge', codeChallenge);
  authUrl.searchParams.set('code_challenge_method', 'S256');

  window.location.assign(authUrl.toString());
}

export async function completeXConnect(code: string): Promise<XConnectionStatus> {
  const raw = sessionStorage.getItem(PKCE_KEY);
  if (!raw) throw new Error('X sign-in session expired. Try connecting again.');
  sessionStorage.removeItem(PKCE_KEY);

  let stored: { codeVerifier: string; redirectUri: string };
  try {
    stored = JSON.parse(raw) as { codeVerifier: string; redirectUri: string };
  } catch {
    throw new Error('X sign-in session was invalid. Try connecting again.');
  }

  const headers = await getAuthHeaders();
  const { data, error } = await supabase.functions.invoke<{
    connected: boolean;
    x_username?: string;
    x_user_id?: string;
    error?: string;
  }>('x-oauth-callback', {
    body: {
      code,
      redirect_uri: stored.redirectUri,
      code_verifier: stored.codeVerifier,
    },
    headers,
  });

  if (error) throw new Error(error.message || 'X connection failed');
  if (data?.error) throw new Error(data.error);
  if (!data?.connected) throw new Error('X connection failed');

  return {
    connected: true,
    x_username: data.x_username,
    x_user_id: data.x_user_id,
  };
}

export function formatXLastSynced(iso: string | null | undefined): string {
  if (!iso) return 'Never synced';
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return 'Never synced';
  return date.toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

export function isWebXOAuthState(state: string | null): boolean {
  return state === WEB_OAUTH_STATE || Boolean(state?.startsWith(`${WEB_OAUTH_STATE}.`));
}
