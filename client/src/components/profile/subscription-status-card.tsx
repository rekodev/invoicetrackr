'use client';

import {
  ArrowRightIcon,
  CheckCircleIcon,
  SparklesIcon
} from '@heroicons/react/24/outline';
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
import { createBillingPortalSession } from '@/api/payment';
import { isResponseError } from '@/lib/utils/error';

type Props = {
  user: User;
  currency: string;
  showAction?: boolean;
};

export default function SubscriptionStatusCard({
  user,
  currency,
  showAction = true
}: Props) {
  const t = useTranslations('profile.account_settings.subscription');
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const isActive =
    user.subscriptionStatus === 'active' ||
    user.subscriptionStatus === 'trialing' ||
    (user.subscriptionStatus === 'past_due' &&
      !!user.subscriptionGraceEndsAt &&
      new Date(user.subscriptionGraceEndsAt) > new Date());

  const handleClick = async () => {
    if (isActive) {
      setIsLoading(true);
      const response = await createBillingPortalSession(Number(user.id));
      setIsLoading(false);
      if (!isResponseError(response)) window.location.assign(response.data.url);
      return;
    }

    router.push(RENEW_SUBSCRIPTION_PAGE);
  };

  return (
    <Card className="glass-card relative overflow-hidden rounded-2xl">
      <div
        aria-hidden
        className="bg-secondary/15 pointer-events-none absolute -right-16 -top-20 h-48 w-48 rounded-full blur-3xl"
      />
      <CardHeader className="relative flex-col items-start gap-3 pb-0">
        <div className="border-secondary/30 bg-secondary/10 text-secondary inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-medium uppercase tracking-[0.08em]">
          <SparklesIcon className="h-3.5 w-3.5" />
          {t('badge')}
        </div>
        <div>
          <p className="text-lg font-semibold">{t('title')}</p>
          <p className="text-default-500 mt-1 text-sm">
            {isActive ? t('description.active') : t('description.inactive')}
          </p>
        </div>
      </CardHeader>
      <CardBody className="relative gap-5">
        <div className="flex items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <CheckCircleIcon
                className={cn('text-success h-4 w-4', {
                  'text-danger': !isActive
                })}
              />
              <p className="text-sm font-medium">
                {isActive ? t('status.active') : t('status.inactive')}
              </p>
            </div>
            <p className="text-default-500 mt-1 text-xs">{t('access_note')}</p>
          </div>
          <div className="text-right">
            <p className="text-2xl font-semibold leading-none tracking-tight">
              {currency}4.99
            </p>
            <p className="text-default-500 mt-1 text-xs">
              /{t('interval.month')}
            </p>
          </div>
        </div>

        <div className="border-default-200 dark:bg-default-100/20 rounded-xl border bg-white/35 p-3">
          <p className="text-default-500 text-[11px] uppercase tracking-[0.1em]">
            {t('plan_label')}
          </p>
          <p className="mt-1 text-sm font-medium">
            {t('plan', {
              plan: 'Premium',
              currency,
              amount: '4.99',
              interval: t('interval.month')
            })}
          </p>
        </div>
      </CardBody>
      {showAction && (
        <CardFooter className="relative pt-0">
          <Button
            onPress={handleClick}
            isLoading={isLoading}
            className="w-full rounded-xl font-medium"
            size="sm"
            variant={isActive ? 'bordered' : 'solid'}
            color={isActive ? 'secondary' : 'warning'}
            endContent={
              !isLoading && <ArrowRightIcon className="h-3.5 w-3.5" />
            }
          >
            {isActive ? t('action.manage') : t('action.renew')}
          </Button>
        </CardFooter>
      )}
    </Card>
  );
}
