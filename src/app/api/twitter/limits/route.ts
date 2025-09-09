import { NextRequest, NextResponse } from 'next/server';
import { ADMIN_SESSION_COOKIE, verifySessionToken } from '@/lib/adminAuth';
import { getTwitterClient } from '@/lib/twitter';

type RateLimit = {
  limit: number;
  remaining: number;
  reset: number; // epoch seconds
  day?: { limit: number; remaining: number; reset: number };
  userDay?: { limit: number; remaining: number; reset: number };
};

export async function GET(request: NextRequest) {
  // Admin-only: verify signed session cookie
  const token = request.cookies.get(ADMIN_SESSION_COOKIE)?.value;
  const session = verifySessionToken(token);
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const client = getTwitterClient();
  if (!client) {
    return NextResponse.json(
      { error: 'Twitter client not configured' },
      { status: 400 }
    );
  }

  // We want rate limits for POST /2/tweets (tweet creation)
  const endpoint = 'tweets';

  function toResponse(rate: RateLimit | undefined, source: 'cache' | 'probe' | 'unknown') {
    const day = rate?.userDay || rate?.day;
    const postsLeftToday = day?.remaining ?? null;
    return {
      endpoint,
      source,
      rateLimit: rate ?? null,
      summary: {
        postsLeftToday,
        windowRemaining: rate?.remaining ?? null,
        windowLimit: rate?.limit ?? null,
        windowResetAt: rate?.reset ? new Date(rate.reset * 1000).toISOString() : null,
        dayLimit: day?.limit ?? null,
        dayResetAt: day?.reset ? new Date(day.reset * 1000).toISOString() : null,
      },
    };
  }

  try {
    // Try cached last known rate limit first
    // Using the v2 subclient ensures proper prefixing for endpoint lookup
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const v2Any: any = client.v2 as any;
    const cached: RateLimit | undefined = v2Any.getLastRateLimitStatus?.(endpoint);
    const isObsolete: boolean = v2Any.isRateLimitStatusObsolete?.(endpoint) ?? true;

    if (cached && !isObsolete) {
      return NextResponse.json(toResponse(cached, 'cache'));
    }

    // Probe the endpoint with an intentionally invalid payload to get headers without posting
    try {
      // Using base .post to request fullResponse; this should 400 with rate-limit headers
      const resp = await client.v2.post('tweets', { text: '' }, { fullResponse: true });
      // If this ever succeeds (shouldn't), use provided rateLimit
      return NextResponse.json(toResponse(resp.rateLimit as RateLimit, 'probe'));
    } catch (e: unknown) {
      // twitter-api-v2 errors expose .rateLimit
      const err = e as { rateLimit?: RateLimit };
      if (err.rateLimit) {
        return NextResponse.json(toResponse(err.rateLimit, 'probe'));
      }
      // Fallback to cached even if obsolete
      if (cached) {
        return NextResponse.json(toResponse(cached, 'cache'));
      }
      return NextResponse.json(toResponse(undefined, 'unknown'));
    }
  } catch (error) {
    console.error('Error reading Twitter rate limits:', error);
    return NextResponse.json({ error: 'Failed to fetch rate limits' }, { status: 500 });
  }
}

