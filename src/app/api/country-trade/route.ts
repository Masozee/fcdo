import { NextRequest, NextResponse } from 'next/server';
import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import path from 'path';

// Helper function to open the database
async function openDb() {
  return open({
    filename: path.join(process.cwd(), 'data', 'db', 'trade_data.sqlite'),
    driver: sqlite3.Database
  });
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const country = searchParams.get('country');
    
    const db = await openDb();
    
    if (country) {
      // Get data for a specific country
      const countryData = await db.get(
        'SELECT * FROM country_trade WHERE country = ?',
        country
      );
      
      if (!countryData) {
        await db.close();
        return NextResponse.json({ error: 'Country not found' }, { status: 404 });
      }
      
      // Get products for the country
      const products = await db.all(
        'SELECT product FROM country_products WHERE country_id = ?',
        countryData.id
      );
      
      const result = {
        ...countryData,
        products: products.map(p => p.product)
      };
      
      await db.close();
      return NextResponse.json({ data: result });
    } else {
      // Get data for all countries
      const countries = await db.all('SELECT * FROM country_trade');
      
      // Get products for each country
      const result = await Promise.all(
        countries.map(async (country) => {
          const products = await db.all(
            'SELECT product FROM country_products WHERE country_id = ?',
            country.id
          );
          
          return {
            ...country,
            products: products.map(p => p.product)
          };
        })
      );
      
      await db.close();
      return NextResponse.json({ data: result });
    }
  } catch (error) {
    console.error('Database error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
} 