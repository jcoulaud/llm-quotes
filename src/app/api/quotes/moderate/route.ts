import { NextRequest, NextResponse } from 'next/server';
export const runtime = 'nodejs';
import { initializeDatabase } from '@/lib/db';
import type { Quote } from '@/entities/Quote';
import { ADMIN_SESSION_COOKIE, verifySessionToken } from '@/lib/adminAuth';

export async function POST(request: NextRequest) {
  try {
    // Verify signed admin session
    const token = request.cookies.get(ADMIN_SESSION_COOKIE)?.value;
    const session = verifySessionToken(token);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { quoteId, action, scheduledFor } = body;

    if (!quoteId || !action) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Initialize database
    const dataSource = await initializeDatabase();
    const quoteRepository = dataSource.getRepository<Quote>('Quote');

    // Find quote
    const quote = await quoteRepository.findOne({
      where: { id: quoteId },
    });

    if (!quote) {
      return NextResponse.json(
        { error: 'Quote not found' },
        { status: 404 }
      );
    }

    // Update quote status based on action
    switch (action) {
      case 'approve':
        quote.status = 'approved';
        break;
      case 'reject':
        quote.status = 'rejected';
        break;
      case 'schedule':
        if (!scheduledFor) {
          return NextResponse.json(
            { error: 'Scheduled time required for scheduling' },
            { status: 400 }
          );
        }
        quote.status = 'scheduled';
        quote.scheduledFor = new Date(scheduledFor);
        break;
      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        );
    }

    // Save updated quote
    const updatedQuote = await quoteRepository.save(quote);

    return NextResponse.json({
      success: true,
      quote: updatedQuote,
    });
  } catch (error) {
    console.error('Error moderating quote:', error);
    return NextResponse.json(
      { error: 'Failed to moderate quote' },
      { status: 500 }
    );
  }
}
