// Import sample trade data to SQLite database
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Database path
const dbPath = path.join(process.cwd(), 'db.sqlite3');

// Sample trade data
const sampleTradeData = [
  {
    reporter: 'United States of America',
    reporter_iso: 'USA',
    partner: 'China',
    partner_iso: 'CHN',
    year: 2022,
    trade_flow: 'Export',
    hs_code: '27',
    hs_description: 'Mineral fuels, mineral oils',
    trade_value_usd: 1500000.00,
    quantity: 10000,
    quantity_unit: 'Tons'
  },
  {
    reporter: 'United States of America',
    reporter_iso: 'USA',
    partner: 'Japan',
    partner_iso: 'JPN',
    year: 2022,
    trade_flow: 'Import',
    hs_code: '57',
    hs_description: 'Carpets and other textile floor coverings',
    trade_value_usd: 750000.00,
    quantity: 5000,
    quantity_unit: 'Units'
  },
  {
    reporter: 'Germany',
    reporter_iso: 'DEU',
    partner: 'France',
    partner_iso: 'FRA',
    year: 2022,
    trade_flow: 'Export',
    hs_code: '74',
    hs_description: 'Copper and articles thereof',
    trade_value_usd: 2000000.00,
    quantity: 8000,
    quantity_unit: 'Tons'
  },
  {
    reporter: 'United Kingdom of Great Britain and Northern Ireland',
    reporter_iso: 'GBR',
    partner: 'Germany',
    partner_iso: 'DEU',
    year: 2022,
    trade_flow: 'Export',
    hs_code: '87',
    hs_description: 'Vehicles other than railway',
    trade_value_usd: 3200000.00,
    quantity: 1200,
    quantity_unit: 'Units'
  },
  {
    reporter: 'Japan',
    reporter_iso: 'JPN',
    partner: 'United States of America',
    partner_iso: 'USA',
    year: 2022,
    trade_flow: 'Export',
    hs_code: '85',
    hs_description: 'Electrical machinery and equipment',
    trade_value_usd: 4500000.00,
    quantity: 25000,
    quantity_unit: 'Units'
  }
];

// Create trade data table and insert sample data
function initSampleTradeData() {
  // Open database connection
  const db = new sqlite3.Database(dbPath);
  
  db.serialize(() => {
    // Create data_hstradedata table if it doesn't exist
    db.run(`
      CREATE TABLE IF NOT EXISTS data_hstradedata (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        reporter VARCHAR NOT NULL,
        reporter_iso VARCHAR NOT NULL,
        partner VARCHAR NOT NULL,
        partner_iso VARCHAR NOT NULL,
        year INTEGER NOT NULL,
        trade_flow VARCHAR NOT NULL,
        hs_code VARCHAR NOT NULL,
        hs_description VARCHAR NOT NULL,
        trade_value_usd DECIMAL(20, 2) NOT NULL,
        quantity DECIMAL(20, 2),
        quantity_unit VARCHAR,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `, (err) => {
      if (err) {
        console.error('Error creating data_hstradedata table:', err);
        db.close();
        return;
      }
      
      // Check if data already exists
      db.get('SELECT COUNT(*) as count FROM data_hstradedata', [], (err, row) => {
        if (err) {
          console.error('Error checking data_hstradedata table:', err);
          db.close();
          return;
        }
        
        if (row.count > 0) {
          console.log(`data_hstradedata table already has ${row.count} records. Skipping import.`);
          db.close();
          return;
        }
        
        // Insert sample data
        const stmt = db.prepare(`
          INSERT INTO data_hstradedata (
            reporter, reporter_iso, partner, partner_iso, year, trade_flow,
            hs_code, hs_description, trade_value_usd, quantity, quantity_unit
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `);
        
        sampleTradeData.forEach(item => {
          stmt.run(
            item.reporter, 
            item.reporter_iso, 
            item.partner, 
            item.partner_iso, 
            item.year, 
            item.trade_flow,
            item.hs_code, 
            item.hs_description, 
            item.trade_value_usd, 
            item.quantity, 
            item.quantity_unit
          );
        });
        
        stmt.finalize();
        console.log(`Imported ${sampleTradeData.length} sample trade records`);
        db.close();
      });
    });
  });
}

// Create product code table
function initProductCodes() {
  // Open database connection
  const db = new sqlite3.Database(dbPath);
  
  db.serialize(() => {
    // Create data_productcode table if it doesn't exist
    db.run(`
      CREATE TABLE IF NOT EXISTS data_productcode (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        code VARCHAR NOT NULL,
        name VARCHAR NOT NULL,
        hs_level INTEGER NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `, (err) => {
      if (err) {
        console.error('Error creating data_productcode table:', err);
        db.close();
        return;
      }
      
      // Check if data already exists
      db.get('SELECT COUNT(*) as count FROM data_productcode', [], (err, row) => {
        if (err) {
          console.error('Error checking data_productcode table:', err);
          db.close();
          return;
        }
        
        if (row.count > 0) {
          console.log(`data_productcode table already has ${row.count} records. Skipping import.`);
          db.close();
          return;
        }
        
        // Insert sample product codes
        const productCodes = [
          { code: '27', name: 'Mineral fuels, mineral oils and products of their distillation; bituminous substances; mineral waxes', hs_level: 2 },
          { code: '57', name: 'Carpets and other textile floor coverings', hs_level: 2 },
          { code: '74', name: 'Copper and articles thereof', hs_level: 2 },
          { code: '85', name: 'Electrical machinery and equipment and parts thereof; sound recorders and reproducers, television image and sound recorders and reproducers, and parts and accessories of such articles', hs_level: 2 },
          { code: '87', name: 'Vehicles other than railway or tramway rolling stock, and parts and accessories thereof', hs_level: 2 }
        ];
        
        const stmt = db.prepare('INSERT INTO data_productcode (code, name, hs_level) VALUES (?, ?, ?)');
        
        productCodes.forEach(item => {
          stmt.run(item.code, item.name, item.hs_level);
        });
        
        stmt.finalize();
        console.log(`Imported ${productCodes.length} sample product codes`);
        db.close();
      });
    });
  });
}

// Run the initialization functions
initProductCodes();
initSampleTradeData(); 