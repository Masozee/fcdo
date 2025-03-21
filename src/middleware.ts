import { NextRequest, NextResponse } from 'next/server';

export function middleware(request: NextRequest) {
  // Skip processing for DuckDB API routes
  if (request.nextUrl.pathname.startsWith('/api/duckdb/')) {
    return NextResponse.next();
  }

  // Skip processing for our new direct API routes
  if (request.nextUrl.pathname.match(/^\/api\/(export|import|total-trade|countries|country)$/)) {
    return NextResponse.next();
  }

  // Skip processing for country-specific routes
  if (request.nextUrl.pathname.startsWith('/api/country/')) {
    return NextResponse.next();
  }

  // Handle other API requests through Hono
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
     * - api/duckdb/ (DuckDB API routes)
     * - api/export, api/import, api/total-trade, api/countries (Direct API routes)
     * - api/country/ (Country API routes)
     */
    '/((?!_next/static|_next/image|favicon.ico|api/duckdb/|api/export|api/import|api/total-trade|api/countries|api/country/).*)',
  ],
}; 