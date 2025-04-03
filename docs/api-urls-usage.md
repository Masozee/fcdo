# API URL Usage Examples

This document provides examples of how to use the TypeScript API URL builders in your application.

## Import the URL Builder Functions

```typescript
import { 
  buildCooperationTradeUrl, 
  buildTradeUrl, 
  buildCountryTradeUrl, 
  buildMapDataUrl,
  buildCountriesSummaryUrl,
  buildCountriesRankingsUrl,
  API_URLS,
  TradeFlowType 
} from '@/types/api-urls';
```

## Examples

### Get Trade Data for ASEAN with Export/Import Filtering

```typescript
import { buildCooperationTradeUrl } from '@/types/api-urls';
import { useEffect, useState } from 'react';

function ASEANTradeComponent() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tradeFlow, setTradeFlow] = useState<TradeFlowType>('exports');
  
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      
      const url = buildCooperationTradeUrl({
        slug: 'asean',
        tradeFlow: tradeFlow,
        year: '2023',
      });
      
      try {
        const response = await fetch(url);
        const result = await response.json();
        
        if (result.success) {
          setData(result.data);
        } else {
          console.error('Error fetching data:', result.error);
        }
      } catch (error) {
        console.error('Failed to fetch data:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [tradeFlow]);
  
  return (
    <div>
      <div className="controls">
        <button onClick={() => setTradeFlow('exports')}>Show Exports</button>
        <button onClick={() => setTradeFlow('imports')}>Show Imports</button>
      </div>
      
      {loading ? (
        <p>Loading...</p>
      ) : data ? (
        <div className="results">
          <h2>{data.cooperation.name} Trade Data ({tradeFlow})</h2>
          {/* Render your data here */}
        </div>
      ) : (
        <p>No data available</p>
      )}
    </div>
  );
}
```

### Country-Specific Trade Data

```typescript
import { buildTradeUrl } from '@/types/api-urls';

// Get all trade data for Singapore
const singaporeTradeUrl = buildTradeUrl({ country: 'SG' });

// Get only export data for Singapore in 2023
const singaporeExportsUrl = buildTradeUrl({
  country: 'SG',
  tradeFlow: 'exports', // Maps to ID 103
  year: '2023'
});

// Get only import data for Singapore in 2023
const singaporeImportsUrl = buildTradeUrl({
  country: 'SG',
  tradeFlow: 'imports', // Maps to ID 102
  year: '2023'
});

// Get data for a specific product category (HS code 27 - Mineral fuels)
const singaporeFuelExportsUrl = buildTradeUrl({
  country: 'SG',
  tradeFlow: 'exports',
  hsCode: '27'
});
```

### Working with Global Country Trade Data

```typescript
import { buildCountriesSummaryUrl, buildCountriesRankingsUrl } from '@/types/api-urls';
import { useEffect, useState } from 'react';

function GlobalTradeComponent() {
  const [summaryData, setSummaryData] = useState(null);
  const [topExporters, setTopExporters] = useState(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      
      // Get summary of all countries trade data
      const summaryUrl = buildCountriesSummaryUrl({ year: '2023' });
      
      // Get top 10 exporters
      const rankingsUrl = buildCountriesRankingsUrl({
        year: '2023',
        type: 'exports',
        limit: 10
      });
      
      try {
        // Fetch both datasets in parallel
        const [summaryResponse, rankingsResponse] = await Promise.all([
          fetch(summaryUrl),
          fetch(rankingsUrl)
        ]);
        
        const summaryResult = await summaryResponse.json();
        const rankingsResult = await rankingsResponse.json();
        
        if (summaryResult.success) {
          setSummaryData(summaryResult.data);
        }
        
        if (rankingsResult.success) {
          setTopExporters(rankingsResult.data.topExporters);
        }
      } catch (error) {
        console.error('Failed to fetch data:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);
  
  return (
    <div>
      {loading ? (
        <p>Loading global trade data...</p>
      ) : (
        <div className="results">
          <h2>Global Trade Summary (2023)</h2>
          
          {summaryData && (
            <div className="countries-summary">
              <h3>All Countries</h3>
              <p>Total Countries: {summaryData.length}</p>
              {/* Render your data table here */}
            </div>
          )}
          
          {topExporters && (
            <div className="top-exporters">
              <h3>Top 10 Exporting Countries</h3>
              <ul>
                {topExporters.map((country, index) => (
                  <li key={country.code}>
                    {index + 1}. {country.name}: {country.exports.toLocaleString()} (USD)
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
```

### Using with SWR for Data Fetching

```typescript
import useSWR from 'swr';
import { buildTradeUrl, TradeParams } from '@/types/api-urls';

// Fetcher function for SWR
const fetcher = (url: string) => fetch(url).then(res => res.json());

function TradeDataComponent({ country, tradeFlow, year }: TradeParams) {
  const url = buildTradeUrl({ country, tradeFlow, year });
  const { data, error, isLoading } = useSWR(url, fetcher);
  
  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error loading data</div>;
  if (!data?.success) return <div>Error: {data?.error || 'Unknown error'}</div>;
  
  return (
    <div>
      <h2>Trade Data for {country}</h2>
      {/* Render your data here */}
    </div>
  );
}
```

### Using Static API URLs

```typescript
import { API_URLS } from '@/types/api-urls';

// Fetch all cooperations
async function fetchCooperations() {
  const response = await fetch(API_URLS.COOPERATIONS);
  return response.json();
}

// Fetch HS codes for product filtering
async function fetchHSCodes() {
  const response = await fetch(API_URLS.HS_CODES);
  return response.json();
}

// Fetch countries summary
async function fetchCountriesSummary() {
  const response = await fetch(API_URLS.COUNTRIES_SUMMARY);
  return response.json();
}

// Fetch country rankings
async function fetchCountryRankings() {
  const response = await fetch(API_URLS.COUNTRIES_RANKINGS);
  return response.json();
}
```

### Creating a Trade Dashboard with Countries Data

```typescript
import { useState, useEffect } from 'react';
import { buildCountriesTradeUrl } from '@/types/api-urls';

function TradeDashboard() {
  const [countries, setCountries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [year, setYear] = useState('2023');
  const [page, setPage] = useState(1);
  const limit = 50;
  
  useEffect(() => {
    const fetchCountriesData = async () => {
      setLoading(true);
      
      const offset = (page - 1) * limit;
      const url = buildCountriesTradeUrl({
        year,
        limit,
        offset
      });
      
      try {
        const response = await fetch(url);
        const result = await response.json();
        
        if (result.success) {
          setCountries(result.data.countries);
        } else {
          console.error('Error fetching countries data:', result.error);
        }
      } catch (error) {
        console.error('Failed to fetch countries data:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchCountriesData();
  }, [year, page]);
  
  return (
    <div className="dashboard">
      <div className="filters">
        <select value={year} onChange={(e) => setYear(e.target.value)}>
          <option value="2023">2023</option>
          <option value="2022">2022</option>
          <option value="2021">2021</option>
        </select>
      </div>
      
      {loading ? (
        <p>Loading countries data...</p>
      ) : (
        <div>
          <table className="countries-table">
            <thead>
              <tr>
                <th>Country</th>
                <th>Region</th>
                <th>Exports</th>
                <th>Imports</th>
                <th>Total Trade</th>
              </tr>
            </thead>
            <tbody>
              {countries.map(country => (
                <tr key={country.code}>
                  <td>{country.country_name}</td>
                  <td>{country.region}</td>
                  <td>{country.exports.toLocaleString()}</td>
                  <td>{country.imports.toLocaleString()}</td>
                  <td>{country.total_trade.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
          
          <div className="pagination">
            <button 
              disabled={page === 1} 
              onClick={() => setPage(p => p - 1)}
            >
              Previous
            </button>
            <span>Page {page}</span>
            <button 
              onClick={() => setPage(p => p + 1)}
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
```

### TypeScript Custom Hook Example

```typescript
import { useState, useEffect } from 'react';
import { buildCooperationTradeUrl, CooperationTradeParams } from '@/types/api-urls';

interface UseCooperationTradeResult {
  data: any;
  loading: boolean;
  error: string | null;
}

export function useCooperationTrade(params: CooperationTradeParams): UseCooperationTradeResult {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const url = buildCooperationTradeUrl(params);
        const response = await fetch(url);
        const result = await response.json();
        
        if (result.success) {
          setData(result.data);
        } else {
          setError(result.error || 'Failed to fetch data');
        }
      } catch (err) {
        setError('An error occurred while fetching data');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [params.slug, params.tradeFlow, params.year, params.hsCode]);
  
  return { data, loading, error };
}

// Usage in a component
function CooperationTradeComponent() {
  const { data, loading, error } = useCooperationTrade({
    slug: 'asean',
    tradeFlow: 'exports', // Maps to ID 103
    year: '2023'
  });
  
  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  
  return (
    <div>
      <h2>{data.cooperation.name} Trade Data</h2>
      {/* Render your data here */}
    </div>
  );
}
```

These examples demonstrate how to use the URL builder functions to create properly formatted API URLs for fetching trade data in your application.

### Important Note About Trade Flow IDs

In the database:
- ID `103` corresponds to "Export" data
- ID `102` corresponds to "Import" data

When using the API, you can use either the string names ('exports', 'imports') or the numeric IDs (103, 102). 