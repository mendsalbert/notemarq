import { isSupabaseConfigured, supabase } from '@/lib/supabase/client';

export type PaidPlanId = 'plus' | 'pro' | 'super_pro';
export type BillingInterval = 'monthly' | 'yearly';

export interface StripeCheckoutResult {
  url: string;
  plan: PaidPlanId;
  billing: BillingInterval;
  priceId: string;
  sessionId?: string;
}

async function readFunctionError(error: unknown): Promise<string | null> {
  const context = (error as { context?: Response })?.context;
  if (!context || typeof context.json !== 'function') return null;
  try {
    const payload = (await context.json()) as { error?: string };
    if (payload?.error) return String(payload.error);
  } catch {
    /* ignore */
  }
  return null;
}

export async function createStripeCheckout(input: {
  plan: PaidPlanId;
  billing?: BillingInterval;
  redirectUrl?: string;
  cancelUrl?: string;
}): Promise<StripeCheckoutResult> {
  if (!isSupabaseConfigured) {
    throw new Error('Supabase is not configured');
  }

  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (!session?.access_token) {
    throw new Error('Sign in to upgrade');
  }

  const billing = input.billing ?? 'monthly';
  const { data, error } = await supabase.functions.invoke('create-stripe-checkout', {
    body: {
      plan: input.plan,
      billing,
      redirectUrl: input.redirectUrl,
      cancelUrl: input.cancelUrl,
    },
  });

  if (error) {
    const detailed = await readFunctionError(error);
    throw new Error(detailed || error.message || 'Could not start checkout');
  }

  const payload = (data ?? {}) as Record<string, unknown>;
  if (payload.error) {
    throw new Error(String(payload.error));
  }

  const url = typeof payload.url === 'string' ? payload.url : '';
  if (!url) {
    throw new Error('Checkout URL missing');
  }

  return {
    url,
    plan: input.plan,
    billing,
    priceId: String(payload.priceId ?? ''),
    sessionId: typeof payload.sessionId === 'string' ? payload.sessionId : undefined,
  };
}
