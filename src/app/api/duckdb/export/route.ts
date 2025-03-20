import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/duckdb';

/**
 * API route to get export data from the DuckDB database
 * Supports filtering by year
 */
export async function GET(request: NextRequest) {
  try {
    // Parse query parameters
    const url = new URL(request.url);
    const limit = parseInt(url.searchParams.get('limit') || '20');
    const page = parseInt(url.searchParams.get('page') || '1');
    const year = url.searchParams.get('year') || null;
    const offset = (page - 1) * limit;

    // Build the base query with export filter (tradeflow_id 102 means export)
    let query = `
      SELECT
        id,
        country,
        value,
        percent_trade,
        category_id,
        total_trade,
        year
      FROM data_hstradedata
      WHERE tradeflow_id = '102'
    `;

    // Add year filter if provided
    if (year) {
      query += ` AND EXTRACT(YEAR FROM year) = ${year}`;
    }

    // Add pagination
    query += ` ORDER BY value DESC LIMIT ${limit} OFFSET ${offset}`;

    // Execute the query
    const exports = await db.query(query);

    // Get total count for pagination
    let countQuery = `
      SELECT COUNT(*) as count
      FROM data_hstradedata
      WHERE tradeflow_id = '102'
    `;

    if (year) {
      countQuery += ` AND EXTRACT(YEAR FROM year) = ${year}`;
    }

    const countResult = await db.queryOne<{ count: number }>(countQuery);
    const totalCount = countResult?.count || 0;

    return NextResponse.json({
      exports,
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
    console.error('Error fetching export data:', error);
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : 'Unknown error',
      exports: [],
      totalCount: 0
    }, { status: 500 });
  }
} 