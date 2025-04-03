"use client"

import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { formatNumber, formatCurrency } from "@/lib/utils";
import { buildCountriesRankingsUrl } from "@/types/api-urls";
import Link from 'next/link';

interface CountryRank {
  rank: number;
  code: string;
  name: string;
  region: string;
  sub_region: string;
  exports: number;
  imports: number;
  total_trade: number;
  value: number;
}

function LoadingSkeleton() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-10 w-1/3 mb-6" />
      <Skeleton className="h-8 w-full mb-4" />
      {Array.from({ length: 10 }).map((_, i) => (
        <Skeleton key={i} className="h-12 w-full mb-2" />
      ))}
    </div>
  );
}

async function getCountryRankings(type: string, year?: string, limit: number = 20) {
  try {
    const url = buildCountriesRankingsUrl({
      type: type as any,
      year,
      limit
    });
    
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error('Failed to fetch country rankings');
    }
    
    const data = await response.json();
    
    let results: CountryRank[] = [];
    
    if (type === 'exports' && data.data.topExporters) {
      results = data.data.topExporters.map((country: any, index: number) => ({
        ...country,
        rank: index + 1,
        value: country.exports
      }));
    } else if (type === 'imports' && data.data.topImporters) {
      results = data.data.topImporters.map((country: any, index: number) => ({
        ...country,
        rank: index + 1,
        value: country.imports
      }));
    } else if (data.data.topTraders) {
      results = data.data.topTraders.map((country: any, index: number) => ({
        ...country,
        rank: index + 1,
        value: country.total_trade
      }));
    }
    
    return results;
  } catch (error) {
    console.error('Error fetching country rankings:', error);
    return [];
  }
}

export default function CountryRankingsPage() {
  const [rankingsData, setRankingsData] = useState<CountryRank[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedYear, setSelectedYear] = useState<string>('2023');
  const [activeTab, setActiveTab] = useState<string>('total');
  
  const availableYears = ['2023', '2022', '2021', '2020', '2019'];
  const limit = 20;

  useEffect(() => {
    async function loadData() {
      try {
        setIsLoading(true);
        const data = await getCountryRankings(activeTab, selectedYear, limit);
        setRankingsData(data);
        setError(null);
      } catch (err) {
        setError('Failed to load country rankings');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    }

    loadData();
  }, [activeTab, selectedYear, limit]);

  function getTabTitle() {
    switch (activeTab) {
      case 'exports':
        return 'Top Exporting Countries';
      case 'imports':
        return 'Top Importing Countries';
      case 'total':
      default:
        return 'Top Trading Countries';
    }
  }

  return (
    <div className="container mx-auto py-6 px-4 sm:px-6 lg:px-8">
      <h1 className="text-2xl sm:text-3xl font-bold mb-6">Global Trade Rankings</h1>
      <p className="text-gray-600 dark:text-gray-400 mb-8">
        View global rankings of countries by trade volume, imports, and exports.
      </p>
      
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6">
        <div>
          <h2 className="text-xl sm:text-2xl font-semibold">
            {getTabTitle()} ({selectedYear})
          </h2>
        </div>
        
        <div className="mt-4 sm:mt-0 flex items-center space-x-2">
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
      
      <Tabs defaultValue="total" value={activeTab} onValueChange={setActiveTab} className="mb-6">
        <TabsList>
          <TabsTrigger value="total">Total Trade</TabsTrigger>
          <TabsTrigger value="exports">Exports</TabsTrigger>
          <TabsTrigger value="imports">Imports</TabsTrigger>
        </TabsList>
      </Tabs>
      
      <Card>
        <CardContent className="p-6">
          {isLoading ? (
            <LoadingSkeleton />
          ) : error ? (
            <div className="text-red-500">{error}</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-16">Rank</TableHead>
                  <TableHead>Country</TableHead>
                  <TableHead>Region</TableHead>
                  <TableHead>Sub-Region</TableHead>
                  <TableHead className="text-right">
                    {activeTab === 'exports' ? 'Export Value' : 
                     activeTab === 'imports' ? 'Import Value' : 'Total Trade'}
                  </TableHead>
                  <TableHead className="w-24">Profile</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rankingsData.map((country) => (
                  <TableRow key={country.code}>
                    <TableCell className="font-medium">{country.rank}</TableCell>
                    <TableCell>{country.name || country.code}</TableCell>
                    <TableCell>{country.region || 'Unknown'}</TableCell>
                    <TableCell>{country.sub_region || 'Unknown'}</TableCell>
                    <TableCell className="text-right">{formatCurrency(country.value)}</TableCell>
                    <TableCell>
                      <Link
                        href={`/country/${country.code}`}
                        className="text-blue-600 hover:text-blue-800 underline"
                      >
                        View
                      </Link>
                    </TableCell>
                  </TableRow>
                ))}
                
                {rankingsData.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-4 text-gray-500">
                      No data available for the selected criteria.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
} 