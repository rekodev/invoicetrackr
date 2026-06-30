'use client';

import { Alert, Button, Card, Chip, Separator } from '@heroui/react';
import {
  ArrowTopRightOnSquareIcon,
  BuildingLibraryIcon,
  CheckCircleIcon,
  ClockIcon,
  CreditCardIcon,
  IdentificationIcon
} from '@heroicons/react/24/outline';
import { useEffect, useRef, useState } from 'react';
import type { MerchantPaymentStatus } from '@invoicetrackr/types';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';

import IconContainer from '@/components/ui/icon-container';
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
  const StatusChipIcon = isReady ? CheckCircleIcon : ClockIcon;
  const statusChipColor: 'success' | 'warning' | 'default' = isReady
    ? 'success'
    : hasOpenRequirements
      ? 'warning'
      : 'default';
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
    <Card className="w-full border">
      <Card.Header className="flex flex-col items-start justify-between gap-6 px-6 py-4 md:flex-row md:items-start md:gap-12">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <Card.Title className="text-2xl">{t('title')}</Card.Title>
            <Chip color={statusChipColor} variant="soft">
              <StatusChipIcon className="h-3.5 w-3.5" />
              {t(`status.${statusKey}`)}
            </Chip>
          </div>
          <Card.Description className="mt-2">
            {isReady ? t('description_ready') : t('description')}
          </Card.Description>
        </div>
        <div className="flex w-full flex-col items-stretch gap-2 md:w-auto md:items-end">
          <Button
            className="w-full md:w-auto"
            variant={isReady ? 'secondary' : 'primary'}
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
            <span className="text-muted text-left text-[11px] md:text-right">
              {accountReference}
            </span>
          )}
        </div>
      </Card.Header>

      <Separator />

      <Card.Content className="flex flex-col gap-4 p-6">
        <div className="flex items-center justify-between gap-4">
          <Card.Title className="text-xl">{t('capabilities_title')}</Card.Title>
          <Chip size="sm" variant="soft">
            {t('capabilities_ready_count', { ready: readyCount, total: 3 })}
          </Chip>
        </div>
        <div className="grid gap-3">
          {checks.map(({ key, enabled, icon: Icon }) => {
            return (
              <Card variant="secondary" className="border" key={key}>
                <Card.Content className="flex flex-row items-start gap-3">
                  <IconContainer>
                    <Icon className="h-4 w-4" />
                  </IconContainer>
                  <div className="w-full min-w-0">
                    <div className="flex flex-col items-start gap-2 sm:flex-row sm:items-center">
                      <p className="text-foreground text-sm font-semibold leading-5">
                        {t(`checks.${key}.title`)}
                      </p>
                      <Chip
                        color={enabled ? 'success' : 'warning'}
                        variant="soft"
                        className="shrink-0 text-xs"
                      >
                        {enabled ? t('checks.ready') : t('checks.pending')}
                      </Chip>
                    </div>
                    <p className="text-muted mt-2 text-xs leading-5">
                      {enabled
                        ? t(`checks.${key}.ready_meta`)
                        : t(`checks.${key}.pending_meta`)}
                    </p>
                  </div>
                </Card.Content>
              </Card>
            );
          })}
        </div>

        {!isReady && isConnected && (
          <Alert status={hasOpenRequirements ? 'warning' : 'default'}>
            <Alert.Indicator />
            <Alert.Content>
              <p className="text-foreground font-medium">
                {hasOpenRequirements
                  ? t('requirements_title')
                  : t('verification_title')}
              </p>
              <Alert.Description>
                {hasOpenRequirements
                  ? t('requirements_description')
                  : hasPendingVerification
                    ? t('verification_description')
                    : t('no_requirements')}
              </Alert.Description>
            </Alert.Content>
          </Alert>
        )}
      </Card.Content>
    </Card>
  );
}
