import { Hono } from 'hono';
import * as tradeController from '../controllers/trade.controller';

const tradeRouter = new Hono();

// Get trade data by country
tradeRouter.get('/country/:countryCode', tradeController.getTradeDataByCountry);

// Get trade data by category (HS code)
tradeRouter.get('/category/:hsCode', tradeController.getTradeDataByCategory);

// Get trade data by year
tradeRouter.get('/year/:year', tradeController.getTradeDataByYear);

// Get all trade data
tradeRouter.get('/', tradeController.getTradeData);

// Get trade data by ID - must be last to avoid conflicts
tradeRouter.get('/:id', tradeController.getTradeDataById);

export default tradeRouter; 