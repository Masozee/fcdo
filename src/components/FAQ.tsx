"use client"

import React from 'react';
import * as Accordion from '@radix-ui/react-accordion';
import { motion } from 'framer-motion';
import { ChevronDownIcon } from '@radix-ui/react-icons';

export function FAQ() {
  const faqs = [
    {
      question: "What data sources do you use?",
      answer: "Our platform aggregates data from various official sources including UN Comtrade, WTO, national customs agencies, and other authoritative trade databases. All data is verified and processed to ensure accuracy."
    },
    {
      question: "How often is the trade data updated?",
      answer: "Most of our trade data is updated monthly, with some specialized datasets updated quarterly. We always display the last update timestamp on each dataset to ensure transparency."
    },
    {
      question: "Can I export the data for my own analysis?",
      answer: "Yes, all plans include data export functionality in various formats including CSV, Excel, and JSON. Premium plans offer additional API access for programmatic data retrieval."
    },
    {
      question: "Do you provide historical trade data?",
      answer: "Yes, our database includes historical trade data going back to 1990 for most countries, with more recent years offering more detailed breakdowns by product categories."
    },
    {
      question: "How do I get support if I have questions?",
      answer: "We provide email support for all users. Professional and Enterprise plans include priority support with faster response times, and Enterprise users are assigned a dedicated account manager."
    }
  ];

  return (
    <section className="py-20 bg-white dark:bg-gray-800">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto text-center mb-16">
          <motion.h2 
            className="text-3xl font-bold mb-4 text-gray-900 dark:text-white"
            initial={{ opacity: 0, y: -20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
          >
            Frequently Asked Questions
          </motion.h2>
          <motion.p 
            className="text-xl text-gray-600 dark:text-gray-300"
            initial={{ opacity: 0, y: -20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            viewport={{ once: true }}
          >
            Get answers to common questions about our platform and services
          </motion.p>
        </div>

        <motion.div 
          className="max-w-3xl mx-auto"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          viewport={{ once: true }}
        >
          <Accordion.Root type="single" collapsible className="space-y-4">
            {faqs.map((faq, index) => (
              <motion.div 
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 * index }}
                viewport={{ once: true }}
              >
                <Accordion.Item 
                  value={`item-${index}`}
                  className="bg-white dark:bg-gray-900 rounded-lg shadow-sm overflow-hidden"
                >
                  <Accordion.Trigger className="w-full flex justify-between items-center px-6 py-4 text-left focus:outline-none group">
                    <span className="text-lg font-medium text-gray-900 dark:text-white">{faq.question}</span>
                    <ChevronDownIcon className="h-5 w-5 text-gray-500 dark:text-gray-400 transform transition-transform duration-200 group-data-[state=open]:rotate-180" />
                  </Accordion.Trigger>
                  <Accordion.Content className="overflow-hidden data-[state=open]:animate-slideDown data-[state=closed]:animate-slideUp">
                    <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700">
                      <p className="text-gray-600 dark:text-gray-300">{faq.answer}</p>
                    </div>
                  </Accordion.Content>
                </Accordion.Item>
              </motion.div>
            ))}
          </Accordion.Root>
        </motion.div>
      </div>
    </section>
  );
} 