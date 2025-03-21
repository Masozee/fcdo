import { cache } from 'react';

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