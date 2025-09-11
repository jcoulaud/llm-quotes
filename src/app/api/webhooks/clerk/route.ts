import { NextRequest, NextResponse } from 'next/server';
import { Webhook } from 'svix';
import { initializeDatabase } from '@/lib/db';
import type { User as UserEntity } from '../../../../entities/User';

export const runtime = 'nodejs';

function getEnv(name: string) {
  const v = process.env[name];
  if (!v) throw new Error(`Missing env: ${name}`);
  return v;
}

async function ensureUserByClerkId(clerkId: string): Promise<UserEntity> {
  const dataSource = await initializeDatabase();
  const userRepo = dataSource.getRepository<UserEntity>('users');
  const existing = await userRepo.findOne({ where: { clerkId } });
  if (existing) {
    existing.deletedAt = null;
    return await userRepo.save(existing);
  }
  const created = userRepo.create({ clerkId } as Partial<UserEntity>);
  created.deletedAt = null;
  return await userRepo.save(created);
}

export async function POST(request: NextRequest) {
  const secret = process.env.CLERK_WEBHOOK_SECRET;
  if (!secret) {
    return NextResponse.json({ error: 'Webhook not configured' }, { status: 501 });
  }

  const svixId = request.headers.get('svix-id');
  const svixTimestamp = request.headers.get('svix-timestamp');
  const svixSignature = request.headers.get('svix-signature');

  if (!svixId || !svixTimestamp || !svixSignature) {
    return NextResponse.json({ error: 'Missing Svix signature headers' }, { status: 400 });
  }

  const payload = await request.text();

  try {
    const wh = new Webhook(secret);
    wh.verify(payload, {
      'svix-id': svixId,
      'svix-timestamp': svixTimestamp,
      'svix-signature': svixSignature,
    });
  } catch (err) {
    console.error('Invalid Svix signature:', err);
    return NextResponse.json({ error: 'Invalid signature' }, { status: 403 });
  }

  let body: any;
  try {
    body = JSON.parse(payload);
  } catch (err) {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const type = body?.type as string | undefined;
  const data = body?.data ?? {};

  try {
    const dataSource = await initializeDatabase();
    const userRepo = dataSource.getRepository<UserEntity>('users');

    switch (type) {
      case 'user.created': {
        const clerkId = data?.id as string;
        if (clerkId) await ensureUserByClerkId(clerkId);
        break;
      }
      case 'user.updated': {
        const clerkId = data?.id as string;
        if (clerkId) await ensureUserByClerkId(clerkId);
        break;
      }
      case 'user.deleted': {
        const clerkId = data?.id as string;
        if (clerkId) {
          await userRepo.update({ clerkId }, { deletedAt: new Date() });
        }
        break;
      }
      case 'session.created':
      case 'session.ended':
      case 'session.revoked': {
        const clerkId = (data?.user_id || data?.userId || data?.id) as string | undefined;
        if (clerkId) {
          await userRepo.update({ clerkId }, { lastSeenAt: new Date(), deletedAt: null });
        }
        break;
      }
      default: {
        // Ignore other events for now
        break;
      }
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('Webhook handling error:', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
