import { NextRequest, NextResponse } from 'next/server';
import { getCountries, getCountryByIso } from '@/lib/sqlite';
import { enhancedCountryCodeConverter } from '@/lib/country-utils';

/**
 * API route to get country code data
 * Can convert between country names, alpha-2, and alpha-3 codes
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code');
    const name = searchParams.get('name');
    const sourceType = searchParams.get('sourceType') as 'alpha2' | 'alpha3' | null;
    const targetType = searchParams.get('targetType') as 'alpha2' | 'alpha3' | null;

    console.log('Country code conversion request:', { code, name, sourceType, targetType });

    let result = null;

    // If we have a code, try to convert it
    if (code) {
      try {
        // Try database first
        const country = await getCountryByIso(code);
        
        if (country) {
          result = {
            alpha2: country.alpha2,
            alpha3: country.alpha3,
            name: country.name,
            region: country.region,
            sub_region: country.sub_region
          };
        } else {
          // Fallback to static mapping
          const convertedCode = enhancedCountryCodeConverter(
            code,
            sourceType || undefined,
            targetType || undefined
          );
          
          if (convertedCode) {
            result = {
              [sourceType || (code.length === 2 ? 'alpha2' : 'alpha3')]: code,
              [targetType || (code.length === 2 ? 'alpha3' : 'alpha2')]: convertedCode
            };
          }
        }
      } catch (error) {
        console.error('Error fetching country by ISO:', error);
        // Continue to try name-based lookup if provided
      }
    }

    // If we have a name or no result yet, try to find by name
    if (name || (!result && !code)) {
      try {
        const countries = await getCountries();
        
        if (name) {
          // Search for country by name
          const normalizedName = name.toLowerCase().trim();
          const country = countries.find(c => 
            c.name.toLowerCase() === normalizedName ||
            c.name.toLowerCase().includes(normalizedName) ||
            normalizedName.includes(c.name.toLowerCase())
          );
          
          if (country) {
            result = {
              alpha2: country.alpha2,
              alpha3: country.alpha3,
              name: country.name,
              region: country.region,
              sub_region: country.sub_region
            };
          }
        } else {
          // If no specific query, return all countries
          result = countries.map(c => ({
            alpha2: c.alpha2,
            alpha3: c.alpha3,
            name: c.name,
            region: c.region,
            sub_region: c.sub_region
          }));
        }
      } catch (error) {
        console.error('Error fetching countries:', error);
      }
    }

    if (result) {
      return NextResponse.json({
        success: true,
        data: result
      });
    } else {
      return NextResponse.json({
        success: false,
        error: 'Country not found'
      }, { status: 404 });
    }
    
  } catch (error) {
    console.error('Error in country code API:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to process country code request' },
      { status: 500 }
    );
  }
} 