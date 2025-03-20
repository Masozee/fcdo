import { Context } from 'hono';
import * as countryService from '../services/countries.service';
import { parseQueryOptions } from '../utils';

/**
 * Get all countries with pagination and filtering
 */
export async function getCountries(c: Context) {
  const options = parseQueryOptions(c.req.query());
  
  try {
    const result = await countryService.getCountries(options);
    return c.json(result);
  } catch (error) {
    console.error('Error fetching countries:', error);
    return c.json({ error: 'Failed to fetch countries' }, 500);
  }
}

/**
 * Get country by ID
 */
export async function getCountryById(c: Context) {
  const id = Number(c.req.param('id'));
  
  if (isNaN(id)) {
    return c.json({ error: 'Invalid ID' }, 400);
  }
  
  try {
    const country = await countryService.getCountryById(id);
    
    if (!country) {
      return c.json({ error: 'Country not found' }, 404);
    }
    
    return c.json(country);
  } catch (error) {
    console.error('Error fetching country:', error);
    return c.json({ error: 'Failed to fetch country' }, 500);
  }
}

/**
 * Get country by ISO code
 */
export async function getCountryByIsoCode(c: Context) {
  const isoCode = c.req.param('isoCode');
  
  if (!isoCode) {
    return c.json({ error: 'ISO code is required' }, 400);
  }
  
  try {
    const country = await countryService.getCountryByIsoCode(isoCode);
    
    if (!country) {
      return c.json({ error: 'Country not found' }, 404);
    }
    
    return c.json(country);
  } catch (error) {
    console.error('Error fetching country:', error);
    return c.json({ error: 'Failed to fetch country' }, 500);
  }
}

/**
 * Search countries
 */
export async function searchCountries(c: Context) {
  const query = c.req.query('q');
  
  if (!query) {
    return c.json({ error: 'Search query is required' }, 400);
  }
  
  const options = parseQueryOptions(c.req.query());
  
  try {
    const result = await countryService.searchCountries(query, options);
    return c.json(result);
  } catch (error) {
    console.error('Error searching countries:', error);
    return c.json({ error: 'Failed to search countries' }, 500);
  }
}

/**
 * Get countries by region
 */
export async function getCountriesByRegion(c: Context) {
  const region = c.req.param('region');
  
  if (!region) {
    return c.json({ error: 'Region is required' }, 400);
  }
  
  const options = parseQueryOptions(c.req.query());
  
  try {
    const result = await countryService.getCountriesByRegion(region, options);
    return c.json(result);
  } catch (error) {
    console.error('Error fetching countries by region:', error);
    return c.json({ error: 'Failed to fetch countries' }, 500);
  }
}

/**
 * Get country statistics
 */
export async function getCountryStats(c: Context) {
  try {
    const stats = await countryService.getCountryStats();
    return c.json(stats);
  } catch (error) {
    console.error('Error fetching country stats:', error);
    return c.json({ error: 'Failed to fetch country statistics' }, 500);
  }
} 