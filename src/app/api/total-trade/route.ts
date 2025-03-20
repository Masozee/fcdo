import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/duckdb';

/**
 * API route to get total trade data (both imports and exports) from the DuckDB database
 * Supports filtering by year and aggregation by country
 */
export async function GET(request: NextRequest) {
  try {
    // Parse query parameters
    const url = new URL(request.url);
    const limit = parseInt(url.searchParams.get('limit') || '20');
    const page = parseInt(url.searchParams.get('page') || '1');
    const year = url.searchParams.get('year') || null;
    const offset = (page - 1) * limit;

    // Build the base query to summarize trade data
    let query = `
      SELECT
        country,
        SUM(CASE WHEN tradeflow_id = '103' THEN value ELSE 0 END) as import_value,
        SUM(CASE WHEN tradeflow_id = '102' THEN value ELSE 0 END) as export_value,
        SUM(value) as total_value,
        MIN(year) as min_year,
        MAX(year) as max_year,
        COUNT(*) as trade_count
      FROM data_hstradedata
    `;

    // Add year filter if provided
    let whereClause = '';
    if (year) {
      whereClause = ` WHERE EXTRACT(YEAR FROM year) = ${year}`;
    }
    
    query += whereClause;
    
    // Group by country and add pagination
    query += `
      GROUP BY country
      ORDER BY total_value DESC
      LIMIT ${limit} OFFSET ${offset}
    `;

    // Execute the query
    const tradeSummary = await db.query(query);

    // Get total count for pagination (count of unique countries)
    let countQuery = `
      SELECT COUNT(DISTINCT country) as count
      FROM data_hstradedata
    `;

    if (year) {
      countQuery += whereClause;
    }

    const countResult = await db.queryOne<{ count: number }>(countQuery);
    const totalCount = countResult?.count || 0;

    return NextResponse.json({
      tradeSummary,
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
    console.error('Error fetching total trade data:', error);
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : 'Unknown error',
      tradeSummary: [],
      totalCount: 0
    }, { status: 500 });
  }
} 