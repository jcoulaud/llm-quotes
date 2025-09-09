import { NextRequest, NextResponse } from 'next/server';
import { getTweetsByIds } from '@/lib/tweetReader';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const idsParam = searchParams.get('ids') || '';
    const ids = idsParam
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

    if (ids.length === 0) {
      return NextResponse.json({ data: [] });
    }

    if (ids.length > 100) {
      return NextResponse.json(
        { error: 'Too many IDs. Max 100 per request.' },
        { status: 400 }
      );
    }

    const result = await getTweetsByIds(ids);
    return NextResponse.json(result);
  } catch (error) {
    console.error('Tweet lookup error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Lookup failed' },
      { status: 500 }
    );
  }
}

