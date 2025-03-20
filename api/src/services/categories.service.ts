import db from '../db';
import { Category, QueryOptions } from '../types';
import { buildPaginatedQuery } from '../utils';

const BASE_QUERY = 'SELECT * FROM "data_category"';

/**
 * Get all categories with pagination and filtering
 */
export async function getCategories(options: QueryOptions = {}) {
  const { query, countQuery } = buildPaginatedQuery(BASE_QUERY, options);
  
  const categories = await db.query<Category>(query);
  const totalCount = await db.queryOne<{ total: number }>(countQuery);
  
  return {
    categories,
    totalCount: totalCount?.total || 0
  };
}

/**
 * Get category by ID
 */
export async function getCategoryById(id: number): Promise<Category | null> {
  return db.queryOne<Category>(`${BASE_QUERY} WHERE id = ${id}`);
}

/**
 * Get category by name
 */
export async function getCategoryByName(name: string): Promise<Category | null> {
  return db.queryOne<Category>(`${BASE_QUERY} WHERE name = '${name}'`);
}

/**
 * Create a new category
 */
export async function createCategory(category: Omit<Category, 'id'>): Promise<boolean> {
  const { name, keterangan } = category;
  
  const query = `
    INSERT INTO "data_category" (name, keterangan)
    VALUES ('${name}', ${keterangan ? `'${keterangan}'` : 'NULL'})
  `;
  
  return db.execute(query);
}

/**
 * Update an existing category
 */
export async function updateCategory(id: number, category: Partial<Category>): Promise<boolean> {
  const updates: string[] = [];
  
  if (category.name !== undefined) {
    updates.push(`name = '${category.name}'`);
  }
  
  if (category.keterangan !== undefined) {
    updates.push(`keterangan = ${category.keterangan ? `'${category.keterangan}'` : 'NULL'}`);
  }
  
  if (updates.length === 0) {
    return false;
  }
  
  const query = `
    UPDATE "data_category"
    SET ${updates.join(', ')}
    WHERE id = ${id}
  `;
  
  return db.execute(query);
}

/**
 * Delete a category
 */
export async function deleteCategory(id: number): Promise<boolean> {
  const query = `DELETE FROM "data_category" WHERE id = ${id}`;
  return db.execute(query);
} 