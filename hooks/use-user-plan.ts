'use client';

import { useCallback, useEffect, useState } from 'react';

import { useAuth } from '@/contexts/auth-provider';
import { isSupabaseConfigured, supabase } from '@/lib/supabase/client';
import { normalizePlan, type UserPlan } from '@/lib/plan';

async function resolveStrictPlan(userId: string): Promise<{
  plan: UserPlan;
  hasWebSubscription: boolean;
}> {
  const { data: profile } = await supabase
    .from('profiles')
    .select('plan')
    .eq('id', userId)
    .maybeSingle();

  const profilePlan = normalizePlan(profile?.plan as string | undefined);
  if (profilePlan === 'free') {
    return { plan: 'free', hasWebSubscription: false };
  }

  const { data: subs } = await supabase
    .from('subscriptions')
    .select('plan, status, expires_at, platform')
    .eq('user_id', userId)
    .eq('plan', profilePlan)
    .in('status', ['active', 'grace_period', 'cancelled']);

  const now = Date.now();
  let valid = false;
  let hasWebSubscription = false;

  for (const sub of subs ?? []) {
    const stillValid =
      sub.status === 'active' ||
      sub.status === 'grace_period' ||
      (sub.status === 'cancelled' &&
        (!sub.expires_at || new Date(sub.expires_at as string).getTime() > now));
    if (!stillValid) continue;
    valid = true;
    if (sub.platform === 'web') hasWebSubscription = true;
  }

  return {
    plan: valid ? profilePlan : 'free',
    hasWebSubscription: valid && hasWebSubscription,
  };
}

export function useUserPlan() {
  const { user } = useAuth();
  const [plan, setPlan] = useState<UserPlan>('free');
  const [hasWebSubscription, setHasWebSubscription] = useState(false);
  const [loading, setLoading] = useState(Boolean(user?.id));

  const refresh = useCallback(async () => {
    if (!user?.id || !isSupabaseConfigured) {
      setPlan('free');
      setHasWebSubscription(false);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const result = await resolveStrictPlan(user.id);
      setPlan(result.plan);
      setHasWebSubscription(result.hasWebSubscription);
    } catch {
      setPlan('free');
      setHasWebSubscription(false);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return {
    plan,
    loading,
    refresh,
    isPaid: plan !== 'free',
    hasWebSubscription,
  };
}
