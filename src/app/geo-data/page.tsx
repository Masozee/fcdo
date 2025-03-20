"use client"

import React, { useState } from 'react';
import { D3TradeMap } from "@/components/D3TradeMap";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import * as Tabs from '@radix-ui/react-tabs';
import * as Separator from '@radix-ui/react-separator';
import { InfoCircledIcon, BarChartIcon, GlobeIcon, ChevronRightIcon } from '@radix-ui/react-icons';
import { mockGlobalHighlights, mockRegionData, mockTradeRelationships, mockTradeStatistics } from './mock-data';
import { RegionData } from './types';

export default function GeoDataPage() {
  const [selectedRegion, setSelectedRegion] = useState<string | null>(null);
  const regionData = selectedRegion ? mockRegionData[selectedRegion] : null;

  const handleRegionSelect = (region: string) => {
    setSelectedRegion(region);
  };

  const formatValue = (value: number, isPercentage: boolean = false, trillions: boolean = false) => {
    if (value === null || value === undefined) {
      return 'N/A';
    }
    
    if (isPercentage) {
      return `${value.toFixed(1)}%`;
    }
    if (trillions) {
      return `$${value.toFixed(1)} trillion`;
    }
    return `$${value.toFixed(1)} billion`;
  };

  return (
    <div className="flex h-screen">
      {/* Map section - left side */}
      <div className="w-1/2 h-full">
        <D3TradeMap />
      </div>
      
      {/* Information section - right side */}
      <div className="w-1/2 h-full p-6 flex flex-col">
        <h1 className="text-3xl font-bold mb-6">Geographic Trade Data</h1>
        
        <Tabs.Root defaultValue="overview" className="w-full h-full">
          <Tabs.List className="flex border-b mb-4">
            <Tabs.Trigger 
              value="overview" 
              className="px-4 py-2 flex items-center gap-2 data-[state=active]:border-b-2 data-[state=active]:border-primary"
            >
              <InfoCircledIcon />
              Overview
            </Tabs.Trigger>
            <Tabs.Trigger 
              value="statistics"
              className="px-4 py-2 flex items-center gap-2 data-[state=active]:border-b-2 data-[state=active]:border-primary"
            >
              <BarChartIcon />
              Statistics
            </Tabs.Trigger>
            <Tabs.Trigger 
              value="regions"
              className="px-4 py-2 flex items-center gap-2 data-[state=active]:border-b-2 data-[state=active]:border-primary"
            >
              <GlobeIcon />
              Regions
            </Tabs.Trigger>
          </Tabs.List>
          
          {/* Tab content for Overview */}
          <Tabs.Content value="overview" className="flex-1 flex flex-col">
            <div className="flex flex-col h-full">
              {/* Top section */}
              <div className="mb-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Global Highlights</CardTitle>
                    <CardDescription>Key global trade indicators and metrics</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-3 gap-4">
                      {mockGlobalHighlights.map((highlight, index) => (
                        <div key={index} className="flex flex-col">
                          <span className="font-medium">{highlight.title}</span>
                          <span className="text-2xl font-bold mt-1">
                            {highlight.title.includes("Volume") ? 
                              formatValue(highlight.value, false, true) : 
                              (highlight.title.includes("Growth") ? formatValue(highlight.value, true) : highlight.value)}
                          </span>
                          <span className="text-sm text-muted-foreground mt-1">
                            {highlight.description}
                          </span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
              
              {/* Middle section - Card hanging between top and bottom */}
              <div className="flex-grow flex items-center justify-center">
                <Card className="w-full">
                  <CardHeader>
                    <CardTitle>
                      {selectedRegion ? `${selectedRegion} Region Data` : 'Selected Region Data'}
                    </CardTitle>
                    <CardDescription>
                      {selectedRegion 
                        ? `Detailed information about the ${selectedRegion} region` 
                        : 'Click on a country or region on the map to see detailed information'}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {regionData ? (
                      <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <div className="text-sm text-muted-foreground">Imports</div>
                            <div className="text-xl font-medium">{formatValue(regionData.importValue, false, true)}</div>
                          </div>
                          <div>
                            <div className="text-sm text-muted-foreground">Exports</div>
                            <div className="text-xl font-medium">{formatValue(regionData.exportValue, false, true)}</div>
                          </div>
                        </div>
                        <Separator.Root className="h-[1px] bg-border my-4" />
                        <div>
                          <h4 className="text-md font-medium mb-2">Top Trading Partners</h4>
                          <div className="space-y-2">
                            {regionData.topPartners.slice(0, 3).map((partner, index) => (
                              <div key={index} className="flex justify-between items-center">
                                <div>{partner.country}</div>
                                <div>{formatValue(partner.value)}</div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center p-4 text-muted-foreground">
                        No region selected. Click on a region on the map or select one from the Regions tab.
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
              
              {/* Bottom section */}
              <div className="mt-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Key Trade Relationships</CardTitle>
                    <CardDescription>Major bilateral trade flows between countries</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {mockTradeRelationships.map((relation, index) => (
                        <div key={index} className="flex justify-between items-center">
                          <div className="flex items-center gap-2">
                            <span>{relation.source}</span>
                            <ChevronRightIcon />
                            <span>{relation.target}</span>
                          </div>
                          <div>
                            {formatValue(relation.value)}
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </Tabs.Content>
          
          {/* Tab content for Statistics */}
          <Tabs.Content value="statistics" className="flex-1">
            <div className="grid grid-cols-2 gap-4 h-full">
              <Card>
                <CardHeader>
                  <CardTitle>Import Data</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {Object.values(mockRegionData)
                      .sort((a, b) => b.importValue - a.importValue)
                      .slice(0, 5)
                      .map((region, index) => (
                        <div key={index} className="flex justify-between items-center">
                          <span>{region.name}</span>
                          <span>{formatValue(region.importValue, false, true)}</span>
                        </div>
                      ))
                    }
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Export Data</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {Object.values(mockRegionData)
                      .sort((a, b) => b.exportValue - a.exportValue)
                      .slice(0, 5)
                      .map((region, index) => (
                        <div key={index} className="flex justify-between items-center">
                          <span>{region.name}</span>
                          <span>{formatValue(region.exportValue, false, true)}</span>
                        </div>
                      ))
                    }
                  </div>
                </CardContent>
              </Card>
              
              <Card className="col-span-2">
                <CardHeader>
                  <CardTitle>Trade Statistics</CardTitle>
                </CardHeader>
                <CardContent>
                  <div>
                    <div className="flex justify-between pb-2 font-medium">
                      <div className="w-1/4">Period</div>
                      <div className="w-1/4 text-right">Imports</div>
                      <div className="w-1/4 text-right">Exports</div>
                      <div className="w-1/4 text-right">Balance</div>
                    </div>
                    <div className="space-y-2">
                      {mockTradeStatistics.map((stat, index) => (
                        <div key={index} className="flex justify-between items-center py-1 border-b">
                          <div className="w-1/4">{stat.period}</div>
                          <div className="w-1/4 text-right">{formatValue(stat.imports, false, true)}</div>
                          <div className="w-1/4 text-right">{formatValue(stat.exports, false, true)}</div>
                          <div className="w-1/4 text-right">{formatValue(stat.balance, false, true)}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </Tabs.Content>
          
          {/* Tab content for Regions */}
          <Tabs.Content value="regions" className="flex-1">
            <Card className="h-full overflow-auto">
              <CardHeader>
                <CardTitle>Regional Analysis</CardTitle>
                <CardDescription>Detailed analysis by geographic regions</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {Object.keys(mockRegionData).map((region) => (
                    <div 
                      key={region} 
                      className={`p-4 rounded-md cursor-pointer ${selectedRegion === region ? 'bg-muted' : 'hover:bg-muted/50'}`}
                      onClick={() => handleRegionSelect(region)}
                    >
                      <div className="flex justify-between items-center">
                        <h3 className="text-lg font-medium">{region}</h3>
                        <ChevronRightIcon className="h-5 w-5" />
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {mockRegionData[region].description}
                      </p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </Tabs.Content>
        </Tabs.Root>
      </div>
    </div>
  );
} 