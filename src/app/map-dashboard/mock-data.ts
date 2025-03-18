import { GlobalHighlight, RegionData, TradeRelationship, TradeStatistic } from "./types";

export const mockGlobalHighlights: GlobalHighlight[] = [
  {
    title: "Global Trade Volume",
    value: "$24.3 trillion",
    change: 5.2,
    description: "Total global trade volume for goods and services"
  },
  {
    title: "Leading Exporter",
    value: "China",
    change: 3.1,
    description: "China remains the world's leading exporter with $3.59 trillion"
  },
  {
    title: "Fastest Growing Region",
    value: "Southeast Asia",
    change: 7.8,
    description: "Southeast Asian countries show strongest trade growth"
  },
  {
    title: "Digital Trade",
    value: "$3.8 trillion",
    change: 12.4,
    description: "E-commerce and digital services trade volume"
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
    ]
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
    ]
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
    ]
  }
};

export const mockTradeRelationships: TradeRelationship[] = [
  {
    source: "United States",
    target: "China",
    value: 718,
    products: ["Electronics", "Machinery", "Furniture"]
  },
  {
    source: "United States",
    target: "Mexico",
    value: 582,
    products: ["Vehicles", "Machinery", "Electronics"]
  },
  {
    source: "Germany",
    target: "United States",
    value: 387,
    products: ["Vehicles", "Machinery", "Pharmaceuticals"]
  },
  {
    source: "Japan",
    target: "China",
    value: 412,
    products: ["Electronics", "Machinery", "Vehicles"]
  },
  {
    source: "China",
    target: "European Union",
    value: 892,
    products: ["Electronics", "Textiles", "Machinery"]
  }
];

export const mockTradeStatistics: TradeStatistic[] = [
  { year: 2023, imports: 3.1, exports: 2.9, balance: -0.2 },
  { year: 2022, imports: 2.9, exports: 2.7, balance: -0.2 },
  { year: 2021, imports: 2.6, exports: 2.5, balance: -0.1 },
  { year: 2020, imports: 2.2, exports: 2.1, balance: -0.1 },
  { year: 2019, imports: 2.4, exports: 2.3, balance: -0.1 }
]; 