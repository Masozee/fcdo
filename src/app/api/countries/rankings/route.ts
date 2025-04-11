import { NextRequest, NextResponse } from 'next/server';
import { openDb } from '@/lib/sqlite';

/**
 * API route to get trade rankings for countries
 * Returns top countries ranked by imports, exports, and total trade
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const year = searchParams.get('year');
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit') as string) : 20;
    const type = searchParams.get('type') || 'all'; // Can be 'imports', 'exports', 'total'
    
    console.log('Countries Rankings API Request Params:', { year, limit, type });

    const db = await openDb();
    console.log('Database connection opened');
    
    // Base query to gather trade data by country
    const baseQuery = `
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
      ${year ? 'AND h.year = ?' : ''}
      GROUP BY h.country, cc."name", cc."region", cc."sub-region"
    `;
    
    const params = year ? [`${year}-01-01`] : [];
    
    // Get top exporters
    let topExporters;
    if (type === 'all' || type === 'exports') {
      const exportersQuery = `${baseQuery} ORDER BY exports DESC LIMIT ?`;
      const exportersParams = [...params, limit];
      
      try {
        topExporters = await db.all(exportersQuery, exportersParams);
        console.log('Top exporters count:', topExporters.length);
      } catch (error) {
        console.error('Error executing top exporters query:', error);
        throw error;
      }
    }
    
    // Get top importers
    let topImporters;
    if (type === 'all' || type === 'imports') {
      const importersQuery = `${baseQuery} ORDER BY imports DESC LIMIT ?`;
      const importersParams = [...params, limit];
      
      try {
        topImporters = await db.all(importersQuery, importersParams);
        console.log('Top importers count:', topImporters.length);
      } catch (error) {
        console.error('Error executing top importers query:', error);
        throw error;
      }
    }
    
    // Get top total traders
    let topTraders;
    if (type === 'all' || type === 'total') {
      const tradersQuery = `${baseQuery} ORDER BY total_trade DESC LIMIT ?`;
      const tradersParams = [...params, limit];
      
      try {
        topTraders = await db.all(tradersQuery, tradersParams);
        console.log('Top traders count:', topTraders.length);
      } catch (error) {
        console.error('Error executing top traders query:', error);
        throw error;
      }
    }
    
    await db.close();
    console.log('Database connection closed');
    
    const response = {
      success: true,
      data: {
        ...(topExporters && { topExporters }),
        ...(topImporters && { topImporters }),
        ...(topTraders && { topTraders })
      },
      metadata: {
        filters: {
          year: year || 'all',
          limit,
          type
        }
      }
    };
    
    console.log('Sending successful response');
    return NextResponse.json(response);
    
  } catch (error) {
    console.error('Error fetching countries rankings data:', error);
    return NextResponse.json(
      { 
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch countries rankings data'
      },
      { status: 500 }
    );
  }
} 