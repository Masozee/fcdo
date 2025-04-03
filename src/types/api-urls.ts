import { buildUrl } from '@/lib/url-builder';

export type TradeFlowType = 'exports' | 'imports' | 103 | 102; // 103 = exports, 102 = imports

export interface CooperationTradeParams {
  slug: string;
  tradeFlow?: TradeFlowType;
  year?: string;
  hsCode?: string;
}

export interface TradeParams {
  country?: string;
  tradeFlow?: TradeFlowType;
  year?: string;
  hsCode?: string;
}

export interface CountryTradeParams {
  year?: string;
}

export interface MapDataParams {
  year?: string;
  metric?: string;
}

export interface CountriesTradeParams {
  year?: string;
  limit?: number;
  offset?: number;
}

export interface CountriesSummaryParams {
  year?: string;
}

export interface CountriesRankingsParams {
  year?: string;
  limit?: number;
  type?: 'all' | 'exports' | 'imports' | 'total';
}

// Base API URLs
export const API_URLS = {
  COOPERATIONS: '/api/cooperations',
  COOPERATION_TRADE: '/api/cooperations/trade',
  TRADE: '/api/trade',
  COUNTRY_TRADE: '/api/country-trade',
  TRADE_SUMMARY: '/api/trade/summary',
  HS_CODES: '/api/trade/hs-codes',
  MAP_DATA: '/api/map-data',
  TRADEFLOW: '/api/tradeflow',
  COUNTRIES_TRADE: '/api/countries/trade',
  COUNTRIES_SUMMARY: '/api/countries/summary',
  COUNTRIES_RANKINGS: '/api/countries/rankings'
};

/**
 * Build URL for cooperation trade data
 */
export function buildCooperationTradeUrl(params: CooperationTradeParams): string {
  return buildUrl(API_URLS.COOPERATION_TRADE, {
    slug: params.slug,
    tradeFlow: params.tradeFlow,
    year: params.year,
    hsCode: params.hsCode
  });
}

/**
 * Build URL for general trade data
 */
export function buildTradeUrl(params: TradeParams): string {
  return buildUrl(API_URLS.TRADE, {
    country: params.country,
    tradeFlow: params.tradeFlow,
    year: params.year,
    hsCode: params.hsCode
  });
}

/**
 * Build URL for country trade data
 */
export function buildCountryTradeUrl(params: CountryTradeParams): string {
  return buildUrl(API_URLS.COUNTRY_TRADE, {
    year: params.year
  });
}

/**
 * Build URL for map data
 */
export function buildMapDataUrl(params: MapDataParams): string {
  return buildUrl(API_URLS.MAP_DATA, {
    year: params.year,
    metric: params.metric
  });
}

/**
 * Build URL for countries trade data
 */
export function buildCountriesTradeUrl(params: CountriesTradeParams): string {
  return buildUrl(API_URLS.COUNTRIES_TRADE, {
    year: params.year,
    limit: params.limit?.toString(),
    offset: params.offset?.toString()
  });
}

/**
 * Build URL for countries summary
 */
export function buildCountriesSummaryUrl(params: CountriesSummaryParams): string {
  return buildUrl(API_URLS.COUNTRIES_SUMMARY, {
    year: params.year
  });
}

/**
 * Build URL for countries rankings
 */
export function buildCountriesRankingsUrl(params: CountriesRankingsParams): string {
  return buildUrl(API_URLS.COUNTRIES_RANKINGS, {
    year: params.year,
    limit: params.limit?.toString(),
    type: params.type
  });
} 