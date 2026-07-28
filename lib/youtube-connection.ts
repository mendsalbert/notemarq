import { generateCodeChallenge, generateCodeVerifier } from '@/lib/oauth-pkce';
import { isSupabaseConfigured, supabase } from '@/lib/supabase/client';

const GOOGLE_AUTH_URL = 'https://accounts.google.com/o/oauth2/v2/auth';
const YOUTUBE_READONLY_SCOPE = 'https://www.googleapis.com/auth/youtube.readonly';
const PKCE_KEY = 'notemarq-web-youtube-pkce';
const WEB_OAUTH_STATE = 'nmweb';

export interface YoutubeConnectionStatus {
  connected: boolean;
  youtube_channel_title?: string | null;
  youtube_channel_id?: string;
  last_synced_at?: string | null;
  connected_at?: string;
}

export interface YoutubeSyncResult {
  imported: number;
  skipped: number;
  has_more: boolean;
  folder_id: string | null;
}

function getGoogleWebClientId(): string | null {
  return process.env.NEXT_PUBLIC_GOOGLE_WEB_CLIENT_ID?.trim() || null;
}

function getSupabaseUrl(): string | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  return url ? url.replace(/\/$/, '') : null;
}

export function getYoutubeOAuthRedirectUri(): string | null {
  const supabaseUrl = getSupabaseUrl();
  if (!supabaseUrl) return null;
  return `${supabaseUrl}/functions/v1/youtube-oauth-redirect`;
}

export function isYoutubeConnectionConfigured(): boolean {
  return Boolean(getGoogleWebClientId() && getYoutubeOAuthRedirectUri());
}

async function getAuthHeaders(): Promise<Record<string, string>> {
  const { data } = await supabase.auth.getSession();
  const token = data.session?.access_token;
  if (!token) throw new Error('Sign in to connect YouTube');
  return { Authorization: `Bearer ${token}` };
}

export async function fetchYoutubeConnectionStatus(): Promise<YoutubeConnectionStatus> {
  if (!isSupabaseConfigured) return { connected: false };
  const headers = await getAuthHeaders();
  const { data, error } = await supabase.functions.invoke<YoutubeConnectionStatus>(
    'youtube-connection',
    { body: { action: 'status' }, headers },
  );
  if (error) throw new Error(error.message || 'Could not load YouTube connection');
  return data ?? { connected: false };
}

export async function disconnectYoutube(): Promise<void> {
  const headers = await getAuthHeaders();
  const { error } = await supabase.functions.invoke('youtube-connection', {
    body: { action: 'disconnect' },
    headers,
  });
  if (error) throw new Error(error.message || 'Could not disconnect YouTube');
}

export async function syncYoutubeSaves(): Promise<YoutubeSyncResult> {
  const headers = await getAuthHeaders();
  const { data, error } = await supabase.functions.invoke<YoutubeSyncResult & { error?: string }>(
    'sync-youtube-saves',
    { body: {}, headers },
  );
  const serverMessage =
    data && typeof data === 'object' && 'error' in data && data.error
      ? String(data.error)
      : null;
  if (error) throw new Error(serverMessage ?? error.message ?? 'YouTube sync failed');
  if (serverMessage) throw new Error(serverMessage);
  return {
    imported: data?.imported ?? 0,
    skipped: data?.skipped ?? 0,
    has_more: data?.has_more ?? false,
    folder_id: data?.folder_id ?? null,
  };
}

/** Starts browser OAuth — redirects away from the current page. */
export async function startYoutubeConnect(): Promise<void> {
  const clientId = getGoogleWebClientId();
  const redirectUri = getYoutubeOAuthRedirectUri();
  if (!clientId) throw new Error('YouTube integration is not configured');
  if (!redirectUri) throw new Error('YouTube OAuth redirect is not configured');

  const codeVerifier = generateCodeVerifier();
  const codeChallenge = await generateCodeChallenge(codeVerifier);
  sessionStorage.setItem(PKCE_KEY, JSON.stringify({ codeVerifier, redirectUri }));

  const authUrl = new URL(GOOGLE_AUTH_URL);
  authUrl.searchParams.set('client_id', clientId);
  authUrl.searchParams.set('response_type', 'code');
  authUrl.searchParams.set('redirect_uri', redirectUri);
  authUrl.searchParams.set('scope', YOUTUBE_READONLY_SCOPE);
  authUrl.searchParams.set('state', WEB_OAUTH_STATE);
  authUrl.searchParams.set('code_challenge', codeChallenge);
  authUrl.searchParams.set('code_challenge_method', 'S256');
  authUrl.searchParams.set('access_type', 'offline');
  authUrl.searchParams.set('prompt', 'consent');

  window.location.assign(authUrl.toString());
}

export async function completeYoutubeConnect(code: string): Promise<YoutubeConnectionStatus> {
  const raw = sessionStorage.getItem(PKCE_KEY);
  if (!raw) throw new Error('YouTube sign-in session expired. Try connecting again.');
  sessionStorage.removeItem(PKCE_KEY);

  let stored: { codeVerifier: string; redirectUri: string };
  try {
    stored = JSON.parse(raw) as { codeVerifier: string; redirectUri: string };
  } catch {
    throw new Error('YouTube sign-in session was invalid. Try connecting again.');
  }

  const headers = await getAuthHeaders();
  const { data, error } = await supabase.functions.invoke<{
    connected: boolean;
    youtube_channel_title?: string;
    youtube_channel_id?: string;
    error?: string;
  }>('youtube-oauth-callback', {
    body: {
      code,
      redirect_uri: stored.redirectUri,
      code_verifier: stored.codeVerifier,
    },
    headers,
  });

  if (error) throw new Error(error.message || 'YouTube connection failed');
  if (data?.error) throw new Error(data.error);
  if (!data?.connected) throw new Error('YouTube connection failed');

  return {
    connected: true,
    youtube_channel_title: data.youtube_channel_title,
    youtube_channel_id: data.youtube_channel_id,
  };
}

export function formatYoutubeLastSynced(iso: string | null | undefined): string {
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

export function isWebYoutubeOAuthState(state: string | null): boolean {
  return state === WEB_OAUTH_STATE || Boolean(state?.startsWith(`${WEB_OAUTH_STATE}.`));
}
