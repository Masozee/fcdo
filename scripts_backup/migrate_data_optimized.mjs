import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

// Get __dirname equivalent in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function migrateData() {
  const rootDir = path.join(__dirname, '..');
  
  console.log('Starting migration process...');
  console.time('Migration completed in');
  
  // Open the source database
  const sourceDb = new Database(path.join(rootDir, 'data', 'db.sqlite3'));
  console.log('Source database opened successfully');
  
  // Create the target database
  const targetDb = new Database(path.join(rootDir, 'data', 'trade_data.sqlite'));
  console.log('Target database opened successfully');

  try {
    // Create tables in target database
    console.log('Creating target database schema...');
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

      -- Drop existing trade table if it exists to avoid column mismatches
      DROP TABLE IF EXISTS trade;

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
        category_id INTEGER,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );
      
      -- Add indices for better performance
      CREATE INDEX IF NOT EXISTS idx_trade_country ON trade(country);
      CREATE INDEX IF NOT EXISTS idx_trade_hs_code ON trade(hs_code);
      CREATE INDEX IF NOT EXISTS idx_trade_year ON trade(year);
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
    const hsCodesCount = sourceDb.prepare('SELECT COUNT(*) as count FROM api_productcode').get();
    console.log(`Found ${hsCodesCount.count} HS codes to migrate`);
    
    console.time('HS codes migration');
    const hsCodesTransaction = targetDb.transaction(() => {
      const insertHsCode = targetDb.prepare(
        `INSERT OR IGNORE INTO hs_codes 
        (hs_code, hs_level, description) 
        VALUES (?, ?, ?)`
      );
      
      const hsCodes = sourceDb.prepare('SELECT * FROM api_productcode').all();
      for (const code of hsCodes) {
        insertHsCode.run(
          code.code,
          code.hs_level,
          code.name
        );
      }
    });
    
    hsCodesTransaction();
    console.timeEnd('HS codes migration');
    
    // Verify HS codes migration
    const migratedHsCodesCount = targetDb.prepare('SELECT COUNT(*) as count FROM hs_codes').get();
    console.log(`Successfully migrated ${migratedHsCodesCount.count} HS codes`);

    // Migrate trade data from data_hstradedata
    console.log('Migrating trade data...');
    const tradeDataCount = sourceDb.prepare('SELECT COUNT(*) as count FROM data_hstradedata').get();
    console.log(`Found ${tradeDataCount.count} trade records to migrate`);
    
    console.time('Trade data migration');
    
    // Create the prepared statement outside the loop
    const insertTrade = targetDb.prepare(
      `INSERT INTO trade 
      (country, hs_code, value, percent_trade, cr4, total_trade, year, trade_flow_id, rank_desc, rank_within_product, category_id) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    );
    
    // Create a reusable transaction function
    const insertTradeMany = targetDb.transaction((trades) => {
      for (const trade of trades) {
        // Use category_id as hs_code if needed
        const hsCode = trade.category_id.toString();
        
        insertTrade.run(
          trade.country,
          hsCode,
          trade.value,
          trade.percent_trade,
          trade.CR4,
          trade.total_trade,
          trade.year,
          trade.tradeflow_id,
          trade.rank_desc,
          trade.rank_within_product,
          trade.category_id
        );
      }
    });
    
    // Process in smaller batches for better progress reporting
    const batchSize = 5000;
    let successCount = 0;
    let errorCount = 0;
    
    for (let i = 0; i < tradeDataCount.count; i += batchSize) {
      const offset = i;
      console.log(`Processing batch ${Math.floor(i/batchSize) + 1} of ${Math.ceil(tradeDataCount.count/batchSize)} (records ${offset+1}-${Math.min(offset+batchSize, tradeDataCount.count)})`);
      
      // Use parameterized query with LIMIT and OFFSET for efficient batch processing
      const batch = sourceDb.prepare(`SELECT * FROM data_hstradedata LIMIT ? OFFSET ?`).all(batchSize, offset);
      
      try {
        insertTradeMany(batch);
        successCount += batch.length;
      } catch (error) {
        console.error(`Error in batch starting at offset ${offset}:`, error.message);
        errorCount += batch.length;
      }
      
      // Progress report
      const progress = ((i + batch.length) / tradeDataCount.count * 100).toFixed(2);
      console.log(`Progress: ${progress}% (${successCount} records processed, ${errorCount} errors)`);
    }
    
    console.timeEnd('Trade data migration');
    
    // Verify trade data migration
    const migratedTradeCount = targetDb.prepare('SELECT COUNT(*) as count FROM trade').get();
    console.log(`Successfully migrated ${migratedTradeCount.count} trade records (${errorCount} errors)`);

    console.log('Data migration completed successfully!');
    console.timeEnd('Migration completed in');
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