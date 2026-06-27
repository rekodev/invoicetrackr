'use client';

import { getCurrencySymbol, getUserCurrency } from '@/lib/utils/currency';
import { useEffect, useRef } from 'react';
import { useTranslations } from 'next-intl';

import { analyticsEvents } from '@/lib/analytics/events';
import { captureAnalyticsEvent } from '@/lib/analytics/client';

import { PRICING_PLANS } from './constants';
import PriceCard from './price-card';
import SectionHeading from '../section-heading';

export default function Pricing() {
  const t = useTranslations('home.pricing');
  const currencySymbol = getCurrencySymbol(getUserCurrency());
  const sectionRef = useRef<HTMLElement>(null);
  const hasCapturedPricingView = useRef(false);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting || hasCapturedPricingView.current) return;

        hasCapturedPricingView.current = true;
        captureAnalyticsEvent(analyticsEvents.pricingViewed);
        observer.disconnect();
      },
      { threshold: 0.5 }
    );

    observer.observe(section);

    return () => observer.disconnect();
  }, []);

  return (
    <section
      ref={sectionRef}
      id="pricing"
      className="mx-auto max-w-5xl px-6 py-24"
    >
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
