export interface Poll {
  id: number;
  agency: string;
  publishedDate: string;
  fieldworkStart?: string;
  fieldworkEnd?: string;
  sampleSize?: number;
  sourceUrl?: string;
  createdAt: string;
}

export interface PollResult {
  id: number;
  pollId: number;
  partyId: string;
  percentage: number;
}

export interface PollWithResults extends Poll {
  results: Record<string, number>;
}
