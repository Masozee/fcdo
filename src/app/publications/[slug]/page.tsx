"use client"

import React, { useState } from 'react';
import { ArrowLeftIcon, DownloadIcon, Link1Icon, TwitterLogoIcon } from '@radix-ui/react-icons';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';

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

       <p>To address these vulnerabilities, we propose a set of strategic policy recommendations. First, Indonesia must diversify its trade and investment sources to reduce reliance on a few dominant countries. Expanding partnerships, particularly in critical sectors, will mitigate risks of supply disruptions. Second, domestic capacity-building should be prioritised, especially in key industries such as energy refining, food production and reserve, and pharmaceutical production, to mitigate Indonesia's dependence. Third, a proactive risk management framework must be developed to assess geopolitical threats and economic vulnerabilities through scenario planning and crisis response mechanisms. Finally, regional cooperation within ASEAN and the broader Indo-Pacific should be strengthened to build resilient supply chains and ensure access to essential commodities, even during crises times.</p>

       <p>In conclusion, Indonesia's increasing integration into global markets and its ambition to play a greater role in the Indo-Pacific require a reassessment of its strategic dependencies. While economic interdependence remains a reality, Indonesia must take steps to mitigate vulnerabilities and enhance its resilience. By focusing on strategic dependencies, Indonesia can prioritise strategic autonomy without sliding into autarky.</p>
    `,
    imageUrl: "/report1.jpg",
    date: "March 2025",
    category: "Research Report",
    slug: "indonesias-strategic-dependencies",
    authors: ["Lina A. Alexandra", "Andrew W. Mantong", "Dandy Rafitrandi", "M. Habib A. Dzakwan", "M. Waffaa Kharisma", "Pieter A. Pandie", "Anastasia A. Widyautami", "Balthazaar A. Ardhillah"],
    tags: ["Indonesia", "Strategic Trade", "Global Markets"],
    downloadUrl: "https://s3-csis-web.s3.ap-southeast-1.amazonaws.com/doc/Strategic+Dependency+Final+Report.pdf"
  }
];

// Define the correct type for page props with dynamic params
type PublicationPageProps = {
  params: {
    slug: string
  }
}

export default function PublicationDetailPage({ params }: PublicationPageProps) {
  const [isCopied, setIsCopied] = useState(false);
  
  // Find the publication by slug
  const publication = publicationsData.find(pub => pub.slug === params.slug) || null;
  
  if (!publication) {
    return (
      <div className="max-w-7xl mx-auto px-6 sm:px-8 py-12">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">Publication Not Found</h1>
          <p className="text-gray-600 dark:text-gray-300 mb-6">The publication you're looking for doesn't exist or may have been moved.</p>
          <Link href="/publications" className="text-[#005353] hover:text-[#003f3f] dark:text-[#00aeae] dark:hover:text-[#00c2c2]">
            ← Return to Publications
          </Link>
        </div>
      </div>
    );
  }
  
  // Policy measures table HTML
  const policyMeasuresTable = `
    <div class="my-8 overflow-x-auto">
      <table class="w-full border-collapse">
        <thead>
          <tr>
            <th class="bg-teal-100 dark:bg-teal-900 p-5 text-left font-semibold text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700 rounded-tl-md">
              <div class="text-lg mb-1">Domestic Policy Measures</div>
              <div class="text-sm font-medium opacity-80">for Economic Resilience</div>
            </th>
            <th class="bg-teal-100 dark:bg-teal-900 p-5 text-left font-semibold text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700">
              <div class="text-lg mb-1">Trade Policy</div>
              <div class="text-sm font-medium opacity-80">and Diversification of Partners</div>
            </th>
            <th class="bg-teal-100 dark:bg-teal-900 p-5 text-left font-semibold text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700 rounded-tr-md">
              <div class="text-lg mb-1">Foreign Policy</div>
              <div class="text-sm font-medium opacity-80">and Security Strategies</div>
            </th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td class="p-4 align-top border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-850">
              <p class="mb-2 text-gray-800 dark:text-gray-200">Invest in boosting domestic production of critical goods.</p>
            </td>
            <td class="p-4 align-top border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-850">
              <p class="mb-2 text-gray-800 dark:text-gray-200">Broaden a pool of import partners for each critical commodity through bilateral trade agreements or MoUs.</p>
            </td>
            <td class="p-4 align-top border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-850">
              <p class="mb-2 text-gray-800 dark:text-gray-200">Maintain a diverse set of strong relationships across the globe, especially with important commodity exporter or investor states.</p>
            </td>
          </tr>
          <tr>
            <td class="p-4 align-top border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
              <p class="mb-2 text-gray-800 dark:text-gray-200">Maintain robust strategic reserves to buffer short-term disruptions.</p>
            </td>
            <td class="p-4 align-top border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
              <p class="mb-2 text-gray-800 dark:text-gray-200">Focus on South-South cooperation to ensure food security.</p>
            </td>
            <td class="p-4 align-top border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
              <p class="mb-2 text-gray-800 dark:text-gray-200">Advocate against weaponisation of economic interdependence with preventive diplomacy.</p>
            </td>
          </tr>
          <tr>
            <td class="p-4 align-top border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-850">
              <p class="mb-2 text-gray-800 dark:text-gray-200">Developing alternative energy sources domestically.</p>
            </td>
            <td class="p-4 align-top border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-850">
              <p class="mb-2 text-gray-800 dark:text-gray-200">Annually monitor supplier concentration indexes.</p>
            </td>
            <td class="p-4 align-top border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-850">
              <p class="mb-2 text-gray-800 dark:text-gray-200">Utilise intelligence community to monitor global supply trends and give early warning.</p>
            </td>
          </tr>
          <tr>
            <td class="p-4 align-top border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
              <p class="mb-2 text-gray-800 dark:text-gray-200">Implement Productive Incentive Schemes in manufacturing to attract investment.</p>
            </td>
            <td class="p-4 align-top border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
              <p class="mb-2 text-gray-800 dark:text-gray-200">Push for stronger regional integration and pooling.</p>
            </td>
            <td class="p-4 align-top border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
              <p class="mb-2 text-gray-800 dark:text-gray-200">Establish an inter-agency Economic Security Task Force.</p>
            </td>
          </tr>
          <tr>
            <td class="p-4 align-top border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-850"></td>
            <td class="p-4 align-top border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-850">
              <p class="mb-2 text-gray-800 dark:text-gray-200">Foreign trade strategy should involve carefully calibrated import protection or incentives.</p>
            </td>
            <td class="p-4 align-top border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-850">
              <p class="mb-2 text-gray-800 dark:text-gray-200">Lead ASEAN in developing joint strategic reserves system.</p>
            </td>
          </tr>
          <tr>
            <td class="p-4 align-top border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 rounded-bl-md"></td>
            <td class="p-4 align-top border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900"></td>
            <td class="p-4 align-top border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 rounded-br-md">
              <p class="mb-2 text-gray-800 dark:text-gray-200">Pursue swap deals arrangements for resilience.</p>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  `;

  // Share functionality
  const shareUrl = typeof window !== 'undefined' ? window.location.href : '';
  const shareTitle = publication.title;
  
  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareUrl);
    setIsCopied(true);
    toast.success('Link copied to clipboard');
    setTimeout(() => setIsCopied(false), 2000);
  };
  
  const handleShare = (platform: string) => {
    let shareLink = '';
    
    switch (platform) {
      case 'twitter':
        shareLink = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareTitle)}&url=${encodeURIComponent(shareUrl)}`;
        break;
      case 'facebook':
        shareLink = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`;
        break;
      case 'linkedin':
        shareLink = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`;
        break;
      default:
        return;
    }
    
    window.open(shareLink, '_blank', 'noopener,noreferrer');
  };
  
  return (
    <div className="max-w-7xl mx-auto px-6 sm:px-8 py-12">
      {/* Back link */}
      <div className="mb-8">
        <Link href="/publications" className="text-[#005353] hover:text-[#003f3f] dark:text-[#00aeae] dark:hover:text-[#00c2c2] inline-flex items-center">
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
            
            {/* Share buttons */}
            <div className="flex items-center gap-3 mb-6">
              <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Share:</span>
              <div className="flex gap-2">
                <Button 
                  size="icon" 
                  variant="outline" 
                  className="h-8 w-8 rounded-full"
                  onClick={() => handleShare('twitter')}
                  title="Share on Twitter"
                >
                  <TwitterLogoIcon className="h-4 w-4" />
                  <span className="sr-only">Share on Twitter</span>
                </Button>
                <Button 
                  size="icon" 
                  variant="outline" 
                  className="h-8 w-8 rounded-full" 
                  onClick={() => handleShare('facebook')}
                  title="Share on Facebook"
                >
                  <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path d="M9.19795 21.5H13.198V13.4901H16.8021L17.198 9.50977H13.198V7.5C13.198 6.94772 13.6457 6.5 14.198 6.5H17.198V2.5H14.198C11.4365 2.5 9.19795 4.73858 9.19795 7.5V9.50977H7.19795L6.80206 13.4901H9.19795V21.5Z"></path>
                  </svg>
                  <span className="sr-only">Share on Facebook</span>
                </Button>
                <Button 
                  size="icon" 
                  variant="outline" 
                  className="h-8 w-8 rounded-full" 
                  onClick={() => handleShare('linkedin')}
                  title="Share on LinkedIn"
                >
                  <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path d="M6.5 8C7.32843 8 8 7.32843 8 6.5C8 5.67157 7.32843 5 6.5 5C5.67157 5 5 5.67157 5 6.5C5 7.32843 5.67157 8 6.5 8Z"></path>
                    <path d="M5 10C5 9.44772 5.44772 9 6 9H7C7.55228 9 8 9.44771 8 10V18C8 18.5523 7.55228 19 7 19H6C5.44772 19 5 18.5523 5 18V10Z"></path>
                    <path d="M11 19H12C12.5523 19 13 18.5523 13 18V13.5C13 12 16 11 16 13V18.0004C16 18.5527 16.4477 19 17 19H18C18.5523 19 19 18.5523 19 18V12C19 10 17.5 9 15.5 9C13.5 9 13 10.5 13 10.5V10C13 9.44771 12.5523 9 12 9H11C10.4477 9 10 9.44772 10 10V18C10 18.5523 10.4477 19 11 19Z"></path>
                  </svg>
                  <span className="sr-only">Share on LinkedIn</span>
                </Button>
                <Button 
                  size="icon" 
                  variant="outline" 
                  className="h-8 w-8 rounded-full" 
                  onClick={handleCopyLink}
                  title="Copy link"
                >
                  <Link1Icon className="h-4 w-4" />
                  <span className="sr-only">Copy link</span>
                </Button>
              </div>
            </div>
            
            <div className="longDescription" dangerouslySetInnerHTML={{ 
              __html: `
                <div class="prose prose-lg max-w-none text-gray-800 dark:text-gray-200 leading-relaxed">
                  ${publication.longDescription.substring(0, publication.longDescription.indexOf('<p>To address these vulnerabilities')).replace(
                    /<p>/g, 
                    '<p class="mb-8 text-base sm:text-lg leading-7 sm:leading-8 max-w-prose">'
                  )}
                  
                  ${publication.longDescription.substring(
                    publication.longDescription.indexOf('<p>To address these vulnerabilities'),
                    publication.longDescription.indexOf('<p>In conclusion')
                  ).replace(
                    /<p>/g, 
                    '<p class="mb-8 text-base sm:text-lg leading-7 sm:leading-8 max-w-prose">'
                  )}
                  
                  ${policyMeasuresTable}
                  
                  ${publication.longDescription.substring(
                    publication.longDescription.indexOf('<p>In conclusion')
                  ).replace(
                    /<p>/g, 
                    '<p class="mb-8 text-base sm:text-lg leading-7 sm:leading-8 max-w-prose">'
                  )}
                </div>
              `}} />
            
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