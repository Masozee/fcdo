import { Hono } from 'hono';
import * as productsController from '../controllers/products.controller';

const productsRouter = new Hono();

// Search product codes - must be before any path-based routes
productsRouter.get('/search', productsController.searchProductCodes);

// Get product codes by HS level
productsRouter.get('/level/:level', productsController.getProductCodesByLevel);

// Get product code by code
productsRouter.get('/code/:code', productsController.getProductCodeByCode);

// Get product hierarchy
productsRouter.get('/hierarchy/:code', productsController.getProductHierarchy);

// Get all product codes
productsRouter.get('/', productsController.getProductCodes);

// Get product code by ID - must be last to avoid conflicts
productsRouter.get('/:id', productsController.getProductCodeById);

export default productsRouter; 