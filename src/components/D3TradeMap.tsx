"use client"

import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import { Feature, Geometry, GeoJsonObject } from 'geojson';
import * as Tabs from '@radix-ui/react-tabs';
import * as Select from '@radix-ui/react-select';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChevronDownIcon, CheckIcon, MagnifyingGlassIcon, Cross2Icon } from '@radix-ui/react-icons';
import * as Popover from '@radix-ui/react-popover';
import * as ScrollArea from '@radix-ui/react-scroll-area';
import * as RadioGroup from '@radix-ui/react-radio-group';
import { useTheme } from '@/components/ui/theme-provider';
import { getCountryTradeData, getHSCodeData } from '@/lib/api-utils';
import { CountryTradeItem } from '@/app/map-dashboard/types';
import { formatNumber, formatCurrency } from '@/lib/utils';
import { enhancedCountryCodeConverter, mapCountryNameToAlpha2 } from '@/lib/country-utils';

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

interface WorldData {
  type: string;
  features: CountryFeature[];
}

type HSLevel = 'hs2' | 'hs4' | 'hs6';

type TimePeriod = '2023' | '2022' | '2021' | '2020' | '2019';

// Calculate global trade totals
function calculateGlobalTotals(countries: CountryTradeData[]) {
  return countries.reduce((acc, curr) => {
    acc.imports += curr.imports;
    acc.exports += curr.exports;
    acc.total += curr.total;
    return acc;
  }, { imports: 0, exports: 0, total: 0 });
}

interface D3TradeMapProps {
  onRegionSelect?: (region: string) => void | Promise<void>;
  isBackground?: boolean;
  focusCountry?: string | null;
  onMapReady?: () => void;
  countriesData?: CountryTradeItem[];
}

export function D3TradeMap({ 
  onRegionSelect, 
  isBackground = false, 
  focusCountry = null, 
  onMapReady,
  countriesData = []
}: D3TradeMapProps) {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const tooltipRef = useRef<HTMLDivElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [countries, setCountries] = useState<CountryTradeData[]>([]);
  const [hsData, setHSData] = useState<HSData>({ hs2: [], hs4: [], hs6: [] });
  const [selectedHSLevel, setSelectedHSLevel] = useState<HSLevel>('hs2');
  const [selectedHSCode, setSelectedHSCode] = useState<string | null>(null);
  const [hoveredCountry, setHoveredCountry] = useState<string | null>(null);
  const [selectedCountry, setSelectedCountry] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedTimePeriod, setSelectedTimePeriod] = useState<TimePeriod>('2023');
  const [historicalData, setHistoricalData] = useState<Record<TimePeriod, CountryTradeData[]>>({
    '2023': [],
    '2022': [],
    '2021': [],
    '2020': [],
    '2019': []
  });
  const [globalTotals, setGlobalTotals] = useState({ imports: 0, exports: 0, total: 0 });
  const [mapWidth, setMapWidth] = useState(0);
  const [mapHeight, setMapHeight] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [compareMode, setCompareMode] = useState<boolean>(false);
  const [comparisonYear, setComparisonYear] = useState<TimePeriod | null>(null);
  const { theme } = useTheme();
  const zoomRef = useRef<d3.ZoomBehavior<Element, unknown> | null>(null);

  const [currentRegions, setCurrentRegions] = useState<d3.Selection<Element, unknown, null, undefined> | null>(null);
  const [selectedRegion, setSelectedRegion] = useState<string | null>(null);

  // Fetch country trade data
  useEffect(() => {
    async function fetchCountryData() {
      try {
        setIsLoading(true);
        // Use cached data fetching utility instead of direct fetch
        const data = await getCountryTradeData(selectedTimePeriod);
        
        // Update both the current countries and the historical data
        setCountries(data);
        setHistoricalData(prev => ({
          ...prev,
          [selectedTimePeriod]: data
        }));
        
        setGlobalTotals(calculateGlobalTotals(data));
        setError(null);
      } catch (error) {
        console.error('Error fetching country data:', error);
        setError('Failed to load country data. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    }

    fetchCountryData();
  }, [selectedTimePeriod]);

  // Fetch HS code data
  useEffect(() => {
    async function fetchHSData() {
      try {
        // Use cached data fetching utility instead of direct fetch
        const data = await getHSCodeData();
        setHSData(data);
      } catch (error) {
        console.error('Error fetching HS code data:', error);
        // We don't set the main error state here since the country data is more important
      }
    }

    fetchHSData();
  }, []);

  // Initialize and update D3 map
  useEffect(() => {
    if (!svgRef.current || !wrapperRef.current) return;

    const wrapper = d3.select(wrapperRef.current);
    const svg = d3.select(svgRef.current);
    
    // Clear previous content
    svg.selectAll("*").remove();

    // Get dimensions
    const width = wrapperRef.current.clientWidth;
    const height = width * 0.5; // Maintain aspect ratio
    setMapWidth(width);
    setMapHeight(height);

    svg.attr("width", width)
       .attr("height", height);

    // Create projection
    const projection = d3.geoMercator()
      .scale(width / 6.5)
      .center([0, 20])
      .translate([width / 2, height / 2]);

    // Create path generator
    const pathGenerator = d3.geoPath().projection(projection);

    // Check if dark mode is active
    const isDarkMode = document.documentElement.classList.contains('dark');

    // Create zoom behavior
    const zoom = d3.zoom<Element, unknown>()
      .scaleExtent([1, 8])
      .on("zoom", (event) => {
        svg.selectAll("path")
          .attr("transform", event.transform);
      });

    svg.call(zoom as any);

    // Store zoom behavior in a ref for access in other effects
    zoomRef.current = zoom;
    
    // Ensure d3MapInstance is available globally
    window.d3MapInstance = {
      zoomIn: () => {
        if (svgRef.current && zoomRef.current) {
          console.log("Zooming in");
          const currentTransform = d3.zoomTransform(svgRef.current);
          const newScale = currentTransform.k * 1.5;
          
          d3.select(svgRef.current)
            .transition()
            .duration(300)
            .call(
              (zoomRef.current as any).transform,
              d3.zoomIdentity
                .translate(currentTransform.x, currentTransform.y)
                .scale(newScale)
            );
        } else {
          console.warn("Cannot zoom in - SVG or zoomRef not available");
        }
      },
      zoomOut: () => {
        if (svgRef.current && zoomRef.current) {
          console.log("Zooming out");
          const currentTransform = d3.zoomTransform(svgRef.current);
          const newScale = currentTransform.k / 1.5;
          
          d3.select(svgRef.current)
            .transition()
            .duration(300)
            .call(
              (zoomRef.current as any).transform,
              d3.zoomIdentity
                .translate(currentTransform.x, currentTransform.y)
                .scale(newScale > 1 ? newScale : 1)
            );
        } else {
          console.warn("Cannot zoom out - SVG or zoomRef not available");
        }
      },
      resetZoom: () => {
        if (svgRef.current && zoomRef.current) {
          console.log("Resetting zoom");
          d3.select(svgRef.current)
            .transition()
            .duration(500)
            .call(
              (zoomRef.current as any).transform,
              d3.zoomIdentity
            );
        } else {
          console.warn("Cannot reset zoom - SVG or zoomRef not available");
        }
      }
    };

    console.log("Zoom methods initialized on window.d3MapInstance");

    // Load world map data
    d3.json<WorldData>('/data/world-countries.json').then(worldData => {
      if (!worldData) return;

      // Create country name to ISO code mapping 
      const countryNameToIso: Record<string, string> = {};
      
      // Function to map country names to ISO codes
      const mapCountryNameToIso = (feature: CountryFeature): string | null => {
        // First check if feature has an ID (which is usually the alpha-3 code)
        if (feature.id) {
          // Convert alpha-3 to alpha-2
          const alpha2 = enhancedCountryCodeConverter(feature.id as string, 'alpha3', 'alpha2');
          if (alpha2 && alpha2.length === 2) {
            return alpha2;
          }
        }
        
        // If no ID or conversion failed, try name-based mapping
        const name = feature.properties.name;
        
        // Use our utility function first
        const alpha2 = mapCountryNameToAlpha2(name);
        if (alpha2) {
          return alpha2;
        }
        
        return null;
      };
      
      // Create the mapping
      worldData.features.forEach(feature => {
        const iso = mapCountryNameToIso(feature);
        if (iso) {
          countryNameToIso[feature.properties.name] = iso;
        }
      });

      // Find max trade value for color scale
      let maxTradeValue = 0;
      if (countriesData && countriesData.length > 0) {
        maxTradeValue = Math.max(...countriesData.map(d => d.total_trade));
      } else if (countries.length > 0) {
        maxTradeValue = Math.max(...countries.map(d => d.total));
      }
      
      // Use a sequential color scale with customized domain for better visualization
      const colorScale = d3.scaleSequential(d3.interpolateBlues)
        .domain([0, maxTradeValue]);
      
      // Create a logarithmic scale for better distribution of colors
      const logScale = d3.scaleSymlog()
        .domain([1, maxTradeValue])
        .range([0.1, 1]);
      
      // Draw map
      svg.selectAll<SVGPathElement, CountryFeature>("path")
        .data(worldData.features)
        .enter()
        .append("path")
        .attr("d", feature => pathGenerator(feature as any))
        .attr("class", "country") // Add a class for easier selection
        .attr("fill", (feature) => {
          const countryName = feature.properties.name;
          
          // Get the ID from the feature - this is usually the alpha-3 code
          const countryId = feature.id as string;
          
          // Convert the alpha-3 code to alpha-2 for API data lookup
          const alpha2Code = countryId ? enhancedCountryCodeConverter(countryId, 'alpha3', 'alpha2') : null;
          
          // If using countries trade API data
          if (countriesData && countriesData.length > 0 && alpha2Code) {
            const apiCountry = countriesData.find(c => c.country === alpha2Code);
            if (apiCountry && apiCountry.total_trade > 0) {
              return d3.interpolateBlues(logScale(apiCountry.total_trade));
            }
          } 
          // Try a simple name mapping as fallback
          else if (countryNameToIso[countryName]) {
            const countryIso = countryNameToIso[countryName];
            if (countriesData && countriesData.length > 0) {
              const apiCountry = countriesData.find(c => c.country === countryIso);
              if (apiCountry && apiCountry.total_trade > 0) {
                return d3.interpolateBlues(logScale(apiCountry.total_trade));
              }
            }
            
            // Fallback to original data with name mapping
            const countryData = countries.find(c => c.country === countryName);
            if (countryData && countryData.total > 0) {
              return d3.interpolateBlues(logScale(countryData.total));
            }
          }
          // Final fallback to original data
          else {
            const countryData = countries.find(c => c.country === countryName);
            if (countryData && countryData.total > 0) {
              return d3.interpolateBlues(logScale(countryData.total));
            }
          }
          
          // Use different default color for dark mode
          return isDarkMode ? "#2a2a2a" : "#f0f0f0";
        })
        .attr("stroke", isDarkMode ? "#444" : "#fff")
        .attr("stroke-width", 0.5)
        .on("mouseover", function(event, feature) {
          const countryName = feature.properties.name;
          const countryId = feature.id as string;
          const alpha2Code = countryId ? enhancedCountryCodeConverter(countryId, 'alpha3', 'alpha2') : null;
          const countryIso = alpha2Code || mapCountryNameToIso(feature);
          
          setHoveredCountry(countryName);
          
          d3.select(this)
            .attr("stroke", "#333")
            .attr("stroke-width", 1.5);
          
          handleCountryHover(this, countryName, countryIso, event, feature);
        })
        .on("mouseout", function() {
          setHoveredCountry(null);
          
          d3.select(this)
            .attr("stroke", isDarkMode ? "#444" : "#fff")
            .attr("stroke-width", 0.5);
          
          if (tooltipRef.current) {
            d3.select(tooltipRef.current).style("opacity", 0);
          }
        })
        .on("click", async function(event, feature) {
          event.stopPropagation(); // Prevent event bubbling
          
          // Handle country click
          const countryName = feature.properties.name;
          console.log("Map clicked on country:", countryName);
          
          // Highlight the selected country
          svg.selectAll("path.country")
            .attr("stroke-width", 0.5)
            .attr("stroke", isDarkMode ? "#444" : "#fff");
            
          d3.select(this)
            .attr("stroke", "#ff6b6b")
            .attr("stroke-width", 2);
          
          // Set selected country in state
          setSelectedCountry(countryName);
          
          // Notify the parent component about the country selection
          if (onRegionSelect) {
            console.log("Notifying parent about country selection:", countryName);
            await onRegionSelect(countryName);
          }
        });
      
      // Add a color legend
      const legendWidth = 200;
      const legendHeight = 20;
      const legendX = width - legendWidth - 20;
      const legendY = height - 50;
      
      // Create gradient for legend
      const defs = svg.append("defs");
      const linearGradient = defs.append("linearGradient")
        .attr("id", "trade-gradient")
        .attr("x1", "0%")
        .attr("y1", "0%")
        .attr("x2", "100%")
        .attr("y2", "0%");
      
      // Add gradient stops
      linearGradient.append("stop")
        .attr("offset", "0%")
        .attr("stop-color", d3.interpolateBlues(0.1));
        
      linearGradient.append("stop")
        .attr("offset", "25%")
        .attr("stop-color", d3.interpolateBlues(0.25));
        
      linearGradient.append("stop")
        .attr("offset", "50%")
        .attr("stop-color", d3.interpolateBlues(0.5));
        
      linearGradient.append("stop")
        .attr("offset", "75%")
        .attr("stop-color", d3.interpolateBlues(0.75));
        
      linearGradient.append("stop")
        .attr("offset", "100%")
        .attr("stop-color", d3.interpolateBlues(1));
      
      // Create rectangle with gradient
      svg.append("rect")
        .attr("x", legendX)
        .attr("y", legendY)
        .attr("width", legendWidth)
        .attr("height", legendHeight)
        .style("fill", "url(#trade-gradient)");
      
      // Add legend title
      svg.append("text")
        .attr("x", legendX)
        .attr("y", legendY - 5)
        .attr("font-size", "10px")
        .attr("fill", isDarkMode ? "#e0e0e0" : "#333")
        .text("Total Trade Volume");
      
      // Create more informative legend labels
      // Format large numbers with suffix
      const formatNumber = (num: number) => {
        if (num >= 1e12) return `$${(num / 1e12).toFixed(1)}T`;
        if (num >= 1e9) return `$${(num / 1e9).toFixed(1)}B`;
        if (num >= 1e6) return `$${(num / 1e6).toFixed(1)}M`;
        if (num >= 1e3) return `$${(num / 1e3).toFixed(1)}K`;
        return `$${num.toFixed(0)}`;
      };
      
      // Add multiple ticks to the legend
      const ticks = [0, maxTradeValue * 0.25, maxTradeValue * 0.5, maxTradeValue * 0.75, maxTradeValue];
      ticks.forEach((tick, i) => {
        const x = legendX + (legendWidth * i / (ticks.length - 1));
        
        // Add tick mark
        svg.append("line")
          .attr("x1", x)
          .attr("x2", x)
          .attr("y1", legendY + legendHeight)
          .attr("y2", legendY + legendHeight + 4)
          .attr("stroke", isDarkMode ? "#e0e0e0" : "#333")
          .attr("stroke-width", 1);
        
        // Add label
        svg.append("text")
          .attr("x", x)
          .attr("y", legendY + legendHeight + 15)
          .attr("font-size", "8px")
          .attr("text-anchor", i === 0 ? "start" : i === ticks.length - 1 ? "end" : "middle")
          .attr("fill", isDarkMode ? "#e0e0e0" : "#333")
          .text(formatNumber(tick));
      });

      // Effect to handle focusing on a country when focusCountry prop changes
      if (focusCountry && countries.length > 0) {
        setTimeout(() => {
          try {
            // Find the selected country on the map
            const countryElement = svg.selectAll('path.country')
              .filter(function(d: any) {
                return d.properties?.name === focusCountry;
              });
            
            if (!countryElement.empty()) {
              // Highlight the country
              svg.selectAll("path.country")
                .attr("stroke-width", 0.5)
                .attr("stroke", isDarkMode ? "#444" : "#fff")
                .classed("country-selected", false);
              
              countryElement
                .attr("stroke", "#ff6b6b")
                .attr("stroke-width", 2)
                .classed("country-selected", true);
              
              // Get the bounds of the selected country
              const bounds = pathGenerator.bounds(countryElement.datum() as any);
              
              // Calculate scale and translate to zoom to the country
              const dx = bounds[1][0] - bounds[0][0];
              const dy = bounds[1][1] - bounds[0][1];
              const x = (bounds[0][0] + bounds[1][0]) / 2;
              const y = (bounds[0][1] + bounds[1][1]) / 2;
              
              // Limit the scale to reasonable values
              const scale = Math.max(1, Math.min(8, 0.9 / Math.max(dx / width, dy / height)));
              const translate = [width / 2 - scale * x, height / 2 - scale * y];
              
              // Apply the zoom transformation using d3 zoom transform
              wrapper.transition()
                .duration(750)
                .call(zoom.transform as any, d3.zoomIdentity
                  .translate(translate[0], translate[1])
                  .scale(scale));
              
              // Set selected country in state
              setSelectedCountry(focusCountry);
            }
          } catch (err) {
            console.error("Error focusing on country:", err);
          }
        }, 300);
      } else if (focusCountry === null) {
        // Reset zoom if focusCountry is cleared
        svg.selectAll("path.country")
          .attr("stroke-width", 0.5)
          .attr("stroke", isDarkMode ? "#444" : "#fff")
          .classed("country-selected", false);
        
        // Reset the zoom
        wrapper.transition()
          .duration(750)
          .call(zoom.transform as any, d3.zoomIdentity);
        
        // Reset selected country state
        setSelectedCountry(null);
      }

      // Notify that the map is ready
      if (onMapReady) {
        // Ensure zoom methods are still available before notifying parent
        if (!window.d3MapInstance) {
          console.warn("Re-initializing d3MapInstance before notifying parent");
          // Re-initialize if somehow it got lost
          window.d3MapInstance = {
            zoomIn: () => {
              if (svgRef.current && zoomRef.current) {
                const currentTransform = d3.zoomTransform(svgRef.current);
                const newScale = currentTransform.k * 1.5;
                
                d3.select(svgRef.current)
                  .transition()
                  .duration(300)
                  .call(
                    (zoomRef.current as any).transform,
                    d3.zoomIdentity
                      .translate(currentTransform.x, currentTransform.y)
                      .scale(newScale)
                  );
              }
            },
            zoomOut: () => {
              if (svgRef.current && zoomRef.current) {
                const currentTransform = d3.zoomTransform(svgRef.current);
                const newScale = currentTransform.k / 1.5;
                
                d3.select(svgRef.current)
                  .transition()
                  .duration(300)
                  .call(
                    (zoomRef.current as any).transform,
                    d3.zoomIdentity
                      .translate(currentTransform.x, currentTransform.y)
                      .scale(newScale > 1 ? newScale : 1)
                  );
              }
            },
            resetZoom: () => {
              if (svgRef.current && zoomRef.current) {
                d3.select(svgRef.current)
                  .transition()
                  .duration(500)
                  .call(
                    (zoomRef.current as any).transform,
                    d3.zoomIdentity
                  );
              }
            }
          };
        }
        
        console.log("Notifying parent that map is ready");
        onMapReady();
      }
    }).catch(error => {
      console.error('Error loading world map data:', error);
      setError('Failed to load map data. Please try again later.');
    });

    // Cleanup function to store the zoom behavior for other effects
    return () => {
      // Store the zoom reference for use in other effects
      (window as any).__d3ZoomRef = zoom;
    };
  }, [countriesData, countries, selectedHSCode, selectedCountry, focusCountry, theme, isLoading]);

  // Handle country hover to display tooltip
  const handleCountryHover = (
    element: SVGPathElement,
    countryName: string,
    countryIso: string | null,
    event: any,
    feature: CountryFeature
  ) => {
    if (!tooltipRef.current || !wrapperRef.current) return;
    
    const tooltip = d3.select(tooltipRef.current);
    
    // Get country data based on API data if available, fallback to internal data
    let countryData: CountryTradeData | CountryTradeItem | null = null;
    
    if (countriesData && countriesData.length > 0 && countryIso) {
      // Try to find this country in the API data by alpha-2 code
      const apiCountry = countriesData.find(c => c.country === countryIso);
      if (apiCountry) {
        countryData = apiCountry;
      }
      
      // If not found, try by feature ID (alpha-3 code) and convert to alpha-2
      if (!countryData && feature.id) {
        const alpha2Code = enhancedCountryCodeConverter(feature.id as string, 'alpha3', 'alpha2');
        const apiCountryById = countriesData.find(c => c.country === alpha2Code);
        if (apiCountryById) {
          countryData = apiCountryById;
        }
      }
    }
    
    // Fallback to internal data if no API data found
    if (!countryData) {
      const internalCountry = countries.find(c => c.country === countryName);
      if (internalCountry) {
        countryData = internalCountry;
      }
    }
    
    // Calculate tooltip position
    const rect = element.getBoundingClientRect();
    const wrapperRect = wrapperRef.current.getBoundingClientRect();
    
    const x = rect.x + rect.width / 2 - wrapperRect.x;
    const y = rect.y + rect.height / 2 - wrapperRect.y;
    
    // Set tooltip content and position
    tooltip
      .style("left", `${x}px`)
      .style("top", `${y}px`)
      .style("opacity", 1);
    
    // Format tooltip content
    if (countryData) {
      // Format numbers with commas
      const formatNumber = (num: number) => {
        return new Intl.NumberFormat('en-US', {
          style: 'currency',
          currency: 'USD',
          maximumFractionDigits: 0,
          notation: 'compact',
          compactDisplay: 'short'
        }).format(num);
      };
      
      // Calculate trade balance
      let imports = 0;
      let exports = 0;
      let total = 0;
      
      // Check if it's API data (CountryTradeItem) or internal data (CountryTradeData)
      if ('total_trade' in countryData) {
        imports = countryData.imports;
        exports = countryData.exports;
        total = countryData.total_trade;
      } else {
        imports = countryData.imports;
        exports = countryData.exports;
        total = countryData.total;
      }
      
      const balance = exports - imports;
      const balanceClass = balance >= 0 ? 'text-green-500' : 'text-red-500';
      
      // Update tooltip content
      tooltip.html(`
        <div class="font-bold">${countryName}</div>
        <div class="grid grid-cols-2 gap-2 mt-1">
          <div>Total Trade:</div>
          <div class="text-right">${formatNumber(total)}</div>
          <div>Imports:</div>
          <div class="text-right">${formatNumber(imports)}</div>
          <div>Exports:</div>
          <div class="text-right">${formatNumber(exports)}</div>
          <div>Balance:</div>
          <div class="text-right ${balanceClass}">${formatNumber(balance)}</div>
        </div>
      `);
    } else {
      tooltip.html(`
        <div class="font-bold">${countryName}</div>
        <div class="text-sm mt-1">No trade data available</div>
      `);
    }
  };

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      if (wrapperRef.current && svgRef.current) {
        const width = wrapperRef.current.clientWidth;
        const height = width * 0.5;
        setMapWidth(width);
        setMapHeight(height);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Handle HS code selection
  const handleHSCodeSelect = (code: string) => {
    setSelectedHSCode(code === selectedHSCode ? null : code);
  };

  // Reset HS filter
  const resetHSFilter = () => {
    setSelectedHSCode(null);
  };

  // Filter countries based on search query
  const filteredCountries = searchQuery 
    ? countries.filter(c => c.country.toLowerCase().includes(searchQuery.toLowerCase()))
    : [];

  // Handle country selection from search
  const handleCountrySelect = async (country: string) => {
    setSelectedCountry(country);
    // Clear search after selection
    setSearchQuery('');
    
    // Highlight the country on the map
    if (svgRef.current) {
      d3.select(svgRef.current)
        .selectAll("path")
        .attr("stroke-width", 0.5)
        .attr("stroke", "#fff")
        .filter(function(d: any) {
          return d.properties?.name === country;
        })
        .attr("stroke", "#ff6b6b")
        .attr("stroke-width", 2);
    }
    
    // Add this line to pass the selected country to the parent component
    if (onRegionSelect) {
      await onRegionSelect(country);
    }
  };

  // Clear country selection
  const clearCountrySelection = () => {
    setSelectedCountry(null);
    if (svgRef.current) {
      d3.select(svgRef.current)
        .selectAll("path")
        .attr("stroke", "#fff")
        .attr("stroke-width", 0.5);
    }
  };

  // Create sidebar charts
  const renderSidebarCharts = () => {
    if (countries.length === 0) return null;

    // Sort countries by total trade value
    const topCountries = [...countries]
      .sort((a, b) => b.total - a.total)
      .slice(0, 5);

    // Calculate import/export balance
    const tradeBalance = {
      imports: globalTotals.imports,
      exports: globalTotals.exports
    };

    return (
      <div className="space-y-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Top Trading Countries</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[200px]">
              {topCountries.map((country, index) => (
                <div 
                  key={country.id} 
                  className="flex items-center mb-2"
                  onMouseEnter={() => setHoveredCountry(country.country)}
                  onMouseLeave={() => setHoveredCountry(null)}
                >
                  <div className="w-24 truncate">{country.country}</div>
                  <div className="flex-1 h-4 bg-muted rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-primary rounded-full"
                      style={{ width: `${(country.total / topCountries[0].total) * 100}%` }}
                    ></div>
                  </div>
                  <div className="w-20 text-right text-sm">${country.total.toLocaleString()}</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Import/Export Balance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[200px]">
              <div className="flex h-full items-end">
                <div className="flex-1 flex flex-col items-center">
                  <div className="text-sm mb-1">Imports</div>
                  <div 
                    className="w-16 bg-destructive rounded-t-md"
                    style={{ 
                      height: `${(tradeBalance.imports / Math.max(tradeBalance.imports, tradeBalance.exports)) * 150}px` 
                    }}
                  ></div>
                  <div className="text-sm mt-1">${tradeBalance.imports.toLocaleString()}</div>
                </div>
                <div className="flex-1 flex flex-col items-center">
                  <div className="text-sm mb-1">Exports</div>
                  <div 
                    className="w-16 bg-primary rounded-t-md"
                    style={{ 
                      height: `${(tradeBalance.exports / Math.max(tradeBalance.imports, tradeBalance.exports)) * 150}px` 
                    }}
                  ></div>
                  <div className="text-sm mt-1">${tradeBalance.exports.toLocaleString()}</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {hoveredCountry && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">{hoveredCountry} Details</CardTitle>
            </CardHeader>
            <CardContent>
              {(() => {
                const countryData = countries.find(c => c.country === hoveredCountry);
                if (!countryData) return <div>No data available</div>;
                
                const comparisonData = compareMode ? getComparisonData(hoveredCountry) : null;
                
                return (
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Imports:</span>
                      <div className="flex items-center">
                        <span>${countryData.imports.toLocaleString()}</span>
                        {comparisonData && (
                          <span className={`ml-2 text-xs ${comparisonData.importsGrowth >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                            {comparisonData.importsGrowth >= 0 ? '↑' : '↓'} 
                            {Math.abs(comparisonData.importsGrowth).toFixed(1)}%
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex justify-between">
                      <span>Exports:</span>
                      <div className="flex items-center">
                        <span>${countryData.exports.toLocaleString()}</span>
                        {comparisonData && (
                          <span className={`ml-2 text-xs ${comparisonData.exportsGrowth >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                            {comparisonData.exportsGrowth >= 0 ? '↑' : '↓'} 
                            {Math.abs(comparisonData.exportsGrowth).toFixed(1)}%
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex justify-between font-medium">
                      <span>Total Trade:</span>
                      <div className="flex items-center">
                        <span>${countryData.total.toLocaleString()}</span>
                        {comparisonData && (
                          <span className={`ml-2 text-xs ${comparisonData.totalGrowth >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                            {comparisonData.totalGrowth >= 0 ? '↑' : '↓'} 
                            {Math.abs(comparisonData.totalGrowth).toFixed(1)}%
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="mt-2">
                      <div className="text-sm font-medium mb-1">Trade Balance</div>
                      <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <div 
                          className={`h-full ${countryData.exports > countryData.imports ? 'bg-primary' : 'bg-destructive'} rounded-full`}
                          style={{ 
                            width: `${Math.abs(countryData.exports - countryData.imports) / countryData.total * 100}%`,
                            marginLeft: countryData.exports > countryData.imports ? '50%' : '0'
                          }}
                        ></div>
                      </div>
                      <div className="flex justify-between text-xs mt-1">
                        <span>Import Dominant</span>
                        <span>Export Dominant</span>
                      </div>
                    </div>
                  </div>
                );
              })()}
            </CardContent>
          </Card>
        )}
      </div>
    );
  };

  // Calculate growth percentages between two time periods
  const calculateGrowth = (currentValue: number, previousValue: number): number => {
    if (previousValue === 0) return 0;
    return ((currentValue - previousValue) / previousValue) * 100;
  };

  // Get comparison data for a country
  const getComparisonData = (countryName: string) => {
    if (!comparisonYear) return null;
    
    const currentData = countries.find(c => c.country === countryName);
    const previousData = historicalData[comparisonYear]?.find(c => c.country === countryName);
    
    if (!currentData || !previousData) return null;
    
    return {
      importsGrowth: calculateGrowth(currentData.imports, previousData.imports),
      exportsGrowth: calculateGrowth(currentData.exports, previousData.exports),
      totalGrowth: calculateGrowth(currentData.total, previousData.total)
    };
  };

  // Toggle comparison mode
  const toggleComparisonMode = () => {
    if (compareMode) {
      setCompareMode(false);
      setComparisonYear(null);
    } else {
      setCompareMode(true);
      // Default to previous year
      const years: TimePeriod[] = ['2023', '2022', '2021', '2020', '2019'];
      const currentIndex = years.indexOf(selectedTimePeriod);
      if (currentIndex < years.length - 1) {
        setComparisonYear(years[currentIndex + 1]);
      } else {
        setComparisonYear('2022');
      }
    }
  };

  // Add a theme change listener to redraw the map when the theme changes
  useEffect(() => {
    // This will trigger the map redraw when the theme changes
    if (countries.length > 0 && svgRef.current && wrapperRef.current) {
      // Force redraw by triggering the map initialization effect
      const event = new Event('resize');
      window.dispatchEvent(event);
    }
  }, [theme, countries]);

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

  // Handle zoom event
  const handleZoom = (event: d3.D3ZoomEvent<Element, unknown>) => {
    if (!svgRef.current) return;
    
    // Apply the transform to all paths instead of a 'g' element
    d3.select(svgRef.current).selectAll("path")
      .attr("transform", event.transform.toString());
  };

  // Create D3 zoom behavior
  useEffect(() => {
    if (!svgRef.current || !wrapperRef.current) return;
    
    console.log("Setting up zoom behavior");
    
    // Set up zoom behavior
    const zoom = d3.zoom<Element, unknown>()
      .scaleExtent([1, 8])
      .on('zoom', handleZoom);
    
    // Store the zoom behavior in the ref
    zoomRef.current = zoom;
    
    // Apply zoom behavior to SVG
    d3.select(svgRef.current)
      .call(zoom as any);
    
    // Don't expose zoom methods here - they'll be exposed after the map is loaded
    
    return () => {
      // Only clean up when component unmounts completely
      console.log("Cleaning up zoom behavior");
    };
  }, []);

  // Render loading state
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="md:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Global Trade Map</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-center h-[400px]">
                <div className="text-center">
                  <div className="mb-4">Loading trade data...</div>
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        <div className="md:col-span-1">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Loading Data</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[200px] flex items-center justify-center">
                <div className="text-center text-sm text-muted-foreground">
                  Loading trade statistics...
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Render error state
  if (error) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="md:col-span-3">
          <Card>
            <CardHeader>
              <CardTitle>Error Loading Data</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-center h-[300px]">
                <div className="text-center">
                  <div className="text-red-500 mb-4">{error}</div>
                  <button 
                    className="px-4 py-2 bg-primary text-primary-foreground rounded-md"
                    onClick={() => window.location.reload()}
                  >
                    Retry
                  </button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Modify the return statement for background mode
  if (isBackground) {
    return (
      <div ref={wrapperRef} className="w-full h-full relative">
        <svg ref={svgRef} className="w-full h-full"></svg>
        <div 
          ref={tooltipRef} 
          className="absolute p-2 bg-background/90 backdrop-blur-sm rounded shadow-md border border-border text-sm pointer-events-none opacity-0 transition-opacity z-10"
        >
          <div className="font-semibold"></div>
          <div className="text-muted-foreground"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div className="md:col-span-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex justify-between items-center">
              Global Trade Map
              <div className="flex gap-2">
                <Popover.Root>
                  <Popover.Trigger asChild>
                    <button className="inline-flex items-center justify-center rounded-md px-3 py-2 text-sm border border-input bg-background h-9">
                      <MagnifyingGlassIcon className="mr-2 h-4 w-4" />
                      Search Countries
                    </button>
                  </Popover.Trigger>
                  <Popover.Portal>
                    <Popover.Content
                      className="w-[300px] p-4 rounded-md border bg-popover text-popover-foreground shadow-md animate-in fade-in-80"
                      sideOffset={5}
                    >
                      <div className="flex flex-col gap-4">
                        <div>
                          <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search for a country..."
                            className="w-full px-3 py-2 rounded-md border border-input bg-background"
                          />
                        </div>
                        {searchQuery && (
                          <ScrollArea.Root className="max-h-[200px] overflow-y-auto rounded">
                            <ScrollArea.Viewport className="max-h-[200px] w-full rounded">
                              <div className="space-y-1">
                                {filteredCountries.length > 0 ? (
                                  filteredCountries.map((country) => (
                                    <div
                                      key={country.id}
                                      className="p-2 hover:bg-accent hover:text-accent-foreground rounded cursor-pointer"
                                      onClick={() => handleCountrySelect(country.country)}
                                    >
                                      {country.country}
                                    </div>
                                  ))
                                ) : (
                                  <div className="p-2 text-muted-foreground">No countries found</div>
                                )}
                              </div>
                            </ScrollArea.Viewport>
                            <ScrollArea.Scrollbar orientation="vertical">
                              <ScrollArea.Thumb />
                            </ScrollArea.Scrollbar>
                          </ScrollArea.Root>
                        )}
                      </div>
                      <Popover.Arrow className="fill-popover" />
                    </Popover.Content>
                  </Popover.Portal>
                </Popover.Root>
                
                {selectedCountry && (
                  <button 
                    className="inline-flex items-center justify-center rounded-md px-3 py-2 text-sm border border-input bg-destructive text-destructive-foreground h-9"
                    onClick={clearCountrySelection}
                  >
                    <Cross2Icon className="mr-2 h-4 w-4" />
                    Clear {selectedCountry}
                  </button>
                )}
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="mb-4 flex justify-between items-center">
              <RadioGroup.Root 
                value={selectedTimePeriod} 
                onValueChange={(value: TimePeriod) => setSelectedTimePeriod(value)}
                className="flex items-center space-x-2"
              >
                <div className="text-sm font-medium mr-2">Time Period:</div>
                {(['2023', '2022', '2021', '2020', '2019'] as TimePeriod[]).map((year) => (
                  <div key={year} className="flex items-center">
                    <RadioGroup.Item
                      value={year}
                      id={`year-${year}`}
                      className="w-4 h-4 rounded-full border border-primary mr-2 flex items-center justify-center data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground"
                    >
                      <RadioGroup.Indicator className="flex items-center justify-center w-2 h-2 relative after:content-[''] after:block after:w-2 after:h-2 after:rounded-full after:bg-white" />
                    </RadioGroup.Item>
                    <label htmlFor={`year-${year}`} className="text-sm">{year}</label>
                  </div>
                ))}
              </RadioGroup.Root>
              
              <div className="flex items-center">
                <div className="mr-2">
                  <label htmlFor="compare-toggle" className="text-sm mr-2">Compare with:</label>
                  <input 
                    type="checkbox" 
                    id="compare-toggle"
                    checked={compareMode}
                    onChange={toggleComparisonMode}
                    className="rounded border-gray-300"
                  />
                </div>
                
                {compareMode && (
                  <Select.Root 
                    value={comparisonYear || '2022'} 
                    onValueChange={(value: TimePeriod) => setComparisonYear(value)}
                  >
                    <Select.Trigger className="inline-flex items-center justify-between rounded-md px-3 py-2 text-sm border border-input bg-background h-9 w-[100px]">
                      <Select.Value />
                      <Select.Icon>
                        <ChevronDownIcon />
                      </Select.Icon>
                    </Select.Trigger>
                    <Select.Portal>
                      <Select.Content className="overflow-hidden rounded-md border bg-popover text-popover-foreground shadow-md animate-in fade-in-80">
                        <Select.Viewport className="p-1">
                          {(['2023', '2022', '2021', '2020', '2019'] as TimePeriod[])
                            .filter(year => year !== selectedTimePeriod)
                            .map(year => (
                              <Select.Item 
                                key={year}
                                value={year} 
                                className="relative flex w-full cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50"
                              >
                                <Select.ItemText>{year}</Select.ItemText>
                                <Select.ItemIndicator className="absolute left-2 inline-flex items-center">
                                  <CheckIcon />
                                </Select.ItemIndicator>
                              </Select.Item>
                            ))
                          }
                        </Select.Viewport>
                      </Select.Content>
                    </Select.Portal>
                  </Select.Root>
                )}
              </div>
            </div>

            <Tabs.Root defaultValue="map" className="w-full">
              <Tabs.List className="flex border-b mb-4">
                <Tabs.Trigger 
                  value="map" 
                  className="px-4 py-2 text-sm font-medium data-[state=active]:border-b-2 data-[state=active]:border-primary"
                >
                  Map View
                </Tabs.Trigger>
                <Tabs.Trigger 
                  value="products" 
                  className="px-4 py-2 text-sm font-medium data-[state=active]:border-b-2 data-[state=active]:border-primary"
                >
                  Product Categories
                </Tabs.Trigger>
              </Tabs.List>
              
              <Tabs.Content value="map" className="focus:outline-none">
                <div className="relative" ref={wrapperRef}>
                  <svg ref={svgRef}></svg>
                  <div 
                    ref={tooltipRef} 
                    className="absolute p-2 bg-background/90 backdrop-blur-sm rounded shadow-md border border-border text-sm pointer-events-none opacity-0 transition-opacity z-10"
                  >
                    <div className="font-semibold"></div>
                    <div className="text-muted-foreground"></div>
                  </div>
                </div>
              </Tabs.Content>
              
              <Tabs.Content value="products" className="focus:outline-none">
                <div className="space-y-4">
                  <div className="flex items-center space-x-4">
                    <div className="text-sm font-medium">HS Level:</div>
                    <Select.Root 
                      value={selectedHSLevel} 
                      onValueChange={(value: HSLevel) => setSelectedHSLevel(value)}
                    >
                      <Select.Trigger className="inline-flex items-center justify-between rounded-md px-3 py-2 text-sm border border-input bg-background h-9 w-[180px]">
                        <Select.Value />
                        <Select.Icon>
                          <ChevronDownIcon />
                        </Select.Icon>
                      </Select.Trigger>
                      <Select.Portal>
                        <Select.Content className="overflow-hidden rounded-md border bg-popover text-popover-foreground shadow-md animate-in fade-in-80">
                          <Select.Viewport className="p-1">
                            <Select.Item value="hs2" className="relative flex w-full cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50">
                              <Select.ItemText>HS2 (2-digit)</Select.ItemText>
                              <Select.ItemIndicator className="absolute left-2 inline-flex items-center">
                                <CheckIcon />
                              </Select.ItemIndicator>
                            </Select.Item>
                            <Select.Item value="hs4" className="relative flex w-full cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50">
                              <Select.ItemText>HS4 (4-digit)</Select.ItemText>
                              <Select.ItemIndicator className="absolute left-2 inline-flex items-center">
                                <CheckIcon />
                              </Select.ItemIndicator>
                            </Select.Item>
                            <Select.Item value="hs6" className="relative flex w-full cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50">
                              <Select.ItemText>HS6 (6-digit)</Select.ItemText>
                              <Select.ItemIndicator className="absolute left-2 inline-flex items-center">
                                <CheckIcon />
                              </Select.ItemIndicator>
                            </Select.Item>
                          </Select.Viewport>
                        </Select.Content>
                      </Select.Portal>
                    </Select.Root>
                  </div>
                  
                  <div className="grid grid-cols-1 gap-2 max-h-[400px] overflow-y-auto">
                    {hsData[selectedHSLevel]?.map((item) => (
                      <div 
                        key={item.code}
                        className={`p-3 rounded-md cursor-pointer transition-colors ${
                          selectedHSCode === item.code 
                            ? 'bg-accent text-accent-foreground' 
                            : 'bg-muted hover:bg-accent hover:text-accent-foreground'
                        }`}
                        onClick={() => handleHSCodeSelect(item.code)}
                      >
                        <div className="flex justify-between">
                          <div className="font-medium">{item.description}</div>
                          <div>${item.value.toLocaleString()}</div>
                        </div>
                        <div className="text-xs text-muted-foreground">HS Code: {item.code}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </Tabs.Content>
            </Tabs.Root>
          </CardContent>
        </Card>
      </div>
      
      <div className="md:col-span-1">
        {renderSidebarCharts()}
      </div>
    </div>
  );
}