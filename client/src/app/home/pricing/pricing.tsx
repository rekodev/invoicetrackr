import { getCurrencySymbol, getUserCurrency } from '@/lib/utils/currency';
import { useTranslations } from 'next-intl';

import { PRICING_PLANS } from './constants';
import PriceCard from './price-card';
import SectionHeading from '../section-heading';

export default function Pricing() {
  const t = useTranslations('home.pricing');
  const currencySymbol = getCurrencySymbol(getUserCurrency());

  return (
    <section id="pricing" className="mx-auto max-w-5xl px-6 py-24">
      <SectionHeading
        eyebrow={t('eyebrow')}
        title={t('title')}
        body={t('subtitle')}
      />

      <div className="mt-14 grid gap-4 md:grid-cols-2">
        {PRICING_PLANS.map((plan) => (
          <PriceCard
            key={plan}
            plan={plan}
            currencySymbol={currencySymbol}
            highlighted={plan === 'premium'}
          />
        ))}
      </div>
    </section>
  );
}
