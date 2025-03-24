import Redis from 'ioredis';
import { env } from '@/app/env.js';

// Use environment variable for Redis URL
const redisUrl = env.REDIS_URL;

// Create a Redis client
const redis = new Redis(redisUrl, {
  maxRetriesPerRequest: 3,
  connectTimeout: 10000,
  enableReadyCheck: true,
  enableOfflineQueue: true,
});

// Log connection status
redis.on('connect', () => {
  console.log('Connected to Redis');
});

redis.on('error', (err) => {
  console.error('Redis connection error:', err);
});

/**
 * Get cached data from Redis
 * @param key Cache key
 * @returns Cached data or null if not found
 */
export async function getCache<T>(key: string): Promise<T | null> {
  try {
    const cachedData = await redis.get(key);
    if (cachedData) {
      return JSON.parse(cachedData) as T;
    }
    return null;
  } catch (error) {
    console.error('Redis getCache error:', error);
    return null;
  }
}

/**
 * Set data in Redis cache with expiration time
 * @param key Cache key
 * @param data Data to cache
 * @param expireInSeconds Expiration time in seconds (default: 1 hour)
 */
export async function setCache(key: string, data: any, expireInSeconds = 3600): Promise<void> {
  try {
    await redis.set(key, JSON.stringify(data), 'EX', expireInSeconds);
  } catch (error) {
    console.error('Redis setCache error:', error);
  }
}

/**
 * Delete a key from the cache
 * @param key Cache key to delete
 */
export async function deleteCache(key: string): Promise<void> {
  try {
    await redis.del(key);
  } catch (error) {
    console.error('Redis deleteCache error:', error);
  }
}

/**
 * Clear all data from the cache that matches a pattern
 * @param pattern Pattern to match keys (e.g., "api:*")
 */
export async function clearCachePattern(pattern: string): Promise<void> {
  try {
    const keys = await redis.keys(pattern);
    if (keys.length > 0) {
      await redis.del(...keys);
    }
  } catch (error) {
    console.error('Redis clearCachePattern error:', error);
  }
}

export default redis; 