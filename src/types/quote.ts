export type QuoteDTO = {
  id: number;
  content: string;
  llmSource: string;
  twitterHandle?: string | null;
  status: 'pending' | 'approved' | 'scheduled' | 'posted' | 'rejected' | string;
  slug: string;
  createdAt: string | Date;
  postedAt?: string | Date | null;
  tweetId?: string | null;
  views?: number;
};

