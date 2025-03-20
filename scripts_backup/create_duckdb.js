const fs = require('fs');
const path = require('path');
const sqlite3 = require('better-sqlite3');

// Paths
const rootDir = path.join(__dirname, '..');
const sourceDbPath = path.join(rootDir, 'data', 'db.sqlite3');
const exportDir = path.join(rootDir, 'data', 'export');

// Ensure export directory exists
if (!fs.existsSync(exportDir)) {
  fs.mkdirSync(exportDir, { recursive: true });
}

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

// Create SQLite database connection
console.log(`Opening source database: ${sourceDbPath}`);
const db = sqlite3(sourceDbPath);

// Get list of tables that actually exist
const existingTables = db.prepare(
  "SELECT name FROM sqlite_master WHERE type='table' AND name IN (" + 
  tablesToExport.map(() => "?").join(",") + ")"
).all(tablesToExport);

console.log(`Found ${existingTables.length} tables to export to CSV for DuckDB:`);
existingTables.forEach((table, i) => console.log(`${i + 1}. ${table.name}`));

// Create a shell script to import into DuckDB
const shellScriptPath = path.join(exportDir, 'import_to_duckdb.bat');
let shellScript = `@echo off\necho Starting DuckDB import...\n\n`;

// Process each table
for (const table of existingTables) {
  const tableName = table.name;
  console.log(`\nExporting table: ${tableName}`);
  
  // Get table schema
  const schema = db.prepare(`PRAGMA table_info(${tableName})`).all();
  const columnNames = schema.map(col => col.name);
  
  // Get row count
  const countResult = db.prepare(`SELECT COUNT(*) as count FROM ${tableName}`).get();
  console.log(`Table has ${countResult.count} rows`);
  
  // Create CSV file
  const csvFilePath = path.join(exportDir, `${tableName}.csv`);
  const csvStream = fs.createWriteStream(csvFilePath);
  
  // Write CSV header
  csvStream.write(columnNames.map(name => `"${name}"`).join(',') + '\n');
  
  // Write data in batches
  const batchSize = 10000;
  const totalRows = countResult.count;
  
  if (totalRows <= batchSize) {
    // Small table, do in one go
    const rows = db.prepare(`SELECT * FROM ${tableName}`).all();
    for (const row of rows) {
      const values = columnNames.map(col => {
        const val = row[col];
        if (val === null || val === undefined) return '';
        if (typeof val === 'string') return `"${val.replace(/"/g, '""')}"`;
        return val;
      });
      csvStream.write(values.join(',') + '\n');
    }
  } else {
    // Large table, process in batches
    const batches = Math.ceil(totalRows / batchSize);
    console.log(`Processing in ${batches} batches...`);
    
    for (let i = 0; i < batches; i++) {
      const offset = i * batchSize;
      const limit = Math.min(batchSize, totalRows - offset);
      console.log(`Batch ${i+1}/${batches}: ${offset+1}-${offset+limit}`);
      
      const rows = db.prepare(`SELECT * FROM ${tableName} LIMIT ? OFFSET ?`).all(limit, offset);
      for (const row of rows) {
        const values = columnNames.map(col => {
          const val = row[col];
          if (val === null || val === undefined) return '';
          if (typeof val === 'string') return `"${val.replace(/"/g, '""')}"`;
          return val;
        });
        csvStream.write(values.join(',') + '\n');
      }
    }
  }
  
  // Close CSV file
  csvStream.end();
  console.log(`Exported to ${csvFilePath}`);
  
  // Create SQL file for DuckDB
  const sqlFilePath = path.join(exportDir, `${tableName}.sql`);
  let sqlContent = '';
  
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
  
  sqlContent += `-- Create table ${tableName}\n`;
  sqlContent += `CREATE TABLE IF NOT EXISTS "${tableName}" (\n  ${columns}\n);\n\n`;
  
  // Copy statement
  sqlContent += `-- Import data\n`;
  sqlContent += `COPY "${tableName}" FROM '${csvFilePath.replace(/\\/g, '\\\\')}' (HEADER, AUTO_DETECT);\n\n`;
  
  // Write SQL file
  fs.writeFileSync(sqlFilePath, sqlContent);
  
  // Add to shell script
  shellScript += `echo Processing ${tableName}...\n`;
  shellScript += `duckdb data/olap_data.duckdb ".read data/export/${tableName}.sql"\n\n`;
}

// Add verification to shell script
shellScript += `echo Verifying import...\n`;
shellScript += `duckdb data/olap_data.duckdb "SELECT table_name, COUNT(*) as row_count FROM information_schema.tables JOIN (SELECT table_name as tn, COUNT(*) as cnt FROM main.data_category GROUP BY table_name) ON table_name = tn WHERE table_schema = 'main'"\n`;
shellScript += `echo Import completed!\n`;

// Write shell script
fs.writeFileSync(shellScriptPath, shellScript);
console.log(`\nCreated import script at: ${shellScriptPath}`);
console.log(`To import into DuckDB, install the DuckDB CLI and run: ${shellScriptPath}`);

// Clean up
db.close();
console.log('Done!'); 