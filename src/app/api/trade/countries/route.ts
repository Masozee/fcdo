import { getCountries, getCountryById } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');
  
  try {
    if (id) {
      // If ID is provided, get a specific country
      const countryId = parseInt(id, 10);
      const country = await getCountryById(countryId);
      
      if (!country) {
        return NextResponse.json({ error: 'Country not found' }, { status: 404 });
      }
      
      return NextResponse.json(country);
    } else {
      // Otherwise, get all countries
      const countries = await getCountries();
      return NextResponse.json(countries);
    }
  } catch (error) {
    console.error('Error fetching countries:', error);
    return NextResponse.json({ error: 'Failed to fetch data' }, { status: 500 });
  }
} 