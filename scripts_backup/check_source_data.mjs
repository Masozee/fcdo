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
  // Check api_productcode table
  console.log('api_productcode table structure:');
  const productCodeColumns = db.prepare('PRAGMA table_info(api_productcode)').all();
  console.log(productCodeColumns);
  
  console.log('\nSample data from api_productcode:');
  const sampleProductCodes = db.prepare('SELECT * FROM api_productcode LIMIT 5').all();
  console.log(sampleProductCodes);
  
  // Check data_hstradedata table
  console.log('\ndata_hstradedata table structure:');
  const tradeDataColumns = db.prepare('PRAGMA table_info(data_hstradedata)').all();
  console.log(tradeDataColumns);
  
  console.log('\nSample data from data_hstradedata:');
  const sampleTradeData = db.prepare('SELECT * FROM data_hstradedata LIMIT 5').all();
  console.log(sampleTradeData);
  
  // Get counts
  const productCodeCount = db.prepare('SELECT COUNT(*) as count FROM api_productcode').get();
  const tradeDataCount = db.prepare('SELECT COUNT(*) as count FROM data_hstradedata').get();
  
  console.log('\nRecord counts:');
  console.log('api_productcode:', productCodeCount.count);
  console.log('data_hstradedata:', tradeDataCount.count);
} catch (error) {
  console.error('Error:', error);
} finally {
  db.close();
} 