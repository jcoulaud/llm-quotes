import { NextRequest, NextResponse } from 'next/server';
import { initializeDatabase } from '@/lib/db';
import { Quote } from '@/entities/Quote';
import { postTweet } from '@/lib/twitter';
import { LessThanOrEqual } from 'typeorm';

export async function GET(request: NextRequest) {
  try {
    // Verify this is called by Vercel Cron
    const authHeader = request.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Initialize database
    const dataSource = await initializeDatabase();
    const quoteRepository = dataSource.getRepository(Quote);

    // Find scheduled quotes that are due
    const now = new Date();
    const scheduledQuotes = await quoteRepository.find({
      where: {
        status: 'scheduled',
        scheduledFor: LessThanOrEqual(now),
      },
      order: {
        scheduledFor: 'ASC',
      },
      take: 5, // Process max 5 quotes per run to avoid rate limits
    });

    const results = [];

    for (const quote of scheduledQuotes) {
      try {
        // Post to Twitter
        const tweetId = await postTweet(
          quote.content,
          quote.llmSource,
          quote.twitterHandle,
          quote.slug
        );

        if (tweetId) {
          // Update quote status
          quote.status = 'posted';
          quote.tweetId = tweetId;
          quote.postedAt = new Date();
          await quoteRepository.save(quote);

          results.push({
            quoteId: quote.id,
            status: 'success',
            tweetId,
          });
        } else {
          results.push({
            quoteId: quote.id,
            status: 'failed',
            error: 'Failed to post tweet',
          });
        }
      } catch (error) {
        console.error(`Error processing quote ${quote.id}:`, error);
        results.push({
          quoteId: quote.id,
          status: 'error',
          error: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    }

    return NextResponse.json({
      processed: results.length,
      results,
    });
  } catch (error) {
    console.error('Scheduler error:', error);
    return NextResponse.json(
      { error: 'Scheduler failed' },
      { status: 500 }
    );
  }
}
