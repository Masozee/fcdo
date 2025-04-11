# API Endpoints

This project provides several API endpoints for accessing trade data.

## Active API Endpoints

### Countries List

**Endpoint:** `/api/countries/list`

**Description:** Returns a list of all countries with their codes, names, and regions.

**Example:**
```
GET /api/countries/list
```

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

### Trade Data

**Endpoint:** `/api/trade`

**Query Parameters:**
- `country` (optional): Alpha-2 country code
- `year` (optional): Filter by year
- `tradeFlow` (optional): Filter by 'exports' (103) or 'imports' (102)
- `hsCode` (optional): Product HS code

**Example:**
```
GET /api/trade?country=US&year=2023&tradeFlow=exports
```

### HS Codes Data

**Endpoint:** `/api/hs-codes`

**Query Parameters:**
- `level` (optional): Specify the HS code level to return (hs2, hs4, or hs6). If not provided, all levels are returned.

**Example:**
```
GET /api/hs-codes?level=hs2
```

### Total Trade Data

**Endpoint:** `/api/total-trade`

**Query Parameters:**
- `year` (optional): Filter by year
- `limit` (optional): Limit the number of results (default: 100)

**Example:**
```
GET /api/total-trade?year=2023&limit=1000
```

### Countries Trade

**Endpoint:** `/api/countries/trade`

**Query Parameters:**
- `year` (optional): Filter by year

**Example:**
```
GET /api/countries/trade?year=2023
```

### Map Data

**Endpoint:** `/api/map-data`

**Description:** Returns GeoJSON data for map visualization.

**Example:**
```
GET /api/map-data
```

## Implementation Details

The APIs connect to a SQLite database to fetch trade data. They include fallback mechanisms to provide sample data when the database is not available or when requested data is not found. 