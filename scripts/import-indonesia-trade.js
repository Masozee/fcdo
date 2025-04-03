// Import Indonesian trade data to SQLite database
const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');

// Database path
const dbPath = path.join(process.cwd(), 'db.sqlite3');

// Function to import Indonesian trade data from CSV
function importIndonesianTradeData(csvPath) {
  return new Promise((resolve, reject) => {
    if (!fs.existsSync(csvPath)) {
      console.error(`CSV file not found at: ${csvPath}`);
      reject(new Error(`CSV file not found at: ${csvPath}`));
      return;
    }

    // Open database connection
    const db = new sqlite3.Database(dbPath);
    
    // Create temporary table for importing and processing data
    db.serialize(() => {
      // Ensure the data_hstradedata table exists
      db.run(`
        CREATE TABLE IF NOT EXISTS data_hstradedata (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
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
        )
      `, (err) => {
        if (err) {
          console.error('Error creating data_hstradedata table:', err);
          db.close();
          reject(err);
          return;
        }
        
        // Prepare for import - create statement
        const stmt = db.prepare(`
          INSERT INTO data_hstradedata (
            reporter, reporter_iso, partner, partner_iso, year, trade_flow,
            hs_code, hs_description, trade_value_usd, quantity, quantity_unit
          ) VALUES (?, 'IDN', ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `);
        
        let importCount = 0;
        let errorCount = 0;
        
        // Process CSV file
        fs.createReadStream(csvPath)
          .pipe(csv())
          .on('data', (row) => {
            try {
              // Map CSV columns to database fields
              // NOTE: Adjust these field mappings to match your actual CSV structure
              const reporter = 'Indonesia';
              const partner = row.partner_country || row.partner || '';
              const partnerIso = row.partner_iso || row.iso || '';
              const year = parseInt(row.year) || new Date().getFullYear();
              const tradeFlow = row.trade_flow || 'Export'; // 'Export' or 'Import'
              const hsCode = row.hs_code || '';
              const hsDescription = row.product_name || row.hs_description || '';
              const tradeValue = parseFloat(row.trade_value_usd || row.value || 0);
              const quantity = parseFloat(row.quantity || 0);
              const quantityUnit = row.quantity_unit || 'Units';
              
              // Insert data
              stmt.run(
                reporter,
                partner,
                partnerIso,
                year,
                tradeFlow,
                hsCode,
                hsDescription,
                tradeValue,
                quantity,
                quantityUnit
              );
              
              importCount++;
            } catch (error) {
              console.error('Error processing row:', row, error);
              errorCount++;
            }
          })
          .on('end', () => {
            // Finalize statement
            stmt.finalize();
            
            console.log(`Import completed: ${importCount} records imported, ${errorCount} errors`);
            db.close();
            resolve({ importCount, errorCount });
          })
          .on('error', (error) => {
            console.error('Error reading CSV:', error);
            db.close();
            reject(error);
          });
      });
    });
  });
}

// Command line usage:
// node import-indonesia-trade.js [csv-file-path]
async function main() {
  try {
    const csvPath = process.argv[2] || path.join(process.cwd(), 'data', 'indonesia-trade.csv');
    
    console.log(`Importing Indonesian trade data from: ${csvPath}`);
    const result = await importIndonesianTradeData(csvPath);
    console.log('Import completed successfully:', result);
  } catch (error) {
    console.error('Import failed:', error);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = { importIndonesianTradeData }; 