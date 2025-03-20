import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/duckdb';

/**
 * API route to get country trade data from the DuckDB database
 * Supports filtering by year, country, and trade type (import/export)
 */
export async function GET(request: NextRequest) {
  try {
    // Parse query parameters
    const url = new URL(request.url);
    const limit = parseInt(url.searchParams.get('limit') || '20');
    const page = parseInt(url.searchParams.get('page') || '1');
    const year = url.searchParams.get('year') || null;
    const country = url.searchParams.get('country') || null;
    const tradeType = url.searchParams.get('trade_type') || null; // 'import', 'export', or null for all
    const offset = (page - 1) * limit;

    // Build the base query
    let query = `
      SELECT
        id,
        country,
        value,
        percent_trade,
        category_id,
        tradeflow_id,
        total_trade,
        year
      FROM data_hstradedata
      WHERE 1=1
    `;

    // Add filters based on query parameters
    const conditions = [];
    
    if (year) {
      conditions.push(`EXTRACT(YEAR FROM year) = ${year}`);
    }
    
    if (country) {
      conditions.push(`LOWER(country) = LOWER('${country}')`);
    }
    
    if (tradeType === 'import') {
      conditions.push(`tradeflow_id = '103'`);
    } else if (tradeType === 'export') {
      conditions.push(`tradeflow_id = '102'`);
    }
    
    if (conditions.length > 0) {
      query += ` AND ${conditions.join(' AND ')}`;
    }

    // Add pagination and sorting
    query += ` ORDER BY value DESC LIMIT ${limit} OFFSET ${offset}`;

    // Execute the query
    const countries = await db.query(query);

    // Get total count for pagination
    let countQuery = `
      SELECT COUNT(*) as count
      FROM data_hstradedata
      WHERE 1=1
    `;
    
    if (conditions.length > 0) {
      countQuery += ` AND ${conditions.join(' AND ')}`;
    }

    const countResult = await db.queryOne<{ count: number }>(countQuery);
    const totalCount = countResult?.count || 0;

    return NextResponse.json({
      countries,
      totalCount,
      page,
      limit,
      totalPages: Math.ceil(totalCount / limit),
      filters: {
        year: year || 'all',
        country: country || 'all',
        tradeType: tradeType || 'all'
      }
    }, {
      headers: {
        'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
      }
    });
  } catch (error) {
    console.error('Error fetching country data:', error);
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : 'Unknown error',
      countries: [],
      totalCount: 0
    }, { status: 500 });
  }
} 