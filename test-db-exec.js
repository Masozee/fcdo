const { exec } = require('child_process');
const path = require('path');

// Database path
const dbPath = 'E:/Work/fcdo/fcdo/data/olap_data.duckdb';

// Function to execute DuckDB query via CLI
function runQuery(query) {
  return new Promise((resolve, reject) => {
    const command = `../duckdb.exe "${dbPath}" "${query}" -json`;
    
    console.log(`Executing: ${command}`);
    
    exec(command, (error, stdout, stderr) => {
      if (error) {
        console.error(`Error executing query: ${error.message}`);
        reject(error);
        return;
      }
      
      if (stderr) {
        console.error(`Query stderr: ${stderr}`);
      }
      
      try {
        const result = JSON.parse(stdout);
        resolve(result);
      } catch (e) {
        console.error('Error parsing JSON result:', e);
        console.log('Raw output:', stdout);
        reject(e);
      }
    });
  });
}

// Test queries
async function testDatabase() {
  try {
    console.log('Testing DuckDB database connection...');
    
    // Get list of tables
    console.log('\nListing tables:');
    const tables = await runQuery('SHOW TABLES');
    console.log(tables);
    
    // Query sample data from data_productcode
    console.log('\nSample product codes:');
    const products = await runQuery('SELECT * FROM "data_productcode" LIMIT 5');
    console.log(products);
    
    // Query sample data from data_hstradedata
    console.log('\nSample trade data:');
    const tradeData = await runQuery('SELECT * FROM "data_hstradedata" LIMIT 5');
    console.log(tradeData);
    
    console.log('\nTests completed successfully');
  } catch (error) {
    console.error('Test failed:', error);
  }
}

// Run tests
testDatabase(); 