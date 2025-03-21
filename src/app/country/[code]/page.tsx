import { Suspense } from 'react';
import CountryDetail from '@/components/CountryDetail';
import { Skeleton } from '@/components/ui/skeleton';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

interface CountryPageProps {
  params: {
    code: string;
  };
  searchParams: {
    year?: string;
  };
}

export default function CountryPage({ params, searchParams }: CountryPageProps) {
  const { code } = params;
  const { year } = searchParams;
  
  return (
    <div className="container mx-auto py-6 px-4 sm:px-6 lg:px-8">
      <div className="mb-6 flex items-center gap-4">
        <Link 
          href="/trade-map" 
          className="inline-flex items-center text-blue-600 hover:text-blue-800 transition-colors"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Trade Map
        </Link>
        <span className="text-gray-400">|</span>
        <Link 
          href="/countries" 
          className="inline-flex items-center text-blue-600 hover:text-blue-800 transition-colors"
        >
          <ArrowLeft className="mr-2 h-4 w-4 rotate-90" />
          View All Countries
        </Link>
      </div>
      
      <h1 className="text-3xl font-bold mb-6">Country Trade Profile</h1>
      
      <Suspense fallback={<CountrySkeleton />}>
        <CountryDetail code={code} year={year} />
      </Suspense>
    </div>
  );
}

function CountrySkeleton() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Skeleton className="h-10 w-1/3" />
        <Skeleton className="h-4 w-1/4" />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-32 rounded-md" />
        ))}
      </div>
      
      <div className="space-y-2">
        <Skeleton className="h-6 w-1/4" />
        <Skeleton className="h-60 w-full rounded-md" />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Skeleton className="h-6 w-1/3" />
          <Skeleton className="h-40 w-full rounded-md" />
        </div>
        <div className="space-y-2">
          <Skeleton className="h-6 w-1/3" />
          <Skeleton className="h-40 w-full rounded-md" />
        </div>
      </div>
    </div>
  );
} 