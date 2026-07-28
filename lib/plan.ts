export type UserPlan = 'free' | 'plus' | 'pro' | 'super_pro';

export function normalizePlan(raw: string | null | undefined): UserPlan {
  if (raw === 'plus' || raw === 'pro' || raw === 'super_pro') return raw;
  return 'free';
}

export function planDisplayName(plan: UserPlan): string {
  switch (plan) {
    case 'plus':
      return 'Plus';
    case 'pro':
      return 'Pro';
    case 'super_pro':
      return 'Super Pro';
    default:
      return 'Free';
  }
}

export function isPaidPlan(plan: UserPlan): boolean {
  return plan !== 'free';
}
