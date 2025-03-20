import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

// Get __dirname equivalent in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const rootDir = path.join(__dirname, '..');
const dbPath = path.join(rootDir, 'data', 'db.sqlite3');

console.log(`Opening database at: ${dbPath}`);
const db = new Database(dbPath);

try {
  // List all tables
  console.log('Available tables:');
  const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table' ORDER BY name").all();
  
  if (tables.length === 0) {
    console.log('No tables found in the database.');
  } else {
    tables.forEach((table, index) => {
      console.log(`${index + 1}. ${table.name}`);
    });
  }
} catch (error) {
  console.error('Error:', error);
} finally {
  db.close();
} 