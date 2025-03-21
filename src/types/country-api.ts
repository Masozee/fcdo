/**
 * Country API Response Interfaces
 * These types define the structure of the data returned from the country-specific API endpoint
 */

/**
 * Basic summary of a country's trade data
 */
export interface CountrySummary {
  country: string;
  import_value: number;
  export_value: number;
  total_value: number;
  min_year: string;
  max_year: string;
  trade_count: number;
}

/**
 * Annual trade data for trend analysis
 */
export interface YearlyTrend {
  year: number;
  import_value: number;
  export_value: number;
  total_value: number;
  trade_count: number;
}

/**
 * Legacy product data definition
 */
export interface ProductData {
  category_id: string;
  product_name: string;
  product_code: string;
  hs_level: number;
  import_value: number;
  export_value: number;
  total_value: number;
}

/**
 * Product category data for imports or exports
 */
export interface ProductCategory {
  category_id: string;
  product_name: string;
  product_code: string;
  hs_level: number;
  value: number;
  transaction_count: number;
}

/**
 * Collection of product categories for both imports and exports
 */
export interface ProductCategories {
  imports: ProductCategory[];
  exports: ProductCategory[];
}

/**
 * Trade flow details by flow type
 */
export interface TradeFlow {
  tradeflow_id: string;
  transaction_count: number;
  total_value: number;
  average_value: number;
  min_value: number;
  max_value: number;
}

/**
 * Main API response structure
 */
export interface CountryApiResponse {
  countryCode: string;
  summary: CountrySummary;
  yearlyTrends: YearlyTrend[];
  productCategories?: ProductCategories;
  tradeFlows: TradeFlow[];
} 