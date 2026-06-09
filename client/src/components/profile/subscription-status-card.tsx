'use client';

import {
  ArrowRightIcon,
  CheckCircleIcon,
  CreditCardIcon,
  SparklesIcon
} from '@heroicons/react/24/outline';
import { Button, Card, CardBody, CardHeader, cn } from '@heroui/react';
import { useLocale, useTranslations } from 'next-intl';
import { User } from 'next-auth';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

import { RENEW_SUBSCRIPTION_PAGE } from '@/lib/constants/pages';
import { createBillingPortalSession } from '@/api/payment';
import { formatLocalizedDate } from '@/lib/utils/date';
import { isResponseError } from '@/lib/utils/error';

type Props = {
  user: User;
  currency: string;
  showAction?: boolean;
};

export default function SubscriptionStatusCard({
  user,
  showAction = true
}: Props) {
  const t = useTranslations('profile.account_settings.subscription');
  const locale = useLocale();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const isTrialing = user.subscriptionStatus === 'trialing';
  const hasPaymentMethod = !!user.hasPaymentMethod;
  const trialEndsAt = formatLocalizedDate(user.trialEndsAt, locale);
  const currentPeriodEndsAt = formatLocalizedDate(
    user.subscriptionCurrentPeriodEndsAt,
    locale
  );
  const isActive =
    user.subscriptionStatus === 'active' ||
    isTrialing ||
    (user.subscriptionStatus === 'past_due' &&
      !!user.subscriptionGraceEndsAt &&
      new Date(user.subscriptionGraceEndsAt) > new Date());
  const statusKey = isTrialing ? 'trial' : isActive ? 'active' : 'inactive';
  const billingDetails = user.billingDetails;
  const cardLabel =
    billingDetails?.cardBrand && billingDetails.cardLast4
      ? t('payment_method.card', {
          brand: billingDetails.cardBrand.toUpperCase(),
          last4: billingDetails.cardLast4
        })
      : hasPaymentMethod
        ? t('payment_method.saved')
        : t('payment_method.missing');
  const cardExpiry =
    billingDetails?.cardExpMonth && billingDetails.cardExpYear
      ? t('payment_method.expires', {
          month: String(billingDetails.cardExpMonth).padStart(2, '0'),
          year: billingDetails.cardExpYear
        })
      : undefined;
  const formatStripeAmount = (
    amount: number | null | undefined,
    currencyCode: string | null | undefined
  ) => {
    if (amount === null || amount === undefined) return undefined;

    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: currencyCode || 'eur'
    }).format(amount / 100);
  };
  const stripeRateAmount = formatStripeAmount(
    user.billingRate?.amount,
    user.billingRate?.currency
  );
  const stripeRateInterval =
    user.billingRate?.interval === 'year'
      ? t('interval.year')
      : user.billingRate?.interval === 'month'
        ? t('interval.month')
        : user.billingRate?.interval;
  const getCurrentRate = () => {
    if (stripeRateAmount) {
      const title =
        user.billingRate?.interval === 'year'
          ? t('rates.annual.title')
          : user.billingRate?.interval === 'month'
            ? t('rates.monthly.title')
            : t('rates.custom.title');

      return {
        title,
        amount: stripeRateAmount,
        interval: stripeRateInterval,
        note: stripeRateInterval
          ? t('rates.stripe_note')
          : currentPeriodEndsAt
            ? t('rates.unavailable.renews', {
                date: currentPeriodEndsAt
              })
            : t('rates.invoice_note')
      };
    }

    return {
      title: t('rates.unavailable.title'),
      amount: t('rates.unavailable.amount'),
      interval: undefined,
      note: currentPeriodEndsAt
        ? t('rates.unavailable.renews', {
            date: currentPeriodEndsAt
          })
        : t('rates.unavailable.note')
    };
  };
  const currentRate = getCurrentRate();

  const handleClick = async () => {
    if (isActive) {
      setIsLoading(true);
      const response = await createBillingPortalSession(Number(user.id));
      if (!isResponseError(response)) {
        window.location.assign(response.data.url);
        return;
      }
      setIsLoading(false);
      return;
    }

    router.push(RENEW_SUBSCRIPTION_PAGE);
  };

  return (
    <Card className="border-default-100 bg-background w-full flex-1 rounded-xl border shadow-sm">
      <CardHeader className="border-default-100 flex flex-col items-start justify-between gap-5 border-b p-6 md:flex-row md:items-center">
        <div className="max-w-2xl">
          <div className="border-secondary/30 bg-secondary/10 text-secondary inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-medium uppercase tracking-[0.08em]">
            <SparklesIcon className="h-3.5 w-3.5" />
            {t('badge')}
          </div>
          <h1 className="text-foreground mt-4 text-2xl font-semibold tracking-tight">
            {t('title')}
          </h1>
          <p className="text-default-500 mt-2 max-w-xl text-sm leading-6">
            {isTrialing && hasPaymentMethod
              ? t('description.trial_ready')
              : t(`description.${statusKey}`)}
          </p>
        </div>

        {showAction && (
          <Button
            onPress={handleClick}
            isLoading={isLoading}
            className="w-full rounded-xl font-medium md:w-auto"
            size="md"
            variant={isActive ? 'bordered' : 'solid'}
            color={isActive ? 'secondary' : 'warning'}
            endContent={!isLoading && <ArrowRightIcon className="h-4 w-4" />}
          >
            {isTrialing
              ? hasPaymentMethod
                ? t('action.manage')
                : t('action.add_payment_method')
              : isActive
                ? t('action.manage')
                : t('action.renew')}
          </Button>
        )}
      </CardHeader>

      <CardBody className="grid gap-4 p-6 lg:grid-cols-[1fr_1fr]">
        <div className="p-1">
          <div className="flex items-start gap-3">
            <span
              className={cn(
                'bg-success/10 text-success grid h-9 w-9 shrink-0 place-items-center rounded-lg',
                { 'bg-danger/10 text-danger': !isActive }
              )}
            >
              <CheckCircleIcon className="h-5 w-5" />
            </span>
            <div>
              <p className="text-default-500 text-[11px] font-medium uppercase tracking-[0.12em]">
                {t('status_label')}
              </p>
              <p className="text-foreground mt-1 text-base font-semibold">
                {t(`status.${statusKey}`)}
              </p>
              <p className="text-default-500 mt-1 text-sm">
                {isTrialing && trialEndsAt
                  ? t('trial_ends', { date: trialEndsAt })
                  : t('access_note')}
              </p>
            </div>
          </div>

          <div className="border-default-100 mt-5 border-t pt-5">
            <p className="text-default-500 text-[11px] font-medium uppercase tracking-[0.12em]">
              {t('current_rate_label')}
            </p>
            <div className="mt-2 flex flex-wrap items-baseline gap-x-2 gap-y-1">
              <p className="text-foreground text-sm font-semibold">
                {currentRate.title}
              </p>
              <p className="text-foreground text-2xl font-semibold leading-none tracking-tight">
                {currentRate.amount}
                {currentRate.interval ? (
                  <span className="text-default-500 text-sm font-normal">
                    /{currentRate.interval}
                  </span>
                ) : null}
              </p>
            </div>
            <p className="text-default-500 mt-2 text-sm">{currentRate.note}</p>
          </div>
        </div>

        <div className="p-1">
          <div className="flex items-start gap-3">
            <span className="bg-secondary/10 text-secondary grid h-9 w-9 shrink-0 place-items-center rounded-lg">
              <CreditCardIcon className="h-5 w-5" />
            </span>
            <div>
              <p className="text-default-500 text-[11px] font-medium uppercase tracking-[0.12em]">
                {t('billing_label')}
              </p>
              <p className="text-foreground mt-1 text-base font-semibold">
                {t('billing_title')}
              </p>
              <p className="text-default-500 mt-1 text-sm">
                {t('billing_description')}
              </p>
              <div className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
                <div>
                  <p className="text-default-500 text-[11px] font-medium uppercase tracking-[0.12em]">
                    {t('billing_name_label')}
                  </p>
                  <p className="text-foreground mt-1 font-medium">
                    {billingDetails?.name || t('billing_not_available')}
                  </p>
                </div>
                <div>
                  <p className="text-default-500 text-[11px] font-medium uppercase tracking-[0.12em]">
                    {t('billing_email_label')}
                  </p>
                  <p className="text-foreground mt-1 font-medium">
                    {billingDetails?.email || t('billing_not_available')}
                  </p>
                </div>
              </div>
              <div className="mt-3 text-sm">
                <p className="text-default-500 text-[11px] font-medium uppercase tracking-[0.12em]">
                  {t('payment_method_label')}
                </p>
                <p className="text-foreground mt-1 font-medium">
                  {cardLabel}
                  {cardExpiry ? (
                    <span className="text-default-500 font-normal">
                      {' '}
                      · {cardExpiry}
                    </span>
                  ) : null}
                </p>
              </div>
            </div>
          </div>
        </div>
      </CardBody>
    </Card>
  );
}
