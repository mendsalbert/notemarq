import type { UserPlan } from '@/lib/plan';

export type AiFeature =
  | 'ask'
  | 'ai_suggest'
  | 'add_context'
  | 'auto_organize'
  | 'document_extract';

export interface AiFeatureStatus {
  feature: AiFeature;
  used: number;
  limit: number | null;
  remaining: number | null;
  allowed: boolean;
}

const USAGE_KEY = 'notemarq-web-plan-usage';

export const PLAN_AI_LIMITS: Record<UserPlan, Record<AiFeature, number | null>> = {
  free: {
    ask: 10,
    ai_suggest: 10,
    add_context: 10,
    auto_organize: 10,
    document_extract: 10,
  },
  plus: {
    ask: 50,
    ai_suggest: 50,
    add_context: 50,
    auto_organize: 50,
    document_extract: 50,
  },
  pro: {
    ask: 80,
    ai_suggest: 80,
    add_context: 80,
    auto_organize: 80,
    document_extract: 80,
  },
  super_pro: {
    ask: null,
    ai_suggest: null,
    add_context: null,
    auto_organize: null,
    document_extract: null,
  },
};

const FEATURE_LABELS: Record<AiFeature, string> = {
  ask: 'Ask',
  ai_suggest: 'Suggest',
  add_context: 'Context',
  auto_organize: 'Auto organize',
  document_extract: 'Document import',
};

interface UsageRecord {
  month: string;
  ask: number;
  ai_suggest: number;
  add_context: number;
  auto_organize: number;
  document_extract: number;
}

function currentMonthKey(): string {
  const date = new Date();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  return `${date.getFullYear()}-${month}`;
}

function emptyUsage(): UsageRecord {
  return {
    month: currentMonthKey(),
    ask: 0,
    ai_suggest: 0,
    add_context: 0,
    auto_organize: 0,
    document_extract: 0,
  };
}

function readUsage(): UsageRecord {
  if (typeof window === 'undefined') return emptyUsage();
  try {
    const raw = localStorage.getItem(USAGE_KEY);
    if (!raw) return emptyUsage();
    const parsed = JSON.parse(raw) as UsageRecord;
    if (parsed.month !== currentMonthKey()) return emptyUsage();
    return {
      month: parsed.month,
      ask: parsed.ask ?? 0,
      ai_suggest: parsed.ai_suggest ?? 0,
      add_context: parsed.add_context ?? 0,
      auto_organize: parsed.auto_organize ?? 0,
      document_extract: parsed.document_extract ?? 0,
    };
  } catch {
    return emptyUsage();
  }
}

function writeUsage(record: UsageRecord) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(USAGE_KEY, JSON.stringify(record));
}

export function getFeatureLimit(plan: UserPlan, feature: AiFeature): number | null {
  return PLAN_AI_LIMITS[plan][feature];
}

export function getFeatureLabel(feature: AiFeature): string {
  return FEATURE_LABELS[feature];
}

export function getFeatureStatus(plan: UserPlan, feature: AiFeature): AiFeatureStatus {
  const usage = readUsage();
  const used = usage[feature];
  const limit = getFeatureLimit(plan, feature);
  const remaining = limit === null ? null : Math.max(limit - used, 0);
  return {
    feature,
    used,
    limit,
    remaining,
    allowed: limit === null || used < limit,
  };
}

export function consumeLocalFeature(plan: UserPlan, feature: AiFeature): AiFeatureStatus {
  const usage = readUsage();
  usage[feature] += 1;
  writeUsage(usage);
  return getFeatureStatus(plan, feature);
}

export function limitReachedMessage(feature: AiFeature, plan: UserPlan): string {
  const label = getFeatureLabel(feature);
  if (plan === 'free') {
    return `You've used all 10 Free ${label} uses for this month. Upgrade to continue.`;
  }
  const name = plan === 'plus' ? 'Plus' : plan === 'pro' ? 'Pro' : 'Super Pro';
  return `You've used all ${name} ${label} requests for this month.`;
}
