"use client"

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import * as Checkbox from '@radix-ui/react-checkbox';
import { CheckIcon, Cross2Icon, MagnifyingGlassIcon } from '@radix-ui/react-icons';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

// This would typically come from an API or database
const publicationsData = [
  {
    id: 1,
    title: "Indonesia's Strategic Dependencies",
    description: "A comprehensive analysis of international trade flows and emerging trends in global markets. This report examines Indonesia's trade dependencies, analyzing key import and export relationships, strategic resources, and vulnerability to global supply chain disruptions.",
    imageUrl: "/report1.jpg",
    date: "March 2025",
    category: "Research Report",
    slug: "indonesias-strategic-dependencies",
    authors: ["Lina A. Alexandra", "Andrew W. Mantong", "Dandy Rafitrandi", "M. Habib A. Dzakwan", "M. Waffaa Kharisma", "Pieter A. Pandie", "Anastasia A. Widyautami", "Balthazaar A. Ardhillah"],
    tags: ["Indonesia", "Strategic Trade", "Global Markets"],
    downloadUrl: "http://localhost:3000/strategicdependencyreport"
  }
];

export default function PublicationsPage() {
  // Get unique categories, tags, and authors from publication data
  const allCategories = [...new Set(publicationsData.map(pub => pub.category))];
  const allTags = [...new Set(publicationsData.flatMap(pub => pub.tags))];
  const allAuthors = [...new Set(publicationsData.flatMap(pub => pub.authors))];
  
  // Filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [selectedAuthors, setSelectedAuthors] = useState<string[]>([]);
  const [filteredPublications, setFilteredPublications] = useState(publicationsData);
  
  // Apply filters when any filter state changes
  useEffect(() => {
    const filtered = publicationsData.filter(publication => {
      // Search query filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matchesSearch = 
          publication.title.toLowerCase().includes(query) ||
          publication.description.toLowerCase().includes(query) ||
          publication.tags.some(tag => tag.toLowerCase().includes(query)) ||
          publication.authors.some(author => author.toLowerCase().includes(query));
          
        if (!matchesSearch) return false;
      }
      
      // Category filter
      if (selectedCategories.length > 0 && !selectedCategories.includes(publication.category)) {
        return false;
      }
      
      // Tags filter
      if (selectedTags.length > 0 && !publication.tags.some(tag => selectedTags.includes(tag))) {
        return false;
      }
      
      // Authors filter
      if (selectedAuthors.length > 0 && !publication.authors.some(author => selectedAuthors.includes(author))) {
        return false;
      }
      
      return true;
    });
    
    setFilteredPublications(filtered);
  }, [searchQuery, selectedCategories, selectedTags, selectedAuthors]);
  
  // Toggle filter selections
  const toggleCategory = (category: string) => {
    setSelectedCategories(prev => 
      prev.includes(category) 
        ? prev.filter(c => c !== category) 
        : [...prev, category]
    );
  };
  
  const toggleTag = (tag: string) => {
    setSelectedTags(prev => 
      prev.includes(tag) 
        ? prev.filter(t => t !== tag) 
        : [...prev, tag]
    );
  };
  
  const toggleAuthor = (author: string) => {
    setSelectedAuthors(prev => 
      prev.includes(author) 
        ? prev.filter(a => a !== author) 
        : [...prev, author]
    );
  };
  
  // Clear all filters
  const clearFilters = () => {
    setSearchQuery('');
    setSelectedCategories([]);
    setSelectedTags([]);
    setSelectedAuthors([]);
  };
  
  // Check if any filters are applied
  const hasActiveFilters = searchQuery || selectedCategories.length > 0 || selectedTags.length > 0 || selectedAuthors.length > 0;
  
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="mb-10">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Publications</h1>
        <p className="mt-2 text-gray-600 dark:text-gray-300">
          Explore our research reports, policy briefs, and analysis on global trade and strategic dependencies.
        </p>
        <Separator className="my-6" />
      </div>
      
      <div className="flex flex-col md:flex-row gap-8">
        {/* Sidebar filters */}
        <div className="md:w-1/4">
          <div className="space-y-6">
            {/* Search */}
            <div>
              <h3 className="text-sm font-semibold mb-3 text-gray-900 dark:text-white">Search</h3>
              <div className="relative">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Search publications..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 w-full"
                />
                {searchQuery && (
                  <button 
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2"
                  >
                    <Cross2Icon className="h-4 w-4 text-gray-400 hover:text-gray-600" />
                  </button>
                )}
              </div>
            </div>
            
            <Separator />
            
            {/* Categories */}
            <div>
              <div className="flex justify-between items-center mb-3">
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Categories</h3>
                {selectedCategories.length > 0 && (
                  <button 
                    onClick={() => setSelectedCategories([])}
                    className="text-xs text-blue-600 dark:text-blue-400 hover:underline"
                  >
                    Clear
                  </button>
                )}
              </div>
              <div className="space-y-2">
                {allCategories.map(category => (
                  <div key={category} className="flex items-center">
                    <Checkbox.Root
                      id={`category-${category}`}
                      checked={selectedCategories.includes(category)}
                      onCheckedChange={() => toggleCategory(category)}
                      className="h-4 w-4 rounded flex items-center justify-center border border-gray-300 dark:border-gray-600 mr-2 data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
                    >
                      <Checkbox.Indicator>
                        <CheckIcon className="h-3 w-3 text-white" />
                      </Checkbox.Indicator>
                    </Checkbox.Root>
                    <label 
                      htmlFor={`category-${category}`}
                      className="text-sm text-gray-700 dark:text-gray-300 select-none"
                    >
                      {category}
                    </label>
                  </div>
                ))}
              </div>
            </div>
            
            <Separator />
            
            {/* Tags */}
            <div>
              <div className="flex justify-between items-center mb-3">
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Tags</h3>
                {selectedTags.length > 0 && (
                  <button 
                    onClick={() => setSelectedTags([])}
                    className="text-xs text-blue-600 dark:text-blue-400 hover:underline"
                  >
                    Clear
                  </button>
                )}
              </div>
              <div className="flex flex-wrap gap-2">
                {allTags.map(tag => (
                  <Badge 
                    key={tag}
                    variant={selectedTags.includes(tag) ? "default" : "outline"}
                    className="cursor-pointer"
                    onClick={() => toggleTag(tag)}
                  >
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
            
            <Separator />
            
            {/* Authors */}
            <div>
              <div className="flex justify-between items-center mb-3">
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Authors</h3>
                {selectedAuthors.length > 0 && (
                  <button 
                    onClick={() => setSelectedAuthors([])}
                    className="text-xs text-blue-600 dark:text-blue-400 hover:underline"
                  >
                    Clear
                  </button>
                )}
              </div>
              <div className="space-y-2">
                {allAuthors.map(author => (
                  <div key={author} className="flex items-center">
                    <Checkbox.Root
                      id={`author-${author}`}
                      checked={selectedAuthors.includes(author)}
                      onCheckedChange={() => toggleAuthor(author)}
                      className="h-4 w-4 rounded flex items-center justify-center border border-gray-300 dark:border-gray-600 mr-2 data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
                    >
                      <Checkbox.Indicator>
                        <CheckIcon className="h-3 w-3 text-white" />
                      </Checkbox.Indicator>
                    </Checkbox.Root>
                    <label 
                      htmlFor={`author-${author}`}
                      className="text-sm text-gray-700 dark:text-gray-300 select-none"
                    >
                      {author}
                    </label>
                  </div>
                ))}
              </div>
            </div>
            
            {hasActiveFilters && (
              <div className="pt-4">
                <Button 
                  variant="outline" 
                  onClick={clearFilters} 
                  className="w-full"
                >
                  Clear All Filters
                </Button>
              </div>
            )}
          </div>
        </div>
        
        {/* Publications grid */}
        <div className="md:w-3/4">
          {filteredPublications.length === 0 ? (
            <div className="text-center py-12">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No publications found</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">Try adjusting your filters to find what you're looking for.</p>
              <Button variant="outline" onClick={clearFilters}>Clear All Filters</Button>
            </div>
          ) : (
            <>
              <div className="flex justify-between items-center mb-6">
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Showing {filteredPublications.length} {filteredPublications.length === 1 ? 'publication' : 'publications'}
                  {hasActiveFilters && ' with applied filters'}
                </p>
                {hasActiveFilters && (
                  <Button variant="ghost" size="sm" onClick={clearFilters}>
                    Clear Filters
                  </Button>
                )}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {filteredPublications.map((publication) => (
                  <Card key={publication.id} className="h-full flex flex-col overflow-hidden border-0 shadow-none">
                    <div className="relative h-48 w-full">
                      <img 
                        src={publication.imageUrl || "/placeholder.jpg"}
                        alt={publication.title}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
                    </div>
                    <CardContent className="flex-1 p-6 flex flex-col pt-6">
                      <div className="mb-3 flex items-center">
                        <Badge variant="outline">{publication.category}</Badge>
                        <span className="ml-auto text-sm text-gray-500">{publication.date}</span>
                      </div>
                      
                      <h2 className="text-xl font-bold mb-3 text-gray-900 dark:text-white">
                        {publication.title}
                      </h2>
                      
                      <p className="text-gray-600 dark:text-gray-300 mb-4 flex-1">
                        {publication.description.length > 150 
                          ? `${publication.description.substring(0, 150)}...` 
                          : publication.description}
                      </p>
                      
                      <div className="flex flex-wrap gap-2 mb-4">
                        {publication.tags.slice(0, 3).map((tag, index) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                      
                      <div className="flex items-center justify-between mt-auto pt-4 border-t border-gray-100 dark:border-gray-800">
                        <div className="text-sm text-gray-500">
                          {publication.authors.length > 0 && (
                            <span>By {publication.authors[0]}{publication.authors.length > 1 ? ' et al.' : ''}</span>
                          )}
                        </div>
                        
                        <Link 
                          href={`/publications/${publication.slug}`}
                          className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 text-sm font-medium"
                        >
                          Read More →
                        </Link>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
} 