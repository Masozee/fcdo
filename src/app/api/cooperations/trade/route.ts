import { NextRequest, NextResponse } from 'next/server';
import { openDb } from '@/lib/sqlite';

/**
 * API route to get trade summary for international cooperations
 * Can be filtered by tradeFlow: 'exports' (103) or 'imports' (102)
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const slug = searchParams.get('slug'); // cooperation slug (e.g., 'asean')
    const year = searchParams.get('year');
    const hsCode = searchParams.get('hsCode'); // optional HS code filter
    const tradeFlow = searchParams.get('tradeFlow'); // 'exports' (103) or 'imports' (102)

    console.log('API Request Params:', { slug, year, hsCode, tradeFlow });

    if (!slug) {
      return NextResponse.json(
        { success: false, error: 'Cooperation slug is required' },
        { status: 400 }
      );
    }

    const db = await openDb();
    console.log('Database connection opened');
    
    // First, get the cooperation and its member countries
    const cooperation = await db.get(
      `SELECT id, name, abbreviation, slug, countries FROM data_internationalcooperation WHERE slug = ?`,
      [slug]
    );

    console.log('Cooperation found:', cooperation);

    if (!cooperation) {
      await db.close();
      return NextResponse.json(
        { success: false, error: 'Cooperation not found' },
        { status: 404 }
      );
    }

    // Parse the countries from the format 'US,GB,FR'
    const memberCountries = cooperation.countries.split(',');
    console.log('Member countries:', memberCountries);
    
    // Placeholder for params that will be used in queries
    const placeholders = memberCountries.map(() => '?').join(',');
    
    // Get the actual tradeflow_id if string values are provided
    let tradeFlowId: number | null = null;
    if (tradeFlow) {
      if (tradeFlow === '103' || tradeFlow.toLowerCase() === 'exports') {
        tradeFlowId = 103;
      } else if (tradeFlow === '102' || tradeFlow.toLowerCase() === 'imports') {
        tradeFlowId = 102;
      } else if (!isNaN(parseInt(tradeFlow))) {
        tradeFlowId = parseInt(tradeFlow);
      }
    }
    console.log('Selected tradeFlowId:', tradeFlowId);
    
    // Build the query to get summary trade data for all member countries
    const summaryQuery = `
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
      WHERE h.country IN (${placeholders})
      ${year ? 'AND h.year = ?' : ''}
      ${tradeFlowId ? 'AND h.tradeflow_id = ?' : ''}
      GROUP BY h.country, cc."name", cc."region", cc."sub-region"
      ORDER BY total_trade DESC
    `;
    
    const summaryParams: any[] = [...memberCountries];
    if (year) summaryParams.push(`${year}-01-01`);
    if (tradeFlowId) summaryParams.push(tradeFlowId);
    
    console.log('Summary query:', summaryQuery);
    console.log('Summary params:', summaryParams);
    
    let countrySummary;
    try {
      countrySummary = await db.all(summaryQuery, summaryParams);
      console.log('Country summary results count:', countrySummary.length);
      console.log('First country result:', countrySummary[0] || 'No results');
    } catch (error) {
      console.error('Error executing summary query:', error);
      throw error;
    }
    
    // Get top products
    const productsQuery = `
      SELECT 
        p.code as hs_code,
        p.name as product_name,
        SUM(CASE WHEN h.tradeflow_id = 103 THEN h.value ELSE 0 END) as exports,
        SUM(CASE WHEN h.tradeflow_id = 102 THEN h.value ELSE 0 END) as imports,
        SUM(h.value) as total_trade
      FROM data_hstradedata h
      JOIN data_productcode p ON h.category_id = p.id
      WHERE h.country IN (${placeholders})
      ${year ? 'AND h.year = ?' : ''}
      ${tradeFlowId ? 'AND h.tradeflow_id = ?' : ''}
      ${hsCode ? 'AND p.code LIKE ?' : ''}
      GROUP BY p.code, p.name
      ORDER BY total_trade DESC
      LIMIT 20
    `;
    
    const productsParams: any[] = [...memberCountries];
    if (year) productsParams.push(`${year}-01-01`);
    if (tradeFlowId) productsParams.push(tradeFlowId);
    if (hsCode) productsParams.push(`${hsCode}%`);
    
    console.log('Products query:', productsQuery);
    console.log('Products params:', productsParams);
    
    let topProducts;
    try {
      topProducts = await db.all(productsQuery, productsParams);
      console.log('Top products count:', topProducts.length);
      console.log('First product:', topProducts[0] || 'No products found');
    } catch (error) {
      console.error('Error executing products query:', error);
      throw error;
    }
    
    // Calculate overall totals
    const totalQuery = `
      SELECT 
        SUM(CASE WHEN h.tradeflow_id = 103 THEN h.value ELSE 0 END) as total_exports,
        SUM(CASE WHEN h.tradeflow_id = 102 THEN h.value ELSE 0 END) as total_imports,
        SUM(h.value) as total_trade
      FROM data_hstradedata h
      WHERE h.country IN (${placeholders})
      ${year ? 'AND h.year = ?' : ''}
      ${tradeFlowId ? 'AND h.tradeflow_id = ?' : ''}
    `;
    
    const totalParams: any[] = [...memberCountries];
    if (year) totalParams.push(`${year}-01-01`);
    if (tradeFlowId) totalParams.push(tradeFlowId);
    
    console.log('Total query:', totalQuery);
    console.log('Total params:', totalParams);
    
    let totals;
    try {
      totals = await db.get(totalQuery, totalParams);
      console.log('Totals result:', totals);
    } catch (error) {
      console.error('Error executing totals query:', error);
      throw error;
    }
    
    await db.close();
    console.log('Database connection closed');
    
    // Determine the trade flow label for metadata
    let tradeFlowLabel = 'all';
    if (tradeFlow) {
      if (tradeFlow === '103' || tradeFlow.toLowerCase() === 'exports') {
        tradeFlowLabel = 'exports';
      } else if (tradeFlow === '102' || tradeFlow.toLowerCase() === 'imports') {
        tradeFlowLabel = 'imports';
      } else {
        tradeFlowLabel = tradeFlow;
      }
    }
    
    const response = {
      success: true,
      data: {
        cooperation: {
          name: cooperation.name,
          abbreviation: cooperation.abbreviation,
          slug: cooperation.slug,
          memberCount: memberCountries.length,
          memberCountries: memberCountries
        },
        summary: {
          totalExports: totals?.total_exports,
          totalImports: totals?.total_imports,
          totalTrade: totals?.total_trade,
          byCountry: countrySummary,
          topProducts: topProducts
        }
      },
      metadata: {
        filters: {
          slug,
          year: year || 'all',
          hsCode: hsCode || 'all',
          tradeFlow: tradeFlowLabel
        }
      }
    };
    
    console.log('Sending successful response');
    return NextResponse.json(response);
    
  } catch (error) {
    console.error('Error fetching cooperation trade data:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch cooperation trade data' },
      { status: 500 }
    );
  }
}