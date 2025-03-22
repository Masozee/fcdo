import { GlobalHighlight, RegionData, TradeRelationship, TradeStatistic, ProductCategory, TradingPartner, TradeRelationships, TradeStatItem, TradeStatGroup } from "./types";

export const mockGlobalHighlights: GlobalHighlight[] = [
  {
    title: "Global Trade Volume",
    value: 24.3,
    change: 5.2,
    trend: 5.2,
    description: "Total global trade volume for goods and services",
    isTrillion: true
  },
  {
    title: "Leading Exporter",
    value: "China",
    change: 3.1,
    trend: 3.1,
    description: "China remains the world's leading exporter with $3.59 trillion"
  },
  {
    title: "Trade Growth",
    value: 7.8,
    change: 7.8,
    trend: 7.8,
    description: "Annual growth in global trade volume",
    isPercentage: true
  },
  {
    title: "Digital Trade",
    value: 3.8,
    change: 12.4,
    trend: 12.4,
    description: "E-commerce and digital services trade volume",
    isTrillion: true
  }
];

export const mockRegionData: Record<string, RegionData> = {
  "North America": {
    name: "North America",
    population: 592,
    gdp: 26.3,
    tradeVolume: 6.7,
    growth: 3.2,
    topPartners: [
      { name: "China", value: 718, percent: 26.4 },
      { name: "Mexico", value: 582, percent: 21.4 },
      { name: "Canada", value: 512, percent: 18.8 },
      { name: "Japan", value: 242, percent: 8.9 },
      { name: "Germany", value: 201, percent: 7.4 }
    ],
    keyProducts: [
      { name: "Machinery", value: 312, percent: 15.7 },
      { name: "Electronics", value: 286, percent: 14.4 },
      { name: "Vehicles", value: 249, percent: 12.5 },
      { name: "Pharmaceuticals", value: 183, percent: 9.2 },
      { name: "Mineral Fuels", value: 162, percent: 8.1 }
    ],
    economyStats: [
      { name: "GDP Growth", value: 2.8, isPercentage: true },
      { name: "Inflation Rate", value: 3.2, isPercentage: true },
      { name: "Unemployment", value: 4.1, isPercentage: true },
      { name: "FDI Inflows", value: 382 },
      { name: "Infrastructure Spending", value: 429 }
    ],
    tradeBalance: {
      exports: 2850,
      imports: 3120,
      balance: -270
    }
  },
  "Europe": {
    name: "Europe",
    population: 748,
    gdp: 23.1,
    tradeVolume: 7.9,
    growth: 2.1,
    topPartners: [
      { name: "Germany", value: 892, percent: 24.8 },
      { name: "France", value: 613, percent: 17.1 },
      { name: "United Kingdom", value: 543, percent: 15.1 },
      { name: "China", value: 412, percent: 11.5 },
      { name: "United States", value: 387, percent: 10.8 }
    ],
    keyProducts: [
      { name: "Machinery", value: 421, percent: 18.3 },
      { name: "Pharmaceuticals", value: 352, percent: 15.3 },
      { name: "Vehicles", value: 318, percent: 13.8 },
      { name: "Electronics", value: 276, percent: 12.0 },
      { name: "Chemical Products", value: 189, percent: 8.2 }
    ],
    economyStats: [
      { name: "GDP Growth", value: 1.9, isPercentage: true },
      { name: "Inflation Rate", value: 2.4, isPercentage: true },
      { name: "Unemployment", value: 6.7, isPercentage: true },
      { name: "FDI Inflows", value: 412 },
      { name: "Infrastructure Spending", value: 387 }
    ],
    tradeBalance: {
      exports: 3240,
      imports: 3120,
      balance: 120
    }
  },
  "Asia": {
    name: "Asia",
    population: 4620,
    gdp: 35.2,
    tradeVolume: 9.8,
    growth: 4.7,
    topPartners: [
      { name: "China", value: 1284, percent: 29.1 },
      { name: "United States", value: 823, percent: 18.7 },
      { name: "Japan", value: 612, percent: 13.9 },
      { name: "South Korea", value: 487, percent: 11.0 },
      { name: "Germany", value: 376, percent: 8.5 }
    ],
    keyProducts: [
      { name: "Electronics", value: 842, percent: 24.3 },
      { name: "Textiles", value: 586, percent: 16.9 },
      { name: "Machinery", value: 423, percent: 12.2 },
      { name: "Vehicles", value: 387, percent: 11.2 },
      { name: "Plastics", value: 276, percent: 8.0 }
    ],
    economyStats: [
      { name: "GDP Growth", value: 4.3, isPercentage: true },
      { name: "Inflation Rate", value: 3.8, isPercentage: true },
      { name: "Unemployment", value: 3.9, isPercentage: true },
      { name: "FDI Inflows", value: 612 },
      { name: "Infrastructure Spending", value: 748 }
    ],
    tradeBalance: {
      exports: 4320,
      imports: 3970,
      balance: 350
    }
  }
};

export const mockTradeRelationships: TradeRelationships = {
  productCategories: [
    { name: "Electronics", value: 842, percentage: 24.3, color: "#3b82f6" },
    { name: "Machinery", value: 723, percentage: 20.9, color: "#10b981" },
    { name: "Vehicles", value: 586, percentage: 16.9, color: "#f59e0b" },
    { name: "Pharmaceuticals", value: 412, percentage: 11.9, color: "#8b5cf6" },
    { name: "Textiles", value: 328, percentage: 9.5, color: "#ec4899" },
    { name: "Chemicals", value: 286, percentage: 8.3, color: "#ef4444" },
    { name: "Plastics", value: 189, percentage: 5.5, color: "#6366f1" }
  ],
  tradingPartners: [
    { name: "China", value: 1284, percentage: 29.1 },
    { name: "United States", value: 982, percentage: 22.2 },
    { name: "Germany", value: 743, percentage: 16.8 },
    { name: "Japan", value: 612, percentage: 13.9 },
    { name: "United Kingdom", value: 487, percentage: 11.0 },
    { name: "France", value: 376, percentage: 8.5 }
  ]
};

export const mockTradeStatistics: TradeStatGroup[] = [
  {
    title: "Global Market Share",
    description: "Trading volume by region as percentage of global trade",
    data: [
      { name: "Asia Pacific", value: 38.7, isPercentage: true },
      { name: "North America", value: 23.5, isPercentage: true },
      { name: "Europe", value: 21.9, isPercentage: true },
      { name: "Middle East", value: 8.2, isPercentage: true },
      { name: "Africa", value: 4.8, isPercentage: true },
      { name: "South America", value: 2.9, isPercentage: true }
    ]
  },
  {
    title: "Trade Balance",
    description: "Imports vs exports by major trading regions",
    data: [
      { name: "Asia Pacific", value: 350 },
      { name: "North America", value: -270 },
      { name: "Europe", value: 120 },
      { name: "Middle East", value: 210 },
      { name: "Africa", value: -180 },
      { name: "South America", value: 90 }
    ]
  }
]; 