const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

// Define paths
const projectRoot = path.resolve(__dirname, '..');
const dataDir = path.join(projectRoot, 'data');
const dbPath = path.join(dataDir, 'olap_data.duckdb');

// Check if data directory exists, create if not
if (!fs.existsSync(dataDir)) {
  console.log(`Creating data directory at: ${dataDir}`);
  fs.mkdirSync(dataDir, { recursive: true });
}

// Check if database file exists
if (!fs.existsSync(dbPath)) {
  console.log(`DuckDB database file not found at: ${dbPath}`);
  console.log('Creating a new DuckDB database...');
  
  // Create a new database with sample schemas
  initializeDuckDB();
} else {
  console.log(`DuckDB database file found at: ${dbPath}`);
  console.log('Testing database connection...');
  
  // Test the existing database
  testDuckDB();
}

// Function to initialize a new DuckDB database
function initializeDuckDB() {
  const initScript = `
  -- Create product code table
  CREATE TABLE data_productcode (
    id INTEGER PRIMARY KEY,
    code VARCHAR NOT NULL,
    name VARCHAR NOT NULL,
    hs_level INTEGER NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );
  
  -- Create HS trade data table
  CREATE TABLE data_hstradedata (
    id INTEGER PRIMARY KEY,
    reporter VARCHAR NOT NULL,
    reporter_iso VARCHAR NOT NULL,
    partner VARCHAR NOT NULL,
    partner_iso VARCHAR NOT NULL,
    year INTEGER NOT NULL,
    trade_flow VARCHAR NOT NULL,
    hs_code VARCHAR NOT NULL,
    hs_description VARCHAR NOT NULL,
    trade_value_usd DECIMAL(20, 2) NOT NULL,
    quantity DECIMAL(20, 2),
    quantity_unit VARCHAR,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );
  
  -- Insert sample product codes
  INSERT INTO data_productcode (id, code, name, hs_level) VALUES
  (1, '27', 'Mineral fuels, mineral oils and products of their distillation; bituminous substances; mineral waxes', 2),
  (2, '57', 'Carpets and other textile floor coverings', 2),
  (3, '74', 'Copper and articles thereof', 2);
  
  -- Insert sample trade data
  INSERT INTO data_hstradedata (id, reporter, reporter_iso, partner, partner_iso, year, trade_flow, hs_code, hs_description, trade_value_usd, quantity, quantity_unit) VALUES
  (1, 'United States', 'USA', 'China', 'CHN', 2022, 'Export', '27', 'Mineral fuels, mineral oils', 1500000.00, 10000, 'Tons'),
  (2, 'United States', 'USA', 'Japan', 'JPN', 2022, 'Import', '57', 'Carpets and other textile floor coverings', 750000.00, 5000, 'Units'),
  (3, 'Germany', 'DEU', 'France', 'FRA', 2022, 'Export', '74', 'Copper and articles thereof', 2000000.00, 8000, 'Tons');
  
  -- Show the tables
  SHOW TABLES;
  `;
  
  console.log('Running initialization script...');
  runDuckDBScript(initScript);
}

// Function to test the DuckDB connection
function testDuckDB() {
  const testScript = `
  -- Show tables
  SHOW TABLES;
  
  -- Get sample data from product codes
  SELECT * FROM data_productcode LIMIT 3;
  
  -- Get sample data from trade data
  SELECT * FROM data_hstradedata LIMIT 3;
  `;
  
  console.log('Running test script...');
  runDuckDBScript(testScript);
}

// Function to run a DuckDB script
function runDuckDBScript(script) {
  try {
    // Create a temporary SQL file
    const tempFilePath = path.join(process.env.TMPDIR || '/tmp', `duckdb_script_${Date.now()}.sql`);
    fs.writeFileSync(tempFilePath, script);
    
    console.log(`Temporary SQL file created at: ${tempFilePath}`);
    
    // Run DuckDB with the script file
    const duckdbProcess = spawn('duckdb', [
      dbPath,
      '-c', `.read ${tempFilePath}`
    ]);
    
    let stdout = '';
    let stderr = '';
    
    duckdbProcess.stdout.on('data', (data) => {
      stdout += data.toString();
      process.stdout.write(data);
    });
    
    duckdbProcess.stderr.on('data', (data) => {
      stderr += data.toString();
      process.stderr.write(data);
    });
    
    duckdbProcess.on('close', (code) => {
      // Clean up the temporary file
      try {
        fs.unlinkSync(tempFilePath);
        console.log(`Temporary SQL file removed`);
      } catch (error) {
        console.error(`Error removing temporary file: ${error.message}`);
      }
      
      if (code !== 0) {
        console.error(`DuckDB process exited with code ${code}`);
        console.error(`stderr: ${stderr}`);
      } else {
        console.log('DuckDB script executed successfully');
      }
    });
    
    duckdbProcess.on('error', (error) => {
      console.error('Error spawning DuckDB process:', error);
    });
  } catch (error) {
    console.error('Error executing DuckDB script:', error);
  }
} 