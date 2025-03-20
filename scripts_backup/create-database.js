const fs = require('fs');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();
const csv = require('csv-parser');

// Create database directory if it doesn't exist
const dbDir = path.join(__dirname, '..', 'data', 'db');
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

// Database file path
const dbPath = path.join(dbDir, 'trade_data.sqlite');

// Create a new database connection
const db = new sqlite3.Database(dbPath);

// Create tables
db.serialize(() => {
  // Drop existing tables if they exist
  db.run('DROP TABLE IF EXISTS hs2_codes');
  db.run('DROP TABLE IF EXISTS hs4_codes');
  db.run('DROP TABLE IF EXISTS hs6_codes');
  
  // Create HS2 codes table
  db.run(`
    CREATE TABLE hs2_codes (
      code TEXT PRIMARY KEY,
      description TEXT NOT NULL,
      value INTEGER NOT NULL
    )
  `);
  
  // Create HS4 codes table
  db.run(`
    CREATE TABLE hs4_codes (
      code TEXT PRIMARY KEY,
      description TEXT NOT NULL,
      hs2_code TEXT NOT NULL,
      value INTEGER NOT NULL,
      FOREIGN KEY (hs2_code) REFERENCES hs2_codes(code)
    )
  `);
  
  // Create HS6 codes table
  db.run(`
    CREATE TABLE hs6_codes (
      code TEXT PRIMARY KEY,
      description TEXT NOT NULL,
      hs4_code TEXT NOT NULL,
      hs2_code TEXT NOT NULL,
      value INTEGER NOT NULL,
      FOREIGN KEY (hs4_code) REFERENCES hs4_codes(code),
      FOREIGN KEY (hs2_code) REFERENCES hs2_codes(code)
    )
  `);
  
  // Prepare statements for inserting data
  const hs2Stmt = db.prepare('INSERT INTO hs2_codes (code, description, value) VALUES (?, ?, ?)');
  const hs4Stmt = db.prepare('INSERT INTO hs4_codes (code, description, hs2_code, value) VALUES (?, ?, ?, ?)');
  const hs6Stmt = db.prepare('INSERT INTO hs6_codes (code, description, hs4_code, hs2_code, value) VALUES (?, ?, ?, ?, ?)');
  
  // Import HS2 codes
  fs.createReadStream(path.join(__dirname, '..', 'data', 'csv', 'hs2_codes.csv'))
    .pipe(csv())
    .on('data', (row) => {
      hs2Stmt.run(row.code, row.description, row.value);
    })
    .on('end', () => {
      hs2Stmt.finalize();
      console.log('HS2 codes imported successfully');
      
      // Import HS4 codes after HS2 codes are imported
      fs.createReadStream(path.join(__dirname, '..', 'data', 'csv', 'hs4_codes.csv'))
        .pipe(csv())
        .on('data', (row) => {
          hs4Stmt.run(row.code, row.description, row.hs2_code, row.value);
        })
        .on('end', () => {
          hs4Stmt.finalize();
          console.log('HS4 codes imported successfully');
          
          // Import HS6 codes after HS4 codes are imported
          fs.createReadStream(path.join(__dirname, '..', 'data', 'csv', 'hs6_codes.csv'))
            .pipe(csv())
            .on('data', (row) => {
              hs6Stmt.run(row.code, row.description, row.hs4_code, row.hs2_code, row.value);
            })
            .on('end', () => {
              hs6Stmt.finalize();
              console.log('HS6 codes imported successfully');
              
              // Create indexes for better performance
              db.run('CREATE INDEX idx_hs4_hs2_code ON hs4_codes(hs2_code)');
              db.run('CREATE INDEX idx_hs6_hs4_code ON hs6_codes(hs4_code)');
              db.run('CREATE INDEX idx_hs6_hs2_code ON hs6_codes(hs2_code)');
              
              console.log('Database created successfully');
              
              // Close the database connection
              db.close((err) => {
                if (err) {
                  console.error('Error closing database:', err.message);
                } else {
                  console.log('Database connection closed');
                }
              });
            });
        });
    });
}); 