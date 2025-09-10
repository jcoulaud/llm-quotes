import { NextRequest, NextResponse } from 'next/server';
export const runtime = 'nodejs';
import { ADMIN_SESSION_COOKIE, verifySessionToken } from '@/lib/adminAuth';

export async function GET(request: NextRequest) {
  const token = request.cookies.get(ADMIN_SESSION_COOKIE)?.value;
  const session = verifySessionToken(token);
  return NextResponse.json({ authed: !!session });
}
