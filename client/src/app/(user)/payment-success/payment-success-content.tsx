'use client';

import {
  ArrowRightIcon,
  CalendarDaysIcon,
  CheckCircleIcon,
  DocumentCheckIcon,
  DocumentTextIcon,
  LifebuoyIcon,
  LockClosedIcon,
  SparklesIcon,
  Squares2X2Icon,
  UserGroupIcon
} from '@heroicons/react/24/outline';
import { Card, CardContent, Chip, buttonVariants } from '@heroui/react';
import { useLocale, useTranslations } from 'next-intl';
import Link from 'next/link';

import {
  ADD_NEW_INVOICE_PAGE,
  BILLING_PAGE,
  CLIENTS_PAGE,
  CONTRACTS_PAGE,
  DASHBOARD_PAGE,
  RENEW_SUBSCRIPTION_PAGE
} from '@/lib/constants/pages';
import IconContainer from '@/components/ui/icon-container';
import { formatLocalizedDate } from '@/lib/utils/date';

type Props = {
  isTrial: boolean;
  billing?: {
    subscriptionCurrentPeriodEndsAt?: string | null;
    trialEndsAt?: string | null;
  } | null;
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

export default function PaymentSuccessContent({ isTrial, billing }: Props) {
  const t = useTranslations('payment_success');
  const locale = useLocale();
  const copyKey = isTrial ? 'trial' : 'payment';
  const accessDate = isTrial
    ? formatLocalizedDate(billing?.trialEndsAt, locale)
    : formatLocalizedDate(billing?.subscriptionCurrentPeriodEndsAt, locale);

  return (
    <section className="mx-auto w-full max-w-[1100px] py-10 md:py-14">
      <Card className="border-default-200 bg-background rounded-xl border shadow-sm">
        <CardContent className="p-6 md:p-8">
          <div className="grid gap-10 lg:grid-cols-[1.2fr_1fr] lg:items-center lg:gap-14">
            <div>
              <Chip
                size="sm"
                variant="soft"
                color="success"
                className="section-eyebrow border-success/35 bg-success/15 h-7 border px-2.5"
              >
                <CheckCircleIcon className="h-3.5 w-3.5" strokeWidth={2.4} />
                {t(`${copyKey}.badge`)}
              </Chip>

              <h1 className="text-foreground mt-5 text-[48px] font-semibold leading-[1] tracking-tight md:text-[64px]">
                {t(`${copyKey}.headline`)}{' '}
                <span className="text-secondary">
                  {t(`${copyKey}.headline_accent`)}
                </span>
              </h1>

              <p className="text-muted mt-5 max-w-[460px] text-sm leading-relaxed">
                {t(`${copyKey}.description`)}
              </p>

              <div className="border-default-200 mt-6 grid max-w-[540px] gap-3 border-y py-4 sm:grid-cols-2">
                <div>
                  <p className="section-eyebrow text-muted">
                    {t('confirmation.status_label')}
                  </p>
                  <p className="text-foreground mt-1 text-sm font-medium">
                    {t(`${copyKey}.summary.status`)}
                  </p>
                </div>
                <div>
                  <p className="section-eyebrow text-muted">
                    {t(`${copyKey}.summary.primary_label`)}
                  </p>
                  <p className="text-foreground mt-1 text-sm font-medium">
                    {accessDate || t(`${copyKey}.summary.primary_value`)}
                  </p>
                </div>
              </div>

              <div className="mt-7 flex flex-wrap items-center gap-3">
                <Link href={ADD_NEW_INVOICE_PAGE} className={buttonVariants()}>
                  {t('actions.create_invoice')}
                  <ArrowRightIcon className="h-4 w-4" strokeWidth={2.4} />
                </Link>
                <Link
                  href={DASHBOARD_PAGE}
                  className={buttonVariants({
                    variant: 'outline'
                  })}
                >
                  <Squares2X2Icon className="h-4 w-4" strokeWidth={2.2} />
                  {t('actions.dashboard')}
                </Link>
              </div>
            </div>

            <div className="relative">
              <div className="border-default-200 bg-default-50/70 dark:bg-default-50/5 rounded-xl border p-5">
                <div className="flex items-center justify-between gap-4">
                  <div className="text-muted flex items-center gap-2 text-[11px] font-medium uppercase tracking-[0.14em]">
                    <SparklesIcon
                      className="text-secondary h-3.5 w-3.5"
                      strokeWidth={2.4}
                    />
                    {t(`${copyKey}.summary.title`)}
                  </div>
                  <div className="text-muted text-[11px] tabular-nums">
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
                    <dt className="text-muted flex items-center gap-1.5 text-[11px] uppercase tracking-[0.1em]">
                      <CalendarDaysIcon
                        className="h-3.5 w-3.5"
                        strokeWidth={2.2}
                      />
                      {t(`${copyKey}.summary.primary_label`)}
                    </dt>
                    <dd className="text-foreground mt-1.5 text-[22px] font-semibold leading-none tracking-tight">
                      {accessDate || t(`${copyKey}.summary.primary_value`)}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-muted text-[11px] uppercase tracking-[0.1em]">
                      {t(`${copyKey}.summary.secondary_label`)}
                    </dt>
                    <dd className="text-foreground mt-1.5 text-[22px] font-semibold tabular-nums leading-none tracking-tight">
                      {t(`${copyKey}.summary.secondary_value`)}
                    </dd>
                  </div>
                </dl>

                <div className="border-default-200 mt-6 border-t pt-4">
                  <Link
                    href={isTrial ? RENEW_SUBSCRIPTION_PAGE : BILLING_PAGE}
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
        </CardContent>
      </Card>

      <div className="mt-8 grid gap-4 md:grid-cols-[1fr_0.8fr]">
        <div className="border-default-200 rounded-xl border p-5">
          <div className="flex items-start gap-3">
            <LockClosedIcon
              className="text-success mt-0.5 h-5 w-5"
              strokeWidth={2.2}
            />
            <div>
              <h2 className="text-foreground text-sm font-semibold">
                {t('security.title')}
              </h2>
              <p className="text-muted mt-1 text-sm leading-relaxed">
                {t('security.description')}
              </p>
            </div>
          </div>
        </div>
        <div className="border-default-200 rounded-xl border p-5">
          <div className="flex items-start gap-3">
            <LifebuoyIcon
              className="text-secondary mt-0.5 h-5 w-5"
              strokeWidth={2.2}
            />
            <div>
              <h2 className="text-foreground text-sm font-semibold">
                {t('support.title')}
              </h2>
              <p className="text-muted mt-1 text-sm leading-relaxed">
                {t('support.description')}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-8">
        <div className="mb-4 flex items-baseline justify-between gap-4">
          <h2 className="text-muted text-[13px] font-medium uppercase tracking-[0.14em]">
            {t('quick_start.title')}
          </h2>
          <span className="text-muted text-[12px]">
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
                <IconContainer variant="secondary" className="rounded-lg">
                  <Icon className="h-4 w-4" strokeWidth={2.2} />
                </IconContainer>
                <div className="text-foreground mt-4 text-sm font-medium">
                  {t(titleKey)}
                </div>
                <p className="text-muted mt-1 text-[12.5px] leading-relaxed">
                  {t(descriptionKey)}
                </p>
                <ArrowRightIcon
                  className="text-muted group-hover:text-secondary absolute right-5 top-5 h-3.5 w-3.5 opacity-0 transition group-hover:translate-x-0.5 group-hover:opacity-100"
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
