"use client"

import React from 'react';
import * as Accordion from '@radix-ui/react-accordion';
import { ChevronDownIcon } from '@radix-ui/react-icons';
import { Separator } from '@/components/ui/separator';

export default function FAQPage() {
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
      answer: "The research identifies several sectors with high dependency risks:\n\n• Energy: Despite its resource wealth, Indonesia imports a significant share of refined fuel from Singapore and Malaysia, particularly in times of crisis.\n\n• Food: Heavy reliance on imported wheat (Australia, Canada), garlic (China), and beef (Australia) makes Indonesia susceptible to supply shocks and price volatility."
    },
    {
      question: "How does Indonesia's participation in global value chains affect its strategic dependencies?",
      answer: "Indonesia's integration into global value chains has boosted economic growth but also created vulnerabilities. For instance, in manufacturing, Indonesia relies on components and technology from China, Japan, and South Korea. In pharmaceuticals, over 90% of raw materials are imported, primarily from China and India. These dependencies can limit Indonesia's policy autonomy and economic security, especially during global crises."
    },
    {
      question: "What methods were used in this research?",
      answer: "The study employed a mixed-methods approach, combining quantitative trade and investment data analysis with qualitative insights from expert discussions. The research involved a literature review on economic security and vulnerability, a mapping of Indonesia's most critical trade and investment dependencies, focus group discussions (FGDs) with policymakers and industry experts, and a scenario-mapping exercise to assess potential external crises."
    },
    {
      question: "What are the recommended strategies for addressing Indonesia's strategic dependencies?",
      answer: "The report proposes several key strategies:\n\n• Diversification of trade and investment partners to reduce concentration risk\n\n• Domestic capacity building in critical sectors such as energy refining, food production, and pharmaceutical manufacturing\n\n• Development of a proactive risk management framework including scenario planning and crisis response mechanisms\n\n• Strengthening regional cooperation within ASEAN and the Indo-Pacific to build resilient supply chains"
    },
    {
      question: "How should policymakers balance economic efficiency with security concerns?",
      answer: "The report recommends a targeted approach that focuses on strategic dependencies rather than across-the-board self-sufficiency. By identifying specific sectors where dependency poses the greatest risks to national interests, policymakers can allocate resources efficiently. The goal should be to enhance resilience in critical areas while maintaining the benefits of global economic integration in others."
    },
    {
      question: "What role can the private sector play in addressing strategic dependencies?",
      answer: "The private sector is crucial for building economic resilience. Companies can diversify supplier networks, invest in domestic production capabilities for critical goods, participate in public-private partnerships for strategic reserves, and share information about potential supply chain vulnerabilities. Government incentives and regulatory frameworks can help align private sector interests with national economic security goals."
    }
  ];

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-4 text-gray-900 dark:text-white">Frequently Asked Questions</h1>
        <p className="text-xl text-gray-600 dark:text-gray-300 mb-8">
          Comprehensive answers to questions about our research on Indonesia's strategic dependencies
        </p>
        <Separator className="my-8" />
        
        <div className="space-y-6">
          <Accordion.Root type="single" collapsible className="space-y-4">
            {faqs.map((faq, index) => (
              <div key={index} className="bg-white dark:bg-gray-900 rounded-lg shadow-sm border-0 overflow-hidden">
                <Accordion.Item value={`item-${index}`}>
                  <Accordion.Trigger className="w-full flex justify-between items-center px-6 py-4 text-left focus:outline-none group">
                    <span className="text-lg font-medium text-gray-900 dark:text-white">{faq.question}</span>
                    <ChevronDownIcon className="h-5 w-5 text-gray-500 dark:text-gray-400 transform transition-transform duration-200 group-data-[state=open]:rotate-180" />
                  </Accordion.Trigger>
                  <Accordion.Content className="overflow-hidden data-[state=open]:animate-slideDown data-[state=closed]:animate-slideUp">
                    <div className="px-6 py-4">
                      <p className="text-gray-600 dark:text-gray-300 whitespace-pre-line">{faq.answer}</p>
                    </div>
                  </Accordion.Content>
                </Accordion.Item>
              </div>
            ))}
          </Accordion.Root>
        </div>
      </div>
    </div>
  );
} 