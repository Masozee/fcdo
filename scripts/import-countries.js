// Import country data from CSV to SQLite database
const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');
const path = require('path');
const csvParser = require('csv-parser');

// Database path
const dbPath = path.join(process.cwd(), 'db.sqlite3');
const csvPath = path.join(process.cwd(), 'data', 'country code.csv');

// Create countries table if it doesn't exist
function createCountriesTable(db) {
  return new Promise((resolve, reject) => {
    db.run(`
      CREATE TABLE IF NOT EXISTS countries (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        alpha2 TEXT NOT NULL,
        alpha3 TEXT NOT NULL,
        country_code TEXT NOT NULL,
        region TEXT,
        sub_region TEXT,
        intermediate_region TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `, (err) => {
      if (err) reject(err);
      else resolve();
    });
  });
}

// Import countries from CSV
function importCountries() {
  // Open database connection
  const db = new sqlite3.Database(dbPath);
  
  db.serialize(async () => {
    try {
      // Create table if it doesn't exist
      await createCountriesTable(db);
      
      // Check if countries table already has data
      db.get('SELECT COUNT(*) as count FROM countries', [], (err, row) => {
        if (err) {
          console.error('Error checking countries table:', err);
          db.close();
          return;
        }
        
        if (row.count > 0) {
          console.log(`Countries table already has ${row.count} records. Skipping import.`);
          db.close();
          return;
        }
        
        // Prepare statement for insertion
        const stmt = db.prepare(`
          INSERT INTO countries (name, alpha2, alpha3, country_code, region, sub_region, intermediate_region)
          VALUES (?, ?, ?, ?, ?, ?, ?)
        `);
        
        // Process CSV file
        fs.createReadStream(csvPath)
          .pipe(csvParser())
          .on('data', (row) => {
            stmt.run(
              row.name,
              row['alpha-2'],
              row['alpha-3'],
              row['country-code'],
              row.region,
              row['sub-region'],
              row['intermediate-region']
            );
          })
          .on('end', () => {
            stmt.finalize();
            console.log('Countries imported successfully');
            db.close();
          });
      });
    } catch (error) {
      console.error('Error importing countries:', error);
      db.close();
    }
  });
}

importCountries(); 