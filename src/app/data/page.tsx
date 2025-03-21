"use client"

import React from 'react';
import { AdvancedDataTable } from '@/components/AdvancedDataTable';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function DataPage() {
  return (
    <div className="container mx-auto px-4 py-10">
      <div className="flex flex-col gap-6">
        <div>
          <h1 className="text-3xl font-bold mb-2 text-gray-900 dark:text-white">Trade Data Explorer</h1>
          <p className="text-gray-600 dark:text-gray-400 max-w-3xl">
            Explore comprehensive trade data across countries, years, and product categories with advanced filtering and visualization capabilities.
          </p>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle>Advanced Data Table</CardTitle>
            <CardDescription>
              View, sort, filter, and export detailed trade statistics from our database.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="countries" className="w-full">
              <TabsList className="mb-6">
                <TabsTrigger value="countries">Countries</TabsTrigger>
                <TabsTrigger value="products">Products</TabsTrigger>
                <TabsTrigger value="trends">Trade Trends</TabsTrigger>
              </TabsList>
              
              <TabsContent value="countries" className="pt-2">
                <AdvancedDataTable dataType="countries" />
              </TabsContent>
              
              <TabsContent value="products" className="pt-2">
                <AdvancedDataTable dataType="products" />
              </TabsContent>
              
              <TabsContent value="trends" className="pt-2">
                <AdvancedDataTable dataType="trends" />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
        
        <Card className="bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-500 overflow-hidden">
          <CardHeader>
            <CardTitle className="text-blue-700 dark:text-blue-300">Advanced Features</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <h3 className="font-medium text-gray-900 dark:text-white mb-2">Data Filtering</h3>
                <ul className="space-y-1 text-sm text-gray-700 dark:text-gray-300">
                  <li>• Filter by country, region, or product</li>
                  <li>• Set value ranges for trade volumes</li>
                  <li>• Filter by date ranges</li>
                  <li>• Apply multiple filters simultaneously</li>
                </ul>
              </div>
              <div>
                <h3 className="font-medium text-gray-900 dark:text-white mb-2">Data Visualization</h3>
                <ul className="space-y-1 text-sm text-gray-700 dark:text-gray-300">
                  <li>• Color-coded data points</li>
                  <li>• Trend indicators</li>
                  <li>• Highlighting for significant values</li>
                  <li>• Visual comparisons between periods</li>
                </ul>
              </div>
              <div>
                <h3 className="font-medium text-gray-900 dark:text-white mb-2">Data Export</h3>
                <ul className="space-y-1 text-sm text-gray-700 dark:text-gray-300">
                  <li>• Export to CSV format</li>
                  <li>• Export filtered results</li>
                  <li>• Generate reports</li>
                  <li>• Save custom data views</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 