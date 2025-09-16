import type { Favorite } from '@/entities/Favorite';
import type { Quote } from '@/entities/Quote';
import type { Vote } from '@/entities/Vote';
import { initializeDatabase } from '@/lib/db';
import { findUserByClerkId } from '@/lib/users';
import { auth } from '@clerk/nextjs/server';
import { NextRequest, NextResponse } from 'next/server';
export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const status = searchParams.get('status');
    const llmSource = searchParams.get('llmSource');
    const limit = parseInt(searchParams.get('limit') || '30');
    const offset = parseInt(searchParams.get('offset') || '0');
    const timeframe = (searchParams.get('timeframe') || 'all').toLowerCase();
    let sort = (searchParams.get('sort') || 'date').toLowerCase();
    let order = (searchParams.get('order') || 'desc').toLowerCase();
    const includeIds = (searchParams.get('includeIds') || '').toLowerCase() === 'true';

    // Initialize database
    const dataSource = await initializeDatabase();
    const quoteRepository = dataSource.getRepository<Quote>('quotes');
    const voteRepository = dataSource.getRepository<Vote>('votes');
    const favoriteRepository = dataSource.getRepository<Favorite>('favorites');

    // Build query
    const queryBuilder = quoteRepository.createQueryBuilder('quote');

    const hasStatusFilter = !!(status && status !== 'all');
    if (hasStatusFilter) {
      queryBuilder.where('quote.status = :status', { status });
    }
    const hasSourceFilter = !!(llmSource && llmSource.trim() !== '');
    if (hasSourceFilter) {
      // Case-insensitive partial match on LLM source
      const like = `%${llmSource}%`;
      if (hasStatusFilter) {
        queryBuilder.andWhere('quote.llmSource ILIKE :like', { like });
      } else {
        queryBuilder.where('quote.llmSource ILIKE :like', { like });
      }
    }
    const hasAnyFilter = hasStatusFilter || hasSourceFilter;

    // Timeframe filter: '1h' | '1d' | 'all'
    if (timeframe && timeframe !== 'all') {
      let since: Date | null = null;
      const now = new Date();
      if (timeframe === '1h') {
        since = new Date(now.getTime() - 60 * 60 * 1000);
      } else if (timeframe === '1d' || timeframe === '24h' || timeframe === '1day') {
        since = new Date(now.getTime() - 24 * 60 * 60 * 1000);
      }

      if (since) {
        // If filtering posted quotes specifically, use postedAt; otherwise use createdAt
        if (status === 'posted') {
          const clause = 'quote.postedAt >= :since';
          if (hasAnyFilter) {
            queryBuilder.andWhere(clause, { since });
          } else {
            queryBuilder.where(clause, { since });
          }
        } else {
          const clause = 'quote.createdAt >= :since';
          if (hasAnyFilter) {
            queryBuilder.andWhere(clause, { since });
          } else {
            queryBuilder.where(clause, { since });
          }
        }
      }
    }

    // Normalize legacy values
    if (sort === 'new' || sort === 'latest') {
      sort = 'date';
      order = 'desc';
    } else if (sort === 'old' || sort === 'oldest') {
      sort = 'date';
      order = 'asc';
    }

    const orderDir = order === 'asc' ? 'ASC' : 'DESC';
    // Sorting
    if (sort === 'upvotes' || sort === 'votes' || sort === 'top') {
      // Order by vote count, then by createdAt as tie-breaker
      queryBuilder
        .orderBy('(SELECT COUNT(*) FROM votes v WHERE v."quoteId" = quote.id)', orderDir)
        .addOrderBy('quote.createdAt', orderDir);
    } else {
      // Date sorting
      queryBuilder.orderBy('quote.createdAt', orderDir);
    }

    queryBuilder.limit(limit).offset(offset);

    const [quotes, total] = await queryBuilder.getManyAndCount();

    // Attach aggregated votes and user-voted flag in one go
    const ids = quotes.map((q) => q.id);
    let countsMap = new Map<number, number>();
    let votedSet = new Set<number>();
    let favoritedSet = new Set<number>();

    if (ids.length > 0) {
      // Count votes per quote for this page
      const rawCounts = await voteRepository
        .createQueryBuilder('v')
        .select('v."quoteId"', 'quoteId')
        .addSelect('COUNT(*)', 'count')
        .where('v."quoteId" IN (:...ids)', { ids })
        .groupBy('v."quoteId"')
        .getRawMany<{ quoteId: string; count: string }>();

      countsMap = new Map(rawCounts.map((r) => [Number(r.quoteId), Number(r.count)]));

      // If signed in, mark quotes the user has voted for.
      // Be tolerant if Clerk middleware didn't match this route.
      let clerkId: string | null = null;
      try {
        const { userId } = await auth();
        clerkId = userId ?? null;
      } catch {
        clerkId = null;
      }
      if (clerkId) {
        const user = await findUserByClerkId(dataSource, clerkId);
        if (user) {
          const rawVoted = await voteRepository
            .createQueryBuilder('v')
            .select('v."quoteId"', 'quoteId')
            .where('v."userId" = :userId', { userId: user.id })
            .andWhere('v."quoteId" IN (:...ids)', { ids })
            .getRawMany<{ quoteId: string }>();
          votedSet = new Set(rawVoted.map((r) => Number(r.quoteId)));

          // Fetch favorites for this user for the current page of quotes
          const rawFav = await favoriteRepository
            .createQueryBuilder('f')
            .select('f."quoteId"', 'quoteId')
            .where('f."userId" = :userId', { userId: user.id })
            .andWhere('f."quoteId" IN (:...ids)', { ids })
            .getRawMany<{ quoteId: string }>();
          favoritedSet = new Set(rawFav.map((r) => Number(r.quoteId)));
        }
      }

      // Mutate quote objects to include aggregated fields
      for (const q of quotes) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (q as any).votesCount = countsMap.get(q.id) ?? 0;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (q as any).votedByMe = votedSet.has(q.id);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (q as any).favoritedByMe = favoritedSet.has(q.id);
      }
    }

    // Build public payload, omitting id unless explicitly requested
    const payloadQuotes = quotes.map((q) => ({
      ...(includeIds ? { id: q.id } : {}),
      content: q.content,
      llmSource: q.llmSource,
      twitterHandle: q.twitterHandle ?? undefined,
      status: q.status,
      slug: q.slug,
      createdAt: q.createdAt,
      // Include scheduled time for admin views (includeIds=true)
      ...(includeIds ? { scheduledFor: q.scheduledFor ?? undefined } : {}),
      postedAt: q.postedAt ?? undefined,
      tweetId: q.tweetId ?? undefined,
      views: q.views,
      // aggregated flags added above
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      votesCount: (q as any).votesCount,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      votedByMe: (q as any).votedByMe,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      favoritedByMe: (q as any).favoritedByMe,
    }));

    return NextResponse.json({ quotes: payloadQuotes, total, limit, offset });
  } catch (error) {
    console.error('Error fetching quotes:', error);
    return NextResponse.json({ error: 'Failed to fetch quotes' }, { status: 500 });
  }
}
