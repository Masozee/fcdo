const duckdb = require('duckdb');
const fs = require('fs');

const dbPath = 'E:/Work/fcdo/fcdo/data/olap_data.duckdb';

// Check if database file exists
if (!fs.existsSync(dbPath)) {
  console.error(`DuckDB database file not found at: ${dbPath}`);
  process.exit(1);
}

console.log(`Testing connection to database at: ${dbPath}`);

// Create database connection
const db = new duckdb.Database(dbPath);

// Connect to database
db.connect((err, conn) => {
  if (err) {
    console.error('Database connection error:', err);
    process.exit(1);
  }
  
  console.log('Database connection established successfully');
  
  // Test query - show tables
  conn.all('SHOW TABLES', (err, tables) => {
    if (err) {
      console.error('Error querying tables:', err);
      process.exit(1);
    }
    
    console.log('Tables in database:');
    console.table(tables);
    
    // Test query - get product codes
    conn.all('SELECT * FROM "data_productcode" LIMIT 5', (err, products) => {
      if (err) {
        console.error('Error querying product codes:', err);
        process.exit(1);
      }
      
      console.log('Sample product codes:');
      console.table(products);
      
      // Close connection
      conn.close();
      db.close();
      console.log('Database connection closed');
    });
  });
}); 