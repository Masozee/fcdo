import React from 'react';
import { Hero } from '../components/Hero';
import { WebsiteNarrative } from '../components/WebsiteNarrative';
import { ReversedWebsiteNarrative } from '../components/ReversedWebsiteNarrative';
import { Publications } from '../components/Publications';
import { FAQ } from '../components/FAQ';

export default function Home() {
  return (
    <div className="min-h-screen">
      <Hero />
      <WebsiteNarrative />
      <ReversedWebsiteNarrative />
      <Publications />
      <FAQ />
    </div>
  );
}
