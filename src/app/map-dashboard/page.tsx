"use client"

import React, { useState, useEffect, useCallback } from 'react';
import { D3TradeMap } from "@/components/D3TradeMap";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import * as Tabs from '@radix-ui/react-tabs';
import * as Separator from '@radix-ui/react-separator';
import { InfoCircledIcon, BarChartIcon, GlobeIcon, ChevronRightIcon, ReloadIcon, ArrowUpIcon, ArrowDownIcon, MagnifyingGlassIcon, Cross2Icon, PinRightIcon } from '@radix-ui/react-icons';
import { mockGlobalHighlights, mockRegionData, mockTradeRelationships, mockTradeStatistics } from './mock-data';
import { RegionData } from './types';
import * as Popover from '@radix-ui/react-popover';

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

  // Handle region selection (for data display)
  const handleRegionSelect = (region: string) => {
    // Check if the region is actually a country (when clicked on the map)
    if (SAMPLE_COUNTRIES.includes(region)) {
      // It's a country click from the map
      setSelectedCountry(region);
      setSearchQuery(region);
      
      // Find the appropriate region for this country
      const countryRegion = COUNTRY_TO_REGION[region as keyof typeof COUNTRY_TO_REGION];
      if (countryRegion) {
        setSelectedRegion(countryRegion);
      } else {
        setSelectedRegion("Europe"); // Default fallback
      }
    } else {
      // It's a regular region selection
      setSelectedRegion(region);
    }
  };
  
  // Handle country selection (from search)
  const handleCountrySelect = (country: string) => {
    if (!mapReady) {
      console.warn("Map is not ready yet, waiting before focusing country");
      // Wait a bit before setting the country to focus
      setTimeout(() => {
        setSelectedCountry(country);
        setSearchQuery(country);
        setShowSuggestions(false);
        
        // Map the country to a region for our mock data
        if (country.includes("United States") || country.includes("Canada") || country.includes("Mexico")) {
          setSelectedRegion("North America");
        } else if (country.includes("China") || country.includes("Japan") || country.includes("India")) {
          setSelectedRegion("Asia");
        } else {
          setSelectedRegion("Europe"); // Default to Europe for other countries in this example
        }
      }, 1000);
      return;
    }
    
    setSelectedCountry(country);
    setSearchQuery(country);
    setShowSuggestions(false);
    
    // Map the country to a region for our mock data
    // In a real application, you'd look up the correct region for the country
    if (country.includes("United States") || country.includes("Canada") || country.includes("Mexico")) {
      setSelectedRegion("North America");
    } else if (country.includes("China") || country.includes("Japan") || country.includes("India")) {
      setSelectedRegion("Asia");
    } else {
      setSelectedRegion("Europe"); // Default to Europe for other countries in this example
    }
  };

  const clearSearch = () => {
    setSearchQuery('');
    setFilteredCountries([]);
    setShowSuggestions(false);
    setSelectedCountry(null);
  };

  const formatValue = (value: number, isPercentage: boolean = false, trillions: boolean = false) => {
    if (isPercentage) {
      return `${value.toFixed(1)}%`;
    }
    if (trillions) {
      return `$${value.toFixed(1)} trillion`;
    }
    return `$${value.toFixed(1)} billion`;
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
        <D3TradeMap 
          onRegionSelect={handleRegionSelect} 
          isBackground={true} 
          focusCountry={selectedCountry}
          onMapReady={handleMapReady}
        />
      </div>
      
      {/* Search bar overlay - sticky on left side */}
      <div className={`fixed left-0 ml-6 z-20 transition-all duration-300 ${
        isSearchSticky ? 'top-20 sm:top-24' : 'top-30 sm:top-32'
      }`}>
        <div className="bg-background/90 backdrop-blur-sm p-4 rounded-lg shadow-md w-72">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-lg font-semibold">Find Country</h2>
            {selectedCountry && (
              <div className="flex items-center space-x-1 text-xs px-2 py-1 bg-primary/20 rounded-full">
                <PinRightIcon className="h-3 w-3" />
                <span>Focused</span>
              </div>
            )}
          </div>
          <div className="relative ">
            <div className="flex ">
              <div className="relative flex-grow ">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => setShowSuggestions(true)}
                  placeholder="Search countries..."
                  className="px-3 py-2 w-full rounded-l-md border border-input bg-background"
                />
                {searchQuery && (
                  <button 
                    onClick={clearSearch}
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    <Cross2Icon className="h-4 w-4" />
                  </button>
                )}
              </div>
              <button
                className="px-3 py-2 rounded-r-md bg-primary text-primary-foreground border border-primary"
              >
                <MagnifyingGlassIcon className="h-4 w-4" />
              </button>
            </div>
            
            {/* Autosuggestion dropdown */}
            {showSuggestions && filteredCountries.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-background border border-input rounded-md shadow-lg max-h-60 overflow-y-auto z-20">
                {filteredCountries.map((country) => (
                  <div
                    key={country}
                    className="px-3 py-2 hover:bg-muted cursor-pointer"
                    onClick={() => handleCountrySelect(country)}
                  >
                    {country}
                  </div>
                ))}
              </div>
            )}
          </div>
          <div className="mt-4">
            <h3 className="text-sm font-medium mb-2">Popular Countries</h3>
            <div className="flex flex-wrap gap-2">
              {['United States', 'China', 'Germany', 'Japan', 'United Kingdom'].map((country) => (
                <button
                  key={country}
                  onClick={() => handleCountrySelect(country)}
                  className="text-xs px-2 py-1 bg-muted rounded-full hover:bg-accent hover:text-accent-foreground"
                >
                  {country}
                </button>
              ))}
            </div>
          </div>
          
          {!mapReady && (
            <div className="mt-4 text-xs text-muted-foreground">
              <div className="flex items-center">
                <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-primary mr-2"></div>
                <span>Loading map data...</span>
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* Overlay content - information cards */}
      <div className="absolute right-0 top-0 bottom-0 w-1/3 p-6 flex flex-col bg-background/90 backdrop-blur-sm z-10 overflow-y-auto">
        <div className="flex items-center mb-6">
          <h1 className="text-3xl font-bold">Trade Dashboard</h1>
          <Popover.Root>
            <Popover.Trigger asChild>
              <button className="ml-2 rounded-full hover:bg-muted p-1 inline-flex items-center justify-center">
                <InfoCircledIcon className="h-5 w-5 text-muted-foreground" />
              </button>
            </Popover.Trigger>
            <Popover.Portal>
              <Popover.Content
                className="w-80 p-4 rounded-md border bg-popover text-popover-foreground shadow-md animate-in fade-in-80 z-50"
                sideOffset={5}
              >
                <div className="space-y-2">
                  <h3 className="font-medium">About This Dashboard</h3>
                  <p className="text-sm text-muted-foreground">
                    This dashboard provides real-time global trade data visualization. Use the search feature to find specific countries, view detailed statistics, and analyze trade relationships between nations.
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Data is sourced from international trade databases and updated quarterly.
                  </p>
                </div>
                <Popover.Arrow className="fill-popover" />
              </Popover.Content>
            </Popover.Portal>
          </Popover.Root>
        </div>
        
        {selectedCountry && (
          <div className="mb-4 bg-muted/70 p-3 rounded-md">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {COUNTRY_TO_ISO[selectedCountry as keyof typeof COUNTRY_TO_ISO] && (
                  <div className="w-6 h-4 relative">
                    <img 
                      src={`https://flagcdn.com/${COUNTRY_TO_ISO[selectedCountry as keyof typeof COUNTRY_TO_ISO]}.svg`} 
                      alt={`${selectedCountry} flag`}
                      className="w-full h-full object-cover rounded absolute"
                      onError={(e) => {
                        // Try alternative flag source if primary one fails
                        const target = e.target as HTMLImageElement;
                        const countryCode = COUNTRY_TO_ISO[selectedCountry as keyof typeof COUNTRY_TO_ISO];
                        // Try another flag API as fallback
                        target.src = `https://flagsapi.com/${countryCode.toUpperCase()}/flat/24.png`;
                        
                        // If second source also fails
                        target.onerror = () => {
                          // Try third fallback
                          target.src = `https://cdn.jsdelivr.net/npm/country-flag-emoji-json@2.0.0/dist/images/${countryCode}.svg`;
                          
                          // If all sources fail, show a placeholder
                          target.onerror = () => {
                            target.style.display = 'none';
                          };
                        };
                      }}
                    />
                  </div>
                )}
                <h2 className="text-xl font-semibold">{selectedCountry}</h2>
              </div>
              <button 
                onClick={clearSearch} 
                className="text-xs px-2 py-1 bg-muted hover:bg-accent hover:text-accent-foreground rounded-full"
              >
                Clear Focus
              </button>
            </div>
            <p className="text-sm text-muted-foreground mt-1">Viewing trade data related to {selectedCountry}</p>
          </div>
        )}
        
        {/* Global highlights at the top */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          {mockGlobalHighlights.map((highlight, index) => (
            <Card key={index} className="shadow-sm bg-background/80 backdrop-blur-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">{highlight.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex justify-between items-center">
                  <div className="text-2xl font-bold">{highlight.value}</div>
                  {formatTrend(highlight.change)}
                </div>
                <p className="text-xs text-muted-foreground mt-1">{highlight.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
        
        {/* Central content with tabs */}
        <Card className="flex-grow mb-6 shadow-sm bg-background/80 backdrop-blur-sm">
          <Tabs.Root defaultValue="overview" className="h-full flex flex-col">
            <CardHeader className="pb-0">
              <div className="flex justify-between items-center">
                <CardTitle>
                  {selectedCountry 
                    ? `${selectedCountry} Overview` 
                    : selectedRegion 
                      ? `${selectedRegion} Overview` 
                      : 'Global Trade Analysis'}
                </CardTitle>
                <Tabs.List className="flex space-x-2">
                  <Tabs.Trigger 
                    value="overview" 
                    className="px-3 py-1 rounded-md data-[state=active]:bg-muted"
                  >
                    <div className="flex items-center space-x-1">
                      <InfoCircledIcon className="h-4 w-4" />
                      <span>Overview</span>
                    </div>
                  </Tabs.Trigger>
                  <Tabs.Trigger 
                    value="statistics" 
                    className="px-3 py-1 rounded-md data-[state=active]:bg-muted"
                  >
                    <div className="flex items-center space-x-1">
                      <BarChartIcon className="h-4 w-4" />
                      <span>Statistics</span>
                    </div>
                  </Tabs.Trigger>
                  <Tabs.Trigger 
                    value="relationships" 
                    className="px-3 py-1 rounded-md data-[state=active]:bg-muted"
                  >
                    <div className="flex items-center space-x-1">
                      <GlobeIcon className="h-4 w-4" />
                      <span>Relationships</span>
                    </div>
                  </Tabs.Trigger>
                </Tabs.List>
              </div>
            </CardHeader>
            <CardContent className="flex-grow overflow-auto pt-4">
              <Tabs.Content value="overview" className="h-full">
                {regionData ? (
                  <div className="space-y-6">
                    <div className="grid grid-cols-3 gap-4">
                      <Card className="bg-background/80">
                        <CardHeader className="pb-2">
                          <CardTitle className="text-sm">Population</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="text-xl font-bold">{regionData.population} million</div>
                        </CardContent>
                      </Card>
                      <Card className="bg-background/80">
                        <CardHeader className="pb-2">
                          <CardTitle className="text-sm">GDP</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="text-xl font-bold">{formatValue(regionData.gdp, false, true)}</div>
                        </CardContent>
                      </Card>
                      <Card className="bg-background/80">
                        <CardHeader className="pb-2">
                          <CardTitle className="text-sm">Trade Volume</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="text-xl font-bold">{formatValue(regionData.tradeVolume, false, true)}</div>
                        </CardContent>
                      </Card>
                    </div>
                    
                    <div>
                      <h3 className="text-lg font-semibold mb-3">Top Trading Partners</h3>
                      <div className="space-y-2">
                        {regionData.topPartners.map((partner, index) => (
                          <div key={index} className="flex justify-between items-center p-2 rounded-md bg-muted/70">
                            <span>{partner.name}</span>
                            <div className="flex items-center space-x-4">
                              <span className="text-muted-foreground">{formatValue(partner.value)}</span>
                              <span className="text-sm">{partner.percent.toFixed(1)}%</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    <div>
                      <h3 className="text-lg font-semibold mb-3">Key Products</h3>
                      <div className="space-y-2">
                        {regionData.keyProducts.map((product, index) => (
                          <div key={index} className="flex justify-between items-center p-2 rounded-md bg-muted/70">
                            <span>{product.name}</span>
                            <div className="flex items-center space-x-4">
                              <span className="text-muted-foreground">{formatValue(product.value)}</span>
                              <span className="text-sm">{product.percent.toFixed(1)}%</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-center p-6">
                    <GlobeIcon className="h-16 w-16 text-muted-foreground mb-4" />
                    <h3 className="text-xl font-medium mb-2">Select a Country on the Map</h3>
                    <p className="text-muted-foreground max-w-md">
                      Click on a country on the map or use the search to view detailed trade data and statistics.
                    </p>
                  </div>
                )}
              </Tabs.Content>
              
              <Tabs.Content value="statistics" className="h-full">
                <div className="space-y-6">
                  <h3 className="text-lg font-semibold">Trade Statistics (2019-2023)</h3>
                  <div className="space-y-4">
                    {mockTradeStatistics.map((stat, index) => (
                      <div key={index} className="p-3 rounded-md bg-muted/70">
                        <div className="flex justify-between items-center mb-2">
                          <span className="font-medium">{stat.year}</span>
                          <span className={`text-sm ${stat.balance >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                            Balance: {formatValue(stat.balance)}
                          </span>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <span className="text-sm text-muted-foreground">Imports</span>
                            <div className="text-lg font-medium">{formatValue(stat.imports, false, true)}</div>
                          </div>
                          <div>
                            <span className="text-sm text-muted-foreground">Exports</span>
                            <div className="text-lg font-medium">{formatValue(stat.exports, false, true)}</div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </Tabs.Content>
              
              <Tabs.Content value="relationships" className="h-full">
                <div className="space-y-6">
                  <h3 className="text-lg font-semibold">Key Trade Relationships</h3>
                  <div className="space-y-4">
                    {mockTradeRelationships.map((relationship, index) => (
                      <Card key={index} className="shadow-sm bg-background/80">
                        <CardHeader className="pb-2">
                          <CardTitle className="text-base flex items-center">
                            {relationship.source} 
                            <ChevronRightIcon className="mx-2 h-4 w-4" /> 
                            {relationship.target}
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="flex justify-between items-center mb-2">
                            <span className="text-muted-foreground">Trade Volume</span>
                            <span className="font-medium">{formatValue(relationship.value)}</span>
                          </div>
                          <div>
                            <span className="text-sm text-muted-foreground">Key Products:</span>
                            <div className="flex flex-wrap gap-2 mt-1">
                              {relationship.products.map((product, idx) => (
                                <span key={idx} className="text-xs px-2 py-1 bg-muted rounded-full">
                                  {product}
                                </span>
                              ))}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              </Tabs.Content>
            </CardContent>
          </Tabs.Root>
        </Card>
        
        {/* Bottom insights */}
        <Card className="shadow-sm bg-background/80 backdrop-blur-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Latest Insights</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Global trade growth projected to increase by 3.5% in 2024, driven by technology sector expansion and recovery in manufacturing output across developing economies.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 