"use client"

import React, { useState, useEffect } from 'react';
import * as Tabs from '@radix-ui/react-tabs';
import * as Select from '@radix-ui/react-select';

// Types for HS codes and country trade data
interface HSCode {
  code: string;
  description: string;
  value: number;
  hs2_code?: string;
  hs4_code?: string;
}

interface CountryTradeData {
  id: number;
  country: string;
  imports: number;
  exports: number;
  total: number;
  products: string[];
}

interface HSData {
  [key: string]: HSCode[];
}

type HSLevel = 'hs2' | 'hs4' | 'hs6';

// Column definition for table headers
interface Column<T> {
  key: string;
  label: string;
  sortable?: boolean;
  render?: (value: any, row: T) => React.ReactNode;
}

export function DataTable() {
  const [activeTab, setActiveTab] = useState<'countries' | 'products'>('countries');
  const [countryData, setCountryData] = useState<CountryTradeData[]>([]);
  const [hsData, setHsData] = useState<HSData | null>(null);
  const [selectedHSLevel, setSelectedHSLevel] = useState<HSLevel>('hs2');
  const [currentHSData, setCurrentHSData] = useState<HSCode[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Sorting state
  const [sortField, setSortField] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  
  // Filtering state
  const [filters, setFilters] = useState<Record<string, string>>({});
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Define columns for Country data table
  const countryColumns: Column<CountryTradeData>[] = [
    { key: 'country', label: 'Country', sortable: true },
    { key: 'total', label: 'Total Trade (M$)', sortable: true, 
      render: (value) => `$${value.toLocaleString()}` },
    { key: 'exports', label: 'Exports (M$)', sortable: true,
      render: (value) => `$${value.toLocaleString()}` },
    { key: 'imports', label: 'Imports (M$)', sortable: true,
      render: (value) => `$${value.toLocaleString()}` },
    { key: 'balance', label: 'Trade Balance (M$)', sortable: true,
      render: (_, row) => {
        const balance = row.exports - row.imports;
        const color = balance >= 0 ? 'text-green-600' : 'text-red-600';
        return <span className={color}>${balance.toLocaleString()}</span>;
      } 
    },
    { key: 'products', label: 'Products', 
      render: (value) => value.join(', ') 
    }
  ];

  // Define columns for HS code data table
  const hsColumns: Column<HSCode>[] = [
    { key: 'code', label: 'HS Code', sortable: true },
    { key: 'description', label: 'Description', sortable: true },
    { key: 'value', label: 'Trade Value (M$)', sortable: true,
      render: (value) => `$${value.toLocaleString()}` },
  ];

  // Add parent code column for HS4 and HS6
  if (selectedHSLevel === 'hs4' || selectedHSLevel === 'hs6') {
    hsColumns.splice(2, 0, { 
      key: 'hs2_code', 
      label: 'HS2 Code', 
      sortable: true 
    });
  }

  // Add HS4 parent for HS6
  if (selectedHSLevel === 'hs6') {
    hsColumns.splice(3, 0, { 
      key: 'hs4_code', 
      label: 'HS4 Code', 
      sortable: true 
    });
  }

  // Fetch country data
  useEffect(() => {
    async function fetchCountryData() {
      try {
        setLoading(true);
        const response = await fetch('/api/country-trade');
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setCountryData(data.data || []);
      } catch (err) {
        console.error('Error fetching country data:', err);
        setError('Failed to load country data');
      } finally {
        setLoading(false);
      }
    }

    fetchCountryData();
  }, []);

  // Fetch HS code data
  useEffect(() => {
    async function fetchHSData() {
      try {
        setLoading(true);
        // Fetch HS2 codes
        const hs2Response = await fetch('/api/hs-codes?level=hs2');
        if (!hs2Response.ok) {
          throw new Error(`HTTP error! status: ${hs2Response.status}`);
        }
        const hs2Result = await hs2Response.json();

        // Fetch HS4 codes
        const hs4Response = await fetch('/api/hs-codes?level=hs4');
        if (!hs4Response.ok) {
          throw new Error(`HTTP error! status: ${hs4Response.status}`);
        }
        const hs4Result = await hs4Response.json();

        // Fetch HS6 codes
        const hs6Response = await fetch('/api/hs-codes?level=hs6');
        if (!hs6Response.ok) {
          throw new Error(`HTTP error! status: ${hs6Response.status}`);
        }
        const hs6Result = await hs6Response.json();

        const newHsData = {
          hs2: hs2Result.data || [],
          hs4: hs4Result.data || [],
          hs6: hs6Result.data || []
        };
        setHsData(newHsData);
        setCurrentHSData(newHsData[selectedHSLevel]);
      } catch (err) {
        console.error('Error fetching HS codes:', err);
        setError('Failed to load HS code data');
      } finally {
        setLoading(false);
      }
    }

    fetchHSData();
  }, []);

  // Update current HS data when the selected HS level changes
  useEffect(() => {
    if (hsData) {
      setCurrentHSData(hsData[selectedHSLevel]);
      // Reset sorting and pagination
      setSortField(null);
      setSortDirection('asc');
      setCurrentPage(1);
      setFilters({});
    }
  }, [selectedHSLevel, hsData]);

  // Apply sorting to data
  const getSortedData = () => {
    if (activeTab === 'countries') {
      const dataToSort = [...countryData];
      
      if (!sortField) return dataToSort;
      
      return dataToSort.sort((a, b) => {
        // Special case for balance which is not a direct property
        if (sortField === 'balance') {
          const balanceA = a.exports - a.imports;
          const balanceB = b.exports - b.imports;
          return sortDirection === 'asc' ? balanceA - balanceB : balanceB - balanceA;
        }

        // For arrays like products
        if (sortField === 'products') {
          const strA = a.products.join(',');
          const strB = b.products.join(',');
          return sortDirection === 'asc' 
            ? strA.localeCompare(strB) 
            : strB.localeCompare(strA);
        }
        
        // For regular fields
        const valA = a[sortField as keyof CountryTradeData];
        const valB = b[sortField as keyof CountryTradeData];
        
        if (typeof valA === 'string' && typeof valB === 'string') {
          return sortDirection === 'asc' 
            ? valA.localeCompare(valB) 
            : valB.localeCompare(valA);
        }
        
        if (typeof valA === 'number' && typeof valB === 'number') {
          return sortDirection === 'asc' 
            ? valA - valB 
            : valB - valA;
        }
        
        return 0;
      });
    } else {
      // Products tab
      const dataToSort = [...currentHSData];
      
      if (!sortField) return dataToSort;
      
      return dataToSort.sort((a, b) => {
        const valA = a[sortField as keyof HSCode];
        const valB = b[sortField as keyof HSCode];
        
        if (typeof valA === 'string' && typeof valB === 'string') {
          return sortDirection === 'asc' 
            ? valA.localeCompare(valB) 
            : valB.localeCompare(valA);
        }
        
        if (typeof valA === 'number' && typeof valB === 'number') {
          return sortDirection === 'asc' 
            ? valA - valB 
            : valB - valA;
        }
        
        return 0;
      });
    }
  };

  // Apply filters to data
  const getFilteredData = () => {
    let data = getSortedData();
    
    // Apply each filter
    Object.entries(filters).forEach(([field, filterValue]) => {
      if (!filterValue) return;
      
      // Special case for minValue filter
      if (field === 'minValue') {
        const minValueNum = Number(filterValue);
        if (!isNaN(minValueNum)) {
          data = data.filter(item => {
            // For country data, filter by total
            if (activeTab === 'countries') {
              return (item as CountryTradeData).total >= minValueNum;
            }
            // For product data, filter by value
            else {
              return (item as HSCode).value >= minValueNum;
            }
          });
        }
        return;
      }
      
      data = data.filter(item => {
        const value = item[field as keyof typeof item];
        
        // Handle different types of values
        if (typeof value === 'string') {
          return value.toLowerCase().includes(filterValue.toLowerCase());
        } else if (Array.isArray(value)) {
          return value.some(v => 
            typeof v === 'string' && v.toLowerCase().includes(filterValue.toLowerCase())
          );
        } else if (typeof value === 'number') {
          return value.toString().includes(filterValue);
        }
        
        return false;
      });
    });
    
    return data;
  };

  // Get paginated data
  const getPaginatedData = () => {
    const data = getFilteredData();
    const startIdx = (currentPage - 1) * rowsPerPage;
    const endIdx = Math.min(startIdx + rowsPerPage, data.length);
    return data.slice(startIdx, endIdx);
  };

  // Handle sort when a column header is clicked
  const handleSort = (field: string) => {
    if (field === sortField) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  // Handle filter changes
  const handleFilterChange = (field: string, value: string) => {
    setFilters(prev => ({
      ...prev,
      [field]: value
    }));
    setCurrentPage(1); // Reset to first page when filter changes
  };

  // Handle HS level change
  const handleHSLevelChange = (level: HSLevel) => {
    setSelectedHSLevel(level);
  };

  // Handle page change
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  // Handle rows per page change
  const handleRowsPerPageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setRowsPerPage(Number(e.target.value));
    setCurrentPage(1); // Reset to first page
  };

  // Determine which columns to use based on active tab
  const columns = activeTab === 'countries' ? countryColumns : hsColumns;
  const data = getPaginatedData();
  const totalRows = getFilteredData().length;
  const totalPages = Math.ceil(totalRows / rowsPerPage);

  // Show loading state
  if (loading && (!countryData.length || !hsData)) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-md">
        <p className="font-bold">Error:</p>
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm">
      <Tabs.Root 
        defaultValue="countries" 
        onValueChange={(value) => setActiveTab(value as 'countries' | 'products')}
      >
        <div className="border-b border-gray-200">
          <Tabs.List className="flex">
            <Tabs.Trigger
              value="countries"
              className="px-6 py-3 text-sm font-medium border-b-2 border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 data-[state=active]:text-blue-600 data-[state=active]:border-blue-600"
            >
              Country Trade Data
            </Tabs.Trigger>
            <Tabs.Trigger
              value="products"
              className="px-6 py-3 text-sm font-medium border-b-2 border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 data-[state=active]:text-blue-600 data-[state=active]:border-blue-600"
            >
              Product Data (HS Codes)
            </Tabs.Trigger>
          </Tabs.List>
        </div>

        <div className="flex flex-col md:flex-row">
          {/* Sidebar Filters */}
          <div className="md:w-1/4 p-4 border-r border-gray-200">
            <div className="mb-6">
              <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wider mb-3">Filters</h3>
              
              <Tabs.Content value="countries" className="focus:outline-none">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Filter by Country
                    </label>
                    <input
                      type="text"
                      value={filters.country || ''}
                      onChange={(e) => handleFilterChange('country', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Search countries..."
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Filter by Products
                    </label>
                    <input
                      type="text"
                      value={filters.products || ''}
                      onChange={(e) => handleFilterChange('products', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Search products..."
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Minimum Trade Value (M$)
                    </label>
                    <input
                      type="number"
                      value={filters.minValue || ''}
                      onChange={(e) => handleFilterChange('minValue', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Minimum value..."
                    />
                  </div>
                  <div>
                    <button
                      onClick={() => setFilters({})}
                      className="w-full px-4 py-2 bg-gray-100 text-gray-600 rounded hover:bg-gray-200 transition-colors mt-4"
                    >
                      Clear Filters
                    </button>
                  </div>
                </div>
              </Tabs.Content>
              
              <Tabs.Content value="products" className="focus:outline-none">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      HS Level
                    </label>
                    <Select.Root
                      value={selectedHSLevel}
                      onValueChange={(value) => handleHSLevelChange(value as HSLevel)}
                    >
                      <Select.Trigger className="inline-flex items-center justify-between w-full px-3 py-2 text-sm bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                        <Select.Value />
                        <Select.Icon>
                          <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M2.5 4L6 7.5L9.5 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        </Select.Icon>
                      </Select.Trigger>
                      
                      <Select.Portal>
                        <Select.Content className="overflow-hidden bg-white rounded-md shadow-lg border border-gray-200 z-50">
                          <Select.Viewport className="p-1">
                            <Select.Item value="hs2" className="relative flex items-center h-8 px-6 text-sm rounded hover:bg-gray-100 cursor-pointer outline-none select-none">
                              <Select.ItemText>HS2 (Chapters)</Select.ItemText>
                            </Select.Item>
                            <Select.Item value="hs4" className="relative flex items-center h-8 px-6 text-sm rounded hover:bg-gray-100 cursor-pointer outline-none select-none">
                              <Select.ItemText>HS4 (Headings)</Select.ItemText>
                            </Select.Item>
                            <Select.Item value="hs6" className="relative flex items-center h-8 px-6 text-sm rounded hover:bg-gray-100 cursor-pointer outline-none select-none">
                              <Select.ItemText>HS6 (Subheadings)</Select.ItemText>
                            </Select.Item>
                          </Select.Viewport>
                        </Select.Content>
                      </Select.Portal>
                    </Select.Root>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Filter by Code
                    </label>
                    <input
                      type="text"
                      value={filters.code || ''}
                      onChange={(e) => handleFilterChange('code', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Search HS codes..."
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Filter by Description
                    </label>
                    <input
                      type="text"
                      value={filters.description || ''}
                      onChange={(e) => handleFilterChange('description', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Search descriptions..."
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Minimum Value (M$)
                    </label>
                    <input
                      type="number"
                      value={filters.minValue || ''}
                      onChange={(e) => handleFilterChange('minValue', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Minimum value..."
                    />
                  </div>
                  <div>
                    <button
                      onClick={() => setFilters({})}
                      className="w-full px-4 py-2 bg-gray-100 text-gray-600 rounded hover:bg-gray-200 transition-colors mt-4"
                    >
                      Clear Filters
                    </button>
                  </div>
                </div>
              </Tabs.Content>
            </div>
            
            <div className="mt-8">
              <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wider mb-3">Filter Summary</h3>
              <div className="bg-gray-50 p-3 rounded border border-gray-200">
                <div className="text-sm text-gray-700">
                  <p className="mb-1">Active Filters: {Object.keys(filters).filter(key => !!filters[key]).length}</p>
                  <p className="mb-1">Total Results: {totalRows}</p>
                  <p>Showing: {data.length} items</p>
                </div>
              </div>
            </div>
          </div>

          {/* Table Content */}
          <div className="md:w-3/4 p-4">
            {/* Table */}
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    {columns.map((column) => (
                      <th 
                        key={column.key}
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        <div className="flex items-center">
                          {column.label}
                          {column.sortable && (
                            <button
                              onClick={() => handleSort(column.key)}
                              className="ml-1 focus:outline-none"
                            >
                              {sortField === column.key ? (
                                sortDirection === 'asc' ? '▲' : '▼'
                              ) : '⇵'}
                            </button>
                          )}
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {data.length > 0 ? (
                    data.map((row, rowIndex) => (
                      <tr key={rowIndex} className="hover:bg-gray-50">
                        {columns.map((column) => (
                          <td key={column.key} className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {column.render 
                              ? column.render(
                                  column.key === 'balance' 
                                    ? null // Balance is calculated in the render function
                                    : row[column.key as keyof typeof row], 
                                  row
                                )
                              : row[column.key as keyof typeof row]
                            }
                          </td>
                        ))}
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td 
                        colSpan={columns.length} 
                        className="px-6 py-4 text-center text-sm text-gray-500"
                      >
                        No data found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6 mt-4">
              <div className="flex-1 flex justify-between sm:hidden">
                <button
                  onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                >
                  Previous
                </button>
                <button
                  onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                  className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                >
                  Next
                </button>
              </div>
              <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-gray-700">
                    Showing <span className="font-medium">{data.length ? (currentPage - 1) * rowsPerPage + 1 : 0}</span> to{' '}
                    <span className="font-medium">{Math.min(currentPage * rowsPerPage, totalRows)}</span> of{' '}
                    <span className="font-medium">{totalRows}</span> results
                  </p>
                </div>
                <div className="flex items-center">
                  <label htmlFor="rowsPerPage" className="mr-2 text-sm text-gray-700">Rows per page:</label>
                  <select
                    id="rowsPerPage"
                    value={rowsPerPage}
                    onChange={handleRowsPerPageChange}
                    className="mr-4 px-2 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="10">10</option>
                    <option value="25">25</option>
                    <option value="50">50</option>
                    <option value="100">100</option>
                  </select>
                  <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                    <button
                      onClick={() => handlePageChange(1)}
                      disabled={currentPage === 1}
                      className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                    >
                      <span className="sr-only">First Page</span>
                      ⟪
                    </button>
                    <button
                      onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                      disabled={currentPage === 1}
                      className="relative inline-flex items-center px-2 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                    >
                      <span className="sr-only">Previous</span>
                      ⟨
                    </button>
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      let pageNum;
                      if (totalPages <= 5) {
                        pageNum = i + 1;
                      } else if (currentPage <= 3) {
                        pageNum = i + 1;
                      } else if (currentPage >= totalPages - 2) {
                        pageNum = totalPages - 4 + i;
                      } else {
                        pageNum = currentPage - 2 + i;
                      }
                      return (
                        <button
                          key={i}
                          onClick={() => handlePageChange(pageNum)}
                          className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                            currentPage === pageNum
                              ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                              : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                          }`}
                        >
                          {pageNum}
                        </button>
                      );
                    })}
                    <button
                      onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
                      disabled={currentPage === totalPages}
                      className="relative inline-flex items-center px-2 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                    >
                      <span className="sr-only">Next</span>
                      ⟩
                    </button>
                    <button
                      onClick={() => handlePageChange(totalPages)}
                      disabled={currentPage === totalPages}
                      className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                    >
                      <span className="sr-only">Last Page</span>
                      ⟫
                    </button>
                  </nav>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Tabs.Root>
    </div>
  );
} 