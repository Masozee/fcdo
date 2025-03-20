import Database from 'better-sqlite3';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

// Get __dirname equivalent in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function migrateData() {
  const rootDir = path.join(__dirname, '..');
  
  // Open the source database
  const sourceDb = new Database(path.join(rootDir, 'data', 'db.sqlite3'));

  // Create the target database
  const targetDb = new Database(path.join(rootDir, 'data', 'trade_data.sqlite'));

  try {
    // Create tables in target database
    targetDb.exec(`
      CREATE TABLE IF NOT EXISTS hs_codes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        hs_code TEXT UNIQUE,
        hs_level INTEGER,
        description TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS trade_flows (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT UNIQUE,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS trade (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        country TEXT,
        hs_code TEXT,
        trade_flow_id INTEGER,
        value DECIMAL,
        percent_trade REAL,
        cr4 REAL,
        total_trade DECIMAL,
        year DATE,
        rank_desc INTEGER,
        rank_within_product INTEGER,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (hs_code) REFERENCES hs_codes(hs_code),
        FOREIGN KEY (trade_flow_id) REFERENCES trade_flows(id)
      );
    `);

    // Insert trade flows
    console.log('Setting up trade flows...');
    targetDb.exec(`
      INSERT OR IGNORE INTO trade_flows (id, name) VALUES 
      (1, 'Import'),
      (2, 'Export')
    `);

    // Migrate HS codes from api_productcode
    console.log('Migrating HS codes...');
    const hsCodes = sourceDb.prepare('SELECT * FROM api_productcode').all();
    const insertHsCode = targetDb.prepare(
      `INSERT OR IGNORE INTO hs_codes 
      (hs_code, hs_level, description) 
      VALUES (?, ?, ?)`
    );
    
    for (const code of hsCodes) {
      insertHsCode.run(
        code.code,
        code.hs_level,
        code.name
      );
    }

    // Migrate trade data from data_hstradedata
    console.log('Migrating trade data...');
    const tradeData = sourceDb.prepare('SELECT * FROM data_hstradedata').all();
    console.log(`Found ${tradeData.length} trade records to migrate`);
    
    // Begin transaction for batch insert
    const insertTrade = targetDb.prepare(
      `INSERT OR IGNORE INTO trade 
      (country, value, percent_trade, cr4, total_trade, year, trade_flow_id, rank_desc, rank_within_product) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
    );
    
    const batchSize = 1000;
    for (let i = 0; i < tradeData.length; i += batchSize) {
      const batch = tradeData.slice(i, i + batchSize);
      console.log(`Migrating batch ${Math.floor(i/batchSize) + 1} of ${Math.ceil(tradeData.length/batchSize)}`);
      
      // Begin transaction for batch insert
      const transaction = targetDb.transaction((trades) => {
        for (const trade of trades) {
          try {
            insertTrade.run(
              trade.country,
              trade.value,
              trade.percent_trade,
              trade.CR4,
              trade.total_trade,
              trade.year,
              trade.tradeflow_id,
              trade.rank_desc,
              trade.rank_within_product
            );
          } catch (error) {
            console.error(`Error inserting trade record ${trade.id}:`, error.message);
          }
        }
      });
      
      transaction(batch);
    }

    console.log('Data migration completed successfully!');
  } catch (error) {
    console.error('Error during migration:', error);
    throw error;
  } finally {
    sourceDb.close();
    targetDb.close();
  }
}

// Run the migration
migrateData().catch(console.error); 