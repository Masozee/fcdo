# Trade Data SQLite Database

This document explains how to create and use the SQLite database for storing trade data, HS codes, and related information.

## Database Schema

The SQLite database includes the following tables:

1. **countries** - List of countries with their codes and regions
2. **trade_data** - Bilateral trade flows between countries
3. **hs2_codes** - HS2 level product codes (chapters)
4. **hs4_codes** - HS4 level product codes (headings)
5. **hs6_codes** - HS6 level product codes (subheadings)
6. **product_trade** - Trade data by product (HS codes)

## Setting Up the Database

### Prerequisites

- Node.js (v14+)
- NPM (v6+)
- CSV files with trade data (see below)

### Files Required

The database creation script expects the following files:

1. `data/countries.csv` - List of countries with name, code, and region
2. `data/trade_data.csv` - Bilateral trade data with source country, destination country, year, value, etc.
3. `data/product_trade.csv` - Product-specific trade data with country, HS code, level, year, value, etc.
4. `public/data/hs-codes.json` - JSON file with HS code hierarchies

### Installation

```bash
# Navigate to the scripts directory
cd scripts

# Install dependencies
npm install

# Run the database creation script
npm start
```

The script will:
1. Create the SQLite database file at `public/data/trade_data.sqlite`
2. Create all necessary tables and indexes
3. Import data from the CSV and JSON files
4. Log progress and any errors to the console

## Using the Database in the Application

The database can be accessed from the Next.js application using the functions provided in `src/lib/db.ts`.

### Example Usage

```typescript
import { getCountries, getTradeData, getHSCodes } from '@/lib/db';

// In an API route or server component
export async function GET() {
  // Get all countries
  const countries = await getCountries();
  
  // Get trade data between two countries
  const tradeData = await getTradeData(1, 2, 2023);
  
  // Get all HS2 codes
  const hsCodes = await getHSCodes('hs2');
  
  return Response.json({ countries, tradeData, hsCodes });
}
```

### Available Functions

- `getDatabase()` - Get a database connection
- `getCountries()` - Get all countries
- `getCountryById(id)` - Get a country by ID
- `getTradeData(sourceId, destId, year?)` - Get trade data between countries
- `getHSCodes(level)` - Get all HS codes at a specific level
- `getHSCodeByCode(code, level)` - Get an HS code by its code value
- `getChildHSCodes(parentCode, parentLevel)` - Get child HS codes
- `getProductTradeData(countryId, hsCode, hsLevel, year?)` - Get product trade data
- `getAvailableYears()` - Get all available years in the trade data
- `getTopTradingPartners(countryId, limit?, year?)` - Get top trading partners
- `getTopProducts(countryId, hsLevel?, limit?, year?)` - Get top traded products

## CSV File Formats

### countries.csv

```
name,code,region
United States,USA,North America
China,CHN,Asia
...
```

### trade_data.csv

```
source_country,destination_country,year,value,import_value,export_value
Indonesia,United States,2023,32000,12000,20000
...
```

### product_trade.csv

```
country,hs_code,hs_level,year,value,import_value,export_value
Indonesia,01,hs2,2023,15000,7000,8000
...
```

## Integrating with the Map

The SQLite database can be integrated with the world map visualization by:

1. Creating API endpoints that fetch data from the database
2. Updating the TradeMap component to fetch data from these endpoints
3. Visualizing the data on the map

Example API endpoint in `src/app/api/trade/route.ts`:

```typescript
import { getTopTradingPartners } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const countryId = parseInt(searchParams.get('countryId') || '0', 10);
  const year = parseInt(searchParams.get('year') || '2023', 10);
  
  if (!countryId) {
    return NextResponse.json({ error: 'Country ID is required' }, { status: 400 });
  }
  
  try {
    const partners = await getTopTradingPartners(countryId, 10, year);
    return NextResponse.json(partners);
  } catch (error) {
    console.error('Error fetching trade partners:', error);
    return NextResponse.json({ error: 'Failed to fetch data' }, { status: 500 });
  }
}
```

Then, update the TradeMap component to fetch and display this data. 