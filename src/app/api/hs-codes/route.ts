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
    const level = searchParams.get('level') || 'hs2';
    const parentCode = searchParams.get('parentCode');
    
    const db = await openDb();
    
    let query = '';
    let params: any[] = [];
    
    // Construct query based on the level and parent code
    if (level === 'hs2') {
      query = 'SELECT * FROM hs2_codes ORDER BY code';
    } else if (level === 'hs4') {
      if (parentCode) {
        query = 'SELECT * FROM hs4_codes WHERE hs2_code = ? ORDER BY code';
        params = [parentCode];
      } else {
        query = 'SELECT * FROM hs4_codes ORDER BY code';
      }
    } else if (level === 'hs6') {
      if (parentCode && parentCode.length === 2) {
        // If parent code is HS2
        query = 'SELECT * FROM hs6_codes WHERE hs2_code = ? ORDER BY code';
        params = [parentCode];
      } else if (parentCode && parentCode.length === 4) {
        // If parent code is HS4
        query = 'SELECT * FROM hs6_codes WHERE hs4_code = ? ORDER BY code';
        params = [parentCode];
      } else {
        query = 'SELECT * FROM hs6_codes ORDER BY code';
      }
    } else {
      return NextResponse.json({ error: 'Invalid level parameter' }, { status: 400 });
    }
    
    const rows = await db.all(query, ...params);
    await db.close();
    
    return NextResponse.json({ data: rows });
  } catch (error) {
    console.error('Database error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
} 