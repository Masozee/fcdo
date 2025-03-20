import { spawn } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';

// Define the path to the DuckDB database
const DB_PATH = path.resolve(process.cwd(), 'data', 'olap_data.duckdb');

// Check if database file exists
if (!fs.existsSync(DB_PATH)) {
  console.error(`DuckDB database file not found at: ${DB_PATH}`);
}

// Check for Mac OS
const isMac = os.platform() === 'darwin';

/**
 * Execute DuckDB query using the CLI
 */
export async function runDuckDbQuery(sql: string): Promise<any[]> {
  return new Promise((resolve, reject) => {
    console.log(`Executing query: ${sql.substring(0, 100)}${sql.length > 100 ? '...' : ''}`);

    try {
      // Run the duckdb CLI command
      const duckdbProcess = spawn('duckdb', [
        DB_PATH,
        '-json',
        '-c', sql
      ]);

      let stdout = '';
      let stderr = '';

      duckdbProcess.stdout.on('data', (data) => {
        stdout += data.toString();
      });

      duckdbProcess.stderr.on('data', (data) => {
        stderr += data.toString();
      });

      duckdbProcess.on('close', (code) => {
        if (code !== 0) {
          console.error(`DuckDB process exited with code ${code}`);
          console.error(`stderr: ${stderr}`);
          reject(new Error(`DuckDB CLI error: ${stderr}`));
          return;
        }

        try {
          // Check if output is empty
          if (!stdout.trim()) {
            console.log('Query returned empty result');
            resolve([]);
            return;
          }

          const result = JSON.parse(stdout);
          console.log(`Query returned ${result.length} rows`);
          resolve(result);
        } catch (e) {
          console.error('Error parsing JSON result:', e);
          console.log('Raw output:', stdout);
          reject(e);
        }
      });

      duckdbProcess.on('error', (error) => {
        console.error('Error spawning DuckDB process:', error);
        reject(error);
      });
    } catch (error) {
      console.error('Error executing query:', error);
      reject(error);
    }
  });
}

/**
 * Execute a query and return all results
 */
export async function query<T = any>(sql: string): Promise<T[]> {
  try {
    const results = await runDuckDbQuery(sql);
    return results as T[];
  } catch (error) {
    console.error('Error in query:', error);
    throw error;
  }
}

/**
 * Execute a query and return the first result
 */
export async function queryOne<T = any>(sql: string): Promise<T | null> {
  try {
    const results = await query<T>(sql);
    return results.length > 0 ? results[0] : null;
  } catch (error) {
    console.error('Error in queryOne:', error);
    throw error;
  }
}

/**
 * Execute a statement without returning results
 */
export async function execute(sql: string): Promise<boolean> {
  try {
    await runDuckDbQuery(sql);
    return true;
  } catch (error) {
    console.error('Error in execute:', error);
    throw error;
  }
}

export default {
  query,
  queryOne,
  execute
}; 