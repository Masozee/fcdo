"use client"

import React, { useState, useEffect } from 'react';
import * as NavigationMenu from '@radix-ui/react-navigation-menu';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';

export function Header() {
  const [searchQuery, setSearchQuery] = useState('');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const pathname = usePathname();
  
  // Add scroll event listener
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 0);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle search functionality here
    console.log(`Searching for: ${searchQuery}`);
    // You could implement search navigation or API call here
  };

  return (
    <header className={`sticky top-0 z-40 transition-all duration-300 ${
      isScrolled 
        ? 'bg-white/80 backdrop-blur-lg backdrop-saturate-150 border-b border-gray-200/50' 
        : 'bg-white border-b border-gray-200'
    }`}>
      <div className="container mx-auto px-6 flex justify-between items-center min-h-[80px]">
        <div className="flex items-center gap-10">
          <Link href="/" className="flex items-center justify-center">
            <div className="relative w-[60px] h-[60px] flex items-center justify-center">
              <Image
                src="/logo.png"
                alt="Trade Data Explorer Logo"
                fill
                priority
                className="object-contain"
                sizes="60px"
              />
            </div>
          </Link>
          
          {/* Mobile menu button */}
          <button 
            className="md:hidden ml-auto text-gray-500 hover:text-accent transition-colors"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              {isMobileMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
          
          {/* Desktop Navigation */}
          <div className="hidden md:block">
            <NavigationMenu.Root className="relative">
              <NavigationMenu.List className="flex space-x-6 text-lg">
                {/* About Us */}
                <NavigationMenu.Item>
                  <Link href="/about" className="text-gray-700 hover:text-accent transition-colors font-semibold">
                    About
                  </Link>
                </NavigationMenu.Item>
                
                {/* Our Data */}
                <NavigationMenu.Item>
                  <NavigationMenu.Trigger className="group flex items-center text-gray-700 hover:text-accent transition-colors font-semibold">
                    <span>Our Data</span>
                    <svg width="12" height="12" viewBox="0 0 12 12" xmlns="http://www.w3.org/2000/svg" className="ml-1 text-gray-500 group-hover:rotate-180 transition-transform duration-200">
                      <path d="M6 8L2 4H10L6 8Z" fill="currentColor" />
                    </svg>
                  </NavigationMenu.Trigger>
                  <NavigationMenu.Content className="absolute top-full left-0 mt-2 w-[350px] p-4 bg-white rounded-md shadow-lg border border-gray-200 z-50">
                    <ul className="space-y-4">
                      <li>
                        <Link href="/data" className="block p-3 text-gray-700 hover:bg-gray-50 rounded-md transition-colors border border-transparent hover:border-[#008080]">
                          <div className="flex flex-col">
                            <span className="font-bold text-[#008080]">Data Table</span>
                            <span className="text-sm text-gray-500 mt-1">Explore and filter trade data with advanced sorting options</span>
                          </div>
                        </Link>
                      </li>
                      <li>
                        <Link href="/map-dashboard" className="block p-3 text-gray-700 hover:bg-gray-50 rounded-md transition-colors border border-transparent hover:border-[#008080]">
                          <div className="flex flex-col">
                            <span className="font-bold text-[#008080]">Interactive Map</span>
                            <span className="text-sm text-gray-500 mt-1">Visualize global trade flows and patterns with interactive maps</span>
                          </div>
                        </Link>
                      </li>
                    </ul>
                  </NavigationMenu.Content>
                </NavigationMenu.Item>
                
                {/* Publications */}
                <NavigationMenu.Item>
                  <Link href="/publications" className="text-gray-700 hover:text-accent transition-colors font-semibold">
                    Publications
                  </Link>
                </NavigationMenu.Item>
                
                {/* Teams */}
                <NavigationMenu.Item>
                  <Link href="/teams" className="text-gray-700 hover:text-accent transition-colors font-semibold">
                    Teams
                  </Link>
                </NavigationMenu.Item>
                
                {/* Contact Us */}
                <NavigationMenu.Item>
                  <Link href="/contact" className="text-gray-700 hover:text-accent transition-colors font-semibold">
                    Contact Us
                  </Link>
                </NavigationMenu.Item>
              </NavigationMenu.List>
              
              <NavigationMenu.Viewport />
            </NavigationMenu.Root>
          </div>
        </div>
        
        {/* Mobile Menu */}
        <div className={`fixed md:hidden top-[80px] left-0 right-0 bg-white border-b border-gray-200 transition-all duration-200 transform ${isMobileMenuOpen ? 'translate-y-0 opacity-100' : '-translate-y-full opacity-0'}`}>
          <div className="container mx-auto px-4 py-4">
            <nav className="flex flex-col space-y-4">
              <Link href="/about" className="text-gray-700 hover:text-accent font-semibold py-2 border-b border-gray-100">
                About
              </Link>
              <div className="py-2 border-b border-gray-100">
                <div className="font-semibold text-gray-900 mb-2">Our Data</div>
                <ul className="ml-4 space-y-3">
                  <li>
                    <Link href="/data" className="block">
                      <span className="font-bold text-[#008080]">Data Table</span>
                      <p className="text-xs text-gray-500 mt-1">Explore and filter trade data</p>
                    </Link>
                  </li>
                  <li>
                    <Link href="/map-dashboard" className="block">
                      <span className="font-bold text-[#008080]">Interactive Map</span>
                      <p className="text-xs text-gray-500 mt-1">Visualize global trade patterns</p>
                    </Link>
                  </li>
                </ul>
              </div>
              <Link href="/publications" className="text-gray-700 hover:text-accent font-semibold py-2 border-b border-gray-100">
                Publications
              </Link>
              <Link href="/teams" className="text-gray-700 hover:text-accent font-semibold py-2 border-b border-gray-100">
                Teams
              </Link>
              <Link href="/contact" className="text-gray-700 hover:text-accent font-semibold py-2 border-b border-gray-100">
                Contact Us
              </Link>
            </nav>
          </div>
        </div>
        
        <div className="flex items-center">
          {/* Search Form */}
          <form onSubmit={handleSearch} className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search..."
              className="w-64 pl-10 pr-4 py-2 bg-gray-100 border border-gray-200 rounded-md text-base focus:outline-none focus:ring-2 focus:ring-accent text-gray-700"
            />
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              className="h-5 w-5 text-gray-500 absolute left-3 top-1/2 transform -translate-y-1/2" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </form>
        </div>
      </div>
    </header>
  );
} 