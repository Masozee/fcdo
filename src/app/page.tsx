import React from 'react';
import { Hero } from '../components/Hero';
import { MapSection } from '../components/MapSection';
import { WebsiteNarrative } from '../components/WebsiteNarrative';
import { Publications } from '../components/Publications';
import { FAQ } from '../components/FAQ';

export default function Home() {
  return (
    <div className="min-h-screen">
      <Hero />
      <MapSection />
      <WebsiteNarrative />
      <Publications />
      <FAQ />
    </div>
  );
}
