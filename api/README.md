# Trade Data API

This API provides access to trade data, product codes, and country information stored in a DuckDB database.

## Getting Started

### Prerequisites

- Node.js 14+
- npm or yarn

### Installation

1. Clone the repository
2. Install dependencies:
   ```
   npm install
   ```
3. Make sure the DuckDB database file is in the correct location (`../data/olap_data.duckdb`)

### Development

```
npm run dev
```

This will start the development server with hot reloading.

### Production

```
npm run build
npm run start
```

## API Endpoints

All endpoints are prefixed with `/api/v1`.

### Products

- `GET /products` - Get all product codes with pagination
- `GET /products/:id` - Get product code by ID
- `GET /products/code/:code` - Get product code by code
- `GET /products/level/:level` - Get product codes by HS level (2, 4, or 6)
- `GET /products/search?q=:query` - Search product codes by name or code
- `GET /products/hierarchy/:code` - Get product hierarchy (HS2 > HS4 > HS6)

### Countries

- `GET /countries` - Get all countries with pagination
- `GET /countries/:id` - Get country by ID
- `GET /countries/code/:isoCode` - Get country by ISO code
- `GET /countries/search?q=:query` - Search countries by name or ISO code
- `GET /countries/region/:region` - Get countries by region
- `GET /countries/stats` - Get country statistics

### Trade Data

- `GET /trade` - Get all trade data with pagination
- `GET /trade/:id` - Get trade data by ID
- `GET /trade/country/:countryCode` - Get trade data by country
- `GET /trade/category/:hsCode` - Get trade data by category (HS code)
- `GET /trade/year/:year` - Get trade data by year

## Query Parameters

All endpoints that return multiple items support the following query parameters:

- `page` - Page number (default: 1)
- `limit` - Items per page (default: 20)
- `sort_by` - Sort field
- `sort_dir` - Sort direction (`asc` or `desc`) 