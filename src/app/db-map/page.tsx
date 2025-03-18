"use client"

import { D3TradeMap } from "@/components/D3TradeMap"

export default function DBMapPage() {
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">Global Trade Map</h1>
      <D3TradeMap />
    </div>
  )
} 