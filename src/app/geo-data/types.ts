export interface RegionData {
  name: string;
  description: string;
  importValue: number;
  exportValue: number;
  tradeBalance: number;
  topPartners: Partner[];
  topProducts: Product[];
}

export interface Partner {
  country: string;
  value: number;
  percentage: number;
}

export interface Product {
  code: string;
  name: string;
  value: number;
  percentage: number;
}

export interface GlobalHighlight {
  title: string;
  value: number;
  change: number; // Percentage change
  description: string;
}

export interface TradeRelationship {
  source: string;
  target: string;
  value: number;
  type: 'import' | 'export';
}

export interface TradeStatistic {
  period: string;
  imports: number;
  exports: number;
  balance: number;
} 