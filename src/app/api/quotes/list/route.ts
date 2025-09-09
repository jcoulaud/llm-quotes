import { NextRequest, NextResponse } from 'next/server';
import { initializeDatabase } from '@/lib/db';
import { Quote } from '@/entities/Quote';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const status = searchParams.get('status');
    const limit = parseInt(searchParams.get('limit') || '30');
    const offset = parseInt(searchParams.get('offset') || '0');

    // Initialize database
    const dataSource = await initializeDatabase();
    const quoteRepository = dataSource.getRepository(Quote);

    // Build query
    const queryBuilder = quoteRepository.createQueryBuilder('quote');
    
    if (status && status !== 'all') {
      queryBuilder.where('quote.status = :status', { status });
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