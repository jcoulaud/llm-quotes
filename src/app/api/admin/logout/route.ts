import { NextResponse } from 'next/server';
import { ADMIN_SESSION_COOKIE } from '@/lib/adminAuth';

export async function POST() {
  const res = NextResponse.json({ success: true });
  res.cookies.set({
    name: ADMIN_SESSION_COOKIE,
    value: '',
    maxAge: 0,
    path: '/',
  });
  return res;
}
