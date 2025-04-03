import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import path from 'path';
import fs from 'fs';

interface CountryTradeData {
  country_name: string;
  country_iso: string;
  value: number;
  percent: number;
}

interface ProductTradeByCountry {
  [country_iso: string]: {
    value: number;
    percent: number;
  };
}

// Define the database path
const DB_PATH = path.join(process.cwd(), 'data', 'db.sqlite3');

// Ensure the database directory exists
export function ensureDbDirectory() {
  const dbDir = path.dirname(DB_PATH);
  if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true });
  }
}

// Helper function to open the database
export async function openDb() {
  ensureDbDirectory();
  
  return open({
    filename: DB_PATH,
    driver: sqlite3.Database
  });
}

// Initialize database with required tables
export async function initializeDatabase() {
  const db = await openDb();
  
  try {
    // Create countries table
    await db.exec(`
      CREATE TABLE IF NOT EXISTS countries (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        alpha2 TEXT NOT NULL,
        alpha3 TEXT NOT NULL,
        country_code TEXT NOT NULL,
        region TEXT,
        sub_region TEXT,
        intermediate_region TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    // Create trade_data table to store import/export values
    await db.exec(`
      CREATE TABLE IF NOT EXISTS trade_data (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        year INTEGER NOT NULL,
        reporter_iso TEXT NOT NULL,
        partner_iso TEXT NOT NULL,
        import_value REAL DEFAULT 0,
        export_value REAL DEFAULT 0,
        total_trade REAL DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    // Create product_categories table
    await db.exec(`
      CREATE TABLE IF NOT EXISTS product_categories (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        code TEXT NOT NULL,
        name TEXT NOT NULL,
        parent_code TEXT,
        level INTEGER NOT NULL, -- 2, 4, or 6 for HS level
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    // Create product_trade table to store trade by product
    await db.exec(`
      CREATE TABLE IF NOT EXISTS product_trade (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        year INTEGER NOT NULL,
        reporter_iso TEXT NOT NULL,
        partner_iso TEXT NOT NULL,
        product_code TEXT NOT NULL,
        import_value REAL DEFAULT 0,
        export_value REAL DEFAULT 0,
        total_trade REAL DEFAULT 0,
        percent_of_total REAL DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    console.log('Database initialized successfully');
  } catch (error) {
    console.error('Error initializing database:', error);
    throw error;
  } finally {
    await db.close();
  }
}

// Import countries from CSV file
export async function importCountriesFromCsv(csvPath: string) {
  const db = await openDb();
  
  try {
    // First check if countries table already has data
    const count = await db.get('SELECT COUNT(*) as count FROM countries');
    if (count && count.count > 0) {
      console.log(`Countries table already has ${count.count} records. Skipping import.`);
      return;
    }
    
    // Read and parse CSV
    const csvData = fs.readFileSync(csvPath, 'utf8');
    const lines = csvData.split('\n');
    const headers = lines[0].split(',');
    
    // Skip header row
    const dataRows = lines.slice(1);
    
    // Prepare statement for insertion
    const stmt = await db.prepare(`
      INSERT INTO countries (name, alpha2, alpha3, country_code, region, sub_region, intermediate_region)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);
    
    // Process each row
    for (const row of dataRows) {
      if (!row.trim()) continue;
      
      const columns = row.split(',');
      const countryData = [
        columns[0]?.trim(), // name
        columns[1]?.trim(), // alpha2
        columns[2]?.trim(), // alpha3
        columns[3]?.trim(), // country_code
        columns[5]?.trim(), // region
        columns[6]?.trim(), // sub_region
        columns[7]?.trim()  // intermediate_region
      ];
      
      await stmt.run(countryData);
    }
    
    await stmt.finalize();
    console.log(`Imported ${dataRows.length} countries to the database`);
  } catch (error) {
    console.error('Error importing countries from CSV:', error);
    throw error;
  } finally {
    await db.close();
  }
}

// Get all countries
export async function getCountries() {
  const db = await openDb();
  try {
    return await db.all('SELECT * FROM countries ORDER BY name');
  } finally {
    await db.close();
  }
}

// Get country by ISO code (alpha2 or alpha3)
export async function getCountryByIso(isoCode: string) {
  const db = await openDb();
  try {
    return await db.get(
      'SELECT * FROM countries WHERE alpha2 = ? OR alpha3 = ?',
      [isoCode, isoCode]
    );
  } finally {
    await db.close();
  }
}

// Get trade data by country ISO code
export async function getTradeDataByCountry(isoCode: string, year?: number) {
  const db = await openDb();
  try {
    let query = `
      SELECT 
        c.name as country_name,
        c.alpha3 as country_iso,
        SUM(t.import_value) as imports,
        SUM(t.export_value) as exports,
        SUM(t.total_trade) as total_trade
      FROM trade_data t
      JOIN countries c ON t.reporter_iso = c.alpha3
      WHERE t.reporter_iso = ?
    `;
    
    const params: (string | number)[] = [isoCode];
    
    if (year) {
      query += ' AND t.year = ?';
      params.push(year);
    }
    
    query += ' GROUP BY t.reporter_iso';
    
    return await db.get(query, params);
  } finally {
    await db.close();
  }
}

// Get country trade by product categories
export async function getCountryProductCategories(isoCode: string, year?: number) {
  const db = await openDb();
  try {
    let query = `
      SELECT 
        pc.name as category_name,
        pc.code as category_code,
        SUM(pt.total_trade) as value,
        AVG(pt.percent_of_total) as percent_trade
      FROM product_trade pt
      JOIN product_categories pc ON pt.product_code = pc.code
      WHERE pt.reporter_iso = ?
    `;
    
    const params: (string | number)[] = [isoCode];
    
    if (year) {
      query += ' AND pt.year = ?';
      params.push(year);
    }
    
    query += ' GROUP BY pt.product_code ORDER BY value DESC';
    
    return await db.all(query, params);
  } finally {
    await db.close();
  }
}

// Get product details with trade by country
export async function getProductDetails(productCode: string, year?: number) {
  const db = await openDb();
  try {
    // First get the product details
    const product = await db.get(
      'SELECT * FROM product_categories WHERE code = ?',
      [productCode]
    );
    
    if (!product) return null;
    
    // Then get the trade data by country
    let query = `
      SELECT 
        c.name as country_name,
        c.alpha3 as country_iso,
        pt.total_trade as value,
        pt.percent_of_total as percent
      FROM product_trade pt
      JOIN countries c ON pt.reporter_iso = c.alpha3
      WHERE pt.product_code = ?
    `;
    
    const params: (string | number)[] = [productCode];
    
    if (year) {
      query += ' AND pt.year = ?';
      params.push(year);
    }
    
    query += ' ORDER BY value DESC';
    
    const tradeByCountry = await db.all(query, params) as CountryTradeData[];
    
    return {
      name: product.name,
      code: product.code,
      countries: tradeByCountry.reduce((acc: ProductTradeByCountry, country: CountryTradeData) => {
        acc[country.country_iso] = {
          value: country.value,
          percent: country.percent
        };
        return acc;
      }, {})
    };
  } finally {
    await db.close();
  }
} 