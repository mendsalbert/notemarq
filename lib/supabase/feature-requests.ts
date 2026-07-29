import { isSupabaseConfigured, supabase } from '@/lib/supabase/client';
import type { FeatureRequest, FeatureVote } from '@/lib/types/feature-request';

type DbFeatureRequest = {
  id: string;
  user_id: string;
  title: string;
  body: string;
  created_at: string;
};

type DbFeatureRequestVote = {
  request_id: string;
  user_id: string;
  vote: number;
};

function mapRequest(
  row: DbFeatureRequest,
  score: number,
  userVote: FeatureVote,
): FeatureRequest {
  return {
    id: row.id,
    userId: row.user_id,
    title: row.title,
    body: row.body,
    createdAt: row.created_at,
    score,
    userVote,
  };
}

function buildScores(
  votes: DbFeatureRequestVote[],
  userId: string,
): Map<string, { score: number; userVote: FeatureVote }> {
  const byRequest = new Map<string, { score: number; userVote: FeatureVote }>();

  for (const vote of votes) {
    const current = byRequest.get(vote.request_id) ?? { score: 0, userVote: 0 as FeatureVote };
    current.score += vote.vote;
    if (vote.user_id === userId) {
      current.userVote = vote.vote as FeatureVote;
    }
    byRequest.set(vote.request_id, current);
  }

  return byRequest;
}

export async function fetchFeatureRequests(userId: string): Promise<FeatureRequest[]> {
  if (!isSupabaseConfigured) return [];

  const [{ data: rows, error: rowsError }, { data: votes, error: votesError }] =
    await Promise.all([
      supabase.from('feature_requests').select('*').order('created_at', { ascending: false }),
      supabase.from('feature_request_votes').select('request_id, user_id, vote'),
    ]);

  if (rowsError) throw rowsError;
  if (votesError) throw votesError;

  const scores = buildScores((votes ?? []) as DbFeatureRequestVote[], userId);

  return ((rows ?? []) as DbFeatureRequest[])
    .map((row) => {
      const tally = scores.get(row.id) ?? { score: 0, userVote: 0 as FeatureVote };
      return mapRequest(row, tally.score, tally.userVote);
    })
    .sort((a, b) => b.score - a.score || b.createdAt.localeCompare(a.createdAt));
}

export async function createFeatureRequest(
  userId: string,
  title: string,
  body: string,
): Promise<FeatureRequest> {
  if (!isSupabaseConfigured) throw new Error('Supabase is not configured');

  const trimmedTitle = title.trim();
  if (!trimmedTitle) {
    throw new Error('Title is required');
  }

  const { data, error } = await supabase
    .from('feature_requests')
    .insert({
      user_id: userId,
      title: trimmedTitle,
      body: body.trim(),
    })
    .select('*')
    .single();

  if (error) throw error;
  return mapRequest(data as DbFeatureRequest, 0, 0);
}

export async function castFeatureVote(
  userId: string,
  requestId: string,
  vote: 1 | -1,
): Promise<FeatureVote> {
  if (!isSupabaseConfigured) throw new Error('Supabase is not configured');

  const { data: existing, error: existingError } = await supabase
    .from('feature_request_votes')
    .select('vote')
    .eq('request_id', requestId)
    .eq('user_id', userId)
    .maybeSingle();

  if (existingError) throw existingError;

  if (existing?.vote === vote) {
    const { error } = await supabase
      .from('feature_request_votes')
      .delete()
      .eq('request_id', requestId)
      .eq('user_id', userId);
    if (error) throw error;
    return 0;
  }

  const { error } = await supabase.from('feature_request_votes').upsert(
    {
      request_id: requestId,
      user_id: userId,
      vote,
    },
    { onConflict: 'request_id,user_id' },
  );

  if (error) throw error;
  return vote;
}
