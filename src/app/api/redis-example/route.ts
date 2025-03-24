import { createClient } from 'redis';
import { NextResponse } from 'next/server';
import { env } from '@/app/env.js';

/**
 * Initialize Redis client and fetch data
 */
export const POST = async () => {
  try {
    // Create and connect Redis client
    const redis = createClient({
      url: env.REDIS_URL
    });
    
    // Connect to Redis
    await redis.connect();
    
    // Fetch data from Redis
    const result = await redis.get("item");
    
    // Disconnect when done
    await redis.disconnect();
    
    // Return the result in the response
    return new NextResponse(JSON.stringify({ result }), { 
      status: 200,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  } catch (error) {
    console.error('Redis error:', error);
    return new NextResponse(JSON.stringify({ 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }), { 
      status: 500,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }
}; 