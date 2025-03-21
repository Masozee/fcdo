"use client"

import React, { useState, useEffect } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowUpDown, ChevronDown, Download, Search } from "lucide-react";
import { formatCurrency, formatNumber } from "@/lib/utils";

// Type definitions
interface Column {
  key: string;
  header: string;
  sortable?: boolean;
  renderCell?: (value: unknown, row: Record<string, unknown>) => React.ReactNode;
}

// Props for the AdvancedDataTable component
interface AdvancedDataTableProps {
  dataType: 'countries' | 'products' | 'trends';
}

// Type for trade data
interface TradeData {
  country?: string;
  product_code?: string;
  product_name?: string;
  code?: string;  // For product code
  name?: string;  // For product name
  year?: number | string;
  import_value?: number;
  export_value?: number;
  total_value?: number;
  trade_count?: number;
  transaction_count?: number;  // For product transactions
  min_year?: string;
  max_year?: string;
  value?: number;  // For simplified total value in some cases
}

// Mock data for countries
const MOCK_COUNTRIES: TradeData[] = [
  { country: 'China', import_value: 194803613, export_value: 188642651, total_value: 383446265, min_year: '2023-01-01', max_year: '2023-01-01', trade_count: 9756 },
  { country: 'United States', import_value: 150000000, export_value: 175000000, total_value: 325000000, min_year: '2023-01-01', max_year: '2023-01-01', trade_count: 8500 },
  { country: 'Japan', import_value: 100000000, export_value: 120000000, total_value: 220000000, min_year: '2023-01-01', max_year: '2023-01-01', trade_count: 6200 },
  { country: 'Germany', import_value: 95000000, export_value: 110000000, total_value: 205000000, min_year: '2023-01-01', max_year: '2023-01-01', trade_count: 5800 },
  { country: 'United Kingdom', import_value: 85000000, export_value: 90000000, total_value: 175000000, min_year: '2023-01-01', max_year: '2023-01-01', trade_count: 4900 },
  { country: 'France', import_value: 75000000, export_value: 80000000, total_value: 155000000, min_year: '2023-01-01', max_year: '2023-01-01', trade_count: 4200 },
  { country: 'South Korea', import_value: 65000000, export_value: 70000000, total_value: 135000000, min_year: '2023-01-01', max_year: '2023-01-01', trade_count: 3800 },
  { country: 'Canada', import_value: 60000000, export_value: 65000000, total_value: 125000000, min_year: '2023-01-01', max_year: '2023-01-01', trade_count: 3600 },
  { country: 'Italy', import_value: 55000000, export_value: 60000000, total_value: 115000000, min_year: '2023-01-01', max_year: '2023-01-01', trade_count: 3200 },
  { country: 'Spain', import_value: 45000000, export_value: 50000000, total_value: 95000000, min_year: '2023-01-01', max_year: '2023-01-01', trade_count: 2700 },
];

// Mock data for products
const MOCK_PRODUCTS: TradeData[] = [
  { code: '84', name: 'Machinery and mechanical appliances', value: 150000000, transaction_count: 3500 },
  { code: '85', name: 'Electrical machinery and equipment', value: 120000000, transaction_count: 3000 },
  { code: '87', name: 'Vehicles', value: 110000000, transaction_count: 2800 },
  { code: '30', name: 'Pharmaceutical products', value: 100000000, transaction_count: 2500 },
  { code: '39', name: 'Plastics and articles thereof', value: 90000000, transaction_count: 2200 },
  { code: '90', name: 'Optical, photographic instruments', value: 80000000, transaction_count: 2000 },
  { code: '29', name: 'Organic chemicals', value: 70000000, transaction_count: 1800 },
  { code: '73', name: 'Articles of iron or steel', value: 60000000, transaction_count: 1500 },
  { code: '72', name: 'Iron and steel', value: 50000000, transaction_count: 1200 },
  { code: '61', name: 'Articles of apparel and clothing accessories', value: 40000000, transaction_count: 1000 },
];

// Mock data for trends
const MOCK_TRENDS: TradeData[] = [
  { year: 2023, import_value: 800000000, export_value: 850000000, total_value: 1650000000, trade_count: 45000 },
  { year: 2022, import_value: 750000000, export_value: 800000000, total_value: 1550000000, trade_count: 42000 },
  { year: 2021, import_value: 700000000, export_value: 750000000, total_value: 1450000000, trade_count: 39000 },
  { year: 2020, import_value: 650000000, export_value: 700000000, total_value: 1350000000, trade_count: 36000 },
  { year: 2019, import_value: 600000000, export_value: 650000000, total_value: 1250000000, trade_count: 33000 },
];

export function AdvancedDataTable({ dataType }: AdvancedDataTableProps) {
  // State management
  const [data, setData] = useState<TradeData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [sortField, setSortField] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [year, setYear] = useState<string>('all');
  // Always use mock data for demonstration
  const [useMockData, setUseMockData] = useState(true);

  // Define columns based on data type
  const columns = React.useMemo<Column[]>(() => {
    return dataType === 'countries' ? [
      { key: 'country', header: 'Country', sortable: true },
      { 
        key: 'total_value', 
        header: 'Total Trade', 
        sortable: true,
        renderCell: (value: unknown) => formatCurrency(value as number)
      },
      { 
        key: 'import_value', 
        header: 'Imports', 
        sortable: true,
        renderCell: (value: unknown) => formatCurrency(value as number)
      },
      { 
        key: 'export_value', 
        header: 'Exports', 
        sortable: true,
        renderCell: (value: unknown) => formatCurrency(value as number)
      },
      { 
        key: 'actions', 
        header: 'Actions',
        renderCell: (_: unknown, row: Record<string, unknown>) => (
          <Button 
            variant="outline" 
            size="sm"
            asChild
          >
            <a href={`/country/${row.country}`}>View</a>
          </Button>
        )
      }
    ] : dataType === 'products' ? [
      { key: 'code', header: 'HS Code', sortable: true },
      { key: 'name', header: 'Product Name', sortable: true },
      { 
        key: 'value', 
        header: 'Trade Value', 
        sortable: true,
        renderCell: (value: unknown) => formatCurrency(value as number)
      }
    ] : dataType === 'trends' ? [
      { key: 'year', header: 'Year', sortable: true },
      { 
        key: 'total_value', 
        header: 'Total Trade', 
        sortable: true,
        renderCell: (value: unknown) => formatCurrency(value as number)
      },
      { 
        key: 'import_value', 
        header: 'Imports', 
        sortable: true,
        renderCell: (value: unknown) => formatCurrency(value as number)
      },
      { 
        key: 'export_value', 
        header: 'Exports', 
        sortable: true,
        renderCell: (value: unknown) => formatCurrency(value as number)
      }
    ] : [];
  }, [dataType]);

  // Fetch data based on data type
  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      setError(null);

      try {
        if (useMockData) {
          // Use mock data for demonstration purposes
          let mockData: TradeData[] = [];
          
          switch (dataType) {
            case 'countries':
              mockData = MOCK_COUNTRIES;
              setTotalItems(MOCK_COUNTRIES.length);
              break;
            case 'products':
              mockData = MOCK_PRODUCTS;
              setTotalItems(MOCK_PRODUCTS.length);
              break;
            case 'trends':
              mockData = MOCK_TRENDS;
              setTotalItems(MOCK_TRENDS.length);
              break;
          }
          
          setData(mockData);
          setTotalPages(Math.ceil(mockData.length / limit));
          
          // Simulate network delay
          setTimeout(() => {
            setLoading(false);
          }, 500);
          
          return;
        }
        
        // Real API request implementation omitted since we're using mock data
        
      } catch (err) {
        console.error('Error fetching data:', err);
        setError(err instanceof Error ? err.message : 'Unknown error occurred');
        setData([]);
      } finally {
        if (!useMockData) {
          setLoading(false);
        }
      }
    }

    fetchData();
  }, [dataType, page, limit, sortField, sortDirection, year, useMockData]);

  // Handle sorting
  const handleSort = (key: string) => {
    if (sortField === key) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(key);
      setSortDirection('desc'); // Default to descending on new sort field
    }
    setPage(1);
  };

  // Render loading skeleton
  const renderSkeleton = () => (
    <>
      {Array.from({ length: limit }).map((_, index) => (
        <TableRow key={`skeleton-${index}`}>
          {columns.map((column, colIndex) => (
            <TableCell key={`skeleton-cell-${colIndex}`}>
              <Skeleton className="h-8 w-full" />
            </TableCell>
          ))}
        </TableRow>
      ))}
    </>
  );

  return (
    <div>
      <div className="flex justify-between mb-6">
        <div className="flex gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Year</label>
            <Select value={year} onValueChange={(value: string) => setYear(value)}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Select Year" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Years</SelectItem>
                <SelectItem value="2023">2023</SelectItem>
                <SelectItem value="2022">2022</SelectItem>
                <SelectItem value="2021">2021</SelectItem>
                <SelectItem value="2020">2020</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Rows per page</label>
            <Select value={limit.toString()} onValueChange={(value: string) => setLimit(parseInt(value))}>
              <SelectTrigger className="w-[120px]">
                <SelectValue placeholder="Rows" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="10">10 rows</SelectItem>
                <SelectItem value="25">25 rows</SelectItem>
                <SelectItem value="50">50 rows</SelectItem>
                <SelectItem value="100">100 rows</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        
        <div className="flex items-end">
          <Button variant="outline" className="gap-2">
            <Download className="h-4 w-4" />
            Export
          </Button>
        </div>
      </div>
      
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              {columns.map((column, index) => (
                <TableHead 
                  key={`header-${index}`}
                  className={column.sortable ? 'cursor-pointer select-none' : ''}
                  onClick={() => column.sortable && handleSort(column.key)}
                >
                  <div className="flex items-center">
                    {column.header}
                    {column.sortable && (
                      sortField === column.key ? (
                        <ArrowUpDown className="ml-1 h-4 w-4" />
                      ) : (
                        <ChevronDown className="ml-1 h-4 w-4 opacity-50" />
                      )
                    )}
                  </div>
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              renderSkeleton()
            ) : error ? (
              <TableRow>
                <TableCell colSpan={columns.length} className="text-center py-8 text-red-500">
                  Error loading data: {error}
                </TableCell>
              </TableRow>
            ) : data.length > 0 ? (
              data.map((row, rowIndex) => (
                <TableRow key={`row-${rowIndex}`}>
                  {columns.map((column, cellIndex) => (
                    <TableCell key={`cell-${rowIndex}-${cellIndex}`}>
                      {column.renderCell 
                        ? column.renderCell(row[column.key as keyof TradeData], row as Record<string, unknown>)
                        : row[column.key as keyof TradeData]
                      }
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="text-center py-8 text-gray-500">
                  No data available
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      
      {/* Pagination */}
      {data.length > 0 && (
        <div className="flex items-center justify-between mt-4">
          <div className="text-sm text-gray-600">
            Showing {Math.min((page - 1) * limit + 1, totalItems)} to {Math.min(page * limit, totalItems)} of {totalItems} entries
          </div>
          
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(Math.max(1, page - 1))}
              disabled={page === 1}
            >
              Previous
            </Button>
            
            {[...Array(Math.min(5, totalPages))].map((_, i) => {
              const pageNum = page - 2 + i;
              if (pageNum > 0 && pageNum <= totalPages) {
                return (
                  <Button
                    key={pageNum}
                    variant={pageNum === page ? "default" : "outline"}
                    size="sm"
                    onClick={() => setPage(pageNum)}
                  >
                    {pageNum}
                  </Button>
                );
              }
              return null;
            })}
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(Math.min(totalPages, page + 1))}
              disabled={page === totalPages}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
} 