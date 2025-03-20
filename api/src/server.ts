import { serve } from '@hono/node-server';
import app from './index';
import { config } from './config';

console.log(`Server is running on port ${config.port} in ${config.nodeEnv} mode`);

serve({
  fetch: app.fetch,
  port: Number(config.port)
}); 