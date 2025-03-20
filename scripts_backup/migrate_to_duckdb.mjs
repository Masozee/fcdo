import Database from 'better-sqlite3';
import duckdb from 'duckdb';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import fs from 'fs';

// Get __dirname equivalent in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = path.join(__dirname, '..');

// Source and target database paths
const sourceDbPath = path.join(rootDir, 'data', 'db.sqlite3');
const targetDbPath = path.join(rootDir, 'data', 'olap_data.duckdb');

// Helper function to get SQLite table schema
function getSqliteTableSchema(sqlite, tableName) {
  return sqlite.prepare(`PRAGMA table_info(${tableName})`).all();
}

// Helper function to get SQLite table data
function getSqliteTableData(sqlite, tableName) {
  return sqlite.prepare(`SELECT * FROM ${tableName}`).all();
}

// Create DuckDB connection
const db = new duckdb.Database(targetDbPath);
const con = new Promise((resolve, reject) => {
  db.connect((err, conn) => {
    if (err) reject(err);
    else resolve(conn);
  });
});

// Tables to migrate
const tablesToMigrate = [
  'data_category',
  'data_hstradedata',
  'data_internationalcoperation',
  'data_option',
  'data_option_parents',
  'api_productcode',  // From previous context
  'data_tradeinvestmentdata'
];

// Helper function to run queries in DuckDB
function runDuckDbQuery(connection, query) {
  return new Promise((resolve, reject) => {
    connection.all(query, (err, result) => {
      if (err) reject(err);
      else resolve(result);
    });
  });
}

// Helper function to create DuckDB table based on SQLite schema
async function createDuckDbTable(connection, schema, tableName) {
  const columns = schema.map(col => {
    // Map SQLite types to DuckDB types
    let type = col.type.toUpperCase();
    
    if (type.includes('VARCHAR') || type === 'TEXT') {
      type = 'VARCHAR';
    } else if (type === 'INTEGER') {
      type = 'BIGINT';
    } else if (type === 'REAL') {
      type = 'DOUBLE';
    } else if (type === 'DECIMAL') {
      type = 'DECIMAL(18,6)';
    } else if (type === 'DATE') {
      type = 'DATE';
    } else if (type === 'DATETIME') {
      type = 'TIMESTAMP';
    } else if (type === 'BLOB') {
      type = 'BLOB';
    } else {
      // Default to VARCHAR for unknown types
      type = 'VARCHAR';
    }
    
    // Handle primary key and not null constraints
    const constraints = [];
    if (col.pk === 1) {
      constraints.push('PRIMARY KEY');
    }
    if (col.notnull === 1) {
      constraints.push('NOT NULL');
    }
    
    return `"${col.name}" ${type} ${constraints.join(' ')}`;
  }).join(', ');
  
  const createTableSql = `CREATE TABLE IF NOT EXISTS "${tableName}" (${columns})`;
  console.log(`Creating table: ${tableName}`);
  console.log(createTableSql);
  
  return runDuckDbQuery(connection, createTableSql);
}

// Helper function to insert data into DuckDB
async function insertDataIntoDuckDb(connection, data, tableName) {
  if (data.length === 0) {
    console.log(`No data to insert for table: ${tableName}`);
    return;
  }
  
  // Get column names from first row
  const columns = Object.keys(data[0]);
  
  // Create a temporary CSV file for bulk loading
  const tempCsvPath = path.join(rootDir, 'data', `${tableName}_temp.csv`);
  
  // Write headers
  let csvContent = columns.map(col => `"${col}"`).join(',') + '\n';
  
  // Convert data to CSV
  csvContent += data.map(row => {
    return Object.values(row).map(val => {
      if (val === null) return '';
      if (typeof val === 'string') return `"${val.replace(/"/g, '""')}"`;
      return val;
    }).join(',');
  }).join('\n');
  
  // Write CSV to file
  fs.writeFileSync(tempCsvPath, csvContent);
  
  // Load CSV into DuckDB
  const copyStatement = `COPY "${tableName}" FROM '${tempCsvPath}' (AUTO_DETECT TRUE);`;
  
  console.log(`Importing data into ${tableName}...`);
  try {
    await runDuckDbQuery(connection, copyStatement);
  } catch (err) {
    console.error(`Error importing data: ${err.message}`);
    throw err;
  } finally {
    // Remove temp file
    try {
      fs.unlinkSync(tempCsvPath);
    } catch (e) {
      console.error(`Error removing temp file: ${e.message}`);
    }
  }
}

async function migrateData() {
  console.log(`Starting migration from SQLite to DuckDB...`);
  console.log(`Source: ${sourceDbPath}`);
  console.log(`Target: ${targetDbPath}`);
  
  let connection;
  
  try {
    // Open SQLite database
    const sqlite = new Database(sourceDbPath);
    
    // Get DuckDB connection
    connection = await con;
    
    // Get list of tables that actually exist in the source database
    const existingTables = sqlite.prepare(
      "SELECT name FROM sqlite_master WHERE type='table' AND name IN (" + 
      tablesToMigrate.map(() => "?").join(",") + ")"
    ).all(tablesToMigrate);
    
    console.log(`Found ${existingTables.length} tables to migrate:`);
    existingTables.forEach((table, i) => console.log(`${i + 1}. ${table.name}`));
    
    // Migrate each table
    for (const table of existingTables) {
      const tableName = table.name;
      console.log(`\nMigrating table: ${tableName}`);
      
      // Get schema and data
      const schema = getSqliteTableSchema(sqlite, tableName);
      
      // Create the table in DuckDB
      await createDuckDbTable(connection, schema, tableName);
      
      // Get count of rows
      const countResult = sqlite.prepare(`SELECT COUNT(*) as count FROM ${tableName}`).get();
      console.log(`Found ${countResult.count} rows to migrate`);
      
      // Migrate data in batches for larger tables
      const batchSize = 10000;
      const totalRows = countResult.count;
      
      if (totalRows <= batchSize) {
        // Small table, migrate in one go
        const data = getSqliteTableData(sqlite, tableName);
        await insertDataIntoDuckDb(connection, data, tableName);
      } else {
        // Large table, migrate in batches
        const batches = Math.ceil(totalRows / batchSize);
        console.log(`Migrating in ${batches} batches of ${batchSize} rows each`);
        
        for (let i = 0; i < batches; i++) {
          const offset = i * batchSize;
          console.log(`Batch ${i + 1}/${batches}, rows ${offset + 1}-${Math.min(offset + batchSize, totalRows)}`);
          
          const batchData = sqlite.prepare(`SELECT * FROM ${tableName} LIMIT ? OFFSET ?`).all(batchSize, offset);
          await insertDataIntoDuckDb(connection, batchData, tableName);
          
          console.log(`Completed ${Math.min((i + 1) * batchSize, totalRows)}/${totalRows} rows (${((i + 1) * batchSize / totalRows * 100).toFixed(2)}%)`);
        }
      }
      
      // Verify data
      const result = await runDuckDbQuery(connection, `SELECT COUNT(*) as count FROM "${tableName}"`);
      console.log(`Verified ${result[0].count}/${totalRows} rows migrated for ${tableName}`);
    }
    
    // Close SQLite connection
    sqlite.close();
    
    console.log(`\nMigration completed successfully!`);
    console.log(`All ${existingTables.length} tables migrated to DuckDB at ${targetDbPath}`);
    
  } catch (error) {
    console.error('Error during migration:', error);
  } finally {
    // Close DuckDB connection
    if (connection) {
      connection.close();
    }
    db.close();
  }
}

// Run the migration
migrateData().catch(console.error); 