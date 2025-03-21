import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/duckdb';

/**
 * API route to get product trade data from the DuckDB database
 * Supports filtering by year and pagination
 */
export async function GET(request: NextRequest) {
  try {
    // Parse query parameters
    const url = new URL(request.url);
    const limit = parseInt(url.searchParams.get('limit') || '20');
    const page = parseInt(url.searchParams.get('page') || '1');
    const year = url.searchParams.get('year') || null;
    const sort = url.searchParams.get('sort') || 'value';
    const order = url.searchParams.get('order') || 'desc';
    const offset = (page - 1) * limit;

    // Build the base query
    let query = `
      SELECT
        product_code as code,
        hs_description as name,
        SUM(trade_value_usd) as value,
        COUNT(*) as transaction_count
      FROM data_hstradedata
      WHERE 1=1
    `;

    // Add year filter if provided
    if (year && year !== 'all') {
      query += ` AND EXTRACT(YEAR FROM year) = ${year}`;
    }

    // Group by product code and add sorting and pagination
    query += `
      GROUP BY product_code, hs_description
      ORDER BY ${sort} ${order}
      LIMIT ${limit} OFFSET ${offset}
    `;

    // Execute the query
    const products = await db.query(query);

    // Get total count for pagination
    let countQuery = `
      SELECT COUNT(DISTINCT product_code) as count
      FROM data_hstradedata
    `;
    
    if (year && year !== 'all') {
      countQuery += ` WHERE EXTRACT(YEAR FROM year) = ${year}`;
    }

    const countResult = await db.queryOne<{ count: number }>(countQuery);
    const totalCount = countResult?.count || 0;

    return NextResponse.json({
      products,
      totalCount,
      page,
      limit,
      totalPages: Math.ceil(totalCount / limit),
      year: year || 'all'
    }, {
      headers: {
        'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
      }
    });
  } catch (error) {
    console.error('Error fetching product data:', error);
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : 'Unknown error',
      products: [],
      totalCount: 0
    }, { status: 500 });
  }
} 