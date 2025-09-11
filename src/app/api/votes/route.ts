import { NextResponse } from 'next/server';
export const runtime = 'nodejs';
import { initializeDatabase } from '@/lib/db';
import type { Quote } from '@/entities/Quote';
import { auth } from '@clerk/nextjs/server';
import { getOrCreateUserByClerkId } from '@/lib/users';

export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ quotes: [] });

    const dataSource = await initializeDatabase();
    const quoteRepo = dataSource.getRepository<Quote>('quotes');

    const user = await getOrCreateUserByClerkId(dataSource, userId);

    const quotes = await quoteRepo
      .createQueryBuilder('q')
      .innerJoin('votes', 'v', 'v."quoteId" = q.id AND v."userId" = :userId', { userId: user.id })
      .orderBy('v."createdAt"', 'DESC')
      .getMany();

    // Sanitize payload for client (omit numeric id)
    const payload = quotes.map((q) => ({
      content: q.content,
      llmSource: q.llmSource,
      twitterHandle: q.twitterHandle ?? undefined,
      status: q.status,
      slug: q.slug,
      createdAt: q.createdAt,
      postedAt: q.postedAt ?? undefined,
      tweetId: q.tweetId ?? undefined,
      views: q.views,
      votedByMe: true,
    }));

    return NextResponse.json({ quotes: payload });
  } catch (error: unknown) {
    console.error('Error listing votes:', error);
    return NextResponse.json({ error: 'Failed to list votes' }, { status: 500 });
  }
}
