import { Hono } from 'hono';
import { handle } from 'hono/vercel';
import { db } from '@/lib/db';

// Create a new Hono app
const app = new Hono();

// Dummy data with year variations for when the database tables don't exist
const generateCountryDummyData = (year: string) => {
  // Base multiplier to create variations between years
  const yearMultiplier = {
    '2023': 1.0,
    '2022': 0.92,
    '2021': 0.85,
    '2020': 0.75,
    '2019': 0.80,
  }[year] || 1.0;

  return [
    {
      id: 1,
      country: "United States",
      imports: Math.round(2500000000000 * yearMultiplier),
      exports: Math.round(1800000000000 * yearMultiplier),
      total: Math.round(4300000000000 * yearMultiplier),
      products: ["8471", "8703", "2709", "3004", "8517"]
    },
    {
      id: 2,
      country: "China",
      imports: Math.round(2100000000000 * yearMultiplier),
      exports: Math.round(2600000000000 * yearMultiplier),
      total: Math.round(4700000000000 * yearMultiplier),
      products: ["8517", "8471", "8542", "9013", "8541"]
    },
    {
      id: 3,
      country: "Germany",
      imports: Math.round(1200000000000 * yearMultiplier),
      exports: Math.round(1500000000000 * yearMultiplier),
      total: Math.round(2700000000000 * yearMultiplier),
      products: ["8703", "3004", "8708", "8802", "8411"]
    },
    {
      id: 4,
      country: "Japan",
      imports: Math.round(750000000000 * yearMultiplier),
      exports: Math.round(700000000000 * yearMultiplier),
      total: Math.round(1450000000000 * yearMultiplier),
      products: ["8703", "8708", "8542", "8471", "8517"]
    },
    {
      id: 5,
      country: "United Kingdom",
      imports: Math.round(650000000000 * yearMultiplier),
      exports: Math.round(450000000000 * yearMultiplier),
      total: Math.round(1100000000000 * yearMultiplier),
      products: ["7108", "8703", "3004", "8411", "2710"]
    }
  ];
};

// Dummy data for HS codes
const dummyHSData = {
  hs2: [
    { code: "84", description: "Machinery and mechanical appliances", value: 2500000000000 },
    { code: "85", description: "Electrical machinery and equipment", value: 2300000000000 },
    { code: "87", description: "Vehicles", value: 1500000000000 },
    { code: "27", description: "Mineral fuels and oils", value: 1400000000000 },
    { code: "30", description: "Pharmaceutical products", value: 900000000000 }
  ],
  hs4: [
    { code: "8471", description: "Automatic data processing machines (computers)", value: 800000000000, hs2_code: "84" },
    { code: "8517", description: "Telephone sets and communication apparatus", value: 750000000000, hs2_code: "85" },
    { code: "8703", description: "Motor cars for transport of persons", value: 700000000000, hs2_code: "87" },
    { code: "2709", description: "Petroleum oils, crude", value: 650000000000, hs2_code: "27" },
    { code: "3004", description: "Medicaments, packaged for retail sale", value: 600000000000, hs2_code: "30" }
  ],
  hs6: [
    { code: "847130", description: "Portable digital automatic data processing machines", value: 400000000000, hs2_code: "84", hs4_code: "8471" },
    { code: "851712", description: "Telephones for cellular networks", value: 380000000000, hs2_code: "85", hs4_code: "8517" },
    { code: "870323", description: "Motor cars with engine capacity 1500-3000cc", value: 350000000000, hs2_code: "87", hs4_code: "8703" },
    { code: "270900", description: "Petroleum oils, crude", value: 320000000000, hs2_code: "27", hs4_code: "2709" },
    { code: "300490", description: "Other medicaments, packaged for retail sale", value: 300000000000, hs2_code: "30", hs4_code: "3004" }
  ]
};

// Common cache headers
const cacheHeaders = {
  'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
};

// Country trade API route
app.get('/country-trade', async (c) => {
  try {
    // Extract year from query parameters
    const year = c.req.query('year') || '2023';
    
    try {
      // Check if the database has been initialized
      const dbCheck = await db.get("SELECT name FROM sqlite_master WHERE type='table' AND name='trade'");
      
      if (!dbCheck) {
        console.log('Trade table does not exist yet, falling back to dummy data');
        return c.json(generateCountryDummyData(year), 200, cacheHeaders);
      }
      
      // Add year condition to SQL query
      let countryData;
      try {
        if (year) {
          countryData = await db.all(`
            SELECT 
              country.id,
              country.name as country,
              SUM(CASE WHEN trade.trade_flow = 'Import' THEN trade.trade_value_usd ELSE 0 END) as imports,
              SUM(CASE WHEN trade.trade_flow = 'Export' THEN trade.trade_value_usd ELSE 0 END) as exports,
              SUM(trade.trade_value_usd) as total
            FROM trade
            JOIN country ON trade.reporter_iso = country.iso_code
            WHERE 1=1 AND substr(trade.date, 1, 4) = ?
            GROUP BY country.name
            ORDER BY total DESC
          `, [year]);
        } else {
          countryData = await db.all(`
            SELECT 
              country.id,
              country.name as country,
              SUM(CASE WHEN trade.trade_flow = 'Import' THEN trade.trade_value_usd ELSE 0 END) as imports,
              SUM(CASE WHEN trade.trade_flow = 'Export' THEN trade.trade_value_usd ELSE 0 END) as exports,
              SUM(trade.trade_value_usd) as total
            FROM trade
            JOIN country ON trade.reporter_iso = country.iso_code
            GROUP BY country.name
            ORDER BY total DESC
          `);
        }
      } catch (queryError) {
        console.error('Error executing country data query:', queryError);
        return c.json(generateCountryDummyData(year), 200, cacheHeaders);
      }

      // If no data was returned, fall back to dummy data
      if (!countryData || countryData.length === 0) {
        console.log('No country data found in database, falling back to dummy data');
        return c.json(generateCountryDummyData(year), 200, cacheHeaders);
      }

      // Get products for each country
      try {
        for (const country of countryData) {
          try {
            let products;
            if (year) {
              products = await db.all(`
                SELECT DISTINCT hs_codes.hs4_code as hs_code
                FROM trade
                JOIN country ON trade.reporter_iso = country.iso_code
                JOIN hs_codes ON trade.hs_code = hs_codes.hs_code
                WHERE country.name = ? AND substr(trade.date, 1, 4) = ?
                LIMIT 10
              `, [country.country, year]);
            } else {
              products = await db.all(`
                SELECT DISTINCT hs_codes.hs4_code as hs_code
                FROM trade
                JOIN country ON trade.reporter_iso = country.iso_code
                JOIN hs_codes ON trade.hs_code = hs_codes.hs_code
                WHERE country.name = ?
                LIMIT 10
              `, [country.country]);
            }
            
            country.products = products.map((p: { hs_code: string }) => p.hs_code);
          } catch (productError) {
            console.error(`Error fetching products for country ${country.country}:`, productError);
            country.products = [];
          }
        }
      } catch (productsError) {
        console.error('Error processing products for countries:', productsError);
        // Continue with the data we have, just without products
      }

      return c.json(countryData, 200, cacheHeaders);
    } catch (dbError) {
      console.error('Database error, falling back to dummy data:', dbError);
      return c.json(generateCountryDummyData(year), 200, cacheHeaders);
    }
  } catch (error) {
    console.error('Error in country-trade API:', error);
    // Always return a valid response, even in case of errors
    return c.json(
      generateCountryDummyData('2023'),
      200, 
      {
        'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300',
      }
    );
  }
});

// HS codes API route
app.get('/hs-codes', async (c) => {
  try {
    // Get the level from query parameters
    const level = c.req.query('level') || 'hs2';
    
    try {
      // Check if the database has been initialized
      const dbCheck = await db.get("SELECT name FROM sqlite_master WHERE type='table' AND name='hs_codes'");
      if (!dbCheck) {
        console.log('HS codes table does not exist yet, falling back to dummy data');
        return returnHSLevelData(c, level);
      }
      
      // Query the database for HS2 codes (2-digit)
      let hs2Data: any[] = [];
      try {
        hs2Data = await db.all(`
          SELECT 
            hs2_code as code,
            hs2_description as description,
            SUM(trade_value_usd) as value
          FROM trade
          JOIN hs_codes ON trade.hs_code = hs_codes.hs_code
          GROUP BY hs2_code, hs2_description
          ORDER BY value DESC
        `);
      } catch (hs2Error) {
        console.error('Error fetching HS2 codes:', hs2Error);
        // Continue with empty array, will be handled below
      }

      // If no data was returned, fall back to dummy data
      if (!hs2Data || hs2Data.length === 0) {
        console.log('No HS2 code data found in database');
        hs2Data = dummyHSData.hs2;
      }

      // Query the database for HS4 codes (4-digit)
      let hs4Data: any[] = [];
      try {
        hs4Data = await db.all(`
          SELECT 
            hs4_code as code,
            hs4_description as description,
            hs2_code,
            SUM(trade_value_usd) as value
          FROM trade
          JOIN hs_codes ON trade.hs_code = hs_codes.hs_code
          GROUP BY hs4_code, hs4_description, hs2_code
          ORDER BY value DESC
        `);
      } catch (hs4Error) {
        console.error('Error fetching HS4 codes:', hs4Error);
        // Continue with empty array, will be handled below
      }

      if (!hs4Data || hs4Data.length === 0) {
        hs4Data = dummyHSData.hs4;
      }

      // Query the database for HS6 codes (6-digit)
      let hs6Data: any[] = [];
      try {
        hs6Data = await db.all(`
          SELECT 
            hs_codes.hs_code as code,
            hs_description as description,
            hs2_code,
            hs4_code,
            SUM(trade_value_usd) as value
          FROM trade
          JOIN hs_codes ON trade.hs_code = hs_codes.hs_code
          GROUP BY hs_codes.hs_code, hs_description, hs2_code, hs4_code
          ORDER BY value DESC
        `);
      } catch (hs6Error) {
        console.error('Error fetching HS6 codes:', hs6Error);
        // Continue with empty array, will be handled below
      }

      if (!hs6Data || hs6Data.length === 0) {
        hs6Data = dummyHSData.hs6;
      }

      // Return the specific level requested
      if (level === 'hs2') {
        return c.json({ hs2: hs2Data }, 200, cacheHeaders);
      } else if (level === 'hs4') {
        return c.json({ hs4: hs4Data }, 200, cacheHeaders);
      } else if (level === 'hs6') {
        return c.json({ hs6: hs6Data }, 200, cacheHeaders);
      }

      // Otherwise return all levels
      return c.json({
        hs2: hs2Data,
        hs4: hs4Data,
        hs6: hs6Data
      }, 200, cacheHeaders);
    } catch (dbError) {
      console.error('Database error, falling back to dummy data:', dbError);
      return returnHSLevelData(c, level);
    }
  } catch (error) {
    console.error('Error fetching HS code data:', error);
    // Always return a valid response, even in case of errors
    return c.json(
      dummyHSData,
      200, 
      {
        'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300',
      }
    );
  }
});

// Helper function to return specific HS level data
function returnHSLevelData(c: any, level: string) {
  if (level === 'hs2') {
    return c.json({ hs2: dummyHSData.hs2 }, 200, cacheHeaders);
  } else if (level === 'hs4') {
    return c.json({ hs4: dummyHSData.hs4 }, 200, cacheHeaders);
  } else if (level === 'hs6') {
    return c.json({ hs6: dummyHSData.hs6 }, 200, cacheHeaders);
  }
  return c.json(dummyHSData, 200, cacheHeaders);
}

// Export the handle function for Next.js
export const GET = handle(app);
export const POST = handle(app);
export const PUT = handle(app);
export const DELETE = handle(app); 