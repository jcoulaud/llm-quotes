export type TweetLookupResult = {
  data?: Array<{
    id: string;
    text?: string;
    author_id?: string;
    created_at?: string;
    public_metrics?: Record<string, number>;
  }>;
  includes?: Record<string, unknown>;
  errors?: Array<unknown>;
};

/**
 * Fetch tweets by IDs using twitterapi.io service.
 * Posting remains via official Twitter API (see src/lib/twitter.ts).
 */
export async function getTweetsByIds(ids: string[]): Promise<TweetLookupResult> {
  if (!ids || ids.length === 0) {
    return { data: [] };
  }

  const apiKey = process.env.TWITTERAPIIO_API_KEY;
  const base = 'https://api.twitterapi.io/2/tweets';

  if (!apiKey) {
    throw new Error('TWITTERAPIIO_API_KEY not set');
  }

  // Build query. Keep fields minimal for compatibility; callers can extend later.
  const url = new URL(base);
  url.searchParams.set('ids', ids.join(','));

  const res = await fetch(url.toString(), {
    method: 'GET',
    // Support both common auth header styles to be compatible with the service
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'X-API-KEY': apiKey,
      'Content-Type': 'application/json',
    },
    // Server-side only
    cache: 'no-store',
    next: { revalidate: 0 },
  });

  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`Tweet lookup failed: ${res.status} ${res.statusText} ${text}`.trim());
  }

  return (await res.json()) as TweetLookupResult;
}
