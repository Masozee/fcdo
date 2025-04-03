# Trade Data API Endpoints

This document provides a comprehensive list of all available API endpoints for accessing trade data in the system.

## Cooperation Trade Data

Retrieve trade data for international cooperations (e.g., ASEAN, EU, etc.).

### Base URL
```
/api/cooperations/trade
```

### Query Parameters

| Parameter | Type   | Description | Example |
|-----------|--------|-------------|---------|
| slug      | string | **Required.** The slug identifier of the cooperation | `asean`, `eu` |
| tradeFlow | string/number | Filter by trade flow type. Use either the string name or ID | `exports` (or `103`), `imports` (or `102`) |
| year      | number | Filter by year | `2023` |
| hsCode    | string | Filter by HS code | `27` for Mineral fuels |

### Example URLs
```
/api/cooperations/trade?slug=asean
/api/cooperations/trade?slug=asean&tradeFlow=exports
/api/cooperations/trade?slug=asean&tradeFlow=imports
/api/cooperations/trade?slug=asean&year=2023
/api/cooperations/trade?slug=asean&hsCode=27
/api/cooperations/trade?slug=asean&tradeFlow=exports&year=2023&hsCode=27
```

## General Trade Data

Retrieve detailed trade data with various filters.

### Base URL
```
/api/trade
```

### Query Parameters

| Parameter | Type   | Description | Example |
|-----------|--------|-------------|---------|
| country   | string | Filter by country using ISO Alpha-2 code | `SG` for Singapore |
| tradeFlow | string/number | Filter by trade flow type. Use either the string name or ID | `exports` (or `103`), `imports` (or `102`) |
| year      | number | Filter by year | `2023` |
| hsCode    | string/number | Filter by HS code or product category ID | `27` or product ID |

### Example URLs
```
/api/trade?country=SG
/api/trade?country=SG&tradeFlow=exports
/api/trade?country=SG&tradeFlow=imports
/api/trade?year=2023
/api/trade?hsCode=27
/api/trade?country=SG&tradeFlow=exports&year=2023&hsCode=27
```

## Countries Trade Data

Retrieve trade data for all countries with their export, import, and total trade values.

### Base URL
```
/api/countries/trade
```

### Query Parameters

| Parameter | Type   | Description | Example |
|-----------|--------|-------------|---------|
| year      | number | Filter by year | `2023` |
| limit     | number | Limit the number of results (default: 250) | `50` |
| offset    | number | Number of results to skip for pagination (default: 0) | `50` |

### Example URLs
```
/api/countries/trade
/api/countries/trade?year=2023
/api/countries/trade?limit=50&offset=50
```

## Countries Summary

Retrieve a simplified summary of all countries' trade data.

### Base URL
```
/api/countries/summary
```

### Query Parameters

| Parameter | Type   | Description | Example |
|-----------|--------|-------------|---------|
| year      | number | Filter by year | `2023` |

### Example URLs
```
/api/countries/summary
/api/countries/summary?year=2023
```

## Countries Rankings

Retrieve rankings of countries by their export, import, and total trade values.

### Base URL
```
/api/countries/rankings
```

### Query Parameters

| Parameter | Type   | Description | Example |
|-----------|--------|-------------|---------|
| year      | number | Filter by year | `2023` |
| limit     | number | Limit the number of results (default: 20) | `10` |
| type      | string | Type of ranking to return: 'all', 'exports', 'imports', 'total' (default: 'all') | `exports` |

### Example URLs
```
/api/countries/rankings
/api/countries/rankings?year=2023
/api/countries/rankings?type=exports&limit=10
```

## Cooperation Data

Retrieve information about international cooperations.

### Base URL
```
/api/cooperations
```

### Example URL
```
/api/cooperations
```

## TradeFlow Data

Retrieve information about available trade flow types.

### Base URL
```
/api/tradeflow
```

### Example URL
```
/api/tradeflow
```

## Trade Summary Data

Retrieve summary trade data with aggregated statistics.

### Base URL
```
/api/trade/summary
```

### Example URL
```
/api/trade/summary
```

## HS Codes Data

Retrieve available HS (Harmonized System) codes for products.

### Base URL
```
/api/trade/hs-codes
```

### Example URL
```
/api/trade/hs-codes
```

## Country Trade Data

Retrieve trade data with country-centric information.

### Base URL
```
/api/country-trade
```

### Query Parameters

| Parameter | Type   | Description | Example |
|-----------|--------|-------------|---------|
| year      | number | Filter by year | `2023` |

### Example URL
```
/api/country-trade?year=2023
```

## Map Data

Retrieve data formatted for map visualizations.

### Base URL
```
/api/map-data
```

### Query Parameters

| Parameter | Type   | Description | Example |
|-----------|--------|-------------|---------|
| year      | number | Filter by year | `2023` |
| metric    | string | Type of measurement | `total` |

### Example URL
```
/api/map-data?year=2023&metric=total
```

## Error Handling

All API endpoints return responses in the following format:

For successful requests:
```json
{
  "success": true,
  "data": [...],
  "metadata": {...}
}
```

For failed requests:
```json
{
  "success": false,
  "error": "Error message"
}
```

Standard HTTP status codes are used:
- 200: Success
- 400: Bad Request (e.g., missing required parameters)
- 404: Not Found
- 500: Server Error 