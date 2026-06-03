'use client';

import {
  ArrowRightIcon,
  CalendarDaysIcon,
  CheckCircleIcon,
  DocumentCheckIcon,
  DocumentTextIcon,
  SparklesIcon,
  Squares2X2Icon,
  UserGroupIcon
} from '@heroicons/react/24/outline';
import { Button, Card, CardBody, Chip } from '@heroui/react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';

import {
  ACCOUNT_SETTINGS_PAGE,
  ADD_NEW_INVOICE_PAGE,
  CLIENTS_PAGE,
  CONTRACTS_PAGE,
  DASHBOARD_PAGE,
  RENEW_SUBSCRIPTION_PAGE
} from '@/lib/constants/pages';

type Props = {
  isTrial: boolean;
};

const quickActions = [
  {
    icon: DocumentTextIcon,
    titleKey: 'quick_actions.invoice.title',
    descriptionKey: 'quick_actions.invoice.description',
    href: ADD_NEW_INVOICE_PAGE
  },
  {
    icon: UserGroupIcon,
    titleKey: 'quick_actions.client.title',
    descriptionKey: 'quick_actions.client.description',
    href: CLIENTS_PAGE
  },
  {
    icon: DocumentCheckIcon,
    titleKey: 'quick_actions.contract.title',
    descriptionKey: 'quick_actions.contract.description',
    href: CONTRACTS_PAGE
  }
] as const;

export default function PaymentSuccessContent({ isTrial }: Props) {
  const t = useTranslations('payment_success');
  const copyKey = isTrial ? 'trial' : 'payment';

  return (
    <section className="mx-auto w-full max-w-[1100px] py-12 md:py-16">
      <Card className="glass-card relative overflow-hidden rounded-2xl">
        <div
          aria-hidden
          className="pointer-events-none absolute -right-24 -top-32 h-80 w-80 rounded-full opacity-60 blur-3xl"
          style={{
            background:
              'radial-gradient(closest-side, hsl(var(--heroui-secondary) / 0.35), transparent)'
          }}
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -bottom-40 -left-20 h-80 w-80 rounded-full opacity-40 blur-3xl"
          style={{
            background:
              'radial-gradient(closest-side, hsl(var(--heroui-success) / 0.22), transparent)'
          }}
        />

        <CardBody className="relative p-8 md:p-12">
          <div className="grid gap-10 lg:grid-cols-[1.2fr_1fr] lg:items-center lg:gap-14">
            <div>
              <Chip
                size="sm"
                variant="flat"
                color="success"
                className="border-success/35 bg-success/15 h-7 border px-2.5 text-[11px] font-medium uppercase tracking-[0.12em]"
                startContent={
                  <CheckCircleIcon className="h-3.5 w-3.5" strokeWidth={2.4} />
                }
              >
                {t(`${copyKey}.badge`)}
              </Chip>

              <h1 className="text-foreground mt-5 text-[48px] font-semibold leading-[1] tracking-tight md:text-[64px]">
                {t(`${copyKey}.headline`)}{' '}
                <span className="text-secondary">
                  {t(`${copyKey}.headline_accent`)}
                </span>
              </h1>

              <p className="text-default-500 mt-5 max-w-[460px] text-sm leading-relaxed">
                {t(`${copyKey}.description`)}
              </p>

              <div className="mt-7 flex flex-wrap items-center gap-3">
                <Button
                  as={Link}
                  href={ADD_NEW_INVOICE_PAGE}
                  color="secondary"
                  size="lg"
                  className="rounded-xl font-medium"
                  endContent={
                    <ArrowRightIcon className="h-4 w-4" strokeWidth={2.4} />
                  }
                >
                  {t('actions.create_invoice')}
                </Button>
                <Button
                  as={Link}
                  href={DASHBOARD_PAGE}
                  variant="bordered"
                  size="lg"
                  className="rounded-xl font-medium"
                  startContent={
                    <Squares2X2Icon className="h-4 w-4" strokeWidth={2.2} />
                  }
                >
                  {t('actions.dashboard')}
                </Button>
              </div>
            </div>

            <div className="relative">
              <div className="glass-card rounded-2xl p-6">
                <div className="flex items-center justify-between gap-4">
                  <div className="text-default-500 flex items-center gap-2 text-[11px] font-medium uppercase tracking-[0.14em]">
                    <SparklesIcon
                      className="text-secondary h-3.5 w-3.5"
                      strokeWidth={2.4}
                    />
                    {t(`${copyKey}.summary.title`)}
                  </div>
                  <div className="text-default-500 text-[11px] tabular-nums">
                    {t(`${copyKey}.summary.status`)}
                  </div>
                </div>

                {isTrial && (
                  <div className="mt-4 flex items-center gap-1.5">
                    <span className="bg-secondary h-1.5 flex-1 rounded-full" />
                    {Array.from({ length: 6 }).map((_, index) => (
                      <span
                        key={index}
                        className="bg-default-300 h-1.5 flex-1 rounded-full"
                      />
                    ))}
                  </div>
                )}

                <dl className="mt-6 grid grid-cols-2 gap-5">
                  <div>
                    <dt className="text-default-500 flex items-center gap-1.5 text-[11px] uppercase tracking-[0.1em]">
                      <CalendarDaysIcon
                        className="h-3.5 w-3.5"
                        strokeWidth={2.2}
                      />
                      {t(`${copyKey}.summary.primary_label`)}
                    </dt>
                    <dd className="text-foreground mt-1.5 text-[22px] font-semibold leading-none tracking-tight">
                      {t(`${copyKey}.summary.primary_value`)}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-default-500 text-[11px] uppercase tracking-[0.1em]">
                      {t(`${copyKey}.summary.secondary_label`)}
                    </dt>
                    <dd className="text-foreground mt-1.5 text-[22px] font-semibold tabular-nums leading-none tracking-tight">
                      €4.99
                      <span className="text-default-500 text-[13px]">/mo</span>
                    </dd>
                  </div>
                </dl>

                <div className="border-default-200 mt-6 border-t pt-4">
                  <Link
                    href={
                      isTrial ? RENEW_SUBSCRIPTION_PAGE : ACCOUNT_SETTINGS_PAGE
                    }
                    className="text-foreground/90 hover:text-secondary group inline-flex items-center gap-1.5 text-[13px] transition"
                  >
                    {t(`${copyKey}.summary.link`)}
                    <ArrowRightIcon
                      className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5"
                      strokeWidth={2.4}
                    />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </CardBody>
      </Card>

      <div className="mt-10">
        <div className="mb-4 flex items-baseline justify-between gap-4">
          <h2 className="text-default-500 text-[13px] font-medium uppercase tracking-[0.14em]">
            {t('quick_start.title')}
          </h2>
          <span className="text-default-500 text-[12px]">
            {t('quick_start.subtitle')}
          </span>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {quickActions.map(
            ({ icon: Icon, titleKey, descriptionKey, href }) => (
              <Link
                key={titleKey}
                href={href}
                className="glass-card glass-card-interactive hover:border-secondary/40 group relative overflow-hidden rounded-2xl p-5"
              >
                <div className="bg-secondary/10 text-secondary grid h-9 w-9 place-items-center rounded-lg">
                  <Icon className="h-4 w-4" strokeWidth={2.2} />
                </div>
                <div className="text-foreground mt-4 text-sm font-medium">
                  {t(titleKey)}
                </div>
                <p className="text-default-500 mt-1 text-[12.5px] leading-relaxed">
                  {t(descriptionKey)}
                </p>
                <ArrowRightIcon
                  className="text-default-500 group-hover:text-secondary absolute right-5 top-5 h-3.5 w-3.5 opacity-0 transition group-hover:translate-x-0.5 group-hover:opacity-100"
                  strokeWidth={2.4}
                />
              </Link>
            )
          )}
        </div>
      </div>
    </section>
  );
}
