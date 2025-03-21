"use client"

import React from 'react';
import { TotalTradeMap } from '@/components/TotalTradeMap';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export default function TradeMapPage() {
  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-4">Global Trade Flows</h1>
      <p className="text-gray-600 dark:text-gray-400 mb-8">
        Visualize total trade volumes between countries. The map shows total trade value by country, with darker colors representing higher trade volumes.
      </p>
      
      <div className="grid grid-cols-1 gap-8">
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle>Trade Volume Map</CardTitle>
            <CardDescription>
              Countries are colored based on their total trade value (imports + exports). Click on a country to see detailed trade information.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <TotalTradeMap />
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 