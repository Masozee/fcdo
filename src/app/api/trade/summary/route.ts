import { NextResponse } from 'next/server';
import { openDb } from '@/lib/sqlite';

/**
 * API route to get Indonesian trade summary data from the SQLite database
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const year = searchParams.get('year');
    const region = searchParams.get('region'); // Filter by region

    const db = await openDb();
    
    // Get total trade value by country
    let countryQuery = `
      SELECT 
        h.country,
        cc."name" as country_name,
        cc."region" as country_region,
        cc."sub-region" as country_sub_region,
        SUM(CASE WHEN h.tradeflow_id = 3 THEN h.value ELSE 0 END) as exports,
        SUM(CASE WHEN h.tradeflow_id = 101 THEN h.value ELSE 0 END) as imports,
        SUM(h.value) as total_trade
      FROM data_hstradedata h
      LEFT JOIN country_code cc ON h.country = cc."alpha-2"
      WHERE 1=1
    `;
    
    // Add filters
    const params: any[] = [];
    
    if (year) {
      countryQuery += ` AND strftime('%Y', h.year) = ?`;
      params.push(year);
    }
    
    if (region) {
      countryQuery += ` AND cc."region" = ?`;
      params.push(region);
    }
    
    countryQuery += `
      GROUP BY h.country, cc."name", cc."region", cc."sub-region"
      ORDER BY total_trade DESC
      LIMIT 10
    `;

    // Get top traded products
    let productQuery = `
      SELECT 
        p.code,
        p.name,
        SUM(CASE WHEN h.tradeflow_id = 3 THEN h.value ELSE 0 END) as exports,
        SUM(CASE WHEN h.tradeflow_id = 101 THEN h.value ELSE 0 END) as imports,
        SUM(h.value) as total_trade
      FROM data_hstradedata h
      LEFT JOIN data_productcode p ON h.category_id = p.id
      WHERE 1=1
    `;
    
    // Add year filter
    if (year) {
      productQuery += ` AND strftime('%Y', h.year) = ?`;
      params.push(year);
    }
    
    productQuery += `
      GROUP BY p.code, p.name
      ORDER BY total_trade DESC
      LIMIT 10
    `;

    // Get regional trade summary
    const regionQuery = `
      SELECT 
        cc."region",
        SUM(CASE WHEN h.tradeflow_id = 3 THEN h.value ELSE 0 END) as exports,
        SUM(CASE WHEN h.tradeflow_id = 101 THEN h.value ELSE 0 END) as imports,
        SUM(h.value) as total_trade
      FROM data_hstradedata h
      LEFT JOIN country_code cc ON h.country = cc."alpha-2"
      WHERE cc."region" IS NOT NULL
      ${year ? 'AND strftime(\'%Y\', h.year) = ?' : ''}
      GROUP BY cc."region"
      ORDER BY total_trade DESC
    `;

    const [topCountries, topProducts, regionSummary] = await Promise.all([
      db.all(countryQuery, [...params]),
      db.all(productQuery, year ? [year] : []),
      db.all(regionQuery, year ? [year] : [])
    ]);

    await db.close();

    return NextResponse.json({
      success: true,
      data: {
        topCountries,
        topProducts,
        regionSummary,
        metadata: {
          year: year || 'all years',
          region: region || 'all regions'
        }
      }
    });

  } catch (error) {
    console.error('Error fetching trade summary:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch trade summary' },
      { status: 500 }
    );
  }
} 