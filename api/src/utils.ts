import { Context } from 'hono';
import { 
  ApiResponse, 
  PaginatedResponse,
  QueryOptions
} from './types';

/**
 * Creates a successful API response
 */
export function success<T>(data: T, message?: string, count?: number): ApiResponse<T> {
  return {
    status: 'success',
    data,
    message,
    count
  };
}

/**
 * Creates an error API response
 */
export function error(message: string): ApiResponse<null> {
  return {
    status: 'error',
    message
  };
}

/**
 * Creates a paginated API response
 */
export function paginate<T>(
  data: T[],
  totalCount: number,
  page: number,
  limit: number,
  message?: string
): PaginatedResponse<T> {
  const totalPages = Math.ceil(totalCount / limit);
  
  return {
    status: 'success',
    data,
    message,
    count: data.length,
    page,
    limit,
    totalCount,
    totalPages
  };
}

/**
 * Extracts pagination parameters from request query
 */
export function getPaginationParams(c: Context): { page: number, limit: number, offset: number } {
  const page = parseInt(c.req.query('page') || '1', 10);
  const limit = parseInt(c.req.query('limit') || '20', 10);
  const offset = (page - 1) * limit;
  
  return { page, limit, offset };
}

/**
 * Generates a SQL WHERE clause from query parameters
 */
export function buildWhereClause(params: QueryOptions): { whereClause: string, whereCount: number } {
  // Skip these parameters as they're used for pagination and sorting
  const skipParams = ['page', 'limit', 'sortBy', 'sortOrder'];
  
  const conditions: string[] = [];
  let paramCount = 0;
  
  Object.entries(params).forEach(([key, value]) => {
    if (skipParams.includes(key) || value === undefined || value === '') {
      return;
    }
    
    paramCount++;
    
    // Handle different types of query parameters
    if (typeof value === 'string' && value.includes('%')) {
      // Text search with wildcards
      conditions.push(`"${key}" LIKE '${value}'`);
    } else if (typeof value === 'string' && key.endsWith('_gte')) {
      // Greater than or equal
      const actualKey = key.replace('_gte', '');
      conditions.push(`"${actualKey}" >= '${value}'`);
    } else if (typeof value === 'string' && key.endsWith('_lte')) {
      // Less than or equal
      const actualKey = key.replace('_lte', '');
      conditions.push(`"${actualKey}" <= '${value}'`);
    } else {
      // Exact match
      conditions.push(`"${key}" = '${value}'`);
    }
  });
  
  const whereClause = conditions.length > 0 
    ? `WHERE ${conditions.join(' AND ')}` 
    : '';
  
  return { whereClause, whereCount: paramCount };
}

/**
 * Generates a SQL ORDER BY clause from query parameters
 */
export function buildOrderClause(params: QueryOptions): string {
  const { sortBy, sortOrder = 'asc' } = params;
  
  if (!sortBy) {
    return 'ORDER BY "id" ASC';
  }
  
  const direction = sortOrder.toLowerCase() === 'desc' ? 'DESC' : 'ASC';
  return `ORDER BY "${sortBy}" ${direction}`;
}

/**
 * Parse query parameters from request to build query options
 */
export function parseQueryOptions(query: Record<string, string | string[]>): QueryOptions {
  const options: QueryOptions = {};
  
  // Parse pagination options
  if (query.page) {
    options.page = Number(query.page);
  }
  
  if (query.limit) {
    options.limit = Number(query.limit);
  }
  
  // Parse sort options
  if (query.sort_by) {
    options.sort_by = query.sort_by as string;
  }
  
  if (query.sort_dir) {
    options.sort_dir = query.sort_dir as string;
  }
  
  // Parse filter options (excluding pagination and sorting)
  const excludedParams = ['page', 'limit', 'sort_by', 'sort_dir', 'q'];
  
  Object.entries(query).forEach(([key, value]) => {
    if (!excludedParams.includes(key)) {
      options[key] = value as string;
    }
  });
  
  return options;
}

/**
 * Build SQL query with pagination, sorting and filtering
 */
export function buildPaginatedQuery(baseQuery: string, options: QueryOptions = {}) {
  try {
    let query = baseQuery;
    let countQuery = `SELECT COUNT(*) as total FROM (${baseQuery})`;
    
    // Add WHERE clause for filters
    const filters: string[] = [];
    
    Object.entries(options).forEach(([key, value]) => {
      // Skip pagination and sorting options
      if (!['page', 'limit', 'sort_by', 'sort_dir'].includes(key) && value !== undefined) {
        filters.push(`${key} = '${value}'`);
      }
    });
    
    if (filters.length > 0) {
      const whereClause = filters.join(' AND ');
      
      // Check if base query already has WHERE clause
      if (baseQuery.includes('WHERE') || baseQuery.includes('where')) {
        query = `${query} AND ${whereClause}`;
        countQuery = `SELECT COUNT(*) as total FROM (${query})`;
      } else {
        query = `${query} WHERE ${whereClause}`;
        countQuery = `SELECT COUNT(*) as total FROM (${query})`;
      }
    }
    
    // Add ORDER BY clause
    if (options.sort_by) {
      const direction = options.sort_dir === 'desc' ? 'DESC' : 'ASC';
      query += ` ORDER BY ${options.sort_by} ${direction}`;
    }
    
    // Add LIMIT and OFFSET for pagination
    const limit = options.limit || 20;
    const page = options.page || 1;
    const offset = (page - 1) * limit;
    
    query += ` LIMIT ${limit} OFFSET ${offset}`;
    
    return { query, countQuery };
  } catch (error) {
    console.error('Error building paginated query:', error);
    return { 
      query: baseQuery + ' LIMIT 20',
      countQuery: `SELECT COUNT(*) as total FROM (${baseQuery})`
    };
  }
} 