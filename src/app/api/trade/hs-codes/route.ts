import { getHSCodes, getChildHSCodes } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const level = (searchParams.get('level') || 'hs2') as 'hs2' | 'hs4' | 'hs6';
  const parentCode = searchParams.get('parentCode');
  const parentLevel = searchParams.get('parentLevel') as 'hs2' | 'hs4' | undefined;
  
  // Validate HS level
  if (!['hs2', 'hs4', 'hs6'].includes(level)) {
    return NextResponse.json({ error: 'Invalid HS level. Must be one of: hs2, hs4, hs6' }, { status: 400 });
  }
  
  try {
    // If parent code and level are provided, get child codes
    if (parentCode && parentLevel) {
      // Validate parent level
      if (!['hs2', 'hs4'].includes(parentLevel)) {
        return NextResponse.json({ error: 'Invalid parent HS level. Must be one of: hs2, hs4' }, { status: 400 });
      }
      
      const childCodes = await getChildHSCodes(parentCode, parentLevel);
      return NextResponse.json(childCodes);
    } else {
      // Otherwise, get all codes at the specified level
      const hsCodes = await getHSCodes(level);
      return NextResponse.json(hsCodes);
    }
  } catch (error) {
    console.error('Error fetching HS codes:', error);
    return NextResponse.json({ error: 'Failed to fetch data' }, { status: 500 });
  }
} 