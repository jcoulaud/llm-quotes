import { NextResponse } from 'next/server';
export const runtime = 'nodejs';
import { initializeDatabase } from '@/lib/db';
import type { Quote } from '@/entities/Quote';
import { auth } from '@clerk/nextjs/server';

export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ quotes: [] });

    const dataSource = await initializeDatabase();
    const quoteRepo = dataSource.getRepository<Quote>('quotes');

    // Join quotes with favorites for the current user, order by favorited time desc
    const quotes = await quoteRepo
      .createQueryBuilder('q')
      .innerJoin('favorites', 'f', 'f."quoteId" = q.id AND f."userId" = :userId', { userId })
      .orderBy('f."createdAt"', 'DESC')
      .getMany();

    return NextResponse.json({ quotes });
  } catch (error: unknown) {
    console.error('Error listing favorites:', error);
    return NextResponse.json({ error: 'Failed to list favorites' }, { status: 500 });
  }
}
