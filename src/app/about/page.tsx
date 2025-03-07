"use client"

import React from 'react';
import Image from 'next/image';
import * as Separator from '@radix-ui/react-separator';
import * as Tabs from '@radix-ui/react-tabs';

export default function AboutPage() {
  return (
    <div className="container mx-auto px-6 py-12">
      <h1 className="text-3xl font-bold mb-8 text-center text-gray-900 dark:text-white">About Trade Data Explorer</h1>
      
      <div className="max-w-4xl mx-auto mb-16">
        <div className="flex flex-col md:flex-row items-center gap-8 mb-12">
          <div className="md:w-1/2">
            <h2 className="text-2xl font-semibold mb-4 text-gray-800 dark:text-gray-100">Our Mission</h2>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              Trade Data Explorer is dedicated to providing comprehensive, accessible, and actionable trade data to help businesses, researchers, and policymakers make informed decisions in the global marketplace.
            </p>
            <p className="text-gray-700 dark:text-gray-300">
              We believe that transparent trade information leads to better economic outcomes, more equitable trade policies, and stronger international relationships.
            </p>
          </div>
          <div className="md:w-1/2 relative h-[300px] w-full rounded-lg overflow-hidden">
            <Image 
              src="https://images.unsplash.com/photo-1565951802905-7fd64e5a345a?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1074&q=80" 
              alt="Global trade visualization"
              fill
              className="object-cover"
            />
          </div>
        </div>
        
        <Separator.Root className="h-px bg-gray-200 dark:bg-gray-800 my-12" />
        
        <Tabs.Root defaultValue="what-we-do" className="w-full">
          <Tabs.List className="flex border-b border-gray-200 dark:border-gray-800 mb-8">
            <Tabs.Trigger 
              value="what-we-do" 
              className="px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white data-[state=active]:text-blue-600 dark:data-[state=active]:text-blue-400 data-[state=active]:border-b-2 data-[state=active]:border-blue-600 dark:data-[state=active]:border-blue-400"
            >
              What We Do
            </Tabs.Trigger>
            <Tabs.Trigger 
              value="our-data" 
              className="px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white data-[state=active]:text-blue-600 dark:data-[state=active]:text-blue-400 data-[state=active]:border-b-2 data-[state=active]:border-blue-600 dark:data-[state=active]:border-blue-400"
            >
              Our Data
            </Tabs.Trigger>
            <Tabs.Trigger 
              value="history" 
              className="px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white data-[state=active]:text-blue-600 dark:data-[state=active]:text-blue-400 data-[state=active]:border-b-2 data-[state=active]:border-blue-600 dark:data-[state=active]:border-blue-400"
            >
              Our History
            </Tabs.Trigger>
          </Tabs.List>
          
          <Tabs.Content value="what-we-do" className="focus:outline-none">
            <div className="grid md:grid-cols-2 gap-8">
              <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm">
                <h3 className="text-xl font-semibold mb-3 text-gray-800 dark:text-gray-100">Data Visualization</h3>
                <p className="text-gray-700 dark:text-gray-300 mb-4">
                  We transform complex trade data into intuitive visualizations that make it easy to understand global trade patterns, identify trends, and spot opportunities.
                </p>
                <div className="relative h-[200px] w-full rounded-lg overflow-hidden">
                  <Image 
                    src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1170&q=80" 
                    alt="Data visualization"
                    fill
                    className="object-cover"
                  />
                </div>
              </div>
              <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm">
                <h3 className="text-xl font-semibold mb-3 text-gray-800 dark:text-gray-100">Market Analysis</h3>
                <p className="text-gray-700 dark:text-gray-300 mb-4">
                  Our team of experts provides in-depth analysis of trade data, helping you understand market dynamics, competitive landscapes, and emerging opportunities.
                </p>
                <div className="relative h-[200px] w-full rounded-lg overflow-hidden">
                  <Image 
                    src="https://images.unsplash.com/photo-1460925895917-afdab827c52f?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1115&q=80" 
                    alt="Market analysis"
                    fill
                    className="object-cover"
                  />
                </div>
              </div>
            </div>
          </Tabs.Content>
          
          <Tabs.Content value="our-data" className="focus:outline-none">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm">
              <h3 className="text-xl font-semibold mb-3 text-gray-800 dark:text-gray-100">Data Sources</h3>
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                Our data is sourced from official government statistics, international organizations, and trusted industry partners. We meticulously clean, standardize, and validate all data to ensure accuracy and reliability.
              </p>
              <div className="grid md:grid-cols-3 gap-4 mt-6">
                <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                  <h4 className="font-medium mb-2 text-gray-800 dark:text-gray-100">200+ Countries</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Comprehensive global coverage</p>
                </div>
                <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                  <h4 className="font-medium mb-2 text-gray-800 dark:text-gray-100">50+ Years</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Historical data for trend analysis</p>
                </div>
                <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                  <h4 className="font-medium mb-2 text-gray-800 dark:text-gray-100">5,000+ Products</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Detailed product categorization</p>
                </div>
              </div>
            </div>
          </Tabs.Content>
          
          <Tabs.Content value="history" className="focus:outline-none">
            <div className="space-y-8">
              <div className="flex flex-col md:flex-row gap-6">
                <div className="md:w-1/3 relative h-[200px] rounded-lg overflow-hidden">
                  <Image 
                    src="https://images.unsplash.com/photo-1507842217343-583bb7270b66?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1290&q=80" 
                    alt="Company founding"
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="md:w-2/3">
                  <h3 className="text-xl font-semibold mb-2 text-gray-800 dark:text-gray-100">Founded in 2015</h3>
                  <p className="text-gray-700 dark:text-gray-300">
                    Trade Data Explorer was founded by a team of economists, data scientists, and trade policy experts who saw the need for more accessible and actionable trade data. What started as a small research project has grown into a comprehensive platform used by businesses, researchers, and policymakers worldwide.
                  </p>
                </div>
              </div>
              <div className="flex flex-col md:flex-row gap-6">
                <div className="md:w-1/3 relative h-[200px] rounded-lg overflow-hidden">
                  <Image 
                    src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1170&q=80" 
                    alt="Team growth"
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="md:w-2/3">
                  <h3 className="text-xl font-semibold mb-2 text-gray-800 dark:text-gray-100">Growing Global Team</h3>
                  <p className="text-gray-700 dark:text-gray-300">
                    Today, our team includes experts from diverse backgrounds working across multiple countries. We're united by our mission to make trade data more accessible and actionable for everyone.
                  </p>
                </div>
              </div>
            </div>
          </Tabs.Content>
        </Tabs.Root>
      </div>
    </div>
  );
} 