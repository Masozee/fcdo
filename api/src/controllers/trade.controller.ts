import { Context } from 'hono';
import * as tradeService from '../services/trade.service';
import { parseQueryOptions } from '../utils';

/**
 * Get trade data with pagination and filtering
 */
export async function getTradeData(c: Context) {
  const options = parseQueryOptions(c.req.query());
  
  try {
    const result = await tradeService.getTradeData(options);
    return c.json(result);
  } catch (error) {
    console.error('Error fetching trade data:', error);
    return c.json({ error: 'Failed to fetch trade data' }, 500);
  }
}

/**
 * Get trade data by ID
 */
export async function getTradeDataById(c: Context) {
  const id = Number(c.req.param('id'));
  
  if (isNaN(id)) {
    return c.json({ error: 'Invalid ID' }, 400);
  }
  
  try {
    const tradeData = await tradeService.getTradeDataById(id);
    
    if (!tradeData) {
      return c.json({ error: 'Trade data not found' }, 404);
    }
    
    return c.json(tradeData);
  } catch (error) {
    console.error('Error fetching trade data:', error);
    return c.json({ error: 'Failed to fetch trade data' }, 500);
  }
}

/**
 * Get trade data by country
 */
export async function getTradeDataByCountry(c: Context) {
  const countryCode = c.req.param('countryCode');
  
  if (!countryCode) {
    return c.json({ error: 'Country code is required' }, 400);
  }
  
  const options = parseQueryOptions(c.req.query());
  
  try {
    const result = await tradeService.getTradeDataByCountry(countryCode, options);
    return c.json(result);
  } catch (error) {
    console.error('Error fetching trade data by country:', error);
    return c.json({ error: 'Failed to fetch trade data' }, 500);
  }
}

/**
 * Get trade data by category (HS code)
 */
export async function getTradeDataByCategory(c: Context) {
  const hsCode = Number(c.req.param('hsCode'));
  
  if (isNaN(hsCode)) {
    return c.json({ error: 'Invalid HS code' }, 400);
  }
  
  const options = parseQueryOptions(c.req.query());
  
  try {
    const result = await tradeService.getTradeDataByCategory(hsCode, options);
    return c.json(result);
  } catch (error) {
    console.error('Error fetching trade data by category:', error);
    return c.json({ error: 'Failed to fetch trade data' }, 500);
  }
}

/**
 * Get trade data by year
 */
export async function getTradeDataByYear(c: Context) {
  const year = c.req.param('year');
  
  if (!year) {
    return c.json({ error: 'Year is required' }, 400);
  }
  
  try {
    const result = await tradeService.getTradeDataByYear(year);
    return c.json(result);
  } catch (error) {
    console.error('Error fetching trade data by year:', error);
    return c.json({ error: 'Failed to fetch trade data' }, 500);
  }
} 