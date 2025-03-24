// Environment configuration for the application

/** @type {Record<string, string>} */
export const env = {
  // Database
  DATABASE_URL: process.env.DATABASE_URL || '',
  
  // Redis for caching
  REDIS_URL: process.env.REDIS_URL || "redis://default:zlG01drDINg8GYjrxiMabVepje7pfIIP@redis-19291.c252.ap-southeast-1-1.ec2.redns.redis-cloud.com:19291",
  
  // API URLs
  API_BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL || '',
  
  // Other configuration
  NODE_ENV: process.env.NODE_ENV || 'development',
  
  // Cache durations in seconds
  CACHE_DURATION: {
    SHORT: 60 * 5, // 5 minutes
    MEDIUM: 60 * 30, // 30 minutes
    LONG: 60 * 60 * 24, // 24 hours
    WEEK: 60 * 60 * 24 * 7, // 7 days
  }
}; 