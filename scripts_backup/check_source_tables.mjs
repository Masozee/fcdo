import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

// Get __dirname equivalent in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const rootDir = path.join(__dirname, '..');
const db = new Database(path.join(rootDir, 'data', 'db.sqlite3'));

// List of tables to check
const tables = [
  'data_category',
  'data_hstradedata',
  'data_internationalcoperation',
  'data_option',
  'data_option_parents',
  'api_productcode',  // Assuming this is what was meant by data_productcode based on previous code
  'data_tradeinvestmentdata'
];

try {
  // Check all tables
  for (const table of tables) {
    console.log(`\n====== ${table} table ======`);
    
    // Check if table exists
    const tableExists = db.prepare(`SELECT name FROM sqlite_master WHERE type='table' AND name=?`).get(table);
    
    if (!tableExists) {
      console.log(`Table ${table} does not exist!`);
      continue;
    }
    
    // Get table structure
    console.log('Table structure:');
    const columns = db.prepare(`PRAGMA table_info(${table})`).all();
    console.table(columns);
    
    // Get row count
    const count = db.prepare(`SELECT COUNT(*) as count FROM ${table}`).get();
    console.log(`Row count: ${count.count}`);
    
    // Get sample data
    console.log('Sample data:');
    const sample = db.prepare(`SELECT * FROM ${table} LIMIT 3`).all();
    console.log(sample);
  }
  
} catch (error) {
  console.error('Error:', error);
} finally {
  db.close();
} 