"use client"

import React, { useState, useEffect, useCallback } from 'react';
import { D3TradeMap } from "@/components/D3TradeMap";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import * as Tabs from '@radix-ui/react-tabs';
import * as Separator from '@radix-ui/react-separator';
import { InfoCircledIcon, BarChartIcon, GlobeIcon, ChevronRightIcon, ReloadIcon, ArrowUpIcon, ArrowDownIcon, MagnifyingGlassIcon, Cross2Icon, PinRightIcon } from '@radix-ui/react-icons';
import { mockGlobalHighlights, mockRegionData, mockTradeRelationships, mockTradeStatistics } from './mock-data';
import { RegionData, CountriesTradeResponse, CountryTradeItem, GlobalTotals, CountrySpecificTradeResponse, CountrySpecificTradeItem } from './types';
import * as Popover from '@radix-ui/react-popover';
import ClientOnly from '@/lib/use-client-only';
import { getCountriesTradeData, getCountrySpecificTradeData, getAllCountries } from '@/lib/api-utils';
import { Search, ChevronRight, BarChart3, ArrowUpRight, TrendingUp, Globe, ChevronDown, CircleDot, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { formatNumber, formatCurrency } from '@/lib/utils';
import { enhancedCountryCodeConverter, mapCountryNameToAlpha2, mapCountryNameToAlpha2Async } from '@/lib/country-utils';
import { Skeleton } from '@/components/ui/skeleton';
import Link from 'next/link';
import Image from 'next/image';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetClose } from '@/components/ui/sheet';

// Define a type for country data
interface CountryData {
  name: string;
  code: string;
  region: string;
  iso: string;
}

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
  "Singapore": "Asia",
  "Kazakhstan": "Central Asia"
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
  "Malaysia": "my",
  "Kazakhstan": "kz"
};

export default function MapDashboardPage() {
  const [selectedRegion, setSelectedRegion] = useState<string | null>(null);
  const [selectedCountry, setSelectedCountry] = useState<string | null>(null);
  const [selectedCountryCode, setSelectedCountryCode] = useState<string | null>(null);
  const [mapReady, setMapReady] = useState<boolean>(false);
  const regionData = selectedRegion ? mockRegionData[selectedRegion] : null;
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filteredCountries, setFilteredCountries] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState<boolean>(false);
  const [isSearchSticky, setIsSearchSticky] = useState<boolean>(false);
  const [countriesTradeData, setCountriesTradeData] = useState<CountryTradeItem[]>([]);
  const [globalTotals, setGlobalTotals] = useState<GlobalTotals | null>(null);
  const [countrySpecificTradeData, setCountrySpecificTradeData] = useState<CountrySpecificTradeItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedYear, setSelectedYear] = useState<string>('2023');
  const [countryDataLoading, setCountryDataLoading] = useState<boolean>(false);
  const [drawerOpen, setDrawerOpen] = useState<boolean>(false);
  const [allCountries, setAllCountries] = useState<CountryData[]>([]);

  // Fetch all countries and trade data on component mount
  useEffect(() => {
    async function fetchInitialData() {
      try {
        setIsLoading(true);
        
        // Fetch all countries list with more comprehensive data
        const countriesResponse = await getAllCountries();
        if (countriesResponse.success) {
          console.log(`Loaded ${countriesResponse.data.length} countries for search`);
          setAllCountries(countriesResponse.data);
        } else {
          console.error('Failed to load countries:', countriesResponse.error);
          // Attempt to fetch countries again with a different approach if needed
        }
        
        // Fetch trade data
        const tradeResponse = await getCountriesTradeData(selectedYear);
        if (tradeResponse.success) {
          setCountriesTradeData(tradeResponse.data.countries);
          setGlobalTotals(tradeResponse.data.globalTotals);
        } else {
          setError('Failed to load trade data');
        }
      } catch (err) {
        console.error('Error fetching initial data:', err);
        setError('Failed to load data');
      } finally {
        setIsLoading(false);
      }
    }
    
    fetchInitialData();
  }, [selectedYear]);

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

  // Update filtered countries when search query changes - improve matching
  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredCountries([]);
      return;
    }
    
    const query = searchQuery.toLowerCase().trim();
    
    // More thorough filtering to catch more countries
    const filtered = allCountries
      .filter(country => {
        // Ensure country has a name
        if (!country || !country.name) return false;
        
        const countryName = country.name.toLowerCase();
        
        // Match by name
        if (countryName.includes(query)) return true;
        
        // Match by code (if available)
        if (country.code && country.code.toLowerCase().includes(query)) return true;
        
        // Match by region (if available)
        if (country.region && country.region.toLowerCase().includes(query)) return true;
        
        return false;
      })
      .map(country => country.name)
      // Sort results by relevance - exact matches first, then starts with, then includes
      .sort((a, b) => {
        const aLower = a.toLowerCase();
        const bLower = b.toLowerCase();
        
        // Exact match first
        if (aLower === query && bLower !== query) return -1;
        if (bLower === query && aLower !== query) return 1;
        
        // Starts with query next
        if (aLower.startsWith(query) && !bLower.startsWith(query)) return -1;
        if (bLower.startsWith(query) && !aLower.startsWith(query)) return 1;
        
        // Alphabetical order for remaining results
        return a.localeCompare(b);
      })
      // Limit to a reasonable number to avoid performance issues
      .slice(0, 200);
    
    setFilteredCountries(filtered);
    setShowSuggestions(true);
  }, [searchQuery, allCountries]);

  // Handle map ready state
  const handleMapReady = useCallback(() => {
    console.log("Map is ready!");
    setMapReady(true);
    
    // Verify the d3MapInstance is available
    setTimeout(() => {
      if (typeof window !== 'undefined' && window.d3MapInstance) {
        console.log("d3MapInstance is available:", {
          zoomIn: !!window.d3MapInstance.zoomIn,
          zoomOut: !!window.d3MapInstance.zoomOut,
          resetZoom: !!window.d3MapInstance.resetZoom
        });
      } else {
        console.warn("d3MapInstance is not available yet!");
      }
    }, 500); // Check after a short delay to ensure it's initialized
  }, []);

  // Handle region selection (for data display)
  const handleRegionSelect = async (region: string) => {
    console.log("Region selected:", region);
    
    try {
      // Initialize the flag
      let isCountry = false;
      
      // Ensure we have an array to work with - this is critical
      // We need to add this check before any array operations
      const countryArray = Array.isArray(allCountries) ? allCountries : [];
      
      // Only proceed with checks if we have data
      if (countryArray.length > 0) {
        // First check for exact match
        isCountry = countryArray.some((country: CountryData) => 
          typeof country === 'object' && 
          country !== null && 
          typeof country.name === 'string' &&
          country.name.toLowerCase() === region.toLowerCase()
        );
        
        // If no exact match, try partial match
        if (!isCountry) {
          isCountry = countryArray.some((country: CountryData) => 
            typeof country === 'object' && 
            country !== null && 
            typeof country.name === 'string' &&
            (region.toLowerCase().includes(country.name.toLowerCase()) || 
            country.name.toLowerCase().includes(region.toLowerCase()))
          );
        }
      } else {
        // If we don't have country data yet, try to fetch it
        console.log("No countries data available, attempting to fetch");
        try {
          const countriesResponse = await getAllCountries();
          if (countriesResponse?.success && Array.isArray(countriesResponse.data)) {
            const freshCountries = countriesResponse.data;
            setAllCountries(freshCountries);
            
            // Now check with the fresh data
            if (freshCountries.length > 0) {
              isCountry = freshCountries.some((country: CountryData) => 
                typeof country === 'object' && 
                country !== null && 
                typeof country.name === 'string' &&
                (country.name.toLowerCase() === region.toLowerCase() ||
                 region.toLowerCase().includes(country.name.toLowerCase()) || 
                 country.name.toLowerCase().includes(region.toLowerCase()))
              );
            }
          }
        } catch (fetchError) {
          console.error("Error fetching countries:", fetchError);
        }
      }
      
      // Handle the result
      if (isCountry) {
        await handleCountrySelect(region);
      } else {
        setSelectedRegion(region);
      }
    } catch (error) {
      console.error("Error in handleRegionSelect:", error);
      // Failsafe - just set the region if there's an error
      setSelectedRegion(region);
    }
  };
  
  // Fetch country-specific trade data
  const fetchCountrySpecificData = async (countryCode: string) => {
    try {
      setCountryDataLoading(true);
      console.log("Fetching country-specific data for:", countryCode);
      
      // Make sure we're using alpha-2 code for the API
      const alpha2Code = countryCode.length === 3 
        ? (enhancedCountryCodeConverter(countryCode) || countryCode) 
        : countryCode;
      
      // Get trade data specific to the country
      const data = await getCountrySpecificTradeData(alpha2Code, selectedYear);
      
      if (data && data.success) {
        setCountrySpecificTradeData(data.data || []);
      } else {
        console.warn('No data returned for country:', alpha2Code);
        setCountrySpecificTradeData([]);
      }
      
      // Always open the drawer, even if we don't have data
      setDrawerOpen(true);
      console.log('Drawer opened for country code:', countryCode);
      
    } catch (error) {
      console.error('Error fetching country data:', error);
      setCountrySpecificTradeData([]);
      // Still open the drawer with empty data to show the error state
      setDrawerOpen(true);
    } finally {
      setCountryDataLoading(false);
    }
  };
  
  // Get ISO code from country name
  const getCountryCode = async (countryName: string): Promise<string | null> => {
    if (!countryName) return null;
    
    console.log('Getting code for country:', countryName);
    
    // Try to use the database-first approach with our enhanced function
    const alpha2Code = await mapCountryNameToAlpha2Async(countryName);
    if (alpha2Code) {
      console.log('Found country using database or utility function:', alpha2Code);
      return alpha2Code.toUpperCase();
    }
    
    // Normalize country name for comparison
    const normalizedName = countryName.toLowerCase().trim();
    
    // First try exact match in our database results
    let country = allCountries.find(c => 
      c.name.toLowerCase().trim() === normalizedName
    );
    
    // If no exact match, try a fuzzy match
    if (!country) {
      country = allCountries.find(c => 
        normalizedName.includes(c.name.toLowerCase().trim()) ||
        c.name.toLowerCase().trim().includes(normalizedName)
      );
    }
    
    if (country) {
      console.log('Found country in database:', country);
      // First try to use the ISO code directly if available
      if (country.iso) {
        return country.iso.toUpperCase();
      }
      // Otherwise use the country code
      if (country.code) {
        return country.code.toUpperCase();
      }
    }
    
    // If not found in database, fallback to static mapping
    const isoCode = Object.entries(COUNTRY_TO_ISO).find(([name]) => 
      name.toLowerCase().trim() === normalizedName ||
      normalizedName.includes(name.toLowerCase().trim()) ||
      name.toLowerCase().trim().includes(normalizedName)
    );
    
    if (isoCode) {
      console.log('Found country in static mapping:', isoCode);
      return isoCode[1].toUpperCase();
    }
    
    // As a last resort, check if country name itself looks like a country code
    if (normalizedName.length === 2) {
      console.log('Using country name as code:', normalizedName);
      return normalizedName.toUpperCase();
    }
    
    console.warn(`Could not find country code for: ${countryName}`);
    
    // Return null if no code was found
    return null;
  };
  
  // Handle country selection (from search or map click)
  const handleCountrySelect = async (country: string) => {
    console.log('Country selected:', country);
    
    // Find the closest match in our country list if the exact name isn't found
    const exactMatch = allCountries.find(c => c.name === country);
    const fuzzyMatch = !exactMatch ? allCountries.find(c => 
      c.name.toLowerCase().includes(country.toLowerCase()) || 
      country.toLowerCase().includes(c.name.toLowerCase())
    ) : null;
    
    const countryToUse = exactMatch?.name || (fuzzyMatch ? fuzzyMatch.name : country);
    console.log('Using country name:', countryToUse);
    
    if (!mapReady) {
      console.warn("Map is not ready yet, waiting before focusing country");
      // Wait a bit before setting the country to focus
      setTimeout(async () => {
        setSelectedCountry(countryToUse);
        setSearchQuery(countryToUse);
        setShowSuggestions(false);
        
        // Map the country to a region using data from the database
        const countryData = allCountries.find(c => c.name === countryToUse || 
          c.name.toLowerCase() === countryToUse.toLowerCase());
        console.log('Country data from database:', countryData);
        
        if (countryData && countryData.region) {
          setSelectedRegion(countryData.region);
        } else {
          // Fallback to hardcoded mapping if not found in database
          const countryRegion = COUNTRY_TO_REGION[countryToUse as keyof typeof COUNTRY_TO_REGION];
          if (countryRegion) {
            setSelectedRegion(countryRegion);
          } else {
            setSelectedRegion("Europe"); // Default fallback
          }
        }
        
        // Get country code and fetch specific trade data
        const countryCode = await getCountryCode(countryToUse);
        console.log('Country code for API:', countryCode);
        
        if (countryCode) {
          setSelectedCountryCode(countryCode);
          // Use our new unified function instead of the old fetchCountrySpecificData
          await fetchAndUpdateCountrySpecificData(countryToUse);
          setDrawerOpen(true);
        } else {
          // If we don't have a country code, still show the drawer with empty data
          setDrawerOpen(true);
          console.log('Drawer opened for:', countryToUse, '(no country code)');
        }
      }, 1000);
      return;
    }
    
    setSelectedCountry(countryToUse);
    setSearchQuery(countryToUse);
    setShowSuggestions(false);
    
    // Map the country to a region using data from the database
    const countryData = allCountries.find(c => c.name === countryToUse || 
      c.name.toLowerCase() === countryToUse.toLowerCase());
    console.log('Country data from database:', countryData);
    
    if (countryData && countryData.region) {
      setSelectedRegion(countryData.region);
    } else {
      // Fallback to hardcoded mapping if not found in database
      const countryRegion = COUNTRY_TO_REGION[countryToUse as keyof typeof COUNTRY_TO_REGION];
      if (countryRegion) {
        setSelectedRegion(countryRegion);
      } else {
        setSelectedRegion("Europe"); // Default fallback
      }
    }
    
    // Get country code and fetch specific trade data
    const countryCode = await getCountryCode(countryToUse);
    console.log('Country code for API:', countryCode);
    
    if (countryCode) {
      setSelectedCountryCode(countryCode);
      // Use our new unified function instead of the old fetchCountrySpecificData
      await fetchAndUpdateCountrySpecificData(countryToUse);
      setDrawerOpen(true);
    } else {
      // If we don't have a country code, still show the drawer with empty data
      setDrawerOpen(true);
      console.log('Drawer opened for:', countryToUse, '(no country code)');
    }
  };

  const clearSearch = () => {
    setSearchQuery('');
    setFilteredCountries([]);
    setShowSuggestions(false);
    
    // Don't automatically clear the selected country and close the drawer
    // This allows users to clear the search without losing their selected country
  };

  const formatValue = (value: string | number, isPercentage: boolean = false, trillions: boolean = false) => {
    // Handle null or undefined values
    if (value === null || value === undefined) {
      return isPercentage ? '0.0%' : trillions ? '$0.0 trillion' : '$0';
    }
    
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
    
    // Format as a standard USD value with commas for thousands
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0
    }).format(value);
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

  // Helper function to format billion values with commas
  const formatBillions = (value: number): string => {
    return `$${new Intl.NumberFormat('en-US').format(parseFloat(value.toFixed(2)))}B`;
  };

  // Fetch trade data based on selected options
  const fetchTradeData = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      console.log(`Fetching trade data for ${selectedYear} with data source: ${selectedCountry}`);
      
      // Fetch global trade data from API
      const response = await getCountriesTradeData(selectedYear);
      
      if (response.success) {
        console.log("Successfully fetched trade data:", response.data.length, "countries");
        setCountriesTradeData(response.data.countries);
        setGlobalTotals(response.data.globalTotals);
        
        // If there's a selected country, update its specific data too
        if (selectedCountry) {
          await fetchAndUpdateCountrySpecificData(selectedCountry);
        }
      } else {
        console.error("Error fetching trade data:", response.error);
        setError(response.error || "Failed to fetch trade data");
      }
    } catch (error) {
      console.error("Exception fetching trade data:", error);
      setError("An unexpected error occurred while fetching trade data");
    } finally {
      setIsLoading(false);
    }
  };

  // Unified function to fetch and update country-specific data
  const fetchAndUpdateCountrySpecificData = async (countryName: string) => {
    try {
      console.log(`Fetching country-specific data for ${countryName}`);
      setCountryDataLoading(true);
      
      // Get country code from country name
      const countryCode = await getCountryCode(countryName);
      console.log(`Resolved country code for ${countryName}: ${countryCode}`);
      
      if (!countryCode) {
        console.warn(`Could not resolve country code for ${countryName}`);
        setError(`Could not find country code for ${countryName}`);
        setCountrySpecificTradeData([]);
        return;
      }
      
      // Fetch country-specific trade data
      const countryData = await getCountrySpecificTradeData(
        countryCode, 
        selectedYear
      );
      
      console.log(`Received country-specific data for ${countryName}:`, countryData);
      
      if (countryData.success) {
        setCountrySpecificTradeData(countryData.data || []);
      } else {
        console.error(`Error fetching data for ${countryName}:`, countryData.error);
        setError(countryData.error || `Failed to fetch data for ${countryName}`);
        setCountrySpecificTradeData([]);
      }
    } catch (error) {
      console.error(`Exception fetching specific data for ${countryName}:`, error);
      setError(`An unexpected error occurred while fetching data for ${countryName}`);
      setCountrySpecificTradeData([]);
    } finally {
      setCountryDataLoading(false);
    }
  };

  return (
    <div className="relative h-screen w-full overflow-hidden">
      {/* Map section - full screen background */}
      <div className="absolute inset-0 w-full h-full">
        <ClientOnly>
          {isLoading && !countriesTradeData.length && (
            <div className="absolute inset-0 flex items-center justify-center bg-background/50 backdrop-blur-sm z-30">
              <div className="flex flex-col items-center space-y-4">
                <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
                <p className="text-foreground font-medium">Loading trade data...</p>
              </div>
            </div>
          )}
          
          {error && !countriesTradeData.length && (
            <div className="absolute inset-0 flex items-center justify-center bg-background/50 backdrop-blur-sm z-30">
              <div className="bg-background p-6 rounded-lg shadow-lg max-w-md">
                <h3 className="text-xl font-bold text-red-500 mb-2">Error Loading Data</h3>
                <p className="text-foreground mb-4">{error}</p>
                <button 
                  onClick={() => window.location.reload()}
                  className="px-4 py-2 bg-primary text-primary-foreground rounded-md"
                >
                  Retry
                </button>
              </div>
            </div>
          )}
          
          <D3TradeMap 
            onRegionSelect={handleRegionSelect} 
            isBackground={true} 
            focusCountry={selectedCountry}
            onMapReady={handleMapReady}
            countriesData={countriesTradeData}
          />
        </ClientOnly>
      </div>
      
      {/* New description card above search */}
      <div className={`fixed left-0 ml-6 z-20 transition-all duration-300 ${
        isSearchSticky ? 'top-20 sm:top-24' : 'top-30 sm:top-32'
      }`}>
        <div className="bg-background/90 backdrop-blur-sm p-4 rounded-lg shadow-md w-72 mb-4">
          <div className="flex items-center space-x-2 mb-2">
            <GlobeIcon className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-semibold">Map Dashboard</h2>
          </div>
          <p className="text-sm text-muted-foreground">
            Explore global trade data with our interactive map. Search for countries to view their specific trade statistics and patterns.
          </p>
        </div>

        {/* Search card - now below the description card */}
        <div className="bg-background/90 backdrop-blur-sm p-4 rounded-lg shadow-md w-72">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-lg font-semibold">Find Any Country</h2>
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
                  placeholder="Search for any country..."
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
              <div className="absolute top-full left-0 right-0 mt-1 bg-background border border-input rounded-md shadow-lg max-h-72 overflow-y-auto z-20">
                <div className="sticky top-0 bg-muted/90 backdrop-blur-sm px-3 py-2 border-b border-border">
                  <div className="text-xs text-muted-foreground">
                    Found {filteredCountries.length} countries
                  </div>
                </div>
                <div className="p-1">
                  {filteredCountries.map((country) => (
                    <div
                      key={country}
                      className="px-3 py-2 hover:bg-muted cursor-pointer rounded-sm text-sm flex items-center justify-between"
                      onClick={() => handleCountrySelect(country)}
                    >
                      <span>{country}</span>
                      {(() => {
                        // Try to get the country code for flag
                        const countryData = allCountries.find(c => c.name === country);
                        const isoCode = countryData?.iso?.toLowerCase();
                        
                        if (isoCode) {
                          return (
                            <div className="w-6 h-4 relative overflow-hidden rounded">
                              <img 
                                src={`https://flagcdn.com/${isoCode}.svg`} 
                                alt={`${country} flag`}
                                className="w-full h-full object-cover absolute"
                                onError={(e) => {
                                  // Hide if flag can't be loaded
                                  const target = e.target as HTMLImageElement;
                                  target.style.display = 'none';
                                }}
                              />
                            </div>
                          );
                        }
                        return null;
                      })()}
                    </div>
                  ))}
                </div>
                {filteredCountries.length > 50 && (
                  <div className="sticky bottom-0 bg-muted/90 backdrop-blur-sm px-3 py-2 border-t border-border text-center">
                    <span className="text-xs text-muted-foreground">
                      Refine your search for more specific results
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>
          
          {/* Year selector */}
          <div className="mt-4">
            <h3 className="text-sm font-medium mb-2">Year</h3>
            <div className="grid grid-cols-3 gap-2">
              {['2023', '2022', '2021'].map((year) => (
                <button
                  key={year}
                  onClick={() => setSelectedYear(year)}
                  className={`text-xs px-2 py-1 rounded-full ${
                    selectedYear === year 
                      ? 'bg-primary text-primary-foreground' 
                      : 'bg-muted hover:bg-accent hover:text-accent-foreground'
                  }`}
                >
                  {year}
                </button>
              ))}
            </div>
          </div>
          
          <div className="mt-4">
            <h3 className="text-sm font-medium mb-2">Popular Countries</h3>
            <div className="flex flex-wrap gap-2">
              {allCountries.length > 0 ? 
                // Display top 5 countries if available
                allCountries.slice(0, 5).map((country) => (
                  <button
                    key={country.name}
                    onClick={() => handleCountrySelect(country.name)}
                    className="text-xs px-2 py-1 bg-muted rounded-full hover:bg-accent hover:text-accent-foreground"
                  >
                    {country.name}
                  </button>
                )) : 
                // Fallback to hardcoded popular countries if API fetch fails
                ['United States', 'China', 'Germany', 'Japan', 'United Kingdom'].map((country) => (
                  <button
                    key={country}
                    onClick={() => handleCountrySelect(country)}
                    className="text-xs px-2 py-1 bg-muted rounded-full hover:bg-accent hover:text-accent-foreground"
                  >
                    {country}
                  </button>
                ))
              }
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
      
      {/* Drawer for country details */}
      <Sheet 
        open={drawerOpen} 
        onOpenChange={(open) => {
          console.log("Drawer state changed:", open ? "opening" : "closing");
          setDrawerOpen(open);
        }}
      >
        <SheetContent 
          side="right" 
          className="w-full p-0 overflow-y-auto border-l border-border bg-background sm:max-w-md md:max-w-lg lg:max-w-xl transition-all duration-300 ease-in-out"
          onOpenAutoFocus={(e) => e.preventDefault()} // Prevent auto-focus to keep map interactive
        >
          <div className="bg-muted/80 border-b border-border p-6 mb-2">
            <SheetHeader className="mb-0">
              <div className="flex items-center justify-between">
                <SheetTitle className="text-3xl font-bold">Trade Dashboard</SheetTitle>
                <SheetClose asChild>
                  <Button 
                    variant="outline" 
                    size="icon" 
                    className="rounded-full h-8 w-8 border border-border" 
                    onClick={() => {
                      // Clear all selections when closing the drawer
                      setSelectedCountry(null);
                      setSelectedCountryCode(null);
                      setCountrySpecificTradeData([]);
                      setDrawerOpen(false);
                      // Clear search query too
                      setSearchQuery('');
                      setFilteredCountries([]);
                      setShowSuggestions(false);
                    }}
                  >
                    <X className="h-4 w-4" />
                    <span className="sr-only">Close</span>
                  </Button>
                </SheetClose>
              </div>
            </SheetHeader>
          </div>
          
          <div className="p-6 pr-8">
            <ClientOnly>
              {selectedCountry && (
                <div className="mb-4 bg-muted p-4 rounded-lg border border-border">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {selectedCountry && (
                        <div className="w-6 h-4 relative overflow-hidden rounded">
                          {(() => {
                            // Try to get the country code from our database
                            const selectedCountryData = allCountries.find(c => 
                              c.name === selectedCountry
                            );
                            
                            // Get ISO code for flag (prefer database, fallback to static mapping)
                            const isoCode = selectedCountryData?.iso || 
                              COUNTRY_TO_ISO[selectedCountry as keyof typeof COUNTRY_TO_ISO];
                            
                            if (!isoCode) return null;
                            
                            return (
                              <img 
                                src={`https://flagcdn.com/${isoCode.toLowerCase()}.svg`} 
                                alt={`${selectedCountry} flag`}
                                className="w-full h-full object-cover absolute"
                                onError={(e) => {
                                  // Try alternative flag source if primary one fails
                                  const target = e.target as HTMLImageElement;
                                  const upperCaseCode = isoCode.toUpperCase();
                                  // Replace with another flag API
                                  target.src = `https://purecatamphetamine.github.io/country-flag-icons/3x2/${upperCaseCode}.svg`;
                                  
                                  // If second source also fails
                                  target.onerror = () => {
                                    // Use a country emoji fallback
                                    target.style.display = 'none';
                                  };
                                }}
                              />
                            );
                          })()}
                        </div>
                      )}
                      <h2 className="text-xl font-semibold">{selectedCountry}</h2>
                    </div>
                    <Badge variant="outline" className="text-xs px-2 py-1">
                      {(() => {
                        // Try to get the country code from our database
                        const selectedCountryData = allCountries.find(c => 
                          c.name === selectedCountry
                        );
                        
                        // Get country code (prefer database, fallback to static mapping)
                        if (selectedCountryData?.code) {
                          return selectedCountryData.code.toUpperCase();
                        } else if (selectedCountry && COUNTRY_TO_ISO[selectedCountry as keyof typeof COUNTRY_TO_ISO]) {
                          return COUNTRY_TO_ISO[selectedCountry as keyof typeof COUNTRY_TO_ISO].toUpperCase();
                        }
                        
                        return selectedCountryCode || '';
                      })()}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    {countryDataLoading ? 'Loading trade data...' : `Viewing trade data related to ${selectedCountry}`}
                  </p>
                  {error && <p className="text-sm text-red-500 mt-1">{error}</p>}
                </div>
              )}
              
              {/* Global highlights at the top */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                {selectedCountry && selectedCountryCode && countriesTradeData.length > 0 ? (
                  // If a country is selected, show its trade metrics
                  <>
                    {(() => {
                      // Find the selected country data
                      const countryData = countriesTradeData.find(c => c.country === selectedCountryCode);
                      if (!countryData) return null;
                      
                      // Calculate exports and imports percentage of global totals
                      const exportsPercentage = globalTotals ? (countryData.exports / globalTotals.total_exports) * 100 : 0;
                      const importsPercentage = globalTotals ? (countryData.imports / globalTotals.total_imports) * 100 : 0;
                      
                      return (
                        <>
                          <Card className="shadow-md bg-background border border-border rounded-lg">
                            <CardHeader className="pb-2">
                              <CardTitle className="text-sm font-medium text-muted-foreground">Total Exports</CardTitle>
                            </CardHeader>
                            <CardContent>
                              <div className="flex justify-between items-center">
                                <div className="text-2xl font-bold">${formatBillions((countryData.exports / 1000))}</div>
                                <div className="text-xs text-muted-foreground">{exportsPercentage.toFixed(2)}% of global</div>
                              </div>
                            </CardContent>
                          </Card>
                          <Card className="shadow-md bg-background border border-border rounded-lg">
                            <CardHeader className="pb-2">
                              <CardTitle className="text-sm font-medium text-muted-foreground">Total Imports</CardTitle>
                            </CardHeader>
                            <CardContent>
                              <div className="flex justify-between items-center">
                                <div className="text-2xl font-bold">${formatBillions((countryData.imports / 1000))}</div>
                                <div className="text-xs text-muted-foreground">{importsPercentage.toFixed(2)}% of global</div>
                              </div>
                            </CardContent>
                          </Card>
                          <Card className="shadow-md bg-background border border-border rounded-lg">
                            <CardHeader className="pb-2">
                              <CardTitle className="text-sm font-medium text-muted-foreground">Total Trade</CardTitle>
                            </CardHeader>
                            <CardContent>
                              <div className="flex justify-between items-center">
                                <div className="text-2xl font-bold">${formatBillions((countryData.total_trade / 1000))}</div>
                                <div className="text-xs text-muted-foreground">
                                  {globalTotals ? ((countryData.total_trade / globalTotals.total_trade) * 100).toFixed(2) : 0}% of global
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                          <Card className="shadow-md bg-background border border-border rounded-lg">
                            <CardHeader className="pb-2">
                              <CardTitle className="text-sm font-medium text-muted-foreground">Trade Balance</CardTitle>
                            </CardHeader>
                            <CardContent>
                              <div className="flex justify-between items-center">
                                <div className="text-2xl font-bold">${formatBillions(((countryData.exports - countryData.imports) / 1000))}</div>
                                {countryData.exports > countryData.imports ? (
                                  <ArrowUpIcon className="h-4 w-4 text-green-500" />
                                ) : (
                                  <ArrowDownIcon className="h-4 w-4 text-red-500" />
                                )}
                              </div>
                            </CardContent>
                          </Card>
                        </>
                      );
                    })()}
                  </>
                ) : (
                  // Otherwise, show the global highlights
                  mockGlobalHighlights.map((highlight, index) => (
                    <Card key={index} className="shadow-md bg-background border border-border rounded-lg">
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
                  ))
                )}
              </div>
              
              {/* Central content with tabs */}
              <Card className="flex-grow mb-6 shadow-md bg-background border border-border rounded-lg">
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
                          className="px-3 py-1.5 rounded-md text-sm data-[state=active]:bg-muted data-[state=active]:font-medium transition-colors"
                        >
                          <div className="flex items-center space-x-1">
                            <InfoCircledIcon className="h-4 w-4" />
                            <span>Overview</span>
                          </div>
                        </Tabs.Trigger>
                        <Tabs.Trigger 
                          value="statistics" 
                          className="px-3 py-1.5 rounded-md text-sm data-[state=active]:bg-muted data-[state=active]:font-medium transition-colors"
                        >
                          <div className="flex items-center space-x-1">
                            <BarChartIcon className="h-4 w-4" />
                            <span>Statistics</span>
                          </div>
                        </Tabs.Trigger>
                        <Tabs.Trigger 
                          value="relationships" 
                          className="px-3 py-1.5 rounded-md text-sm data-[state=active]:bg-muted data-[state=active]:font-medium transition-colors"
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
                      {selectedCountry && selectedCountryCode && countrySpecificTradeData.length > 0 ? (
                        <div className="space-y-6">
                          <div className="grid grid-cols-3 gap-4">
                            <Card className="bg-background border border-border shadow-sm rounded-lg">
                              <CardHeader className="pb-2">
                                <CardTitle className="text-sm">Region</CardTitle>
                              </CardHeader>
                              <CardContent>
                                <div className="text-xl font-bold">
                                  {countrySpecificTradeData[0]?.region || 'N/A'}
                                </div>
                              </CardContent>
                            </Card>
                            <Card className="bg-background border border-border shadow-sm rounded-lg">
                              <CardHeader className="pb-2">
                                <CardTitle className="text-sm">Sub-Region</CardTitle>
                              </CardHeader>
                              <CardContent>
                                <div className="text-xl font-bold">
                                  {countrySpecificTradeData[0]?.sub_region || 'N/A'}
                                </div>
                              </CardContent>
                            </Card>
                            <Card className="bg-background border border-border shadow-sm rounded-lg">
                              <CardHeader className="pb-2">
                                <CardTitle className="text-sm">Products Count</CardTitle>
                              </CardHeader>
                              <CardContent>
                                <div className="text-xl font-bold">
                                  {countrySpecificTradeData.length}
                                </div>
                              </CardContent>
                            </Card>
                          </div>
                          
                          <div>
                            <h3 className="text-lg font-semibold mb-3">Top Products</h3>
                            <div className="space-y-2">
                              {countrySpecificTradeData.slice(0, 5).map((product, index) => (
                                <div key={index} className="flex justify-between items-center p-2 rounded-md bg-muted/70">
                                  <span>{product.product_name}</span>
                                  <div className="flex items-center space-x-4">
                                    <span className="text-muted-foreground">${formatBillions((product.value / 1000))}</span>
                                    <span className="text-sm">{(product.percent_trade || 0).toFixed(1)}%</span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      ) : regionData ? (
                        <div className="space-y-6">
                          <div className="grid grid-cols-3 gap-4">
                            <Card className="bg-background border border-border shadow-sm rounded-lg">
                              <CardHeader className="pb-2">
                                <CardTitle className="text-sm">Population</CardTitle>
                              </CardHeader>
                              <CardContent>
                                <div className="text-xl font-bold">{regionData.population} million</div>
                              </CardContent>
                            </Card>
                            <Card className="bg-background border border-border shadow-sm rounded-lg">
                              <CardHeader className="pb-2">
                                <CardTitle className="text-sm">GDP</CardTitle>
                              </CardHeader>
                              <CardContent>
                                <div className="text-xl font-bold">{formatValue(regionData.gdp, false, true)}</div>
                              </CardContent>
                            </Card>
                            <Card className="bg-background border border-border shadow-sm rounded-lg">
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
                      {selectedCountry && selectedCountryCode && countrySpecificTradeData.length > 0 ? (
                        <div className="space-y-6">
                          <div className="grid grid-cols-1 gap-6">
                            <div className="bg-muted/70 p-4 rounded-md">
                              <div className="mb-3">
                                <h3 className="text-lg font-semibold">Product Distribution</h3>
                                <p className="text-sm text-muted-foreground">Top products by trade value</p>
                              </div>
                              <div className="space-y-4">
                                {countrySpecificTradeData.slice(0, 10).map((item, index) => (
                                  <div key={index} className="flex justify-between items-center">
                                    <span>{item.product_name}</span>
                                    <span className="font-medium">${formatBillions((item.value / 1000))}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                            
                            <div className="bg-muted/70 p-4 rounded-md">
                              <div className="mb-3">
                                <h3 className="text-lg font-semibold">Trade Flow Distribution</h3>
                                <p className="text-sm text-muted-foreground">Breakdown by import/export</p>
                              </div>
                              <div className="space-y-4">
                                {(() => {
                                  // Group items by trade flow
                                  const groupedByTradeFlow = countrySpecificTradeData.reduce((acc: any, item) => {
                                    const flowType = item.trade_flow || (item.tradeflow_id === 103 ? 'Export' : 'Import');
                                    if (!acc[flowType]) {
                                      acc[flowType] = { total: 0, count: 0 };
                                    }
                                    acc[flowType].total += item.value;
                                    acc[flowType].count += 1;
                                    return acc;
                                  }, {});
                                  
                                  return Object.entries(groupedByTradeFlow).map(([flow, data]: [string, any], index) => (
                                    <div key={index} className="flex justify-between items-center">
                                      <span>{flow} ({data.count} products)</span>
                                      <span className="font-medium">${formatBillions((data.total / 1000))}</span>
                                    </div>
                                  ));
                                })()}
                              </div>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-6">
                          <div className="grid grid-cols-1 gap-6">
                            {mockTradeStatistics.map((statGroup, index) => (
                              <div key={index} className="bg-muted p-4 rounded-lg border border-border">
                                <div className="mb-3">
                                  <h3 className="text-lg font-semibold">{statGroup.title}</h3>
                                  <p className="text-sm text-muted-foreground">{statGroup.description}</p>
                                </div>
                                <div className="space-y-4">
                                  {statGroup.data.map((item, itemIndex) => (
                                    <div key={itemIndex} className="flex justify-between items-center">
                                      <span>{item.name}</span>
                                      <span className="font-medium">{formatValue(item.value, item.isPercentage)}</span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </Tabs.Content>
                    
                    <Tabs.Content value="relationships" className="h-full">
                      {selectedCountry && selectedCountryCode && countrySpecificTradeData.length > 0 ? (
                        <div className="space-y-6">
                          <div>
                            <h3 className="text-lg font-semibold mb-3">HS Code Distribution</h3>
                            <div className="space-y-2">
                              {(() => {
                                // Group products by HS code prefix (first 2 digits)
                                interface HSGroupItem {
                                  code: string;
                                  value: number;
                                  percentage: number;
                                  name: string; // Description for the HS group
                                }
                                
                                const groupedByHS: Record<string, HSGroupItem> = {};
                                
                                // Calculate total trade value
                                const totalValue = countrySpecificTradeData.reduce((sum, item) => sum + item.value, 0);
                                
                                // Group by HS2 code
                                countrySpecificTradeData.forEach(item => {
                                  if (!item.hs_code) return;
                                  
                                  const hs2Code = item.hs_code.substring(0, 2);
                                  const fullName = `${hs2Code}: ${item.product_name.split(' - ')[0] || item.product_name}`;
                                  
                                  if (!groupedByHS[hs2Code]) {
                                    groupedByHS[hs2Code] = {
                                      code: hs2Code,
                                      value: 0,
                                      percentage: 0,
                                      name: fullName
                                    };
                                  }
                                  
                                  groupedByHS[hs2Code].value += item.value;
                                  groupedByHS[hs2Code].percentage = (groupedByHS[hs2Code].value / totalValue) * 100;
                                });
                                
                                // Convert to array and sort by value
                                const hsGroups = Object.values(groupedByHS)
                                  .sort((a, b) => b.value - a.value)
                                  .slice(0, 8); // Show top 8 groups
                                
                                // Generate colors for HS groups
                                const colors = [
                                  "#4361ee", "#3a0ca3", "#7209b7", "#f72585", 
                                  "#4cc9f0", "#4895ef", "#560bad", "#b5179e"
                                ];
                                
                                return hsGroups.map((group, index) => (
                                  <div key={index} className="flex justify-between items-center p-2 rounded-md bg-muted/70">
                                    <div className="flex items-center gap-2">
                                      <div 
                                        className="w-3 h-3 rounded-full" 
                                        style={{ backgroundColor: colors[index % colors.length] }}
                                      ></div>
                                      <span>{group.name}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                      <span className="text-muted-foreground">${formatBillions((group.value / 1000))}</span>
                                      <span className="text-sm">{group.percentage.toFixed(1)}%</span>
                                    </div>
                                  </div>
                                ));
                              })()}
                            </div>
                          </div>
                          
                          <div>
                            <h3 className="text-lg font-semibold mb-3">Trade Flow Distribution</h3>
                            <div className="space-y-2">
                              {(() => {
                                // Group items by trade flow
                                interface TradeFlowItem {
                                  name: string;
                                  value: number;
                                  percentage: number;
                                  count: number;
                                }
                                
                                const groupedByTradeFlow: Record<string, TradeFlowItem> = {};
                                
                                // Calculate total trade value
                                const totalValue = countrySpecificTradeData.reduce((sum, item) => sum + item.value, 0);
                                
                                // Group by trade flow
                                countrySpecificTradeData.forEach(item => {
                                  const flowType = item.trade_flow || (item.tradeflow_id === 103 ? 'Export' : 'Import');
                                  
                                  if (!groupedByTradeFlow[flowType]) {
                                    groupedByTradeFlow[flowType] = {
                                      name: flowType,
                                      value: 0,
                                      percentage: 0,
                                      count: 0
                                    };
                                  }
                                  
                                  groupedByTradeFlow[flowType].value += item.value;
                                  groupedByTradeFlow[flowType].count += 1;
                                  groupedByTradeFlow[flowType].percentage = (groupedByTradeFlow[flowType].value / totalValue) * 100;
                                });
                                
                                // Convert to array
                                const tradeFlows = Object.values(groupedByTradeFlow);
                                
                                return tradeFlows.map((flow, index) => (
                                  <div key={index} className="flex justify-between items-center p-2 rounded-md bg-muted/70">
                                    <span>{flow.name} ({flow.count} products)</span>
                                    <div className="flex items-center gap-2">
                                      <span className="text-muted-foreground">${formatBillions((flow.value / 1000))}</span>
                                      <span className="text-sm">{flow.percentage.toFixed(1)}%</span>
                                    </div>
                                  </div>
                                ));
                              })()}
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-6">
                          <div>
                            <h3 className="text-lg font-semibold mb-3">Product Categories</h3>
                            <div className="space-y-2">
                              {mockTradeRelationships.productCategories.map((category, index) => (
                                <div key={index} className="flex justify-between items-center p-2 rounded-md bg-muted/70">
                                  <div className="flex items-center gap-2">
                                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: category.color }}></div>
                                    <span>{category.name}</span>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <span className="text-muted-foreground">{formatValue(category.value)}</span>
                                    <span className="text-sm">{category.percentage.toFixed(1)}%</span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                          
                          <div>
                            <h3 className="text-lg font-semibold mb-3">Top Trading Partners</h3>
                            <div className="space-y-2">
                              {mockTradeRelationships.tradingPartners.map((partner, index) => (
                                <div key={index} className="flex justify-between items-center p-3 rounded-lg bg-muted border border-border">
                                  <span>{partner.name}</span>
                                  <div className="flex items-center gap-2">
                                    <span className="text-muted-foreground">{formatValue(partner.value)}</span>
                                    <span className="text-sm">{partner.percentage.toFixed(1)}%</span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      )}
                    </Tabs.Content>
                  </CardContent>
                </Tabs.Root>
              </Card>
              
              {/* Bottom insights */}
              <Card className="shadow-md bg-background border border-border rounded-lg">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">Latest Insights</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Global trade growth projected to increase by 3.5% in 2024, driven by technology sector expansion and recovery in manufacturing output across developing economies.
                  </p>
                </CardContent>
              </Card>
            </ClientOnly>
          </div>
        </SheetContent>
      </Sheet>
      
      {/* Zoom controls - only show when map is ready */}
      {mapReady && (
        <div className="fixed bottom-12 left-6 z-20 flex flex-col space-y-2">
          <button
            onClick={() => {
              console.log("Zoom in clicked, instance:", window.d3MapInstance);
              if (typeof window !== 'undefined' && window.d3MapInstance?.zoomIn) {
                window.d3MapInstance.zoomIn();
              } else {
                console.log("Zoom in method not available");
              }
            }}
            className="bg-background/80 backdrop-blur-sm text-foreground p-3 rounded-full shadow-md hover:bg-accent border border-border"
            aria-label="Zoom in"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-5 w-5"
            >
              <line x1="12" y1="5" x2="12" y2="19"></line>
              <line x1="5" y1="12" x2="19" y2="12"></line>
            </svg>
          </button>
          
          <button
            onClick={() => {
              console.log("Zoom out clicked, instance:", window.d3MapInstance);
              if (typeof window !== 'undefined' && window.d3MapInstance?.zoomOut) {
                window.d3MapInstance.zoomOut();
              } else {
                console.log("Zoom out method not available");
              }
            }}
            className="bg-background/80 backdrop-blur-sm text-foreground p-3 rounded-full shadow-md hover:bg-accent border border-border"
            aria-label="Zoom out"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-5 w-5"
            >
              <line x1="5" y1="12" x2="19" y2="12"></line>
            </svg>
          </button>
          
          <button
            onClick={() => {
              console.log("Reset zoom clicked, instance:", window.d3MapInstance);
              if (typeof window !== 'undefined' && window.d3MapInstance?.resetZoom) {
                window.d3MapInstance.resetZoom();
              } else {
                console.log("Reset zoom method not available");
              }
            }}
            className="bg-background/80 backdrop-blur-sm text-foreground p-3 rounded-full shadow-md hover:bg-accent border border-border"
            aria-label="Reset zoom"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-5 w-5"
            >
              <polyline points="1 4 1 10 7 10"></polyline>
              <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"></path>
            </svg>
          </button>
        </div>
      )}
    </div>
  );
}

// Need to expose the D3 map instance globally for zoom controls
declare global {
  interface Window {
    d3MapInstance?: {
      zoomIn: () => void;
      zoomOut: () => void;
      resetZoom: () => void;
    };
  }
} 