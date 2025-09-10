import { NextRequest, NextResponse } from 'next/server';
export const runtime = 'nodejs';
import { initializeDatabase } from '@/lib/db';
import { Quote } from '@/entities/Quote';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;

    // Initialize database
    const dataSource = await initializeDatabase();
    const quoteRepository = dataSource.getRepository(Quote);

    // Find quote by slug
    const quote = await quoteRepository.findOne({
      where: { slug },
    });

    if (!quote) {
      return NextResponse.json(
        { error: 'Quote not found' },
        { status: 404 }
      );
    }

    // Increment views
    quote.views = quote.views + 1;
    await quoteRepository.save(quote);

    return NextResponse.json(quote);
  } catch (error) {
    console.error('Error fetching quote:', error);
    return NextResponse.json(
      { error: 'Failed to fetch quote' },
      { status: 500 }
    );
  }
}
