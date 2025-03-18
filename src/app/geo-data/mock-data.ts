import { GlobalHighlight, Partner, Product, RegionData, TradeRelationship, TradeStatistic } from "./types";

export const mockGlobalHighlights: GlobalHighlight[] = [
  {
    title: "Global Trade Volume",
    value: 28.5, // Trillion USD
    change: 3.2,
    description: "Total global trade volume in 2023"
  },
  {
    title: "Trade Growth",
    value: 3.2, // Percentage
    change: 0.7,
    description: "Year-over-year global trade growth"
  },
  {
    title: "Export Leaders",
    value: 5, // Number of countries
    change: 0,
    description: "Countries accounting for 50% of global exports"
  }
];

export const mockTradeRelationships: TradeRelationship[] = [
  { source: "United States", target: "China", value: 506.4, type: "import" },
  { source: "United States", target: "Mexico", value: 347.2, type: "export" },
  { source: "China", target: "European Union", value: 472.8, type: "export" },
  { source: "Japan", target: "United States", value: 142.1, type: "export" },
  { source: "Germany", target: "United States", value: 118.7, type: "export" }
];

export const mockRegionData: Record<string, RegionData> = {
  "North America": {
    name: "North America",
    description: "Including United States, Canada, and Mexico",
    importValue: 4.2, // Trillion USD
    exportValue: 3.8, // Trillion USD
    tradeBalance: -0.4, // Trillion USD
    topPartners: [
      { country: "China", value: 710.5, percentage: 21.4 },
      { country: "European Union", value: 658.3, percentage: 19.8 },
      { country: "Japan", value: 236.9, percentage: 7.1 }
    ],
    topProducts: [
      { code: "85", name: "Electrical machinery and equipment", value: 412.6, percentage: 10.5 },
      { code: "87", name: "Vehicles and parts", value: 387.2, percentage: 9.9 },
      { code: "84", name: "Machinery and mechanical appliances", value: 356.8, percentage: 9.1 }
    ]
  },
  "Europe": {
    name: "Europe",
    description: "European Union and other European countries",
    importValue: 6.8, // Trillion USD
    exportValue: 6.7, // Trillion USD
    tradeBalance: -0.1, // Trillion USD
    topPartners: [
      { country: "United States", value: 658.3, percentage: 18.2 },
      { country: "China", value: 586.1, percentage: 16.2 },
      { country: "United Kingdom", value: 423.7, percentage: 11.7 }
    ],
    topProducts: [
      { code: "87", name: "Vehicles and parts", value: 542.3, percentage: 12.7 },
      { code: "84", name: "Machinery and mechanical appliances", value: 498.6, percentage: 11.7 },
      { code: "30", name: "Pharmaceutical products", value: 386.5, percentage: 9.1 }
    ]
  },
  "Asia": {
    name: "Asia",
    description: "East Asia, Southeast Asia, and South Asia",
    importValue: 8.3, // Trillion USD
    exportValue: 9.2, // Trillion USD
    tradeBalance: 0.9, // Trillion USD
    topPartners: [
      { country: "China", value: 1236.8, percentage: 27.2 },
      { country: "United States", value: 856.4, percentage: 18.8 },
      { country: "European Union", value: 743.2, percentage: 16.3 }
    ],
    topProducts: [
      { code: "85", name: "Electrical machinery and equipment", value: 987.6, percentage: 19.5 },
      { code: "84", name: "Machinery and mechanical appliances", value: 642.3, percentage: 12.7 },
      { code: "27", name: "Mineral fuels and oils", value: 489.5, percentage: 9.7 }
    ]
  },
  "South America": {
    name: "South America",
    description: "Including Brazil, Argentina, and other South American countries",
    importValue: 0.9, // Trillion USD
    exportValue: 1.1, // Trillion USD
    tradeBalance: 0.2, // Trillion USD
    topPartners: [
      { country: "China", value: 186.3, percentage: 24.5 },
      { country: "United States", value: 142.8, percentage: 18.8 },
      { country: "European Union", value: 112.6, percentage: 14.8 }
    ],
    topProducts: [
      { code: "27", name: "Mineral fuels and oils", value: 148.6, percentage: 18.2 },
      { code: "12", name: "Oil seeds and oleaginous fruits", value: 112.3, percentage: 13.7 },
      { code: "26", name: "Ores, slag and ash", value: 86.5, percentage: 10.6 }
    ]
  },
  "Africa": {
    name: "Africa",
    description: "All African countries",
    importValue: 0.7, // Trillion USD
    exportValue: 0.6, // Trillion USD
    tradeBalance: -0.1, // Trillion USD
    topPartners: [
      { country: "European Union", value: 156.8, percentage: 28.9 },
      { country: "China", value: 142.3, percentage: 26.2 },
      { country: "United States", value: 86.4, percentage: 15.9 }
    ],
    topProducts: [
      { code: "27", name: "Mineral fuels and oils", value: 167.2, percentage: 31.7 },
      { code: "71", name: "Precious stones and metals", value: 78.6, percentage: 14.9 },
      { code: "08", name: "Edible fruits and nuts", value: 42.3, percentage: 8.0 }
    ]
  },
  "Oceania": {
    name: "Oceania",
    description: "Australia, New Zealand, and Pacific Islands",
    importValue: 0.4, // Trillion USD
    exportValue: 0.5, // Trillion USD
    tradeBalance: 0.1, // Trillion USD
    topPartners: [
      { country: "China", value: 132.6, percentage: 31.7 },
      { country: "Japan", value: 78.4, percentage: 18.7 },
      { country: "United States", value: 56.8, percentage: 13.6 }
    ],
    topProducts: [
      { code: "26", name: "Ores, slag and ash", value: 142.6, percentage: 26.3 },
      { code: "27", name: "Mineral fuels and oils", value: 87.3, percentage: 16.1 },
      { code: "02", name: "Meat and edible meat offal", value: 42.8, percentage: 7.9 }
    ]
  }
};

export const mockTradeStatistics: TradeStatistic[] = [
  { period: "2019", imports: 21.3, exports: 21.2, balance: -0.1 },
  { period: "2020", imports: 17.8, exports: 17.6, balance: -0.2 },
  { period: "2021", imports: 22.5, exports: 22.3, balance: -0.2 },
  { period: "2022", imports: 25.3, exports: 25.1, balance: -0.2 },
  { period: "2023", imports: 26.4, exports: 26.2, balance: -0.2 }
]; 