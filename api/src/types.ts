// Type definitions based on Django models

export interface Category {
  id: number;
  name: string;
  keterangan: string | null;
}

export interface Option {
  id: number;
  name: string;
  slug: string;
  category_id: number;
  order: number;
  keterangan: string | null;
}

export interface OptionParent {
  id: number;
  from_option_id: number;
  to_option_id: number;
}

export interface TradeInvestmentData {
  id: number;
  country: string;
  industry_id: number;
  year: string | null;
  value: number;
  keterangan: string | null;
}

export interface ProductCode {
  id: number;
  code: string;
  name: string;
  hs_level: number;
  created_at?: string;
  updated_at?: string;
}

export interface HSTradeData {
  id: number;
  country: string;
  value: number;
  percent_trade: number | null;
  CR4: number | null;
  keterangan: string | null;
  category_id: string;
  tradeflow_id: string;
  rank_desc: number | null;
  rank_within_product: number | null;
  total_trade: number | null;
  year: string | null;
}

export interface InternationalCooperation {
  id: number;
  name: string;
  abbreviation: string;
  slug: string;
  description: string | null;
  website: string | null;
  established_date: string | null;
  countries: string;
  is_active: boolean;
  logo: string | null;
  keterangan: string | null;
}

export interface Country {
  id: number;
  name: string;
  iso_code: string;
  iso3_code?: string;
  region?: string;
  created_at?: string;
  updated_at?: string;
}

// Response types 
export interface ApiResponse<T> {
  status: 'success' | 'error';
  data?: T;
  message?: string;
  count?: number;
  error?: string;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  data: T[];
  totalCount: number;
  page: number;
  limit: number;
  totalPages: number;
}

// Query parameter types
export interface QueryOptions {
  [key: string]: any;
  page?: number;
  limit?: number;
  sort_by?: string;
  sort_dir?: string;
} 