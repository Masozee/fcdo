import { NextRequest, NextResponse } from 'next/server';
import { openDb } from '@/lib/sqlite';

/**
 * API route to get summary trade data for all countries 
 * Returns each country with its exports, imports, and total trade values in a simplified format
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const year = searchParams.get('year');
    
    console.log('Countries Summary API Request Params:', { year });

    const db = await openDb();
    console.log('Database connection opened');
    
    // Build the query to get summary trade data for all countries
    let query = `
      SELECT 
        h.country as code,
        cc."name" as name,
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
    `;
    
    console.log('Countries summary query:', query);
    console.log('Countries summary params:', params);
    
    let countriesData;
    try {
      countriesData = await db.all(query, params);
      console.log('Countries summary results count:', countriesData.length);
    } catch (error) {
      console.error('Error executing countries summary query:', error);
      throw error;
    }
    
    await db.close();
    console.log('Database connection closed');
    
    const response = {
      success: true,
      data: countriesData,
      metadata: {
        filters: {
          year: year || 'all'
        },
        count: countriesData.length
      }
    };
    
    console.log('Sending successful response');
    return NextResponse.json(response);
    
  } catch (error) {
    console.error('Error fetching countries summary data:', error);
    return NextResponse.json(
      { 
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch countries summary data'
      },
      { status: 500 }
    );
  }
} 