/**
 * Vercel Edge Middleware for Basic Authentication
 * 
 * This file is used by Vercel's Edge Runtime and is not part of the main application build.
 * The Next.js types are provided by Vercel at runtime.
 * 
 * @see https://vercel.com/docs/concepts/functions/edge-middleware
 */

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};

export function middleware(request: NextRequest) {
  const basicAuth = request.headers.get('authorization');

  if (basicAuth) {
    const authValue = basicAuth.split(' ')[1];
    try {
      const [user, pwd] = atob(authValue).split(':');

      const validUser = process.env.BASIC_AUTH_USER || 'admin';
      const validPassword = process.env.BASIC_AUTH_PASSWORD || 'password';

      if (user === validUser && pwd === validPassword) {
        return NextResponse.next();
      }
    } catch (error) {
      // Invalid base64 or malformed auth header
      console.error('Auth error:', error);
    }
  }

  return new NextResponse('Authentication required', {
    status: 401,
    headers: {
      'WWW-Authenticate': 'Basic realm="Secure Area"',
    },
  });
}
