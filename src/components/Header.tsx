"use client"

import React, { useState, useEffect } from 'react';
import * as NavigationMenu from '@radix-ui/react-navigation-menu';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import * as Switch from '@radix-ui/react-switch';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { Search, Globe, Sun, Moon } from 'lucide-react';

type Language = 'en' | 'es' | 'fr' | 'zh' | 'ar';

const languages = {
  en: { name: 'English', icon: '🇬🇧' },
  es: { name: 'Español', icon: '🇪🇸' },
  fr: { name: 'Français', icon: '🇫🇷' },
  zh: { name: '中文', icon: '🇨🇳' },
  ar: { name: 'العربية', icon: '🇸🇦' }
};

// Language icons
const languageIcons = {
  en: (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
    </svg>
  ),
  es: (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
    </svg>
  ),
  fr: (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
    </svg>
  ),
  zh: (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
    </svg>
  ),
  ar: (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
    </svg>
  )
};

export function Header() {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [currentLanguage, setCurrentLanguage] = useState<Language>('en');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isScrolled, setIsScrolled] = useState(false);
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);
  
  // Initialize dark mode from system preference or localStorage
  useEffect(() => {
    // Check localStorage first
    const savedMode = localStorage.getItem('darkMode');
    if (savedMode) {
      setIsDarkMode(savedMode === 'true');
    } else {
      // Check system preference
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      setIsDarkMode(prefersDark);
    }

    // Check for saved language preference
    const savedLang = localStorage.getItem('language') as Language;
    if (savedLang && languages[savedLang]) {
      setCurrentLanguage(savedLang);
    }

    // Add scroll event listener
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 0);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Update dark mode in localStorage and apply to document
  useEffect(() => {
    localStorage.setItem('darkMode', String(isDarkMode));
    
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  // Update language preference in localStorage
  useEffect(() => {
    localStorage.setItem('language', currentLanguage);
  }, [currentLanguage]);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Handle dark mode toggle
  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
    if (!isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('darkMode', 'true');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('darkMode', 'false');
    }
  };

  const changeLanguage = (lang: Language) => {
    setCurrentLanguage(lang);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle search functionality here
    console.log(`Searching for: ${searchQuery}`);
    // You could implement search navigation or API call here
  };

  return (
    <header className={`root-header sticky top-0 z-50 transition-all duration-300 ${
      isScrolled 
        ? 'bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg backdrop-saturate-150 border-b border-gray-200/50 dark:border-gray-800/50' 
        : 'bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800'
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
            className="md:hidden ml-auto text-gray-500 dark:text-gray-400 hover:text-accent dark:hover:text-accent transition-colors"
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
              <NavigationMenu.List className="flex space-x-6">
                {/* About Us */}
                <NavigationMenu.Item>
                  <Link href="/about" className="text-gray-700 dark:text-gray-300 hover:text-accent dark:hover:text-accent transition-colors">
                    About
                  </Link>
                </NavigationMenu.Item>
                
                {/* Our Data */}
                <NavigationMenu.Item>
                  <NavigationMenu.Trigger className="group flex items-center text-gray-700 dark:text-gray-300 hover:text-accent dark:hover:text-accent transition-colors">
                    <span>Our Data</span>
                    <svg width="12" height="12" viewBox="0 0 12 12" xmlns="http://www.w3.org/2000/svg" className="ml-1 text-gray-500 dark:text-gray-400 group-hover:rotate-180 transition-transform duration-200">
                      <path d="M6 8L2 4H10L6 8Z" fill="currentColor" />
                    </svg>
                  </NavigationMenu.Trigger>
                  <NavigationMenu.Content className="absolute top-full left-0 mt-2 w-[350px] p-4 bg-white dark:bg-gray-800 rounded-md shadow-lg border border-gray-200 dark:border-gray-700 z-10">
                    <ul className="space-y-4">
                      <li>
                        <Link href="/data" className="block p-3 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-md transition-colors border border-transparent hover:border-accent">
                          <div className="flex flex-col">
                            <span className="font-bold text-accent dark:text-accent">Data Table</span>
                            <span className="text-sm text-gray-500 dark:text-gray-400 mt-1">Explore and filter trade data with advanced sorting options</span>
                          </div>
                        </Link>
                      </li>
                      <li>
                        <Link href="/db-map" className="block p-3 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-md transition-colors border border-transparent hover:border-accent">
                          <div className="flex flex-col">
                            <span className="font-bold text-accent dark:text-accent">Interactive Map</span>
                            <span className="text-sm text-gray-500 dark:text-gray-400 mt-1">Visualize global trade flows and patterns with interactive maps</span>
                          </div>
                        </Link>
                      </li>
                    </ul>
                  </NavigationMenu.Content>
                </NavigationMenu.Item>
                
                {/* Publications */}
                <NavigationMenu.Item>
                  <Link href="/publications" className="text-gray-700 dark:text-gray-300 hover:text-accent dark:hover:text-accent transition-colors">
                    Publications
                  </Link>
                </NavigationMenu.Item>
                
                {/* Teams */}
                <NavigationMenu.Item>
                  <Link href="/teams" className="text-gray-700 dark:text-gray-300 hover:text-accent dark:hover:text-accent transition-colors">
                    Teams
                  </Link>
                </NavigationMenu.Item>
              </NavigationMenu.List>
              
              <NavigationMenu.Viewport />
            </NavigationMenu.Root>
          </div>
        </div>
        
        {/* Mobile Menu */}
        <div className={`fixed md:hidden top-[80px] left-0 right-0 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 transition-all duration-200 transform ${isMobileMenuOpen ? 'translate-y-0 opacity-100' : '-translate-y-full opacity-0'}`}>
          <div className="container mx-auto px-4 py-4">
            <nav className="flex flex-col space-y-4">
              <Link href="/about" className="text-gray-700 dark:text-gray-300 hover:text-accent dark:hover:text-accent font-medium py-2 border-b border-gray-100 dark:border-gray-800">
                About
              </Link>
              <div className="py-2 border-b border-gray-100 dark:border-gray-800">
                <div className="font-medium text-gray-900 dark:text-white mb-2">Our Data</div>
                <ul className="ml-4 space-y-3">
                  <li>
                    <Link href="/data" className="block">
                      <span className="font-bold text-accent dark:text-accent">Data Table</span>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Explore and filter trade data</p>
                    </Link>
                  </li>
                  <li>
                    <Link href="/db-map" className="block">
                      <span className="font-bold text-accent dark:text-accent">Interactive Map</span>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Visualize global trade patterns</p>
                    </Link>
                  </li>
                </ul>
              </div>
              <Link href="/publications" className="text-gray-700 dark:text-gray-300 hover:text-accent dark:hover:text-accent font-medium py-2 border-b border-gray-100 dark:border-gray-800">
                Publications
              </Link>
              <Link href="/teams" className="text-gray-700 dark:text-gray-300 hover:text-accent dark:hover:text-accent font-medium py-2 border-b border-gray-100 dark:border-gray-800">
                Teams
              </Link>
            </nav>
          </div>
        </div>
        
        <div className="hidden md:flex items-center space-x-4">
          {/* Search Form */}
          <form onSubmit={handleSearch} className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search..."
              className="w-64 pl-10 pr-4 py-2 bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-accent text-gray-700 dark:text-gray-300"
            />
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              className="h-5 w-5 text-gray-500 dark:text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </form>

          {/* Language Selector */}
          <DropdownMenu.Root>
            <DropdownMenu.Trigger asChild>
              <button className="flex items-center justify-center w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
                {languageIcons[currentLanguage]}
              </button>
            </DropdownMenu.Trigger>

            <DropdownMenu.Content className="bg-white dark:bg-gray-800 p-2 rounded-md shadow-lg border border-gray-200 dark:border-gray-700 min-w-[180px] z-10">
              <DropdownMenu.RadioGroup value={currentLanguage} onValueChange={(value: string) => changeLanguage(value as Language)}>
                {Object.entries(languages).map(([code, { name }]) => (
                  <DropdownMenu.RadioItem
                    key={code}
                    value={code}
                    className="flex items-center space-x-2 px-3 py-2 cursor-pointer rounded hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
                  >
                    {languageIcons[code as Language]}
                    <span>{name}</span>
                    {currentLanguage === code && (
                      <span className="ml-auto text-accent">✓</span>
                    )}
                  </DropdownMenu.RadioItem>
                ))}
              </DropdownMenu.RadioGroup>
            </DropdownMenu.Content>
          </DropdownMenu.Root>

          {/* Simplified Dark Mode Toggle */}
          <button 
            onClick={toggleDarkMode} 
            className="flex items-center justify-center w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
            aria-label={isDarkMode ? "Switch to light mode" : "Switch to dark mode"}
          >
            {isDarkMode ? (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
              </svg>
            )}
          </button>
        </div>
        
        {/* Mobile Search, Language & Dark Mode */}
        <div className="flex md:hidden items-center space-x-2">
          {/* Mobile Search Button */}
          <button 
            onClick={() => {/* Toggle mobile search */}} 
            className="flex items-center justify-center w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300"
          >
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              className="h-4 w-4" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </button>

          {/* Language Selector (Mobile) */}
          <DropdownMenu.Root>
            <DropdownMenu.Trigger asChild>
              <button className="flex items-center justify-center w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-800">
                {languageIcons[currentLanguage]}
              </button>
            </DropdownMenu.Trigger>

            <DropdownMenu.Content className="bg-white dark:bg-gray-800 p-2 rounded-md shadow-lg border border-gray-200 dark:border-gray-700 min-w-[150px] z-10">
              <DropdownMenu.RadioGroup value={currentLanguage} onValueChange={(value: string) => changeLanguage(value as Language)}>
                {Object.entries(languages).map(([code, { name }]) => (
                  <DropdownMenu.RadioItem
                    key={code}
                    value={code}
                    className="flex items-center space-x-2 px-2 py-1.5 cursor-pointer rounded hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
                  >
                    {languageIcons[code as Language]}
                    <span>{name}</span>
                    {currentLanguage === code && (
                      <span className="ml-auto text-accent">✓</span>
                    )}
                  </DropdownMenu.RadioItem>
                ))}
              </DropdownMenu.RadioGroup>
            </DropdownMenu.Content>
          </DropdownMenu.Root>

          {/* Dark Mode Toggle (Mobile) */}
          <button 
            onClick={toggleDarkMode} 
            className="flex items-center justify-center w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300"
            aria-label={isDarkMode ? "Switch to light mode" : "Switch to dark mode"}
          >
            {isDarkMode ? (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
              </svg>
            )}
          </button>
        </div>
      </div>
    </header>
  );
} 