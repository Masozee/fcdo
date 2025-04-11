import { cache } from 'react';

/**
 * Cached function to fetch all countries from the API
 * @returns Cached list of all countries
 */
export const getAllCountries = cache(async () => {
  const response = await fetch('/api/countries/list', {
    next: {
      // Revalidate after 1 hour (3600 seconds)
      revalidate: 3600,
    },
  });
  
  if (!response.ok) {
    throw new Error('Failed to fetch countries list');
  }
  
  return response.json();
});

/**
 * Cached function to fetch country trade data
 * @param year Optional year parameter
 * @returns Cached country trade data
 */
export const getCountryTradeData = cache(async (year?: string) => {
  const url = year ? `/api/country-trade?year=${year}` : '/api/country-trade';
  const response = await fetch(url, {
    next: {
      // Revalidate after 1 hour (3600 seconds)
      revalidate: 3600,
    },
  });
  
  if (!response.ok) {
    throw new Error('Failed to fetch country trade data');
  }
  
  return response.json();
});

/**
 * Cached function to fetch HS code data
 * @param level Optional level parameter (hs2, hs4, hs6)
 * @returns Cached HS code data
 */
export const getHSCodeData = cache(async (level?: string) => {
  const url = level ? `/api/hs-codes?level=${level}` : '/api/hs-codes';
  const response = await fetch(url, {
    next: {
      // Revalidate after 1 hour (3600 seconds)
      revalidate: 3600,
    },
  });
  
  if (!response.ok) {
    throw new Error('Failed to fetch HS code data');
  }
  
  return response.json();
});

/**
 * Cached function to fetch trade partners data
 * @param countryId Optional country ID parameter
 * @returns Cached trade partners data
 */
export const getTradePartnersData = cache(async (countryId?: number) => {
  const url = countryId ? `/api/trade/partners?country_id=${countryId}` : '/api/trade/partners';
  const response = await fetch(url, {
    next: {
      // Revalidate after 1 hour (3600 seconds)
      revalidate: 3600,
    },
  });
  
  if (!response.ok) {
    throw new Error('Failed to fetch trade partners data');
  }
  
  return response.json();
});

/**
 * Cached function to fetch products data
 * @param countryId Optional country ID parameter
 * @returns Cached products data
 */
export const getProductsData = cache(async (countryId?: number) => {
  const url = countryId ? `/api/trade/products?country_id=${countryId}` : '/api/trade/products';
  const response = await fetch(url, {
    next: {
      // Revalidate after 1 hour (3600 seconds)
      revalidate: 3600,
    },
  });
  
  if (!response.ok) {
    throw new Error('Failed to fetch products data');
  }
  
  return response.json();
});

/**
 * Cached function to fetch total trade data without pagination
 * @param year Optional year parameter
 * @returns Cached total trade data for all countries
 */
export const getTotalTradeData = cache(async (year?: string) => {
  // Use the new /api/total-trade endpoint with a large limit to get all data
  const url = year 
    ? `/api/total-trade?limit=1000&year=${year}` 
    : '/api/total-trade?limit=1000';
    
  const response = await fetch(url, {
    next: {
      // Revalidate after 1 hour (3600 seconds)
      revalidate: 3600,
    },
  });
  
  if (!response.ok) {
    throw new Error('Failed to fetch total trade data');
  }
  
  return response.json();
});

/**
 * Cached function to fetch countries trade data from the API
 * @param year Optional year parameter
 * @returns Cached countries trade data with global totals
 */
export const getCountriesTradeData = cache(async (year?: string) => {
  const url = year ? `/api/countries/trade?year=${year}` : '/api/countries/trade';
  const response = await fetch(url, {
    next: {
      // Revalidate after 1 hour (3600 seconds)
      revalidate: 3600,
    },
  });
  
  if (!response.ok) {
    throw new Error('Failed to fetch countries trade data');
  }
  
  return response.json();
});

/**
 * Cached function to fetch country-specific trade data
 * @param countryCode Country code (Alpha-2)
 * @param year Optional year parameter
 * @returns Cached country-specific trade data
 */
export const getCountrySpecificTradeData = cache(async (countryCode: string, year?: string) => {
  try {
    // Ensure the country code is uppercase for the API request
    const upperCaseCountryCode = countryCode.toUpperCase();
    
    const url = year 
      ? `/api/trade?country=${upperCaseCountryCode}&year=${year}` 
      : `/api/trade?country=${upperCaseCountryCode}`;
    
    console.log('Fetching country trade data from:', url);
    
    const response = await fetch(url, {
      next: {
        // Revalidate after 1 hour (3600 seconds)
        revalidate: 3600,
      },
    });
    
    if (!response.ok) {
      console.error(`API error (${response.status}): ${response.statusText}`);
      return {
        success: false,
        data: [],
        error: `Failed to fetch trade data for country ${upperCaseCountryCode} (Status ${response.status})`
      };
    }
    
    const data = await response.json();
    console.log('API response data count:', data?.data?.length || 0);
    
    if (!data || !data.data || data.data.length === 0) {
      return {
        success: true,
        data: [],
        message: `No trade data found for country ${upperCaseCountryCode}`,
      };
    }
    
    return data;
  } catch (error) {
    console.error('Error in getCountrySpecificTradeData:', error);
    // Return a structured error response instead of throwing
    return {
      success: false,
      data: [],
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
}); 