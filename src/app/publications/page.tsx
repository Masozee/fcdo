"use client"

import React, { useState } from 'react';
import * as Checkbox from '@radix-ui/react-checkbox';
import * as RadioGroup from '@radix-ui/react-radio-group';
import * as Separator from '@radix-ui/react-separator';
import * as ScrollArea from '@radix-ui/react-scroll-area';
import { CheckIcon } from '@radix-ui/react-icons';

// Publication data
const publications = [
  {
    id: 1,
    title: 'Global Trade Patterns in the Post-Pandemic Era',
    author: 'Dr. Sarah Johnson',
    date: '2023-05-15',
    type: 'Research Paper',
    category: 'Economic Analysis',
    abstract: 'This paper examines how global trade patterns have evolved following the COVID-19 pandemic, with a focus on supply chain resilience and regional trade agreements.',
    tags: ['COVID-19', 'Supply Chain', 'Trade Agreements'],
  },
  {
    id: 2,
    title: 'Emerging Markets Trade Index: Q2 2023',
    author: 'Amara Okafor',
    date: '2023-07-10',
    type: 'Report',
    category: 'Market Analysis',
    abstract: 'Our quarterly analysis of trade flows in emerging markets, highlighting opportunities and challenges for businesses and investors.',
    tags: ['Emerging Markets', 'Index', 'Quarterly Report'],
  },
  {
    id: 3,
    title: 'The Impact of Digital Trade on Global Commerce',
    author: 'Michael Chen',
    date: '2023-04-22',
    type: 'White Paper',
    category: 'Digital Economy',
    abstract: 'This white paper explores how digital technologies are transforming international trade, from e-commerce to digital services and data flows.',
    tags: ['Digital Trade', 'E-commerce', 'Technology'],
  },
  {
    id: 4,
    title: 'Agricultural Trade and Food Security',
    author: 'Carlos Rodriguez',
    date: '2023-03-08',
    type: 'Research Paper',
    category: 'Sector Analysis',
    abstract: 'An examination of the relationship between agricultural trade policies and food security, with case studies from Latin America and Africa.',
    tags: ['Agriculture', 'Food Security', 'Policy'],
  },
  {
    id: 5,
    title: 'Trade Data Visualization Best Practices',
    author: 'Emma Wilson',
    date: '2023-06-30',
    type: 'Guide',
    category: 'Data Visualization',
    abstract: 'A comprehensive guide to effectively visualizing trade data for analysis, reporting, and decision-making.',
    tags: ['Data Visualization', 'Best Practices', 'Analytics'],
  },
  {
    id: 6,
    title: 'Sustainable Trade: Environmental Impacts and Policy Responses',
    author: 'Dr. Raj Patel',
    date: '2023-02-15',
    type: 'Research Paper',
    category: 'Sustainability',
    abstract: 'This research examines the environmental footprint of international trade and evaluates policy measures aimed at promoting sustainability.',
    tags: ['Sustainability', 'Environment', 'Policy'],
  },
  {
    id: 7,
    title: 'Trade Finance in Developing Economies',
    author: 'Dr. Sarah Johnson',
    date: '2023-01-20',
    type: 'Report',
    category: 'Economic Analysis',
    abstract: 'An analysis of trade finance gaps in developing economies and innovative solutions to address these challenges.',
    tags: ['Trade Finance', 'Development', 'Financial Inclusion'],
  },
  {
    id: 8,
    title: 'The Role of AI in Trade Analysis',
    author: 'Michael Chen',
    date: '2023-08-05',
    type: 'White Paper',
    category: 'Technology',
    abstract: 'This paper explores how artificial intelligence is revolutionizing trade data analysis and forecasting.',
    tags: ['AI', 'Machine Learning', 'Analytics'],
  },
];

// Extract unique categories, types, and authors for filters
const categories = [...new Set(publications.map(pub => pub.category))];
const types = [...new Set(publications.map(pub => pub.type))];
const authors = [...new Set(publications.map(pub => pub.author))];

export default function PublicationsPage() {
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedType, setSelectedType] = useState<string>('');
  const [selectedAuthor, setSelectedAuthor] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Filter publications based on selected filters
  const filteredPublications = publications.filter(pub => {
    // Filter by category
    if (selectedCategories.length > 0 && !selectedCategories.includes(pub.category)) {
      return false;
    }
    
    // Filter by type
    if (selectedType && pub.type !== selectedType) {
      return false;
    }
    
    // Filter by author
    if (selectedAuthor && pub.author !== selectedAuthor) {
      return false;
    }
    
    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        pub.title.toLowerCase().includes(query) ||
        pub.abstract.toLowerCase().includes(query) ||
        pub.tags.some(tag => tag.toLowerCase().includes(query))
      );
    }
    
    return true;
  });
  
  // Handle category selection
  const toggleCategory = (category: string) => {
    setSelectedCategories(prev => 
      prev.includes(category)
        ? prev.filter(c => c !== category)
        : [...prev, category]
    );
  };
  
  // Clear all filters
  const clearFilters = () => {
    setSelectedCategories([]);
    setSelectedType('');
    setSelectedAuthor('');
    setSearchQuery('');
  };
  
  return (
    <div className="container mx-auto px-6 py-12">
      <h1 className="text-3xl font-bold mb-2 text-center text-gray-900 dark:text-white">Publications</h1>
      <p className="text-center text-gray-600 dark:text-gray-400 mb-12 max-w-2xl mx-auto">
        Explore our latest research papers, reports, and guides on global trade trends, market analysis, and policy developments.
      </p>
      
      <div className="flex flex-col md:flex-row gap-8">
        {/* Sidebar Filters */}
        <div className="md:w-1/4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100">Filters</h2>
              <button 
                onClick={clearFilters}
                className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
              >
                Clear All
              </button>
            </div>
            
            {/* Search */}
            <div className="mb-6">
              <label htmlFor="search" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Search
              </label>
              <input
                type="text"
                id="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search publications..."
                className="w-full p-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-md text-gray-800 dark:text-gray-200"
              />
            </div>
            
            <Separator.Root className="h-px bg-gray-200 dark:bg-gray-700 my-4" />
            
            {/* Categories */}
            <div className="mb-6">
              <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Categories</h3>
              <ScrollArea.Root className="max-h-40 overflow-hidden">
                <ScrollArea.Viewport className="max-h-40 w-full">
                  <div className="space-y-2">
                    {categories.map(category => (
                      <div key={category} className="flex items-center">
                        <Checkbox.Root
                          id={`category-${category}`}
                          checked={selectedCategories.includes(category)}
                          onCheckedChange={() => toggleCategory(category)}
                          className="h-4 w-4 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 mr-2 flex items-center justify-center"
                        >
                          <Checkbox.Indicator>
                            <CheckIcon className="h-3 w-3 text-blue-600 dark:text-blue-400" />
                          </Checkbox.Indicator>
                        </Checkbox.Root>
                        <label 
                          htmlFor={`category-${category}`}
                          className="text-sm text-gray-700 dark:text-gray-300"
                        >
                          {category}
                        </label>
                      </div>
                    ))}
                  </div>
                </ScrollArea.Viewport>
                <ScrollArea.Scrollbar orientation="vertical" className="w-2 bg-gray-100 dark:bg-gray-700 rounded-full">
                  <ScrollArea.Thumb className="bg-gray-300 dark:bg-gray-600 rounded-full" />
                </ScrollArea.Scrollbar>
              </ScrollArea.Root>
            </div>
            
            <Separator.Root className="h-px bg-gray-200 dark:bg-gray-700 my-4" />
            
            {/* Publication Types */}
            <div className="mb-6">
              <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Publication Type</h3>
              <RadioGroup.Root 
                value={selectedType} 
                onValueChange={setSelectedType}
                className="space-y-2"
              >
                {types.map(type => (
                  <div key={type} className="flex items-center">
                    <RadioGroup.Item
                      id={`type-${type}`}
                      value={type}
                      className="h-4 w-4 rounded-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 mr-2"
                    >
                      <RadioGroup.Indicator className="flex items-center justify-center w-full h-full relative after:content-[''] after:block after:w-2 after:h-2 after:rounded-full after:bg-blue-600 dark:after:bg-blue-400" />
                    </RadioGroup.Item>
                    <label 
                      htmlFor={`type-${type}`}
                      className="text-sm text-gray-700 dark:text-gray-300"
                    >
                      {type}
                    </label>
                  </div>
                ))}
              </RadioGroup.Root>
            </div>
            
            <Separator.Root className="h-px bg-gray-200 dark:bg-gray-700 my-4" />
            
            {/* Authors */}
            <div>
              <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Author</h3>
              <select
                value={selectedAuthor}
                onChange={(e) => setSelectedAuthor(e.target.value)}
                className="w-full p-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-md text-gray-800 dark:text-gray-200"
              >
                <option value="">All Authors</option>
                {authors.map(author => (
                  <option key={author} value={author}>{author}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
        
        {/* Publications Grid */}
        <div className="md:w-3/4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 mb-6">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100">
                {filteredPublications.length} {filteredPublications.length === 1 ? 'Publication' : 'Publications'}
              </h2>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                {selectedCategories.length > 0 || selectedType || selectedAuthor || searchQuery
                  ? 'Filtered results'
                  : 'Showing all publications'
                }
              </div>
            </div>
          </div>
          
          {filteredPublications.length === 0 ? (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-8 text-center">
              <p className="text-gray-600 dark:text-gray-400">No publications match your filters. Try adjusting your criteria.</p>
              <button 
                onClick={clearFilters}
                className="mt-4 text-blue-600 dark:text-blue-400 hover:underline"
              >
                Clear all filters
              </button>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 gap-6">
              {filteredPublications.map(publication => (
                <div key={publication.id} className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden">
                  <div className="p-6">
                    <div className="flex justify-between items-start mb-3">
                      <span className="inline-block bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-xs px-2 py-1 rounded-full">
                        {publication.type}
                      </span>
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        {new Date(publication.date).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric'
                        })}
                      </span>
                    </div>
                    <h3 className="text-xl font-semibold mb-2 text-gray-800 dark:text-gray-100">{publication.title}</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                      By <span className="font-medium">{publication.author}</span>
                    </p>
                    <p className="text-gray-700 dark:text-gray-300 mb-4 line-clamp-3">
                      {publication.abstract}
                    </p>
                    <div className="flex flex-wrap gap-2 mb-4">
                      {publication.tags.map(tag => (
                        <span key={tag} className="text-xs bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 px-2 py-1 rounded">
                          {tag}
                        </span>
                      ))}
                    </div>
                    <button className="text-blue-600 dark:text-blue-400 text-sm font-medium hover:underline">
                      Read Full Publication
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 