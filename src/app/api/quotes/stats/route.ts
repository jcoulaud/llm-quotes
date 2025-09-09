import { NextRequest, NextResponse } from 'next/server';
import { initializeDatabase } from '@/lib/db';
import { Quote } from '@/entities/Quote';
import { ADMIN_SESSION_COOKIE, verifySessionToken } from '@/lib/adminAuth';

export async function GET(request: NextRequest) {
  try {
    // Admin-only
    const token = request.cookies.get(ADMIN_SESSION_COOKIE)?.value;
    const session = verifySessionToken(token);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const dataSource = await initializeDatabase();
    const repo = dataSource.getRepository(Quote);

    // Aggregate counts per status
    const raw = await repo
      .createQueryBuilder('q')
      .select('q.status', 'status')
      .addSelect('COUNT(*)', 'count')
      .groupBy('q.status')
      .getRawMany<{ status: string; count: string }>();

    const counts: Record<string, number> = {
      pending: 0,
      approved: 0,
      scheduled: 0,
      posted: 0,
      rejected: 0,
      total: 0,
    };

    for (const row of raw) {
      const c = Number(row.count) || 0;
      counts[row.status] = c;
      counts.total += c;
    }

    // Scheduled and due now (optional helpful KPI)
    const now = new Date();
    const due = await repo
      .createQueryBuilder('q')
      .where('q.status = :status', { status: 'scheduled' })
      .andWhere('q.scheduledFor <= :now', { now })
      .getCount();

    return NextResponse.json({ counts: { ...counts, scheduledDue: due } });
  } catch (error) {
    console.error('Error fetching quote stats:', error);
    return NextResponse.json({ error: 'Failed to fetch stats' }, { status: 500 });
  }
}

