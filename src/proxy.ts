import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { ADMIN_SESSION_COOKIE } from '@/lib/adminConstants';
import { verifySessionTokenEdge } from '@/lib/adminAuthEdge';
import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';

const favoritesMatcher = createRouteMatcher(['/favorites(.*)']);
const apiFavoritesMatcher = createRouteMatcher(['/api/favorites(.*)']);
const votesMatcher = createRouteMatcher(['/upvotes(.*)']);
const apiVotesMatcher = createRouteMatcher(['/api/votes(.*)']);

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

// Use Clerk proxy when configured; otherwise, fall back to admin-only protection
export const proxy = hasClerk
  ? clerkMiddleware(
      async (auth, request) => {
        // Protect favorites and votes pages and APIs with Clerk
        // Favorites pages + API always require auth
        if (favoritesMatcher(request) || apiFavoritesMatcher(request)) {
          await auth.protect();
        }
        // Upvotes page requires auth
        if (votesMatcher(request)) {
          await auth.protect();
        }
        // Votes API: allow GET for public counts, require auth for mutating actions
        if (apiVotesMatcher(request) && request.method !== 'GET') {
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
  : async function proxy(request: NextRequest) {
      // No Clerk configured: keep admin protection only
      const adminResult = await handleAdminProtection(request);
      return adminResult ?? NextResponse.next();
    };

export const config = {
  matcher: [
    '/admin/:path*',
    '/favorites/:path*',
    '/api/favorites/:path*',
    // Ensure Clerk runs on quotes APIs so auth() works and
    // list endpoints can return user-specific flags (e.g., votedByMe)
    '/api/quotes/:path*',
    '/upvotes/:path*',
    '/api/votes/:path*',
  ],
};
