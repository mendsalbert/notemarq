export function getGoogleWebClientId(): string {
  return process.env.NEXT_PUBLIC_GOOGLE_WEB_CLIENT_ID?.trim() ?? '';
}
