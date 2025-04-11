import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/duckdb';
import { 
  CountryApiResponse, 
  CountrySummary,
  YearlyTrend,
  ProductData,
  TradeFlow,
  ProductCategory
} from '@/types/country-api';
import { RouteHandlerContext } from '@/types/next';

type CountryParams = {
  code: string;
};

/**
 * API route to get comprehensive data for a specific country by ISO code
 * Combines aggregate stats with detailed breakdowns by trade type, product categories, and time periods
 */
export async function GET(
  request: NextRequest,
  { params }: RouteHandlerContext<CountryParams>
) {
  try {
    // Extract country code from the context params
    const countryCode = params.code.toUpperCase();
    
    // Parse query parameters
    const url = new URL(request.url);
    const year = url.searchParams.get('year') || null;
    const includeProducts = url.searchParams.get('include_products') === 'true';
    const productLimit = parseInt(url.searchParams.get('product_limit') || '10');
    
    // Build year condition for queries
    const yearCondition = year ? `AND EXTRACT(YEAR FROM year) = ${year}` : '';
    
    // 1. Get country summary (total trade, imports, exports)
    const summaryQuery = `
      SELECT
        country,
        SUM(CASE WHEN tradeflow_id = '103' THEN value ELSE 0 END) as import_value,
        SUM(CASE WHEN tradeflow_id = '102' THEN value ELSE 0 END) as export_value,
        SUM(value) as total_value,
        MIN(year) as min_year,
        MAX(year) as max_year,
        COUNT(*) as trade_count
      FROM data_hstradedata
      WHERE country = '${countryCode}'
      ${yearCondition}
      GROUP BY country
    `;
    
    const countrySummary = await db.queryOne<CountrySummary>(summaryQuery);
    
    if (!countrySummary) {
      return NextResponse.json(
        { error: `No data found for country code: ${countryCode}` },
        { status: 404 }
      );
    }
    
    // 2. Get yearly data for trends
    const yearlyQuery = `
      SELECT
        EXTRACT(YEAR FROM year) as year,
        SUM(CASE WHEN tradeflow_id = '103' THEN value ELSE 0 END) as import_value,
        SUM(CASE WHEN tradeflow_id = '102' THEN value ELSE 0 END) as export_value,
        SUM(value) as total_value,
        COUNT(*) as trade_count
      FROM data_hstradedata
      WHERE country = '${countryCode}'
      GROUP BY EXTRACT(YEAR FROM year)
      ORDER BY year DESC
    `;
    
    const yearlyData = await db.query<YearlyTrend>(yearlyQuery);
    
    // Initialize response object
    const response: CountryApiResponse = {
      countryCode,
      summary: countrySummary,
      yearlyTrends: yearlyData,
      tradeFlows: []
    };
    
    // 3. Get top product categories if requested
    if (includeProducts) {
      // Get top product categories for imports
      const importProductsQuery = `
        WITH product_data AS (
          SELECT 
            h.category_id,
            p.name as product_name,
            p.code as product_code,
            p.hs_level,
            SUM(h.value) as value,
            COUNT(*) as transaction_count
          FROM data_hstradedata h
          JOIN data_productcode p ON h.category_id = p.id::VARCHAR
          WHERE h.country = '${countryCode}'
          AND h.tradeflow_id = '103'
          ${yearCondition}
          GROUP BY h.category_id, p.name, p.code, p.hs_level
        )
        SELECT * FROM product_data
        ORDER BY value DESC
        LIMIT ${productLimit}
      `;
      
      // Get top product categories for exports
      const exportProductsQuery = `
        WITH product_data AS (
          SELECT 
            h.category_id,
            p.name as product_name,
            p.code as product_code,
            p.hs_level,
            SUM(h.value) as value,
            COUNT(*) as transaction_count
          FROM data_hstradedata h
          JOIN data_productcode p ON h.category_id = p.id::VARCHAR
          WHERE h.country = '${countryCode}'
          AND h.tradeflow_id = '102'
          ${yearCondition}
          GROUP BY h.category_id, p.name, p.code, p.hs_level
        )
        SELECT * FROM product_data
        ORDER BY value DESC
        LIMIT ${productLimit}
      `;
      
      const importProducts = await db.query<ProductCategory>(importProductsQuery);
      const exportProducts = await db.query<ProductCategory>(exportProductsQuery);
      
      response.productCategories = {
        imports: importProducts,
        exports: exportProducts
      };
    }
    
    // 4. Get trade flow distribution
    const tradeFlowQuery = `
      SELECT
        tradeflow_id,
        COUNT(*) as transaction_count,
        SUM(value) as total_value,
        AVG(value) as average_value,
        MIN(value) as min_value,
        MAX(value) as max_value
      FROM data_hstradedata
      WHERE country = '${countryCode}'
      ${yearCondition}
      GROUP BY tradeflow_id
    `;
    
    const tradeFlowData = await db.query<TradeFlow>(tradeFlowQuery);
    response.tradeFlows = tradeFlowData;
    
    return NextResponse.json(response, {
      headers: {
        'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
      }
    });
  } catch (error) {
    console.error(`Error fetching country data:`, error);
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
} 