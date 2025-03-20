import { Hono } from 'hono';
import * as countriesController from '../controllers/countries.controller';

const countriesRouter = new Hono();

// Search countries - must be before any path-based routes
countriesRouter.get('/search', countriesController.searchCountries);

// Get country statistics
countriesRouter.get('/stats', countriesController.getCountryStats);

// Get country by ISO code
countriesRouter.get('/code/:isoCode', countriesController.getCountryByIsoCode);

// Get countries by region
countriesRouter.get('/region/:region', countriesController.getCountriesByRegion);

// Get all countries
countriesRouter.get('/', countriesController.getCountries);

// Get country by ID - must be last to avoid conflicts
countriesRouter.get('/:id', countriesController.getCountryById);

export default countriesRouter; 