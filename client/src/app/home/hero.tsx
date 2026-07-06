'use client';

import { ArrowRightIcon, ChevronRightIcon } from '@heroicons/react/24/outline';
import { CREATE_INVOICE_PAGE, SIGN_UP_PAGE } from '@/lib/constants/pages';
import { Chip, Link, buttonVariants } from '@heroui/react';
import { useTranslations } from 'next-intl';

import ProductPreview from './product/product-preview';

export default function Hero() {
  const t = useTranslations('home.hero');

  return (
    <section className="mx-auto max-w-7xl px-6 pb-20 pt-20 text-center md:pb-24 md:pt-28">
      <Link
        href="#features"
        className={buttonVariants({
          variant: 'outline',
          size: 'sm',
          className: 'landing-reveal gap-2'
        })}
      >
        <Chip color="success" size="sm" variant="soft">
          {t('badge_label')}
        </Chip>
        {t('badge_text')}
        <ChevronRightIcon className="text-muted h-3 w-3 transition group-hover:translate-x-0.5" />
      </Link>

      <h1 className="landing-reveal landing-delay-1 mx-auto mt-7 max-w-5xl text-5xl font-medium leading-[0.98] tracking-tight sm:text-6xl md:text-7xl lg:text-8xl">
        {t('title')}
        <br />
        <span className="text-muted">{t('title_accent')}</span>
      </h1>

      <p className="text-muted landing-reveal landing-delay-2 mx-auto mt-6 max-w-2xl text-base leading-relaxed md:text-lg">
        {t('subtitle')}
      </p>

      <div className="landing-reveal landing-delay-3 mt-9 flex flex-wrap items-center justify-center gap-3">
        <Link
          href={CREATE_INVOICE_PAGE}
          className={buttonVariants({
            className: 'shadow-accent/10 group gap-2 shadow-lg'
          })}
        >
          {t('cta_primary')}
          <ArrowRightIcon className="h-4 w-4 transition group-hover:translate-x-0.5" />
        </Link>
        <Link
          href={SIGN_UP_PAGE}
          className={buttonVariants({
            variant: 'secondary',
            className: 'group gap-2'
          })}
        >
          {t('cta_secondary')}
          <ChevronRightIcon className="text-muted h-4 w-4 transition group-hover:translate-x-0.5" />
        </Link>
      </div>

      <p className="text-muted landing-reveal landing-delay-4 mt-5 text-xs">
        {t('note')}
      </p>

      <div className="landing-reveal landing-delay-5">
        <ProductPreview />
      </div>
    </section>
  );
}
