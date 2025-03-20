import db from '../db';
import { ProductCode, QueryOptions } from '../types';
import { buildPaginatedQuery } from '../utils';

const BASE_QUERY = 'SELECT * FROM "data_productcode"';

/**
 * Get all product codes with pagination and filtering
 */
export async function getProductCodes(options: QueryOptions = {}) {
  try {
    const { query, countQuery } = buildPaginatedQuery(BASE_QUERY, options);
    
    const productCodes = await db.query<ProductCode>(query);
    const totalCount = await db.queryOne<{ total: number }>(countQuery);
    
    return {
      productCodes,
      totalCount: totalCount?.total || 0
    };
  } catch (error) {
    console.error('Error getting product codes:', error);
    return {
      productCodes: [],
      totalCount: 0,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

/**
 * Get product code by ID
 */
export async function getProductCodeById(id: number): Promise<ProductCode | null> {
  try {
    return await db.queryOne<ProductCode>(`${BASE_QUERY} WHERE id = ${id}`);
  } catch (error) {
    console.error(`Error getting product code by ID ${id}:`, error);
    return null;
  }
}

/**
 * Get product code by code
 */
export async function getProductCodeByCode(code: string): Promise<ProductCode | null> {
  try {
    return await db.queryOne<ProductCode>(`${BASE_QUERY} WHERE code = '${code}'`);
  } catch (error) {
    console.error(`Error getting product code by code ${code}:`, error);
    return null;
  }
}

/**
 * Get product codes by HS level
 */
export async function getProductCodesByLevel(hsLevel: number, options: QueryOptions = {}) {
  try {
    const combinedOptions = { ...options, hs_level: hsLevel };
    const { query, countQuery } = buildPaginatedQuery(BASE_QUERY, combinedOptions);
    
    const productCodes = await db.query<ProductCode>(query);
    const totalCount = await db.queryOne<{ total: number }>(countQuery);
    
    return {
      productCodes,
      totalCount: totalCount?.total || 0
    };
  } catch (error) {
    console.error(`Error getting product codes by HS level ${hsLevel}:`, error);
    return {
      productCodes: [],
      totalCount: 0,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

/**
 * Search product codes by name or code
 */
export async function searchProductCodes(searchTerm: string, options: QueryOptions = {}) {
  try {
    const baseQueryWithSearch = `
      SELECT * FROM "data_productcode"
      WHERE code LIKE '%${searchTerm}%' OR name LIKE '%${searchTerm}%'
    `;
    
    const { query, countQuery } = buildPaginatedQuery(baseQueryWithSearch, options);
    
    const productCodes = await db.query<ProductCode>(query);
    const totalCount = await db.queryOne<{ total: number }>(countQuery);
    
    return {
      productCodes,
      totalCount: totalCount?.total || 0
    };
  } catch (error) {
    console.error(`Error searching product codes with term ${searchTerm}:`, error);
    return {
      productCodes: [],
      totalCount: 0,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

/**
 * Get product hierarchy (HS2 > HS4 > HS6)
 */
export async function getProductHierarchy(code: string) {
  try {
    let hsLevel = 0;
    
    // Determine HS level from code length
    if (code.length === 2) {
      hsLevel = 2;
    } else if (code.length === 4) {
      hsLevel = 4;
    } else if (code.length === 6) {
      hsLevel = 6;
    }
    
    if (hsLevel === 0) {
      return null;
    }
    
    // Get the product code
    const product = await getProductCodeByCode(code);
    
    if (!product) {
      return null;
    }
    
    // For HS2, get all HS4 under it
    if (hsLevel === 2) {
      const childQuery = `
        SELECT * FROM "data_productcode"
        WHERE hs_level = 4 AND code LIKE '${code}%'
        ORDER BY code
      `;
      
      const children = await db.query<ProductCode>(childQuery);
      
      return {
        product,
        children
      };
    }
    
    // For HS4, get parent HS2 and all HS6 under it
    if (hsLevel === 4) {
      const hs2Code = code.substring(0, 2);
      
      const parentQuery = `
        SELECT * FROM "data_productcode"
        WHERE hs_level = 2 AND code = '${hs2Code}'
      `;
      
      const childQuery = `
        SELECT * FROM "data_productcode"
        WHERE hs_level = 6 AND code LIKE '${code}%'
        ORDER BY code
      `;
      
      const parent = await db.queryOne<ProductCode>(parentQuery);
      const children = await db.query<ProductCode>(childQuery);
      
      return {
        product,
        parent,
        children
      };
    }
    
    // For HS6, get parent HS4 and grandparent HS2
    if (hsLevel === 6) {
      const hs4Code = code.substring(0, 4);
      const hs2Code = code.substring(0, 2);
      
      const parentQuery = `
        SELECT * FROM "data_productcode"
        WHERE hs_level = 4 AND code = '${hs4Code}'
      `;
      
      const grandparentQuery = `
        SELECT * FROM "data_productcode"
        WHERE hs_level = 2 AND code = '${hs2Code}'
      `;
      
      const parent = await db.queryOne<ProductCode>(parentQuery);
      const grandparent = await db.queryOne<ProductCode>(grandparentQuery);
      
      return {
        product,
        parent,
        grandparent
      };
    }
    
    return {
      product
    };
  } catch (error) {
    console.error(`Error getting product hierarchy for code ${code}:`, error);
    return null;
  }
} 