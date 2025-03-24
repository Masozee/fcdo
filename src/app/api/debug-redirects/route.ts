import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  return NextResponse.json({
    message: "If you're seeing this directly, Next.js routing is handling the request instead of server.js",
    timestamp: new Date().toISOString(),
    path: request.nextUrl.pathname,
    note: "The /strategicdependencyreport path should be redirected by server.js before reaching Next.js"
  });
} 