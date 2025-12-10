'use client';

import {
  Button,
  Card,
  CardBody,
  CardFooter,
  CardHeader,
  cn
} from '@heroui/react';
import { User } from 'next-auth';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useTranslations } from 'next-intl';

import { RENEW_SUBSCRIPTION_PAGE } from '@/lib/constants/pages';
import { hasActiveSubscription } from '@/lib/utils/subscription';

import CancelSubscriptionModal from './cancel-subscription-modal';

type Props = {
  user: User;
  currency: string;
};

export default function SubscriptionStatusCard({ user, currency }: Props) {
  const t = useTranslations('profile.account_settings.subscription');
  const router = useRouter();
  const [isCancelSubscriptionModalOpen, setIsCancelSubscriptionModalOpen] =
    useState(false);

  const isActive = hasActiveSubscription(user);

  const handleClick = () => {
    if (isActive) {
      setIsCancelSubscriptionModalOpen(true);

      return;
    }

    router.push(RENEW_SUBSCRIPTION_PAGE);
  };

  return (
    <>
      <Card className="border-default-200 bg-default-100 border-2 shadow-sm">
        <CardHeader>{t('title')}</CardHeader>
        <CardBody className="gap-6">
          <div>
            <div className="flex items-center gap-2">
              <div
                className={cn('bg-success-500 h-2 w-2 rounded-full', {
                  'bg-danger-500': !isActive
                })}
              />{' '}
              <p>{isActive ? t('status.active') : t('status.inactive')}</p>
            </div>
            <p className="text-default-500 text-sm">
              {t('plan', {
                plan: 'Premium',
                currency,
                amount: '4.99',
                interval: t('interval.month')
              })}
            </p>
          </div>
        </CardBody>
        <CardFooter>
          <Button
            onPress={handleClick}
            className="w-full"
            size="sm"
            variant="bordered"
            color={isActive ? 'danger' : 'warning'}
          >
            {isActive ? t('action.cancel') : t('action.renew')}
          </Button>
        </CardFooter>
      </Card>

      <CancelSubscriptionModal
        user={user}
        isOpen={isCancelSubscriptionModalOpen}
        onClose={() => setIsCancelSubscriptionModalOpen(false)}
      />
    </>
  );
}
