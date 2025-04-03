/**
 * Utility function for building URLs with query parameters
 * @param baseUrl The base URL
 * @param params Object containing query parameters
 * @returns Formatted URL with query parameters
 */
export function buildUrl(baseUrl: string, params: Record<string, any>): string {
  const url = new URL(baseUrl, "http://localhost:3000");
  
  // Add query parameters if they exist and are not undefined or empty
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        url.searchParams.append(key, value.toString());
      }
    });
  }
  
  // Return just the pathname and search params (without the hostname)
  return `${url.pathname}${url.search}`;
} 