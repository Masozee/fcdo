import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

// Dummy data for when the database tables don't exist
const dummyHSData = {
  hs2: [
    { code: "84", description: "Machinery and mechanical appliances", value: 2500000000000 },
    { code: "85", description: "Electrical machinery and equipment", value: 2300000000000 },
    { code: "87", description: "Vehicles", value: 1500000000000 },
    { code: "27", description: "Mineral fuels and oils", value: 1400000000000 },
    { code: "30", description: "Pharmaceutical products", value: 900000000000 },
    { code: "71", description: "Precious stones and metals", value: 850000000000 },
    { code: "39", description: "Plastics and articles thereof", value: 700000000000 },
    { code: "90", description: "Optical, photographic instruments", value: 650000000000 },
    { code: "29", description: "Organic chemicals", value: 600000000000 },
    { code: "72", description: "Iron and steel", value: 550000000000 }
  ],
  hs4: [
    { code: "8471", description: "Automatic data processing machines (computers)", value: 800000000000, hs2_code: "84" },
    { code: "8517", description: "Telephone sets and communication apparatus", value: 750000000000, hs2_code: "85" },
    { code: "8703", description: "Motor cars for transport of persons", value: 700000000000, hs2_code: "87" },
    { code: "2709", description: "Petroleum oils, crude", value: 650000000000, hs2_code: "27" },
    { code: "3004", description: "Medicaments, packaged for retail sale", value: 600000000000, hs2_code: "30" },
    { code: "7108", description: "Gold, unwrought or semi-manufactured", value: 550000000000, hs2_code: "71" },
    { code: "8542", description: "Electronic integrated circuits", value: 500000000000, hs2_code: "85" },
    { code: "8708", description: "Parts for motor vehicles", value: 450000000000, hs2_code: "87" },
    { code: "9013", description: "Liquid crystal devices", value: 400000000000, hs2_code: "90" },
    { code: "2710", description: "Petroleum oils, refined", value: 350000000000, hs2_code: "27" }
  ],
  hs6: [
    { code: "847130", description: "Portable digital automatic data processing machines", value: 400000000000, hs2_code: "84", hs4_code: "8471" },
    { code: "851712", description: "Telephones for cellular networks", value: 380000000000, hs2_code: "85", hs4_code: "8517" },
    { code: "870323", description: "Motor cars with engine capacity 1500-3000cc", value: 350000000000, hs2_code: "87", hs4_code: "8703" },
    { code: "270900", description: "Petroleum oils, crude", value: 320000000000, hs2_code: "27", hs4_code: "2709" },
    { code: "300490", description: "Other medicaments, packaged for retail sale", value: 300000000000, hs2_code: "30", hs4_code: "3004" },
    { code: "710812", description: "Gold, non-monetary, unwrought", value: 280000000000, hs2_code: "71", hs4_code: "7108" },
    { code: "854231", description: "Electronic integrated circuits: processors and controllers", value: 260000000000, hs2_code: "85", hs4_code: "8542" },
    { code: "870840", description: "Gear boxes for motor vehicles", value: 240000000000, hs2_code: "87", hs4_code: "8708" },
    { code: "901380", description: "Other liquid crystal devices", value: 220000000000, hs2_code: "90", hs4_code: "9013" },
    { code: "271019", description: "Medium oils and preparations", value: 200000000000, hs2_code: "27", hs4_code: "2710" }
  ]
};

export const dynamic = 'force-dynamic'; // Default to dynamic to ensure proper fetch handling
export const revalidate = 3600; // Revalidate every hour by default

export async function GET(request: Request) {
  try {
    // Get the level from query parameters
    const url = new URL(request.url);
    const level = url.searchParams.get('level') || 'hs2';
    
    // Try to query the database for HS codes
    try {
      // Check if the database has been initialized
      const dbCheck = await db.get("SELECT name FROM sqlite_master WHERE type='table' AND name='hs_codes'");
      if (!dbCheck) {
        console.log('HS codes table does not exist yet, falling back to dummy data');
        
        // If a specific level is requested, return only that level
        if (level === 'hs2') {
          return NextResponse.json({ hs2: dummyHSData.hs2 }, {
            headers: {
              'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
            },
          });
        } else if (level === 'hs4') {
          return NextResponse.json({ hs4: dummyHSData.hs4 }, {
            headers: {
              'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
            },
          });
        } else if (level === 'hs6') {
          return NextResponse.json({ hs6: dummyHSData.hs6 }, {
            headers: {
              'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
            },
          });
        }
        
        return NextResponse.json(dummyHSData, {
          headers: {
            'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
          },
        });
      }
      
      // Query the database for HS2 codes (2-digit)
      const hs2Data = await db.all(`
        SELECT 
          hs2_code as code,
          hs2_description as description,
          SUM(trade_value_usd) as value
        FROM trade
        JOIN hs_codes ON trade.hs_code = hs_codes.hs_code
        GROUP BY hs2_code, hs2_description
        ORDER BY value DESC
      `);

      // If no data was returned, fall back to dummy data
      if (!hs2Data || hs2Data.length === 0) {
        console.log('No HS code data found in database, falling back to dummy data');
        
        // If a specific level is requested, return only that level
        if (level === 'hs2') {
          return NextResponse.json({ hs2: dummyHSData.hs2 }, {
            headers: {
              'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
            },
          });
        } else if (level === 'hs4') {
          return NextResponse.json({ hs4: dummyHSData.hs4 }, {
            headers: {
              'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
            },
          });
        } else if (level === 'hs6') {
          return NextResponse.json({ hs6: dummyHSData.hs6 }, {
            headers: {
              'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
            },
          });
        }
        
        return NextResponse.json(dummyHSData, {
          headers: {
            'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
          },
        });
      }

      // Query the database for HS4 codes (4-digit)
      const hs4Data = await db.all(`
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

      // Query the database for HS6 codes (6-digit)
      const hs6Data = await db.all(`
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

      // If a specific level is requested, return only that level
      if (level === 'hs2') {
        return NextResponse.json({ hs2: hs2Data }, {
          headers: {
            'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
          },
        });
      } else if (level === 'hs4') {
        return NextResponse.json({ hs4: hs4Data }, {
          headers: {
            'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
          },
        });
      } else if (level === 'hs6') {
        return NextResponse.json({ hs6: hs6Data }, {
          headers: {
            'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
          },
        });
      }

      // Otherwise return all levels
      return NextResponse.json({
        hs2: hs2Data,
        hs4: hs4Data,
        hs6: hs6Data
      }, {
        headers: {
          'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
        },
      });
    } catch (dbError) {
      console.error('Database error, falling back to dummy data:', dbError);
      
      // If a specific level is requested, return only that level
      if (level === 'hs2') {
        return NextResponse.json({ hs2: dummyHSData.hs2 }, {
          headers: {
            'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
          },
        });
      } else if (level === 'hs4') {
        return NextResponse.json({ hs4: dummyHSData.hs4 }, {
          headers: {
            'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
          },
        });
      } else if (level === 'hs6') {
        return NextResponse.json({ hs6: dummyHSData.hs6 }, {
          headers: {
            'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
          },
        });
      }
      
      // If database query fails, return dummy data
      return NextResponse.json(dummyHSData, {
        headers: {
          'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
        },
      });
    }
  } catch (error) {
    console.error('Error fetching HS code data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch HS code data' },
      { 
        status: 500,
        headers: {
          'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300',
        },
      }
    );
  }
} 