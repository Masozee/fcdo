import { NextRequest } from 'next/server';

// Type definitions to make Next.js 15 types work properly
declare module 'next' {
  export interface PageProps {
    params?: {
      [key: string]: string;
    };
    searchParams?: {
      [key: string]: string | string[];
    };
  }
}

// Add custom type definitions for route handlers
export interface RouteHandlerContext<Params = Record<string, string>> {
  params: Params;
}

export {}; 