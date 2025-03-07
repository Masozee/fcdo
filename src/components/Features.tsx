"use client"

import React from 'react';
import * as Tabs from '@radix-ui/react-tabs';

export function Features() {
  return (
    <section className="py-20 bg-white dark:bg-gray-900">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto text-center mb-16">
          <h2 className="text-3xl font-bold mb-4 text-gray-900 dark:text-white">Powerful Features for Data Analysis</h2>
          <p className="text-xl text-gray-600 dark:text-gray-400">
            Everything you need to analyze global trade patterns and make data-driven decisions.
          </p>
        </div>

        <Tabs.Root defaultValue="analysis" className="max-w-4xl mx-auto">
          <Tabs.List className="flex justify-center space-x-4 mb-12">
            <Tabs.Trigger
              value="analysis"
              className="px-6 py-3 text-gray-600 dark:text-gray-400 hover:text-accent dark:hover:text-accent transition-colors data-[state=active]:text-accent dark:data-[state=active]:text-accent data-[state=active]:border-b-2 data-[state=active]:border-accent"
            >
              Data Analysis
            </Tabs.Trigger>
            <Tabs.Trigger
              value="visualization"
              className="px-6 py-3 text-gray-600 dark:text-gray-400 hover:text-accent dark:hover:text-accent transition-colors data-[state=active]:text-accent dark:data-[state=active]:text-accent data-[state=active]:border-b-2 data-[state=active]:border-accent"
            >
              Visualization
            </Tabs.Trigger>
            <Tabs.Trigger
              value="integration"
              className="px-6 py-3 text-gray-600 dark:text-gray-400 hover:text-accent dark:hover:text-accent transition-colors data-[state=active]:text-accent dark:data-[state=active]:text-accent data-[state=active]:border-b-2 data-[state=active]:border-accent"
            >
              Integration
            </Tabs.Trigger>
          </Tabs.List>

          <Tabs.Content value="analysis" className="focus:outline-none">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-lg">
                <div className="w-12 h-12 bg-accent-light/20 rounded-full flex items-center justify-center mb-4">
                  <svg className="w-6 h-6 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <h3 className="text-xl font-medium mb-2 text-gray-900 dark:text-white">Advanced Analytics</h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Powerful tools for analyzing trade patterns, market trends, and economic indicators.
                </p>
              </div>
              <div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-lg">
                <div className="w-12 h-12 bg-accent-light/20 rounded-full flex items-center justify-center mb-4">
                  <svg className="w-6 h-6 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                </div>
                <h3 className="text-xl font-medium mb-2 text-gray-900 dark:text-white">Predictive Modeling</h3>
                <p className="text-gray-600 dark:text-gray-400">
                  AI-powered forecasting to predict future trade trends and market opportunities.
                </p>
              </div>
            </div>
          </Tabs.Content>

          <Tabs.Content value="visualization" className="focus:outline-none">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-lg">
                <div className="w-12 h-12 bg-accent-light/20 rounded-full flex items-center justify-center mb-4">
                  <svg className="w-6 h-6 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
                  </svg>
                </div>
                <h3 className="text-xl font-medium mb-2 text-gray-900 dark:text-white">Interactive Charts</h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Dynamic visualizations that make complex trade data easy to understand and analyze.
                </p>
              </div>
              <div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-lg">
                <div className="w-12 h-12 bg-accent-light/20 rounded-full flex items-center justify-center mb-4">
                  <svg className="w-6 h-6 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                  </svg>
                </div>
                <h3 className="text-xl font-medium mb-2 text-gray-900 dark:text-white">Custom Maps</h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Geographic visualizations of trade flows and economic relationships between countries.
                </p>
              </div>
            </div>
          </Tabs.Content>

          <Tabs.Content value="integration" className="focus:outline-none">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-lg">
                <div className="w-12 h-12 bg-accent-light/20 rounded-full flex items-center justify-center mb-4">
                  <svg className="w-6 h-6 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" />
                  </svg>
                </div>
                <h3 className="text-xl font-medium mb-2 text-gray-900 dark:text-white">API Access</h3>
                <p className="text-gray-600 dark:text-gray-400">
                  RESTful API integration for seamless access to trade data and analytics.
                </p>
              </div>
              <div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-lg">
                <div className="w-12 h-12 bg-accent-light/20 rounded-full flex items-center justify-center mb-4">
                  <svg className="w-6 h-6 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <h3 className="text-xl font-medium mb-2 text-gray-900 dark:text-white">Data Export</h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Export data in multiple formats for integration with your existing tools and workflows.
                </p>
              </div>
            </div>
          </Tabs.Content>
        </Tabs.Root>
      </div>
    </section>
  );
} 