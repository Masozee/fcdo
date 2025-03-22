"use client"

import React from 'react';
import * as Accordion from '@radix-ui/react-accordion';
import { motion } from 'framer-motion';
import { ChevronDownIcon, ArrowRightIcon } from '@radix-ui/react-icons';
import Link from 'next/link';

export function FAQ() {
  const faqs = [
    {
      question: "What is the focus of this research report?",
      answer: "This report by CSIS Indonesia examines Indonesia's strategic dependencies, particularly in trade, investment, and supply chains. It identifies key vulnerabilities where Indonesia relies heavily on a few countries for critical sectors, particularly energy and food. The study assesses the risks associated with such dependencies and provides policy recommendations to enhance economic resilience."
    },
    {
      question: "How does this research define \"strategic dependencies\"?",
      answer: "Strategic dependencies refer to Indonesia's heavy reliance on a limited number of external actors for essential economic inputs, such that any disruption—whether due to geopolitical tensions, supply chain shocks, or economic coercion—could impact the country's stability and growth. The study differentiates this from the broader concept of economic security by focusing on key sectors where dependency poses the greatest risks."
    },
    {
      question: "Does a focus on strategic dependencies mean the research advocates for economic self-sufficiency or protectionism?",
      answer: "No. This report does not promote autarky, deglobalization, or isolationist economic policies. Nor does it seek to antagonize any specific partner. Instead, it aims to cultivate a more diverse and resilient economic footing for Indonesia—one that supports the country's ambitions while safeguarding against external shocks. While domestic measures to enhance economic resilience are necessary, they should not lead Indonesia toward across-the-board self-sufficiency in energy and food at the expense of economic efficiency and global integration. The focus on strategic dependencies is meant to help Indonesia achieve strategic autonomy without sliding into autarky."
    },
    {
      question: "Why is this research relevant for Indonesia's economic future?",
      answer: "As Indonesia aims to become an advanced economy by 2045, it must strengthen its economic resilience. Global geopolitical rivalries and supply chain disruptions have made economic interdependence a potential liability. By identifying and mitigating strategic dependencies, Indonesia can safeguard its economic stability while maintaining its free and active foreign policy approach."
    },
    {
      question: "What are the key sectors where Indonesia faces economic vulnerabilities?",
      answer: "The research identifies several sectors with high dependency risks: Energy: Despite its resource wealth, Indonesia imports a significant share of refined fuel from Singapore and Malaysia, particularly in times of crisis. Food: Heavy reliance on imported wheat (Australia, Canada), garlic (China), and beef (Australia) makes Indonesia susceptible to supply shocks and price volatility."
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
            Get answers to common questions about our research
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
                  className="bg-white dark:bg-gray-900 rounded-lg overflow-hidden shadow-sm border-0"
                >
                  <Accordion.Trigger className="w-full flex justify-between items-center px-6 py-4 text-left focus:outline-none group">
                    <span className="text-lg font-medium text-gray-900 dark:text-white">{faq.question}</span>
                    <ChevronDownIcon className="h-5 w-5 text-gray-500 dark:text-gray-400 transform transition-transform duration-200 group-data-[state=open]:rotate-180" />
                  </Accordion.Trigger>
                  <Accordion.Content className="overflow-hidden data-[state=open]:animate-slideDown data-[state=closed]:animate-slideUp">
                    <div className="px-6 py-4">
                      <p className="text-gray-600 dark:text-gray-300">{faq.answer}</p>
                    </div>
                  </Accordion.Content>
                </Accordion.Item>
              </motion.div>
            ))}
          </Accordion.Root>
          
          <div className="mt-12 text-center">
            <Link 
              href="/faq" 
              className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 text-sm font-medium inline-flex items-center"
            >
              View All FAQs
              <ArrowRightIcon className="ml-2 h-4 w-4" />
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
} 