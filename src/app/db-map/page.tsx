import React from 'react';
import { TradeMapWithDB } from '../../components/TradeMapWithDB';

export default function DBMapPage() {
  return (
    <div className="container mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold mb-6 text-gray-900 dark:text-white">Trade Data Explorer - Database Map</h1>
      <p className="text-gray-600 dark:text-gray-400 mb-10">
        Interactive map visualization connected to our SQLite database with HS code classifications
      </p>
      <TradeMapWithDB />
    </div>
  );
} 