import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/duckdb';

/**
 * API route to get products from the DuckDB database
 */
export async function GET(request: NextRequest) {
  try {
    // Get the limit from query parameters, default to 20
    const url = new URL(request.url);
    const limit = parseInt(url.searchParams.get('limit') || '20');
    const page = parseInt(url.searchParams.get('page') || '1');
    const offset = (page - 1) * limit;
    
    // Execute query with pagination
    const products = await db.query(
      `SELECT * FROM data_productcode LIMIT ${limit} OFFSET ${offset}`
    );
    
    // Get total count for pagination
    const countResult = await db.queryOne<{ count: number }>(
      `SELECT COUNT(*) as count FROM data_productcode`
    );
    
    const totalCount = countResult?.count || 0;
    
    return NextResponse.json({
      productCodes: products,
      totalCount,
      page,
      limit,
      totalPages: Math.ceil(totalCount / limit)
    }, {
      headers: {
        'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
      }
    });
  } catch (error) {
    console.error('Error fetching products:', error);
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : 'Unknown error',
      productCodes: [],
      totalCount: 0
    }, { status: 500 });
  }
} 