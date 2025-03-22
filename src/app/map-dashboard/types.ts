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