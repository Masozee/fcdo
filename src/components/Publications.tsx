"use client"

import React from 'react';
import { motion } from 'framer-motion';

export function Publications() {
  const publications = [
    {
      id: 1,
      title: "Global Trade Patterns in 2023",
      description: "A comprehensive analysis of international trade flows and emerging trends in global markets.",
      imageUrl: "/graphicook-studio-apf021dql2E-unsplash.png",
      date: "March 2023",
      category: "Market Analysis"
    },
    {
      id: 2,
      title: "Supply Chain Resilience Report",
      description: "Examining how countries and companies are rebuilding supply chains in the post-pandemic economy.",
      imageUrl: "getty-images-J6FmeeQ5SHc-unsplash.png",
      date: "January 2023",
      category: "Industry Report"
    },
    {
      id: 3,
      title: "Emerging Markets Trade Outlook",
      description: "Future forecast for trade relationships between developed economies and emerging markets.",
      imageUrl: "/getty-images-id1c7BO1uC8-unsplash.png",
      date: "February 2023",
      category: "Economic Forecast"
    }
  ];

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2
      }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { 
      opacity: 1, 
      y: 0,
      transition: {
        duration: 0.5
      }
    }
  };

  return (
    <section className="py-20 bg-white dark:bg-gray-900">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto text-center mb-16">
          <motion.h2 
            className="text-3xl font-bold mb-4 text-gray-900 dark:text-white"
            initial={{ opacity: 0, y: -20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
          >
            Latest Publications
          </motion.h2>
          <motion.p 
            className="text-xl text-gray-600 dark:text-gray-300"
            initial={{ opacity: 0, y: -20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            viewport={{ once: true }}
          >
            In-depth analysis and insights from our trade data experts
          </motion.p>
        </div>

        <motion.div 
          className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto"
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
        >
          {publications.map((publication) => (
            <motion.div 
              key={publication.id}
              className="bg-gray-50 dark:bg-gray-800 rounded-lg overflow-hidden shadow-md"
              variants={item}
              whileHover={{ 
                scale: 1.03,
                transition: { duration: 0.2 }
              }}
            >
              <img
                src={publication.imageUrl}
                alt={publication.title}
                className="w-full h-48 object-cover"
              />
              <div className="p-6">
                <div className="flex justify-between items-center mb-3">
                  <span className="text-sm font-medium text-blue-600 dark:text-blue-400">{publication.category}</span>
                  <span className="text-sm text-gray-500 dark:text-gray-400">{publication.date}</span>
                </div>
                <h3 className="font-bold text-lg mb-2 text-gray-900 dark:text-white">{publication.title}</h3>
                <p className="text-gray-600 dark:text-gray-300 mb-4">
                  {publication.description}
                </p>
                <a
                  href="#"
                  className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium inline-flex items-center"
                >
                  Read Publication
                  <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </a>
              </div>
            </motion.div>
          ))}
        </motion.div>

        <motion.div 
          className="text-center mt-12"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          viewport={{ once: true }}
        >
          <a
            href="#"
            className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 md:py-4 md:text-lg md:px-8 transition-colors"
          >
            View All Publications
          </a>
        </motion.div>
      </div>
    </section>
  );
} 