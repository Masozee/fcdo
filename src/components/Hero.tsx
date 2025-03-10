"use client"

import React from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { TradeMap } from './TradeMap';
import { motion } from 'framer-motion';

export function Hero() {
  return (
    <section className="relative py-20 overflow-hidden bg-white dark:bg-gray-900">
      <div className="container mx-auto px-4">
        <motion.div 
          className="mb-16 text-center"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="text-5xl font-bold mb-6 text-gray-900 dark:text-white">
            Global Trade Data & Analytics Platform
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
            Make data-driven decisions with comprehensive trade data, advanced analytics, and real-time market insights.
          </p>
        </motion.div>

        <div className="relative">
          <TradeMap />
          <div className="absolute inset-0 bg-gradient-to-t from-white via-transparent to-transparent dark:from-gray-900 dark:via-transparent dark:to-transparent pointer-events-none" />
        </div>

        <motion.div 
          className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-8 text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <div>
            <div className="text-4xl font-bold text-accent mb-2">200+</div>
            <div className="text-gray-600 dark:text-gray-400">Countries Covered</div>
          </div>
          <div>
            <div className="text-4xl font-bold text-accent mb-2">1B+</div>
            <div className="text-gray-600 dark:text-gray-400">Trade Records</div>
          </div>
          <div>
            <div className="text-4xl font-bold text-accent mb-2">50K+</div>
            <div className="text-gray-600 dark:text-gray-400">Active Users</div>
          </div>
          <div>
            <div className="text-4xl font-bold text-accent mb-2">99%</div>
            <div className="text-gray-600 dark:text-gray-400">Data Accuracy</div>
          </div>
        </motion.div>
      </div>
    </section>
  );
} 