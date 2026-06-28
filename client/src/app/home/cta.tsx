import { ArrowRightIcon, WrenchIcon } from '@heroicons/react/24/outline';
import { CREATE_INVOICE_PAGE, SIGN_UP_PAGE } from '@/lib/constants/pages';
import { Card, Chip, Link, buttonVariants } from '@heroui/react';

import { useTranslations } from 'next-intl';

export default function CTA() {
  const t = useTranslations('home.cta');

  return (
    <section id="start" className="mx-auto max-w-5xl scroll-mt-20 px-6 py-24">
      <Card
        data-scroll-reveal=""
        className="landing-scroll-reveal landing-hover-lift backdrop-blur-xs relative overflow-hidden border bg-transparent p-8 text-center shadow-none sm:p-16"
      >
        <div className="landing-glow-mint text-accent pointer-events-none absolute left-1/2 top-0 h-64 w-full -translate-x-1/2 opacity-25 blur-3xl" />
        <div className="via-accent/50 pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent to-transparent" />
        <Card.Content className="relative p-0">
          <div>
            <Chip
              color="accent"
              className="max-w-max items-center gap-2"
              variant="soft"
            >
              <WrenchIcon className="h-4 w-4" />
              {t('badge')}
            </Chip>
          </div>
          <h2 className="mt-6 text-4xl font-medium tracking-tight md:text-6xl">
            {t('title')}
          </h2>
          <p className="text-muted mx-auto mt-4 max-w-md">{t('subtitle')}</p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link
              href={SIGN_UP_PAGE}
              className={buttonVariants({
                className: 'group gap-2'
              })}
            >
              {t('primary')}
              <ArrowRightIcon className="h-4 w-4 transition group-hover:translate-x-0.5" />
            </Link>
            <Link
              href={CREATE_INVOICE_PAGE}
              className={buttonVariants({
                variant: 'secondary'
              })}
            >
              {t('secondary')}
            </Link>
          </div>
        </Card.Content>
      </Card>
    </section>
  );
}
