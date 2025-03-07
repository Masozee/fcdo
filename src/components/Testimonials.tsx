"use client"

import React from 'react';

export function Testimonials() {
  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto text-center mb-16">
          <h2 className="text-3xl font-bold mb-4">What Our Customers Say</h2>
          <p className="text-xl text-gray-600">
            Trusted by leading companies worldwide to make data-driven trade decisions.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {/* Testimonial 1 */}
          <div className="bg-gray-50 p-8 rounded-lg">
            <div className="flex items-center mb-6">
              <img
                src="https://via.placeholder.com/48"
                alt="Sarah Chen"
                className="w-12 h-12 rounded-full mr-4"
              />
              <div>
                <h3 className="font-medium">Sarah Chen</h3>
                <p className="text-sm text-gray-500">Director of Global Trade, TechCorp</p>
              </div>
            </div>
            <blockquote className="text-gray-600 mb-6">
              "The insights we've gained from this platform have been invaluable. We've been able to identify new market opportunities and optimize our trade strategies effectively."
            </blockquote>
            <div className="flex items-center">
              <div className="flex text-yellow-400">
                {[...Array(5)].map((_, i) => (
                  <svg key={i} className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
            </div>
          </div>

          {/* Testimonial 2 */}
          <div className="bg-gray-50 p-8 rounded-lg">
            <div className="flex items-center mb-6">
              <img
                src="https://via.placeholder.com/48"
                alt="Marcus Rodriguez"
                className="w-12 h-12 rounded-full mr-4"
              />
              <div>
                <h3 className="font-medium">Marcus Rodriguez</h3>
                <p className="text-sm text-gray-500">Supply Chain Manager, Global Logistics</p>
              </div>
            </div>
            <blockquote className="text-gray-600 mb-6">
              "The platform's data visualization tools have transformed how we analyze trade patterns. It's become an essential part of our decision-making process."
            </blockquote>
            <div className="flex items-center">
              <div className="flex text-yellow-400">
                {[...Array(5)].map((_, i) => (
                  <svg key={i} className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
            </div>
          </div>

          {/* Testimonial 3 */}
          <div className="bg-gray-50 p-8 rounded-lg">
            <div className="flex items-center mb-6">
              <img
                src="https://via.placeholder.com/48"
                alt="Emily Zhang"
                className="w-12 h-12 rounded-full mr-4"
              />
              <div>
                <h3 className="font-medium">Emily Zhang</h3>
                <p className="text-sm text-gray-500">Trade Analyst, AgriTech Solutions</p>
              </div>
            </div>
            <blockquote className="text-gray-600 mb-6">
              "The predictive analytics have helped us stay ahead of market trends. We've seen a significant improvement in our trade strategy outcomes."
            </blockquote>
            <div className="flex items-center">
              <div className="flex text-yellow-400">
                {[...Array(5)].map((_, i) => (
                  <svg key={i} className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="text-center mt-12">
          <a
            href="#"
            className="text-blue-600 hover:text-blue-700 font-medium inline-flex items-center"
          >
            Read More Customer Stories
            <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </a>
        </div>
      </div>
    </section>
  );
} 