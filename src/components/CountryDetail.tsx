import { Suspense } from 'react';
import { CountryApiResponse } from '@/types/country-api';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { formatNumber, formatCurrency } from '@/lib/utils';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

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

// Colors for charts
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

interface CountryDetailProps {
  code: string;
  year?: string;
}

async function getCountryData(code: string, year?: string): Promise<CountryApiResponse> {
  const params = new URLSearchParams();
  if (year) params.append('year', year);
  params.append('include_products', 'true');
  
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL || ''}/api/country/${code}?${params.toString()}`,
    { next: { revalidate: 3600 } }
  );
  
  if (!response.ok) {
    throw new Error(`Failed to fetch country data: ${response.statusText}`);
  }
  
  return response.json();
}

export default async function CountryDetail({ code, year }: CountryDetailProps) {
  const countryData = await getCountryData(code, year);
  const countryName = COUNTRY_NAMES[code.toUpperCase()] || code;
  
  // Format data for year-over-year chart
  const yearlyTrendsChart = countryData.yearlyTrends.map(trend => ({
    year: trend.year,
    imports: trend.import_value,
    exports: trend.export_value,
    balance: trend.export_value - trend.import_value
  })).sort((a, b) => a.year - b.year);
  
  // Format data for trade flow pie chart
  const tradeFlowsChart = countryData.tradeFlows.map(flow => ({
    name: flow.tradeflow_id === '102' ? 'Exports' : 'Imports',
    value: flow.total_value,
  }));
  
  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold">{countryName}</h2>
          <p className="text-gray-500">
            Trade data from {countryData.summary.min_year?.split('T')[0]} to {countryData.summary.max_year?.split('T')[0]}
          </p>
        </div>
        {year && (
          <div className="bg-primary/10 text-primary px-3 py-1 rounded-full text-sm font-medium">
            Year: {year}
          </div>
        )}
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Total Trade</CardTitle>
            <CardDescription>Total value of imports and exports</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(countryData.summary.total_value)}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              {formatNumber(countryData.summary.trade_count)} transactions
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Imports</CardTitle>
            <CardDescription>Value of goods imported</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(countryData.summary.import_value)}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              {countryData.tradeFlows.find(f => f.tradeflow_id === '103')?.transaction_count || 0} transactions
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Exports</CardTitle>
            <CardDescription>Value of goods exported</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(countryData.summary.export_value)}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              {countryData.tradeFlows.find(f => f.tradeflow_id === '102')?.transaction_count || 0} transactions
            </p>
          </CardContent>
        </Card>
      </div>
      
      <Tabs defaultValue="trends">
        <TabsList>
          <TabsTrigger value="trends">Trade Trends</TabsTrigger>
          <TabsTrigger value="products">Product Categories</TabsTrigger>
        </TabsList>
        
        <TabsContent value="trends" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Trade Balance Over Time</CardTitle>
              <CardDescription>Imports vs Exports by Year</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={yearlyTrendsChart}
                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="year" />
                    <YAxis />
                    <Tooltip 
                      formatter={(value: number) => [`$${formatNumber(value)}`, undefined]}
                      labelFormatter={(label) => `Year: ${label}`}
                    />
                    <Bar dataKey="imports" name="Imports" fill="#0088FE" />
                    <Bar dataKey="exports" name="Exports" fill="#00C49F" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Trade Flow Breakdown</CardTitle>
                <CardDescription>Import vs Export Distribution</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={tradeFlowsChart}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        fill="#8884d8"
                        paddingAngle={5}
                        dataKey="value"
                        nameKey="name"
                        label={(entry) => entry.name}
                      >
                        {tradeFlowsChart.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value: number) => [`$${formatNumber(value)}`, undefined]} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Trade Statistics</CardTitle>
                <CardDescription>Key metrics for imports and exports</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Metric</TableHead>
                      <TableHead>Imports</TableHead>
                      <TableHead>Exports</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow>
                      <TableCell>Total Value</TableCell>
                      <TableCell>{formatCurrency(countryData.summary.import_value)}</TableCell>
                      <TableCell>{formatCurrency(countryData.summary.export_value)}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Transactions</TableCell>
                      <TableCell>
                        {countryData.tradeFlows.find(f => f.tradeflow_id === '103')?.transaction_count || 0}
                      </TableCell>
                      <TableCell>
                        {countryData.tradeFlows.find(f => f.tradeflow_id === '102')?.transaction_count || 0}
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Average Value</TableCell>
                      <TableCell>
                        {formatCurrency(countryData.tradeFlows.find(f => f.tradeflow_id === '103')?.average_value || 0)}
                      </TableCell>
                      <TableCell>
                        {formatCurrency(countryData.tradeFlows.find(f => f.tradeflow_id === '102')?.average_value || 0)}
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="products" className="space-y-6">
          {countryData.productCategories ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Top Import Categories</CardTitle>
                  <CardDescription>Products with highest import values</CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Product</TableHead>
                        <TableHead>HS Code</TableHead>
                        <TableHead className="text-right">Value</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {countryData.productCategories.imports.map((product) => (
                        <TableRow key={product.category_id}>
                          <TableCell className="font-medium">{product.product_name}</TableCell>
                          <TableCell>{product.product_code}</TableCell>
                          <TableCell className="text-right">{formatCurrency(product.value)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Top Export Categories</CardTitle>
                  <CardDescription>Products with highest export values</CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Product</TableHead>
                        <TableHead>HS Code</TableHead>
                        <TableHead className="text-right">Value</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {countryData.productCategories.exports.map((product) => (
                        <TableRow key={product.category_id}>
                          <TableCell className="font-medium">{product.product_name}</TableCell>
                          <TableCell>{product.product_code}</TableCell>
                          <TableCell className="text-right">{formatCurrency(product.value)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </div>
          ) : (
            <Card>
              <CardContent className="py-10 text-center">
                <p className="text-gray-500">No product category data available</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
} 