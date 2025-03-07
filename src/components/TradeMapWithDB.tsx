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

interface CountryTradeData {
  id: number;
  country: string;
  imports: number;
  exports: number;
  total: number;
  products: string[];
}

interface HSCode {
  code: string;
  description: string;
  value: number;
  hs2_code?: string;
  hs4_code?: string;
}

interface HSData {
  [key: string]: HSCode[];
}

type HSLevel = 'hs2' | 'hs4' | 'hs6';

// Calculate global trade totals
function calculateGlobalTotals(countries: CountryTradeData[]) {
  return countries.reduce((acc, curr) => {
    acc.imports += curr.imports;
    acc.exports += curr.exports;
    acc.total += curr.total;
    return acc;
  }, { imports: 0, exports: 0, total: 0 });
}

export function TradeMapWithDB() {
  const svgRef = useRef<SVGSVGElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [selectedCountry, setSelectedCountry] = useState<string | null>(null);
  const [mapMode, setMapMode] = useState<'country' | 'product'>('country');
  const [countryData, setCountryData] = useState<CountryTradeData[]>([]);
  const [hsData, setHsData] = useState<HSData | null>(null);
  const [selectedHSLevel, setSelectedHSLevel] = useState<HSLevel>('hs2');
  const [selectedHSCode, setSelectedHSCode] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const globalTotals = countryData.length ? calculateGlobalTotals(countryData) : { imports: 0, exports: 0, total: 0 };

  // Fetch country trade data
  useEffect(() => {
    async function fetchCountryData() {
      setIsLoading(true);
      setError(null);
      try {
        const response = await fetch('/api/country-trade');
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const result = await response.json();
        setCountryData(result.data || []);
      } catch (err) {
        console.error('Error fetching country data:', err);
        setError('Failed to load country data');
      } finally {
        setIsLoading(false);
      }
    }

    fetchCountryData();
  }, []);

  // Fetch HS code data
  useEffect(() => {
    async function fetchHSData() {
      setIsLoading(true);
      setError(null);
      try {
        // Fetch HS2 codes
        const hs2Response = await fetch('/api/hs-codes?level=hs2');
        if (!hs2Response.ok) {
          throw new Error(`HTTP error! status: ${hs2Response.status}`);
        }
        const hs2Result = await hs2Response.json();

        // Fetch HS4 codes
        const hs4Response = await fetch('/api/hs-codes?level=hs4');
        if (!hs4Response.ok) {
          throw new Error(`HTTP error! status: ${hs4Response.status}`);
        }
        const hs4Result = await hs4Response.json();

        // Fetch HS6 codes
        const hs6Response = await fetch('/api/hs-codes?level=hs6');
        if (!hs6Response.ok) {
          throw new Error(`HTTP error! status: ${hs6Response.status}`);
        }
        const hs6Result = await hs6Response.json();

        setHsData({
          hs2: hs2Result.data || [],
          hs4: hs4Result.data || [],
          hs6: hs6Result.data || []
        });
      } catch (err) {
        console.error('Error fetching HS codes:', err);
        setError('Failed to load HS code data');
      } finally {
        setIsLoading(false);
      }
    }

    fetchHSData();
  }, []);

  useEffect(() => {
    if (!svgRef.current || !wrapperRef.current) return;
    if (countryData.length === 0) return;
    if (mapMode === 'product' && !hsData) return;

    // Get wrapper dimensions
    const width = wrapperRef.current.clientWidth;
    const height = 500;

    // Clear existing content
    d3.select(svgRef.current).selectAll("*").remove();

    // Create SVG with zoom support
    const svg = d3.select(svgRef.current)
      .attr("width", width)
      .attr("height", height)
      .attr("viewBox", [0, 0, width, height])
      .style("max-width", "100%")
      .style("height", "auto");

    // Add zoom functionality
    const zoom = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([1, 8])
      .on("zoom", (event) => {
        g.attr("transform", event.transform);
      });

    svg.call(zoom as any);

    // Create a group for the map
    const g = svg.append("g");

    // Define color scale 
    const colorScale = d3.scaleSequentialLog(d3.interpolateBlues)
      .domain([1000, 80000]);

    // Create projection 
    const projection = d3.geoNaturalEarth1()
      .scale(width / 5.5)
      .translate([width / 2, height / 1.8]);

    // Create path generator
    const path = d3.geoPath().projection(projection);

    // Create a map of country names to data for easy lookup
    const countryMap = new Map<string, CountryTradeData>();
    countryData.forEach(country => {
      countryMap.set(country.country, country);
    });

    // Load world map data
    Promise.all([
      fetch('/data/world-countries.json').then(response => response.json())
    ]).then(([world]) => {
      // Add graticule (grid lines)
      const graticule = d3.geoGraticule()
        .step([15, 15]);

      g.append("path")
        .datum(graticule)
        .attr("class", "graticule")
        .attr("d", path as any)
        .attr("fill", "none")
        .attr("stroke", "#e2e8f0")
        .attr("stroke-width", 0.5);

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
          const country = countryMap.get(countryName);
          
          if (mapMode === 'country') {
            return country 
              ? colorScale(country.total) 
              : "#f1f5f9";
          } else {
            // In product mode, we would color based on product-specific data
            return "#f1f5f9";
          }
        })
        .attr("stroke", "#fff")
        .attr("stroke-width", 0.5)
        .style("cursor", "pointer")
        .on("mouseover", function(event, d: any) {
          const countryName = d.properties.name;
          handleCountryHover(this, countryName, event, d);
        })
        .on("mouseout", function() {
          d3.select(this)
            .attr("stroke-width", 0.5)
            .attr("stroke", "#fff");
          
          svg.selectAll(".tooltip").remove();
        })
        .on("click", function(event, d: any) {
          const countryName = d.properties.name;
          setSelectedCountry(prevCountry => 
            prevCountry === countryName ? null : countryName
          );
        });

      // If in product mode and an HS code is selected, add product-specific visualization
      if (mapMode === 'product' && selectedHSCode && hsData) {
        // For now, just adding circles to random positions as placeholders
        const hsLevel = selectedHSLevel;
        const selectedProduct = hsData[hsLevel].find(item => item.code === selectedHSCode);
        
        if (selectedProduct) {
          // Scale for circle sizes
          const sizeScale = d3.scaleSqrt()
            .domain([0, d3.max(hsData[hsLevel], d => d.value) || 10000])
            .range([5, 30]);
            
          g.selectAll("circle.product")
            .data(hsData[hsLevel].filter(d => 
              hsLevel === 'hs2' 
                ? d.code === selectedHSCode
                : hsLevel === 'hs4' 
                  ? d.hs2_code === selectedHSCode
                  : d.hs4_code === selectedHSCode
            ))
            .join("circle")
            .attr("class", "product")
            .attr("cx", (d, i) => {
              // Random position for now - would be country centroid in a real implementation
              return 200 + i * 50;
            })
            .attr("cy", (d, i) => {
              return 200 + i * 30;
            })
            .attr("r", d => sizeScale(d.value))
            .attr("fill", d => d3.interpolateBlues(d.value / 100000))
            .attr("fill-opacity", 0.7)
            .attr("stroke", "#fff")
            .attr("stroke-width", 1)
            .style("cursor", "pointer")
            .on("mouseover", function(event, d) {
              const tooltip = svg.append("g")
                .attr("class", "tooltip");
  
              tooltip.append("rect")
                .attr("x", event.offsetX)
                .attr("y", event.offsetY - 60)
                .attr("width", 200)
                .attr("height", 50)
                .attr("fill", "white")
                .attr("stroke", "#e2e8f0")
                .attr("rx", 4);
  
              tooltip.append("text")
                .attr("x", event.offsetX + 10)
                .attr("y", event.offsetY - 40)
                .attr("font-weight", "bold")
                .text(`${d.code}: ${d.description}`);
  
              tooltip.append("text")
                .attr("x", event.offsetX + 10)
                .attr("y", event.offsetY - 20)
                .text(`Trade Value: $${d.value.toLocaleString()}M`);
            })
            .on("mouseout", function() {
              svg.selectAll(".tooltip").remove();
            });
        }
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
    });

    function handleCountryHover(element: any, countryName: string, event: any, d: any) {
      const country = countryMap.get(countryName);
      
      d3.select(element)
        .attr("stroke-width", 1.5)
        .attr("stroke", "#333");

      // Show tooltip
      if (country) {
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
          .text(`Total Trade: $${country.total.toLocaleString()}M`);

        tooltip.append("text")
          .attr("x", tooltipX + 10)
          .attr("y", tooltipY + 60)
          .text(`Imports: $${country.imports.toLocaleString()}M | Exports: $${country.exports.toLocaleString()}M`);
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
        d3.select(svgRef.current)
          .attr("width", newWidth)
          .attr("viewBox", [0, 0, newWidth, height]);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [countryData, mapMode, hsData, selectedHSLevel, selectedHSCode]);

  // Handle HS code selection
  const handleHSCodeSelect = (code: string) => {
    setSelectedHSCode(code);
  };

  // Reset HS filter
  const resetHSFilter = () => {
    setSelectedHSCode(null);
  };

  // Get selected country data
  const selectedCountryData = selectedCountry 
    ? countryData.find(c => c.country === selectedCountry) 
    : null;

  if (isLoading && (!countryData.length || !hsData)) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-md">
        <p className="font-bold">Error:</p>
        <p>{error}</p>
      </div>
    );
  }

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
                              {hsData[selectedHSLevel]?.map((item) => (
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
            
            {selectedCountryData ? (
              <>
                <div className="flex justify-between mb-6">
                  <div className="text-center">
                    <div className="text-xl font-bold text-blue-600">
                      ${selectedCountryData.total.toLocaleString()}M
                    </div>
                    <div className="text-sm text-gray-500">Total Volume</div>
                  </div>
                  <div className="text-center">
                    <div className="text-xl font-bold text-green-600">
                      ${selectedCountryData.exports.toLocaleString()}M
                    </div>
                    <div className="text-sm text-gray-500">Exports</div>
                  </div>
                  <div className="text-center">
                    <div className="text-xl font-bold text-red-600">
                      ${selectedCountryData.imports.toLocaleString()}M
                    </div>
                    <div className="text-sm text-gray-500">Imports</div>
                  </div>
                </div>

                <div className="mb-4">
                  <h4 className="font-bold mb-2">Top Traded Products</h4>
                  <ul className="list-disc pl-5">
                    {selectedCountryData.products.map((product, i) => (
                      <li key={i} className="mb-1">{product}</li>
                    ))}
                  </ul>
                </div>

                <div className="mb-4">
                  <h4 className="font-bold mb-2">Trade Balance</h4>
                  <div className="bg-gray-100 rounded p-3">
                    <div className="font-medium">
                      ${(selectedCountryData.exports - selectedCountryData.imports).toLocaleString()}M
                    </div>
                    <div className="text-sm text-gray-500">
                      {selectedCountryData.exports > selectedCountryData.imports
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
                    {countryData
                      .sort((a, b) => b.total - a.total)
                      .slice(0, 5)
                      .map((country, i) => (
                        <li key={i} className="mb-1">
                          {country.country}: ${country.total.toLocaleString()}M
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
              {selectedHSCode && hsData
                ? `Product: ${hsData[selectedHSLevel]?.find(item => item.code === selectedHSCode)?.description || 'Loading...'}`
                : 'Product Trade Data'
              }
            </h3>
            
            {selectedHSCode && hsData ? (
              <>
                <div className="flex justify-between mb-6">
                  <div className="text-center w-full">
                    <div className="text-xl font-bold text-blue-600">
                      ${hsData[selectedHSLevel]?.find(item => item.code === selectedHSCode)?.value.toLocaleString()}M
                    </div>
                    <div className="text-sm text-gray-500">Total Trade Value</div>
                  </div>
                </div>

                <div className="mb-4">
                  <h4 className="font-bold mb-2">Code Details</h4>
                  <div className="bg-gray-100 rounded p-3 mb-3">
                    <div className="font-medium">HS Code: {selectedHSCode}</div>
                    <div className="text-sm text-gray-700">
                      {hsData[selectedHSLevel]?.find(item => item.code === selectedHSCode)?.description}
                    </div>
                  </div>
                  
                  {selectedHSLevel !== 'hs2' && (
                    <div className="bg-gray-100 rounded p-3">
                      <div className="font-medium">Parent Category:</div>
                      <div className="text-sm text-gray-700">
                        {selectedHSLevel === 'hs4' 
                          ? `HS2 - ${hsData.hs2?.find(item => item.code === hsData.hs4?.find(h4 => h4.code === selectedHSCode)?.hs2_code)?.description || 'Unknown'}`
                          : `HS4 - ${hsData.hs4?.find(item => item.code === hsData.hs6?.find(h6 => h6.code === selectedHSCode)?.hs4_code)?.description || 'Unknown'}`
                        }
                      </div>
                    </div>
                  )}
                </div>

                <div className="mb-4">
                  <h4 className="font-bold mb-2">Related Products</h4>
                  <ul className="list-disc pl-5">
                    {hsData[selectedHSLevel === 'hs2' ? 'hs4' : selectedHSLevel === 'hs4' ? 'hs6' : 'hs6']
                      ?.filter(item => 
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