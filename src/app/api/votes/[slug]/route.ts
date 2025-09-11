import { NextRequest, NextResponse } from 'next/server';
export const runtime = 'nodejs';
import { initializeDatabase } from '@/lib/db';
import type { Quote } from '@/entities/Quote';
import type { Vote } from '@/entities/Vote';
import { auth } from '@clerk/nextjs/server';
import { getOrCreateUserByClerkId } from '@/lib/users';

async function getClerkUserId() {
  const { userId } = await auth();
  return userId ?? null;
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  try {
    const clerkId = await getClerkUserId();
    const { slug } = await params;
    const dataSource = await initializeDatabase();
    const quoteRepo = dataSource.getRepository<Quote>('quotes');
    const voteRepo = dataSource.getRepository<Vote>('votes');

    const quote = await quoteRepo.findOne({ where: { slug } });
    if (!quote) return NextResponse.json({ voted: false, count: 0 }, { status: 200 });

    const count = await voteRepo.count({ where: { quoteId: quote.id } });

    if (!clerkId) {
      return NextResponse.json({ voted: false, count });
    }

    const user = await getOrCreateUserByClerkId(dataSource, clerkId);
    const existing = await voteRepo.findOne({ where: { userId: user.id, quoteId: quote.id } });
    return NextResponse.json({ voted: Boolean(existing), count });
  } catch (error: unknown) {
    console.error('Error checking vote:', error);
    return NextResponse.json({ error: 'Failed to check vote' }, { status: 500 });
  }
}

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  try {
    const clerkId = await getClerkUserId();
    if (!clerkId) {
      return NextResponse.json({ error: 'Sign in to upvote' }, { status: 401 });
    }
    const { slug } = await params;
    const dataSource = await initializeDatabase();
    const user = await getOrCreateUserByClerkId(dataSource, clerkId);
    const quoteRepo = dataSource.getRepository<Quote>('quotes');
    const voteRepo = dataSource.getRepository<Vote>('votes');

    const quote = await quoteRepo.findOne({ where: { slug } });
    if (!quote) return NextResponse.json({ error: 'Quote not found' }, { status: 404 });

    const existing = await voteRepo.findOne({ where: { userId: user.id, quoteId: quote.id } });
    if (!existing) {
      await voteRepo.insert({ userId: user.id, quoteId: quote.id });
    }

    const count = await voteRepo.count({ where: { quoteId: quote.id } });
    return NextResponse.json({ voted: true, count });
  } catch (error: unknown) {
    // Handle unique constraint race: still return voted true with new count
    console.error('Error adding vote:', error);
    try {
      // Best-effort to return current count
      const dataSource = await initializeDatabase();
      const { slug } = await params;
      const quoteRepo = dataSource.getRepository<Quote>('quotes');
      const voteRepo = dataSource.getRepository<Vote>('votes');
      const quote = await quoteRepo.findOne({ where: { slug } });
      const count = quote ? await voteRepo.count({ where: { quoteId: quote.id } }) : 0;
      return NextResponse.json({ voted: true, count });
    } catch {}
    return NextResponse.json({ voted: true });
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  try {
    const clerkId = await getClerkUserId();
    if (!clerkId) {
      return NextResponse.json({ error: 'Sign in to remove vote' }, { status: 401 });
    }
    const { slug } = await params;
    const dataSource = await initializeDatabase();
    const user = await getOrCreateUserByClerkId(dataSource, clerkId);
    const quoteRepo = dataSource.getRepository<Quote>('quotes');
    const voteRepo = dataSource.getRepository<Vote>('votes');

    const quote = await quoteRepo.findOne({ where: { slug } });
    if (!quote) return NextResponse.json({ error: 'Quote not found' }, { status: 404 });

    await voteRepo.delete({ userId: user.id, quoteId: quote.id });
    const count = await voteRepo.count({ where: { quoteId: quote.id } });
    return NextResponse.json({ voted: false, count });
  } catch (error: unknown) {
    console.error('Error removing vote:', error);
    return NextResponse.json({ error: 'Failed to remove vote' }, { status: 500 });
  }
}

