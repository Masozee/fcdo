"use client"

import React, { useState, useEffect } from 'react';
import * as NavigationMenu from '@radix-ui/react-navigation-menu';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';

// Data submenu items for dropdown
const dataNavItems = [
  { name: 'Data Table', href: '/data-table', description: 'Explore and filter trade data' },
  { name: 'Map Dashboard', href: '/map-dashboard', description: 'Visualize global trade volumes' },
  { name: 'Country Profiles', href: '/countries', description: 'View country trade profiles' },
  { name: 'Interactive Map', href: '/interactive-map', description: 'Visualize global trade patterns' },
];

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
      <div className="max-w-7xl mx-auto px-6 sm:px-8 flex justify-between items-center min-h-[80px]">
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
          
          {/* Desktop Navigation */}
          <div className="hidden md:block">
            <NavigationMenu.Root className="relative">
              <NavigationMenu.List className="flex space-x-6 text-lg">
                {/* About Us */}
                <NavigationMenu.Item>
                  <Link href="/about" className="text-gray-800 font-semibold hover:text-gray-600 transition-colors">
                    About
                  </Link>
                </NavigationMenu.Item>
                
                {/* Our Data */}
                <NavigationMenu.Item>
                  <NavigationMenu.Trigger className="group flex items-center text-gray-800 font-semibold hover:text-gray-600 transition-colors focus:outline-none">
                    <span>Our Data</span>
                    <svg width="12" height="12" viewBox="0 0 12 12" xmlns="http://www.w3.org/2000/svg" className="ml-1 text-gray-800 group-hover:text-gray-600">
                      <path d="M6 8L2 4H10L6 8Z" fill="currentColor" />
                    </svg>
                  </NavigationMenu.Trigger>
                  <NavigationMenu.Content className="absolute top-0 left-0 w-auto bg-white p-4 rounded-md shadow-lg">
                    <ul className="grid grid-cols-1 gap-3 p-2 w-[220px]">
                      {dataNavItems.map((item) => (
                        <li key={item.href}>
                          <Link href={item.href} className="block">
                            <div className="font-bold text-gray-800">{item.name}</div>
                            <p className="text-xs text-gray-600 mt-1">{item.description}</p>
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </NavigationMenu.Content>
                </NavigationMenu.Item>
                
                {/* Publications */}
                <NavigationMenu.Item>
                  <Link href="/publications" className="text-gray-800 font-semibold hover:text-gray-600 transition-colors">
                    Publications
                  </Link>
                </NavigationMenu.Item>
                
                {/* Teams */}
                <NavigationMenu.Item>
                  <Link href="/teams" className="text-gray-800 font-semibold hover:text-gray-600 transition-colors">
                    Teams
                  </Link>
                </NavigationMenu.Item>
                
                {/* Contact Us */}
                <NavigationMenu.Item>
                  <Link href="/contact" className="text-gray-800 font-semibold hover:text-gray-600 transition-colors">
                    Contact Us
                  </Link>
                </NavigationMenu.Item>
              </NavigationMenu.List>
              
              <NavigationMenu.Viewport />
            </NavigationMenu.Root>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          {/* Desktop Search Form */}
          <form onSubmit={handleSearch} className="relative hidden md:block">
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
          
          {/* Mobile menu button - moved to the right */}
          <button 
            className="md:hidden text-gray-500 hover:text-accent transition-colors"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Toggle mobile menu"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              {isMobileMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>
        
        {/* Mobile Menu - Full screen but with content aligned to main container */}
        <div className={`fixed md:hidden top-[80px] left-0 right-0 bottom-0 bg-white border-b border-gray-200 overflow-y-auto transition-all duration-200 transform ${isMobileMenuOpen ? 'translate-y-0 opacity-100' : '-translate-y-full opacity-0 pointer-events-none'}`}>
          <div className="max-w-7xl mx-auto px-6 sm:px-8 py-6">
            {/* Mobile Search Form - at the top of mobile menu */}
            <form onSubmit={handleSearch} className="relative mb-6">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search..."
                className="w-full pl-10 pr-4 py-3 bg-gray-100 border border-gray-200 rounded-md text-base focus:outline-none focus:ring-2 focus:ring-accent text-gray-700"
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
            
            <nav className="flex flex-col space-y-4">
              <Link href="/about" className="text-gray-800 font-semibold py-2 border-b border-gray-100">
                About
              </Link>
              <div className="py-2 border-b border-gray-100">
                <div className="font-semibold text-gray-800 mb-2">Our Data</div>
                <ul className="ml-4 space-y-3">
                  {dataNavItems.map((item) => (
                    <li key={item.href}>
                      <Link href={item.href} className="block">
                        <span className="font-bold text-gray-800">{item.name}</span>
                        <p className="text-xs text-gray-600 mt-1">{item.description}</p>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
              <Link href="/publications" className="text-gray-800 font-semibold py-2 border-b border-gray-100">
                Publications
              </Link>
              <Link href="/teams" className="text-gray-800 font-semibold py-2 border-b border-gray-100">
                Teams
              </Link>
              <Link href="/contact" className="text-gray-800 font-semibold py-2 border-b border-gray-100">
                Contact Us
              </Link>
            </nav>
          </div>
        </div>
      </div>
    </header>
  );
} 