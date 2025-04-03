"use client"

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { formatNumber, formatCurrency } from "@/lib/utils";
import { buildTradeUrl } from "@/types/api-urls";

interface TradeData {
  country_name: string;
  year: string;
  total_trade: number;
  export_value: number;
  import_value: number;
  top_products: Product[];
}

interface Product {
  hs_code: string;
  description: string;
  value: number;
  percent: number;
}

function LoadingSkeleton() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-10 w-1/2 mb-6" />
      <Skeleton className="h-8 w-1/3 mb-4" />
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-32 w-full rounded-lg" />
        ))}
      </div>
      
      <Skeleton className="h-8 w-1/4 mb-4" />
      {Array.from({ length: 5 }).map((_, i) => (
        <Skeleton key={i} className="h-12 w-full mb-2" />
      ))}
    </div>
  );
}

async function getCountryTradeData(countryCode: string, tradeFlow?: string, year?: string) {
  try {
    const url = buildTradeUrl({
      country: countryCode,
      tradeFlow: tradeFlow as any,
      year
    });
    
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error('Failed to fetch country trade data');
    }
    
    const data = await response.json();
    return data.data;
  } catch (error) {
    console.error('Error fetching country trade data:', error);
    return null;
  }
}

export default function CountryDetailPage() {
  const params = useParams();
  const countryCode = params?.code as string || '';
  
  const [tradeData, setTradeData] = useState<TradeData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedYear, setSelectedYear] = useState<string>('2023');
  const [activeTab, setActiveTab] = useState<string>('overview');
  
  const availableYears = ['2023', '2022', '2021', '2020', '2019'];

  useEffect(() => {
    async function loadData() {
      try {
        setIsLoading(true);
        const data = await getCountryTradeData(countryCode, undefined, selectedYear);
        setTradeData(data);
        setError(null);
      } catch (err) {
        setError('Failed to load country trade data');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    }

    if (countryCode) {
      loadData();
    }
  }, [countryCode, selectedYear]);

  if (!countryCode) {
    return <div className="text-red-500">No country code provided</div>;
  }

  if (isLoading) {
    return <LoadingSkeleton />;
  }

  if (error || !tradeData) {
    return <div className="text-red-500">{error || 'No data available'}</div>;
  }

  return (
    <div className="container mx-auto py-6 px-4 sm:px-6 lg:px-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">
            {tradeData.country_name} Trade Profile
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Trade statistics and data for {tradeData.country_name}
          </p>
        </div>
        
        <div className="mt-4 md:mt-0 flex items-center space-x-2">
          <span className="text-sm font-medium">Year:</span>
          <select 
            value={selectedYear} 
            onChange={(e) => setSelectedYear(e.target.value)}
            className="border rounded p-1 text-sm"
          >
            {availableYears.map(year => (
              <option key={year} value={year}>{year}</option>
            ))}
          </select>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Total Trade</CardTitle>
            <CardDescription>Combined imports and exports</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{formatCurrency(tradeData.total_trade)}</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Exports</CardTitle>
            <CardDescription>Goods sent to other countries</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{formatCurrency(tradeData.export_value)}</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Imports</CardTitle>
            <CardDescription>Goods received from other countries</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{formatCurrency(tradeData.import_value)}</p>
          </CardContent>
        </Card>
      </div>
      
      <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="exports">Exports</TabsTrigger>
          <TabsTrigger value="imports">Imports</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview">
          <Card>
            <CardHeader>
              <CardTitle>Top Products</CardTitle>
              <CardDescription>Most traded products in {selectedYear}</CardDescription>
            </CardHeader>
            <CardContent>
              {tradeData.top_products && tradeData.top_products.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>HS Code</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Value</TableHead>
                      <TableHead>% of Trade</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {tradeData.top_products.map((product) => (
                      <TableRow key={product.hs_code}>
                        <TableCell>{product.hs_code}</TableCell>
                        <TableCell>{product.description}</TableCell>
                        <TableCell>{formatCurrency(product.value)}</TableCell>
                        <TableCell>{formatNumber(product.percent)}%</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <p className="text-gray-500">No product data available</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="exports">
          <ExportsTab 
            countryCode={countryCode} 
            countryName={tradeData.country_name} 
            year={selectedYear} 
          />
        </TabsContent>
        
        <TabsContent value="imports">
          <ImportsTab 
            countryCode={countryCode} 
            countryName={tradeData.country_name} 
            year={selectedYear} 
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function ExportsTab({ countryCode, countryName, year }: { countryCode: string, countryName: string, year: string }) {
  const [exportData, setExportData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    async function loadExportData() {
      try {
        setIsLoading(true);
        const data = await getCountryTradeData(countryCode, 'exports', year);
        setExportData(data);
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    }
    
    loadExportData();
  }, [countryCode, year]);
  
  if (isLoading) {
    return <Skeleton className="h-64 w-full" />;
  }
  
  if (!exportData || !exportData.top_products || exportData.top_products.length === 0) {
    return <p className="text-gray-500">No export data available</p>;
  }
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>{countryName} Exports</CardTitle>
        <CardDescription>Top products exported in {year}</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>HS Code</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Value</TableHead>
              <TableHead>% of Exports</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {exportData.top_products.map((product: Product) => (
              <TableRow key={product.hs_code}>
                <TableCell>{product.hs_code}</TableCell>
                <TableCell>{product.description}</TableCell>
                <TableCell>{formatCurrency(product.value)}</TableCell>
                <TableCell>{formatNumber(product.percent)}%</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

function ImportsTab({ countryCode, countryName, year }: { countryCode: string, countryName: string, year: string }) {
  const [importData, setImportData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    async function loadImportData() {
      try {
        setIsLoading(true);
        const data = await getCountryTradeData(countryCode, 'imports', year);
        setImportData(data);
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    }
    
    loadImportData();
  }, [countryCode, year]);
  
  if (isLoading) {
    return <Skeleton className="h-64 w-full" />;
  }
  
  if (!importData || !importData.top_products || importData.top_products.length === 0) {
    return <p className="text-gray-500">No import data available</p>;
  }
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>{countryName} Imports</CardTitle>
        <CardDescription>Top products imported in {year}</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>HS Code</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Value</TableHead>
              <TableHead>% of Imports</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {importData.top_products.map((product: Product) => (
              <TableRow key={product.hs_code}>
                <TableCell>{product.hs_code}</TableCell>
                <TableCell>{product.description}</TableCell>
                <TableCell>{formatCurrency(product.value)}</TableCell>
                <TableCell>{formatNumber(product.percent)}%</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
} 