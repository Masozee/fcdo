import { NextRequest, NextResponse } from 'next/server';
import { getCountryByIso, getCountryProductCategories } from '@/lib/sqlite';

interface RouteParams {
  params: {
    iso: string;
  };
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    // Get the ISO code from the dynamic route parameter
    const { iso } = params;
    
    if (!iso) {
      return NextResponse.json(
        { error: 'Country ISO code is required' },
        { status: 400 }
      );
    }
    
    // Get query parameters
    const url = new URL(request.url);
    const yearParam = url.searchParams.get('year');
    
    // Parse year if provided
    const year = yearParam ? parseInt(yearParam) : undefined;
    
    // Get country information
    const country = await getCountryByIso(iso);
    
    if (!country) {
      return NextResponse.json(
        { error: 'Country not found' },
        { status: 404 }
      );
    }
    
    // Get trade categories for the country
    const categories = await getCountryProductCategories(iso, year);
    
    return NextResponse.json({
      country,
      categories: categories || []
    });
  } catch (error) {
    console.error('Error fetching country detail:', error);
    return NextResponse.json(
      { error: 'Failed to fetch country detail' },
      { status: 500 }
    );
  }
} 