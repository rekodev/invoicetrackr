import CTA from './cta';
import FAQ from './faq';
import Hero from './hero';
import Pricing from './pricing/pricing';
import ProductSection from './product/product-section';

export default function HomePageContent() {
  return (
    <main className="relative isolate overflow-hidden">
      <Hero />
      <ProductSection />
      <Pricing />
      <FAQ />
      <CTA />
    </main>
  );
}
