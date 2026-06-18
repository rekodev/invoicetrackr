'use client';

import AmbientBackground from './home/ambient-background';
import CTA from './home/cta';
import FAQ from './home/faq';
import Hero from './home/hero';
import Pricing from './home/pricing/pricing';
import ProductSection from './home/product/product-section';

export default function Home() {
  return (
    <main className="relative isolate overflow-hidden">
      <AmbientBackground />
      <Hero />
      <ProductSection />
      <Pricing />
      <FAQ />
      <CTA />
    </main>
  );
}
