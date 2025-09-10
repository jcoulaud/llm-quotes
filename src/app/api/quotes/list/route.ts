import { NextRequest, NextResponse } from 'next/server';
export const runtime = 'nodejs';
import { initializeDatabase } from '@/lib/db';
import type { Quote } from '@/entities/Quote';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const status = searchParams.get('status');
    const llmSource = searchParams.get('llmSource');
    const limit = parseInt(searchParams.get('limit') || '30');
    const offset = parseInt(searchParams.get('offset') || '0');
    const timeframe = (searchParams.get('timeframe') || 'all').toLowerCase();

    // Initialize database
    const dataSource = await initializeDatabase();
    const quoteRepository = dataSource.getRepository<Quote>('quotes');

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

    queryBuilder
      .orderBy('quote.createdAt', 'DESC')
      .limit(limit)
      .offset(offset);

    const [quotes, total] = await queryBuilder.getManyAndCount();

    return NextResponse.json({
      quotes,
      total,
      limit,
      offset,
    });
  } catch (error) {
    console.error('Error fetching quotes:', error);
    return NextResponse.json(
      { error: 'Failed to fetch quotes' },
      { status: 500 }
    );
  }
}
