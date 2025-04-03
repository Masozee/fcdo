import { NextRequest, NextResponse } from 'next/server';
import { openDb } from '@/lib/sqlite';

/**
 * API route to get product data from the database
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code'); // HS code
    
    const db = await openDb();
    
    let query = `
      SELECT 
        id,
        code,
        name,
        hs_level,
        created_at,
        updated_at
      FROM data_productcode
      WHERE 1=1
    `;
    
    const params: any[] = [];
    
    if (code) {
      query += ` AND code = ?`;
      params.push(code);
    }
    
    query += ` ORDER BY code ASC LIMIT 1000`; // Limit to prevent returning all 6000+ products
    
    const products = code 
      ? await db.get(query, params) 
      : await db.all(query, params);
    
    await db.close();
    
    return NextResponse.json({
      success: true,
      data: products,
      metadata: {
        filters: {
          code: code || 'all'
        },
        totalCount: code ? 1 : 1000,
        limit: 1000
      }
    });
    
  } catch (error) {
    console.error('Error fetching products:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch products' },
      { status: 500 }
    );
  }
} 