import { NextResponse } from 'next/server';
import { openDb } from '@/lib/sqlite';

/**
 * API route to get region data from the database
 */
export async function GET() {
  try {
    const db = await openDb();
    
    // Get all distinct regions
    const regionsQuery = `
      SELECT DISTINCT "region"
      FROM country_code
      WHERE "region" IS NOT NULL
      ORDER BY "region" ASC
    `;
    
    // Get sub-regions grouped by region
    const subRegionsQuery = `
      SELECT 
        "region",
        "sub-region"
      FROM country_code
      WHERE "region" IS NOT NULL AND "sub-region" IS NOT NULL
      GROUP BY "region", "sub-region"
      ORDER BY "region" ASC, "sub-region" ASC
    `;
    
    const [regions, subRegions] = await Promise.all([
      db.all(regionsQuery),
      db.all(subRegionsQuery)
    ]);
    
    await db.close();
    
    // Process sub-regions into a grouped structure
    const subRegionsByRegion = subRegions.reduce((acc: Record<string, string[]>, item: any) => {
      const region = item.region;
      const subRegion = item['sub-region'];
      
      if (!acc[region]) {
        acc[region] = [];
      }
      
      acc[region].push(subRegion);
      return acc;
    }, {});
    
    return NextResponse.json({
      success: true,
      data: {
        regions: regions.map((r: any) => r.region),
        subRegionsByRegion
      }
    });
    
  } catch (error) {
    console.error('Error fetching regions:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch regions' },
      { status: 500 }
    );
  }
} 