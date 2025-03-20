import duckdb from 'duckdb';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

// Get __dirname equivalent in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = path.join(__dirname, '..');

// Path to DuckDB database
const duckDbPath = path.join(rootDir, 'data', 'olap_data.duckdb');

console.log(`Checking DuckDB database at: ${duckDbPath}`);

// Helper function to run a query
function runQuery(connection, query) {
  return new Promise((resolve, reject) => {
    console.log(`Running query: ${query}`);
    connection.all(query, (err, result) => {
      if (err) {
        console.error(`Query error: ${err.message}`);
        reject(err);
      } else {
        resolve(result);
      }
    });
  });
}

async function checkDatabase() {
  // Connect to DuckDB
  const db = new duckdb.Database(duckDbPath);
  let connection;
  
  try {
    // Create connection
    connection = await new Promise((resolve, reject) => {
      db.connect((err, conn) => {
        if (err) {
          console.error(`Connection error: ${err.message}`);
          reject(err);
        } else {
          console.log('Connected to DuckDB successfully');
          resolve(conn);
        }
      });
    });

    // List all tables
    const tables = await runQuery(connection, 
      `SELECT table_name FROM information_schema.tables WHERE table_schema = 'main'`
    );
    
    console.log(`\nFound ${tables.length} tables in the database:`);
    
    for (const table of tables) {
      const tableName = table.table_name;
      console.log(`\nTable: ${tableName}`);
      
      // Get column info
      const columns = await runQuery(connection, 
        `SELECT column_name, data_type FROM information_schema.columns 
         WHERE table_schema = 'main' AND table_name = '${tableName}'`
      );
      
      console.log('Columns:');
      columns.forEach(col => {
        console.log(`  - ${col.column_name} (${col.data_type})`);
      });
      
      // Count rows
      const countResult = await runQuery(connection, `SELECT COUNT(*) as count FROM "${tableName}"`);
      console.log(`Row count: ${countResult[0].count}`);
      
      // Sample data
      if (countResult[0].count > 0) {
        const sample = await runQuery(connection, `SELECT * FROM "${tableName}" LIMIT 3`);
        console.log('Sample data:');
        console.log(sample);
      }
    }
    
  } catch (error) {
    console.error('Error checking database:', error);
  } finally {
    // Close connection and database
    if (connection) {
      connection.close();
    }
    db.close();
  }
}

// Run the check
checkDatabase().catch(console.error); 