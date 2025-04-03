import { NextRequest, NextResponse } from 'next/server';
import { openDb } from '@/lib/sqlite';

/**
 * API route to get international cooperation data
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const slug = searchParams.get('slug');
    
    const db = await openDb();
    
    let query = `
      SELECT 
        id,
        name,
        abbreviation,
        slug,
        description,
        website,
        established_date,
        is_active,
        countries
      FROM data_internationalcooperation
      WHERE 1=1
    `;
    
    const params: any[] = [];
    
    if (slug) {
      query += ` AND slug = ?`;
      params.push(slug);
    }
    
    query += ` ORDER BY name ASC`;
    
    const cooperations = slug
      ? await db.get(query, params)
      : await db.all(query, params);
    
    await db.close();
    
    return NextResponse.json({
      success: true,
      data: cooperations,
      metadata: {
        filters: {
          slug: slug || 'all'
        }
      }
    });
    
  } catch (error) {
    console.error('Error fetching cooperations:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch cooperations' },
      { status: 500 }
    );
  }
} 