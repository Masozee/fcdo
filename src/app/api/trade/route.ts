import { NextRequest, NextResponse } from 'next/server';
import { openDb } from '@/lib/sqlite';

/**
 * API route to get trade data from the SQLite database
 * Can filter by tradeFlow: 'exports' (103) or 'imports' (102)
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const country = searchParams.get('country'); // Alpha-2 country code
    const year = searchParams.get('year');
    const tradeFlow = searchParams.get('tradeFlow'); // 'exports' (103) or 'imports' (102)
    const hsCode = searchParams.get('hsCode'); // Product HS code

    console.log('Trade API Request Params:', { country, year, tradeFlow, hsCode });

    const db = await openDb();
    console.log('Database connection opened');
    
    let query = `
      SELECT 
        h.id,
        h.country,
        cc."name" as country_name,
        cc."region" as region,
        cc."sub-region" as sub_region,
        h.value,
        h.percent_trade,
        h.CR4,
        h.category_id,
        pc.code as hs_code,
        pc.name as product_name,
        h.tradeflow_id,
        CASE 
          WHEN h.tradeflow_id = 102 THEN 'Import'
          WHEN h.tradeflow_id = 103 THEN 'Export'
          ELSE 'Other'
        END as trade_flow,
        h.year,
        h.keterangan,
        h.total_trade,
        h.rank_desc,
        h.rank_within_product
      FROM data_hstradedata h
      LEFT JOIN country_code cc ON h.country = cc."alpha-2"
      JOIN data_productcode pc ON h.category_id = pc.id
      WHERE 1=1
    `;
    
    const params: any[] = [];
    
    // Add filters if provided
    if (country) {
      query += ` AND h.country = ?`;
      params.push(country);
    }
    
    if (year) {
      query += ` AND h.year = ?`;
      params.push(`${year}-01-01`);
    }
    
    if (tradeFlow) {
      let tradeFlowId: number | null = null;
      
      // Handle both numeric IDs and string names
      if (tradeFlow === '103' || tradeFlow.toLowerCase() === 'exports') {
        tradeFlowId = 103;
      } else if (tradeFlow === '102' || tradeFlow.toLowerCase() === 'imports') {
        tradeFlowId = 102;
      }
      
      console.log('Selected tradeFlowId:', tradeFlowId);
      
      if (tradeFlowId) {
        query += ` AND h.tradeflow_id = ?`;
        params.push(tradeFlowId);
      }
    }
    
    if (hsCode) {
      // Check if we're matching by HS code pattern or exact product ID
      if (hsCode.length <= 10) {
        query += ` AND pc.code LIKE ?`;
        params.push(`${hsCode}%`);
      } else {
        query += ` AND h.category_id = ?`;
        params.push(parseInt(hsCode));
      }
    }
    
    query += ` ORDER BY h.value DESC LIMIT 100`;
    
    console.log('Trade query:', query);
    console.log('Trade params:', params);
    
    let data;
    try {
      data = await db.all(query, params);
      console.log('Trade data results count:', data.length);
      console.log('First trade result:', data[0] || 'No results');
    } catch (error) {
      console.error('Error executing trade query:', error);
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
      data: data,
      metadata: {
        filters: {
          country: country || 'all',
          year: year || 'all',
          tradeFlow: tradeFlowLabel,
          hsCode: hsCode || 'all'
        },
        count: data.length,
        limit: 100
      }
    };
    
    console.log('Sending successful response');
    return NextResponse.json(response);
    
  } catch (error) {
    console.error('Error fetching trade data:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch trade data' },
      { status: 500 }
    );
  }
} 