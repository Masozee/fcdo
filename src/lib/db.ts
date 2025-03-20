import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import path from 'path';
import fs from 'fs';

// In-memory database for development (when SQLite fails)
let inMemoryDatabase: any = null;

// Update the database path to use the existing file in data/db directory
const DB_PATH = path.join(process.cwd(), 'data', 'db', 'trade_data.sqlite');

// Helper function to open the database
export async function openDb() {
  // For Windows compatibility, always use in-memory database
  // SQLite bindings are causing issues on Windows
  return getInMemoryDb();
}

// Function to get or create in-memory database
function getInMemoryDb() {
  if (!inMemoryDatabase) {
    console.log('Creating new in-memory database for Windows compatibility');
    inMemoryDatabase = createInMemoryDb();
  }
  return inMemoryDatabase;
}

// Type definitions for mock db
interface MockDB {
  exec: (sql: string) => Promise<boolean>;
  get: (sql: string, params?: any[]) => Promise<any>;
  all: (sql: string, params?: any[]) => Promise<any[]>;
  run: (sql: string, params?: any[]) => Promise<{ lastID: number; changes: number }>;
  close: () => Promise<void>;
}

// Create an in-memory database implementation that mimics the SQLite interface
function createInMemoryDb(): MockDB {
  // In-memory storage
  const tables: Record<string, any[]> = {};
  const sequences: Record<string, number> = {};
  
  // Mock implementation of common SQLite functions
  return {
    async exec(sql: string) {
      console.log('In-memory DB exec:', sql);
      // This is a simplified implementation that doesn't actually execute SQL
      // Just logs the command and returns success
      return true;
    },
    
    async get(sql: string, params: any[] = []) {
      console.log('In-memory DB get:', sql, params);
      // For table existence check
      if (sql.includes("sqlite_master WHERE type='table'")) {
        const match = sql.match(/AND name='([^']+)'/);
        if (match && match[1]) {
          // Simulate that all tables exist
          return { name: match[1] };
        }
      }
      
      // For count queries, return dummy counts
      if (sql.includes('COUNT(*)')) {
        const table = sql.match(/FROM\s+(\w+)/i)?.[1];
        if (table === 'country') {
          return { count: 15 };
        } else if (table === 'hs_codes') {
          return { count: 5 };
        } else if (table === 'trade') {
          return { count: 750 };
        }
        return { count: 10 };
      }
      
      // Handle country queries
      if (sql.includes('FROM country') && params.length > 0) {
        const countryId = params[0];
        const country = getMockCountries().find(c => c.id === countryId || c.iso_code === countryId);
        return country || null;
      }
      
      // Handle HS code queries
      if (sql.includes('FROM hs_codes') && params.length > 0) {
        const hsCode = params[0];
        const code = getMockHS6Codes().find(c => c.code === hsCode);
        return code || null;
      }
      
      return null;
    },
    
    async all(sql: string, params: any[] = []) {
      console.log('In-memory DB all:', sql, params);
      
      // Handle special case for API routes
      if (sql.includes('sqlite_master')) {
        return [];
      }
      
      // Route the query to the appropriate mock data function
      if (sql.includes('country') && !sql.includes('JOIN')) {
        return getMockCountries();
      } else if (sql.includes('hs_codes') || sql.includes('hs2_code')) {
        if (sql.includes('hs2_code')) {
          return getMockHS2Codes();
        } else if (sql.includes('hs4_code')) {
          return getMockHS4Codes();
        } else {
          return getMockHS6Codes();
        }
      } else if (sql.includes('trade')) {
        // Handle JOIN queries for country trade
        if (sql.includes('JOIN country') && sql.includes('reporter_iso')) {
          return getJoinedTradeCountryData(params);
        }
        return getMockTradeData(params);
      } else if (sql.includes('year FROM trade_data')) {
        // Handle year query
        return [
          { year: 2023 },
          { year: 2022 },
          { year: 2021 },
          { year: 2020 },
          { year: 2019 }
        ];
      }
      
      // Default empty array for unknown queries
      return [];
    },
    
    async run(sql: string, params: any[] = []) {
      console.log('In-memory DB run:', sql, params);
      // For inserts, we just log and pretend it worked
      return { lastID: 1, changes: 1 };
    },
    
    async close() {
      console.log('In-memory DB closed');
    }
  };
}

// Type definitions for mock data
interface Country {
  id: number;
  name: string;
  iso_code: string;
}

interface HSCode {
  code: string;
  description: string;
  value: number;
  hs2_code?: string;
  hs4_code?: string;
}

interface TradeData {
  id: number;
  country: string;
  imports: number;
  exports: number;
  total: number;
}

// Mock data generators
function getMockCountries(): Country[] {
  return [
    { id: 1, name: 'United States', iso_code: 'USA' },
    { id: 2, name: 'China', iso_code: 'CHN' },
    { id: 3, name: 'Germany', iso_code: 'DEU' },
    { id: 4, name: 'Japan', iso_code: 'JPN' },
    { id: 5, name: 'United Kingdom', iso_code: 'GBR' },
    { id: 6, name: 'France', iso_code: 'FRA' },
    { id: 7, name: 'India', iso_code: 'IND' },
    { id: 8, name: 'South Korea', iso_code: 'KOR' },
    { id: 9, name: 'Canada', iso_code: 'CAN' },
    { id: 10, name: 'Italy', iso_code: 'ITA' },
    { id: 11, name: 'Mexico', iso_code: 'MEX' },
    { id: 12, name: 'Brazil', iso_code: 'BRA' },
    { id: 13, name: 'Australia', iso_code: 'AUS' },
    { id: 14, name: 'Spain', iso_code: 'ESP' },
    { id: 15, name: 'Russia', iso_code: 'RUS' }
  ];
}

function getMockHS2Codes(): HSCode[] {
  return [
    { code: "84", description: "Machinery and mechanical appliances", value: 2500000000000 },
    { code: "85", description: "Electrical machinery and equipment", value: 2300000000000 },
    { code: "87", description: "Vehicles", value: 1500000000000 },
    { code: "27", description: "Mineral fuels and oils", value: 1400000000000 },
    { code: "30", description: "Pharmaceutical products", value: 900000000000 },
    { code: "71", description: "Precious stones and metals", value: 850000000000 },
    { code: "39", description: "Plastics and articles thereof", value: 700000000000 },
    { code: "90", description: "Optical, photographic instruments", value: 650000000000 },
    { code: "29", description: "Organic chemicals", value: 600000000000 },
    { code: "72", description: "Iron and steel", value: 550000000000 }
  ];
}

function getMockHS4Codes(): HSCode[] {
  return [
    { code: "8471", description: "Automatic data processing machines (computers)", value: 800000000000, hs2_code: "84" },
    { code: "8517", description: "Telephone sets and communication apparatus", value: 750000000000, hs2_code: "85" },
    { code: "8703", description: "Motor cars for transport of persons", value: 700000000000, hs2_code: "87" },
    { code: "2709", description: "Petroleum oils, crude", value: 650000000000, hs2_code: "27" },
    { code: "3004", description: "Medicaments, packaged for retail sale", value: 600000000000, hs2_code: "30" },
    { code: "7108", description: "Gold, unwrought or semi-manufactured", value: 550000000000, hs2_code: "71" },
    { code: "8542", description: "Electronic integrated circuits", value: 500000000000, hs2_code: "85" },
    { code: "8708", description: "Parts for motor vehicles", value: 450000000000, hs2_code: "87" },
    { code: "9013", description: "Liquid crystal devices", value: 400000000000, hs2_code: "90" },
    { code: "2710", description: "Petroleum oils, refined", value: 350000000000, hs2_code: "27" }
  ];
}

function getMockHS6Codes(): HSCode[] {
  return [
    { code: "847130", description: "Portable digital automatic data processing machines", value: 400000000000, hs2_code: "84", hs4_code: "8471" },
    { code: "851712", description: "Telephones for cellular networks", value: 380000000000, hs2_code: "85", hs4_code: "8517" },
    { code: "870323", description: "Motor cars with engine capacity 1500-3000cc", value: 350000000000, hs2_code: "87", hs4_code: "8703" },
    { code: "270900", description: "Petroleum oils, crude", value: 320000000000, hs2_code: "27", hs4_code: "2709" },
    { code: "300490", description: "Other medicaments, packaged for retail sale", value: 300000000000, hs2_code: "30", hs4_code: "3004" },
    { code: "710812", description: "Gold, non-monetary, unwrought", value: 280000000000, hs2_code: "71", hs4_code: "7108" },
    { code: "854231", description: "Electronic integrated circuits: processors and controllers", value: 260000000000, hs2_code: "85", hs4_code: "8542" },
    { code: "870840", description: "Gear boxes for motor vehicles", value: 240000000000, hs2_code: "87", hs4_code: "8708" },
    { code: "901380", description: "Other liquid crystal devices", value: 220000000000, hs2_code: "90", hs4_code: "9013" },
    { code: "271019", description: "Medium oils and preparations", value: 200000000000, hs2_code: "27", hs4_code: "2710" }
  ];
}

function getMockTradeData(params: any[]): any[] {
  // Generate a random year trade data when requested for country+year
  const countryParam = params && params[0];
  const yearParam = params && params[1];
  
  if (params && params.length >= 1 && countryParam) {
    // This is for the products query
    return [
      { hs_code: "8471" },
      { hs_code: "8703" },
      { hs_code: "2709" },
      { hs_code: "3004" },
      { hs_code: "8517" }
    ];
  }
  
  // Base data for country trade
  const baseTradeData: TradeData[] = [
    {
      id: 1,
      country: "United States",
      imports: 2500000000000,
      exports: 1800000000000,
      total: 4300000000000
    },
    {
      id: 2,
      country: "China",
      imports: 2100000000000,
      exports: 2600000000000,
      total: 4700000000000
    },
    {
      id: 3,
      country: "Germany",
      imports: 1200000000000,
      exports: 1500000000000,
      total: 2700000000000
    },
    {
      id: 4,
      country: "Japan",
      imports: 750000000000,
      exports: 700000000000,
      total: 1450000000000
    },
    {
      id: 5,
      country: "United Kingdom",
      imports: 650000000000,
      exports: 450000000000,
      total: 1100000000000
    }
  ];
  
  // Apply year multiplier if year is provided
  if (yearParam) {
    const yearMultipliers: Record<string, number> = {
      '2023': 1.0,
      '2022': 0.92,
      '2021': 0.85,
      '2020': 0.75,
      '2019': 0.80,
    };
    
    const yearMultiplier = yearMultipliers[yearParam as string] || 1.0;
    
    return baseTradeData.map(country => ({
      ...country,
      imports: Math.round(country.imports * yearMultiplier),
      exports: Math.round(country.exports * yearMultiplier),
      total: Math.round(country.total * yearMultiplier)
    }));
  }
  
  return baseTradeData;
}

// Function to handle joined trade and country data
function getJoinedTradeCountryData(params: any[]): any[] {
  const baseCountries = [
    {
      id: 1,
      country: "United States",
      imports: 2500000000000,
      exports: 1800000000000,
      total: 4300000000000,
      products: ["8471", "8703", "2709", "3004", "8517"]
    },
    {
      id: 2,
      country: "China",
      imports: 2100000000000,
      exports: 2600000000000,
      total: 4700000000000,
      products: ["8517", "8471", "8542", "9013", "8541"]
    },
    {
      id: 3,
      country: "Germany",
      imports: 1200000000000,
      exports: 1500000000000,
      total: 2700000000000,
      products: ["8703", "3004", "8708", "8802", "8411"]
    },
    {
      id: 4,
      country: "Japan",
      imports: 750000000000,
      exports: 700000000000,
      total: 1450000000000,
      products: ["8703", "8708", "8542", "8471", "8517"]
    },
    {
      id: 5,
      country: "United Kingdom",
      imports: 650000000000,
      exports: 450000000000,
      total: 1100000000000,
      products: ["7108", "8703", "3004", "8411", "2710"]
    }
  ];

  // Check if there's a year parameter (usually the second parameter)
  if (params && params.length > 0) {
    const yearParam = params.find(p => /^20\d\d$/.test(String(p)));
    
    if (yearParam) {
      const yearMultipliers: Record<string, number> = {
        '2023': 1.0,
        '2022': 0.92,
        '2021': 0.85,
        '2020': 0.75,
        '2019': 0.80,
      };
      
      const yearMultiplier = yearMultipliers[yearParam as string] || 1.0;
      
      // Apply the year multiplier to the trade values
      return baseCountries.map(country => ({
        ...country,
        imports: Math.round(country.imports * yearMultiplier),
        exports: Math.round(country.exports * yearMultiplier),
        total: Math.round(country.total * yearMultiplier)
      }));
    }
  }
  
  return baseCountries;
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
      
      try {
        for (const country of countries) {
          await db.run(
            'INSERT INTO country (name, iso_code) VALUES (?, ?)',
            [country.name, country.iso_code]
          );
        }
        
        await db.exec('COMMIT');
        console.log('Countries inserted successfully');
      } catch (error) {
        await db.exec('ROLLBACK');
        console.error('Error inserting countries:', error);
        throw error;
      }

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
      
      try {
        for (const hsCode of hsCodes) {
          await db.run(
            'INSERT INTO hs_codes (hs_code, hs_description, hs2_code, hs2_description, hs4_code, hs4_description) VALUES (?, ?, ?, ?, ?, ?)',
            [hsCode.hs_code, hsCode.hs_description, hsCode.hs2_code, hsCode.hs2_description, hsCode.hs4_code, hsCode.hs4_description]
          );
        }
        
        await db.exec('COMMIT');
        console.log('HS codes inserted successfully');
      } catch (error) {
        await db.exec('ROLLBACK');
        console.error('Error inserting HS codes:', error);
        throw error;
      }

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
      
      try {
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
      } catch (error) {
        try {
          await db.exec('ROLLBACK');
        } catch (rollbackError) {
          console.error('Error during rollback:', rollbackError);
        }
        console.error('Error inserting trade data:', error);
        throw error;
      }
      
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
          try {
            fs.unlinkSync(DB_PATH);
            console.log('Deleted empty database file. It will be recreated on next run.');
          } catch (error) {
            console.error('Failed to delete database file:', error);
          }
        }
        throw new Error('Database tables were empty. Database file deleted for re-initialization on next run.');
      }
    }
  } catch (error) {
    console.error('Error initializing database:', error);
    throw error;
  }
}

// Export the db object for direct imports
export const db = {
  async get(sql: string, params: any[] = []) {
    try {
      const dbInstance = await openDb();
      try {
        return await dbInstance.get(sql, params);
      } catch (error) {
        console.error('Error in db.get:', error);
        // Fall back to in-memory DB if real DB query fails
        const inMemDb = getInMemoryDb();
        return await inMemDb.get(sql, params);
      }
    } catch (error) {
      console.error('Fatal error in db.get:', error);
      // Return null for non-existence checks instead of throwing
      if (sql.includes("sqlite_master WHERE type='table'")) {
        return null;
      }
      return null;
    }
  },
  
  async all(sql: string, params: any[] = []) {
    try {
      const dbInstance = await openDb();
      try {
        return await dbInstance.all(sql, params);
      } catch (error) {
        console.error('Error in db.all:', error);
        // Fall back to in-memory DB if real DB query fails
        const inMemDb = getInMemoryDb();
        return await inMemDb.all(sql, params);
      }
    } catch (error) {
      console.error('Fatal error in db.all:', error);
      return [];
    }
  },
  
  async run(sql: string, params: any[] = []) {
    try {
      const dbInstance = await openDb();
      try {
        return await dbInstance.run(sql, params);
      } catch (error) {
        console.error('Error in db.run:', error);
        // Fall back to in-memory DB if real DB query fails
        const inMemDb = getInMemoryDb();
        return await inMemDb.run(sql, params);
      }
    } catch (error) {
      console.error('Fatal error in db.run:', error);
      return { lastID: 0, changes: 0 };
    }
  },
  
  async exec(sql: string) {
    try {
      const dbInstance = await openDb();
      try {
        return await dbInstance.exec(sql);
      } catch (error) {
        console.error('Error in db.exec:', error);
        // Fall back to in-memory DB if real DB query fails
        const inMemDb = getInMemoryDb();
        return await inMemDb.exec(sql);
      }
    } catch (error) {
      console.error('Fatal error in db.exec:', error);
      return null;
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
  return years.map((y: { year: number }) => y.year);
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