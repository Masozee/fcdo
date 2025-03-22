/**
 * Types for map data API responses
 */

// Individual country data point for choropleth maps
export interface CountryMapData {
  country: string;
  import_value: number;
  export_value: number;
  total_value: number;
  trade_count: number;
}

// Metadata about the choropleth map data
export interface MapMetadata {
  year: string;
  metric: string;
  minValue: number;
  maxValue: number;
  count: number;
}

// Complete API response for choropleth map data
export interface ChoroplethMapResponse {
  countries: CountryMapData[];
  metadata: MapMetadata;
  error?: string;
}

// Years for filtering map data
export type MapYear = 'all' | '2023' | '2022' | '2021' | '2020' | '2019';

// Metrics for coloring choropleth maps
export type MapMetric = 'total' | 'imports' | 'exports'; 