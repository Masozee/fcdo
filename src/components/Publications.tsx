"use client"

import { Card, CardContent, CardFooter } from "@/components/ui/card"
import Link from "next/link"

interface Publication {
  id: number;
  title: string;
  abstract: string;
  date: string;
  image?: string;
  slug: string;
  authors: string[];
  tags: string[];
  downloadUrl: string;
}

const publications: Publication[] = [
  {
    id: 1,
    title: "Indonesia's Strategic Dependencies",
    abstract: "A comprehensive analysis of international trade flows and emerging trends in global markets. This report examines Indonesia's trade dependencies, analyzing key import and export relationships, strategic resources, and vulnerability to global supply chain disruptions.",
    date: "March 2025",
    image: "/report1.jpg",
    slug: "indonesias-strategic-dependencies",
    authors: ["Lina A. Alexandra", "Andrew W. Mantong", "Dandy Rafitrandi", "M. Habib A. Dzakwan", "M. Waffaa Kharisma", "Pieter A. Pandie", "Anastasia A. Widyautami", "Balthazaar A. Ardhillah"],
    tags: ["Indonesia", "Strategic Trade", "Global Markets"],
    downloadUrl: "https://isdp.csis.or.id/strategicdependencyreport"
  }
]

export function Publications() {
  return (
    <div className="px-4 py-6 md:px-6 lg:py-12 bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-6 sm:px-8">
        <div className="flex flex-col gap-2 mb-8">
          <h2 className="text-3xl font-bold tracking-tight">Publications</h2>
          <p className="text-gray-500 dark:text-gray-400">
            Latest research papers and reports on global trade and economics
          </p>
        </div>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {publications.map(publication => (
            <Card key={publication.id} className="group overflow-hidden flex flex-col border-0 shadow-none">
              <div className="relative">
                <div className="aspect-[16/9] overflow-hidden">
                  <img
                    src={publication.image || "/placeholder.jpg"}
                    alt={publication.title}
                    className="object-cover w-full h-full transition-transform duration-300 group-hover:scale-105"
                    width={400}
                    height={225}
                  />
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
              </div>
              <CardContent className="grid gap-4 flex-1 pt-6">
                <div>
                  <h3 className="text-xl font-bold leading-tight text-gray-900 dark:text-white">
                    {publication.title}
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{publication.date}</p>
                </div>
                <p className="text-gray-500 dark:text-gray-400 line-clamp-3">
                  {publication.abstract}
                </p>
              </CardContent>
              <CardFooter className="flex justify-between items-center pt-4 border-0">
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {publication.authors[0]}{publication.authors.length > 1 ? ' et al.' : ''}
                </p>
                <Link 
                  href={`/publications/${publication.slug}`}
                  className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 text-sm font-medium"
                >
                  Read Publication →
                </Link>
              </CardFooter>
            </Card>
          ))}
        </div>
        <div className="mt-12 text-center">
          <Link 
            href="/publications" 
            className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 text-sm font-medium"
          >
            View All Publications →
          </Link>
        </div>
      </div>
    </div>
  )
} 