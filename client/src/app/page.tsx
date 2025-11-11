'use client';

import { Button, Link } from '@heroui/react';
import { CheckIcon } from '@heroicons/react/24/outline';
import Image from 'next/image';
import { useTranslations } from 'next-intl';

import { CREATE_INVOICE_PAGE, SIGN_UP_PAGE } from '@/lib/constants/pages';
import { getCurrencySymbol, getUserCurrency } from '@/lib/utils/currency';

export default function Home() {
  const t = useTranslations('home');

  const renderDivider = () => (
    <div className="border-default-300 dark:border-default-100 w-full border-t" />
  );

  return (
    <div className="flex min-h-screen flex-col">
      <main className="flex-1">
        <section className="mx-auto w-full max-w-7xl px-6 py-12 md:py-24 lg:py-32 xl:py-48">
          <div className="grid gap-6 lg:grid-cols-[1fr_400px] lg:gap-12 xl:grid-cols-[1fr_600px]">
            <div className="flex flex-col justify-center space-y-6">
              <div className="space-y-4">
                <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none">
                  {t('hero.title')}
                </h1>
                <p className="text-muted-foreground max-w-[600px] md:text-xl">
                  {t('hero.subtitle')}
                </p>
              </div>
              <div className="flex flex-col gap-2 sm:flex-row">
                <Button
                  as={Link}
                  href={CREATE_INVOICE_PAGE}
                  size="lg"
                  color="secondary"
                  className="px-8"
                >
                  {t('hero.cta_primary')}
                </Button>
                <Button as={Link} href="#pricing" variant="ghost" size="lg">
                  {t('hero.cta_secondary')}
                </Button>
              </div>
            </div>
            <Image
              src="https://res.cloudinary.com/dpc8mowbo/image/upload/fl_preserve_transparency/v1742077159/amyxvmvgwypog08nu4mp.jpg?_s=public-apps"
              width={850}
              height={550}
              alt="Invoice app dashboard preview"
              className="mx-auto overflow-hidden rounded-xl object-cover object-center sm:w-full lg:order-last"
              unoptimized
            />
          </div>
        </section>

        {renderDivider()}

        <section
          id="features"
          className="max-w-8xl bg-muted mx-auto w-full max-w-7xl px-6 py-12 md:py-24 lg:py-32"
        >
          <div className="flex flex-col items-center justify-center space-y-4 text-center">
            <div className="space-y-4">
              <h2 className="text-3xl font-bold tracking-tighter md:text-4xl/tight">
                {t('features.title')}
              </h2>
              <p className="text-muted-foreground mx-auto max-w-[700px] md:text-xl">
                {t('features.subtitle')}
              </p>
            </div>
          </div>
          <div className="mx-auto grid max-w-7xl items-center gap-12 py-12 lg:grid-cols-2 lg:gap-12">
            <Image
              src="https://res.cloudinary.com/dpc8mowbo/image/upload/fl_preserve_transparency/v1742079914/bmnbendbuwp8ydtusijr.jpg?_s=public-apps"
              width={850}
              height={550}
              alt="Invoice editor interface"
              className="mx-auto overflow-hidden rounded-xl object-cover object-center sm:w-full"
              unoptimized
            />
            <div className="flex flex-col justify-center space-y-4">
              <ul className="grid gap-6">
                <li className="flex items-start gap-4">
                  <div className="bg-primary/10 rounded-full p-1">
                    <CheckIcon className="text-secondary h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-bold">
                      {t('features.save_edit.title')}
                    </h3>
                    <p className="text-muted-foreground">
                      {t('features.save_edit.description')}
                    </p>
                  </div>
                </li>
                <li className="flex items-start gap-4">
                  <div className="bg-primary/10 rounded-full p-1">
                    <CheckIcon className="text-secondary h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-bold">
                      {t('features.dashboard.title')}
                    </h3>
                    <p className="text-muted-foreground">
                      {t('features.dashboard.description')}
                    </p>
                  </div>
                </li>
                <li className="flex items-start gap-4">
                  <div className="bg-primary/10 rounded-full p-1">
                    <CheckIcon className="text-secondary h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-bold">
                      {t('features.multi_currency.title')}
                    </h3>
                    <p className="text-muted-foreground">
                      {t('features.multi_currency.description')}
                    </p>
                  </div>
                </li>
              </ul>
            </div>
          </div>
        </section>

        {renderDivider()}

        <section
          id="pricing"
          className="mx-auto w-full max-w-7xl px-6 py-12 md:py-24 lg:py-32"
        >
          <div className="flex flex-col items-center justify-center space-y-4 text-center">
            <div className="space-y-4">
              <h2 className="text-3xl font-bold tracking-tighter md:text-4xl/tight">
                {t('pricing.title')}
              </h2>
              <p className="text-muted-foreground mx-auto max-w-[700px] md:text-xl">
                {t('pricing.subtitle')}
              </p>
            </div>
          </div>
          <div className="mx-auto flex w-full max-w-7xl flex-col items-center justify-center gap-6 py-12 lg:flex-row">
            <div className="bg-card text-card-foreground border-default-300 dark:border-default-100 flex min-h-[472px] w-full max-w-md flex-col justify-between rounded-lg border shadow-sm">
              <div>
                <div className="flex flex-col space-y-1.5 p-6">
                  <h3 className="text-2xl font-bold">
                    {t('pricing.free.title')}
                  </h3>
                  <p className="text-muted-foreground">
                    {t('pricing.free.subtitle')}
                  </p>
                </div>
                <div className="p-6 pt-0">
                  <div className="text-4xl font-bold">
                    {getCurrencySymbol(getUserCurrency())}0
                  </div>
                  <div className="text-muted-foreground">
                    {t('pricing.free.price_label')}
                  </div>
                </div>
                <div className="p-6 pt-0">
                  <ul className="space-y-2">
                    <li className="flex items-center gap-2">
                      <CheckIcon className="text-secondary h-4 w-4" />
                      <span>{t('pricing.free.features.unlimited')}</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckIcon className="text-secondary h-4 w-4" />
                      <span>{t('pricing.free.features.template')}</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckIcon className="text-secondary h-4 w-4" />
                      <span>{t('pricing.free.features.export')}</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckIcon className="text-secondary h-4 w-4" />
                      <span>{t('pricing.free.features.signature')}</span>
                    </li>
                  </ul>
                </div>
              </div>
              <div className="flex flex-col p-6 pt-0">
                <Button as={Link} href={CREATE_INVOICE_PAGE}>
                  {t('pricing.free.cta')}
                </Button>
              </div>
            </div>
            <div className="border-secondary-500 bg-secondary-50 flex w-full max-w-md flex-col rounded-lg border bg-opacity-50 shadow-sm dark:bg-opacity-100">
              <div className="flex flex-col space-y-1.5 p-6">
                <h3 className="text-2xl font-bold">
                  {t('pricing.premium.title')}
                </h3>
                <p>{t('pricing.premium.subtitle')}</p>
              </div>
              <div className="p-6 pt-0">
                <div className="text-4xl font-bold">
                  {getCurrencySymbol(getUserCurrency())}4.99
                </div>
                <div>{t('pricing.premium.price_label')}</div>
              </div>
              <div className="p-6 pt-0">
                <ul className="space-y-2">
                  <li className="flex items-center gap-2">
                    <CheckIcon className="text-secondary dark:text-secondary-600 h-4 w-4" />
                    <span>{t('pricing.premium.features.everything')}</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckIcon className="text-secondary dark:text-secondary-600 h-4 w-4" />
                    <span>{t('pricing.premium.features.save')}</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckIcon className="text-secondary dark:text-secondary-600 h-4 w-4" />
                    <span>{t('pricing.premium.features.clients')}</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckIcon className="text-secondary dark:text-secondary-600 h-4 w-4" />
                    <span>{t('pricing.premium.features.contracts')}</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckIcon className="text-secondary dark:text-secondary-600 h-4 w-4" />
                    <span>{t('pricing.premium.features.currency')}</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckIcon className="text-secondary dark:text-secondary-600 h-4 w-4" />
                    <span>{t('pricing.premium.features.email')}</span>
                  </li>
                </ul>
              </div>
              <div className="flex flex-col p-6 pt-0">
                <Button
                  as={Link}
                  href={SIGN_UP_PAGE}
                  variant="solid"
                  color="secondary"
                >
                  {t('pricing.premium.cta')}
                </Button>
              </div>
            </div>
          </div>
        </section>

        {renderDivider()}

        <section className="bg-muted mx-auto w-full max-w-7xl px-6 py-12 md:py-24 lg:py-32">
          <div className="grid gap-12 md:gap-16 lg:grid-cols-2">
            <div className="space-y-6">
              <h2 className="text-3xl font-bold tracking-tighter md:text-4xl/tight">
                {t('cta.title')}
              </h2>
              <p className="text-muted-foreground md:text-xl">
                {t('cta.subtitle')}
              </p>
              <Button
                as={Link}
                href={CREATE_INVOICE_PAGE}
                size="lg"
                className="px-8"
              >
                {t('cta.button')}
              </Button>
            </div>
            <div className="flex flex-col items-start space-y-4">
              <div className="bg-background inline-block rounded-lg px-3 py-1 text-sm">
                {t('testimonial.label')}
              </div>
              <blockquote className="text-lg font-semibold">
                {t('testimonial.quote')}
              </blockquote>
              <div className="flex items-center gap-4">
                <div className="bg-muted-foreground/20 rounded-full p-1">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="text-muted-foreground/70 h-10 w-10"
                  >
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                    <circle cx="12" cy="7" r="4" />
                  </svg>
                </div>
                <div>
                  <div className="font-semibold">{t('testimonial.author')}</div>
                  <div className="text-muted-foreground text-sm">
                    {t('testimonial.role')}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
