import path from 'path';

// Configuration with defaults
export const config = {
  port: process.env.PORT || 3000,
  dbPath: process.env.DB_PATH || 'E:/Work/fcdo/fcdo/data/olap_data.duckdb',
  nodeEnv: process.env.NODE_ENV || 'development',
  corsOrigin: process.env.CORS_ORIGIN || '*',
  logLevel: process.env.LOG_LEVEL || 'info'
}; 