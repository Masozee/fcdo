"use client"

import React, { useEffect, useRef, useState, useMemo, useCallback } from 'react';
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
import { getTotalTradeData } from '@/lib/api-utils';
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

// Expand the country code to name mapping
const countryCodeToName: Record<string, string> = {
  // Major trading partners 
  'CN': 'China',
  'US': 'United States of America',
  'JP': 'Japan',
  'DE': 'Germany',
  'GB': 'United Kingdom',
  'FR': 'France',
  'KR': 'South Korea',
  'IT': 'Italy',
  'CA': 'Canada',
  'MX': 'Mexico',
  'IN': 'India',
  'BR': 'Brazil',
  'AU': 'Australia',
  'RU': 'Russia',
  'SG': 'Singapore',
  'NL': 'Netherlands',
  'CH': 'Switzerland',
  'ES': 'Spain',
  'AE': 'United Arab Emirates',
  'VN': 'Vietnam',
  'MY': 'Malaysia',
  'SA': 'Saudi Arabia',
  'BE': 'Belgium',
  'TH': 'Thailand',
  'ID': 'Indonesia',
  'PL': 'Poland',
  'SE': 'Sweden',
  'TR': 'Turkey',
  'PH': 'Philippines',
  'AT': 'Austria',
  'CL': 'Chile',
  'ZA': 'South Africa',
  // Additional countries
  'AF': 'Afghanistan',
  'AL': 'Albania',
  'DZ': 'Algeria',
  'AD': 'Andorra',
  'AO': 'Angola',
  'AG': 'Antigua and Barbuda',
  'AR': 'Argentina',
  'AM': 'Armenia',
  'AZ': 'Azerbaijan',
  'BS': 'Bahamas',
  'BH': 'Bahrain',
  'BD': 'Bangladesh',
  'BB': 'Barbados',
  'BY': 'Belarus',
  'BZ': 'Belize',
  'BJ': 'Benin',
  'BT': 'Bhutan',
  'BO': 'Bolivia',
  'BA': 'Bosnia and Herzegovina',
  'BW': 'Botswana',
  'BN': 'Brunei',
  'BG': 'Bulgaria',
  'BF': 'Burkina Faso',
  'BI': 'Burundi',
  'KH': 'Cambodia',
  'CM': 'Cameroon',
  'CV': 'Cape Verde',
  'CF': 'Central African Republic',
  'TD': 'Chad',
  'CO': 'Colombia',
  'KM': 'Comoros',
  'CG': 'Congo',
  'CD': 'Democratic Republic of the Congo',
  'CR': 'Costa Rica',
  'HR': 'Croatia',
  'CU': 'Cuba',
  'CY': 'Cyprus',
  'CZ': 'Czech Republic',
  'DK': 'Denmark',
  'DJ': 'Djibouti',
  'DM': 'Dominica',
  'DO': 'Dominican Republic',
  'TL': 'East Timor',
  'EC': 'Ecuador',
  'EG': 'Egypt',
  'SV': 'El Salvador',
  'GQ': 'Equatorial Guinea',
  'ER': 'Eritrea',
  'EE': 'Estonia',
  'ET': 'Ethiopia',
  'FJ': 'Fiji',
  'FI': 'Finland',
  'GA': 'Gabon',
  'GM': 'Gambia',
  'GE': 'Georgia',
  'GH': 'Ghana',
  'GR': 'Greece',
  'GD': 'Grenada',
  'GT': 'Guatemala',
  'GN': 'Guinea',
  'GW': 'Guinea-Bissau',
  'GY': 'Guyana',
  'HT': 'Haiti',
  'HN': 'Honduras',
  'HU': 'Hungary',
  'IS': 'Iceland',
  'IR': 'Iran',
  'IQ': 'Iraq',
  'IE': 'Ireland',
  'IL': 'Israel',
  'JM': 'Jamaica',
  'JO': 'Jordan',
  'KZ': 'Kazakhstan',
  'KE': 'Kenya',
  'KI': 'Kiribati',
  'KW': 'Kuwait',
  'KG': 'Kyrgyzstan',
  'LA': 'Laos',
  'LV': 'Latvia',
  'LB': 'Lebanon',
  'LS': 'Lesotho',
  'LR': 'Liberia',
  'LY': 'Libya',
  'LI': 'Liechtenstein',
  'LT': 'Lithuania',
  'LU': 'Luxembourg',
  'MK': 'North Macedonia',
  'MG': 'Madagascar',
  'MW': 'Malawi',
  'MV': 'Maldives',
  'ML': 'Mali',
  'MT': 'Malta',
  'MH': 'Marshall Islands',
  'MR': 'Mauritania',
  'MU': 'Mauritius',
  'MD': 'Moldova',
  'MC': 'Monaco',
  'MN': 'Mongolia',
  'ME': 'Montenegro',
  'MA': 'Morocco',
  'MZ': 'Mozambique',
  'MM': 'Myanmar',
  'NA': 'Namibia',
  'NR': 'Nauru',
  'NP': 'Nepal',
  'NZ': 'New Zealand',
  'NI': 'Nicaragua',
  'NE': 'Niger',
  'NG': 'Nigeria',
  'NO': 'Norway',
  'OM': 'Oman',
  'PK': 'Pakistan',
  'PW': 'Palau',
  'PS': 'Palestine',
  'PA': 'Panama',
  'PG': 'Papua New Guinea',
  'PY': 'Paraguay',
  'PE': 'Peru',
  'PT': 'Portugal',
  'QA': 'Qatar',
  'RO': 'Romania',
  'RW': 'Rwanda',
  'KN': 'Saint Kitts and Nevis',
  'LC': 'Saint Lucia',
  'VC': 'Saint Vincent and the Grenadines',
  'WS': 'Samoa',
  'SM': 'San Marino',
  'ST': 'Sao Tome and Principe',
  'SN': 'Senegal',
  'RS': 'Serbia',
  'SC': 'Seychelles',
  'SL': 'Sierra Leone',
  'SK': 'Slovakia',
  'SI': 'Slovenia',
  'SB': 'Solomon Islands',
  'SO': 'Somalia',
  'SS': 'South Sudan',
  'LK': 'Sri Lanka',
  'SD': 'Sudan',
  'SR': 'Suriname',
  'SZ': 'Eswatini',
  'SY': 'Syria',
  'TJ': 'Tajikistan',
  'TZ': 'Tanzania',
  'TG': 'Togo',
  'TO': 'Tonga',
  'TT': 'Trinidad and Tobago',
  'TN': 'Tunisia',
  'TM': 'Turkmenistan',
  'TV': 'Tuvalu',
  'UG': 'Uganda',
  'UA': 'Ukraine',
  'UY': 'Uruguay',
  'UZ': 'Uzbekistan',
  'VU': 'Vanuatu',
  'VA': 'Vatican City',
  'VE': 'Venezuela',
  'YE': 'Yemen',
  'ZM': 'Zambia',
  'ZW': 'Zimbabwe',
};

// Create a reverse mapping for looking up country code by name
const countryNameToCode: Record<string, string> = Object.entries(countryCodeToName).reduce(
  (acc, [code, name]) => {
    acc[name] = code;
    return acc;
  },
  {} as Record<string, string>
);

// Define common country name variations that may differ between API and GeoJSON
const alternateCountryNames: Record<string, string[]> = {
  'United States of America': ['United States', 'USA', 'US'],
  'United Kingdom': ['UK', 'Great Britain', 'England'],
  'Russia': ['Russian Federation'],
  'South Korea': ['Korea, Republic of', 'Korea', 'Republic of Korea', 'Korea, South'],
  'North Korea': ['Korea, Democratic People\'s Republic of', 'Korea, North', 'Democratic People\'s Republic of Korea'],
  'Syria': ['Syrian Arab Republic'],
  'Tanzania': ['United Republic of Tanzania'],
  'Vietnam': ['Viet Nam'],
  'Venezuela': ['Venezuela, Bolivarian Republic of'],
  'Czechia': ['Czech Republic'],
  'Brunei': ['Brunei Darussalam'],
  'Republic of the Congo': ['Congo'],
  'Democratic Republic of the Congo': ['Congo, Democratic Republic of the', 'DR Congo', 'DRC'],
  'Côte d\'Ivoire': ['Ivory Coast', 'Cote d\'Ivoire'],
  'Macedonia': ['North Macedonia', 'Republic of North Macedonia'],
  'Swaziland': ['Eswatini'],
  'Turkey': ['Türkiye'],
  'Burma': ['Myanmar'],
  'East Timor': ['Timor-Leste'],
  'Laos': ['Lao People\'s Democratic Republic'],
  'Taiwan': ['Taiwan, Province of China'],
  'Iran': ['Iran, Islamic Republic of'],
  'Moldova': ['Moldova, Republic of'],
  'Bolivia': ['Bolivia, Plurinational State of'],
  'China': ['People\'s Republic of China'],
  'The Bahamas': ['Bahamas'],
  'Bosnia and Herzegovina': ['Bosnia'],
  'Cape Verde': ['Cabo Verde'],
  'Micronesia': ['Micronesia, Federated States of'],
};

interface CountryFeature extends Feature {
  properties: {
    name: string;
  };
}

interface TotalTradeItem {
  country: string;
  import_value: number;
  export_value: number;
  total_value: number;
  min_year: string;
  max_year: string;
  trade_count: number;
}

interface TotalTradeResponse {
  tradeSummary: TotalTradeItem[];
  totalCount: number;
  page: number;
  limit: number;
  totalPages: number;
  year: string;
}

interface WorldData {
  type: string;
  features: CountryFeature[];
}

type TimePeriod = '2023' | '2022' | '2021' | '2020' | '2019';

interface TotalTradeMapProps {
  onRegionSelect?: (region: string) => void;
  isBackground?: boolean;
  focusCountry?: string | null;
  onMapReady?: () => void;
}

export function TotalTradeMap({ onRegionSelect, isBackground = false, focusCountry = null, onMapReady }: TotalTradeMapProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const [tradeData, setTradeData] = useState<TotalTradeItem[]>([]);
  const [hoveredCountry, setHoveredCountry] = useState<string | null>(null);
  const [selectedCountry, setSelectedCountry] = useState<TotalTradeItem | null>(null);
  const [selectedTimePeriod, setSelectedTimePeriod] = useState<TimePeriod>('2023');
  const [mapWidth, setMapWidth] = useState(0);
  const [mapHeight, setMapHeight] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { theme } = useTheme();
  const [worldData, setWorldData] = useState<WorldData | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [mapLoadError, setMapLoadError] = useState(false);

  // Fetch total trade data
  useEffect(() => {
    async function fetchTotalTradeData() {
      try {
        setIsLoading(true);
        // Get all trade data at once (no pagination)
        const response: TotalTradeResponse = await getTotalTradeData(selectedTimePeriod);
        setTradeData(response.tradeSummary);
        setError(null);
      } catch (error) {
        console.error('Error fetching total trade data:', error);
        setError('Failed to load total trade data. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    }

    fetchTotalTradeData();
  }, [selectedTimePeriod]);

  // Add a useEffect to load world data
  useEffect(() => {
    console.log("Attempting to load GeoJSON data from /data/world-countries.json");
    
    // Load world map data
    d3.json<WorldData>('/data/world-countries.json')
      .then(data => {
        if (!data) {
          console.error('Failed to load world countries GeoJSON data - data is null');
          setError('Failed to load map data. Please try again later.');
          setMapLoadError(true);
          setIsLoading(false);
          return;
        }

        console.log(`Successfully loaded GeoJSON with ${data.features.length} country features`);
        console.log(`First few country names in GeoJSON:`, data.features.slice(0, 5).map(f => f.properties.name));
        
        // Set world data
        setWorldData(data);
        setIsLoading(false);
      })
      .catch(error => {
        console.error('Error loading world map data:', error);
        setError(`Failed to load map data: ${error.message}`);
        setMapLoadError(true);
        setIsLoading(false);
      });
  }, []);

  // Initialize and update D3 map
  useEffect(() => {
    if (!svgRef.current || !wrapperRef.current || tradeData.length === 0 || !worldData) {
      return;
    }

    console.log(`Initializing map with ${tradeData.length} trade data points`);

    const svg = d3.select(svgRef.current);
    const wrapper = d3.select(wrapperRef.current);
    const { width, height } = wrapperRef.current.getBoundingClientRect();

    // Setup zoom
    const zoom = d3.zoom()
      .scaleExtent([1, 8])
      .on('zoom', (event) => {
        svg.select('g').attr('transform', event.transform);
      });

    svg
      .attr('width', width)
      .attr('height', height)
      .call(zoom as any)
      .on('dblclick.zoom', null); // Disable double-click zoom

    // Clear any previous content
    svg.selectAll('*').remove();

    // Add a group for the map
    const g = svg.append('g');

    // Setup projection
    const projection = d3.geoMercator()
      .scale(width / 2 / Math.PI)
      .center([0, 0])
      .translate([width / 2, height / 2]);

    // Setup path generator
    const path = d3.geoPath().projection(projection);

    // Create tooltip
    const tooltip = d3.select(wrapperRef.current)
      .append('div')
      .attr('class', 'tooltip')
      .style('opacity', 0)
      .style('position', 'absolute')
      .style('background-color', 'white')
      .style('border', '1px solid #ccc')
      .style('border-radius', '5px')
      .style('padding', '10px')
      .style('pointer-events', 'none')
      .style('font-size', '14px')
      .style('box-shadow', '0 4px 8px rgba(0,0,0,0.1)');

    // Counter for matched and unmatched countries
    let countryMatchCount = 0;
    let countryMismatchCount = 0;
    let matchedCountries: {name: string, code: string}[] = [];
    let unmatchedCountries: string[] = [];

    try {
      // Create logarithmic scale for better visualization
      const maxValue = Math.max(...tradeData.map(d => d.total_value || 0));
      console.log(`Maximum trade value: ${maxValue.toLocaleString()}`);
      
      // Create a log scale for color mapping
      const logScale = d3.scaleLog()
        .domain([1000, maxValue])  // Minimum trade value for coloring
        .range([0, 1])
        .clamp(true);

      // Draw map
      g.selectAll('path')
        .data(worldData.features)
        .enter()
        .append('path')
        .attr('d', path as any)
        .attr('fill', (feature: CountryFeature) => {
          const countryName = feature.properties.name;
          
          // Skip Antarctica for visual clarity
          if (countryName === 'Antarctica') {
            return '#f8f8f8';  // Very light gray for Antarctica
          }
          
          const countryData = findCountryData(feature);
          
          if (countryData && countryData.total_value > 0) {
            countryMatchCount++;
            matchedCountries.push({name: countryName, code: countryData.country});
            return d3.interpolateBlues(logScale(countryData.total_value));
          } else {
            if (countryName !== 'Antarctica') {
              countryMismatchCount++;
              unmatchedCountries.push(countryName);
            }
            // Use a different shade for unmatched countries
            return '#eee';
          }
        })
        .attr('stroke', '#ccc')
        .attr('stroke-width', 0.5)
        .on('mouseover', function(event, feature: CountryFeature) {
          handleCountryHover(this, feature.properties.name, event, feature);
        })
        .on('mouseout', function() {
          d3.select(this)
            .attr('stroke', '#ccc')
            .attr('stroke-width', 0.5);
          
          tooltip.style('opacity', 0);
        })
        .on('click', (event, feature: CountryFeature) => {
          handleCountryClick(feature);
        });

      // Log matching statistics after rendering all countries
      console.log(`Country matching statistics - Matched: ${countryMatchCount}, Unmatched: ${countryMismatchCount}`);
      console.log('Matched countries (sample of first 10):', matchedCountries.slice(0, 10));
      console.log('Unmatched countries (sample of first 20):', unmatchedCountries.slice(0, 20));

      // Find which ISO codes in the trade data didn't get matched to any country
      const matchedCodes = matchedCountries.map(c => c.code);
      const unmatchedCodes = tradeData
        .filter(d => !matchedCodes.includes(d.country))
        .map(d => d.country);
      
      console.log('API country codes that were not matched to GeoJSON countries (first 20):', 
        unmatchedCodes.slice(0, 20));
      
      // Attempt to resolve unmatched countries using our mapping
      console.log('Trying to manually match countries:');
      unmatchedCodes.slice(0, 10).forEach(code => {
        const mappedName = countryCodeToName[code] || 'unknown';
        console.log(`Code ${code} maps to name "${mappedName}" - exists in GeoJSON: ${
          worldData.features.some(f => f.properties.name === mappedName)
        }`);
      });
      
      // Calculate match success rate
      const matchPercentage = (countryMatchCount / (countryMatchCount + countryMismatchCount) * 100).toFixed(2);
      console.log(`Country match success rate: ${matchPercentage}%`);
      
      // Update map status
      setMapLoaded(true);
      setMapLoadError(false);
      
      // Call the onMapReady callback if provided
      if (onMapReady) {
        onMapReady();
      }
    } catch (error) {
      console.error('Error rendering map:', error);
      setMapLoadError(true);
    }

    // Handle window resize
    const handleResize = () => {
      if (wrapperRef.current) {
        const { width, height } = wrapperRef.current.getBoundingClientRect();
        svg.attr('width', width).attr('height', height);
        
        // Update projection
        projection
          .scale(width / 2 / Math.PI)
          .translate([width / 2, height / 2]);
        
        // Redraw paths
        svg.selectAll('path')
          .attr('d', path as any);
      }
    };

    window.addEventListener('resize', handleResize);
    
    return () => {
      window.removeEventListener('resize', handleResize);
      // Clean up tooltip
      if (tooltip) {
        tooltip.remove();
      }
    };
  }, [tradeData, worldData, svgRef, wrapperRef, onRegionSelect, onMapReady]);

  // Create a tooltip function
  function handleCountryHover(element: any, countryName: string, event: any, feature: CountryFeature) {
    if (!tooltipRef.current) return;
    
    const tooltip = d3.select(tooltipRef.current);
    const countryData = findCountryData(feature);
    
    const [x, y] = d3.pointer(event);
    
    if (countryData) {
      // Format trade values
      const formatValue = (value: number) => {
        if (value >= 1000000000) {
          return `$${(value / 1000000000).toFixed(1)}B`;
        } else if (value >= 1000000) {
          return `$${(value / 1000000).toFixed(1)}M`;
        } else if (value >= 1000) {
          return `$${(value / 1000).toFixed(1)}K`;
        }
        return `$${value.toFixed(0)}`;
      };
      
      // Create tooltip content
      tooltip.html(`
        <div class="tooltip" style="
          background: rgba(255, 255, 255, 0.95);
          border: 1px solid #ddd;
          border-radius: 4px;
          padding: 10px;
          font-size: 14px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
          max-width: 280px;
        ">
          <h4 style="margin: 0 0 5px; font-weight: 600;">${countryName}</h4>
          ${
            countryData
              ? `
                <div style="margin-bottom: 5px;">
                  <div><strong>Total Trade:</strong> ${formatValue(countryData.total_value)}</div>
                  <div><strong>Imports:</strong> ${formatValue(countryData.import_value)}</div>
                  <div><strong>Exports:</strong> ${formatValue(countryData.export_value)}</div>
                </div>
                <a href="/country/${countryData.country}" style="
                  display: inline-block;
                  color: #008080;
                  margin-top: 5px;
                  font-size: 13px;
                  text-decoration: underline;
                ">View full profile</a>
              `
              : `<div>No trade data available</div>`
          }
        </div>
      `)
      .style("left", `${event.pageX + 15}px`)
      .style("top", `${event.pageY - 28}px`)
      .style("opacity", 1);
    } else {
      tooltip.html(`
        <div class="font-semibold">${countryName}</div>
        <div>No trade data available</div>
      `)
      .style("left", `${event.pageX + 15}px`)
      .style("top", `${event.pageY - 28}px`)
      .style("opacity", 1);
    }
  }

  function handleCountryClick(feature: CountryFeature) {
    const countryData = findCountryData(feature);
    if (countryData) {
      if (onRegionSelect) {
        onRegionSelect(countryData.country);
      } else {
        // Navigate to country detail page
        window.location.href = `/country/${countryData.country}`;
      }
    }
  }

  // Helper function to find country data by GeoJSON feature - used outside the useEffect
  const findCountryData = (feature: CountryFeature, tradeDataParam?: TotalTradeItem[]): TotalTradeItem | undefined => {
    if (!feature || !feature.properties || !feature.properties.name) {
      console.log("Invalid feature object passed to findCountryData");
      return undefined;
    }
    
    // Use component state if tradeData not provided as parameter
    const dataToSearch = tradeDataParam || tradeData;
    if (!dataToSearch || dataToSearch.length === 0) {
      console.log("No trade data available for lookup");
      return undefined;
    }
    
    const countryName = feature.properties.name;
    
    // 1. Try direct match with country name first using the country code to name mapping
    const directMatch = dataToSearch.find(c => {
      // Convert country code to country name and match
      return countryCodeToName[c.country] === countryName;
    });
    
    if (directMatch) {
      return directMatch;
    }
    
    // 2. Try the reverse lookup - get code from name and match
    const countryCode = countryNameToCode[countryName];
    if (countryCode) {
      const codeMatch = dataToSearch.find(c => c.country === countryCode);
      if (codeMatch) return codeMatch;
    }
    
    // 3. Try with alternate names
    const altNames = alternateCountryNames[countryName];
    if (altNames) {
      for (const altName of altNames) {
        // Try to find the country code for this alternate name
        const altCode = countryNameToCode[altName];
        if (altCode) {
          const altMatch = dataToSearch.find(c => c.country === altCode);
          if (altMatch) return altMatch;
        }
        
        // Also try direct name matching with the alternate name
        const altDirectMatch = dataToSearch.find(c => 
          countryCodeToName[c.country] === altName
        );
        if (altDirectMatch) return altDirectMatch;
      }
    }
    
    // 4. Check if any country code maps to this name with case-insensitive matching
    const lowercaseCountryName = countryName.toLowerCase();
    for (const [code, name] of Object.entries(countryCodeToName)) {
      if (name.toLowerCase() === lowercaseCountryName) {
        const caseInsensitiveMatch = dataToSearch.find(c => c.country === code);
        if (caseInsensitiveMatch) return caseInsensitiveMatch;
      }
    }
    
    // 5. Look for any alternate names that might have this country as a value
    for (const [key, alternates] of Object.entries(alternateCountryNames)) {
      if (alternates.some(alt => alt.toLowerCase() === lowercaseCountryName)) {
        // Found this country as an alternate, now look up by the standard name
        const standardCode = countryNameToCode[key];
        if (standardCode) {
          const standardMatch = dataToSearch.find(c => c.country === standardCode);
          if (standardMatch) return standardMatch;
        }
      }
    }
    
    // 6. Direct country code match (in case the country code is the same as in GeoJSON)
    const directCodeMatch = dataToSearch.find(c => c.country === countryName);
    if (directCodeMatch) return directCodeMatch;
    
    if (countryName !== 'Antarctica') {
      // Log countries we couldn't match, but skip Antarctica as it's expected to have no trade data
      console.log(`Could not find trade data for country: ${countryName}`);
    }
    
    return undefined;
  };

  return (
    <div>
      {/* Year selector */}
      <div className="mb-4 flex justify-between items-center">
        <h2 className="text-xl font-bold">Global Trade Volumes</h2>
        <Select.Root 
          value={selectedTimePeriod} 
          onValueChange={(value) => setSelectedTimePeriod(value as TimePeriod)}
        >
          <Select.Trigger className="inline-flex items-center justify-between rounded px-4 py-2 text-sm leading-none h-9 gap-1 bg-white dark:bg-gray-950 border border-gray-300 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-900 focus:outline-none">
            <Select.Value placeholder="Select a year" />
            <Select.Icon>
              <ChevronDownIcon />
            </Select.Icon>
          </Select.Trigger>
          <Select.Portal>
            <Select.Content className="overflow-hidden bg-white dark:bg-gray-950 rounded-md shadow-md border border-gray-200 dark:border-gray-800">
              <Select.ScrollUpButton className="flex items-center justify-center h-6 bg-white dark:bg-gray-950 text-gray-700 dark:text-gray-300 cursor-default">
                <ChevronDownIcon style={{ transform: 'rotate(180deg)' }} />
              </Select.ScrollUpButton>
              <Select.Viewport className="p-1">
                {['2023', '2022', '2021', '2020', '2019'].map((year) => (
                  <Select.Item
                    key={year}
                    value={year}
                    className="relative flex items-center h-8 px-6 py-0 text-sm rounded hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer data-[state=checked]:bg-gray-100 dark:data-[state=checked]:bg-gray-800 outline-none"
                  >
                    <Select.ItemText>{year}</Select.ItemText>
                    <Select.ItemIndicator className="absolute left-0 w-6 inline-flex items-center justify-center">
                      <CheckIcon />
                    </Select.ItemIndicator>
                  </Select.Item>
                ))}
              </Select.Viewport>
              <Select.ScrollDownButton className="flex items-center justify-center h-6 bg-white dark:bg-gray-950 text-gray-700 dark:text-gray-300 cursor-default">
                <ChevronDownIcon />
              </Select.ScrollDownButton>
            </Select.Content>
          </Select.Portal>
        </Select.Root>
      </div>
      
      {/* Map container */}
      <div 
        ref={wrapperRef} 
        className="relative border border-gray-200 dark:border-gray-800 rounded-lg overflow-hidden"
        style={{ height: 'auto', minHeight: '400px' }}
      >
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-white/80 dark:bg-black/80 z-10">
            <div className="loader"></div>
            <span className="ml-2">Loading map data...</span>
          </div>
        )}
        
        <svg ref={svgRef} className="w-full h-auto"></svg>
        
        {/* Tooltip */}
        <div 
          ref={tooltipRef}
          className="absolute pointer-events-none bg-white dark:bg-gray-900 p-2 rounded shadow-lg border border-gray-200 dark:border-gray-800 text-sm z-20 opacity-0 transition-opacity"
          style={{ 
            maxWidth: '200px'
          }}
        ></div>
      </div>
      
      {/* Info panel for selected country */}
      {selectedCountry && (
        <Card className="mt-4">
          <CardHeader className="py-3">
            <div className="flex justify-between items-center">
              <CardTitle className="text-lg">{selectedCountry.country} Trade Data</CardTitle>
              <button 
                onClick={() => setSelectedCountry(null)}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                <Cross2Icon />
              </button>
            </div>
          </CardHeader>
          <CardContent>
            {tradeData.find(c => {
              const countryCode = countryNameToCode[selectedCountry.country];
              return countryCodeToName[c.country] === selectedCountry.country || 
                (countryCode && c.country === countryCode);
            }) ? (
              <div>
                <dl className="grid grid-cols-2 gap-4">
                  {(() => {
                    // Use the helper function to find country data
                    const countryData = findCountryData({ 
                      properties: { name: selectedCountry.country },
                      type: "Feature",
                      geometry: {} as Geometry
                    }, tradeData)!;
                    
                    // Format large numbers
                    const formatValue = (value: number) => {
                      if (value >= 1000000000) {
                        return `$${(value / 1000000000).toFixed(2)} billion`;
                      } else if (value >= 1000000) {
                        return `$${(value / 1000000).toFixed(2)} million`;
                      } else if (value >= 1000) {
                        return `$${(value / 1000).toFixed(2)} thousand`;
                      }
                      return `$${value.toFixed(2)}`;
                    };
                    
                    return (
                      <>
                        <div>
                          <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Trade</dt>
                          <dd className="mt-1 text-lg font-semibold">{formatValue(countryData.total_value)}</dd>
                        </div>
                        <div>
                          <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Trade Count</dt>
                          <dd className="mt-1 text-lg font-semibold">{countryData.trade_count.toLocaleString()}</dd>
                        </div>
                        <div>
                          <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Imports</dt>
                          <dd className="mt-1 text-lg font-semibold">{formatValue(countryData.import_value)}</dd>
                        </div>
                        <div>
                          <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Exports</dt>
                          <dd className="mt-1 text-lg font-semibold">{formatValue(countryData.export_value)}</dd>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">
                            Date Range
                          </span>
                          <span className="text-sm">
                            {new Date(selectedCountry.min_year).toLocaleDateString()} - {new Date(selectedCountry.max_year).toLocaleDateString()}
                          </span>
                        </div>
                      </>
                    );
                  })()}
                </dl>
              </div>
            ) : (
              <p className="text-gray-500 dark:text-gray-400">No trade data available for {selectedCountry.country}</p>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
} 