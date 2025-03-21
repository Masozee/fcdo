import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/duckdb';

/**
 * API route to get trade trends data from the DuckDB database
 * Supports filtering by year and shows yearly aggregated data
 */
export async function GET(request: NextRequest) {
  try {
    // Parse query parameters
    const url = new URL(request.url);
    const limit = parseInt(url.searchParams.get('limit') || '10');
    const page = parseInt(url.searchParams.get('page') || '1');
    const sort = url.searchParams.get('sort') || 'year';
    const order = url.searchParams.get('order') || 'desc';
    const offset = (page - 1) * limit;

    // Build the base query to get yearly trends
    let query = `
      SELECT
        EXTRACT(YEAR FROM year) as year,
        SUM(CASE WHEN tradeflow_id = '103' THEN trade_value_usd ELSE 0 END) as import_value,
        SUM(CASE WHEN tradeflow_id = '102' THEN trade_value_usd ELSE 0 END) as export_value,
        SUM(trade_value_usd) as total_value,
        COUNT(*) as trade_count
      FROM data_hstradedata
      GROUP BY EXTRACT(YEAR FROM year)
      ORDER BY ${sort} ${order}
      LIMIT ${limit} OFFSET ${offset}
    `;

    // Execute the query
    const trends = await db.query(query);

    // Get total count for pagination
    const countQuery = `
      SELECT COUNT(DISTINCT EXTRACT(YEAR FROM year)) as count
      FROM data_hstradedata
    `;

    const countResult = await db.queryOne<{ count: number }>(countQuery);
    const totalCount = countResult?.count || 0;

    return NextResponse.json({
      trends,
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
    console.error('Error fetching trade trends data:', error);
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : 'Unknown error',
      trends: [],
      totalCount: 0
    }, { status: 500 });
  }
} 