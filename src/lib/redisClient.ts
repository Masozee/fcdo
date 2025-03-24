import { createClient } from 'redis';
import { env } from '@/app/env.js';

// Get Redis URL from environment
const redisUrl = env.REDIS_URL;

// Create Redis client
const redisClient = createClient({
  url: redisUrl
});

// Connect to Redis
export async function connectRedis() {
  try {
    if (!redisClient.isOpen) {
      await redisClient.connect();
      console.log('Connected to Redis');
    }
  } catch (error) {
    console.error('Redis connection error:', error);
  }
}

// Event handlers
redisClient.on('error', (err) => console.error('Redis Client Error', err));

// Export Redis client
export default redisClient; 