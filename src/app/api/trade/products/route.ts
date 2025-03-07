import { getTopProducts } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const countryId = parseInt(searchParams.get('countryId') || '0', 10);
  const hsLevel = (searchParams.get('hsLevel') || 'hs2') as 'hs2' | 'hs4' | 'hs6';
  const year = searchParams.get('year') ? parseInt(searchParams.get('year') as string, 10) : undefined;
  const limit = parseInt(searchParams.get('limit') || '10', 10);
  
  if (!countryId) {
    return NextResponse.json({ error: 'Country ID is required' }, { status: 400 });
  }
  
  // Validate HS level
  if (!['hs2', 'hs4', 'hs6'].includes(hsLevel)) {
    return NextResponse.json({ error: 'Invalid HS level. Must be one of: hs2, hs4, hs6' }, { status: 400 });
  }
  
  try {
    const products = await getTopProducts(countryId, hsLevel, limit, year);
    return NextResponse.json(products);
  } catch (error) {
    console.error('Error fetching top products:', error);
    return NextResponse.json({ error: 'Failed to fetch data' }, { status: 500 });
  }
} 