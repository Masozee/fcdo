const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');

// Define paths
const DB_PATH = path.join(process.cwd(), 'data', 'db.sqlite3');
const CSV_PATH = path.join(process.cwd(), 'data', 'db_backup', 'files', 'country code.csv');

// Open database connection
const db = new sqlite3.Database(DB_PATH, (err) => {
  if (err) {
    console.error('Error opening database:', err.message);
    process.exit(1);
  }
  console.log('Connected to the SQLite database.');
});

// Enable foreign keys
db.run('PRAGMA foreign_keys = ON');

// Create country_code table (if it doesn't exist)
db.run(`
  CREATE TABLE IF NOT EXISTS country_code (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    "alpha-2" TEXT NOT NULL,
    "alpha-3" TEXT NOT NULL,
    "country-code" TEXT NOT NULL,
    "iso_3166-2" TEXT,
    region TEXT,
    "sub-region" TEXT,
    "intermediate-region" TEXT,
    "region-code" TEXT,
    "sub-region-code" TEXT,
    "intermediate-region-code" TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`, (err) => {
  if (err) {
    console.error('Error creating country_code table:', err.message);
    db.close();
    process.exit(1);
  }
  console.log('country_code table created or already exists');
  
  // Check if table already has data
  db.get('SELECT COUNT(*) as count FROM country_code', (err, row) => {
    if (err) {
      console.error('Error checking country_code table:', err.message);
      db.close();
      process.exit(1);
    }
    
    if (row.count > 0) {
      console.log(`country_code table already has ${row.count} rows. Skipping import.`);
      db.close();
      return;
    }
    
    // Import data from CSV
    console.log('Importing country data from CSV...');
    
    // Prepare insert statement
    const stmt = db.prepare(`
      INSERT INTO country_code (
        name, "alpha-2", "alpha-3", "country-code", "iso_3166-2",
        region, "sub-region", "intermediate-region", 
        "region-code", "sub-region-code", "intermediate-region-code"
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    
    // Read CSV and insert rows
    const results = [];
    fs.createReadStream(CSV_PATH)
      .pipe(csv())
      .on('data', (data) => results.push(data))
      .on('end', () => {
        console.log(`Read ${results.length} rows from CSV file`);
        
        db.serialize(() => {
          // Begin transaction
          db.run('BEGIN TRANSACTION');
          
          results.forEach(row => {
            stmt.run(
              row.name,
              row['alpha-2'],
              row['alpha-3'],
              row['country-code'],
              row['iso_3166-2'],
              row.region,
              row['sub-region'],
              row['intermediate-region'],
              row['region-code'],
              row['sub-region-code'],
              row['intermediate-region-code']
            );
          });
          
          // Commit transaction
          db.run('COMMIT', (err) => {
            if (err) {
              console.error('Error committing transaction:', err.message);
            } else {
              console.log(`Successfully imported ${results.length} countries`);
            }
            
            // Finalize statement and close database
            stmt.finalize();
            db.close();
          });
        });
      });
  });
}); 