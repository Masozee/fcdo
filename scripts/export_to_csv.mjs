import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import fs from 'fs';

// Get __dirname equivalent in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = path.join(__dirname, '..');

// Source database path
const sourceDbPath = path.join(rootDir, 'data', 'db.sqlite3');

// Tables to export
const tablesToExport = [
  'data_category',
  'data_hstradedata',
  'data_internationalcooperation',
  'data_option',
  'data_option_parents',
  'api_productcode',
  'data_productcode',
  'data_tradeinvestmentdata'
];

// Export directory
const exportDir = path.join(rootDir, 'data', 'export');

// Create export directory if it doesn't exist
if (!fs.existsSync(exportDir)) {
  fs.mkdirSync(exportDir, { recursive: true });
}

// Helper function to get SQLite table schema
function getTableSchema(sqlite, tableName) {
  return sqlite.prepare(`PRAGMA table_info(${tableName})`).all();
}

// Helper function to escape CSV values
function escapeCsv(value) {
  if (value === null || value === undefined) return '';
  if (typeof value === 'string') {
    // Double escape quotes and wrap in quotes
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

// Main export function
async function exportTables() {
  console.log(`Starting export from SQLite to CSV...`);
  console.log(`Source: ${sourceDbPath}`);
  console.log(`Export directory: ${exportDir}`);
  
  try {
    // Open SQLite database
    const sqlite = new Database(sourceDbPath);
    
    // Get list of tables that actually exist in the source database
    const existingTables = sqlite.prepare(
      "SELECT name FROM sqlite_master WHERE type='table' AND name IN (" + 
      tablesToExport.map(() => "?").join(",") + ")"
    ).all(tablesToExport);
    
    console.log(`Found ${existingTables.length} tables to export:`);
    existingTables.forEach((table, i) => console.log(`${i + 1}. ${table.name}`));
    
    for (const table of existingTables) {
      const tableName = table.name;
      console.log(`\nExporting table: ${tableName}`);
      
      // Get schema
      const schema = getTableSchema(sqlite, tableName);
      const columnNames = schema.map(col => col.name);
      
      // Create CSV file
      const csvFilePath = path.join(exportDir, `${tableName}.csv`);
      const writeStream = fs.createWriteStream(csvFilePath);
      
      // Write header
      writeStream.write(columnNames.map(name => `"${name}"`).join(',') + '\n');
      
      // Get row count
      const countResult = sqlite.prepare(`SELECT COUNT(*) as count FROM ${tableName}`).get();
      const totalRows = countResult.count;
      console.log(`Found ${totalRows} rows to export`);
      
      // Export in batches
      const batchSize = 10000;
      
      if (totalRows <= batchSize) {
        // Small table, export in one go
        const rows = sqlite.prepare(`SELECT * FROM ${tableName}`).all();
        for (const row of rows) {
          const csvLine = columnNames.map(col => escapeCsv(row[col])).join(',');
          writeStream.write(csvLine + '\n');
        }
      } else {
        // Large table, export in batches
        const batches = Math.ceil(totalRows / batchSize);
        console.log(`Exporting in ${batches} batches of ${batchSize} rows each`);
        
        for (let i = 0; i < batches; i++) {
          const offset = i * batchSize;
          console.log(`Batch ${i + 1}/${batches}, rows ${offset + 1}-${Math.min(offset + batchSize, totalRows)}`);
          
          const rows = sqlite.prepare(`SELECT * FROM ${tableName} LIMIT ? OFFSET ?`).all(batchSize, offset);
          for (const row of rows) {
            const csvLine = columnNames.map(col => escapeCsv(row[col])).join(',');
            writeStream.write(csvLine + '\n');
          }
          
          console.log(`Completed ${Math.min((i + 1) * batchSize, totalRows)}/${totalRows} rows (${((i + 1) * batchSize / totalRows * 100).toFixed(2)}%)`);
        }
      }
      
      // Close the write stream
      writeStream.end();
      console.log(`Exported table ${tableName} to ${csvFilePath}`);
      
      // Also export schema information for later use with DuckDB
      const schemaFilePath = path.join(exportDir, `${tableName}_schema.json`);
      fs.writeFileSync(schemaFilePath, JSON.stringify(schema, null, 2));
    }
    
    // Close SQLite connection
    sqlite.close();
    
    console.log(`\nExport completed successfully!`);
    console.log(`All ${existingTables.length} tables exported to CSV files in ${exportDir}`);
    
    // Generate DuckDB import script
    generateDuckDbImportScript(existingTables.map(t => t.name));
    
  } catch (error) {
    console.error('Error during export:', error);
  }
}

// Generate DuckDB import script
function generateDuckDbImportScript(tableNames) {
  const importScriptPath = path.join(exportDir, 'import_to_duckdb.sql');
  let scriptContent = `-- DuckDB import script\n\n`;
  
  for (const tableName of tableNames) {
    // Read schema information
    const schemaFilePath = path.join(exportDir, `${tableName}_schema.json`);
    const schema = JSON.parse(fs.readFileSync(schemaFilePath, 'utf8'));
    
    // Create table statement
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
    }).join(',\n  ');
    
    scriptContent += `-- Create table ${tableName}\n`;
    scriptContent += `CREATE TABLE IF NOT EXISTS "${tableName}" (\n  ${columns}\n);\n\n`;
    
    // Import data statement
    scriptContent += `-- Import data into ${tableName}\n`;
    scriptContent += `COPY "${tableName}" FROM '${path.join(exportDir, tableName + '.csv')}' (HEADER, AUTO_DETECT);\n\n`;
  }
  
  // Add command for running the script
  const commandInstructions = `
-- To import this data into DuckDB, run:
-- duckdb olap_data.duckdb < import_to_duckdb.sql
`;
  scriptContent += commandInstructions;
  
  // Write the script file
  fs.writeFileSync(importScriptPath, scriptContent);
  console.log(`Generated DuckDB import script at ${importScriptPath}`);
}

// Run the export
exportTables().catch(console.error); 