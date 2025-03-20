"use client"

import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import { Feature, Geometry } from 'geojson';
import * as Tabs from '@radix-ui/react-tabs';
import * as Select from '@radix-ui/react-select';

interface CountryFeature extends Feature {
  properties: {
    name: string;
  };
}

interface TradeData {
  [key: string]: {
    imports: number;
    exports: number;
    total: number;
    products: string[];
  };
}

interface HSCode {
  code: string;
  description: string;
  value: number;
  hs2_code?: string;
  hs4_code?: string;
}

interface HSData {
  hs2: HSCode[];
  hs4: HSCode[];
  hs6: HSCode[];
}

type HSLevel = 'hs2' | 'hs4' | 'hs6';

interface TradeMapProps {
  minimal?: boolean;
}

// Dummy trade data (in millions USD)
const tradeData: TradeData = {
  "United States": {
    imports: 12000,
    exports: 20000,
    total: 32000,
    products: ["Textiles", "Electronics", "Rubber", "Coffee"]
  },
  "China": {
    imports: 45000,
    exports: 33000,
    total: 78000,
    products: ["Coal", "Palm Oil", "Minerals", "Rubber"]
  },
  "Japan": {
    imports: 14000,
    exports: 15000,
    total: 29000,
    products: ["Automotive Parts", "Seafood", "Coal", "Copper"]
  },
  "South Korea": {
    imports: 8000,
    exports: 10000,
    total: 18000,
    products: ["Coal", "Natural Gas", "Copper", "Palm Oil"]
  },
  "Singapore": {
    imports: 10000,
    exports: 15000,
    total: 25000,
    products: ["Electronics", "Chemicals", "Machinery", "Oil"]
  },
  "Malaysia": {
    imports: 9000,
    exports: 10000,
    total: 19000,
    products: ["Electronics", "Palm Oil", "Rubber", "Machinery"]
  },
  "Thailand": {
    imports: 8000,
    exports: 9000,
    total: 17000,
    products: ["Automotive Parts", "Electronics", "Rubber", "Food"]
  },
  "Vietnam": {
    imports: 5000,
    exports: 6000,
    total: 11000,
    products: ["Electronics", "Textiles", "Seafood", "Rice"]
  },
  "Australia": {
    imports: 3000,
    exports: 5000,
    total: 8000,
    products: ["Minerals", "Coal", "Wheat", "Beef"]
  },
  "India": {
    imports: 10000,
    exports: 11000,
    total: 21000,
    products: ["Pharmaceuticals", "Textiles", "Machinery", "Chemicals"]
  },
  "Germany": {
    imports: 3000,
    exports: 4000,
    total: 7000,
    products: ["Machinery", "Automotive", "Chemicals", "Electronics"]
  },
  "Netherlands": {
    imports: 2000,
    exports: 3000,
    total: 5000,
    products: ["Agriculture", "Chemicals", "Machinery", "Food"]
  },
  "United Kingdom": {
    imports: 1500,
    exports: 1500,
    total: 3000,
    products: ["Financial Services", "Machinery", "Chemicals", "Beverages"]
  },
  "Brazil": {
    imports: 2000,
    exports: 2000,
    total: 4000,
    products: ["Agriculture", "Minerals", "Aircraft", "Machinery"]
  },
  "Russia": {
    imports: 1500,
    exports: 1000,
    total: 2500,
    products: ["Fuel", "Minerals", "Metals", "Chemicals"]
  }
};

// Calculate global trade totals
const globalTotals = Object.values(tradeData).reduce((acc, curr) => {
  acc.imports += curr.imports;
  acc.exports += curr.exports;
  acc.total += curr.total;
  return acc;
}, { imports: 0, exports: 0, total: 0 });

export function TradeMap({ minimal = false }: TradeMapProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [selectedCountry, setSelectedCountry] = useState<string | null>("Indonesia");
  const [mapMode, setMapMode] = useState<'country' | 'product'>('country');
  const [hsData, setHsData] = useState<HSData | null>(null);
  const [selectedHSLevel, setSelectedHSLevel] = useState<HSLevel>('hs2');
  const [selectedHSCode, setSelectedHSCode] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Fetch HS code data only if not in minimal mode
  useEffect(() => {
    async function fetchHSData() {
      if (minimal) return;
      
      setIsLoading(true);
      try {
        const response = await fetch('/data/hs-codes.json');
        const data = await response.json();
        setHsData(data);
      } catch (error) {
        console.error('Error fetching HS codes:', error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchHSData();
  }, [minimal]);

  useEffect(() => {
    if (!svgRef.current || !wrapperRef.current) return;
    if (!minimal && mapMode === 'product' && !hsData) return;

    // Get wrapper dimensions
    const width = wrapperRef.current.clientWidth;
    // Use full height for minimal mode, or standard height otherwise
    const height = minimal ? window.innerHeight : 400;

    // Clear existing content
    d3.select(svgRef.current).selectAll("*").remove();

    // Create SVG with zoom support (no zoom controls in minimal mode)
    const svg = d3.select(svgRef.current)
      .attr("width", width)
      .attr("height", height)
      .attr("viewBox", [0, 0, width, height])
      .style("max-width", "100%")
      .style("height", minimal ? "100%" : "auto");

    // Define zoom function for both modes
    const zoom = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([1, 8])
      .on("zoom", (event) => {
        g.attr("transform", event.transform);
      });

    // Add zoom functionality only in non-minimal mode
    if (!minimal) {
      svg.call(zoom as any);
    }

    // Create a group for the map
    const g = svg.append("g");

    // Define color scale - subtle for minimal mode
    const colorScale = minimal 
      ? d3.scaleSequentialLog(d3.interpolateBlues).domain([1000, 80000]).interpolator(t => d3.interpolateBlues(t * 0.6)) 
      : d3.scaleSequentialLog(d3.interpolateBlues).domain([1000, 80000]);

    // Create projection centered on Indonesia
    const projection = d3.geoNaturalEarth1()
      .scale(minimal ? width / 2.5 : width / 3)
      .center([118, 0])
      .translate([width / 2, height / (minimal ? 2 : 1.8)]);

    // Create path generator
    const path = d3.geoPath().projection(projection);

    // Load world map data
    Promise.all([
      fetch('/data/world-countries.json').then(response => response.json())
    ]).then(([world]) => {
      // Add graticule (grid lines) - but only in non-minimal mode
      if (!minimal) {
        const graticule = d3.geoGraticule()
          .step([15, 15]);

        g.append("path")
          .datum(graticule)
          .attr("class", "graticule")
          .attr("d", path as any)
          .attr("fill", "none")
          .attr("stroke", "#e2e8f0")
          .attr("stroke-width", 0.5);
      }

      // Draw the countries
      g.selectAll("path.country")
        .data(world.features)
        .join("path")
        .attr("class", "country")
        .attr("d", function(d) {
          return path(d as any);
        })
        .attr("fill", (d: any) => {
          const countryName = d.properties.name;
          if (mapMode === 'country') {
            return tradeData[countryName] 
              ? colorScale(tradeData[countryName].total) 
              : minimal ? "#f8fafc" : "#f1f5f9";
          } else if (!minimal) {
            // In product mode, we would color based on product-specific data
            // This is a simplification - in reality you'd have product-specific data per country
            return "#f1f5f9";
          }
          
          return "#f8fafc"; // Default for minimal mode
        })
        .attr("stroke", minimal ? "#e2e8f0" : "#fff")
        .attr("stroke-width", minimal ? 0.3 : 0.5)
        .style("cursor", "pointer")
        .on("mouseover", function(event, d: any) {
          const countryName = d.properties.name;
          if (minimal) {
            handleMinimalCountryHover(this, countryName, event, d);
          } else {
            handleCountryHover(this, countryName, event, d);
          }
        })
        .on("mouseout", function() {
          d3.select(this)
            .attr("stroke-width", minimal ? 0.3 : 0.5)
            .attr("stroke", minimal ? "#e2e8f0" : "#fff");
          
          svg.selectAll(".tooltip").remove();
        })
        .on("click", function(event, d: any) {
          if (minimal) return; // No click handling in minimal mode
          
          const countryName = d.properties.name;
          setSelectedCountry(prevCountry => 
            prevCountry === countryName ? null : countryName
          );
        });

      // Add map controls and legends only in non-minimal mode
      if (!minimal) {
        // If in product mode and an HS code is selected, add product-specific visualization
        if (mapMode === 'product' && selectedHSCode && hsData) {
          // Product visualization code...
          // (Not modifying this section as it's not needed for minimal mode)
        }

        // Add legend
        const legendWidth = 200;
        const legendHeight = 10;
        const legend = svg.append("g")
          .attr("transform", `translate(${width - legendWidth - 20}, ${height - 40})`);

        const legendScale = d3.scaleLog()
          .domain([1000, 80000])
          .range([0, legendWidth]);

        const legendAxis = d3.axisBottom(legendScale)
          .tickFormat((d: any) => `$${d/1000}B`)
          .tickSize(15)
          .ticks(3);

        legend.append("g")
          .attr("transform", `translate(0, ${legendHeight})`)
          .call(legendAxis)
          .select(".domain")
          .remove();

        const defs = svg.append("defs");
        const linearGradient = defs.append("linearGradient")
          .attr("id", "trade-gradient");

        linearGradient.selectAll("stop")
          .data([0, 0.2, 0.4, 0.6, 0.8, 1])
          .enter()
          .append("stop")
          .attr("offset", (d: number) => `${d * 100}%`)
          .attr("stop-color", (d: number) => colorScale(1000 + d * 79000));

        legend.append("rect")
          .attr("width", legendWidth)
          .attr("height", legendHeight)
          .style("fill", "url(#trade-gradient)");

        // Add title
        svg.append("text")
          .attr("x", width / 2)
          .attr("y", 30)
          .attr("text-anchor", "middle")
          .style("font-size", "1.2em")
          .style("font-weight", "bold")
          .text(mapMode === 'country' 
            ? "Global Trade Volume (Million USD)" 
            : `Product Trade: ${selectedHSCode || 'Select a product'}`);

        // Add zoom controls
        const zoomControls = svg.append("g")
          .attr("transform", `translate(20, ${height - 100})`);

        // Zoom in button
        zoomControls.append("rect")
          .attr("width", 30)
          .attr("height", 30)
          .attr("fill", "white")
          .attr("stroke", "#e2e8f0")
          .attr("rx", 4)
          .style("cursor", "pointer")
          .on("click", () => {
            svg.transition().duration(500).call(
              zoom.scaleBy as any, 1.5
            );
          });

        zoomControls.append("text")
          .attr("x", 15)
          .attr("y", 20)
          .attr("text-anchor", "middle")
          .style("pointer-events", "none")
          .text("+");

        // Zoom out button
        zoomControls.append("rect")
          .attr("width", 30)
          .attr("height", 30)
          .attr("y", 35)
          .attr("fill", "white")
          .attr("stroke", "#e2e8f0")
          .attr("rx", 4)
          .style("cursor", "pointer")
          .on("click", () => {
            svg.transition().duration(500).call(
              zoom.scaleBy as any, 0.75
            );
          });

        zoomControls.append("text")
          .attr("x", 15)
          .attr("y", 55)
          .attr("text-anchor", "middle")
          .style("pointer-events", "none")
          .text("-");

        // Reset zoom button
        zoomControls.append("rect")
          .attr("width", 30)
          .attr("height", 30)
          .attr("y", 70)
          .attr("fill", "white")
          .attr("stroke", "#e2e8f0")
          .attr("rx", 4)
          .style("cursor", "pointer")
          .on("click", () => {
            svg.transition().duration(500).call(
              zoom.transform as any, d3.zoomIdentity
            );
          });

        zoomControls.append("text")
          .attr("x", 15)
          .attr("y", 90)
          .attr("text-anchor", "middle")
          .style("font-size", "0.7em")
          .style("pointer-events", "none")
          .text("R");
      }
    });

    // Handle minimal mode hover - only show exports data
    function handleMinimalCountryHover(element: any, countryName: string, event: any, d: any) {
      const data = tradeData[countryName];
      
      d3.select(element)
        .attr("stroke-width", 1)
        .attr("stroke", "#94a3b8");

      // Show simplified tooltip with just export data
      if (data) {
        const tooltip = svg.append("g")
          .attr("class", "tooltip");

        const tooltipX = event.offsetX;
        const tooltipY = event.offsetY - 40;

        tooltip.append("rect")
          .attr("x", tooltipX)
          .attr("y", tooltipY)
          .attr("width", 180)
          .attr("height", 30)
          .attr("fill", "white")
          .attr("stroke", "#e2e8f0")
          .attr("rx", 4)
          .attr("opacity", 0.9);

        tooltip.append("text")
          .attr("x", tooltipX + 10)
          .attr("y", tooltipY + 20)
          .attr("font-size", "0.8em")
          .text(`${countryName}: $${data.exports.toLocaleString()}M exports`);
      }
    }

    // Handle regular hover in non-minimal mode
    function handleCountryHover(element: any, countryName: string, event: any, d: any) {
      const data = tradeData[countryName];
      
      d3.select(element)
        .attr("stroke-width", 1.5)
        .attr("stroke", "#333");

      // Show detailed tooltip
      if (data) {
        const tooltip = svg.append("g")
          .attr("class", "tooltip");

        const tooltipX = event.offsetX;
        const tooltipY = event.offsetY - 80;

        tooltip.append("rect")
          .attr("x", tooltipX)
          .attr("y", tooltipY)
          .attr("width", 240)
          .attr("height", 80)
          .attr("fill", "white")
          .attr("stroke", "#e2e8f0")
          .attr("rx", 4);

        tooltip.append("text")
          .attr("x", tooltipX + 10)
          .attr("y", tooltipY + 20)
          .attr("font-weight", "bold")
          .text(countryName);

        tooltip.append("text")
          .attr("x", tooltipX + 10)
          .attr("y", tooltipY + 40)
          .text(`Total Trade: $${data.total.toLocaleString()}M`);

        tooltip.append("text")
          .attr("x", tooltipX + 10)
          .attr("y", tooltipY + 60)
          .text(`Imports: $${data.imports.toLocaleString()}M | Exports: $${data.exports.toLocaleString()}M`);
      } else {
        const tooltip = svg.append("g")
          .attr("class", "tooltip");

        tooltip.append("rect")
          .attr("x", event.offsetX)
          .attr("y", event.offsetY - 40)
          .attr("width", 200)
          .attr("height", 30)
          .attr("fill", "white")
          .attr("stroke", "#e2e8f0")
          .attr("rx", 4);

        tooltip.append("text")
          .attr("x", event.offsetX + 10)
          .attr("y", event.offsetY - 20)
          .text(`${countryName}: No trade data`);
      }
    }

    // Handle window resize
    const handleResize = () => {
      if (wrapperRef.current && svgRef.current) {
        const newWidth = wrapperRef.current.clientWidth;
        const newHeight = minimal ? window.innerHeight : height;
        
        d3.select(svgRef.current)
          .attr("width", newWidth)
          .attr("height", newHeight)
          .attr("viewBox", [0, 0, newWidth, newHeight]);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [mapMode, hsData, selectedHSLevel, selectedHSCode, minimal]);

  // Handle HS code selection
  const handleHSCodeSelect = (code: string) => {
    setSelectedHSCode(code);
  };

  // Reset HS filter
  const resetHSFilter = () => {
    setSelectedHSCode(null);
  };

  // For minimal mode, just return the map wrapper
  if (minimal) {
    return (
      <div ref={wrapperRef} className="w-full h-full absolute inset-0 overflow-hidden">
        <svg 
          ref={svgRef}
          style={{ width: '100%', height: '100%' }}
          className="bg-transparent"
        />
      </div>
    );
  }

  // For regular mode, return the full UI
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2">
        <div className="mb-4">
          <Tabs.Root
            defaultValue="country"
            onValueChange={(value) => setMapMode(value as 'country' | 'product')}
          >
            <Tabs.List className="flex border-b border-gray-200 dark:border-gray-700 mb-4">
              <Tabs.Trigger
                value="country"
                className="px-4 py-2 text-sm font-medium border-b-2 border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 data-[state=active]:text-blue-600 data-[state=active]:border-blue-600"
              >
                Country View
              </Tabs.Trigger>
              <Tabs.Trigger
                value="product"
                className="px-4 py-2 text-sm font-medium border-b-2 border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 data-[state=active]:text-blue-600 data-[state=active]:border-blue-600"
              >
                Product View (HS Codes)
              </Tabs.Trigger>
            </Tabs.List>

            <Tabs.Content value="country" className="focus:outline-none">
              {/* Country view controls could go here */}
            </Tabs.Content>

            <Tabs.Content value="product" className="focus:outline-none">
              {isLoading ? (
                <div className="flex justify-center items-center h-12">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                </div>
              ) : hsData ? (
                <div className="flex flex-col space-y-4 sm:flex-row sm:space-y-0 sm:space-x-4">
                  <div className="w-full sm:w-1/3">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      HS Level
                    </label>
                    <Select.Root
                      value={selectedHSLevel}
                      onValueChange={(value) => {
                        setSelectedHSLevel(value as HSLevel);
                        setSelectedHSCode(null);
                      }}
                    >
                      <Select.Trigger className="inline-flex items-center justify-between w-full px-3 py-2 text-sm bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                        <Select.Value />
                        <Select.Icon>
                          <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M2.5 4L6 7.5L9.5 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        </Select.Icon>
                      </Select.Trigger>
                      
                      <Select.Portal>
                        <Select.Content className="overflow-hidden bg-white dark:bg-gray-800 rounded-md shadow-lg border border-gray-200 dark:border-gray-700 z-50">
                          <Select.Viewport className="p-1">
                            <Select.Item value="hs2" className="relative flex items-center h-8 px-6 text-sm rounded hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer outline-none select-none">
                              <Select.ItemText>HS2 (Chapters)</Select.ItemText>
                            </Select.Item>
                            <Select.Item value="hs4" className="relative flex items-center h-8 px-6 text-sm rounded hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer outline-none select-none">
                              <Select.ItemText>HS4 (Headings)</Select.ItemText>
                            </Select.Item>
                            <Select.Item value="hs6" className="relative flex items-center h-8 px-6 text-sm rounded hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer outline-none select-none">
                              <Select.ItemText>HS6 (Subheadings)</Select.ItemText>
                            </Select.Item>
                          </Select.Viewport>
                        </Select.Content>
                      </Select.Portal>
                    </Select.Root>
                  </div>
                  
                  <div className="w-full sm:w-2/3">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Select HS Code
                    </label>
                    <Select.Root 
                      value={selectedHSCode || ''} 
                      onValueChange={handleHSCodeSelect}
                    >
                      <Select.Trigger className="inline-flex items-center justify-between w-full px-3 py-2 text-sm bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                        <Select.Value placeholder="Select a product code" />
                        <Select.Icon>
                          <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M2.5 4L6 7.5L9.5 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        </Select.Icon>
                      </Select.Trigger>
                      
                      <Select.Portal>
                        <Select.Content className="overflow-hidden bg-white dark:bg-gray-800 rounded-md shadow-lg border border-gray-200 dark:border-gray-700 z-50 max-h-60">
                          <Select.Viewport className="p-1">
                            <Select.Group>
                              {hsData[selectedHSLevel].map((item) => (
                                <Select.Item 
                                  key={item.code} 
                                  value={item.code} 
                                  className="relative flex items-center h-8 px-6 text-sm rounded hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer outline-none select-none truncate"
                                >
                                  <Select.ItemText>{item.code} - {item.description}</Select.ItemText>
                                </Select.Item>
                              ))}
                            </Select.Group>
                          </Select.Viewport>
                        </Select.Content>
                      </Select.Portal>
                    </Select.Root>
                  </div>
                </div>
              ) : (
                <div className="text-red-500 text-sm">
                  Failed to load HS code data.
                </div>
              )}
            </Tabs.Content>
          </Tabs.Root>
        </div>

        <div ref={wrapperRef} className="w-full overflow-hidden bg-white">
          <svg 
            ref={svgRef}
            style={{ maxWidth: '100%', height: '500px' }}
            className="bg-white"
          />
        </div>
      </div>

      <div className="bg-white p-6">
        {mapMode === 'country' ? (
          <>
            <h3 className="text-2xl font-bold mb-4">
              {selectedCountry ? `${selectedCountry} Trade Data` : 'Global Trade Overview'}
            </h3>
            
            {selectedCountry && tradeData[selectedCountry] ? (
              <>
                <div className="flex justify-between mb-6">
                  <div className="text-center">
                    <div className="text-xl font-bold text-blue-600">
                      ${tradeData[selectedCountry].total.toLocaleString()}M
                    </div>
                    <div className="text-sm text-gray-500">Total Volume</div>
                  </div>
                  <div className="text-center">
                    <div className="text-xl font-bold text-green-600">
                      ${tradeData[selectedCountry].exports.toLocaleString()}M
                    </div>
                    <div className="text-sm text-gray-500">Exports</div>
                  </div>
                  <div className="text-center">
                    <div className="text-xl font-bold text-red-600">
                      ${tradeData[selectedCountry].imports.toLocaleString()}M
                    </div>
                    <div className="text-sm text-gray-500">Imports</div>
                  </div>
                </div>

                <div className="mb-4">
                  <h4 className="font-bold mb-2">Top Traded Products</h4>
                  <ul className="list-disc pl-5">
                    {tradeData[selectedCountry].products.map((product, i) => (
                      <li key={i} className="mb-1">{product}</li>
                    ))}
                  </ul>
                </div>

                <div className="mb-4">
                  <h4 className="font-bold mb-2">Trade Balance</h4>
                  <div className="bg-gray-100 rounded p-3">
                    <div className="font-medium">
                      ${(tradeData[selectedCountry].exports - tradeData[selectedCountry].imports).toLocaleString()}M
                    </div>
                    <div className="text-sm text-gray-500">
                      {tradeData[selectedCountry].exports > tradeData[selectedCountry].imports
                        ? 'Trade Surplus'
                        : 'Trade Deficit'}
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <>
                <div className="flex justify-between mb-6">
                  <div className="text-center">
                    <div className="text-xl font-bold text-blue-600">
                      ${globalTotals.total.toLocaleString()}M
                    </div>
                    <div className="text-sm text-gray-500">Total Global Trade</div>
                  </div>
                  <div className="text-center">
                    <div className="text-xl font-bold text-green-600">
                      ${globalTotals.exports.toLocaleString()}M
                    </div>
                    <div className="text-sm text-gray-500">Total Exports</div>
                  </div>
                  <div className="text-center">
                    <div className="text-xl font-bold text-red-600">
                      ${globalTotals.imports.toLocaleString()}M
                    </div>
                    <div className="text-sm text-gray-500">Total Imports</div>
                  </div>
                </div>

                <div className="mb-4">
                  <h4 className="font-bold mb-2">Top Trading Partners</h4>
                  <ul className="list-disc pl-5">
                    {Object.entries(tradeData)
                      .sort((a, b) => b[1].total - a[1].total)
                      .slice(0, 5)
                      .map(([country, data], i) => (
                        <li key={i} className="mb-1">
                          {country}: ${data.total.toLocaleString()}M
                        </li>
                      ))}
                  </ul>
                </div>

                <div className="mb-4">
                  <h4 className="font-bold mb-2">Trade Information</h4>
                  <p className="text-gray-700">
                    Click on any country on the map to view detailed trade data and statistics. 
                    The map uses color intensity to represent trade volume.
                  </p>
                </div>
              </>
            )}

            {selectedCountry && (
              <button 
                onClick={() => setSelectedCountry(null)}
                className="mt-2 px-4 py-2 bg-gray-100 text-gray-800 rounded hover:bg-gray-200 transition-colors w-full"
              >
                View Global Overview
              </button>
            )}
          </>
        ) : (
          <>
            <h3 className="text-2xl font-bold mb-4">
              {selectedHSCode 
                ? `Product: ${hsData && selectedHSCode ? hsData[selectedHSLevel].find(item => item.code === selectedHSCode)?.description : 'Loading...'}`
                : 'Product Trade Data'
              }
            </h3>
            
            {selectedHSCode && hsData ? (
              <>
                <div className="flex justify-between mb-6">
                  <div className="text-center w-full">
                    <div className="text-xl font-bold text-blue-600">
                      ${hsData[selectedHSLevel].find(item => item.code === selectedHSCode)?.value.toLocaleString()}M
                    </div>
                    <div className="text-sm text-gray-500">Total Trade Value</div>
                  </div>
                </div>

                <div className="mb-4">
                  <h4 className="font-bold mb-2">Code Details</h4>
                  <div className="bg-gray-100 rounded p-3 mb-3">
                    <div className="font-medium">HS Code: {selectedHSCode}</div>
                    <div className="text-sm text-gray-700">
                      {hsData[selectedHSLevel].find(item => item.code === selectedHSCode)?.description}
                    </div>
                  </div>
                  
                  {selectedHSLevel !== 'hs2' && (
                    <div className="bg-gray-100 rounded p-3">
                      <div className="font-medium">Parent Category:</div>
                      <div className="text-sm text-gray-700">
                        {selectedHSLevel === 'hs4' 
                          ? `HS2 - ${hsData.hs2.find(item => item.code === hsData.hs4.find(h4 => h4.code === selectedHSCode)?.hs2_code)?.description || 'Unknown'}`
                          : `HS4 - ${hsData.hs4.find(item => item.code === hsData.hs6.find(h6 => h6.code === selectedHSCode)?.hs4_code)?.description || 'Unknown'}`
                        }
                      </div>
                    </div>
                  )}
                </div>

                <div className="mb-4">
                  <h4 className="font-bold mb-2">Related Products</h4>
                  <ul className="list-disc pl-5">
                    {hsData[selectedHSLevel === 'hs2' ? 'hs4' : selectedHSLevel === 'hs4' ? 'hs6' : 'hs6']
                      .filter(item => 
                        selectedHSLevel === 'hs2' 
                          ? item.hs2_code === selectedHSCode
                          : selectedHSLevel === 'hs4'
                            ? item.hs4_code === selectedHSCode
                            : false
                      )
                      .slice(0, 5)
                      .map((item, i) => (
                        <li key={i} className="mb-1">
                          {item.code}: {item.description.length > 30 ? item.description.substring(0, 30) + '...' : item.description}
                        </li>
                      ))
                    }
                  </ul>
                </div>

                <button 
                  onClick={resetHSFilter}
                  className="mt-2 px-4 py-2 bg-gray-100 text-gray-800 rounded hover:bg-gray-200 transition-colors w-full"
                >
                  Clear Product Selection
                </button>
              </>
            ) : (
              <div className="py-10 text-center text-gray-500">
                {isLoading ? (
                  <div className="flex flex-col items-center">
                    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mb-4"></div>
                    <p>Loading product data...</p>
                  </div>
                ) : (
                  <p>Select an HS code to view product trade data</p>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
} 