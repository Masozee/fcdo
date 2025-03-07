"use client"

import React from 'react';
import * as Switch from '@radix-ui/react-switch';

export function Pricing() {
  const [isAnnual, setIsAnnual] = React.useState(true);

  return (
    <section className="py-20 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto text-center mb-16">
          <h2 className="text-3xl font-bold mb-4">Simple, Transparent Pricing</h2>
          <p className="text-xl text-gray-600">
            Choose the plan that best fits your needs.
          </p>
          
          <div className="flex items-center justify-center mt-8 space-x-4">
            <span className={`text-sm ${!isAnnual ? 'text-gray-900' : 'text-gray-500'}`}>Monthly</span>
            <Switch.Root
              checked={isAnnual}
              onCheckedChange={setIsAnnual}
              className="w-11 h-6 bg-gray-200 rounded-full relative data-[state=checked]:bg-blue-600 outline-none cursor-pointer"
            >
              <Switch.Thumb className="block w-4 h-4 bg-white rounded-full transition-transform duration-100 translate-x-1 will-change-transform data-[state=checked]:translate-x-6" />
            </Switch.Root>
            <span className={`text-sm ${isAnnual ? 'text-gray-900' : 'text-gray-500'}`}>
              Annual <span className="text-green-500">(Save 20%)</span>
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {/* Starter Plan */}
          <div className="bg-white p-8 rounded-lg shadow-sm border border-gray-200">
            <h3 className="text-xl font-bold mb-4">Starter</h3>
            <div className="mb-6">
              <p className="text-4xl font-bold">
                ${isAnnual ? '39' : '49'}
                <span className="text-base font-normal text-gray-500">/mo</span>
              </p>
              {isAnnual && (
                <p className="text-sm text-green-500">Billed annually (${39 * 12}/year)</p>
              )}
            </div>
            <ul className="space-y-4 mb-8">
              <li className="flex items-center">
                <svg className="w-5 h-5 text-green-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Basic trade data access
              </li>
              <li className="flex items-center">
                <svg className="w-5 h-5 text-green-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                5 market reports/month
              </li>
              <li className="flex items-center">
                <svg className="w-5 h-5 text-green-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Standard analytics
              </li>
            </ul>
            <button className="w-full py-3 px-4 border border-gray-300 rounded-md text-base font-medium hover:bg-gray-50 transition-colors">
              Get Started
            </button>
          </div>

          {/* Professional Plan */}
          <div className="bg-white p-8 rounded-lg shadow-sm border-2 border-blue-500 relative">
            <div className="absolute top-0 right-0 bg-blue-500 text-white px-3 py-1 text-sm font-medium rounded-bl-lg rounded-tr-lg">
              Popular
            </div>
            <h3 className="text-xl font-bold mb-4">Professional</h3>
            <div className="mb-6">
              <p className="text-4xl font-bold">
                ${isAnnual ? '99' : '129'}
                <span className="text-base font-normal text-gray-500">/mo</span>
              </p>
              {isAnnual && (
                <p className="text-sm text-green-500">Billed annually (${99 * 12}/year)</p>
              )}
            </div>
            <ul className="space-y-4 mb-8">
              <li className="flex items-center">
                <svg className="w-5 h-5 text-green-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Full trade data access
              </li>
              <li className="flex items-center">
                <svg className="w-5 h-5 text-green-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                20 market reports/month
              </li>
              <li className="flex items-center">
                <svg className="w-5 h-5 text-green-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Advanced analytics
              </li>
              <li className="flex items-center">
                <svg className="w-5 h-5 text-green-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                API access
              </li>
            </ul>
            <button className="w-full py-3 px-4 bg-blue-600 text-white rounded-md text-base font-medium hover:bg-blue-700 transition-colors">
              Get Started
            </button>
          </div>

          {/* Enterprise Plan */}
          <div className="bg-white p-8 rounded-lg shadow-sm border border-gray-200">
            <h3 className="text-xl font-bold mb-4">Enterprise</h3>
            <div className="mb-6">
              <p className="text-4xl font-bold">
                Custom
                <span className="text-base font-normal text-gray-500">/mo</span>
              </p>
              <p className="text-sm text-gray-500">Tailored to your needs</p>
            </div>
            <ul className="space-y-4 mb-8">
              <li className="flex items-center">
                <svg className="w-5 h-5 text-green-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Unlimited access
              </li>
              <li className="flex items-center">
                <svg className="w-5 h-5 text-green-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Unlimited reports
              </li>
              <li className="flex items-center">
                <svg className="w-5 h-5 text-green-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Custom analytics
              </li>
              <li className="flex items-center">
                <svg className="w-5 h-5 text-green-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Dedicated support
              </li>
            </ul>
            <button className="w-full py-3 px-4 border border-gray-300 rounded-md text-base font-medium hover:bg-gray-50 transition-colors">
              Contact Sales
            </button>
          </div>
        </div>

        <div className="max-w-3xl mx-auto text-center mt-16">
          <p className="text-gray-500">
            All plans include basic features like data export, email support, and regular updates.
            <br />
            Need help choosing? <a href="#" className="text-blue-600 hover:text-blue-700">Contact us</a>
          </p>
        </div>
      </div>
    </section>
  );
} 