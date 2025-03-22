"use client"

import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as d3 from 'd3';
import { Feature } from 'geojson';
import * as Tabs from '@radix-ui/react-tabs';
import * as Select from '@radix-ui/react-select';
import { Card, CardContent } from "@/components/ui/card";
import { ChevronDownIcon, CheckIcon } from '@radix-ui/react-icons';
import { useTheme } from '@/components/ui/theme-provider';
import { 
  CountryMapData, 
  MapMetadata, 
  ChoroplethMapResponse,
  MapYear,
  MapMetric
} from '@/types/map-data';

// Interface for country feature in GeoJSON
interface CountryFeature extends Feature {
  properties: {
    name: string;
  };
}

// Interface for world data from GeoJSON
interface WorldData {
  type: string;
  features: CountryFeature[];
}

// Props for the ChoroplethMap component
interface ChoroplethMapProps {
  onCountrySelect?: (countryCode: string) => void;
  className?: string;
  isBackground?: boolean;
}

// Main component
export function ChoroplethMap({ onCountrySelect, className = "", isBackground = false }: ChoroplethMapProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  
  const [countryData, setCountryData] = useState<CountryMapData[]>([]);
  const [metadata, setMetadata] = useState<MapMetadata | null>(null);
  const [worldData, setWorldData] = useState<WorldData | null>(null);
  const [selectedCountry, setSelectedCountry] = useState<string | null>(null);
  const [selectedYear, setSelectedYear] = useState<MapYear>('2023');
  const [selectedMetric, setSelectedMetric] = useState<MapMetric>('total');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  const { theme } = useTheme();
  const isDarkMode = theme === 'dark';

  // Fetch choropleth map data
  const fetchMapData = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/map-data?year=${selectedYear !== 'all' ? selectedYear : ''}&metric=${selectedMetric}`);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch map data: ${response.statusText}`);
      }
      
      const data: ChoroplethMapResponse = await response.json();
      setCountryData(data.countries);
      setMetadata(data.metadata);
      setError(null);
    } catch (err) {
      console.error('Error fetching choropleth map data:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch map data');
    } finally {
      setIsLoading(false);
    }
  }, [selectedYear, selectedMetric]);

  // Fetch world map data
  const fetchWorldData = useCallback(async () => {
    try {
      const response = await fetch('/data/world-countries.json');
      
      if (!response.ok) {
        throw new Error(`Failed to fetch world map data: ${response.statusText}`);
      }
      
      const data: WorldData = await response.json();
      setWorldData(data);
    } catch (err) {
      console.error('Error fetching world map data:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch world map data');
    }
  }, []);

  // Fetch data when component mounts or when filter parameters change
  useEffect(() => {
    fetchMapData();
  }, [fetchMapData, selectedYear, selectedMetric]);

  // Fetch world map data when component mounts
  useEffect(() => {
    fetchWorldData();
  }, [fetchWorldData]);

  // Format value for display in tooltip
  const formatValue = (value: number): string => {
    if (value >= 1_000_000_000_000) {
      return `$${(value / 1_000_000_000_000).toFixed(2)} trillion`;
    } else if (value >= 1_000_000_000) {
      return `$${(value / 1_000_000_000).toFixed(2)} billion`;
    } else if (value >= 1_000_000) {
      return `$${(value / 1_000_000).toFixed(2)} million`;
    } else {
      return `$${value.toLocaleString()}`;
    }
  };

  // Handle country hover event
  const handleCountryHover = useCallback((element: any, countryName: string, event: any, feature: CountryFeature) => {
    if (!tooltipRef.current) return;
    
    // Get country data
    const country = countryData.find(c => c.country === countryName);
    
    // Create tooltip content
    const tooltip = d3.select(tooltipRef.current);
    tooltip.style("opacity", 0);
    
    if (country) {
      let metricValue: number;
      let metricLabel: string;
      
      if (selectedMetric === 'imports') {
        metricValue = country.import_value;
        metricLabel = 'Imports';
      } else if (selectedMetric === 'exports') {
        metricValue = country.export_value;
        metricLabel = 'Exports';
      } else {
        metricValue = country.total_value;
        metricLabel = 'Total Trade';
      }
      
      tooltip.html(`
        <div class="p-2">
          <div class="font-bold">${countryName}</div>
          <div>${metricLabel}: ${formatValue(metricValue)}</div>
          <div class="text-xs">Transactions: ${country.trade_count.toLocaleString()}</div>
        </div>
      `)
      .style("left", (event.pageX + 15) + "px")
      .style("top", (event.pageY - 28) + "px")
      .style("opacity", 1)
      .style("background-color", isDarkMode ? "#2a2a2a" : "white")
      .style("color", isDarkMode ? "white" : "black")
      .style("border", `1px solid ${isDarkMode ? "#444" : "#ccc"}`)
      .style("border-radius", "4px")
      .style("pointer-events", "none")
      .style("position", "absolute")
      .style("z-index", "10")
      .style("box-shadow", "2px 2px 5px rgba(0,0,0,0.2)");
    }
  }, [countryData, selectedMetric, isDarkMode]);

  // Handle selecting a country - both internal state and notifying parent
  const handleCountrySelect = useCallback((countryName: string) => {
    setSelectedCountry(countryName);
    
    // Notify parent component if callback provided
    if (onCountrySelect) {
      onCountrySelect(countryName);
    }
  }, [onCountrySelect]);

  // Render map when data is loaded or parameters change
  useEffect(() => {
    if (!svgRef.current || !wrapperRef.current || !worldData || !countryData.length || !metadata) return;

    console.log('Rendering choropleth map with', countryData.length, 'countries');
    
    const wrapper = d3.select(wrapperRef.current);
    const svg = d3.select(svgRef.current);
    
    // Clear previous content
    svg.selectAll("*").remove();
    
    // Get dimensions
    const { width, height } = wrapperRef.current.getBoundingClientRect();
    
    svg.attr("width", width)
       .attr("height", height);
    
    // Create projection
    const projection = d3.geoMercator()
      .scale(width / 6.5)
      .center([0, 20])
      .translate([width / 2, height / 2]);
    
    // Create path generator
    const pathGenerator = d3.geoPath().projection(projection);
    
    // Create zoom behavior
    const zoom = d3.zoom()
      .scaleExtent([1, 8])
      .on("zoom", (event) => {
        svg.select("g").attr("transform", event.transform);
      });
    
    svg.call(zoom as any);
    
    // Add a group for all map elements
    const g = svg.append("g");

    // Determine color scale based on selected metric
    const getMetricValue = (country: CountryMapData): number => {
      if (selectedMetric === 'imports') return country.import_value;
      if (selectedMetric === 'exports') return country.export_value;
      return country.total_value;
    };

    // Use log scale for better color distribution
    const logScale = d3.scaleSymlog()
      .domain([Math.max(1, metadata.minValue), metadata.maxValue])
      .range([0.1, 0.9]);

    // Draw countries
    g.selectAll<SVGPathElement, CountryFeature>("path")
      .data(worldData.features)
      .enter()
      .append("path")
      .attr("d", feature => pathGenerator(feature as any))
      .attr("class", "country")
      .attr("fill", (feature) => {
        const countryName = feature.properties.name;
        const country = countryData.find(c => c.country === countryName);
        
        if (country) {
          const value = getMetricValue(country);
          if (value > 0) {
            return d3.interpolateBlues(logScale(value));
          }
        }
        
        return isDarkMode ? "#2a2a2a" : "#f0f0f0";
      })
      .attr("stroke", isDarkMode ? "#444" : "#fff")
      .attr("stroke-width", 0.5)
      .style("cursor", "pointer")
      .on("mouseover", function(event, feature) {
        const countryName = feature.properties.name;
        
        d3.select(this)
          .attr("stroke", "#333")
          .attr("stroke-width", 1.5);
        
        handleCountryHover(this, countryName, event, feature);
      })
      .on("mouseout", function() {
        d3.select(this)
          .attr("stroke", isDarkMode ? "#444" : "#fff")
          .attr("stroke-width", 0.5);
        
        if (tooltipRef.current) {
          d3.select(tooltipRef.current).style("opacity", 0);
        }
      })
      .on("click", function(event, feature) {
        const countryName = feature.properties.name;
        handleCountrySelect(countryName);
        
        // Highlight the selected country
        g.selectAll("path.country")
          .attr("stroke-width", 0.5)
          .attr("stroke", isDarkMode ? "#444" : "#fff");
          
        d3.select(this)
          .attr("stroke", "#ff6b6b")
          .attr("stroke-width", 2);
      });

    // Add color legend
    const legendWidth = 200;
    const legendHeight = 10;
    const legendX = width - legendWidth - 20;
    const legendY = height - 30;
    
    // Create gradient for legend
    const defs = svg.append("defs");
    const linearGradient = defs.append("linearGradient")
      .attr("id", "choropleth-gradient")
      .attr("x1", "0%")
      .attr("y1", "0%")
      .attr("x2", "100%")
      .attr("y2", "0%");
    
    // Add gradient stops
    linearGradient.selectAll("stop")
      .data([0.1, 0.25, 0.5, 0.75, 0.9])
      .enter()
      .append("stop")
      .attr("offset", d => `${d * 100}%`)
      .attr("stop-color", d => d3.interpolateBlues(d));
    
    // Create rectangle with gradient
    svg.append("rect")
      .attr("x", legendX)
      .attr("y", legendY)
      .attr("width", legendWidth)
      .attr("height", legendHeight)
      .style("fill", "url(#choropleth-gradient)");
    
    // Add legend title
    let legendTitle = "Total Trade Volume";
    if (selectedMetric === 'imports') legendTitle = "Import Volume";
    if (selectedMetric === 'exports') legendTitle = "Export Volume";
    
    svg.append("text")
      .attr("x", legendX)
      .attr("y", legendY - 5)
      .attr("font-size", "10px")
      .attr("fill", isDarkMode ? "#e0e0e0" : "#333")
      .text(legendTitle);
    
    // Add legend labels
    svg.append("text")
      .attr("x", legendX)
      .attr("y", legendY + legendHeight + 15)
      .attr("font-size", "10px")
      .attr("fill", isDarkMode ? "#e0e0e0" : "#333")
      .text(formatValue(metadata.minValue));
      
    svg.append("text")
      .attr("x", legendX + legendWidth)
      .attr("y", legendY + legendHeight + 15)
      .attr("font-size", "10px")
      .attr("text-anchor", "end")
      .attr("fill", isDarkMode ? "#e0e0e0" : "#333")
      .text(formatValue(metadata.maxValue));

  }, [worldData, countryData, metadata, selectedMetric, isDarkMode, handleCountryHover, handleCountrySelect, onCountrySelect]);

  // Use useEffect to handle full-screen mode for background map
  useEffect(() => {
    if (svgRef.current && wrapperRef.current) {
      if (isBackground) {
        // For background mode, fill the entire container
        const wrapper = wrapperRef.current;
        const svg = svgRef.current;
        
        // Set the width and height to 100% to fill the parent container
        svg.style.width = '100%';
        svg.style.height = '100%';
        wrapper.style.width = '100%';
        wrapper.style.height = '100%';
        
        // Force a resize event to trigger the map redraw
        window.dispatchEvent(new Event('resize'));
      }
    }
  }, [isBackground]);

  return (
    <div className={`relative ${className}`}>
      <div ref={wrapperRef} className="w-full h-full min-h-[400px]">
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-10 dark:bg-black dark:bg-opacity-30">
            <div className="animate-spin h-8 w-8 border-4 border-blue-500 rounded-full border-t-transparent"></div>
          </div>
        )}
        
        {error && (
          <div className="absolute inset-0 flex items-center justify-center">
            <Card>
              <CardContent className="p-4">
                <p className="text-red-500">Error: {error}</p>
              </CardContent>
            </Card>
          </div>
        )}
        
        <svg ref={svgRef} className="w-full h-full"></svg>
        <div ref={tooltipRef} className="tooltip"></div>
      </div>
      
      {/* Controls - only show when not in background mode */}
      {!isBackground && (
        <div className="absolute bottom-4 right-4 z-10">
          <Card className="w-[320px]">
            <CardContent className="p-4">
              <Tabs.Root defaultValue="year" className="flex flex-col gap-4">
                <Tabs.List className="flex border-b">
                  <Tabs.Trigger value="year" className="px-4 py-2 text-sm font-medium border-b-2 border-transparent data-[state=active]:border-blue-500">
                    Year
                  </Tabs.Trigger>
                  <Tabs.Trigger value="metric" className="px-4 py-2 text-sm font-medium border-b-2 border-transparent data-[state=active]:border-blue-500">
                    Metric
                  </Tabs.Trigger>
                </Tabs.List>
                
                <Tabs.Content value="year" className="p-2">
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-medium">Select Year</label>
                    <Select.Root value={selectedYear} onValueChange={(value: MapYear) => setSelectedYear(value)}>
                      <Select.Trigger className="flex items-center justify-between w-full px-3 py-2 border rounded-md shadow-sm">
                        <Select.Value />
                        <Select.Icon>
                          <ChevronDownIcon />
                        </Select.Icon>
                      </Select.Trigger>
                      
                      <Select.Portal>
                        <Select.Content className="overflow-hidden bg-white dark:bg-zinc-800 rounded-md shadow-lg">
                          <Select.Viewport className="p-1">
                            <Select.Item value="all" className="flex items-center h-8 px-2 py-6 text-sm rounded-md cursor-pointer hover:bg-gray-100 dark:hover:bg-zinc-700 data-[highlighted]:bg-gray-100 dark:data-[highlighted]:bg-zinc-700">
                              <Select.ItemText>All Years</Select.ItemText>
                              <Select.ItemIndicator className="ml-auto">
                                <CheckIcon />
                              </Select.ItemIndicator>
                            </Select.Item>
                            <Select.Item value="2023" className="flex items-center h-8 px-2 py-6 text-sm rounded-md cursor-pointer hover:bg-gray-100 dark:hover:bg-zinc-700 data-[highlighted]:bg-gray-100 dark:data-[highlighted]:bg-zinc-700">
                              <Select.ItemText>2023</Select.ItemText>
                              <Select.ItemIndicator className="ml-auto">
                                <CheckIcon />
                              </Select.ItemIndicator>
                            </Select.Item>
                            <Select.Item value="2022" className="flex items-center h-8 px-2 py-6 text-sm rounded-md cursor-pointer hover:bg-gray-100 dark:hover:bg-zinc-700 data-[highlighted]:bg-gray-100 dark:data-[highlighted]:bg-zinc-700">
                              <Select.ItemText>2022</Select.ItemText>
                              <Select.ItemIndicator className="ml-auto">
                                <CheckIcon />
                              </Select.ItemIndicator>
                            </Select.Item>
                            <Select.Item value="2021" className="flex items-center h-8 px-2 py-6 text-sm rounded-md cursor-pointer hover:bg-gray-100 dark:hover:bg-zinc-700 data-[highlighted]:bg-gray-100 dark:data-[highlighted]:bg-zinc-700">
                              <Select.ItemText>2021</Select.ItemText>
                              <Select.ItemIndicator className="ml-auto">
                                <CheckIcon />
                              </Select.ItemIndicator>
                            </Select.Item>
                            <Select.Item value="2020" className="flex items-center h-8 px-2 py-6 text-sm rounded-md cursor-pointer hover:bg-gray-100 dark:hover:bg-zinc-700 data-[highlighted]:bg-gray-100 dark:data-[highlighted]:bg-zinc-700">
                              <Select.ItemText>2020</Select.ItemText>
                              <Select.ItemIndicator className="ml-auto">
                                <CheckIcon />
                              </Select.ItemIndicator>
                            </Select.Item>
                            <Select.Item value="2019" className="flex items-center h-8 px-2 py-6 text-sm rounded-md cursor-pointer hover:bg-gray-100 dark:hover:bg-zinc-700 data-[highlighted]:bg-gray-100 dark:data-[highlighted]:bg-zinc-700">
                              <Select.ItemText>2019</Select.ItemText>
                              <Select.ItemIndicator className="ml-auto">
                                <CheckIcon />
                              </Select.ItemIndicator>
                            </Select.Item>
                          </Select.Viewport>
                        </Select.Content>
                      </Select.Portal>
                    </Select.Root>
                  </div>
                </Tabs.Content>
                
                <Tabs.Content value="metric" className="p-2">
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-medium">Select Metric</label>
                    <Select.Root value={selectedMetric} onValueChange={(value: MapMetric) => setSelectedMetric(value)}>
                      <Select.Trigger className="flex items-center justify-between w-full px-3 py-2 border rounded-md shadow-sm">
                        <Select.Value />
                        <Select.Icon>
                          <ChevronDownIcon />
                        </Select.Icon>
                      </Select.Trigger>
                      
                      <Select.Portal>
                        <Select.Content className="overflow-hidden bg-white dark:bg-zinc-800 rounded-md shadow-lg">
                          <Select.Viewport className="p-1">
                            <Select.Item value="total" className="flex items-center h-8 px-2 py-6 text-sm rounded-md cursor-pointer hover:bg-gray-100 dark:hover:bg-zinc-700 data-[highlighted]:bg-gray-100 dark:data-[highlighted]:bg-zinc-700">
                              <Select.ItemText>Total Trade</Select.ItemText>
                              <Select.ItemIndicator className="ml-auto">
                                <CheckIcon />
                              </Select.ItemIndicator>
                            </Select.Item>
                            <Select.Item value="imports" className="flex items-center h-8 px-2 py-6 text-sm rounded-md cursor-pointer hover:bg-gray-100 dark:hover:bg-zinc-700 data-[highlighted]:bg-gray-100 dark:data-[highlighted]:bg-zinc-700">
                              <Select.ItemText>Imports</Select.ItemText>
                              <Select.ItemIndicator className="ml-auto">
                                <CheckIcon />
                              </Select.ItemIndicator>
                            </Select.Item>
                            <Select.Item value="exports" className="flex items-center h-8 px-2 py-6 text-sm rounded-md cursor-pointer hover:bg-gray-100 dark:hover:bg-zinc-700 data-[highlighted]:bg-gray-100 dark:data-[highlighted]:bg-zinc-700">
                              <Select.ItemText>Exports</Select.ItemText>
                              <Select.ItemIndicator className="ml-auto">
                                <CheckIcon />
                              </Select.ItemIndicator>
                            </Select.Item>
                          </Select.Viewport>
                        </Select.Content>
                      </Select.Portal>
                    </Select.Root>
                  </div>
                </Tabs.Content>
              </Tabs.Root>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
} 