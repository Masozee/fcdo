/**
 * API URL definitions for trade data endpoints
 */

export type TradeFlowType = 'exports' | 'imports' | '103' | '102';

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
  metric?: 'total' | 'exports' | 'imports';
}

/**
 * API URL builders
 */

/**
 * Build URL for cooperation trade data
 * @param params The query parameters
 * @returns Formatted URL string
 */
export function buildCooperationTradeUrl(params: CooperationTradeParams): string {
  const { slug, tradeFlow, year, hsCode } = params;
  let url = `/api/cooperations/trade?slug=${slug}`;
  
  if (tradeFlow) url += `&tradeFlow=${tradeFlow}`;
  if (year) url += `&year=${year}`;
  if (hsCode) url += `&hsCode=${hsCode}`;
  
  return url;
}

/**
 * Build URL for general trade data
 * @param params The query parameters
 * @returns Formatted URL string
 */
export function buildTradeUrl(params: TradeParams): string {
  let url = '/api/trade?';
  const queryParams: string[] = [];
  
  if (params.country) queryParams.push(`country=${params.country}`);
  if (params.tradeFlow) queryParams.push(`tradeFlow=${params.tradeFlow}`);
  if (params.year) queryParams.push(`year=${params.year}`);
  if (params.hsCode) queryParams.push(`hsCode=${params.hsCode}`);
  
  return url + queryParams.join('&');
}

/**
 * Build URL for country trade data
 * @param params The query parameters
 * @returns Formatted URL string
 */
export function buildCountryTradeUrl(params: CountryTradeParams): string {
  return `/api/country-trade${params.year ? `?year=${params.year}` : ''}`;
}

/**
 * Build URL for map data
 * @param params The query parameters
 * @returns Formatted URL string
 */
export function buildMapDataUrl(params: MapDataParams): string {
  const queryParams: string[] = [];
  
  if (params.year) queryParams.push(`year=${params.year}`);
  if (params.metric) queryParams.push(`metric=${params.metric}`);
  
  return `/api/map-data${queryParams.length ? `?${queryParams.join('&')}` : ''}`;
}

/**
 * Static API URLs
 */
export const API_URLS = {
  COOPERATIONS: '/api/cooperations',
  TRADEFLOW: '/api/tradeflow',
  TRADE_SUMMARY: '/api/trade/summary',
  HS_CODES: '/api/trade/hs-codes',
}; 