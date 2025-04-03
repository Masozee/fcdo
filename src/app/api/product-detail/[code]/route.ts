import { NextRequest, NextResponse } from 'next/server';
import { getProductDetails } from '@/lib/sqlite';

interface RouteParams {
  params: {
    code: string;
  };
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    // Get the product code from the dynamic route parameter
    const { code } = params;
    
    if (!code) {
      return NextResponse.json(
        { error: 'Product code is required' },
        { status: 400 }
      );
    }
    
    // Get query parameters
    const url = new URL(request.url);
    const yearParam = url.searchParams.get('year');
    
    // Parse year if provided
    const year = yearParam ? parseInt(yearParam) : undefined;
    
    // Get product details including trade by country
    const productDetails = await getProductDetails(code, year);
    
    if (!productDetails) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(productDetails);
  } catch (error) {
    console.error('Error fetching product detail:', error);
    return NextResponse.json(
      { error: 'Failed to fetch product detail' },
      { status: 500 }
    );
  }
} 