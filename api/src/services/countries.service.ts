import db from '../db';
import { Country, QueryOptions } from '../types';
import { buildPaginatedQuery } from '../utils';

/**
 * Get all countries with pagination and filtering
 */
export async function getCountries(options: QueryOptions = {}) {
  try {
    const query = `SELECT DISTINCT country as iso_code FROM data_hstradedata`;
    
    const countries = await db.query<{ iso_code: string }>(query);
    
    return {
      countries: countries.map(c => ({ 
        iso_code: c.iso_code,
      })),
      totalCount: countries.length
    };
  } catch (error) {
    console.error('Error getting countries:', error);
    return {
      countries: [],
      totalCount: 0,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

/**
 * Get country by ID
 */
export async function getCountryById(id: number): Promise<Country | null> {
  try {
    return await db.queryOne<Country>(`SELECT * FROM "data_country" WHERE id = ${id}`);
  } catch (error) {
    console.error(`Error getting country by ID ${id}:`, error);
    return null;
  }
}

/**
 * Get country by ISO code
 */
export async function getCountryByIsoCode(isoCode: string): Promise<Country | null> {
  try {
    const query = `SELECT DISTINCT country as iso_code FROM data_hstradedata WHERE country = '${isoCode}'`;
    const country = await db.queryOne<{ iso_code: string }>(query);
    
    if (!country) {
      return null;
    }
    
    return {
      id: 0,  // We don't have IDs for countries
      name: country.iso_code, // We don't have names, use ISO code
      iso_code: country.iso_code
    };
  } catch (error) {
    console.error(`Error getting country by ISO code ${isoCode}:`, error);
    return null;
  }
}

/**
 * Search countries by ISO code
 */
export async function searchCountries(searchTerm: string, options: QueryOptions = {}) {
  try {
    const query = `
      SELECT DISTINCT country as iso_code
      FROM data_hstradedata
      WHERE country LIKE '%${searchTerm}%'
    `;
    
    const countries = await db.query<{ iso_code: string }>(query);
    
    return {
      countries: countries.map(c => ({ 
        iso_code: c.iso_code,
      })),
      totalCount: countries.length
    };
  } catch (error) {
    console.error(`Error searching countries with term ${searchTerm}:`, error);
    return {
      countries: [],
      totalCount: 0,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

/**
 * Get countries by region
 */
export async function getCountriesByRegion(region: string, options: QueryOptions = {}) {
  try {
    const query = `SELECT DISTINCT country as iso_code FROM data_hstradedata WHERE region = '${region}'`;
    
    const countries = await db.query<{ iso_code: string }>(query);
    
    return {
      countries: countries.map(c => ({ 
        iso_code: c.iso_code,
      })),
      totalCount: countries.length
    };
  } catch (error) {
    console.error(`Error getting countries by region ${region}:`, error);
    return {
      countries: [],
      totalCount: 0,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

/**
 * Get country statistics
 */
export async function getCountryStats() {
  try {
    const countQuery = `SELECT COUNT(DISTINCT country) as count FROM data_hstradedata`;
    
    const totalCount = await db.queryOne<{ count: number }>(countQuery);
    
    return {
      totalCountries: totalCount?.count || 0
    };
  } catch (error) {
    console.error('Error getting country statistics:', error);
    return {
      totalCountries: 0,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
} 