"use client"

import React, { useState } from 'react';
import { TotalTradeMap } from '@/components/TotalTradeMap';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { formatNumber, formatCurrency } from "@/lib/utils";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { CountryApiResponse } from "@/types/country-api";
import { AlertCircle } from "lucide-react";

// Map of country codes to names
const COUNTRY_NAMES: Record<string, string> = {
  'CN': 'China',
  'US': 'United States',
  'JP': 'Japan',
  'KR': 'South Korea',
  'SG': 'Singapore',
  'MY': 'Malaysia',
  'TH': 'Thailand',
  'VN': 'Vietnam',
  'PH': 'Philippines',
  'ID': 'Indonesia',
  'AU': 'Australia',
  'NZ': 'New Zealand',
  'IN': 'India',
  'GB': 'United Kingdom',
  'DE': 'Germany',
  'FR': 'France',
  'IT': 'Italy',
  'CA': 'Canada',
  'BR': 'Brazil',
  'RU': 'Russia',
  'ZA': 'South Africa',
};

export default function TradeMapPage() {
  const [selectedCountry, setSelectedCountry] = useState<string | null>(null);
  const [countryData, setCountryData] = useState<CountryApiResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCountrySelect = async (countryCode: string) => {
    if (!countryCode) return;
    
    setSelectedCountry(countryCode);
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`/api/country/${countryCode}?include_products=true`);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch country data: ${response.statusText}`);
      }
      
      const data = await response.json();
      setCountryData(data);
    } catch (err) {
      console.error('Error fetching country data:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch country data');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-6 px-4 sm:px-6 lg:px-8">
      <h1 className="text-2xl sm:text-3xl font-bold mb-2 sm:mb-4">Global Trade Flows</h1>
      <p className="text-gray-600 dark:text-gray-400 mb-6 sm:mb-8">
        Visualize total trade volumes between countries. The map shows total trade value by country, with darker colors representing higher trade volumes.
      </p>
      
      <div className="grid grid-cols-1 gap-6 sm:gap-8">
        <Card className="shadow-sm">
          <CardHeader className="pb-2 sm:pb-4">
            <CardTitle>Trade Volume Map</CardTitle>
            <CardDescription>
              Countries are colored based on their total trade value (imports + exports). Click on a country to view its trade profile below.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="aspect-[16/9] w-full h-auto mb-4">
              <TotalTradeMap onRegionSelect={handleCountrySelect} />
            </div>
          </CardContent>
        </Card>

        {selectedCountry && (
          <Card className="shadow-sm">
            <CardHeader className="pb-2 sm:pb-4">
              <CardTitle>
                {COUNTRY_NAMES[selectedCountry] || selectedCountry} Trade Profile
              </CardTitle>
              <CardDescription>
                Detailed trade information and statistics
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <CountryDetailSkeleton />
              ) : error ? (
                <div className="flex items-center gap-2 text-red-500">
                  <AlertCircle size={16} />
                  <p>{error}</p>
                </div>
              ) : countryData ? (
                <CountryDetailContent data={countryData} />
              ) : (
                <p>Select a country on the map to view its trade profile</p>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

function CountryDetailSkeleton() {
  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-24 sm:h-32 rounded-md" />
        ))}
      </div>
      
      <div className="space-y-2">
        <Skeleton className="h-6 w-1/4" />
        <Skeleton className="h-32 sm:h-40 w-full rounded-md" />
      </div>
    </div>
  );
}

function CountryDetailContent({ data }: { data: CountryApiResponse }) {
  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Total Trade</CardTitle>
            <CardDescription>Total value of imports and exports</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl font-bold">
              {formatCurrency(data.summary.total_value)}
            </div>
            <p className="text-gray-500 text-sm">
              Based on {formatNumber(data.summary.trade_count)} transactions
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Imports</CardTitle>
            <CardDescription>Total value of imported goods</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl font-bold">
              {formatCurrency(data.summary.import_value)}
            </div>
            <p className="text-gray-500 text-sm">
              {((data.summary.import_value / data.summary.total_value) * 100).toFixed(1)}% of total trade
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Exports</CardTitle>
            <CardDescription>Total value of exported goods</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl font-bold">
              {formatCurrency(data.summary.export_value)}
            </div>
            <p className="text-gray-500 text-sm">
              {((data.summary.export_value / data.summary.total_value) * 100).toFixed(1)}% of total trade
            </p>
          </CardContent>
        </Card>
      </div>

      {data.productCategories && (
        <Tabs defaultValue="imports">
          <TabsList className="mb-2">
            <TabsTrigger value="imports">Top Import Categories</TabsTrigger>
            <TabsTrigger value="exports">Top Export Categories</TabsTrigger>
          </TabsList>
          
          <TabsContent value="imports">
            <Card>
              <CardContent className="pt-4 sm:pt-6 overflow-auto">
                {data.productCategories.imports.length > 0 ? (
                  <div className="max-h-[400px] overflow-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Product Category</TableHead>
                          <TableHead>HS Code</TableHead>
                          <TableHead>Value</TableHead>
                          <TableHead>Transactions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {data.productCategories.imports.map((product) => (
                          <TableRow key={product.category_id}>
                            <TableCell className="font-medium">{product.product_name}</TableCell>
                            <TableCell>{product.product_code}</TableCell>
                            <TableCell>{formatCurrency(product.value)}</TableCell>
                            <TableCell>{formatNumber(product.transaction_count)}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                ) : (
                  <p className="text-center py-4 text-gray-500">No import category data available</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="exports">
            <Card>
              <CardContent className="pt-4 sm:pt-6 overflow-auto">
                {data.productCategories.exports.length > 0 ? (
                  <div className="max-h-[400px] overflow-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Product Category</TableHead>
                          <TableHead>HS Code</TableHead>
                          <TableHead>Value</TableHead>
                          <TableHead>Transactions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {data.productCategories.exports.map((product) => (
                          <TableRow key={product.category_id}>
                            <TableCell className="font-medium">{product.product_name}</TableCell>
                            <TableCell>{product.product_code}</TableCell>
                            <TableCell>{formatCurrency(product.value)}</TableCell>
                            <TableCell>{formatNumber(product.transaction_count)}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                ) : (
                  <p className="text-center py-4 text-gray-500">No export category data available</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
} 