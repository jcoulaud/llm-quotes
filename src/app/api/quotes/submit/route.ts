import { NextRequest, NextResponse } from 'next/server';
export const runtime = 'nodejs';
import { initializeDatabase } from '@/lib/db';
import type { Quote } from '@/entities/Quote';
import { quoteSubmissionSchema } from '@/lib/validation';
import { generateSlug } from '@/lib/utils';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate input
    const validation = quoteSubmissionSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: validation.error.issues },
        { status: 400 }
      );
    }

    // Initialize database
    const dataSource = await initializeDatabase();
    const quoteRepository = dataSource.getRepository('Quote');

    // Create new quote
    const quote = quoteRepository.create({
      content: validation.data.content,
      llmSource: validation.data.llmSource,
      twitterHandle: validation.data.twitterHandle?.replace('@', '') || undefined,
      status: 'pending',
      slug: generateSlug(validation.data.content),
      views: 0,
    } as Partial<Quote>);

    // Save to database
    const savedQuote = await quoteRepository.save(quote);

    return NextResponse.json({
      success: true,
      quote: {
        id: savedQuote.id,
        slug: savedQuote.slug,
        status: savedQuote.status,
      },
    });
  } catch (error) {
    console.error('Error submitting quote:', error);
    return NextResponse.json(
      { error: 'Failed to submit quote' },
      { status: 500 }
    );
  }
}
