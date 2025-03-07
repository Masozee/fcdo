import React from 'react';
import { DataTable } from '../../components/DataTable';

export default function DataPage() {
  return (
    <div className="container mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold mb-2 text-gray-900 dark:text-white">Trade Data Explorer</h1>
      <p className="text-gray-600 dark:text-gray-400 mb-8">
        Explore country trade data and harmonized system (HS) product classifications
      </p>
      
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-gray-200">Advanced Data Table</h2>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          This table provides a comprehensive view of trade data with advanced filtering, sorting, and pagination capabilities.
          Use the tabs to switch between country trade data and product classification data.
        </p>
        
        <div className="bg-blue-50 dark:bg-blue-900/20 border-l-4 border-accent p-4 mb-6">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-accent" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-accent dark:text-accent-light">Table Features:</h3>
              <ul className="mt-1 text-sm text-gray-700 dark:text-gray-300 list-disc list-inside">
                <li>Filter data by multiple criteria</li>
                <li>Sort columns by clicking on column headers</li>
                <li>Navigate through pages with pagination controls</li>
                <li>Adjust the number of rows displayed per page</li>
                <li>Toggle between country and product views</li>
              </ul>
            </div>
          </div>
        </div>
        
        <DataTable />
      </div>
    </div>
  );
} 