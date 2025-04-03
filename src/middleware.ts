import { NextResponse } from "next/server";
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Create a response with proper CSP headers
  const response = NextResponse.next();

  // Set security headers
  response.headers.set(
    'Content-Security-Policy',
    "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.googletagmanager.com https://*.vercel-scripts.com; connect-src 'self' https://*.vercel-scripts.com https://*.vercel-insights.com https://*.vercel-analytics.com https://*.google-analytics.com; img-src 'self' data: https://flagcdn.com https://*.githubusercontent.com https://*.github.io https://*.googleusercontent.com https://*.jsdelivr.net; style-src 'self' 'unsafe-inline'; font-src 'self' data: https://fonts.gstatic.com;"
  );
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');

  return response;
}

// Match all request paths except for static files and APIs that need special handling
export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|public/).*)',
  ],
};
