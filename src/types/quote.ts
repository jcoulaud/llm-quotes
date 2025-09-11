export type BaseQuoteDTO = {
  content: string;
  llmSource: string;
  twitterHandle?: string | null;
  status: 'pending' | 'scheduled' | 'posted' | 'rejected' | string;
  slug: string;
  createdAt: string | Date;
  postedAt?: string | Date | null;
  tweetId?: string | null;
  views?: number;
  // Aggregated votes info (optional; present when fetched via list API)
  votesCount?: number;
  votedByMe?: boolean;
  // Per-user favorite state (optional; present when fetched via list API)
  favoritedByMe?: boolean;
};

// Internal/admin DTO that includes numeric id
export type QuoteDTO = BaseQuoteDTO & { id: number };

// Public DTO for list endpoints, id omitted
export type PublicQuoteDTO = BaseQuoteDTO;
