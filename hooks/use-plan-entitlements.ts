'use client';

import { useCallback } from 'react';
import { useRouter } from 'next/navigation';

import { useUserPlan } from '@/hooks/use-user-plan';
import {
  consumeLocalFeature,
  getFeatureStatus,
  limitReachedMessage,
  type AiFeature,
} from '@/lib/plan-entitlements';

export function usePlanEntitlements() {
  const { plan } = useUserPlan();
  const router = useRouter();

  const ensureFeature = useCallback(
    (feature: AiFeature): boolean => {
      const status = getFeatureStatus(plan, feature);
      if (status.allowed) return true;
      const message = limitReachedMessage(feature, plan);
      if (typeof window !== 'undefined') {
        const upgrade = window.confirm(`${message}\n\nOpen pricing to upgrade?`);
        if (upgrade) router.push('/pricing');
      }
      return false;
    },
    [plan, router],
  );

  const recordFeatureUse = useCallback(
    (feature: AiFeature) => {
      consumeLocalFeature(plan, feature);
    },
    [plan],
  );

  return { plan, ensureFeature, recordFeatureUse };
}
