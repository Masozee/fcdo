import { NextRequest, NextResponse } from 'next/server';
import redisClient, { connectRedis } from '@/lib/redisClient';

// GET endpoint to fetch a value from Redis
export async function GET(request: NextRequest) {
  try {
    // Ensure Redis is connected
    await connectRedis();
    
    // Get key from query parameters
    const url = new URL(request.url);
    const key = url.searchParams.get('key') || 'test-key';
    
    // Retrieve value from Redis
    const value = await redisClient.get(key);
    
    return NextResponse.json({
      success: true,
      key,
      value: value || 'Key not found',
    }, { status: 200 });
  } catch (error) {
    console.error('Redis GET error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 });
  }
}

// POST endpoint to set a value in Redis
export async function POST(request: NextRequest) {
  try {
    // Ensure Redis is connected
    await connectRedis();
    
    // Parse request body
    const body = await request.json();
    const { key = 'test-key', value = 'test-value', ttl } = body;
    
    // Store value in Redis
    if (ttl) {
      await redisClient.setEx(key, ttl, value);
    } else {
      await redisClient.set(key, value);
    }
    
    return NextResponse.json({
      success: true,
      key,
      value,
      ttl: ttl || 'none',
    }, { status: 200 });
  } catch (error) {
    console.error('Redis POST error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 });
  }
} 