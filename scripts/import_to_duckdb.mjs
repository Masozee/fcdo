import duckdb from 'duckdb';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

// Get __dirname equivalent in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = path.join(__dirname, '..');

// Paths
const exportDir = path.join(rootDir, 'data', 'export');
const duckDbPath = path.join(rootDir, 'data', 'olap_data.duckdb');

// Tables to import (same as in export_to_csv.mjs)
const tablesToImport = [
  'data_category',
  'data_hstradedata',
  'data_internationalcooperation',
  'data_option',
  'data_option_parents',
  'api_productcode',
  'data_productcode',
  'data_tradeinvestmentdata'
];

// Helper function to run a query on DuckDB
function runQuery(connection, query) {
  return new Promise((resolve, reject) => {
    connection.all(query, (err, result) => {
      if (err) reject(err);
      else resolve(result);
    });
  });
}

// Main function
async function importToDuckDb() {
  console.log('Starting DuckDB import...');
  console.log(`Target DuckDB database: ${duckDbPath}`);
  
  // Connect to DuckDB
  const db = new duckdb.Database(duckDbPath);
  let connection;
  
  try {
    // Create connection
    connection = await new Promise((resolve, reject) => {
      db.connect((err, conn) => {
        if (err) reject(err);
        else resolve(conn);
      });
    });
    
    console.log('Connected to DuckDB');
    
    // Process each table
    for (const tableName of tablesToImport) {
      const schemaFilePath = path.join(exportDir, `${tableName}_schema.json`);
      const csvFilePath = path.join(exportDir, `${tableName}.csv`);
      
      // Check if files exist
      if (!fs.existsSync(schemaFilePath) || !fs.existsSync(csvFilePath)) {
        console.log(`Skipping ${tableName} - schema or CSV file not found`);
        continue;
      }
      
      console.log(`\nProcessing table: ${tableName}`);
      
      // Read schema
      const schema = JSON.parse(fs.readFileSync(schemaFilePath, 'utf8'));
      
      // Create table
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
      
      const createTableQuery = `CREATE TABLE IF NOT EXISTS "${tableName}" (${columns})`;
      console.log(`Creating table: ${tableName}`);
      
      try {
        await runQuery(connection, createTableQuery);
        console.log(`Table ${tableName} created successfully`);
        
        // Import data
        console.log(`Importing data from ${csvFilePath}`);
        const copyQuery = `COPY "${tableName}" FROM '${csvFilePath}' (HEADER, AUTO_DETECT)`;
        
        try {
          await runQuery(connection, copyQuery);
          
          // Count rows
          const countResult = await runQuery(connection, `SELECT COUNT(*) as count FROM "${tableName}"`);
          console.log(`Imported ${countResult[0].count} rows into table ${tableName}`);
        } catch (importErr) {
          console.error(`Error importing data into ${tableName}:`, importErr);
        }
      } catch (tableErr) {
        console.error(`Error creating table ${tableName}:`, tableErr);
      }
    }
    
    // Verify import
    console.log('\nVerifying import results:');
    
    try {
      // Get list of tables
      const tables = await runQuery(connection, 
        `SELECT table_name FROM information_schema.tables WHERE table_schema = 'main'`
      );
      
      console.log(`Found ${tables.length} tables in the database:`);
      
      for (const table of tables) {
        const tableName = table.table_name;
        try {
          const countResult = await runQuery(connection, `SELECT COUNT(*) as count FROM "${tableName}"`);
          console.log(`Table "${tableName}": ${countResult[0].count} rows`);
        } catch (err) {
          console.error(`Error counting rows in ${tableName}:`, err);
        }
      }
    } catch (err) {
      console.error('Error listing tables:', err);
    }
    
    console.log('\nImport to DuckDB completed successfully!');
    
  } catch (error) {
    console.error('Error during import:', error);
  } finally {
    // Close connection and database
    if (connection) {
      connection.close();
    }
    db.close();
  }
}

// Run the import
importToDuckDb().catch(console.error); 