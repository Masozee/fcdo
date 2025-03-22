"use client"

import { D3TradeMap } from "@/components/D3TradeMap"

export default function DBMapPage() {
  return (
    <div className="w-full h-full">
      <h1 className="text-3xl font-bold mb-6 px-8 pt-8">Global Trade Map</h1>
      <D3TradeMap />
    </div>
  )
} 