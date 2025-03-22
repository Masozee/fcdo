"use client"

import React from 'react';
import { ArrowLeftIcon, DownloadIcon } from '@radix-ui/react-icons';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

// This would typically come from an API or database
const publicationsData = [
  {
    id: 1,
    title: "Indonesia's Strategic Dependencies",
    description: "A comprehensive analysis of international trade flows and emerging trends in global markets. This report examines Indonesia's trade dependencies, analyzing key import and export relationships, strategic resources, and vulnerability to global supply chain disruptions. The research provides insights into how Indonesia can diversify its trade partnerships and strengthen economic resilience.",
    longDescription: `
      <p>This research report is the product of a study by CSIS Indonesia on Indonesia's strategic dependencies, focusing on the country's economic vulnerabilities arising from concentrated trade, supply chain, and investment of key sectors. As Indonesia seeks to become an advanced economy by 2045, it cannot afford to detach from the reality where such a vision situates the country directly into the global dynamics and exposes it to vulnerability from disruptions triggered by geopolitical rivalry – represented by the rise of the discursive use of the concept of economic security, which describes perceptions that external dependencies could be weaponised amid global geopolitical shifts.</p>
      
      <p>This study maps Indonesia's critical economic dependencies, assesses their potential risks, and proposes policy recommendations to enhance resilience. As a caveat, 
      this research departs not from an inquisitive attempt to interpret the impact of ongoing geopolitical dynamics, which many have done, but rather seeks to promote an inquiry of analysis based on what types of geopolitical dynamics, from which sources,
       and in which regions have the potential to significantly disrupt Indonesia's economy and overall well-being.</p>
      
       <p>The research departs from the assumption that Indonesia is better served by focusing on "Strategic Dependencies" rather than fully embracing the policy lexicon of economic security as we see circulating around the globe. This concept hones in on the specific areas where Indonesia's economic well-being is most at risk due to heavy reliance on external actors. By identifying strategic dependencies, Indonesia can prioritise which vulnerabilities to address, without diluting attention across the entire economy.</p>

       <p>Indonesia's foreign economic relations are indeed shaped by its free and active foreign policy, which prioritises economic growth over geopolitical alignment. However, the increasing use of economic coercion by major powers, recent cases of supply chain disruptions caused by natural or human-made disasters, and the impact of geopolitical crises, such as the Russia-Ukraine war, underscore the need for Indonesia to pay close attention to its strategic dependencies. Understanding these dependencies is crucial for strengthening Indonesia's economic resilience against external shocks.</p>

       <p>We conduct this study by employing a mixed-methods approach, combining quantitative trade and investment data analysis with qualitative insights from expert discussions. The research involved a literature review on economic security and vulnerability, a mapping of Indonesia's most critical trade and investment dependencies, focus group discussions (FGDs) with policymakers and industry experts, and a scenario-mapping exercise to assess potential external crises. These methods allow us to capture the extent of Indonesia's strategic dependencies and their implications for economic stability.</p>

       <p>Our findings reveal that Indonesia's economic vulnerabilities are concentrated in several key sectors. In trade, over 50% of Indonesia's exports go to five countries, with China alone accounting for 25%, while more than 28% of imports originate from China. In investment, 75% of Foreign Direct Investment (FDI) comes from just five sources—Singapore, China, Hong Kong, Japan, and Malaysia—indicating a significant reliance on a few economic partners. In the food sector, Indonesia depends heavily on imported wheat (Australia, Canada), garlic (China), and beef (Australia), making it susceptible to supply shocks and price volatility. In the energy sector, despite its resource wealth, Indonesia imports a large share of refined fuel from Singapore and Malaysia, posing a strategic risk in times of crisis. Meanwhile, technology and manufacturing remain reliant on China, Japan, and South Korea, and pharmaceutical supplies are dominated by China and India, with over 90% of raw materials being imported.</p>

       <p>In conclusion, Indonesia's increasing integration into global markets and its ambition to play a greater role in the Indo-Pacific require a reassessment of its strategic dependencies. While economic interdependence remains a reality, Indonesia must take steps to mitigate vulnerabilities and enhance its resilience. By focusing on strategic dependencies, Indonesia can prioritise strategic autonomy without sliding into autarky.</p>

       <p>To address these vulnerabilities, we propose a set of strategic policy recommendations. First, Indonesia must diversify its trade and investment sources to reduce reliance on a few dominant countries. Expanding partnerships, particularly in critical sectors, will mitigate risks of supply disruptions. Second, domestic capacity-building should be prioritised, especially in key industries such as energy refining, food production and reserve, and pharmaceutical production, to mitigate Indonesia's dependence. Third, a proactive risk management framework must be developed to assess geopolitical threats and economic vulnerabilities through scenario planning and crisis response mechanisms. Finally, regional cooperation within ASEAN and the broader Indo-Pacific should be strengthened to build resilient supply chains and ensure access to essential commodities, even during crises times.</p>

       <p>By diversifying trade and investment, strengthening domestic industries, and adopting a forward-looking economic security strategy, Indonesia can safeguard its long-term prosperity and maintain strategic autonomy in an evolving geopolitical landscape.</p>
    `,
    imageUrl: "/report1.jpg",
    date: "March 2025",
    category: "Research Report",
    slug: "indonesias-strategic-dependencies",
    authors: ["Lina A. Alexandra", "Andrew W. Mantong", "Dandy Rafitrandi", "M. Habib A. Dzakwan", "M. Waffaa Kharisma", "Pieter A. Pandie", "Anastasia A. Widyautami", "Balthazaar A. Ardhillah"],
    tags: ["Indonesia", "Strategic Trade", "Global Markets"],
    downloadUrl: "http://localhost:3000/strategicdependencyreport"
  }
];

interface PublicationDetailPageProps {
  params: {
    slug: string
  }
}

export default function PublicationDetailPage({ params }: PublicationDetailPageProps) {
  // Find the publication by slug
  const publication = publicationsData.find(pub => pub.slug === params.slug) || null;
  
  if (!publication) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">Publication Not Found</h1>
          <p className="text-gray-600 dark:text-gray-300 mb-6">The publication you're looking for doesn't exist or may have been moved.</p>
          <Link href="/publications" className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300">
            ← Return to Publications
          </Link>
        </div>
      </div>
    );
  }
  
  // Split the longDescription to insert the table
  const splitString = '<p>In conclusion, Indonesia\'s increasing integration into global markets';
  const splitAddress = '<p>To address these vulnerabilities, we propose a set of strategic policy recommendations';
  
  let conclusion = '';
  let toAddress = '';
  let restContent = publication?.longDescription || '';
  
  if (publication?.longDescription) {
    const conclusionIndex = publication.longDescription.indexOf(splitString);
    const addressIndex = publication.longDescription.indexOf(splitAddress);
    
    if (conclusionIndex !== -1 && addressIndex !== -1) {
      conclusion = publication.longDescription.substring(0, addressIndex);
      toAddress = publication.longDescription.substring(addressIndex);
    }
  }

  // Policy measures table HTML
  const policyMeasuresTable = `
    <div class="my-8 overflow-x-auto">
      <table class="w-full border-collapse">
        <thead>
          <tr>
            <th class="bg-teal-200 dark:bg-teal-800 p-4 text-left font-medium text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700">
              Domestic Policy Measures<br />for Economic Resilience
            </th>
            <th class="bg-teal-200 dark:bg-teal-800 p-4 text-left font-medium text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700">
              Trade Policy and<br />Diversification of Partners
            </th>
            <th class="bg-teal-200 dark:bg-teal-800 p-4 text-left font-medium text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700">
              Foreign Policy<br />and Security Strategies
            </th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td class="p-4 align-top border border-gray-200 dark:border-gray-700">
              <p class="mb-2">Invest in boosting domestic production of critical goods.</p>
            </td>
            <td class="p-4 align-top border border-gray-200 dark:border-gray-700">
              <p class="mb-2">Broaden a pool of import partners for each critical commodity through bilateral trade agreements or MoUs.</p>
            </td>
            <td class="p-4 align-top border border-gray-200 dark:border-gray-700">
              <p class="mb-2">Maintain a diverse set of strong relationships across the globe, especially with important commodity exporter or investor states.</p>
            </td>
          </tr>
          <tr>
            <td class="p-4 align-top border border-gray-200 dark:border-gray-700">
              <p class="mb-2">Maintain robust strategic reserves to buffer short-term disruptions.</p>
            </td>
            <td class="p-4 align-top border border-gray-200 dark:border-gray-700">
              <p class="mb-2">Focus on South-South cooperation to ensure food security.</p>
            </td>
            <td class="p-4 align-top border border-gray-200 dark:border-gray-700">
              <p class="mb-2">Advocate against weaponisation of economic interdependence with preventive diplomacy.</p>
            </td>
          </tr>
          <tr>
            <td class="p-4 align-top border border-gray-200 dark:border-gray-700">
              <p class="mb-2">Developing alternative energy sources domestically.</p>
            </td>
            <td class="p-4 align-top border border-gray-200 dark:border-gray-700">
              <p class="mb-2">Annually monitor supplier concentration indexes.</p>
            </td>
            <td class="p-4 align-top border border-gray-200 dark:border-gray-700">
              <p class="mb-2">Utilise intelligence community to monitor global supply trends and give early warning.</p>
            </td>
          </tr>
          <tr>
            <td class="p-4 align-top border border-gray-200 dark:border-gray-700">
              <p class="mb-2">Implement Productive Incentive Schemes in manufacturing to attract investment.</p>
            </td>
            <td class="p-4 align-top border border-gray-200 dark:border-gray-700">
              <p class="mb-2">Push for stronger regional integration and pooling.</p>
            </td>
            <td class="p-4 align-top border border-gray-200 dark:border-gray-700">
              <p class="mb-2">Establish an inter-agency Economic Security Task Force.</p>
            </td>
          </tr>
          <tr>
            <td class="p-4 align-top border border-gray-200 dark:border-gray-700"></td>
            <td class="p-4 align-top border border-gray-200 dark:border-gray-700">
              <p class="mb-2">Foreign trade strategy should involve carefully calibrated import protection or incentives.</p>
            </td>
            <td class="p-4 align-top border border-gray-200 dark:border-gray-700">
              <p class="mb-2">Lead ASEAN in developing joint strategic reserves system.</p>
            </td>
          </tr>
          <tr>
            <td class="p-4 align-top border border-gray-200 dark:border-gray-700"></td>
            <td class="p-4 align-top border border-gray-200 dark:border-gray-700"></td>
            <td class="p-4 align-top border border-gray-200 dark:border-gray-700">
              <p class="mb-2">Pursue swap deals arrangements for resilience.</p>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  `;
  
  return (
    <div className="container mx-auto px-4 py-12">
      {/* Back link */}
      <div className="mb-8">
        <Link href="/publications" className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 inline-flex items-center">
          <ArrowLeftIcon className="mr-2 h-4 w-4" />
          Back to Publications
        </Link>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main content */}
        <div className="lg:col-span-2">
          <div className="p-6 bg-background">
            <h1 className="text-3xl font-bold mb-6 text-gray-900 dark:text-white">{publication.title}</h1>
            
            <div className="mb-8">
              <img 
                src={publication.imageUrl} 
                alt={publication.title} 
                className="w-full h-auto"
              />
            </div>
            
            <div className="prose prose-lg max-w-none mb-8 text-gray-700 dark:text-gray-300 overflow-hidden">
              {conclusion && (
                <div dangerouslySetInnerHTML={{ __html: conclusion }} />
              )}
              
              {/* Insert policy measures table */}
              <div dangerouslySetInnerHTML={{ __html: policyMeasuresTable }} />
              
              {toAddress && (
                <div dangerouslySetInnerHTML={{ __html: toAddress }} />
              )}
              
              {!conclusion && !toAddress && (
                <div dangerouslySetInnerHTML={{ __html: restContent }} />
              )}
            </div>
            
            <div className="mt-8">
              <h3 className="text-lg font-semibold mb-3 text-gray-900 dark:text-white">Tags</h3>
              <div className="flex flex-wrap gap-2">
                {publication.tags.map((tag, index) => (
                  <Badge key={index} variant="outline">{tag}</Badge>
                ))}
              </div>
            </div>
          </div>
        </div>
        
        {/* Sidebar */}
        <div className="lg:col-span-1">
          <Card className="border-0 shadow-none">
            <CardContent className="p-6">
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-white">Publication Details</h3>
                  <Separator className="my-2" />
                  <dl className="space-y-4 mt-4">
                    <div>
                      <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Category</dt>
                      <dd className="mt-1 text-sm text-gray-900 dark:text-white">{publication.category}</dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Published</dt>
                      <dd className="mt-1 text-sm text-gray-900 dark:text-white">{publication.date}</dd>
                    </div>
                  </dl>
                </div>
                
                <div>
                  <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-white">Authors</h3>
                  <Separator className="my-2" />
                  <ul className="space-y-2 mt-4">
                    {publication.authors.map((author, index) => (
                      <li key={index} className="text-sm text-gray-900 dark:text-white">{author}</li>
                    ))}
                  </ul>
                </div>
                
                <div>
                  <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-white">Download</h3>
                  <Separator className="my-2" />
                  <div className="mt-4">
                    <Button className="w-full" asChild>
                      <a href={publication.downloadUrl} target="_blank" rel="noopener noreferrer">
                        <DownloadIcon className="mr-2 h-4 w-4" />
                        Download Report
                      </a>
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
} 