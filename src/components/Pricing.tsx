"use client"

import React, { useState } from 'react';
import * as Switch from '@radix-ui/react-switch';

export function Pricing() {
  const [annualBilling, setAnnualBilling] = useState(true);

  const toggleBilling = () => {
    setAnnualBilling(!annualBilling);
  };

  return (
    <section className="py-20 bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto text-center mb-16">
          <h2 className="text-3xl font-bold mb-4 text-gray-900 dark:text-white">Transparent Pricing</h2>
          <p className="text-xl text-gray-600 dark:text-gray-300">
            Choose the plan that fits your needs. All plans include basic features.
          </p>
        </div>

        <div className="flex items-center justify-center mb-12">
          <span className={`mr-3 font-medium ${annualBilling ? 'text-gray-900 dark:text-white' : 'text-gray-500 dark:text-gray-400'}`}>
            Monthly
          </span>
          <Switch.Root
            checked={annualBilling}
            onCheckedChange={toggleBilling}
            className="w-[42px] h-[25px] bg-gray-300 dark:bg-gray-700 rounded-full relative shadow-sm data-[state=checked]:bg-blue-600 outline-none cursor-pointer"
          >
            <Switch.Thumb className="block w-[21px] h-[21px] bg-white rounded-full shadow-sm transition-transform duration-100 translate-x-0.5 will-change-transform data-[state=checked]:translate-x-[19px]" />
          </Switch.Root>
          <span className={`ml-3 font-medium ${annualBilling ? 'text-gray-500 dark:text-gray-400' : 'text-gray-900 dark:text-white'}`}>
            Annual <span className="text-green-600 dark:text-green-400 text-sm font-normal">Save 20%</span>
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {/* Starter Plan */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden border border-gray-200 dark:border-gray-700">
            <div className="p-6">
              <h3 className="font-bold text-lg mb-1 text-gray-900 dark:text-white">Starter Plan</h3>
              <p className="text-gray-500 dark:text-gray-400 mb-4">For small businesses starting out</p>
              <div className="mb-6">
                <span className="text-4xl font-bold text-gray-900 dark:text-white">${annualBilling ? '39' : '49'}</span>
                <span className="text-gray-500 dark:text-gray-400">/month</span>
                {annualBilling && (
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Billed annually (${39 * 12}/year)</p>
                )}
              </div>
              <ul className="space-y-3 mb-6">
                <li className="flex items-center text-gray-600 dark:text-gray-300">
                  <svg className="w-5 h-5 mr-2 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  Basic trade data access
                </li>
                <li className="flex items-center text-gray-600 dark:text-gray-300">
                  <svg className="w-5 h-5 mr-2 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  5 market reports/month
                </li>
                <li className="flex items-center text-gray-600 dark:text-gray-300">
                  <svg className="w-5 h-5 mr-2 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  Standard analytics
                </li>
              </ul>
              <button className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md transition-colors">
                Get Started
              </button>
            </div>
          </div>

          {/* Professional Plan */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden border-2 border-blue-500 transform scale-105 z-10">
            <div className="bg-blue-500 text-white text-center py-2 text-sm font-medium">
              Popular
            </div>
            <div className="p-6">
              <h3 className="font-bold text-lg mb-1 text-gray-900 dark:text-white">Professional Plan</h3>
              <p className="text-gray-500 dark:text-gray-400 mb-4">For growing businesses</p>
              <div className="mb-6">
                <span className="text-4xl font-bold text-gray-900 dark:text-white">${annualBilling ? '99' : '129'}</span>
                <span className="text-gray-500 dark:text-gray-400">/month</span>
                {annualBilling && (
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Billed annually (${99 * 12}/year)</p>
                )}
              </div>
              <ul className="space-y-3 mb-6">
                <li className="flex items-center text-gray-600 dark:text-gray-300">
                  <svg className="w-5 h-5 mr-2 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  Full trade data access
                </li>
                <li className="flex items-center text-gray-600 dark:text-gray-300">
                  <svg className="w-5 h-5 mr-2 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  20 market reports/month
                </li>
                <li className="flex items-center text-gray-600 dark:text-gray-300">
                  <svg className="w-5 h-5 mr-2 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  Advanced analytics
                </li>
                <li className="flex items-center text-gray-600 dark:text-gray-300">
                  <svg className="w-5 h-5 mr-2 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  API access
                </li>
              </ul>
              <button className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md transition-colors">
                Get Started
              </button>
            </div>
          </div>

          {/* Enterprise Plan */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden border border-gray-200 dark:border-gray-700">
            <div className="p-6">
              <h3 className="font-bold text-lg mb-1 text-gray-900 dark:text-white">Enterprise Plan</h3>
              <p className="text-gray-500 dark:text-gray-400 mb-4">For large organizations</p>
              <div className="mb-6">
                <span className="text-4xl font-bold text-gray-900 dark:text-white">Custom</span>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Tailored to your needs</p>
              </div>
              <ul className="space-y-3 mb-6">
                <li className="flex items-center text-gray-600 dark:text-gray-300">
                  <svg className="w-5 h-5 mr-2 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  Unlimited access
                </li>
                <li className="flex items-center text-gray-600 dark:text-gray-300">
                  <svg className="w-5 h-5 mr-2 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  Unlimited reports
                </li>
                <li className="flex items-center text-gray-600 dark:text-gray-300">
                  <svg className="w-5 h-5 mr-2 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  Custom analytics
                </li>
                <li className="flex items-center text-gray-600 dark:text-gray-300">
                  <svg className="w-5 h-5 mr-2 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  Dedicated support
                </li>
              </ul>
              <button className="w-full py-3 px-4 bg-gray-800 dark:bg-gray-700 hover:bg-gray-900 dark:hover:bg-gray-600 text-white font-medium rounded-md transition-colors">
                Contact Sales
              </button>
            </div>
          </div>
        </div>

        <div className="max-w-4xl mx-auto mt-12 bg-gray-100 dark:bg-gray-800 rounded-lg p-6">
          <p className="text-center text-gray-600 dark:text-gray-300">
            All plans include: Data export, email support, and regular updates
          </p>
        </div>
      </div>
    </section>
  );
} 