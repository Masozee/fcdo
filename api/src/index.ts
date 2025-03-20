import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import { prettyJSON } from 'hono/pretty-json';
import { config } from './config';
import db from './db';
import productsRouter from './routes/products';
import countriesRouter from './routes/countries';
import tradeRouter from './routes/trade';

const app = new Hono();

// Middleware
app.use('*', logger());
app.use('*', prettyJSON());
app.use('*', cors({
  origin: config.corsOrigin,
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization'],
  exposeHeaders: ['Content-Length', 'X-Total-Count'],
  maxAge: 86400,
}));

// API version prefix
const api = new Hono();

// Health check
app.get('/', (c) => c.json({
  status: 'ok',
  version: '1.0.0',
  environment: config.nodeEnv
}));

// Direct database test endpoints
app.get('/test/tables', async (c) => {
  try {
    const tables = await db.query(`SHOW TABLES`);
    return c.json({ tables });
  } catch (error) {
    return c.json({ error: error instanceof Error ? error.message : 'Unknown error' }, 500);
  }
});

app.get('/test/product/:limit', async (c) => {
  try {
    const limit = Number(c.req.param('limit') || '5');
    const products = await db.query(`SELECT * FROM data_productcode LIMIT ${limit}`);
    return c.json({ products, count: products.length });
  } catch (error) {
    return c.json({ error: error instanceof Error ? error.message : 'Unknown error' }, 500);
  }
});

app.get('/test/trade/:limit', async (c) => {
  try {
    const limit = Number(c.req.param('limit') || '5');
    const trades = await db.query(`SELECT * FROM data_hstradedata LIMIT ${limit}`);
    return c.json({ trades, count: trades.length });
  } catch (error) {
    return c.json({ error: error instanceof Error ? error.message : 'Unknown error' }, 500);
  }
});

// DEBUG route to show all routes
app.get('/routes', (c) => {
  const routes = [];
  
  // Health check
  routes.push({
    method: 'GET',
    path: '/',
    description: 'Health check'
  });
  
  // Test routes
  routes.push({
    method: 'GET',
    path: '/test/tables',
    description: 'List all database tables'
  });
  
  routes.push({
    method: 'GET',
    path: '/test/product/:limit',
    description: 'Test product data retrieval'
  });
  
  routes.push({
    method: 'GET',
    path: '/test/trade/:limit',
    description: 'Test trade data retrieval'
  });
  
  // Products routes
  routes.push({
    method: 'GET',
    path: '/api/v1/products',
    description: 'Get all product codes'
  });
  
  // Countries routes
  routes.push({
    method: 'GET',
    path: '/api/v1/countries',
    description: 'Get all countries'
  });
  
  // Trade routes
  routes.push({
    method: 'GET',
    path: '/api/v1/trade',
    description: 'Get all trade data'
  });
  
  return c.json(routes);
});

// Register routers
api.route('/products', productsRouter);
api.route('/countries', countriesRouter);
api.route('/trade', tradeRouter);

// Mount API routes with version prefix
app.route('/api/v1', api);

// Add a catch-all error handler
app.onError((err, c) => {
  console.error('Global error handler:', err);
  return c.json({
    error: {
      message: err.message,
      stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
    }
  }, 500);
});

export default app; 