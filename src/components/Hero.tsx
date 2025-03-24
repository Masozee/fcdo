"use client"

import React from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { TradeMap } from './TradeMap';
import { motion } from 'framer-motion';
import Link from 'next/link';

export function Hero() {
  return (
    <section className="relative py-20 overflow-hidden bg-white dark:bg-gray-900">
      {/* Map as background only in right column */}
      <div className="absolute top-0 bottom-0 right-0 left-1/2 z-0 overflow-hidden">
        <div className="h-full w-full">
          <TradeMap minimal={true} />
        </div>
        {/* Gradient fading from left to right within the map area */}
        <div className="absolute inset-0 bg-gradient-to-r from-white to-transparent dark:from-gray-900 dark:to-transparent pointer-events-none" />
      </div>
      
      {/* Solid background for left column with fade effect */}
      <div className="absolute top-0 bottom-0 left-0 w-1/2 bg-gradient-to-r from-white to-white/80 dark:from-gray-900 dark:to-gray-900/80 z-0"></div>
      
      <div className="max-w-7xl mx-auto px-6 sm:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
          {/* Left side - Text content */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="text-5xl font-bold mb-6 text-gray-900 dark:text-white">
              Indonesia's Strategic Dependency
            </h1>
            <p className="text-xl text-gray-700 dark:text-gray-300 mb-8">
              Make data-driven decisions with comprehensive trade data, advanced analytics, and real-time market insights for Indonesia's strategic import and export dependencies.
            </p>
            
            {/* Three indicators below description */}
            <div className="grid grid-cols-3 gap-4 mb-8 bg-white/90 dark:bg-gray-900/90 p-6 rounded-lg backdrop-blur-sm">
              <div>
                <div className="text-3xl font-bold text-accent mb-2">200+</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Countries Covered</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-accent mb-2">1B+</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Trade Records</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-accent mb-2">50K+</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Active Users</div>
              </div>
            </div>
            
            <div className="flex flex-wrap gap-4">
              <Link href="https://s3-csis-web.s3.ap-southeast-1.amazonaws.com/doc/Strategic+Dependency+Final+Report.pdf">
              <button className="px-6 py-3 bg-accent hover:bg-accent-dark text-white rounded-md transition-colors">
                Download the Report
              </button>
              </Link>
              <button className="px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-900 rounded-md transition-colors dark:bg-gray-800 dark:hover:bg-gray-700 dark:text-white">
                Learn More
              </button>
            </div>
          </motion.div>
          
          {/* Right side is empty as the map is now a background */}
          <div className="hidden lg:block">
            {/* This is just a spacer div */}
          </div>
        </div>
      </div>
    </section>
  );
} 