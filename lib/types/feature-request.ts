export type FeatureVote = -1 | 0 | 1;

export interface FeatureRequest {
  id: string;
  userId: string;
  title: string;
  body: string;
  createdAt: string;
  score: number;
  userVote: FeatureVote;
}
