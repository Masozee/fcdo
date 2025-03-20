"use client"

import React from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';

export function WebsiteNarrative() {
  return (
    <section className="relative py-20 bg-gray-50 dark:bg-gray-800 overflow-hidden">
      {/* Map image on the left overlapping the border */}
      <div className="absolute left-0 top-1/2 transform -translate-y-1/2 -translate-x-[5%] max-h-[900px] w-auto h-full max-w-[150vw] z-10">
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="relative w-full h-full rounded-[2rem] overflow-hidden shadow-2xl"
        >
          <Image 
            src="/paul-teysen-bukjsECgmeU-unsplash.jpg" 
            alt="Shipping Containers" 
            fill
            sizes="(max-width: 800px) 120vw, 50vw"
            priority
            style={{ 
              objectFit: 'cover',
              objectPosition: 'center',
              width: '100%',
              height: '100%',
              borderRadius: '0rem'
            }}
            className="select-none"
          />
        </motion.div>
      </div>
      
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center max-w-6xl mx-auto">
          {/* Left column - Empty space for map */}
          <div className="hidden md:block relative z-0">
            {/* This is just a spacer div for the map */}
          </div>
          
          {/* Right column - Text content */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="relative z-20"
          >
            <h2 className="text-3xl font-bold mb-6 text-gray-900 dark:text-white">
              Why Trade Data Matters
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300 mb-6">
              In today's interconnected global economy, understanding trade flows is essential for making informed business and policy decisions. 
            </p>
            <p className="text-lg text-gray-600 dark:text-gray-300 mb-6">
              Our platform transforms complex trade data into actionable insights, helping organizations identify new market opportunities, understand competitive landscapes, and optimize supply chains.
            </p>
            <ul className="space-y-4 mb-8">
              <motion.li 
                className="flex items-center text-gray-600 dark:text-gray-300"
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: 0.3 }}
                viewport={{ once: true }}
              >
                <svg className="w-5 h-5 mr-2 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                Discover emerging market trends before they become mainstream
              </motion.li>
              <motion.li 
                className="flex items-center text-gray-600 dark:text-gray-300"
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: 0.4 }}
                viewport={{ once: true }}
              >
                <svg className="w-5 h-5 mr-2 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                Track changes in global supply chains and trade relationships
              </motion.li>
              <motion.li 
                className="flex items-center text-gray-600 dark:text-gray-300"
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: 0.5 }}
                viewport={{ once: true }}
              >
                <svg className="w-5 h-5 mr-2 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                Make data-driven decisions with confidence
              </motion.li>
            </ul>
            <motion.a
              href="#"
              className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 transition-colors"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Learn More About Our Data
              <svg className="ml-2 -mr-1 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </motion.a>
          </motion.div>
        </div>
      </div>
    </section>
  );
} 