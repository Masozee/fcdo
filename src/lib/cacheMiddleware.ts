import { NextRequest, NextResponse } from 'next/server';
import { getCache, setCache } from '@/lib/redis';

interface CacheOptions {
  prefix?: string;
  ttl?: number; // Time-to-live in seconds
  bypassQueryParams?: string[]; // Query params that should bypass cache (e.g., ['refresh'])
}

/**
 * Middleware function to cache API responses in Redis
 * 
 * @param handler The API route handler
 * @param options Caching options
 * @returns A new handler with caching
 */
export function withCache(
  handler: (req: NextRequest) => Promise<NextResponse>,
  options: CacheOptions = {}
) {
  const { 
    prefix = 'api:',
    ttl = 3600, // 1 hour default
    bypassQueryParams = ['refresh', 'bypass_cache']
  } = options;

  return async (req: NextRequest) => {
    const url = new URL(req.url);
    
    // Create a unique cache key based on the URL and query parameters
    const cacheKey = `${prefix}${url.pathname}${url.search}`;
    
    // Check if we should bypass the cache
    const shouldBypassCache = bypassQueryParams.some(param => 
      url.searchParams.has(param) && url.searchParams.get(param) !== 'false'
    );

    // Try to get from cache first (unless bypassing)
    if (!shouldBypassCache) {
      try {
        const cachedResponse = await getCache<Response>(cacheKey);
        
        if (cachedResponse) {
          // Return the cached response with a custom header indicating it was from cache
          const response = NextResponse.json(
            cachedResponse,
            { 
              status: 200,
              headers: { 
                'X-Cache': 'HIT',
                'Cache-Control': `public, max-age=${ttl}`
              } 
            }
          );
          return response;
        }
      } catch (error) {
        console.error('Cache retrieval error:', error);
        // Continue to the handler on cache error
      }
    }

    // No cached response or bypassing cache, call the handler
    const response = await handler(req);
    
    // Only cache successful responses
    if (response.status >= 200 && response.status < 300 && !shouldBypassCache) {
      try {
        // Clone the response data
        const responseData = await response.clone().json();
        
        // Store in cache
        await setCache(cacheKey, responseData, ttl);
        
        // Set cache control headers
        response.headers.set('Cache-Control', `public, max-age=${ttl}`);
        response.headers.set('X-Cache', 'MISS');
      } catch (error) {
        console.error('Cache storage error:', error);
        // Continue even if caching fails
      }
    }

    return response;
  };
} 