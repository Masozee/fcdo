import path from 'path';
import fs from 'fs';
import sqlite3 from 'sqlite3';
import { open } from 'sqlite';

// Define the database path
const DB_PATH = path.join(process.cwd(), 'data', 'trade_data.sqlite');

// Helper functions duplicated from the sqlite module for script independence
function ensureDbDirectory() {
  const dbDir = path.dirname(DB_PATH);
  if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true });
  }
}

async function openDb() {
  ensureDbDirectory();
  
  return open({
    filename: DB_PATH,
    driver: sqlite3.Database
  });
}

async function initializeDatabase() {
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
async function importCountriesFromCsv(csvPath: string) {
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
    
    // Skip header row
    const dataRows = lines.slice(1);
    
    // Prepare statement for insertion
    const stmt = await db.prepare(`
      INSERT INTO countries (name, alpha2, alpha3, country_code, region, sub_region, intermediate_region)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);
    
    // Process each row
    let importedCount = 0;
    for (const row of dataRows) {
      if (!row.trim()) continue;
      
      const columns = row.split(',');
      if (columns.length < 8) continue;
      
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
      importedCount++;
    }
    
    await stmt.finalize();
    console.log(`Imported ${importedCount} countries to the database`);
  } catch (error) {
    console.error('Error importing countries from CSV:', error);
    throw error;
  } finally {
    await db.close();
  }
}

async function addSampleData() {
  const db = await openDb();
  
  try {
    // Add sample product categories
    console.log('Adding sample product categories...');
    
    const productCategories = [
      { code: '01', name: 'Live animals', level: 2 },
      { code: '02', name: 'Meat and edible meat offal', level: 2 },
      { code: '10', name: 'Cereals', level: 2 },
      { code: '27', name: 'Mineral fuels, mineral oils', level: 2 },
      { code: '84', name: 'Machinery, mechanical appliances', level: 2 },
      { code: '85', name: 'Electrical machinery and equipment', level: 2 },
      { code: '8471', name: 'Automatic data processing machines', level: 4, parent_code: '84' },
      { code: '8517', name: 'Telephone sets', level: 4, parent_code: '85' },
      { code: '847130', name: 'Portable digital automatic data processing machines', level: 6, parent_code: '8471' },
      { code: '851712', name: 'Smartphones', level: 6, parent_code: '8517' }
    ];
    
    // Clear existing data
    await db.exec('DELETE FROM product_categories');
    
    // Insert product categories
    for (const category of productCategories) {
      await db.run(
        'INSERT INTO product_categories (code, name, parent_code, level) VALUES (?, ?, ?, ?)',
        [category.code, category.name, category.parent_code || null, category.level]
      );
    }
    
    // Add sample trade data
    console.log('Adding sample trade data...');
    
    // Get some country codes for sample data
    const countries = await db.all('SELECT alpha3 FROM countries LIMIT 10');
    const countryCodes = countries.map((c: any) => c.alpha3);
    
    if (countryCodes.length === 0) {
      console.log('No countries found. Make sure countries were imported correctly.');
      return;
    }
    
    // Clear existing data
    await db.exec('DELETE FROM trade_data');
    await db.exec('DELETE FROM product_trade');
    
    // Current year
    const currentYear = new Date().getFullYear();
    
    // Insert trade data between countries
    for (let i = 0; i < countryCodes.length; i++) {
      for (let j = 0; j < countryCodes.length; j++) {
        if (i !== j) {
          const importValue = Math.floor(Math.random() * 1000000000);
          const exportValue = Math.floor(Math.random() * 1000000000);
          const totalTrade = importValue + exportValue;
          
          await db.run(
            'INSERT INTO trade_data (year, reporter_iso, partner_iso, import_value, export_value, total_trade) VALUES (?, ?, ?, ?, ?, ?)',
            [currentYear, countryCodes[i], countryCodes[j], importValue, exportValue, totalTrade]
          );
        }
      }
    }
    
    // Insert product trade data
    for (const category of productCategories) {
      for (let i = 0; i < countryCodes.length; i++) {
        // Skip some combinations randomly to make the data more realistic
        if (Math.random() > 0.3) {
          const importValue = Math.floor(Math.random() * 100000000);
          const exportValue = Math.floor(Math.random() * 100000000);
          const totalTrade = importValue + exportValue;
          
          // Generate a random percentage of total trade (1-20%)
          const percentOfTotal = parseFloat((Math.random() * 19 + 1).toFixed(2));
          
          await db.run(
            'INSERT INTO product_trade (year, reporter_iso, partner_iso, product_code, import_value, export_value, total_trade, percent_of_total) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
            [
              currentYear, 
              countryCodes[i], 
              countryCodes[(i + 1) % countryCodes.length], // Circular partner assignment
              category.code,
              importValue,
              exportValue,
              totalTrade,
              percentOfTotal
            ]
          );
        }
      }
    }
    
    console.log('Sample data added successfully');
  } catch (error) {
    console.error('Error adding sample data:', error);
    throw error;
  } finally {
    await db.close();
  }
}

async function main() {
  try {
    // Initialize the database with required tables
    console.log('Initializing database...');
    await initializeDatabase();
    
    // Import countries from CSV
    const csvPath = path.join(process.cwd(), 'data', 'country code.csv');
    console.log(`Importing countries from ${csvPath}...`);
    await importCountriesFromCsv(csvPath);
    
    // Add sample data for testing
    console.log('Adding sample data for testing...');
    await addSampleData();
    
    console.log('Database initialization completed successfully');
  } catch (error) {
    console.error('Error initializing database:', error);
    process.exit(1);
  }
}

main(); 