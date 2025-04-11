import { NextRequest, NextResponse } from 'next/server';
import { openDb } from '@/lib/sqlite';

/**
 * API route to get trade data for all countries
 * Returns each country with its exports, imports, and total trade values
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const year = searchParams.get('year');
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit') as string) : 250;
    const offset = searchParams.get('offset') ? parseInt(searchParams.get('offset') as string) : 0;
    
    console.log('Countries Trade API Request Params:', { year, limit, offset });

    const db = await openDb();
    console.log('Database connection opened');
    
    // Build the query to get trade data for all countries
    let query = `
      SELECT 
        h.country,
        cc."name" as country_name,
        cc."region" as region,
        cc."sub-region" as sub_region,
        SUM(CASE WHEN h.tradeflow_id = 103 THEN h.value ELSE 0 END) as exports,
        SUM(CASE WHEN h.tradeflow_id = 102 THEN h.value ELSE 0 END) as imports,
        SUM(h.value) as total_trade
      FROM data_hstradedata h
      LEFT JOIN country_code cc ON h.country = cc."alpha-2"
      WHERE 1=1
    `;
    
    const params: any[] = [];
    
    // Add year filter if provided
    if (year) {
      query += ` AND h.year = ?`;
      params.push(`${year}-01-01`);
    }
    
    // Group by and order the results
    query += `
      GROUP BY h.country, cc."name", cc."region", cc."sub-region"
      ORDER BY total_trade DESC
      LIMIT ? OFFSET ?
    `;
    
    params.push(limit, offset);
    
    console.log('Countries trade query:', query);
    console.log('Countries trade params:', params);
    
    let countriesData;
    try {
      countriesData = await db.all(query, params);
      console.log('Countries data results count:', countriesData.length);
      console.log('First country result:', countriesData[0] || 'No results');
    } catch (error) {
      console.error('Error executing countries trade query:', error);
      throw error;
    }
    
    // Get total number of countries for pagination
    const countQuery = `
      SELECT COUNT(DISTINCT h.country) as total
      FROM data_hstradedata h
      WHERE 1=1
      ${year ? 'AND h.year = ?' : ''}
    `;
    
    const countParams = year ? [`${year}-01-01`] : [];
    
    let totalCount;
    try {
      const countResult = await db.get(countQuery, countParams);
      totalCount = countResult?.total || 0;
      console.log('Total countries count:', totalCount);
    } catch (error) {
      console.error('Error executing count query:', error);
      throw error;
    }
    
    // Calculate global totals
    const totalsQuery = `
      SELECT 
        SUM(CASE WHEN h.tradeflow_id = 103 THEN h.value ELSE 0 END) as total_exports,
        SUM(CASE WHEN h.tradeflow_id = 102 THEN h.value ELSE 0 END) as total_imports,
        SUM(h.value) as total_trade
      FROM data_hstradedata h
      WHERE 1=1
      ${year ? 'AND h.year = ?' : ''}
    `;
    
    const totalsParams = year ? [`${year}-01-01`] : [];
    
    let globalTotals;
    try {
      globalTotals = await db.get(totalsQuery, totalsParams);
      console.log('Global totals:', globalTotals);
    } catch (error) {
      console.error('Error executing totals query:', error);
      throw error;
    }
    
    await db.close();
    console.log('Database connection closed');
    
    const response = {
      success: true,
      data: {
        countries: countriesData,
        globalTotals: globalTotals
      },
      metadata: {
        filters: {
          year: year || 'all'
        },
        pagination: {
          total: totalCount,
          limit,
          offset,
          hasMore: offset + countriesData.length < totalCount
        }
      }
    };
    
    console.log('Sending successful response');
    return NextResponse.json(response);
    
  } catch (error) {
    console.error('Error fetching countries trade data:', error);
    return NextResponse.json(
      { 
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch countries trade data'
      },
      { status: 500 }
    );
  }
} 