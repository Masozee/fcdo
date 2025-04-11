"use client"

import React, { useState } from 'react';
import { Link1Icon, TwitterLogoIcon, DownloadIcon } from '@radix-ui/react-icons';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';

interface PublicationDetailProps {
  publication: {
    id: number;
    title: string;
    description: string;
    longDescription: string;
    imageUrl: string;
    date: string;
    category: string;
    slug: string;
    authors: string[];
    tags: string[];
    downloadUrl: string;
    policyMeasuresTable: string;
  };
}

export default function PublicationDetail({ publication }: PublicationDetailProps) {
  const [isCopied, setIsCopied] = useState(false);
  
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
                
                ${publication.policyMeasuresTable}
                
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
  );
} 