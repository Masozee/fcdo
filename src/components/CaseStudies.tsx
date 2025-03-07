"use client"

import React from 'react';
import * as Carousel from '@radix-ui/react-navigation-menu';

export function CaseStudies() {
  return (
    <section className="py-20 bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto text-center mb-16">
          <h2 className="text-3xl font-bold mb-4 text-gray-900 dark:text-white">Success Stories</h2>
          <p className="text-xl text-gray-600 dark:text-gray-300">
            Discover how organizations use our platform to drive trade insights and make informed decisions.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {/* Case Study 1 */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
            <img
              src="https://via.placeholder.com/600x400"
              alt="Global manufacturer"
              className="w-full h-48 object-cover"
            />
            <div className="p-6">
              <h3 className="font-bold text-lg mb-2 text-gray-900 dark:text-white">Global Manufacturer Expands Market Reach</h3>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                A leading manufacturer identified new export opportunities and increased international sales by 34% using our trade data insights.
              </p>
              <a
                href="#"
                className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium inline-flex items-center"
              >
                Read Case Study
                <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </a>
            </div>
          </div>

          {/* Case Study 2 */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
            <img
              src="https://via.placeholder.com/600x400"
              alt="Government agency"
              className="w-full h-48 object-cover"
            />
            <div className="p-6">
              <h3 className="font-bold text-lg mb-2 text-gray-900 dark:text-white">Government Agency Improves Trade Policy</h3>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                A national trade agency leveraged our analytics to develop data-driven policies that strengthened domestic industries and international relations.
              </p>
              <a
                href="#"
                className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium inline-flex items-center"
              >
                Read Case Study
                <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </a>
            </div>
          </div>

          {/* Case Study 3 */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
            <img
              src="https://via.placeholder.com/600x400"
              alt="Research institution"
              className="w-full h-48 object-cover"
            />
            <div className="p-6">
              <h3 className="font-bold text-lg mb-2 text-gray-900 dark:text-white">Research Institution Enhances Analysis</h3>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                A leading economic research group used our platform to analyze global supply chain disruptions and predict future trade patterns with 87% accuracy.
              </p>
              <a
                href="#"
                className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium inline-flex items-center"
              >
                Read Case Study
                <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </a>
            </div>
          </div>
        </div>

        <div className="text-center mt-12">
          <a
            href="#"
            className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 md:py-4 md:text-lg md:px-8"
          >
            View All Case Studies
          </a>
        </div>
      </div>
    </section>
  );
} 