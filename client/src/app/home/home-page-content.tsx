import CTA from './cta';
import FAQ from './faq';
import Hero from './hero';
import ProductSection from './product/product-section';
import ScrollRevealProvider from './scroll-reveal-provider';

export default function HomePageContent() {
  return (
    <main className="relative isolate overflow-hidden">
      <ScrollRevealProvider />
      <Hero />
      <ProductSection />
      <FAQ />
      <CTA />
    </main>
  );
}
