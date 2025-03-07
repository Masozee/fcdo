"use client"

import React, { useState } from 'react';
import { 
  ComposableMap, 
  Geographies, 
  Geography,
  ZoomableGroup
} from 'react-simple-maps';
import * as HoverCard from '@radix-ui/react-hover-card';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';
import { scaleLinear } from 'd3-scale';

// Add type declaration for react-simple-maps
declare module 'react-simple-maps';

// World map GeoJSON - use local file
const geoUrl = "/data/world-countries.json";

// Define types for our trade data
interface TradePartner {
  name: string;
  value: number;
}

interface CountryTradeData {
  name: string;
  imports: number;
  exports: number;
  partners: TradePartner[];
}

interface TradeDataMap {
  [key: string]: CountryTradeData;
}

// Dummy trade data
const tradeData: TradeDataMap = {
  USA: {
    name: "United States",
    imports: 2500,
    exports: 1800,
    partners: [
      { name: "China", value: 600 },
      { name: "Canada", value: 450 },
      { name: "Mexico", value: 380 },
      { name: "Japan", value: 250 },
      { name: "Germany", value: 200 }
    ]
  },
  CHN: {
    name: "China",
    imports: 2100,
    exports: 2600,
    partners: [
      { name: "United States", value: 550 },
      { name: "Japan", value: 400 },
      { name: "South Korea", value: 350 },
      { name: "Germany", value: 280 },
      { name: "Australia", value: 220 }
    ]
  },
  DEU: {
    name: "Germany",
    imports: 1800,
    exports: 2000,
    partners: [
      { name: "United States", value: 480 },
      { name: "France", value: 420 },
      { name: "China", value: 380 },
      { name: "Netherlands", value: 320 },
      { name: "Italy", value: 280 }
    ]
  },
  JPN: {
    name: "Japan",
    imports: 1600,
    exports: 1400,
    partners: [
      { name: "China", value: 500 },
      { name: "United States", value: 450 },
      { name: "South Korea", value: 300 },
      { name: "Australia", value: 250 },
      { name: "Thailand", value: 200 }
    ]
  },
  GBR: {
    name: "United Kingdom",
    imports: 1400,
    exports: 1200,
    partners: [
      { name: "United States", value: 420 },
      { name: "Germany", value: 380 },
      { name: "Netherlands", value: 320 },
      { name: "France", value: 280 },
      { name: "China", value: 250 }
    ]
  },
  FRA: {
    name: "France",
    imports: 1300,
    exports: 1250,
    partners: [
      { name: "Germany", value: 400 },
      { name: "United States", value: 350 },
      { name: "Italy", value: 300 },
      { name: "Spain", value: 280 },
      { name: "Belgium", value: 250 }
    ]
  },
  IND: {
    name: "India",
    imports: 1200,
    exports: 900,
    partners: [
      { name: "United States", value: 380 },
      { name: "China", value: 350 },
      { name: "UAE", value: 280 },
      { name: "Saudi Arabia", value: 220 },
      { name: "Singapore", value: 180 }
    ]
  },
  ITA: {
    name: "Italy",
    imports: 1100,
    exports: 1050,
    partners: [
      { name: "Germany", value: 380 },
      { name: "France", value: 320 },
      { name: "United States", value: 280 },
      { name: "Spain", value: 220 },
      { name: "Switzerland", value: 180 }
    ]
  },
  BRA: {
    name: "Brazil",
    imports: 950,
    exports: 1000,
    partners: [
      { name: "China", value: 350 },
      { name: "United States", value: 300 },
      { name: "Argentina", value: 220 },
      { name: "Germany", value: 180 },
      { name: "South Korea", value: 150 }
    ]
  },
  CAN: {
    name: "Canada",
    imports: 900,
    exports: 950,
    partners: [
      { name: "United States", value: 500 },
      { name: "China", value: 220 },
      { name: "Mexico", value: 180 },
      { name: "Japan", value: 150 },
      { name: "Germany", value: 120 }
    ]
  },
  // Add more countries as needed
};

// Create a color scale based on trade volume
const colorScale = scaleLinear<string>()
  .domain([0, 5000])
  .range(["#e6f7ff", "#0066cc"]);

// Define a type for geography properties
interface GeoProperties {
  NAME: string;
  ISO_A3: string;
  [key: string]: any;
}

interface Geography {
  properties: GeoProperties;
  rsmKey: string;
  [key: string]: any;
}

export function WorldMap() {
  const [tooltipContent, setTooltipContent] = useState<string | null>(null);
  const [selectedCountry, setSelectedCountry] = useState<string | null>(null);

  const handleMouseEnter = (geo: Geography) => {
    const { ISO_A3 } = geo.properties;
    if (tradeData[ISO_A3]) {
      setSelectedCountry(ISO_A3);
      setTooltipContent(tradeData[ISO_A3].name);
    } else {
      setTooltipContent(geo.properties.NAME);
    }
  };

  const handleMouseLeave = () => {
    setTooltipContent(null);
  };

  const getCountryColor = (geo: Geography) => {
    const { ISO_A3 } = geo.properties;
    if (tradeData[ISO_A3]) {
      const totalTrade = tradeData[ISO_A3].imports + tradeData[ISO_A3].exports;
      return colorScale(totalTrade);
    }
    return "#F5F4F6"; // Light mode default
  };

  const getImportExportData = (countryCode: string) => {
    if (!tradeData[countryCode]) return [];
    
    return [
      { name: "Imports", value: tradeData[countryCode].imports },
      { name: "Exports", value: tradeData[countryCode].exports }
    ];
  };

  return (
    <section className="py-16 bg-white dark:bg-gray-900">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto text-center mb-12">
          <h2 className="text-3xl font-bold mb-4 text-gray-900 dark:text-white">Global Trade Map</h2>
          <p className="text-gray-600 dark:text-gray-400">
            Explore trade data by country. Hover over a country to see detailed import and export information.
          </p>
        </div>
        
        <div className="relative">
          <ComposableMap
            projectionConfig={{
              scale: 160,
              rotation: [-11, 0, 0],
            }}
            width={800}
            height={400}
            style={{ width: "100%", height: "auto" }}
          >
            <ZoomableGroup center={[0, 0]} zoom={1}>
              <Geographies geography={geoUrl}>
                {({ geographies }) =>
                  geographies.map((geo) => (
                    <HoverCard.Root key={geo.rsmKey} openDelay={200} closeDelay={100}>
                      <HoverCard.Trigger asChild>
                        <Geography
                          geography={geo}
                          onMouseEnter={() => handleMouseEnter(geo)}
                          onMouseLeave={handleMouseLeave}
                          style={{
                            default: {
                              fill: getCountryColor(geo),
                              stroke: "#FFFFFF",
                              strokeWidth: 0.5,
                              outline: "none",
                            },
                            hover: {
                              fill: "#1E40AF",
                              stroke: "#FFFFFF",
                              strokeWidth: 0.5,
                              outline: "none",
                            },
                            pressed: {
                              fill: "#1E3A8A",
                              stroke: "#FFFFFF",
                              strokeWidth: 0.5,
                              outline: "none",
                            },
                          }}
                        />
                      </HoverCard.Trigger>
                      
                      {tradeData[geo.properties.ISO_A3] && (
                        <HoverCard.Content 
                          className="bg-white p-4 rounded-lg shadow-lg border border-gray-200 w-80"
                          sideOffset={5}
                        >
                          <div className="flex flex-col">
                            <h3 className="text-lg font-medium mb-2">{tradeData[geo.properties.ISO_A3].name}</h3>
                            
                            <div className="mb-4">
                              <h4 className="text-sm font-medium text-gray-500 mb-2">Import/Export Balance</h4>
                              <div className="h-32">
                                <ResponsiveContainer width="100%" height="100%">
                                  <BarChart
                                    data={getImportExportData(geo.properties.ISO_A3)}
                                    margin={{ top: 5, right: 5, left: 5, bottom: 5 }}
                                  >
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="name" />
                                    <YAxis />
                                    <Tooltip />
                                    <Bar dataKey="value" fill="#3B82F6" />
                                  </BarChart>
                                </ResponsiveContainer>
                              </div>
                            </div>
                            
                            <div>
                              <h4 className="text-sm font-medium text-gray-500 mb-2">Top Trading Partners</h4>
                              <div className="h-32">
                                <ResponsiveContainer width="100%" height="100%">
                                  <BarChart
                                    data={tradeData[geo.properties.ISO_A3].partners}
                                    layout="vertical"
                                    margin={{ top: 5, right: 5, left: 50, bottom: 5 }}
                                  >
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis type="number" />
                                    <YAxis type="category" dataKey="name" />
                                    <Tooltip />
                                    <Bar dataKey="value" fill="#10B981" />
                                  </BarChart>
                                </ResponsiveContainer>
                              </div>
                            </div>
                          </div>
                          
                          <HoverCard.Arrow className="fill-white" />
                        </HoverCard.Content>
                      )}
                    </HoverCard.Root>
                  ))
                }
              </Geographies>
            </ZoomableGroup>
          </ComposableMap>
          
          {tooltipContent && (
            <div className="absolute bottom-4 left-4 bg-white px-3 py-1 rounded-md shadow-sm border border-gray-200">
              <p className="text-sm font-medium">{tooltipContent}</p>
            </div>
          )}
        </div>
        
        <div className="mt-8 text-center">
          <p className="text-sm text-gray-500">
            Data shown is for demonstration purposes only. Hover over colored countries to see trade details.
          </p>
        </div>
      </div>
    </section>
  );
} 