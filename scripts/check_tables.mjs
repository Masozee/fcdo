import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

// Get __dirname equivalent in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const rootDir = path.join(__dirname, '..');
const db = new Database(path.join(rootDir, 'data', 'db.sqlite3'));

try {
  // Get all table names
  const tables = db.prepare(`
    SELECT name 
    FROM sqlite_master 
    WHERE type='table'
    ORDER BY name;
  `).all();
  
  console.log('Tables in database:');
  console.log(tables);
  
  // For each table, get its structure
  for (const table of tables) {
    console.log(`\nStructure of table ${table.name}:`);
    const columns = db.prepare(`PRAGMA table_info(${table.name});`).all();
    console.log(columns);
    
    // Get a sample row
    console.log(`\nSample row from ${table.name}:`);
    const sampleRow = db.prepare(`SELECT * FROM ${table.name} LIMIT 1;`).get();
    console.log(sampleRow);
  }
} catch (error) {
  console.error('Error:', error);
} finally {
  db.close();
} 