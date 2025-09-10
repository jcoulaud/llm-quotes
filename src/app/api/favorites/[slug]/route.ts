import { NextRequest, NextResponse } from 'next/server';
export const runtime = 'nodejs';
import { initializeDatabase } from '@/lib/db';
import type { Quote } from '@/entities/Quote';
import type { Favorite } from '@/entities/Favorite';
import { auth } from '@clerk/nextjs/server';

async function getUserId() {
  const { userId } = auth();
  return userId;
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  try {
    const userId = await getUserId();
    if (!userId) {
      return NextResponse.json({ favorited: false }, { status: 200 });
    }
    const { slug } = await params;
    const dataSource = await initializeDatabase();
    const quoteRepo = dataSource.getRepository<Quote>('quotes');
    const favoriteRepo = dataSource.getRepository<Favorite>('favorites');

    const quote = await quoteRepo.findOne({ where: { slug } });
    if (!quote) return NextResponse.json({ favorited: false }, { status: 200 });

    const existing = await favoriteRepo.findOne({ where: { userId, quoteId: quote.id } as any });
    return NextResponse.json({ favorited: Boolean(existing) });
  } catch (error) {
    console.error('Error checking favorite:', error);
    return NextResponse.json({ error: 'Failed to check favorite' }, { status: 500 });
  }
}

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  try {
    const userId = await getUserId();
    if (!userId) {
      return NextResponse.json({ error: 'Sign in to favorite quotes' }, { status: 401 });
    }
    const { slug } = await params;
    const dataSource = await initializeDatabase();
    const quoteRepo = dataSource.getRepository<Quote>('quotes');
    const favoriteRepo = dataSource.getRepository<Favorite>('favorites');

    const quote = await quoteRepo.findOne({ where: { slug } });
    if (!quote) return NextResponse.json({ error: 'Quote not found' }, { status: 404 });

    const existing = await favoriteRepo.findOne({ where: { userId, quoteId: quote.id } as any });
    if (!existing) {
      await favoriteRepo.insert({ userId, quoteId: quote.id } as any);
    }
    return NextResponse.json({ favorited: true });
  } catch (error) {
    console.error('Error adding favorite:', error);
    // Handle unique constraint race: still return favorited true
    return NextResponse.json({ favorited: true });
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  try {
    const userId = await getUserId();
    if (!userId) {
      return NextResponse.json({ error: 'Sign in to favorite quotes' }, { status: 401 });
    }
    const { slug } = await params;
    const dataSource = await initializeDatabase();
    const quoteRepo = dataSource.getRepository<Quote>('quotes');
    const favoriteRepo = dataSource.getRepository<Favorite>('favorites');

    const quote = await quoteRepo.findOne({ where: { slug } });
    if (!quote) return NextResponse.json({ error: 'Quote not found' }, { status: 404 });

    await favoriteRepo.delete({ userId, quoteId: quote.id } as any);
    return NextResponse.json({ favorited: false });
  } catch (error) {
    console.error('Error removing favorite:', error);
    return NextResponse.json({ error: 'Failed to remove favorite' }, { status: 500 });
  }
}

