'use client';

import {
  ArrowTopRightOnSquareIcon,
  BanknotesIcon,
  BuildingLibraryIcon,
  CheckCircleIcon,
  ClockIcon,
  CreditCardIcon,
  IdentificationIcon
} from '@heroicons/react/24/outline';
import { Button, Card, CardContent, CardHeader } from '@heroui/react';
import { useEffect, useRef, useState } from 'react';
import type { MerchantPaymentStatus } from '@invoicetrackr/types';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';

import { createMerchantPaymentOnboardingSession } from '@/api/payment';
import { isResponseError } from '@/lib/utils/error';

type Props = {
  userId: number;
  merchantPayment?: MerchantPaymentStatus;
  refreshOnReturn?: boolean;
};

export default function MerchantPaymentStatusCard({
  userId,
  merchantPayment,
  refreshOnReturn = false
}: Props) {
  const t = useTranslations('profile.merchant_payments');
  const router = useRouter();
  const didRefreshOnReturn = useRef(false);
  const [isLoading, setIsLoading] = useState(false);
  const isReady = !!merchantPayment?.ready;
  const isConnected = !!merchantPayment?.connectedAccountId;
  const requirements = merchantPayment?.requirements;
  const hasOpenRequirements =
    !!requirements?.disabledReason ||
    !!requirements?.pastDue?.length ||
    !!requirements?.currentlyDue?.length;
  const hasPendingVerification = !!requirements?.pendingVerification?.length;
  const readyCount = [
    merchantPayment?.chargesEnabled,
    merchantPayment?.detailsSubmitted,
    merchantPayment?.payoutsEnabled
  ].filter(Boolean).length;
  const statusKey = isReady
    ? 'live'
    : isConnected && !hasOpenRequirements && hasPendingVerification
      ? 'reviewing'
      : isConnected
        ? 'action_needed'
        : 'not_connected';
  const accountReference = merchantPayment?.connectedAccountId
    ? merchantPayment.connectedAccountId.replace(/^(.{8}).+(.{4})$/, '$1....$2')
    : null;
  const checks: Array<{
    key: 'charges' | 'details' | 'payouts';
    enabled?: boolean;
    icon: typeof CreditCardIcon;
  }> = [
    {
      key: 'charges',
      enabled: merchantPayment?.chargesEnabled,
      icon: CreditCardIcon
    },
    {
      key: 'details',
      enabled: merchantPayment?.detailsSubmitted,
      icon: IdentificationIcon
    },
    {
      key: 'payouts',
      enabled: merchantPayment?.payoutsEnabled,
      icon: BuildingLibraryIcon
    }
  ];

  useEffect(() => {
    if (!refreshOnReturn || didRefreshOnReturn.current) return;

    didRefreshOnReturn.current = true;
    router.refresh();
  }, [refreshOnReturn, router]);

  const handleOnboarding = async () => {
    setIsLoading(true);
    const response = await createMerchantPaymentOnboardingSession(userId);

    if (!isResponseError(response)) {
      window.location.assign(response.data.url);
      return;
    }

    setIsLoading(false);
  };

  return (
    <Card className="border-default-100 bg-background w-full rounded-xl border shadow-sm">
      <CardHeader className="border-default-100 flex flex-col items-start justify-between gap-5 border-b p-6 md:flex-row md:items-start">
        <div className="min-w-0">
          <div className="text-default-500 flex items-center gap-2 text-[11px] font-medium uppercase tracking-[0.12em]">
            <BanknotesIcon className="h-4 w-4" />
            {t('eyebrow')}
          </div>
          <div className="mt-3 flex flex-wrap items-center gap-3">
            <h2 className="text-foreground text-2xl font-semibold leading-tight">
              {t('title')}
            </h2>
            <span
              className={
                isReady
                  ? 'border-success/30 bg-success/10 text-success inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-medium'
                  : hasOpenRequirements
                    ? 'border-warning/30 bg-warning/10 text-warning inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-medium'
                    : 'border-default-200 bg-default-100 text-default-600 inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-medium'
              }
            >
              <span
                className={
                  isReady
                    ? 'bg-success h-1.5 w-1.5 rounded-full'
                    : hasOpenRequirements
                      ? 'bg-warning h-1.5 w-1.5 rounded-full'
                      : 'bg-default-400 h-1.5 w-1.5 rounded-full'
                }
              />
              {t(`status.${statusKey}`)}
            </span>
          </div>
          <p className="text-default-500 mt-2 max-w-2xl text-sm leading-6">
            {isReady ? t('description_ready') : t('description')}
          </p>
        </div>
        <div className="flex w-full flex-col items-stretch gap-2 md:w-auto md:items-end">
          <Button
            className="w-full md:w-auto"
            variant={isReady ? 'outline' : 'primary'}
            isPending={isLoading}
            onPress={handleOnboarding}
          >
            {!isLoading && <ArrowTopRightOnSquareIcon className="h-4 w-4" />}
            {isReady
              ? t('action_update')
              : isConnected
                ? t('action_continue')
                : t('action_start')}
          </Button>
          {accountReference && (
            <span className="text-default-400 text-left text-[11px] md:text-right">
              {accountReference}
            </span>
          )}
        </div>
      </CardHeader>
      <CardContent className="flex flex-col gap-5 p-6">
        <div>
          <div className="flex items-center justify-between gap-4">
            <h3 className="text-default-500 text-[11px] font-medium uppercase tracking-[0.12em]">
              {t('capabilities_title')}
            </h3>
            <span className="text-default-500 text-[11px]">
              {t('capabilities_ready_count', { ready: readyCount, total: 3 })}
            </span>
          </div>
          <div className="mt-4 grid gap-3 md:grid-cols-3">
            {checks.map(({ key, enabled, icon: Icon }) => {
              const StatusIcon = enabled ? CheckCircleIcon : ClockIcon;

              return (
                <div
                  className="border-default-100 bg-default-50/60 flex items-center gap-3 rounded-lg border px-3.5 py-3"
                  key={key}
                >
                  <span className="bg-background text-default-600 border-default-100 grid h-9 w-9 shrink-0 place-items-center rounded-lg border">
                    <Icon className="h-4 w-4" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      <p className="text-foreground truncate text-sm font-semibold">
                        {t(`checks.${key}.title`)}
                      </p>
                      <StatusIcon
                        className={
                          enabled
                            ? 'text-success h-4 w-4 shrink-0'
                            : 'text-default-400 h-4 w-4 shrink-0'
                        }
                      />
                    </div>
                    <p className="text-default-500 mt-1 truncate text-xs">
                      {enabled
                        ? t(`checks.${key}.ready_meta`)
                        : t(`checks.${key}.pending_meta`)}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {!isReady && isConnected && (
          <div className="border-default-100 bg-default-50 rounded-lg border p-4 text-sm">
            <p className="text-foreground font-medium">
              {hasOpenRequirements
                ? t('requirements_title')
                : t('verification_title')}
            </p>
            <p className="text-default-500 mt-2 leading-6">
              {hasOpenRequirements
                ? t('requirements_description')
                : hasPendingVerification
                  ? t('verification_description')
                  : t('no_requirements')}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
