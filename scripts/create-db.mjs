import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createReadStream } from 'fs';
import csvParser from 'csv-parser';
import Database from 'better-sqlite3';

// Get the current directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Path to the database file
const dbPath = path.join(__dirname, '..', 'public', 'data', 'trade_data.db');

// Main function to create and populate the database
async function createAndPopulateDatabase() {
  console.log(`Creating database at ${dbPath}...`);
  
  // Ensure the database directory exists
  const dbDir = path.dirname(dbPath);
  if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true });
  }
  
  // Create or open the database
  const db = new Database(dbPath);
  
  // Enable foreign keys
  db.pragma('foreign_keys = ON');
  
  // Begin a transaction
  db.exec('BEGIN TRANSACTION;');
  
  try {
    console.log('Creating database tables...');
  
    // Create countries table
    db.exec(`
      CREATE TABLE IF NOT EXISTS countries (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        code TEXT NOT NULL UNIQUE,
        region TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
  
    // Create HS2 codes table
    db.exec(`
      CREATE TABLE IF NOT EXISTS hs2_codes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        code TEXT NOT NULL UNIQUE,
        description TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
  
    // Create HS4 codes table
    db.exec(`
      CREATE TABLE IF NOT EXISTS hs4_codes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        code TEXT NOT NULL UNIQUE,
        description TEXT NOT NULL,
        hs2_code TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (hs2_code) REFERENCES hs2_codes(code)
      );
    `);
  
    // Create HS6 codes table
    db.exec(`
      CREATE TABLE IF NOT EXISTS hs6_codes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        code TEXT NOT NULL UNIQUE,
        description TEXT NOT NULL,
        hs4_code TEXT NOT NULL,
        hs2_code TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (hs4_code) REFERENCES hs4_codes(code),
        FOREIGN KEY (hs2_code) REFERENCES hs2_codes(code)
      );
    `);
  
    // Create trade_data table
    db.exec(`
      CREATE TABLE IF NOT EXISTS trade_data (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        source_country TEXT NOT NULL,
        destination_country TEXT NOT NULL,
        year INTEGER NOT NULL,
        value INTEGER,
        import_value INTEGER,
        export_value INTEGER,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (source_country) REFERENCES countries(code),
        FOREIGN KEY (destination_country) REFERENCES countries(code)
      );
    `);
  
    // Create product_trade table
    db.exec(`
      CREATE TABLE IF NOT EXISTS product_trade (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        product_code TEXT NOT NULL,
        product_level TEXT NOT NULL, -- 'hs2', 'hs4', or 'hs6'
        reporter_code TEXT NOT NULL,
        partner_code TEXT NOT NULL,
        year INTEGER NOT NULL,
        trade_flow TEXT NOT NULL, -- 'Import' or 'Export'
        trade_value INTEGER,
        total_trade INTEGER,
        percent_trade REAL,
        rank INTEGER,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (reporter_code) REFERENCES countries(code),
        FOREIGN KEY (partner_code) REFERENCES countries(code)
      );
    `);
  
    // Create indexes for performance
    db.exec(`
      CREATE INDEX IF NOT EXISTS idx_trade_data_countries ON trade_data(source_country, destination_country);
      CREATE INDEX IF NOT EXISTS idx_trade_data_year ON trade_data(year);
      CREATE INDEX IF NOT EXISTS idx_product_trade_product ON product_trade(product_code, product_level);
      CREATE INDEX IF NOT EXISTS idx_product_trade_countries ON product_trade(reporter_code, partner_code);
      CREATE INDEX IF NOT EXISTS idx_product_trade_year ON product_trade(year);
    `);
  
    console.log('Tables created successfully');
  
    // Import countries data
    const countriesPath = path.join(__dirname, '..', 'data', 'countries.csv');
    const insertCountry = db.prepare(`
      INSERT OR IGNORE INTO countries (name, code, region)
      VALUES (?, ?, ?)
    `);
  
    // Import countries using a Promise
    await new Promise((resolve, reject) => {
      fs.createReadStream(countriesPath)
        .pipe(csvParser())
        .on('data', (row) => {
          insertCountry.run(row.name, row.code, row.region);
        })
        .on('end', () => {
          console.log('Countries data imported successfully');
          resolve();
        })
        .on('error', reject);
    });
  
    // Import trade data
    const tradeDataPath = path.join(__dirname, '..', 'data', 'trade_data.csv');
    const insertTradeData = db.prepare(`
      INSERT INTO trade_data (source_country, destination_country, year, value, import_value, export_value)
      VALUES (?, ?, ?, ?, ?, ?)
    `);
  
    // Import trade data using a Promise
    await new Promise((resolve, reject) => {
      fs.createReadStream(tradeDataPath)
        .pipe(csvParser())
        .on('data', (row) => {
          // Map country names to codes if needed
          const sourceCountry = row.source_country;
          const destCountry = row.destination_country;
          insertTradeData.run(
            sourceCountry,
            destCountry,
            parseInt(row.year),
            parseInt(row.value),
            parseInt(row.import_value),
            parseInt(row.export_value)
          );
        })
        .on('end', () => {
          console.log('Trade data imported successfully');
          resolve();
        })
        .on('error', reject);
    });
  
    // Import HS2 data
    const hs2Path = path.join(__dirname, '..', 'public', 'data', 'HS2 import export.csv');
    const insertHS2 = db.prepare(`
      INSERT OR IGNORE INTO hs2_codes (code, description)
      VALUES (?, ?)
    `);
    
    const insertProductTrade = db.prepare(`
      INSERT INTO product_trade (
        product_code, product_level, reporter_code, partner_code, 
        year, trade_flow, trade_value, total_trade, percent_trade, rank
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
  
    // Create a map to store unique HS2 codes
    const hs2Codes = new Map();
  
    // Import HS2 data using a Promise
    await new Promise((resolve, reject) => {
      fs.createReadStream(hs2Path)
        .pipe(csvParser())
        .on('data', (row) => {
          // Store unique HS2 codes with their descriptions
          if (!hs2Codes.has(row.ProductCode)) {
            hs2Codes.set(row.ProductCode, `HS2 - ${row.ProductCode}`);
            insertHS2.run(row.ProductCode, `HS2 - ${row.ProductCode}`);
          }
  
          // Insert product trade data
          insertProductTrade.run(
            row.ProductCode,
            'hs2',
            row.ReporterISO3,
            row.PartnerISO3,
            parseInt(row.Year),
            row.TradeFlowName,
            parseInt(row.TradeValuein1000USD),
            parseInt(row.total_trade),
            parseFloat(row.percent_trade),
            parseInt(row.rank_within_product)
          );
        })
        .on('end', () => {
          console.log('HS2 data imported successfully');
          resolve();
        })
        .on('error', reject);
    });
  
    // Import HS4 data
    const hs4Path = path.join(__dirname, '..', 'public', 'data', 'HS4 import export.csv');
    const insertHS4 = db.prepare(`
      INSERT OR IGNORE INTO hs4_codes (code, description, hs2_code)
      VALUES (?, ?, ?)
    `);
  
    // Create a map to store unique HS4 codes
    const hs4Codes = new Map();
  
    // Import HS4 data using a Promise
    await new Promise((resolve, reject) => {
      fs.createReadStream(hs4Path)
        .pipe(csvParser())
        .on('data', (row) => {
          // Extract the HS2 code from the HS4 code
          const hs2Code = row.ProductCode.substring(0, 2);
  
          // Store unique HS4 codes with their descriptions
          if (!hs4Codes.has(row.ProductCode)) {
            hs4Codes.set(row.ProductCode, `HS4 - ${row.ProductCode}`);
            insertHS4.run(row.ProductCode, `HS4 - ${row.ProductCode}`, hs2Code);
          }
  
          // Insert product trade data
          insertProductTrade.run(
            row.ProductCode,
            'hs4',
            row.ReporterISO3,
            row.PartnerISO3,
            parseInt(row.Year),
            row.TradeFlowName,
            parseInt(row.TradeValuein1000USD),
            parseInt(row.total_trade),
            parseFloat(row.percent_trade),
            parseInt(row.rank_within_product)
          );
        })
        .on('end', () => {
          console.log('HS4 data imported successfully');
          resolve();
        })
        .on('error', reject);
    });
  
    // Import HS6 data
    const hs6Path = path.join(__dirname, '..', 'public', 'data', 'HS6 import export.csv');
    const insertHS6 = db.prepare(`
      INSERT OR IGNORE INTO hs6_codes (code, description, hs4_code, hs2_code)
      VALUES (?, ?, ?, ?)
    `);
  
    // Import HS6 data using a Promise
    await new Promise((resolve, reject) => {
      fs.createReadStream(hs6Path)
        .pipe(csvParser())
        .on('data', (row) => {
          // Extract the HS2 and HS4 codes from the HS6 code
          const hs2Code = row.ProductCode.substring(0, 2);
          const hs4Code = row.ProductCode.substring(0, 4);
  
          // Insert HS6 code
          insertHS6.run(
            row.ProductCode,
            `HS6 - ${row.ProductCode}`,
            hs4Code,
            hs2Code
          );
  
          // Insert product trade data
          insertProductTrade.run(
            row.ProductCode,
            'hs6',
            row.ReporterISO3,
            row.PartnerISO3,
            parseInt(row.Year),
            row.TradeFlowName,
            parseInt(row.TradeValuein1000USD),
            parseInt(row.total_trade),
            parseFloat(row.percent_trade),
            parseInt(row.rank_within_product)
          );
        })
        .on('end', () => {
          console.log('HS6 data imported successfully');
          resolve();
        })
        .on('error', reject);
    });
  
    // Commit the transaction
    db.exec('COMMIT;');
    console.log('Database created and populated successfully!');
  
  } catch (error) {
    // Rollback the transaction in case of error
    db.exec('ROLLBACK;');
    console.error('Error creating database:', error);
  } finally {
    // Close the database connection
    db.close();
  }
}

// Run the main function
createAndPopulateDatabase().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
}); 