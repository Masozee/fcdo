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
}

export interface GlobalHighlight {
  title: string;
  value: string;
  change: number;
  description: string;
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