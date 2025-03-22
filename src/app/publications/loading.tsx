import React from 'react';
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

export default function PublicationsLoading() {
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="mb-10">
        <Skeleton className="h-10 w-1/3 mb-4" />
        <Skeleton className="h-4 w-2/3 mb-2" />
        <Separator className="my-6" />
      </div>
      
      <div className="flex flex-col md:flex-row gap-8">
        {/* Sidebar filter skeleton */}
        <div className="md:w-1/4">
          <div className="space-y-6">
            {/* Search */}
            <div>
              <Skeleton className="h-5 w-24 mb-3" />
              <Skeleton className="h-10 w-full rounded-md" />
            </div>
            
            <Separator />
            
            {/* Categories */}
            <div>
              <Skeleton className="h-5 w-28 mb-3" />
              <div className="space-y-2">
                {Array.from({ length: 3 }).map((_, index) => (
                  <div key={index} className="flex items-center">
                    <Skeleton className="h-4 w-4 mr-2 rounded" />
                    <Skeleton className="h-4 w-28" />
                  </div>
                ))}
              </div>
            </div>
            
            <Separator />
            
            {/* Tags */}
            <div>
              <Skeleton className="h-5 w-16 mb-3" />
              <div className="flex flex-wrap gap-2">
                {Array.from({ length: 6 }).map((_, index) => (
                  <Skeleton key={index} className="h-6 w-20 rounded-full" />
                ))}
              </div>
            </div>
            
            <Separator />
            
            {/* Authors */}
            <div>
              <Skeleton className="h-5 w-20 mb-3" />
              <div className="space-y-2">
                {Array.from({ length: 4 }).map((_, index) => (
                  <div key={index} className="flex items-center">
                    <Skeleton className="h-4 w-4 mr-2 rounded" />
                    <Skeleton className="h-4 w-32" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
        
        {/* Publications grid skeleton */}
        <div className="md:w-3/4">
          <div className="flex justify-between items-center mb-6">
            <Skeleton className="h-4 w-48" />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {Array.from({ length: 4 }).map((_, index) => (
              <Card key={index} className="h-full flex flex-col overflow-hidden border-0 shadow-none">
                <Skeleton className="h-48 w-full" />
                <CardContent className="flex-1 p-6 flex flex-col pt-6">
                  <div className="mb-3 flex items-center">
                    <Skeleton className="h-5 w-24" />
                    <Skeleton className="h-4 w-16 ml-auto" />
                  </div>
                  
                  <Skeleton className="h-7 w-3/4 mb-3" />
                  
                  <div className="space-y-2 mb-4">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-2/3" />
                  </div>
                  
                  <div className="flex gap-2 mb-4">
                    <Skeleton className="h-5 w-16" />
                    <Skeleton className="h-5 w-16" />
                    <Skeleton className="h-5 w-16" />
                  </div>
                  
                  <div className="flex items-center justify-between mt-auto pt-4 border-t border-gray-100 dark:border-gray-800">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-4 w-20" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
} 