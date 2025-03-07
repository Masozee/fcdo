import sqlite3 from 'sqlite3';
import { open, Database } from 'sqlite';
import path from 'path';

// Database connection cache
let db: Database | null = null;

/**
 * Get a database connection to the SQLite database.
 * Uses a cached connection if available.
 */
export async function getDatabase(): Promise<Database> {
  if (db) return db;
  
  const dbPath = path.join(process.cwd(), 'public', 'data', 'trade_data.sqlite');
  
  db = await open({
    filename: dbPath,
    driver: sqlite3.Database,
  });
  
  return db;
}

/**
 * Get all countries from the database
 */
export async function getCountries() {
  const db = await getDatabase();
  return await db.all('SELECT * FROM countries ORDER BY name');
}

/**
 * Get a specific country by ID
 */
export async function getCountryById(id: number) {
  const db = await getDatabase();
  return await db.get('SELECT * FROM countries WHERE id = ?', id);
}

/**
 * Get trade data between two countries
 */
export async function getTradeData(sourceCountryId: number, destCountryId: number, year?: number) {
  const db = await getDatabase();
  let query = 'SELECT * FROM trade_data WHERE source_country_id = ? AND destination_country_id = ?';
  const params = [sourceCountryId, destCountryId];
  
  if (year) {
    query += ' AND year = ?';
    params.push(year);
  }
  
  query += ' ORDER BY year DESC';
  
  return await db.get(query, ...params);
}

/**
 * Get all HS codes at a specific level
 */
export async function getHSCodes(level: 'hs2' | 'hs4' | 'hs6') {
  const db = await getDatabase();
  
  let table = '';
  switch (level) {
    case 'hs2':
      table = 'hs2_codes';
      break;
    case 'hs4':
      table = 'hs4_codes';
      break;
    case 'hs6':
      table = 'hs6_codes';
      break;
  }
  
  return await db.all(`SELECT * FROM ${table} ORDER BY code`);
}

/**
 * Get an HS code by code value
 */
export async function getHSCodeByCode(code: string, level: 'hs2' | 'hs4' | 'hs6') {
  const db = await getDatabase();
  
  let table = '';
  switch (level) {
    case 'hs2':
      table = 'hs2_codes';
      break;
    case 'hs4':
      table = 'hs4_codes';
      break;
    case 'hs6':
      table = 'hs6_codes';
      break;
  }
  
  return await db.get(`SELECT * FROM ${table} WHERE code = ?`, code);
}

/**
 * Get child HS codes for a parent code
 */
export async function getChildHSCodes(parentCode: string, parentLevel: 'hs2' | 'hs4') {
  const db = await getDatabase();
  
  let table = '';
  let foreignKey = '';
  
  if (parentLevel === 'hs2') {
    table = 'hs4_codes';
    foreignKey = 'hs2_code';
  } else if (parentLevel === 'hs4') {
    table = 'hs6_codes';
    foreignKey = 'hs4_code';
  }
  
  return await db.all(`SELECT * FROM ${table} WHERE ${foreignKey} = ? ORDER BY code`, parentCode);
}

/**
 * Get product trade data for a specific country and HS code
 */
export async function getProductTradeData(countryId: number, hsCode: string, hsLevel: string, year?: number) {
  const db = await getDatabase();
  
  let query = 'SELECT * FROM product_trade WHERE country_id = ? AND hs_code = ? AND hs_level = ?';
  const params = [countryId, hsCode, hsLevel];
  
  if (year) {
    query += ' AND year = ?';
    params.push(year);
  }
  
  query += ' ORDER BY year DESC';
  
  return await db.get(query, ...params);
}

/**
 * Get all available years in the trade data
 */
export async function getAvailableYears() {
  const db = await getDatabase();
  const years = await db.all('SELECT DISTINCT year FROM trade_data ORDER BY year DESC');
  return years.map(y => y.year);
}

/**
 * Get top trading partners for a specific country
 */
export async function getTopTradingPartners(countryId: number, limit: number = 10, year?: number) {
  const db = await getDatabase();
  
  let query = `
    SELECT 
      c.id, c.name, c.code, 
      td.value,
      td.import_value,
      td.export_value
    FROM trade_data td
    JOIN countries c ON td.destination_country_id = c.id
    WHERE td.source_country_id = ?
  `;
  
  const params = [countryId];
  
  if (year) {
    query += ' AND td.year = ?';
    params.push(year);
  }
  
  query += ' ORDER BY td.value DESC LIMIT ?';
  params.push(limit);
  
  return await db.all(query, ...params);
}

/**
 * Get top traded products for a specific country
 */
export async function getTopProducts(countryId: number, hsLevel: 'hs2' | 'hs4' | 'hs6' = 'hs2', limit: number = 10, year?: number) {
  const db = await getDatabase();
  
  let query = `
    SELECT 
      pt.hs_code,
      pt.value,
      pt.import_value,
      pt.export_value,
  `;
  
  switch (hsLevel) {
    case 'hs2':
      query += 'h.description FROM product_trade pt JOIN hs2_codes h ON pt.hs_code = h.code';
      break;
    case 'hs4':
      query += 'h.description FROM product_trade pt JOIN hs4_codes h ON pt.hs_code = h.code';
      break;
    case 'hs6':
      query += 'h.description FROM product_trade pt JOIN hs6_codes h ON pt.hs_code = h.code';
      break;
  }
  
  query += ' WHERE pt.country_id = ? AND pt.hs_level = ?';
  const params = [countryId, hsLevel];
  
  if (year) {
    query += ' AND pt.year = ?';
    params.push(year);
  }
  
  query += ' ORDER BY pt.value DESC LIMIT ?';
  params.push(limit);
  
  return await db.all(query, ...params);
} 