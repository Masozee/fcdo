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
      
      <div>
        <p>Loading data for country code: {code}</p>
        {year && <p>For year: {year}</p>}
      </div>
    </div>
  );
} 