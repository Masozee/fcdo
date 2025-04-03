export interface RegionData {
  name: string;
  population: number;
  gdp: number;
  tradeVolume: number;
  growth: number;
  topPartners: {
    name: string;
    value: number;
    percent: number;
  }[];
  keyProducts: {
    name: string;
    value: number;
    percent: number;
  }[];
  economyStats: {
    name: string;
    value: number;
    isPercentage?: boolean;
  }[];
  tradeBalance: {
    exports: number;
    imports: number;
    balance: number;
  };
}

export interface GlobalHighlight {
  title: string;
  value: string | number;
  change: number;
  description: string;
  trend: number;
  isPercentage?: boolean;
  isTrillion?: boolean;
}

export interface TradeRelationship {
  source: string;
  target: string;
  value: number;
  products: string[];
}

export interface TradeStatistic {
  year: number;
  imports: number;
  exports: number;
  balance: number;
}

export interface ProductCategory {
  name: string;
  value: number;
  percentage: number;
  color: string;
}

export interface TradingPartner {
  name: string;
  value: number;
  percentage: number;
}

export interface TradeRelationships {
  productCategories: ProductCategory[];
  tradingPartners: TradingPartner[];
}

export interface TradeStatItem {
  name: string;
  value: number;
  isPercentage?: boolean;
}

export interface TradeStatGroup {
  title: string;
  description: string;
  data: TradeStatItem[];
}

export interface CountryTradeItem {
  country: string;
  country_name: string;
  region: string;
  sub_region: string;
  exports: number;
  imports: number;
  total_trade: number;
}

export interface GlobalTotals {
  total_exports: number;
  total_imports: number;
  total_trade: number;
}

export interface CountriesTradeResponse {
  success: boolean;
  data: {
    countries: CountryTradeItem[];
    globalTotals: GlobalTotals;
  };
  metadata: {
    filters: {
      year: string;
    };
    pagination: {
      total: number;
      limit: number;
      offset: number;
      hasMore: boolean;
    };
  };
}

export interface CountrySpecificTradeItem {
  id: number;
  country: string;
  country_name: string;
  region: string;
  sub_region: string;
  value: number;
  percent_trade: number;
  CR4: number;
  category_id: number;
  hs_code: string;
  product_name: string;
  tradeflow_id: number;
  trade_flow: string;
  year: string;
  keterangan: string;
  total_trade: number;
  rank_desc: number;
  rank_within_product: number;
}

export interface CountrySpecificTradeResponse {
  success: boolean;
  data: CountrySpecificTradeItem[];
  metadata: {
    filters: {
      country: string;
      year: string;
      tradeFlow: string;
      hsCode: string;
    };
    count: number;
    limit: number;
  };
} 