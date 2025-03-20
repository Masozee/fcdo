import * as duckdb from 'duckdb';
import fs from 'fs';
import { config } from './config';

// Check if database file exists
if (!fs.existsSync(config.dbPath)) {
  throw new Error(`DuckDB database file not found at: ${config.dbPath}`);
}

console.log(`Using database at: ${config.dbPath}`);

// Create database connection
const db = new duckdb.Database(config.dbPath);

// Connect to database
const connect = (): Promise<duckdb.Connection> => {
  return new Promise((resolve, reject) => {
    const timeout = setTimeout(() => {
      reject(new Error('Database connection timeout after 5000ms'));
    }, 5000);

    try {
      // @ts-ignore - DuckDB types are not accurate
      db.connect((err: any, conn: any) => {
        clearTimeout(timeout);
        if (err) {
          console.error('Database connection error:', err);
          reject(err);
        } else {
          console.log('Database connection established successfully');
          resolve(conn);
        }
      });
    } catch (error) {
      clearTimeout(timeout);
      console.error('Error connecting to database:', error);
      reject(error);
    }
  });
};

let connectionPromise: Promise<duckdb.Connection> | null = null;

// Get or create database connection
const getConnection = (): Promise<duckdb.Connection> => {
  if (!connectionPromise) {
    connectionPromise = connect();
  }
  return connectionPromise;
};

// Helper function to execute queries with timeout
export async function query<T = any>(sql: string, timeout = 10000): Promise<T[]> {
  const conn = await getConnection();
  return new Promise((resolve, reject) => {
    const queryTimeout = setTimeout(() => {
      reject(new Error(`Query timeout after ${timeout}ms: ${sql.substring(0, 100)}...`));
    }, timeout);

    try {
      console.log(`Executing query: ${sql.substring(0, 100)}...`);
      
      // @ts-ignore - DuckDB types are not accurate
      conn.all(sql, (err: any, result: any) => {
        clearTimeout(queryTimeout);
        if (err) {
          console.error('DuckDB Query Error:', err, 'SQL:', sql.substring(0, 100));
          reject(err);
        } else {
          console.log(`Query returned ${result?.length || 0} rows`);
          resolve(result as T[]);
        }
      });
    } catch (error) {
      clearTimeout(queryTimeout);
      console.error('Error executing query:', error, 'SQL:', sql.substring(0, 100));
      reject(error);
    }
  });
}

// Helper function to execute a single query and return first result
export async function queryOne<T = any>(sql: string, timeout = 5000): Promise<T | null> {
  try {
    const results = await query<T>(sql, timeout);
    return results.length > 0 ? results[0] : null;
  } catch (error) {
    console.error('Error in queryOne:', error);
    return null;
  }
}

// Helper function to execute a query without returning results
export async function execute(sql: string, timeout = 5000): Promise<boolean> {
  const conn = await getConnection();
  return new Promise((resolve, reject) => {
    const queryTimeout = setTimeout(() => {
      reject(new Error(`Execution timeout after ${timeout}ms: ${sql.substring(0, 100)}...`));
    }, timeout);

    try {
      // @ts-ignore - DuckDB types are not accurate
      conn.run(sql, (err: any) => {
        clearTimeout(queryTimeout);
        if (err) {
          console.error('DuckDB Execution Error:', err, 'SQL:', sql.substring(0, 100));
          reject(err);
        } else {
          resolve(true);
        }
      });
    } catch (error) {
      clearTimeout(queryTimeout);
      console.error('Error executing command:', error, 'SQL:', sql.substring(0, 100));
      reject(error);
    }
  });
}

// Close the database connection when the application exits
process.on('exit', async () => {
  try {
    console.log('Closing database connection...');
    const conn = await getConnection();
    conn.close();
    db.close();
    console.log('Database connection closed');
  } catch (error) {
    console.error('Error closing database connection:', error);
  }
});

export default {
  query,
  queryOne,
  execute
}; 