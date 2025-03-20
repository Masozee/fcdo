import { NextResponse } from 'next/server';
import db from '@/lib/duckdb';

/**
 * API route to list all tables in the DuckDB database
 */
export async function GET() {
  try {
    const tables = await db.query(`SHOW TABLES`);
    return NextResponse.json({ tables }, {
      headers: {
        'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
      }
    });
  } catch (error) {
    console.error('Error fetching tables:', error);
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
} 