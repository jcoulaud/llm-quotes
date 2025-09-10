import { NextResponse } from 'next/server';
export const runtime = 'nodejs';
import { initializeDatabase } from '@/lib/db';
import type { Quote } from '@/entities/Quote';

export async function GET() {
  try {
    const dataSource = await initializeDatabase();
    const repo = dataSource.getRepository<Quote>('quotes');

    const rows = await repo
      .createQueryBuilder('q')
      .select('DISTINCT q.llmSource', 'llmSource')
      .orderBy('q.llmSource', 'ASC')
      .getRawMany<{ llmSource: string }>();

    const sources = rows
      .map((r) => r.llmSource)
      .filter((s): s is string => !!s && s.trim().length > 0);

    return NextResponse.json({ sources });
  } catch (error) {
    console.error('Error fetching LLM sources:', error);
    return NextResponse.json(
      { error: 'Failed to fetch LLM sources' },
      { status: 500 }
    );
  }
}
