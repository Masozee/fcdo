import db from '../db';
import { HSTradeData, QueryOptions } from '../types';
import { buildPaginatedQuery } from '../utils';

const BASE_QUERY = 'SELECT * FROM "data_hstradedata"';

/**
 * Get trade data with pagination and filtering
 */
export async function getTradeData(options: QueryOptions = {}) {
  try {
    const { query, countQuery } = buildPaginatedQuery(BASE_QUERY, options);
    
    const tradeData = await db.query<HSTradeData>(query);
    const totalCount = await db.queryOne<{ total: number }>(countQuery);
    
    return {
      tradeData,
      totalCount: totalCount?.total || 0
    };
  } catch (error) {
    console.error('Error getting trade data:', error);
    return {
      tradeData: [],
      totalCount: 0,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

/**
 * Get trade data by ID
 */
export async function getTradeDataById(id: number): Promise<HSTradeData | null> {
  try {
    return await db.queryOne<HSTradeData>(`${BASE_QUERY} WHERE id = ${id}`);
  } catch (error) {
    console.error(`Error getting trade data by ID ${id}:`, error);
    return null;
  }
}

/**
 * Get trade data by country
 */
export async function getTradeDataByCountry(countryCode: string, options: QueryOptions = {}) {
  try {
    const combinedOptions = { ...options, country: countryCode };
    const { query, countQuery } = buildPaginatedQuery(BASE_QUERY, combinedOptions);
    
    const tradeData = await db.query<HSTradeData>(query);
    const totalCount = await db.queryOne<{ total: number }>(countQuery);
    
    return {
      tradeData,
      totalCount: totalCount?.total || 0
    };
  } catch (error) {
    console.error(`Error getting trade data by country ${countryCode}:`, error);
    return {
      tradeData: [],
      totalCount: 0,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

/**
 * Get trade data by category (HS code)
 */
export async function getTradeDataByCategory(hsCode: number, options: QueryOptions = {}) {
  try {
    const combinedOptions = { ...options, category_id: hsCode.toString() };
    const { query, countQuery } = buildPaginatedQuery(BASE_QUERY, combinedOptions);
    
    const tradeData = await db.query<HSTradeData>(query);
    const totalCount = await db.queryOne<{ total: number }>(countQuery);
    
    return {
      tradeData,
      totalCount: totalCount?.total || 0
    };
  } catch (error) {
    console.error(`Error getting trade data by category ${hsCode}:`, error);
    return {
      tradeData: [],
      totalCount: 0,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

/**
 * Get trade data by year
 */
export async function getTradeDataByYear(year: string): Promise<HSTradeData[]> {
  try {
    const query = `${BASE_QUERY} WHERE year LIKE '%${year}%'`;
    return await db.query<HSTradeData>(query);
  } catch (error) {
    console.error(`Error getting trade data by year ${year}:`, error);
    return [];
  }
}

/**
 * Get trade data summary by country
 */
export async function getTradeDataSummaryByCountry(countryCode: string) {
  try {
    const totalValueQuery = `
      SELECT 
        SUM(value) as total_value,
        COUNT(*) as count
      FROM data_hstradedata
      WHERE country = '${countryCode}'
    `;
    
    const flowSummaryQuery = `
      SELECT 
        tradeflow_id,
        SUM(value) as value,
        COUNT(*) as count
      FROM data_hstradedata
      WHERE country = '${countryCode}'
      GROUP BY tradeflow_id
    `;
    
    const totalValue = await db.queryOne<{ total_value: number, count: number }>(totalValueQuery);
    const flowSummary = await db.query<{ tradeflow_id: string, value: number, count: number }>(flowSummaryQuery);
    
    return {
      country: countryCode,
      totalValue: totalValue?.total_value || 0,
      totalRecords: totalValue?.count || 0,
      flowSummary
    };
  } catch (error) {
    console.error(`Error getting trade data summary by country ${countryCode}:`, error);
    return {
      country: countryCode,
      totalValue: 0,
      totalRecords: 0,
      flowSummary: [],
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

/**
 * Get trade data by year range
 */
export async function getTradeDataByYearRange(startYear: number, endYear: number, options: QueryOptions = {}) {
  try {
    // Convert to date strings for comparison
    const startDate = `${startYear}-01-01`;
    const endDate = `${endYear}-12-31`;
    
    const baseQueryWithRange = `
      SELECT * FROM data_hstradedata
      WHERE year >= '${startDate}' AND year <= '${endDate}'
    `;
    
    const { query, countQuery } = buildPaginatedQuery(baseQueryWithRange, options);
    
    const tradeData = await db.query<HSTradeData>(query);
    const totalCount = await db.queryOne<{ total: number }>(countQuery);
    
    return {
      tradeData,
      totalCount: totalCount?.total || 0
    };
  } catch (error) {
    console.error(`Error getting trade data by year range ${startYear}-${endYear}:`, error);
    return {
      tradeData: [],
      totalCount: 0,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

/**
 * Get top trading partners for a country
 */
export async function getTopTradingPartners(countryCode: string, year: number | null = null, limit: number = 10) {
  try {
    let query = `
      SELECT 
        country,
        SUM(value) as total_value,
        COUNT(*) as transaction_count
      FROM data_hstradedata
      WHERE country = '${countryCode}'
    `;
    
    if (year) {
      const yearStart = `${year}-01-01`;
      const yearEnd = `${year}-12-31`;
      query += ` AND year >= '${yearStart}' AND year <= '${yearEnd}'`;
    }
    
    query += `
      GROUP BY country
      ORDER BY total_value DESC
      LIMIT ${limit}
    `;
    
    return await db.query<{ country: string, total_value: number, transaction_count: number }>(query);
  } catch (error) {
    console.error(`Error getting top trading partners for country ${countryCode}:`, error);
    return [];
  }
}

/**
 * Get trade flow summary 
 */
export async function getTradeFlowSummary(countryCode: string, year: number) {
  try {
    const yearStart = `${year}-01-01`;
    const yearEnd = `${year}-12-31`;
    
    const query = `
      SELECT 
        tradeflow_id,
        SUM(value) as total_value,
        COUNT(*) as transaction_count
      FROM data_hstradedata
      WHERE country = '${countryCode}'
        AND year >= '${yearStart}' AND year <= '${yearEnd}'
      GROUP BY tradeflow_id
    `;
    
    return await db.query<{ tradeflow_id: string, total_value: number, transaction_count: number }>(query);
  } catch (error) {
    console.error(`Error getting trade flow summary for country ${countryCode} in year ${year}:`, error);
    return [];
  }
}

/**
 * Get trade trend for a country
 */
export async function getTradeTrend(countryCode: string, startYear: number, endYear: number) {
  try {
    const query = `
      SELECT 
        year,
        SUM(value) as total_value,
        COUNT(*) as transaction_count
      FROM data_hstradedata
      WHERE country = '${countryCode}'
        AND year >= '${startYear}-01-01' AND year <= '${endYear}-12-31'
      GROUP BY year
      ORDER BY year
    `;
    
    return await db.query<{ year: string, total_value: number, transaction_count: number }>(query);
  } catch (error) {
    console.error(`Error getting trade trend for country ${countryCode} from ${startYear} to ${endYear}:`, error);
    return [];
  }
} 