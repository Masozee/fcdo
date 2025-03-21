"use client"

import React from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';

export function ReversedWebsiteNarrative() {
  return (
    <section className="relative py-20 bg-white dark:bg-gray-900 overflow-hidden">
      {/* Map image on the right overlapping the border */}
      <div className="absolute right-0 top-1/2 transform -translate-y-1/2 translate-x-[5%] max-h-[900px] w-auto h-full max-w-[150vw] z-10 py-10">
        <motion.div
          initial={{ opacity: 0, x: 50 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="relative w-full h-full rounded-[2rem] overflow-hidden shadow-2xl"
        >
          <Image 
            src="/table.png" 
            alt="Trade Analytics" 
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
          {/* Left column - Text content */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="relative z-20"
          >
            <p className="text-lg text-gray-600 dark:text-gray-300 mb-6">
              Our interactive dashboards provide deep insights into global trade patterns and economic relationships between countries. Track trade flows, analyze dependencies, and identify market opportunities with our comprehensive data visualization tools.
            </p>
            <p className="text-lg text-gray-600 dark:text-gray-300 mb-6">
              From policy makers to businesses, our platform offers customized views and analysis to support strategic decision-making in an increasingly complex global economy.
            </p>
            
            <motion.a
              href="#"
              className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 transition-colors"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Explore Our Tools
              <svg className="ml-2 -mr-1 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </motion.a>
          </motion.div>
          
          {/* Right column - Empty space for image */}
          <div className="hidden md:block relative z-0">
            {/* This is just a spacer div for the image */}
          </div>
        </div>
      </div>
    </section>
  );
} 