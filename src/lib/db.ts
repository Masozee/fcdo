import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import path from 'path';
import fs from 'fs';

// Update the database path to use the existing file in data/db directory
const DB_PATH = path.join(process.cwd(), 'data', 'db', 'trade_data.sqlite');

// Helper function to open the database
export async function openDb() {
  // Ensure the data/db directory exists
  const dbDir = path.join(process.cwd(), 'data', 'db');
  if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true });
  }

  // Check if the database file exists
  const dbExists = fs.existsSync(DB_PATH);
  
  // If the database file doesn't exist or is empty, create a new one
  if (!dbExists || fs.statSync(DB_PATH).size === 0) {
    console.log('Database file does not exist or is empty. Creating a new one...');
    // If there's an empty file, delete it
    if (dbExists) {
      fs.unlinkSync(DB_PATH);
    }
  }

  const db = await open({
    filename: DB_PATH,
    driver: sqlite3.Database
  });

  // Initialize the database if it doesn't exist
  await initializeDatabase(db);

  return db;
}

// Initialize the database with tables and seed data
async function initializeDatabase(db: any) {
  try {
    // Check if the database has been initialized
    const tableExists = await db.get(
      "SELECT name FROM sqlite_master WHERE type='table' AND name='country'"
    );

    if (!tableExists) {
      console.log('Initializing database with tables and seed data...');
      
      // Create country table
      await db.exec(`
        CREATE TABLE IF NOT EXISTS country (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT NOT NULL,
          iso_code TEXT NOT NULL UNIQUE
        )
      `);

      // Create hs_codes table
      await db.exec(`
        CREATE TABLE IF NOT EXISTS hs_codes (
          hs_code TEXT PRIMARY KEY,
          hs_description TEXT NOT NULL,
          hs2_code TEXT NOT NULL,
          hs2_description TEXT NOT NULL,
          hs4_code TEXT NOT NULL,
          hs4_description TEXT NOT NULL
        )
      `);

      // Create trade table
      await db.exec(`
        CREATE TABLE IF NOT EXISTS trade (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          reporter_iso TEXT NOT NULL,
          partner_iso TEXT NOT NULL,
          trade_flow TEXT NOT NULL,
          hs_code TEXT NOT NULL,
          trade_value_usd REAL NOT NULL,
          date TEXT NOT NULL,
          FOREIGN KEY (hs_code) REFERENCES hs_codes(hs_code),
          FOREIGN KEY (reporter_iso) REFERENCES country(iso_code),
          FOREIGN KEY (partner_iso) REFERENCES country(iso_code)
        )
      `);

      // Insert seed data for countries
      const countries = [
        { name: 'United States', iso_code: 'USA' },
        { name: 'China', iso_code: 'CHN' },
        { name: 'Germany', iso_code: 'DEU' },
        { name: 'Japan', iso_code: 'JPN' },
        { name: 'United Kingdom', iso_code: 'GBR' },
        { name: 'France', iso_code: 'FRA' },
        { name: 'India', iso_code: 'IND' },
        { name: 'South Korea', iso_code: 'KOR' },
        { name: 'Canada', iso_code: 'CAN' },
        { name: 'Italy', iso_code: 'ITA' },
        { name: 'Mexico', iso_code: 'MEX' },
        { name: 'Brazil', iso_code: 'BRA' },
        { name: 'Australia', iso_code: 'AUS' },
        { name: 'Spain', iso_code: 'ESP' },
        { name: 'Russia', iso_code: 'RUS' }
      ];

      console.log('Inserting countries...');
      // Use a transaction for better performance
      await db.exec('BEGIN TRANSACTION');
      
      for (const country of countries) {
        await db.run(
          'INSERT INTO country (name, iso_code) VALUES (?, ?)',
          [country.name, country.iso_code]
        );
      }
      
      await db.exec('COMMIT');
      console.log('Countries inserted successfully');

      // Insert seed data for HS codes
      const hsCodes = [
        { 
          hs_code: '847130', 
          hs_description: 'Portable digital automatic data processing machines',
          hs2_code: '84',
          hs2_description: 'Machinery and mechanical appliances',
          hs4_code: '8471',
          hs4_description: 'Automatic data processing machines (computers)'
        },
        { 
          hs_code: '851712', 
          hs_description: 'Telephones for cellular networks',
          hs2_code: '85',
          hs2_description: 'Electrical machinery and equipment',
          hs4_code: '8517',
          hs4_description: 'Telephone sets and communication apparatus'
        },
        { 
          hs_code: '870323', 
          hs_description: 'Motor cars with engine capacity 1500-3000cc',
          hs2_code: '87',
          hs2_description: 'Vehicles',
          hs4_code: '8703',
          hs4_description: 'Motor cars for transport of persons'
        },
        { 
          hs_code: '270900', 
          hs_description: 'Petroleum oils, crude',
          hs2_code: '27',
          hs2_description: 'Mineral fuels and oils',
          hs4_code: '2709',
          hs4_description: 'Petroleum oils, crude'
        },
        { 
          hs_code: '300490', 
          hs_description: 'Other medicaments, packaged for retail sale',
          hs2_code: '30',
          hs2_description: 'Pharmaceutical products',
          hs4_code: '3004',
          hs4_description: 'Medicaments, packaged for retail sale'
        }
      ];

      console.log('Inserting HS codes...');
      // Use a transaction for better performance
      await db.exec('BEGIN TRANSACTION');
      
      for (const hsCode of hsCodes) {
        await db.run(
          'INSERT INTO hs_codes (hs_code, hs_description, hs2_code, hs2_description, hs4_code, hs4_description) VALUES (?, ?, ?, ?, ?, ?)',
          [hsCode.hs_code, hsCode.hs_description, hsCode.hs2_code, hsCode.hs2_description, hsCode.hs4_code, hsCode.hs4_description]
        );
      }
      
      await db.exec('COMMIT');
      console.log('HS codes inserted successfully');

      // Insert seed data for trade - REDUCED DATASET FOR BETTER PERFORMANCE
      console.log('Generating trade data...');
      
      // Use a smaller subset of countries for better performance
      const mainCountries = countries.slice(0, 5); // Just use the first 5 countries
      const years = ['2019', '2020', '2021', '2022', '2023'];
      const tradeFlows = ['Import', 'Export'];
      
      // Generate a smaller set of trade data
      let tradeCount = 0;
      
      // Use a transaction for better performance
      await db.exec('BEGIN TRANSACTION');
      
      // Generate trade data for each country pair and HS code
      for (const reporter of mainCountries) {
        for (const partner of countries) {
          if (reporter.iso_code !== partner.iso_code) {
            for (const hsCode of hsCodes) {
              for (const year of years) {
                for (const flow of tradeFlows) {
                  // Generate a random trade value between 1 million and 10 billion
                  const tradeValue = Math.floor(Math.random() * 10000000000) + 1000000;
                  
                  await db.run(
                    'INSERT INTO trade (reporter_iso, partner_iso, trade_flow, hs_code, trade_value_usd, date) VALUES (?, ?, ?, ?, ?, ?)',
                    [reporter.iso_code, partner.iso_code, flow, hsCode.hs_code, tradeValue, `${year}-01-01`]
                  );
                  
                  tradeCount++;
                  
                  // Commit every 100 records to avoid transaction getting too large
                  if (tradeCount % 100 === 0) {
                    await db.exec('COMMIT');
                    await db.exec('BEGIN TRANSACTION');
                    console.log(`Inserted ${tradeCount} trade records...`);
                  }
                }
              }
            }
          }
        }
      }
      
      // Commit any remaining records
      await db.exec('COMMIT');
      console.log(`Database initialized successfully with ${tradeCount} trade records`);
      
      // Verify data was inserted correctly
      const countryCount = await db.get('SELECT COUNT(*) as count FROM country');
      const hsCodeCount = await db.get('SELECT COUNT(*) as count FROM hs_codes');
      const tradeRecordCount = await db.get('SELECT COUNT(*) as count FROM trade');
      
      console.log(`Verification: ${countryCount.count} countries, ${hsCodeCount.count} HS codes, ${tradeRecordCount.count} trade records`);
    } else {
      // Database already exists, verify it has data
      const countryCount = await db.get('SELECT COUNT(*) as count FROM country');
      const hsCodeCount = await db.get('SELECT COUNT(*) as count FROM hs_codes');
      const tradeRecordCount = await db.get('SELECT COUNT(*) as count FROM trade');
      
      console.log(`Database already initialized with ${countryCount.count} countries, ${hsCodeCount.count} HS codes, ${tradeRecordCount.count} trade records`);
      
      // If tables exist but are empty, try to populate them
      if (countryCount.count === 0 || hsCodeCount.count === 0 || tradeRecordCount.count === 0) {
        console.log('Tables exist but are empty. Attempting to populate...');
        // Delete the database file and try again on next run
        await db.close();
        if (fs.existsSync(DB_PATH)) {
          fs.unlinkSync(DB_PATH);
          console.log('Deleted empty database file. It will be recreated on next run.');
        }
        throw new Error('Database tables were empty. Database file deleted for re-initialization on next run.');
      }
    }
  } catch (error) {
    console.error('Error initializing database:', error);
    // If there's an error, we'll continue and fall back to dummy data
  }
}

// Export a singleton database instance
export const db = {
  async all(sql: string, params: any[] = []) {
    const dbInstance = await openDb();
    try {
      return await dbInstance.all(sql, params);
    } catch (error) {
      console.error('Database query error:', error);
      throw error;
    } finally {
      await dbInstance.close();
    }
  },
  
  async get(sql: string, params: any[] = []) {
    const dbInstance = await openDb();
    try {
      return await dbInstance.get(sql, params);
    } catch (error) {
      console.error('Database query error:', error);
      throw error;
    } finally {
      await dbInstance.close();
    }
  },
  
  async run(sql: string, params: any[] = []) {
    const dbInstance = await openDb();
    try {
      return await dbInstance.run(sql, params);
    } catch (error) {
      console.error('Database query error:', error);
      throw error;
    } finally {
      await dbInstance.close();
    }
  }
};

/**
 * Get all countries from the database
 */
export async function getCountries() {
  const db = await openDb();
  return await db.all('SELECT * FROM countries ORDER BY name');
}

/**
 * Get a specific country by ID
 */
export async function getCountryById(id: number) {
  const db = await openDb();
  return await db.get('SELECT * FROM countries WHERE id = ?', id);
}

/**
 * Get trade data between two countries
 */
export async function getTradeData(sourceCountryId: number, destCountryId: number, year?: number) {
  const db = await openDb();
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
  const db = await openDb();
  
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
  const db = await openDb();
  
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
  const db = await openDb();
  
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
  const db = await openDb();
  
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
  const db = await openDb();
  const years = await db.all('SELECT DISTINCT year FROM trade_data ORDER BY year DESC');
  return years.map(y => y.year);
}

/**
 * Get top trading partners for a specific country
 */
export async function getTopTradingPartners(countryId: number, limit: number = 10, year?: number) {
  const db = await openDb();
  
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
  const db = await openDb();
  
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