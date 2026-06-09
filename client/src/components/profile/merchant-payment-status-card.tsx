'use client';

import {
  ArrowTopRightOnSquareIcon,
  BanknotesIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';
import { Button, Card, CardBody, CardHeader } from '@heroui/react';
import type { MerchantPaymentStatus } from '@invoicetrackr/types';
import { useState } from 'react';
import { useTranslations } from 'next-intl';

import { createMerchantPaymentOnboardingSession } from '@/api/payment';
import { isResponseError } from '@/lib/utils/error';

type Props = {
  userId: number;
  merchantPayment?: MerchantPaymentStatus;
};

export default function MerchantPaymentStatusCard({
  userId,
  merchantPayment
}: Props) {
  const t = useTranslations('profile.merchant_payments');
  const [isLoading, setIsLoading] = useState(false);
  const isReady = !!merchantPayment?.ready;
  const checks: Array<{
    key: 'charges' | 'details' | 'payouts';
    enabled?: boolean;
  }> = [
    { key: 'charges', enabled: merchantPayment?.chargesEnabled },
    { key: 'details', enabled: merchantPayment?.detailsSubmitted },
    { key: 'payouts', enabled: merchantPayment?.payoutsEnabled }
  ];

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
      <CardHeader className="border-default-100 flex flex-col items-start justify-between gap-4 border-b p-6 md:flex-row md:items-center">
        <div>
          <div className="text-default-500 flex items-center gap-2 text-[11px] font-medium uppercase tracking-[0.12em]">
            <BanknotesIcon className="h-4 w-4" />
            {t('eyebrow')}
          </div>
          <h2 className="text-foreground mt-3 text-xl font-semibold">
            {t('title')}
          </h2>
          <p className="text-default-500 mt-2 max-w-2xl text-sm leading-6">
            {isReady ? t('description_ready') : t('description')}
          </p>
        </div>
        <Button
          className="w-full md:w-auto"
          color={isReady ? 'secondary' : 'primary'}
          variant={isReady ? 'bordered' : 'solid'}
          isLoading={isLoading}
          onPress={handleOnboarding}
          endContent={
            !isLoading && <ArrowTopRightOnSquareIcon className="h-4 w-4" />
          }
        >
          {isReady ? t('action_update') : t('action_start')}
        </Button>
      </CardHeader>
      <CardBody className="grid gap-4 p-6 sm:grid-cols-3">
        {checks.map(({ key, enabled }) => (
          <div className="flex items-start gap-3" key={key}>
            <span className="bg-success/10 text-success grid h-9 w-9 shrink-0 place-items-center rounded-lg">
              <CheckCircleIcon className="h-5 w-5" />
            </span>
            <div>
              <p className="text-foreground text-sm font-semibold">
                {t(`checks.${key}.title`)}
              </p>
              <p className="text-default-500 mt-1 text-sm">
                {enabled ? t('checks.ready') : t('checks.pending')}
              </p>
            </div>
          </div>
        ))}
      </CardBody>
    </Card>
  );
}
