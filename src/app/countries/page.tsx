"use client"

import React, { useEffect, useState, Suspense } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { formatNumber, formatCurrency } from "@/lib/utils";

// Map of country codes to regions
const COUNTRY_INFO: Record<string, { name: string, region: string }> = {
  'CN': { name: 'China', region: 'Asia' },
  'US': { name: 'United States', region: 'North America' },
  'JP': { name: 'Japan', region: 'Asia' },
  'KR': { name: 'South Korea', region: 'Asia' },
  'SG': { name: 'Singapore', region: 'Asia' },
  'MY': { name: 'Malaysia', region: 'Asia' },
  'TH': { name: 'Thailand', region: 'Asia' },
  'VN': { name: 'Vietnam', region: 'Asia' },
  'PH': { name: 'Philippines', region: 'Asia' },
  'ID': { name: 'Indonesia', region: 'Asia' },
  'AU': { name: 'Australia', region: 'Oceania' },
  'NZ': { name: 'New Zealand', region: 'Oceania' },
  'IN': { name: 'India', region: 'Asia' },
  'GB': { name: 'United Kingdom', region: 'Europe' },
  'DE': { name: 'Germany', region: 'Europe' },
  'FR': { name: 'France', region: 'Europe' },
  'IT': { name: 'Italy', region: 'Europe' },
  'CA': { name: 'Canada', region: 'North America' },
  'BR': { name: 'Brazil', region: 'South America' },
  'RU': { name: 'Russia', region: 'Europe/Asia' },
  'ZA': { name: 'South Africa', region: 'Africa' },
};

interface CountryData {
  country: string;
  import_value: number;
  export_value: number;
  total_value: number;
  min_year: string;
  max_year: string;
  trade_count: number;
}

async function getCountriesData() {
  try {
    const response = await fetch('/api/total-trade?limit=50');
    if (!response.ok) {
      throw new Error('Failed to fetch countries data');
    }
    const data = await response.json();
    return data.tradeSummary;
  } catch (error) {
    console.error('Error fetching countries data:', error);
    return [];
  }
}

function CountriesLoading() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-10 w-1/4 mb-6" />
      <Skeleton className="h-8 w-full mb-4" />
      {Array.from({ length: 10 }).map((_, i) => (
        <Skeleton key={i} className="h-12 w-full mb-2" />
      ))}
    </div>
  );
}

function CountriesList() {
  const [countries, setCountries] = useState<CountryData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        setIsLoading(true);
        const data = await getCountriesData();
        setCountries(data);
        setError(null);
      } catch (err) {
        setError('Failed to load countries data');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    }

    loadData();
  }, []);

  if (isLoading) {
    return <CountriesLoading />;
  }

  if (error) {
    return <div className="text-red-500">{error}</div>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Countries by Trade Volume</CardTitle>
        <CardDescription>Top 50 countries ranked by total trade value</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Country</TableHead>
                <TableHead>Region</TableHead>
                <TableHead>Total Trade</TableHead>
                <TableHead>Imports</TableHead>
                <TableHead>Exports</TableHead>
                <TableHead>Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {countries.map((country) => (
                <TableRow key={country.country}>
                  <TableCell className="font-medium">
                    {COUNTRY_INFO[country.country]?.name || country.country}
                  </TableCell>
                  <TableCell>
                    {COUNTRY_INFO[country.country]?.region || 'Unknown'}
                  </TableCell>
                  <TableCell>{formatCurrency(country.total_value)}</TableCell>
                  <TableCell>{formatCurrency(country.import_value)}</TableCell>
                  <TableCell>{formatCurrency(country.export_value)}</TableCell>
                  <TableCell>
                    <Link 
                      href={`/country/${country.country}`}
                      className="text-blue-600 hover:text-blue-800 underline"
                    >
                      View Profile
                    </Link>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}

export default function CountriesPage() {
  return (
    <div className="container mx-auto py-6 px-4 sm:px-6 lg:px-8">
      <h1 className="text-2xl sm:text-3xl font-bold mb-6">Country Trade Profiles</h1>
      <p className="text-gray-600 dark:text-gray-400 mb-8">
        Browse trade data by country. Click on a country to view detailed trade information and statistics.
      </p>
      
      <CountriesList />
    </div>
  );
} 