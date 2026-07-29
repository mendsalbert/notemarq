import { isSupabaseConfigured, supabase } from '@/lib/supabase/client';

export async function createStripePortal(input?: {
  returnUrl?: string;
}): Promise<{ url: string }> {
  if (!isSupabaseConfigured) {
    throw new Error('Supabase is not configured');
  }

  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (!session?.access_token) {
    throw new Error('Sign in to manage billing');
  }

  const { data, error } = await supabase.functions.invoke('create-stripe-portal', {
    body: {
      returnUrl: input?.returnUrl,
    },
  });

  if (error) {
    const context = (error as { context?: Response }).context;
    if (context && typeof context.json === 'function') {
      try {
        const payload = (await context.json()) as { error?: string };
        if (payload?.error) throw new Error(payload.error);
      } catch (inner) {
        if (inner instanceof Error && inner.message !== error.message) throw inner;
      }
    }
    throw new Error(error.message || 'Could not open billing portal');
  }

  const payload = (data ?? {}) as Record<string, unknown>;
  if (payload.error) {
    throw new Error(String(payload.error));
  }

  const url = typeof payload.url === 'string' ? payload.url : '';
  if (!url) {
    throw new Error('Billing portal URL missing');
  }

  return { url };
}
