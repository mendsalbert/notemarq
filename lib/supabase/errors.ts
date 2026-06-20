export function describeSupabaseError(error: unknown): string {
  if (!error) return 'Unknown error';
  if (error instanceof Error) {
    return error.message || error.name || 'Unknown error';
  }
  if (typeof error === 'object') {
    const record = error as Record<string, unknown>;
    const parts = [record.message, record.code, record.details, record.hint].filter(
      (value): value is string => typeof value === 'string' && value.length > 0,
    );
    if (parts.length > 0) return parts.join(' — ');
  }
  try {
    const json = JSON.stringify(error);
    if (json && json !== '{}') return json;
  } catch {
    // ignore
  }
  return 'Unknown sync error';
}

export function wrapSyncStep(step: string, error: unknown): Error {
  return new Error(`[${step}] ${describeSupabaseError(error)}`, { cause: error });
}
