'use client';

import { useCallback, useEffect, useState } from 'react';

import { useAuth } from '@/contexts/auth-provider';
import { isSupabaseConfigured, supabase } from '@/lib/supabase/client';
import { normalizePlan, type UserPlan } from '@/lib/plan';

export function useUserPlan() {
  const { user } = useAuth();
  const [plan, setPlan] = useState<UserPlan>('free');
  const [loading, setLoading] = useState(Boolean(user?.id));

  const refresh = useCallback(async () => {
    if (!user?.id || !isSupabaseConfigured) {
      setPlan('free');
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('plan')
        .eq('id', user.id)
        .maybeSingle();

      if (error) throw error;
      setPlan(normalizePlan(data?.plan as string | undefined));
    } catch {
      setPlan('free');
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return { plan, loading, refresh, isPaid: plan !== 'free' };
}
