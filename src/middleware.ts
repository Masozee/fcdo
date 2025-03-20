import { NextRequest, NextResponse } from 'next/server';

export function middleware(request: NextRequest) {
  // Handle API requests through Hono
  if (request.nextUrl.pathname.startsWith('/api/')) {
    // Forward to Hono handler
    return NextResponse.next();
  }

  // For non-API requests, continue normal Next.js processing
  return NextResponse.next();
}

// Configure the middleware to run on specific paths
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
}; 