import { getTopTradingPartners } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const countryId = parseInt(searchParams.get('countryId') || '0', 10);
  const year = searchParams.get('year') ? parseInt(searchParams.get('year') as string, 10) : undefined;
  const limit = parseInt(searchParams.get('limit') || '10', 10);
  
  if (!countryId) {
    return NextResponse.json({ error: 'Country ID is required' }, { status: 400 });
  }
  
  try {
    const partners = await getTopTradingPartners(countryId, limit, year);
    return NextResponse.json(partners);
  } catch (error) {
    console.error('Error fetching trade partners:', error);
    return NextResponse.json({ error: 'Failed to fetch data' }, { status: 500 });
  }
} 