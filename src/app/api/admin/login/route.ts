import { NextRequest, NextResponse } from 'next/server';
export const runtime = 'nodejs';
import { ADMIN_SESSION_COOKIE, createSessionToken, getClientIp } from '@/lib/adminAuth';
import { checkLoginLimit, recordLoginAttempt } from '@/lib/loginLimiter';

export async function POST(request: NextRequest) {
  try {
    const { username, password } = await request.json();

    // Basic origin check to reduce CSRF risk on login
    const origin = request.headers.get('origin');
    const expectedOrigin = request.nextUrl.origin;
    if (origin && origin !== expectedOrigin) {
      return NextResponse.json({ error: 'Invalid origin' }, { status: 400 });
    }

    // Rate limit by IP
    const ip = getClientIp(request.headers);
    const limit = checkLoginLimit(ip);
    if (!limit.allowed) {
      return NextResponse.json({ error: 'Too many attempts. Try again later.' }, { status: 429 });
    }
    recordLoginAttempt(ip);

    const adminUsername = process.env.ADMIN_USERNAME || 'admin';
    const adminPassword = process.env.ADMIN_PASSWORD || 'changeme123';

    if (username !== adminUsername || password !== adminPassword) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    const token = createSessionToken(username);
    const res = NextResponse.json({ success: true });
    res.cookies.set({
      name: ADMIN_SESSION_COOKIE,
      value: token,
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      path: '/',
      maxAge: 60 * 60 * 6, // 6 hours
    });
    return res;
  } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }
}
