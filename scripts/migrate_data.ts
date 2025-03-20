import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import fs from 'fs';
import path from 'path';

async function migrateData() {
  // Open the source database
  const sourceDb = await open({
    filename: path.join(process.cwd(), 'data', 'db.sqlite3'),
    driver: sqlite3.Database
  });

  // Create the target database
  const targetDb = await open({
    filename: path.join(process.cwd(), 'data', 'trade_data.sqlite'),
    driver: sqlite3.Database
  });

  try {
    // Create tables in target database
    await targetDb.exec(`
      CREATE TABLE IF NOT EXISTS country (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        iso_code TEXT UNIQUE,
        name TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS hs_codes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        hs_code TEXT UNIQUE,
        hs2_code TEXT,
        hs4_code TEXT,
        hs_description TEXT,
        hs2_description TEXT,
        hs4_description TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS trade (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        reporter_iso TEXT,
        partner_iso TEXT,
        hs_code TEXT,
        trade_flow TEXT,
        trade_value_usd REAL,
        date TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (reporter_iso) REFERENCES country(iso_code),
        FOREIGN KEY (partner_iso) REFERENCES country(iso_code),
        FOREIGN KEY (hs_code) REFERENCES hs_codes(hs_code)
      );
    `);

    // Migrate countries
    console.log('Migrating countries...');
    const countries = await sourceDb.all('SELECT * FROM data_country');
    for (const country of countries) {
      await targetDb.run(
        'INSERT OR IGNORE INTO country (iso_code, name) VALUES (?, ?)',
        [country.iso_code, country.name]
      );
    }

    // Migrate HS codes
    console.log('Migrating HS codes...');
    const hsCodes = await sourceDb.all('SELECT * FROM data_hscode');
    for (const code of hsCodes) {
      await targetDb.run(
        `INSERT OR IGNORE INTO hs_codes 
        (hs_code, hs2_code, hs4_code, hs_description, hs2_description, hs4_description) 
        VALUES (?, ?, ?, ?, ?, ?)`,
        [
          code.hs_code,
          code.hs2_code,
          code.hs4_code,
          code.hs_description,
          code.hs2_description,
          code.hs4_description
        ]
      );
    }

    // Migrate trade data
    console.log('Migrating trade data...');
    const tradeData = await sourceDb.all('SELECT * FROM data_trade');
    for (const trade of tradeData) {
      await targetDb.run(
        `INSERT OR IGNORE INTO trade 
        (reporter_iso, partner_iso, hs_code, trade_flow, trade_value_usd, date) 
        VALUES (?, ?, ?, ?, ?, ?)`,
        [
          trade.reporter_iso,
          trade.partner_iso,
          trade.hs_code,
          trade.trade_flow,
          trade.trade_value_usd,
          trade.date
        ]
      );
    }

    console.log('Data migration completed successfully!');
  } catch (error) {
    console.error('Error during migration:', error);
    throw error;
  } finally {
    await sourceDb.close();
    await targetDb.close();
  }
}

// Run the migration
migrateData().catch(console.error); 