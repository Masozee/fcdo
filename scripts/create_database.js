const fs = require('fs');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();
const { open } = require('sqlite');
const csv = require('csv-parser');

// Database file path
const DB_PATH = path.join(__dirname, '../public/data/trade_data.sqlite');

// Ensure the directory exists
const dirPath = path.dirname(DB_PATH);
if (!fs.existsSync(dirPath)) {
  fs.mkdirSync(dirPath, { recursive: true });
}

// Create database and tables
async function setupDatabase() {
  // Open database connection
  const db = await open({
    filename: DB_PATH,
    driver: sqlite3.Database
  });

  console.log('Creating database schema...');

  // Create countries table
  await db.exec(`
    CREATE TABLE IF NOT EXISTS countries (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL UNIQUE,
      code TEXT,
      region TEXT
    )
  `);

  // Create trade_data table
  await db.exec(`
    CREATE TABLE IF NOT EXISTS trade_data (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      source_country_id INTEGER NOT NULL,
      destination_country_id INTEGER NOT NULL,
      year INTEGER NOT NULL,
      value REAL NOT NULL,
      import_value REAL,
      export_value REAL,
      FOREIGN KEY (source_country_id) REFERENCES countries(id),
      FOREIGN KEY (destination_country_id) REFERENCES countries(id)
    )
  `);

  // Create HS2 codes table
  await db.exec(`
    CREATE TABLE IF NOT EXISTS hs2_codes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      code TEXT NOT NULL UNIQUE,
      description TEXT NOT NULL,
      value REAL
    )
  `);

  // Create HS4 codes table
  await db.exec(`
    CREATE TABLE IF NOT EXISTS hs4_codes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      code TEXT NOT NULL UNIQUE,
      description TEXT NOT NULL,
      hs2_code TEXT NOT NULL,
      value REAL,
      FOREIGN KEY (hs2_code) REFERENCES hs2_codes(code)
    )
  `);

  // Create HS6 codes table
  await db.exec(`
    CREATE TABLE IF NOT EXISTS hs6_codes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      code TEXT NOT NULL UNIQUE,
      description TEXT NOT NULL,
      hs4_code TEXT NOT NULL,
      hs2_code TEXT NOT NULL,
      value REAL,
      FOREIGN KEY (hs4_code) REFERENCES hs4_codes(code),
      FOREIGN KEY (hs2_code) REFERENCES hs2_codes(code)
    )
  `);

  // Create product_trade table to store trade data by product
  await db.exec(`
    CREATE TABLE IF NOT EXISTS product_trade (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      country_id INTEGER NOT NULL,
      hs_code TEXT NOT NULL,
      hs_level TEXT NOT NULL,
      year INTEGER NOT NULL,
      value REAL NOT NULL,
      import_value REAL,
      export_value REAL,
      FOREIGN KEY (country_id) REFERENCES countries(id)
    )
  `);

  // Create indices for better performance
  await db.exec(`
    CREATE INDEX IF NOT EXISTS idx_trade_data_source ON trade_data(source_country_id);
    CREATE INDEX IF NOT EXISTS idx_trade_data_destination ON trade_data(destination_country_id);
    CREATE INDEX IF NOT EXISTS idx_trade_data_year ON trade_data(year);
    CREATE INDEX IF NOT EXISTS idx_hs4_hs2 ON hs4_codes(hs2_code);
    CREATE INDEX IF NOT EXISTS idx_hs6_hs4 ON hs6_codes(hs4_code);
    CREATE INDEX IF NOT EXISTS idx_hs6_hs2 ON hs6_codes(hs2_code);
    CREATE INDEX IF NOT EXISTS idx_product_trade_country ON product_trade(country_id);
    CREATE INDEX IF NOT EXISTS idx_product_trade_hs_code ON product_trade(hs_code);
    CREATE INDEX IF NOT EXISTS idx_product_trade_year ON product_trade(year);
  `);

  console.log('Database schema created successfully!');
  
  return db;
}

// Import countries from CSV file
async function importCountries(db, csvPath) {
  console.log(`Importing countries from ${csvPath}...`);
  
  return new Promise((resolve, reject) => {
    const countries = [];
    
    fs.createReadStream(csvPath)
      .pipe(csv())
      .on('data', (row) => {
        // Assuming CSV has columns: name, code, region
        countries.push({
          name: row.name,
          code: row.code,
          region: row.region
        });
      })
      .on('end', async () => {
        const stmt = await db.prepare('INSERT OR IGNORE INTO countries (name, code, region) VALUES (?, ?, ?)');
        
        for (const country of countries) {
          await stmt.run(country.name, country.code, country.region);
        }
        
        await stmt.finalize();
        console.log(`Imported ${countries.length} countries.`);
        resolve();
      })
      .on('error', reject);
  });
}

// Import trade data from CSV file
async function importTradeData(db, csvPath) {
  console.log(`Importing trade data from ${csvPath}...`);
  
  return new Promise((resolve, reject) => {
    const tradeData = [];
    
    fs.createReadStream(csvPath)
      .pipe(csv())
      .on('data', (row) => {
        // Assuming CSV has columns: source_country, destination_country, year, value, import_value, export_value
        tradeData.push({
          source_country: row.source_country,
          destination_country: row.destination_country,
          year: parseInt(row.year, 10),
          value: parseFloat(row.value),
          import_value: row.import_value ? parseFloat(row.import_value) : null,
          export_value: row.export_value ? parseFloat(row.export_value) : null
        });
      })
      .on('end', async () => {
        // Get country IDs
        const countryIds = {};
        const countries = await db.all('SELECT id, name FROM countries');
        countries.forEach(country => {
          countryIds[country.name] = country.id;
        });
        
        const stmt = await db.prepare(
          'INSERT INTO trade_data (source_country_id, destination_country_id, year, value, import_value, export_value) VALUES (?, ?, ?, ?, ?, ?)'
        );
        
        let importedCount = 0;
        
        for (const data of tradeData) {
          const sourceId = countryIds[data.source_country];
          const destId = countryIds[data.destination_country];
          
          if (sourceId && destId) {
            await stmt.run(
              sourceId,
              destId,
              data.year,
              data.value,
              data.import_value,
              data.export_value
            );
            importedCount++;
          }
        }
        
        await stmt.finalize();
        console.log(`Imported ${importedCount} trade data records.`);
        resolve();
      })
      .on('error', reject);
  });
}

// Import HS codes from JSON file
async function importHSCodes(db, jsonPath) {
  console.log(`Importing HS codes from ${jsonPath}...`);
  
  try {
    const data = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
    
    // Import HS2 codes
    if (data.hs2 && Array.isArray(data.hs2)) {
      const stmt2 = await db.prepare('INSERT OR IGNORE INTO hs2_codes (code, description, value) VALUES (?, ?, ?)');
      
      for (const item of data.hs2) {
        await stmt2.run(item.code, item.description, item.value);
      }
      
      await stmt2.finalize();
      console.log(`Imported ${data.hs2.length} HS2 codes.`);
    }
    
    // Import HS4 codes
    if (data.hs4 && Array.isArray(data.hs4)) {
      const stmt4 = await db.prepare('INSERT OR IGNORE INTO hs4_codes (code, description, hs2_code, value) VALUES (?, ?, ?, ?)');
      
      for (const item of data.hs4) {
        await stmt4.run(item.code, item.description, item.hs2_code, item.value);
      }
      
      await stmt4.finalize();
      console.log(`Imported ${data.hs4.length} HS4 codes.`);
    }
    
    // Import HS6 codes
    if (data.hs6 && Array.isArray(data.hs6)) {
      const stmt6 = await db.prepare('INSERT OR IGNORE INTO hs6_codes (code, description, hs4_code, hs2_code, value) VALUES (?, ?, ?, ?, ?)');
      
      for (const item of data.hs6) {
        await stmt6.run(item.code, item.description, item.hs4_code, item.hs2_code, item.value);
      }
      
      await stmt6.finalize();
      console.log(`Imported ${data.hs6.length} HS6 codes.`);
    }
    
  } catch (error) {
    console.error('Error importing HS codes:', error);
    throw error;
  }
}

// Import product trade data from CSV file
async function importProductTrade(db, csvPath) {
  console.log(`Importing product trade data from ${csvPath}...`);
  
  return new Promise((resolve, reject) => {
    const productData = [];
    
    fs.createReadStream(csvPath)
      .pipe(csv())
      .on('data', (row) => {
        // Assuming CSV has columns: country, hs_code, hs_level, year, value, import_value, export_value
        productData.push({
          country: row.country,
          hs_code: row.hs_code,
          hs_level: row.hs_level,
          year: parseInt(row.year, 10),
          value: parseFloat(row.value),
          import_value: row.import_value ? parseFloat(row.import_value) : null,
          export_value: row.export_value ? parseFloat(row.export_value) : null
        });
      })
      .on('end', async () => {
        // Get country IDs
        const countryIds = {};
        const countries = await db.all('SELECT id, name FROM countries');
        countries.forEach(country => {
          countryIds[country.name] = country.id;
        });
        
        const stmt = await db.prepare(
          'INSERT INTO product_trade (country_id, hs_code, hs_level, year, value, import_value, export_value) VALUES (?, ?, ?, ?, ?, ?, ?)'
        );
        
        let importedCount = 0;
        
        for (const data of productData) {
          const countryId = countryIds[data.country];
          
          if (countryId) {
            await stmt.run(
              countryId,
              data.hs_code,
              data.hs_level,
              data.year,
              data.value,
              data.import_value,
              data.export_value
            );
            importedCount++;
          }
        }
        
        await stmt.finalize();
        console.log(`Imported ${importedCount} product trade records.`);
        resolve();
      })
      .on('error', reject);
  });
}

// Main function to run the script
async function main() {
  console.log('Starting database creation and import process...');
  
  // Setup the database
  const db = await setupDatabase();
  
  try {
    // Import HS codes from the existing JSON file
    await importHSCodes(db, path.join(__dirname, '../public/data/hs-codes.json'));
    
    // Check if CSV files exist and import data
    const countriesCsvPath = path.join(__dirname, '../data/countries.csv');
    const tradeDataCsvPath = path.join(__dirname, '../data/trade_data.csv');
    const productTradeCsvPath = path.join(__dirname, '../data/product_trade.csv');
    
    if (fs.existsSync(countriesCsvPath)) {
      await importCountries(db, countriesCsvPath);
    } else {
      console.log('Countries CSV file not found. Skipping import.');
    }
    
    if (fs.existsSync(tradeDataCsvPath)) {
      await importTradeData(db, tradeDataCsvPath);
    } else {
      console.log('Trade data CSV file not found. Skipping import.');
    }
    
    if (fs.existsSync(productTradeCsvPath)) {
      await importProductTrade(db, productTradeCsvPath);
    } else {
      console.log('Product trade CSV file not found. Skipping import.');
    }
    
    console.log('Database creation and import process completed successfully!');
  } catch (error) {
    console.error('Error during import process:', error);
  } finally {
    // Close the database connection
    await db.close();
  }
}

// Run the script
main().catch(console.error); 