import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/duckdb';

// Fallback API URL in case we need to proxy to the standalone server
const DUCKDB_API_BASE_URL = 'http://localhost:4000';

// Map of endpoints that we've implemented directly in Next.js
const IMPLEMENTED_ENDPOINTS = new Set([
  'tables',
  'products',
  'trade',
  'export',
  'import',
  'total-trade',
  'countries'
]);

/**
 * Proxy handler for all DuckDB API requests
 * This tries to use our direct implementation first, falling back to the standalone API if needed
 */
export async function GET(request: NextRequest, { params }: { params: { path: string[] } }) {
  // Make sure we have params before accessing it
  const pathSegments = await Promise.resolve(params.path);
  const path = pathSegments.join('/');
  
  // First, check if we have a direct implementation for this endpoint
  if (IMPLEMENTED_ENDPOINTS.has(pathSegments[0])) {
    console.log(`Using direct DuckDB implementation for: ${path}`);
    // The request will be automatically routed to the appropriate endpoint
    // by Next.js based on the URL structure
    return;
  }
  
  // Otherwise, proxy to the standalone API
  const searchParams = request.nextUrl.searchParams.toString();
  const url = `${DUCKDB_API_BASE_URL}/${path}${searchParams ? `?${searchParams}` : ''}`;
  
  console.log(`Proxying GET request to DuckDB API: ${url}`);
  
  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    const data = await response.json();
    
    return NextResponse.json(data, {
      status: response.status,
      headers: {
        'Cache-Control': 'public, s-maxage=10, stale-while-revalidate=60',
      }
    });
  } catch (error) {
    console.error(`Error proxying to DuckDB API: ${error}`);
    
    // Try to use our direct implementation as a last resort
    try {
      if (path.startsWith('test/tables')) {
        const tables = await db.query(`SHOW TABLES`);
        return NextResponse.json({ tables });
      } else if (path.startsWith('test/product')) {
        const limit = parseInt(path.split('/')[2] || '5');
        const products = await db.query(`SELECT * FROM data_productcode LIMIT ${limit}`);
        return NextResponse.json({ products, count: products.length });
      } else if (path.startsWith('test/trade')) {
        const limit = parseInt(path.split('/')[2] || '5');
        const trades = await db.query(`SELECT * FROM data_hstradedata LIMIT ${limit}`);
        return NextResponse.json({ trades, count: trades.length });
      }
    } catch (directError) {
      console.error(`Failed direct implementation fallback: ${directError}`);
    }
    
    return NextResponse.json(
      { error: 'Failed to fetch data from DuckDB API' },
      { status: 500 }
    );
  }
}

/**
 * POST handler for the DuckDB API proxy
 */
export async function POST(request: NextRequest, { params }: { params: { path: string[] } }) {
  // Make sure we have params before accessing it
  const pathSegments = await Promise.resolve(params.path);
  const path = pathSegments.join('/');
  const url = `${DUCKDB_API_BASE_URL}/${path}`;
  
  console.log(`Proxying POST request to DuckDB API: ${url}`);
  
  try {
    const body = await request.json();
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });
    
    const data = await response.json();
    
    return NextResponse.json(data, {
      status: response.status,
    });
  } catch (error) {
    console.error(`Error proxying to DuckDB API: ${error}`);
    return NextResponse.json(
      { error: 'Failed to post data to DuckDB API' },
      { status: 500 }
    );
  }
} 