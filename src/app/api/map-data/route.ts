import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/duckdb';
import { withCache } from '@/lib/cacheMiddleware';

/**
 * API route to get country data specifically formatted for choropleth maps
 * Supports filtering by year, metric (imports, exports, or total trade), and specified criteria
 */
async function handler(request: NextRequest) {
  try {
    // Parse query parameters
    const url = new URL(request.url);
    const year = url.searchParams.get('year') || null;
    const metric = url.searchParams.get('metric') || 'total'; // 'total', 'imports', 'exports'
    
    // Build the base query to summarize trade data for all countries
    let query = `
      SELECT
        country,
        SUM(CASE WHEN tradeflow_id = '103' THEN value ELSE 0 END) as import_value,
        SUM(CASE WHEN tradeflow_id = '102' THEN value ELSE 0 END) as export_value,
        SUM(value) as total_value,
        COUNT(*) as trade_count
      FROM data_hstradedata
    `;

    // Add year filter if provided
    if (year) {
      query += ` WHERE EXTRACT(YEAR FROM year) = ${year}`;
    }
    
    // Group by country
    query += `
      GROUP BY country
      ORDER BY 
    `;
    
    // Order by the selected metric
    if (metric === 'imports') {
      query += 'import_value DESC';
    } else if (metric === 'exports') {
      query += 'export_value DESC';
    } else {
      query += 'total_value DESC';
    }

    // Execute the query
    const countriesData = await db.query(query);

    // Calculate the min and max values for the selected metric to help with choropleth scales
    let minValue = Infinity;
    let maxValue = 0;
    
    countriesData.forEach((country: any) => {
      let value;
      if (metric === 'imports') {
        value = country.import_value;
      } else if (metric === 'exports') {
        value = country.export_value;
      } else {
        value = country.total_value;
      }
      
      if (value > 0) { // Ignore zero values when calculating minimum
        minValue = Math.min(minValue, value);
      }
      maxValue = Math.max(maxValue, value);
    });

    return NextResponse.json({
      countries: countriesData,
      metadata: {
        year: year || 'all',
        metric,
        minValue: minValue === Infinity ? 0 : minValue,
        maxValue,
        count: countriesData.length
      }
    }, {
      headers: {
        'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
      }
    });
  } catch (error) {
    console.error('Error fetching map data:', error);
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : 'Unknown error',
      countries: [],
    }, { status: 500 });
  }
}

// Wrap the handler with caching middleware - cache for 24 hours for map data
export const GET = withCache(handler, { 
  prefix: 'map-data:',
  ttl: 86400, // 24 hours
}); 