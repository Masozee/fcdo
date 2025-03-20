const fs = require('fs');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();
const { open } = require('sqlite');

// Get the current directory and set up database path
const dbDir = path.join(__dirname, '..', 'data', 'db');
const DB_PATH = path.join(dbDir, 'trade_data.sqlite');

async function createDatabase() {
  console.log(`Creating database at ${DB_PATH}...`);
  
  // Ensure the database directory exists
  if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true });
  }
  
  // Check if the database file exists and delete it if it does
  if (fs.existsSync(DB_PATH)) {
    try {
      fs.unlinkSync(DB_PATH);
      console.log('Deleted existing database file.');
    } catch (error) {
      console.error('Failed to delete existing database file:', error);
      process.exit(1);
    }
  }
  
  try {
    // Open the database
    const db = await open({
      filename: DB_PATH,
      driver: sqlite3.Database
    });
    
    // Enable foreign keys
    await db.exec('PRAGMA foreign_keys = ON');
    
    console.log('Creating database tables...');
    
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
    
    // Create indexes for performance
    await db.exec(`
      CREATE INDEX IF NOT EXISTS idx_trade_reporter ON trade(reporter_iso);
      CREATE INDEX IF NOT EXISTS idx_trade_partner ON trade(partner_iso);
      CREATE INDEX IF NOT EXISTS idx_trade_hs_code ON trade(hs_code);
      CREATE INDEX IF NOT EXISTS idx_trade_date ON trade(date);
    `);
    
    console.log('Tables and indexes created successfully.');
    
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
    await db.exec('BEGIN TRANSACTION');
    
    try {
      for (const country of countries) {
        await db.run(
          'INSERT INTO country (name, iso_code) VALUES (?, ?)',
          [country.name, country.iso_code]
        );
      }
      
      await db.exec('COMMIT');
      console.log('Countries inserted successfully.');
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
    await db.exec('BEGIN TRANSACTION');
    
    try {
      for (const hsCode of hsCodes) {
        await db.run(
          'INSERT INTO hs_codes (hs_code, hs_description, hs2_code, hs2_description, hs4_code, hs4_description) VALUES (?, ?, ?, ?, ?, ?)',
          [hsCode.hs_code, hsCode.hs_description, hsCode.hs2_code, hsCode.hs2_description, hsCode.hs4_code, hsCode.hs4_description]
        );
      }
      
      await db.exec('COMMIT');
      console.log('HS codes inserted successfully.');
    } catch (error) {
      await db.exec('ROLLBACK');
      console.error('Error inserting HS codes:', error);
      throw error;
    }
    
    // Insert sample trade data
    console.log('Generating sample trade data...');
    
    // Use a smaller subset of countries for better performance
    const mainCountries = countries.slice(0, 5); // Just use the first 5 countries
    const years = ['2019', '2020', '2021', '2022', '2023'];
    const tradeFlows = ['Import', 'Export'];
    
    let tradeCount = 0;
    await db.exec('BEGIN TRANSACTION');
    
    try {
      for (const reporter of mainCountries) {
        for (const partner of countries.slice(0, 8)) { // Use fewer partners for demo
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
                  
                  // Commit every 50 records to avoid transaction getting too large
                  if (tradeCount % 50 === 0) {
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
      console.log(`Database initialized successfully with ${tradeCount} trade records.`);
    } catch (error) {
      try {
        await db.exec('ROLLBACK');
      } catch (rollbackError) {
        console.error('Error during rollback:', rollbackError);
      }
      console.error('Error inserting trade data:', error);
      throw error;
    }
    
    // Close the database
    await db.close();
    
    console.log('Database created and populated successfully!');
    console.log(`Database path: ${DB_PATH}`);
    
  } catch (error) {
    console.error('Database creation failed:', error);
    process.exit(1);
  }
}

// Run the create database function
createDatabase().catch(err => {
  console.error('Database creation error:', err);
  process.exit(1);
}); 