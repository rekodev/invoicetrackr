'use client';

import {
  BillingInterval,
  BillingUrlResponse,
  User
} from '@invoicetrackr/types';
import {
  Button,
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  cn
} from '@heroui/react';
import { CheckIcon, SparklesIcon } from '@heroicons/react/24/outline';
import type { ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useTranslations } from 'next-intl';

import {
  createBillingPortalSession,
  createCheckoutSession,
  resumeSubscription,
  startTrial
} from '@/api/payment';
import { ApiResponse } from '@/api/api-instance';
import { isResponseError } from '@/lib/utils/error';
import { updateSessionAction } from '@/lib/actions';

import AuthCardHeader from './auth/auth-card-header';

type Props = {
  cardHeaderDescription?: string;
  cardHeaderTitle?: string;
  headerContent?: ReactNode;
  isOnboardingCard?: boolean;
  user?: User;
  onTrialStarted?: () => void | Promise<void>;
};

type PaymentAction = 'trial' | 'checkout' | 'portal' | 'resume';

const reusableCheckoutStatuses = new Set([
  'canceled',
  'incomplete_expired',
  'unpaid'
]);

export default function PaymentForm({
  cardHeaderDescription,
  cardHeaderTitle,
  headerContent,
  isOnboardingCard = false,
  user,
  onTrialStarted
}: Props) {
  const t = useTranslations('components.payment_form');
  const router = useRouter();
  const [loadingAction, setLoadingAction] = useState<PaymentAction>();
  const [error, setError] = useState<string>();
  const [selectedInterval, setSelectedInterval] =
    useState<BillingInterval>('annual');

  if (!user?.id) return null;

  const run = async (
    actionKey: PaymentAction,
    action: () => Promise<ApiResponse<BillingUrlResponse>>
  ) => {
    setLoadingAction(actionKey);
    setError(undefined);

    const response = await action();

    if (isResponseError(response)) {
      setError(response.data.message);
      setLoadingAction(undefined);
      return;
    }

    window.location.assign(response.data.url);
  };

  const startFreeTrial = async () => {
    setLoadingAction('trial');
    setError(undefined);

    const response = await startTrial(user.id!, selectedInterval);

    if (isResponseError(response)) {
      setError(response.data.message);
      setLoadingAction(undefined);
      return;
    }

    if (onTrialStarted) {
      await onTrialStarted();
      return;
    }

    await updateSessionAction({
      newSession: {
        isOnboarded: !!response.data.billing.onboardingCompletedAt,
        ...response.data.billing
      }
    });

    router.refresh();
  };

  const resumePausedSubscription = async () => {
    setLoadingAction('resume');
    setError(undefined);

    const response = await resumeSubscription(user.id!);

    if (isResponseError(response)) {
      setError(response.data.message);
      setLoadingAction(undefined);
      return;
    }

    await updateSessionAction({
      newSession: {
        isOnboarded: !!response.data.billing.onboardingCompletedAt,
        ...response.data.billing
      }
    });
    router.refresh();
  };

  const subscriptionStatus = user.subscriptionStatus;
  const isPaused = subscriptionStatus === 'paused';
  const canStartTrial = !user.trialStartedAt && !subscriptionStatus;
  const canStartCheckout =
    canStartTrial ||
    (subscriptionStatus && reusableCheckoutStatuses.has(subscriptionStatus));
  const isBusy = !!loadingAction;
  const selectedPrice = t.raw(`prices.${selectedInterval}`) as {
    amount: string;
    interval: string;
    note: string;
  };
  const billingIntervals = [
    {
      key: 'annual',
      title: t('intervals.annual.title'),
      description: t('intervals.annual.description'),
      badge: t('intervals.annual.badge')
    },
    {
      key: 'monthly',
      title: t('intervals.monthly.title'),
      description: t('intervals.monthly.description')
    }
  ] as const;
  const features = [
    t('features.invoices'),
    t('features.clients'),
    t('features.branding'),
    t('features.support')
  ];

  return (
    <Card
      className={cn(
        'relative h-full w-full overflow-hidden border',
        isOnboardingCard
          ? 'bg-transparent'
          : 'border-default-100 bg-default-50/70 dark:bg-default-50/5 shadow-sm'
      )}
    >
      {!isOnboardingCard && (
        <>
          <div
            aria-hidden
            className="bg-secondary/20 pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full blur-3xl"
          />
          <div
            aria-hidden
            className="bg-secondary/10 pointer-events-none absolute -bottom-28 -left-24 h-72 w-72 rounded-full blur-3xl"
          />
        </>
      )}

      {isOnboardingCard && cardHeaderTitle && cardHeaderDescription ? (
        <AuthCardHeader
          title={cardHeaderTitle}
          description={cardHeaderDescription}
        >
          {headerContent}
        </AuthCardHeader>
      ) : headerContent ? (
        <div className="relative border-b px-8 py-5 md:px-10">
          {headerContent}
        </div>
      ) : null}

      <div
        className={cn(
          'relative grid h-full',
          !isOnboardingCard && 'md:grid-cols-[1.05fr_0.95fr]'
        )}
      >
        <div
          className={cn(
            'flex h-full flex-col p-8',
            isOnboardingCard ? 'pb-0' : 'md:px-10 md:pb-10'
          )}
        >
          <CardHeader className="p-0">
            <div className="flex flex-col items-start">
              <div className="border-secondary/30 bg-secondary/10 text-secondary inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium uppercase tracking-wider">
                <SparklesIcon className="h-3.5 w-3.5" />
                {t('badge')}
              </div>
              <h2
                className={cn(
                  'text-foreground mt-4 font-semibold leading-tight tracking-tight',
                  isOnboardingCard ? 'text-2xl' : 'text-4xl'
                )}
              >
                {t('headline')}{' '}
                <span className="text-secondary">{t('headline_accent')}</span>
              </h2>
            </div>
          </CardHeader>

          <CardContent className="gap-5 p-0 pt-4">
            <p className="text-muted max-w-md text-sm leading-6">
              {canStartTrial
                ? t('trial_description')
                : t('recovery_description')}
            </p>
            <ul className="space-y-2.5">
              {features.map((feature) => (
                <li
                  key={feature}
                  className="text-foreground/90 flex items-center gap-2.5 text-sm"
                >
                  <span className="bg-secondary/15 text-secondary grid h-5 w-5 place-items-center rounded-full">
                    <CheckIcon className="h-3 w-3" strokeWidth={3} />
                  </span>
                  {feature}
                </li>
              ))}
            </ul>
          </CardContent>
        </div>

        <div
          className={cn(
            'flex h-full flex-col p-8',
            isOnboardingCard ? 'pt-6' : 'md:px-10 md:pb-10 md:pt-20'
          )}
        >
          {canStartCheckout && (
            <div className="border-default-200 bg-background/70 mb-5 grid grid-cols-2 gap-2 rounded-xl border p-1">
              {billingIntervals.map((interval) => {
                const isSelected = selectedInterval === interval.key;

                return (
                  <button
                    key={interval.key}
                    type="button"
                    aria-pressed={isSelected}
                    className={cn(
                      'relative min-h-20 rounded-lg px-3 py-2 text-left transition',
                      'focus-visible:outline-secondary focus-visible:outline focus-visible:outline-offset-2',
                      isSelected
                        ? 'bg-secondary text-secondary-foreground shadow-sm'
                        : 'text-foreground hover:bg-default-100'
                    )}
                    onClick={() => setSelectedInterval(interval.key)}
                  >
                    <span className="block text-sm font-semibold">
                      {interval.title}
                    </span>
                    <span
                      className={cn('mt-1 block text-xs leading-4', {
                        'text-secondary-foreground/80': isSelected,
                        'text-muted': !isSelected
                      })}
                    >
                      {interval.description}
                    </span>
                    {'badge' in interval && (
                      <span
                        className={cn(
                          'mt-2 inline-flex rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider',
                          isSelected
                            ? 'text-secondary-foreground bg-white/20'
                            : 'bg-secondary/10 text-secondary'
                        )}
                      >
                        {interval.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          )}
          <div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-foreground text-4xl font-semibold leading-none tracking-tight">
                {selectedPrice.amount}
              </span>
              <span className="text-muted text-sm">
                {selectedPrice.interval}
              </span>
            </div>
            <p className="text-muted mt-1 text-xs uppercase tracking-wider">
              {selectedPrice.note}
            </p>
          </div>

          {error && <p className="text-danger mt-5 text-sm">{error}</p>}

          <CardFooter className="flex flex-col gap-3 p-0 pt-7">
            {canStartTrial ? (
              <>
                <Button
                  size="lg"
                  className="w-full font-medium"
                  isDisabled={isBusy && loadingAction !== 'checkout'}
                  isPending={loadingAction === 'checkout'}
                  onPress={() =>
                    run('checkout', () =>
                      createCheckoutSession(user.id!, selectedInterval)
                    )
                  }
                >
                  {t('actions.subscribe')}
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  className="w-full font-medium"
                  isDisabled={isBusy && loadingAction !== 'trial'}
                  isPending={loadingAction === 'trial'}
                  onPress={startFreeTrial}
                >
                  {t('actions.start_trial')}
                </Button>
              </>
            ) : isPaused ? (
              <>
                <Button
                  size="lg"
                  className="w-full font-medium"
                  isDisabled={isBusy && loadingAction !== 'resume'}
                  isPending={loadingAction === 'resume'}
                  onPress={resumePausedSubscription}
                >
                  {t('actions.resume')}
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  className="w-full font-medium"
                  isDisabled={isBusy && loadingAction !== 'portal'}
                  isPending={loadingAction === 'portal'}
                  onPress={() =>
                    run('portal', () => createBillingPortalSession(user.id!))
                  }
                >
                  {t('actions.manage')}
                </Button>
              </>
            ) : canStartCheckout ? (
              <Button
                size="lg"
                className="w-full font-medium"
                isDisabled={isBusy && loadingAction !== 'checkout'}
                isPending={loadingAction === 'checkout'}
                onPress={() =>
                  run('checkout', () =>
                    createCheckoutSession(user.id!, selectedInterval)
                  )
                }
              >
                {t('actions.subscribe')}
              </Button>
            ) : (
              <Button
                size="lg"
                className="w-full font-medium"
                isDisabled={isBusy && loadingAction !== 'portal'}
                isPending={loadingAction === 'portal'}
                onPress={() =>
                  run('portal', () => createBillingPortalSession(user.id!))
                }
              >
                {t('actions.manage')}
              </Button>
            )}
            <p className="text-muted pt-1 text-center text-xs">
              {t('checkout_note')}
            </p>
          </CardFooter>
        </div>
      </div>
    </Card>
  );
}
