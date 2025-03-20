import { Context } from 'hono';
import * as productService from '../services/products.service';
import { parseQueryOptions } from '../utils';

/**
 * Get all product codes with pagination and filtering
 */
export async function getProductCodes(c: Context) {
  const options = parseQueryOptions(c.req.query());
  
  try {
    const result = await productService.getProductCodes(options);
    return c.json(result);
  } catch (error) {
    console.error('Error fetching product codes:', error);
    return c.json({ error: 'Failed to fetch product codes' }, 500);
  }
}

/**
 * Get product code by ID
 */
export async function getProductCodeById(c: Context) {
  const id = Number(c.req.param('id'));
  
  if (isNaN(id)) {
    return c.json({ error: 'Invalid ID' }, 400);
  }
  
  try {
    const product = await productService.getProductCodeById(id);
    
    if (!product) {
      return c.json({ error: 'Product code not found' }, 404);
    }
    
    return c.json(product);
  } catch (error) {
    console.error('Error fetching product code:', error);
    return c.json({ error: 'Failed to fetch product code' }, 500);
  }
}

/**
 * Get product code by code
 */
export async function getProductCodeByCode(c: Context) {
  const code = c.req.param('code');
  
  if (!code) {
    return c.json({ error: 'Code is required' }, 400);
  }
  
  try {
    const product = await productService.getProductCodeByCode(code);
    
    if (!product) {
      return c.json({ error: 'Product code not found' }, 404);
    }
    
    return c.json(product);
  } catch (error) {
    console.error('Error fetching product code:', error);
    return c.json({ error: 'Failed to fetch product code' }, 500);
  }
}

/**
 * Get product codes by HS level
 */
export async function getProductCodesByLevel(c: Context) {
  const level = Number(c.req.param('level'));
  
  if (isNaN(level) || ![2, 4, 6].includes(level)) {
    return c.json({ error: 'Invalid HS level' }, 400);
  }
  
  const options = parseQueryOptions(c.req.query());
  
  try {
    const result = await productService.getProductCodesByLevel(level, options);
    return c.json(result);
  } catch (error) {
    console.error('Error fetching product codes by level:', error);
    return c.json({ error: 'Failed to fetch product codes' }, 500);
  }
}

/**
 * Search product codes
 */
export async function searchProductCodes(c: Context) {
  const query = c.req.query('q');
  
  if (!query) {
    return c.json({ error: 'Search query is required' }, 400);
  }
  
  const options = parseQueryOptions(c.req.query());
  
  try {
    const result = await productService.searchProductCodes(query, options);
    return c.json(result);
  } catch (error) {
    console.error('Error searching product codes:', error);
    return c.json({ error: 'Failed to search product codes' }, 500);
  }
}

/**
 * Get product hierarchy
 */
export async function getProductHierarchy(c: Context) {
  const code = c.req.param('code');
  
  if (!code) {
    return c.json({ error: 'Code is required' }, 400);
  }
  
  try {
    const hierarchy = await productService.getProductHierarchy(code);
    
    if (!hierarchy) {
      return c.json({ error: 'Product code not found' }, 404);
    }
    
    return c.json(hierarchy);
  } catch (error) {
    console.error('Error fetching product hierarchy:', error);
    return c.json({ error: 'Failed to fetch product hierarchy' }, 500);
  }
} 