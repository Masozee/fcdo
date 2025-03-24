/**
 * Client-side utilities for API requests with built-in caching
 */

// Local memory cache for client-side
interface CacheItem<T> {
  data: T;
  expiry: number;
}

// In-memory cache with expiry
const memoryCache: Record<string, CacheItem<any>> = {};

// Cache duration in milliseconds (default: 5 minutes)
const DEFAULT_CACHE_DURATION = 5 * 60 * 1000;

/**
 * Fetch data from API with client-side caching
 * 
 * @param url API endpoint URL
 * @param options Fetch options and cache settings
 * @returns The response data
 */
export async function fetchWithCache<T>(
  url: string, 
  options: {
    method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
    headers?: Record<string, string>;
    body?: any;
    cacheDuration?: number; // In milliseconds
    skipCache?: boolean;
  } = {}
): Promise<T> {
  const {
    method = 'GET',
    headers = {},
    body,
    cacheDuration = DEFAULT_CACHE_DURATION,
    skipCache = false
  } = options;

  // Only cache GET requests
  const canUseCache = method === 'GET' && !skipCache;
  
  // Generate cache key from URL and method
  const cacheKey = `${method}:${url}`;
  
  // Check if we have a valid cached response
  if (canUseCache && memoryCache[cacheKey]) {
    const cachedItem = memoryCache[cacheKey];
    const now = Date.now();
    
    // If the cache is still valid, return the cached data
    if (cachedItem.expiry > now) {
      return cachedItem.data as T;
    }
    
    // Clear expired cache
    delete memoryCache[cacheKey];
  }
  
  // Prepare fetch options
  const fetchOptions: RequestInit = {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...headers,
    },
    credentials: 'same-origin',
  };
  
  // Add body for non-GET requests
  if (method !== 'GET' && body) {
    fetchOptions.body = JSON.stringify(body);
  }
  
  try {
    // Make API request
    const response = await fetch(url, fetchOptions);
    
    // Handle error responses
    if (!response.ok) {
      throw new Error(`API error: ${response.status} ${response.statusText}`);
    }
    
    // Parse the response
    const data = await response.json();
    
    // Cache successful GET responses
    if (canUseCache) {
      memoryCache[cacheKey] = {
        data,
        expiry: Date.now() + cacheDuration
      };
    }
    
    return data as T;
  } catch (error) {
    console.error(`Error fetching ${url}:`, error);
    throw error;
  }
}

/**
 * Clear all client-side cache items or specific keys
 * @param pattern Optional pattern to match keys (e.g., 'GET:' to clear only GET requests)
 */
export function clearClientCache(pattern?: string): void {
  if (!pattern) {
    // Clear all cache
    Object.keys(memoryCache).forEach(key => {
      delete memoryCache[key];
    });
  } else {
    // Clear cache matching pattern
    Object.keys(memoryCache).forEach(key => {
      if (key.includes(pattern)) {
        delete memoryCache[key];
      }
    });
  }
}

/**
 * Get a specific item from the client cache
 * @param cacheKey The cache key
 * @returns The cached item or null if not found or expired
 */
export function getClientCacheItem<T>(cacheKey: string): T | null {
  const cachedItem = memoryCache[cacheKey];
  if (cachedItem && cachedItem.expiry > Date.now()) {
    return cachedItem.data as T;
  }
  return null;
} 