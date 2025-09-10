import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { ADMIN_SESSION_COOKIE } from '@/lib/adminConstants';
import { verifySessionTokenEdge } from '@/lib/adminAuthEdge';
import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';

const favoritesMatcher = createRouteMatcher(['/favorites(.*)']);

// Helper: our existing admin auth logic
async function handleAdminProtection(request: NextRequest) {
  if (!request.nextUrl.pathname.startsWith('/admin')) return null;
  const isLoginPage = request.nextUrl.pathname === '/admin/login';
  const token = request.cookies.get(ADMIN_SESSION_COOKIE)?.value;
  const ok = await verifySessionTokenEdge(token);

  if (isLoginPage && ok) {
    const url = new URL('/admin', request.url);
    return NextResponse.redirect(url);
  }

  if (!isLoginPage && !ok) {
    const url = new URL('/admin/login', request.url);
    url.searchParams.set('next', request.nextUrl.pathname + request.nextUrl.search);
    return NextResponse.redirect(url);
  }
  return NextResponse.next();
}

const hasClerk = Boolean(process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY);

// Use Clerk middleware when configured; otherwise, fall back to admin-only protection
export default hasClerk
  ? clerkMiddleware(
      async (auth, request) => {
        // Protect favorites with Clerk
        if (favoritesMatcher(request)) {
          await auth.protect();
        }

        // Preserve existing /admin protection
        const adminResult = await handleAdminProtection(request);
        return adminResult ?? NextResponse.next();
      },
      {
        // Ensure redirects go to our in-app routes, not accounts.dev
        signInUrl: '/sign-in',
        signUpUrl: '/sign-up',
      },
    )
  : async function middleware(request: NextRequest) {
      // No Clerk configured: keep admin protection only
      const adminResult = await handleAdminProtection(request);
      return adminResult ?? NextResponse.next();
    };

export const config = {
  matcher: ['/admin/:path*', '/favorites/:path*'],
};
