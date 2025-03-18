import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

// Dummy data with year variations for when the database tables don't exist
const generateDummyData = (year: string) => {
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
    },
    {
      id: 6,
      country: "France",
      imports: Math.round(620000000000 * yearMultiplier),
      exports: Math.round(550000000000 * yearMultiplier),
      total: Math.round(1170000000000 * yearMultiplier),
      products: ["8802", "8703", "3004", "3303", "2204"]
    },
    {
      id: 7,
      country: "India",
      imports: Math.round(480000000000 * yearMultiplier),
      exports: Math.round(320000000000 * yearMultiplier),
      total: Math.round(800000000000 * yearMultiplier),
      products: ["2709", "7108", "8517", "2701", "3004"]
    },
    {
      id: 8,
      country: "South Korea",
      imports: Math.round(510000000000 * yearMultiplier),
      exports: Math.round(540000000000 * yearMultiplier),
      total: Math.round(1050000000000 * yearMultiplier),
      products: ["8542", "8703", "2709", "8517", "8471"]
    },
    {
      id: 9,
      country: "Canada",
      imports: Math.round(430000000000 * yearMultiplier),
      exports: Math.round(450000000000 * yearMultiplier),
      total: Math.round(880000000000 * yearMultiplier),
      products: ["2709", "8703", "8708", "7108", "2701"]
    },
    {
      id: 10,
      country: "Italy",
      imports: Math.round(470000000000 * yearMultiplier),
      exports: Math.round(510000000000 * yearMultiplier),
      total: Math.round(980000000000 * yearMultiplier),
      products: ["8703", "3004", "2710", "8411", "7108"]
    },
    {
      id: 11,
      country: "Mexico",
      imports: Math.round(420000000000 * yearMultiplier),
      exports: Math.round(460000000000 * yearMultiplier),
      total: Math.round(880000000000 * yearMultiplier),
      products: ["8703", "8708", "8471", "8517", "2709"]
    },
    {
      id: 12,
      country: "Brazil",
      imports: Math.round(180000000000 * yearMultiplier),
      exports: Math.round(220000000000 * yearMultiplier),
      total: Math.round(400000000000 * yearMultiplier),
      products: ["2709", "1201", "2601", "1701", "0901"]
    },
    {
      id: 13,
      country: "Australia",
      imports: Math.round(220000000000 * yearMultiplier),
      exports: Math.round(250000000000 * yearMultiplier),
      total: Math.round(470000000000 * yearMultiplier),
      products: ["2601", "2701", "7108", "0201", "1001"]
    },
    {
      id: 14,
      country: "Spain",
      imports: Math.round(330000000000 * yearMultiplier),
      exports: Math.round(310000000000 * yearMultiplier),
      total: Math.round(640000000000 * yearMultiplier),
      products: ["8703", "2709", "3004", "8708", "2204"]
    },
    {
      id: 15,
      country: "Russia",
      imports: Math.round(240000000000 * yearMultiplier),
      exports: Math.round(380000000000 * yearMultiplier),
      total: Math.round(620000000000 * yearMultiplier),
      products: ["2709", "2711", "7108", "7207", "2701"]
    }
  ];
};

export const dynamic = 'force-dynamic'; // Default to dynamic to ensure proper fetch handling
export const revalidate = 3600; // Revalidate every hour by default

export async function GET(request: Request) {
  try {
    // Extract year from query parameters
    const url = new URL(request.url);
    const year = url.searchParams.get('year') || '2023';
    
    // Try to query the database for country trade data
    try {
      // Check if the database has been initialized
      const dbCheck = await db.get("SELECT name FROM sqlite_master WHERE type='table' AND name='trade'");
      if (!dbCheck) {
        console.log('Trade table does not exist yet, falling back to dummy data');
        return NextResponse.json(generateDummyData(year), {
          headers: {
            'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
          },
        });
      }
      
      // Add year condition to SQL query
      const yearCondition = year ? `AND strftime('%Y', trade.date) = '${year}'` : '';
      
      const countryData = await db.all(`
        SELECT 
          country.id,
          country.name as country,
          SUM(CASE WHEN trade.trade_flow = 'Import' THEN trade.trade_value_usd ELSE 0 END) as imports,
          SUM(CASE WHEN trade.trade_flow = 'Export' THEN trade.trade_value_usd ELSE 0 END) as exports,
          SUM(trade.trade_value_usd) as total
        FROM trade
        JOIN country ON trade.reporter_iso = country.iso_code
        WHERE 1=1 ${yearCondition}
        GROUP BY country.name
        ORDER BY total DESC
      `);

      // If no data was returned, fall back to dummy data
      if (!countryData || countryData.length === 0) {
        console.log('No country data found in database, falling back to dummy data');
        return NextResponse.json(generateDummyData(year), {
          headers: {
            'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
          },
        });
      }

      // Get products for each country
      for (const country of countryData) {
        const products = await db.all(`
          SELECT DISTINCT hs_codes.hs4_code as hs_code
          FROM trade
          JOIN country ON trade.reporter_iso = country.iso_code
          JOIN hs_codes ON trade.hs_code = hs_codes.hs_code
          WHERE country.name = ? ${yearCondition}
          LIMIT 10
        `, [country.country]);
        
        country.products = products.map(p => p.hs_code);
      }

      return NextResponse.json(countryData, {
        headers: {
          'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
        },
      });
    } catch (dbError) {
      console.error('Database error, falling back to dummy data:', dbError);
      // If database query fails, return dummy data with year variations
      return NextResponse.json(generateDummyData(year), {
        headers: {
          'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
        },
      });
    }
  } catch (error) {
    console.error('Error fetching country trade data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch country trade data' },
      { 
        status: 500,
        headers: {
          'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300',
        },
      }
    );
  }
} 