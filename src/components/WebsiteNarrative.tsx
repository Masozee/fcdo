"use client"

import React from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';

export function WebsiteNarrative() {
  return (
    <section className="relative py-28 bg-gray-50 dark:bg-gray-800 overflow-hidden">
      {/* Map image on the left - hidden on mobile */}
      <div className="absolute left-0 top-1/2 transform -translate-y-1/2 -translate-x-[5%] max-h-[650px] w-auto h-full max-w-[150vw] z-10 py-10 hidden md:block">
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="relative w-full h-full rounded-[2rem] overflow-hidden shadow-2xl"
        >
          <Image 
            src="/map.png" 
            alt="Trade Map Visualization" 
            width={1000}
            height={800}
            quality={90}
            className="object-cover w-full h-full"
          />
        </motion.div>
      </div>
      
      <div className="max-w-7xl mx-auto px-6 sm:px-8 relative z-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Image for mobile only */}
          <div className="md:hidden w-full mb-8">
            <div className="relative w-full h-[300px] rounded-xl overflow-hidden shadow-lg">
              <Image 
                src="/map.png" 
                alt="Trade Map Visualization" 
                fill
                quality={90}
                className="object-cover"
              />
            </div>
          </div>
          
          {/* Empty column to offset content on desktop */}
          <div className="hidden md:block"></div>
          
          {/* Right column with content */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            viewport={{ once: true }}
            className="relative"
          >
            <h2 className="text-3xl font-bold mb-6 text-gray-900 dark:text-white">
              Trade Map
            </h2>
            <p className="text-lg text-gray-700 dark:text-gray-300 mb-6">
              This dashboard visualizes Indonesia's key trade, investment, and supply chain dependencies, highlighting vulnerabilities in critical sectors like food, energy, technology, and pharmaceuticals. It provides insights into major economic partners, risk factors, and policy strategies to enhance resilience.
            </p>
            <p className="text-lg text-gray-700 dark:text-gray-300">
              Explore data-driven analysis to understand Indonesia's economic ties and potential risks, supporting informed decision-making for sustainable growth and strategic autonomy.
            </p>
          </motion.div>
        </div>
      </div>
    </section>
  );
} 