import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Check if the request is for the admin route
  if (request.nextUrl.pathname.startsWith('/admin')) {
    const authHeader = request.headers.get('authorization');
    
    if (!authHeader) {
      return new NextResponse('Authentication required', {
        status: 401,
        headers: {
          'WWW-Authenticate': 'Basic realm="Admin Access"',
        },
      });
    }

    const [scheme, encoded] = authHeader.split(' ');
    
    if (scheme !== 'Basic') {
      return new NextResponse('Invalid authentication', { status: 401 });
    }

    const decoded = Buffer.from(encoded, 'base64').toString();
    const [username, password] = decoded.split(':');

    // Simple authentication - in production, use proper auth
    const adminPassword = process.env.ADMIN_PASSWORD || 'changeme123';
    
    if (username !== 'admin' || password !== adminPassword) {
      return new NextResponse('Invalid credentials', {
        status: 401,
        headers: {
          'WWW-Authenticate': 'Basic realm="Admin Access"',
        },
      });
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: '/admin/:path*',
};