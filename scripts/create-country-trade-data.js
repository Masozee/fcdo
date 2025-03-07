const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

// Database file path
const dbPath = path.join(__dirname, '..', 'data', 'db', 'trade_data.sqlite');

// Create a new database connection
const db = new sqlite3.Database(dbPath);

// Sample country trade data
const countryTradeData = [
  {
    country: "United States",
    imports: 12000,
    exports: 20000,
    total: 32000,
    products: ["Textiles", "Electronics", "Rubber", "Coffee"]
  },
  {
    country: "China",
    imports: 45000,
    exports: 33000,
    total: 78000,
    products: ["Coal", "Palm Oil", "Minerals", "Rubber"]
  },
  {
    country: "Japan",
    imports: 14000,
    exports: 15000,
    total: 29000,
    products: ["Automotive Parts", "Seafood", "Coal", "Copper"]
  },
  {
    country: "South Korea",
    imports: 8000,
    exports: 10000,
    total: 18000,
    products: ["Coal", "Natural Gas", "Copper", "Palm Oil"]
  },
  {
    country: "Singapore",
    imports: 10000,
    exports: 15000,
    total: 25000,
    products: ["Electronics", "Chemicals", "Machinery", "Oil"]
  },
  {
    country: "Malaysia",
    imports: 9000,
    exports: 10000,
    total: 19000,
    products: ["Electronics", "Palm Oil", "Rubber", "Machinery"]
  },
  {
    country: "Thailand",
    imports: 8000,
    exports: 9000,
    total: 17000,
    products: ["Automotive Parts", "Electronics", "Rubber", "Food"]
  },
  {
    country: "Vietnam",
    imports: 5000,
    exports: 6000,
    total: 11000,
    products: ["Electronics", "Textiles", "Seafood", "Rice"]
  },
  {
    country: "Australia",
    imports: 3000,
    exports: 5000,
    total: 8000,
    products: ["Minerals", "Coal", "Wheat", "Beef"]
  },
  {
    country: "India",
    imports: 10000,
    exports: 11000,
    total: 21000,
    products: ["Pharmaceuticals", "Textiles", "Machinery", "Chemicals"]
  },
  {
    country: "Germany",
    imports: 3000,
    exports: 4000,
    total: 7000,
    products: ["Machinery", "Automotive", "Chemicals", "Electronics"]
  },
  {
    country: "Netherlands",
    imports: 2000,
    exports: 3000,
    total: 5000,
    products: ["Agriculture", "Chemicals", "Machinery", "Food"]
  },
  {
    country: "United Kingdom",
    imports: 1500,
    exports: 1500,
    total: 3000,
    products: ["Financial Services", "Machinery", "Chemicals", "Beverages"]
  },
  {
    country: "Brazil",
    imports: 2000,
    exports: 2000,
    total: 4000,
    products: ["Agriculture", "Minerals", "Aircraft", "Machinery"]
  },
  {
    country: "Russia",
    imports: 1500,
    exports: 1000,
    total: 2500,
    products: ["Fuel", "Minerals", "Metals", "Chemicals"]
  }
];

// Create tables
db.serialize(() => {
  // Drop existing tables if they exist
  db.run('DROP TABLE IF EXISTS country_trade');
  db.run('DROP TABLE IF EXISTS country_products');
  
  // Create country trade table
  db.run(`
    CREATE TABLE country_trade (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      country TEXT NOT NULL UNIQUE,
      imports INTEGER NOT NULL,
      exports INTEGER NOT NULL,
      total INTEGER NOT NULL
    )
  `);
  
  // Create country products table
  db.run(`
    CREATE TABLE country_products (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      country_id INTEGER NOT NULL,
      product TEXT NOT NULL,
      FOREIGN KEY (country_id) REFERENCES country_trade(id)
    )
  `);
  
  // Insert country trade data
  const insertCountry = db.prepare('INSERT INTO country_trade (country, imports, exports, total) VALUES (?, ?, ?, ?)');
  const insertProduct = db.prepare('INSERT INTO country_products (country_id, product) VALUES (?, ?)');
  
  // Process each country
  let completed = 0;
  
  countryTradeData.forEach(data => {
    insertCountry.run(data.country, data.imports, data.exports, data.total, function(err) {
      if (err) {
        console.error('Error inserting country data:', err.message);
        return;
      }
      
      const countryId = this.lastID;
      
      // Insert country products
      data.products.forEach(product => {
        insertProduct.run(countryId, product);
      });
      
      completed++;
      
      // Check if all countries have been processed
      if (completed === countryTradeData.length) {
        // Finalize statements
        insertCountry.finalize();
        insertProduct.finalize();
        
        // Create indexes for better performance
        db.run('CREATE INDEX idx_country_products_country_id ON country_products(country_id)');
        
        console.log('Country trade data added successfully');
        
        // Close the database connection
        db.close((err) => {
          if (err) {
            console.error('Error closing database:', err.message);
          } else {
            console.log('Database connection closed');
          }
        });
      }
    });
  });
}); 