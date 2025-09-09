import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { ADMIN_SESSION_COOKIE } from '@/lib/adminConstants';
import { verifySessionTokenEdge } from '@/lib/adminAuthEdge';

export async function middleware(request: NextRequest) {
  if (request.nextUrl.pathname.startsWith('/admin')) {
    const isLoginPage = request.nextUrl.pathname === '/admin/login';
    const token = request.cookies.get(ADMIN_SESSION_COOKIE)?.value;
    const ok = await verifySessionTokenEdge(token);

    // Redirect logged-in users away from the login page
    if (isLoginPage && ok) {
      const url = new URL('/admin', request.url);
      return NextResponse.redirect(url);
    }

    // Redirect unauthenticated users trying to access /admin (except /admin/login)
    if (!isLoginPage && !ok) {
      const url = new URL('/admin/login', request.url);
      url.searchParams.set('next', request.nextUrl.pathname + request.nextUrl.search);
      return NextResponse.redirect(url);
    }

    // Otherwise allow through
    return NextResponse.next();
  }
  return NextResponse.next();
}

export const config = {
  matcher: '/admin/:path*',
};
