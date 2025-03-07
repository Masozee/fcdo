import React from 'react';
import { Hero } from '../components/Hero';
import { WorldMap } from '../components/WorldMap';
import { Features } from '../components/Features';
import { Testimonials } from '../components/Testimonials';
import { Pricing } from '../components/Pricing';
import { CaseStudies } from '../components/CaseStudies';

export default function Home() {
  return (
    <div className="min-h-screen">
      <Hero />
      <Features />
      <WorldMap />
      <CaseStudies />
      <Testimonials />
      <Pricing />
    </div>
  );
}
