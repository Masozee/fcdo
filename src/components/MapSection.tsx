"use client"

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';

// Define types for our trade data
interface TradePartner {
  name: string;
  value: number;
}

interface HSCode {
  code: string;
  name: string;
  value: number;
  growth: number;
  topExporters: TradePartner[];
}

// Dummy product trade data by HS code
const productData: HSCode[] = [
  {
    code: "8517",
    name: "Telecommunications Equipment",
    value: 950,
    growth: 4.2,
    topExporters: [
      { name: "China", value: 420 },
      { name: "Vietnam", value: 180 },
      { name: "South Korea", value: 120 },
      { name: "United States", value: 90 },
      { name: "Taiwan", value: 65 }
    ]
  },
  {
    code: "2709",
    name: "Crude Oil",
    value: 820,
    growth: -2.1,
    topExporters: [
      { name: "Saudi Arabia", value: 220 },
      { name: "Russia", value: 180 },
      { name: "United States", value: 150 },
      { name: "Iraq", value: 120 },
      { name: "Canada", value: 95 }
    ]
  },
  {
    code: "8703",
    name: "Passenger Vehicles",
    value: 780,
    growth: 1.8,
    topExporters: [
      { name: "Germany", value: 210 },
      { name: "Japan", value: 185 },
      { name: "United States", value: 150 },
      { name: "South Korea", value: 90 },
      { name: "Mexico", value: 70 }
    ]
  },
  {
    code: "3004",
    name: "Medicaments",
    value: 620,
    growth: 7.5,
    topExporters: [
      { name: "Germany", value: 170 },
      { name: "Switzerland", value: 140 },
      { name: "United States", value: 120 },
      { name: "Belgium", value: 90 },
      { name: "Ireland", value: 60 }
    ]
  },
  {
    code: "8471",
    name: "Computers",
    value: 580,
    growth: 3.2,
    topExporters: [
      { name: "China", value: 240 },
      { name: "United States", value: 120 },
      { name: "Taiwan", value: 80 },
      { name: "Thailand", value: 60 },
      { name: "Mexico", value: 40 }
    ]
  }
];

// Colors for the pie chart
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

export function MapSection() {
  const [selectedProduct, setSelectedProduct] = useState<HSCode | null>(null);

  const handleProductSelect = (product: HSCode) => {
    setSelectedProduct(product);
  };

  return (
    <section className="py-16 bg-white dark:bg-gray-900">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto text-center mb-8">
          <motion.h2 
            className="text-3xl font-bold mb-4 text-gray-900 dark:text-white"
            initial={{ opacity: 0, y: -20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
          >
            Product Trade Analysis
          </motion.h2>
          <motion.p 
            className="text-xl text-gray-600 dark:text-gray-400"
            initial={{ opacity: 0, y: -20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            viewport={{ once: true }}
          >
            Explore trade flows by product category with our interactive tools
          </motion.p>
        </div>
        
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-6xl mx-auto"
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="md:col-span-1 bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
              <h3 className="text-lg font-medium mb-4 text-gray-900 dark:text-white">Top Product Categories</h3>
              <div className="space-y-3">
                {productData.map((product) => (
                  <motion.div 
                    key={product.code}
                    className={`bg-white dark:bg-gray-700 p-3 rounded-md cursor-pointer border-l-4 transition-colors duration-200 ${selectedProduct?.code === product.code ? 'border-blue-600' : 'border-transparent'}`}
                    onClick={() => handleProductSelect(product)}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <div className="flex justify-between items-center">
                      <div>
                        <h4 className="font-medium text-gray-900 dark:text-white">{product.name}</h4>
                        <p className="text-sm text-gray-500 dark:text-gray-400">HS Code: {product.code}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-gray-900 dark:text-white">${product.value}B</p>
                        <p className={`text-sm ${product.growth >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                          {product.growth >= 0 ? '+' : ''}{product.growth}%
                        </p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            <div className="md:col-span-2 bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
              <AnimatePresence mode="wait">
                {selectedProduct ? (
                  <motion.div
                    key={selectedProduct.code}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <h3 className="text-lg font-medium mb-2 text-gray-900 dark:text-white">{selectedProduct.name}</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">Global trade value: ${selectedProduct.value} billion | Annual growth: {selectedProduct.growth}%</p>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                      <div>
                        <h4 className="text-md font-medium text-gray-900 dark:text-white mb-3">Top Exporters</h4>
                        <div className="h-64">
                          <ResponsiveContainer width="100%" height="100%">
                            <BarChart
                              data={selectedProduct.topExporters}
                              layout="vertical"
                              margin={{ top: 5, right: 5, left: 60, bottom: 5 }}
                            >
                              <CartesianGrid strokeDasharray="3 3" />
                              <XAxis type="number" />
                              <YAxis type="category" dataKey="name" />
                              <Tooltip />
                              <Bar dataKey="value" fill="#3B82F6" />
                            </BarChart>
                          </ResponsiveContainer>
                        </div>
                      </div>
                      
                      <div>
                        <h4 className="text-md font-medium text-gray-900 dark:text-white mb-3">Export Share</h4>
                        <div className="h-64">
                          <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                              <Pie
                                data={selectedProduct.topExporters}
                                cx="50%"
                                cy="50%"
                                labelLine={false}
                                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                outerRadius={80}
                                fill="#8884d8"
                                dataKey="value"
                              >
                                {selectedProduct.topExporters.map((entry, index) => (
                                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                              </Pie>
                              <Tooltip />
                            </PieChart>
                          </ResponsiveContainer>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ) : (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.3 }}
                    className="h-full flex items-center justify-center"
                  >
                    <div className="text-center py-12">
                      <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                      <h3 className="mt-2 text-lg font-medium text-gray-900 dark:text-white">Select a Product</h3>
                      <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                        Choose a product category from the list to view detailed trade data
                      </p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </motion.div>
        
        <div className="mt-8 text-center">
          <motion.p 
            className="text-sm text-gray-500 dark:text-gray-400"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            viewport={{ once: true }}
          >
            Data shown is for demonstration purposes only. For more detailed analysis, explore our Data Explorer.
          </motion.p>
        </div>
      </div>
    </section>
  );
} 