# Hono API Endpoints

This project uses [Hono](https://github.com/honojs/hono) for API route handling. Hono is a small, simple, and ultrafast web framework for the Edges.

## Available Endpoints

### Country Trade Data

**Endpoint:** `/api/country-trade`

**Query Parameters:**
- `year` (optional): Filter data by year (e.g., 2023, 2022, 2021, etc.)

**Example:**
```
GET /api/country-trade?year=2023
```

**Response:**
```json
[
  {
    "id": 1,
    "country": "United States",
    "imports": 2500000000000,
    "exports": 1800000000000,
    "total": 4300000000000,
    "products": ["8471", "8703", "2709", "3004", "8517"]
  },
  ...
]
```

### HS Codes Data

**Endpoint:** `/api/hs-codes`

**Query Parameters:**
- `level` (optional): Specify the HS code level to return (hs2, hs4, or hs6). If not provided, all levels are returned.

**Example:**
```
GET /api/hs-codes?level=hs2
```

**Response:**
```json
{
  "hs2": [
    {
      "code": "84",
      "description": "Machinery and mechanical appliances",
      "value": 2500000000000
    },
    ...
  ]
}
```

## Implementation Details

The API uses a catch-all route handler (`[...path]/route.ts`) to process all API requests through Hono. Each API endpoint is defined as a route in the Hono app instance.

The database implementation automatically falls back to in-memory data when SQLite is not available or encounters errors. This ensures that the API always returns valid responses. 