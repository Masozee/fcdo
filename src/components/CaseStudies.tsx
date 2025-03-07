"use client"

import React from 'react';
import * as Carousel from '@radix-ui/react-navigation-menu';

export function CaseStudies() {
  return (
    <section className="py-20 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto text-center mb-16">
          <h2 className="text-3xl font-bold mb-4">Success Stories</h2>
          <p className="text-xl text-gray-600">
            See how leading organizations use our platform to make better trade decisions.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {/* Case Study 1 */}
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <div className="aspect-video bg-gray-200 relative">
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-gray-400">Case Study Image</span>
              </div>
            </div>
            <div className="p-6">
              <div className="flex items-center mb-4">
                <img
                  src="https://via.placeholder.com/40"
                  alt="Company logo"
                  className="w-10 h-10 rounded-full mr-3"
                />
                <div>
                  <h3 className="font-medium">Global Trading Co.</h3>
                  <p className="text-sm text-gray-500">Manufacturing</p>
                </div>
              </div>
              <h4 className="text-lg font-medium mb-2">
                Optimizing Supply Chain with Data Analytics
              </h4>
              <p className="text-gray-600 mb-4">
                How a leading manufacturer used our platform to optimize their global supply chain and reduce costs by 25%.
              </p>
              <a href="#" className="text-blue-600 hover:text-blue-700 font-medium">
                Read Case Study →
              </a>
            </div>
          </div>

          {/* Case Study 2 */}
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <div className="aspect-video bg-gray-200 relative">
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-gray-400">Case Study Image</span>
              </div>
            </div>
            <div className="p-6">
              <div className="flex items-center mb-4">
                <img
                  src="https://via.placeholder.com/40"
                  alt="Company logo"
                  className="w-10 h-10 rounded-full mr-3"
                />
                <div>
                  <h3 className="font-medium">TechCorp International</h3>
                  <p className="text-sm text-gray-500">Technology</p>
                </div>
              </div>
              <h4 className="text-lg font-medium mb-2">
                Market Expansion Strategy
              </h4>
              <p className="text-gray-600 mb-4">
                How a tech company identified new market opportunities and expanded into 5 new countries.
              </p>
              <a href="#" className="text-blue-600 hover:text-blue-700 font-medium">
                Read Case Study →
              </a>
            </div>
          </div>

          {/* Case Study 3 */}
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <div className="aspect-video bg-gray-200 relative">
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-gray-400">Case Study Image</span>
              </div>
            </div>
            <div className="p-6">
              <div className="flex items-center mb-4">
                <img
                  src="https://via.placeholder.com/40"
                  alt="Company logo"
                  className="w-10 h-10 rounded-full mr-3"
                />
                <div>
                  <h3 className="font-medium">AgriGlobal Solutions</h3>
                  <p className="text-sm text-gray-500">Agriculture</p>
                </div>
              </div>
              <h4 className="text-lg font-medium mb-2">
                Data-Driven Agriculture Exports
              </h4>
              <p className="text-gray-600 mb-4">
                How an agricultural company increased exports by 40% using market insights and trade data.
              </p>
              <a href="#" className="text-blue-600 hover:text-blue-700 font-medium">
                Read Case Study →
              </a>
            </div>
          </div>
        </div>

        <div className="text-center mt-12">
          <a
            href="#"
            className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
          >
            View All Case Studies
          </a>
        </div>
      </div>
    </section>
  );
} 