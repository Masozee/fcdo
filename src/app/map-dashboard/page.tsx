"use client"

import React, { useState, useEffect, useCallback } from 'react';
import { D3TradeMap } from "@/components/D3TradeMap";
import { ChoroplethMap } from "@/components/ChoroplethMap"; 
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import * as Tabs from '@radix-ui/react-tabs';
import * as Separator from '@radix-ui/react-separator';
import { InfoCircledIcon, BarChartIcon, GlobeIcon, ChevronRightIcon, ReloadIcon, ArrowUpIcon, ArrowDownIcon, MagnifyingGlassIcon, Cross2Icon, PinRightIcon } from '@radix-ui/react-icons';
import { AlertCircle } from "lucide-react";
import { mockGlobalHighlights, mockRegionData, mockTradeRelationships, mockTradeStatistics } from './mock-data';
import { RegionData } from './types';
import * as Popover from '@radix-ui/react-popover';
import ClientOnly from '@/lib/use-client-only';
import { CountryMapData } from '@/types/map-data';

// Sample countries list (in a real application, this would come from your API)
const SAMPLE_COUNTRIES = [
  "United States", "China", "Japan", "Germany", "United Kingdom", 
  "France", "India", "Italy", "Brazil", "Canada", "South Korea", 
  "Russia", "Australia", "Spain", "Mexico", "Indonesia", "Netherlands", 
  "Saudi Arabia", "Turkey", "Switzerland", "Poland", "Sweden", "Belgium", 
  "Thailand", "Austria", "Nigeria", "United Arab Emirates", "Singapore", 
  "Vietnam", "Malaysia"
];

// Map countries to their regions
const COUNTRY_TO_REGION = {
  "United States": "North America",
  "China": "Asia",
  "Japan": "Asia",
  "Germany": "Europe",
  "United Kingdom": "Europe",
  "France": "Europe",
  "India": "Asia",
  "Italy": "Europe",
  "Brazil": "South America",
  "Canada": "North America",
  "South Korea": "Asia",
  "Australia": "Oceania",
  "Spain": "Europe",
  "Mexico": "North America",
  "Indonesia": "Asia",
  "Netherlands": "Europe",
  "Saudi Arabia": "Middle East",
  "Turkey": "Middle East",
  "Switzerland": "Europe",
  "Taiwan": "Asia",
  "Poland": "Europe",
  "Thailand": "Asia",
  "Sweden": "Europe",
  "Belgium": "Europe",
  "Nigeria": "Africa",
  "Austria": "Europe",
  "Norway": "Europe",
  "United Arab Emirates": "Middle East",
  "Ireland": "Europe",
  "Singapore": "Asia"
};

// Map countries to their ISO codes for flags
const COUNTRY_TO_ISO = {
  "United States": "us",
  "China": "cn",
  "Japan": "jp",
  "Germany": "de",
  "United Kingdom": "gb",
  "France": "fr",
  "India": "in",
  "Italy": "it",
  "Brazil": "br",
  "Canada": "ca",
  "South Korea": "kr",
  "Russia": "ru",
  "Australia": "au",
  "Spain": "es",
  "Mexico": "mx",
  "Indonesia": "id",
  "Netherlands": "nl",
  "Saudi Arabia": "sa",
  "Turkey": "tr",
  "Switzerland": "ch",
  "Poland": "pl",
  "Sweden": "se",
  "Belgium": "be",
  "Thailand": "th",
  "Austria": "at",
  "Nigeria": "ng",
  "United Arab Emirates": "ae",
  "Singapore": "sg",
  "Vietnam": "vn",
  "Malaysia": "my"
};

export default function MapDashboardPage() {
  const [selectedRegion, setSelectedRegion] = useState<string | null>(null);
  const [selectedCountry, setSelectedCountry] = useState<string | null>(null);
  const [mapReady, setMapReady] = useState<boolean>(false);
  const regionData = selectedRegion ? mockRegionData[selectedRegion] : null;
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filteredCountries, setFilteredCountries] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState<boolean>(false);
  const [isSearchSticky, setIsSearchSticky] = useState<boolean>(false);
  const [selectedCountryData, setSelectedCountryData] = useState<CountryMapData | null>(null);
  const [countryApiData, setCountryApiData] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Available regions for mapping to countries
  const availableRegions = Object.keys(mockRegionData);
  
  // Effect for handling scroll events to make search sticky
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setIsSearchSticky(true);
      } else {
        setIsSearchSticky(false);
      }
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Update filtered countries when search query changes
  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredCountries([]);
      return;
    }
    
    const filtered = SAMPLE_COUNTRIES.filter(country => 
      country.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setFilteredCountries(filtered);
    setShowSuggestions(true);
  }, [searchQuery]);

  // Handle map ready state
  const handleMapReady = useCallback(() => {
    setMapReady(true);
  }, []);

  // Get ISO country code from country name
  const getCountryCode = (countryName: string): string | null => {
    // Reverse lookup from COUNTRY_TO_ISO
    for (const [code, name] of Object.entries(COUNTRY_TO_ISO)) {
      if (name === countryName) {
        return code.toUpperCase();
      }
    }
    return null;
  };

  // Handle country selection from choropleth map
  const handleChoroplethCountrySelect = async (country: string) => {
    setSelectedCountry(country);
    setSearchQuery(country);
    setShowSuggestions(false);
    
    try {
      setIsLoading(true);
      setError(null);
      
      // Map country to region
      const countryRegion = COUNTRY_TO_REGION[country as keyof typeof COUNTRY_TO_REGION];
      if (countryRegion) {
        setSelectedRegion(countryRegion);
      } else {
        setSelectedRegion("Global"); // Default fallback
      }
      
      // Get country code
      const countryCode = getCountryCode(country);
      
      if (countryCode) {
        // Fetch country details from API
        const response = await fetch(`/api/country/${countryCode}?include_products=true`);
        
        if (!response.ok) {
          throw new Error(`Failed to fetch country data for ${country}`);
        }
        
        const data = await response.json();
        setCountryApiData(data);
      } else {
        console.warn(`Could not find ISO code for country: ${country}`);
      }
    } catch (error) {
      console.error("Error fetching country details:", error);
      setError(error instanceof Error ? error.message : 'Failed to fetch country data');
    } finally {
      setIsLoading(false);
    }
  };

  const clearSearch = () => {
    setSearchQuery('');
    setFilteredCountries([]);
    setShowSuggestions(false);
    setSelectedCountry(null);
    setCountryApiData(null);
  };

  const formatValue = (value: string | number, isPercentage: boolean = false, trillions: boolean = false) => {
    if (typeof value === 'string') {
      // If it's already a formatted string, just return it
      return value;
    }
    
    if (isPercentage) {
      return `${value.toFixed(1)}%`;
    }
    if (trillions) {
      return `$${value.toFixed(1)} trillion`;
    }
    return `$${value.toFixed(1)} billion`;
  };

  const formatCurrency = (value: number) => {
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

  const formatNumber = (value: number) => {
    return value.toLocaleString();
  };

  const formatTrend = (value: number) => {
    const isPositive = value >= 0;
    return (
      <div className="flex items-center">
        {isPositive ? (
          <ArrowUpIcon className="mr-1 h-4 w-4 text-green-500" />
        ) : (
          <ArrowDownIcon className="mr-1 h-4 w-4 text-red-500" />
        )}
        <span className={isPositive ? "text-green-500" : "text-red-500"}>
          {isPositive ? "+" : ""}{value.toFixed(1)}%
        </span>
      </div>
    );
  };

  return (
    <div className="relative h-screen w-full overflow-hidden">
      {/* Map section - full screen background */}
      <div className="absolute inset-0 w-full h-full">
        <ClientOnly>
          <ChoroplethMap
            onCountrySelect={handleChoroplethCountrySelect}
            className="w-full h-full"
            isBackground={true}
          />
        </ClientOnly>
      </div>
      
      {/* Sidebar layout */}
      <div className="grid grid-cols-12 h-full relative z-10">
        {/* Left sidebar with search and region statistics */}
        <div className="col-span-3 bg-white/90 dark:bg-zinc-900/90 backdrop-blur p-4 h-full overflow-auto">
          <div className="sticky top-0 pt-4 pb-6 bg-white/90 dark:bg-zinc-900/90 backdrop-blur z-10">
            <h1 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">Global Trade Map</h1>
            
            {/* Search input */}
            <div className="relative mb-6">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <MagnifyingGlassIcon className="h-4 w-4 text-gray-400" />
              </div>
              <input
                type="text"
                className="block w-full rounded-md border border-gray-300 dark:border-zinc-700 pl-10 pr-10 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-zinc-800 dark:text-zinc-100"
                placeholder="Search for a country..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => setShowSuggestions(true)}
              />
              {searchQuery && (
                <button 
                  onClick={clearSearch}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  <Cross2Icon className="h-4 w-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200" />
                </button>
              )}
            </div>
            
            {/* Search results dropdown */}
            {showSuggestions && filteredCountries.length > 0 && (
              <div className="mt-1 bg-white dark:bg-zinc-800 rounded-md shadow-lg z-50 max-h-[300px] overflow-auto border border-gray-200 dark:border-zinc-700">
                <ul className="py-1">
                  {filteredCountries.map((country) => (
                    <li 
                      key={country}
                      className="px-4 py-2 hover:bg-gray-100 dark:hover:bg-zinc-700 cursor-pointer flex items-center"
                      onClick={() => handleChoroplethCountrySelect(country)}
                    >
                      <div className="w-6 h-4 mr-2 flex-shrink-0 overflow-hidden">
                        {COUNTRY_TO_ISO[country as keyof typeof COUNTRY_TO_ISO] && (
                          <img 
                            src={`https://flagcdn.com/w40/${COUNTRY_TO_ISO[country as keyof typeof COUNTRY_TO_ISO]}.png`} 
                            alt={`${country} flag`}
                            className="w-full h-auto object-cover"
                          />
                        )}
                      </div>
                      <span className="text-sm dark:text-zinc-200">{country}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
          
          {/* Region/Country information section */}
          <div className="mt-2 space-y-6">
            <div className="border-b border-gray-200 dark:border-gray-700 pb-4">
              <h2 className="text-lg font-semibold mb-3 flex items-center text-gray-900 dark:text-white">
                <GlobeIcon className="mr-2 h-5 w-5 text-blue-500" />
                {selectedCountry ? `${selectedCountry}` : (selectedRegion ? `${selectedRegion} Region` : 'Global View')}
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {selectedCountry 
                  ? `Trade data and statistics for ${selectedCountry}.`
                  : (selectedRegion 
                    ? `Explore trade data for the ${selectedRegion} region.`
                    : 'Select a country or region to see detailed information.')}
              </p>
            </div>
            
            {isLoading ? (
              <div className="space-y-4 animate-pulse">
                <div className="h-8 w-3/4 bg-gray-200 dark:bg-gray-700 rounded"></div>
                <div className="h-24 bg-gray-200 dark:bg-gray-700 rounded"></div>
                <div className="h-24 bg-gray-200 dark:bg-gray-700 rounded"></div>
                <div className="h-24 bg-gray-200 dark:bg-gray-700 rounded"></div>
              </div>
            ) : error ? (
              <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-md">
                <div className="flex items-start">
                  <AlertCircle className="h-5 w-5 text-red-500 mt-0.5 mr-2" />
                  <div>
                    <h3 className="text-sm font-medium text-red-800 dark:text-red-200">Error loading data</h3>
                    <p className="text-sm text-red-700 dark:text-red-300 mt-1">{error}</p>
                  </div>
                </div>
              </div>
            ) : (
              <>
                {/* API Country Data */}
                {countryApiData && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 gap-3">
                      <Card className="bg-white/95 dark:bg-zinc-900/95">
                        <CardHeader className="p-3 pb-1">
                          <CardTitle className="text-sm">Total Trade</CardTitle>
                          <CardDescription className="text-xs">Total value of imports and exports</CardDescription>
                        </CardHeader>
                        <CardContent className="p-3 pt-1">
                          <div className="text-lg font-bold">
                            {formatCurrency(countryApiData.summary.total_value)}
                          </div>
                          <p className="text-xs text-gray-500">
                            Based on {formatNumber(countryApiData.summary.trade_count)} transactions
                          </p>
                        </CardContent>
                      </Card>

                      <div className="grid grid-cols-2 gap-3">
                        <Card className="bg-white/95 dark:bg-zinc-900/95">
                          <CardHeader className="p-3 pb-0">
                            <CardTitle className="text-xs">Imports</CardTitle>
                          </CardHeader>
                          <CardContent className="p-3 pt-1">
                            <div className="text-sm font-bold">
                              {formatCurrency(countryApiData.summary.import_value)}
                            </div>
                            <p className="text-xs text-gray-500">
                              {((countryApiData.summary.import_value / countryApiData.summary.total_value) * 100).toFixed(1)}% of total
                            </p>
                          </CardContent>
                        </Card>

                        <Card className="bg-white/95 dark:bg-zinc-900/95">
                          <CardHeader className="p-3 pb-0">
                            <CardTitle className="text-xs">Exports</CardTitle>
                          </CardHeader>
                          <CardContent className="p-3 pt-1">
                            <div className="text-sm font-bold">
                              {formatCurrency(countryApiData.summary.export_value)}
                            </div>
                            <p className="text-xs text-gray-500">
                              {((countryApiData.summary.export_value / countryApiData.summary.total_value) * 100).toFixed(1)}% of total
                            </p>
                          </CardContent>
                        </Card>
                      </div>
                    </div>
                    
                    {/* Yearly Trends */}
                    {countryApiData.yearlyTrends && countryApiData.yearlyTrends.length > 0 && (
                      <div>
                        <h3 className="text-sm font-medium mb-2 flex items-center text-gray-900 dark:text-white">
                          <InfoCircledIcon className="mr-2 h-4 w-4 text-blue-500" />
                          Trade Trends
                        </h3>
                        <Card className="bg-white/95 dark:bg-zinc-900/95">
                          <CardContent className="p-3">
                            <div className="space-y-2 max-h-[150px] overflow-auto">
                              {countryApiData.yearlyTrends.map((trend: any, index: number) => (
                                <div key={index} className="flex justify-between items-center text-xs">
                                  <span className="font-medium">{trend.year}</span>
                                  <div className="flex space-x-4">
                                    <div>
                                      <span className="text-gray-500">Imports:</span> {formatCurrency(trend.import_value)}
                                    </div>
                                    <div>
                                      <span className="text-gray-500">Exports:</span> {formatCurrency(trend.export_value)}
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </CardContent>
                        </Card>
                      </div>
                    )}
                    
                    {/* Product Categories */}
                    {countryApiData.productCategories && (
                      <div>
                        <h3 className="text-sm font-medium mb-2 flex items-center text-gray-900 dark:text-white">
                          <InfoCircledIcon className="mr-2 h-4 w-4 text-blue-500" />
                          Top Products
                        </h3>
                        <Tabs.Root defaultValue="imports" className="w-full">
                          <Tabs.List className="flex border-b border-gray-200 dark:border-gray-700 mb-2">
                            <Tabs.Trigger 
                              value="imports" 
                              className="px-3 py-1 text-xs font-medium border-b-2 border-transparent data-[state=active]:border-blue-500 data-[state=active]:text-blue-600 dark:data-[state=active]:text-blue-400"
                            >
                              Imports
                            </Tabs.Trigger>
                            <Tabs.Trigger 
                              value="exports" 
                              className="px-3 py-1 text-xs font-medium border-b-2 border-transparent data-[state=active]:border-blue-500 data-[state=active]:text-blue-600 dark:data-[state=active]:text-blue-400"
                            >
                              Exports
                            </Tabs.Trigger>
                          </Tabs.List>
                          
                          <Tabs.Content value="imports">
                            <Card className="bg-white/95 dark:bg-zinc-900/95">
                              <CardContent className="p-3">
                                <div className="max-h-[150px] overflow-auto">
                                  {countryApiData.productCategories.imports.length > 0 ? (
                                    <table className="w-full text-xs">
                                      <thead>
                                        <tr className="text-left border-b border-gray-200 dark:border-gray-700">
                                          <th className="pb-1">Product</th>
                                          <th className="pb-1">HS Code</th>
                                          <th className="pb-1 text-right">Value</th>
                                        </tr>
                                      </thead>
                                      <tbody>
                                        {countryApiData.productCategories.imports.map((product: any, index: number) => (
                                          <tr key={index} className="border-b border-gray-100 dark:border-gray-800">
                                            <td className="py-1 font-medium truncate max-w-[120px]" title={product.product_name}>
                                              {product.product_name}
                                            </td>
                                            <td className="py-1">{product.product_code}</td>
                                            <td className="py-1 text-right">{formatCurrency(product.value)}</td>
                                          </tr>
                                        ))}
                                      </tbody>
                                    </table>
                                  ) : (
                                    <p className="text-center py-2 text-xs text-gray-500">No import data available</p>
                                  )}
                                </div>
                              </CardContent>
                            </Card>
                          </Tabs.Content>
                          
                          <Tabs.Content value="exports">
                            <Card className="bg-white/95 dark:bg-zinc-900/95">
                              <CardContent className="p-3">
                                <div className="max-h-[150px] overflow-auto">
                                  {countryApiData.productCategories.exports.length > 0 ? (
                                    <table className="w-full text-xs">
                                      <thead>
                                        <tr className="text-left border-b border-gray-200 dark:border-gray-700">
                                          <th className="pb-1">Product</th>
                                          <th className="pb-1">HS Code</th>
                                          <th className="pb-1 text-right">Value</th>
                                        </tr>
                                      </thead>
                                      <tbody>
                                        {countryApiData.productCategories.exports.map((product: any, index: number) => (
                                          <tr key={index} className="border-b border-gray-100 dark:border-gray-800">
                                            <td className="py-1 font-medium truncate max-w-[120px]" title={product.product_name}>
                                              {product.product_name}
                                            </td>
                                            <td className="py-1">{product.product_code}</td>
                                            <td className="py-1 text-right">{formatCurrency(product.value)}</td>
                                          </tr>
                                        ))}
                                      </tbody>
                                    </table>
                                  ) : (
                                    <p className="text-center py-2 text-xs text-gray-500">No export data available</p>
                                  )}
                                </div>
                              </CardContent>
                            </Card>
                          </Tabs.Content>
                        </Tabs.Root>
                      </div>
                    )}
                  </div>
                )}
                
                {/* Mock Global/Region data (shown when no country is selected or API data is not available) */}
                {!countryApiData && (
                  <>
                    {/* Global highlights section */}
                    <div className="space-y-4">
                      <h3 className="text-md font-medium flex items-center text-gray-900 dark:text-white">
                        <BarChartIcon className="mr-2 h-4 w-4 text-blue-500" />
                        {selectedRegion ? `${selectedRegion} Highlights` : 'Global Highlights'}
                      </h3>
                      <div className="space-y-3">
                        {mockGlobalHighlights.slice(0, 3).map((highlight, index) => (
                          <Card key={index} className="bg-white/95 dark:bg-zinc-900/95">
                            <CardContent className="p-3">
                              <div className="flex justify-between items-center">
                                <div>
                                  <h4 className="text-sm font-medium">{highlight.title}</h4>
                                  <p className="text-xs text-gray-500 dark:text-gray-400">{highlight.description}</p>
                                </div>
                                <div className="text-right">
                                  <div className="text-md font-bold">
                                    {formatValue(highlight.value, highlight.isPercentage, highlight.isTrillion)}
                                  </div>
                                  <div className="text-xs">{formatTrend(highlight.trend)}</div>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </div>
                    
                    {/* Region statistics (shows only when a region is selected) */}
                    {regionData && (
                      <div className="space-y-4">
                        <h3 className="text-md font-medium flex items-center text-gray-900 dark:text-white">
                          <InfoCircledIcon className="mr-2 h-4 w-4 text-blue-500" />
                          Regional Statistics
                        </h3>
                        
                        {/* Regional Economy Overview */}
                        <Card className="bg-white/95 dark:bg-zinc-900/95">
                          <CardHeader className="p-3 pb-1">
                            <CardTitle className="text-sm">Economy Overview</CardTitle>
                            <CardDescription className="text-xs">Key indicators</CardDescription>
                          </CardHeader>
                          <CardContent className="p-3 pt-1">
                            <div className="space-y-2">
                              {regionData.economyStats.slice(0, 3).map((stat, index) => (
                                <div key={index} className="flex justify-between items-center">
                                  <div className="flex items-center">
                                    <div className="w-2 h-2 rounded-full bg-blue-500 mr-2"></div>
                                    <span className="text-xs text-gray-700 dark:text-gray-300">{stat.name}</span>
                                  </div>
                                  <span className="text-xs font-medium">{formatValue(stat.value, stat.isPercentage)}</span>
                                </div>
                              ))}
                            </div>
                          </CardContent>
                        </Card>
                        
                        {/* Regional Trade Balance */}
                        <Card className="bg-white/95 dark:bg-zinc-900/95">
                          <CardHeader className="p-3 pb-1">
                            <CardTitle className="text-sm">Trade Balance</CardTitle>
                            <CardDescription className="text-xs">Import/export balance</CardDescription>
                          </CardHeader>
                          <CardContent className="p-3 pt-1">
                            <div className="space-y-2">
                              <div className="flex justify-between">
                                <span className="text-xs text-gray-700 dark:text-gray-300">Exports</span>
                                <span className="text-xs font-medium">{formatValue(regionData.tradeBalance.exports)}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-xs text-gray-700 dark:text-gray-300">Imports</span>
                                <span className="text-xs font-medium">{formatValue(regionData.tradeBalance.imports)}</span>
                              </div>
                              <Separator.Root className="h-[1px] bg-gray-200 dark:bg-gray-700 my-1" />
                              <div className="flex justify-between">
                                <span className="text-xs font-medium text-gray-800 dark:text-gray-200">Balance</span>
                                <span className={`text-xs font-medium ${regionData.tradeBalance.balance >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                                  {formatValue(regionData.tradeBalance.balance)}
                                </span>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </div>
                    )}
                  </>
                )}
              </>
            )}
          </div>
        </div>
        
        {/* Main content area - intentionally left empty for full map display */}
        <div className="col-span-9"></div>
      </div>
    </div>
  );
} 