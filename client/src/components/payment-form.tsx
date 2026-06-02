'use client';

import { BillingUrlResponse, User } from '@invoicetrackr/types';
import { Button, Card, CardBody, CardFooter, CardHeader } from '@heroui/react';
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

type Props = {
  user?: User;
  onTrialStarted?: () => void | Promise<void>;
};

export default function PaymentForm({ user, onTrialStarted }: Props) {
  const t = useTranslations('components.payment_form');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>();

  if (!user?.id) return null;

  const run = async (
    action: () => Promise<ApiResponse<BillingUrlResponse>>
  ) => {
    setIsLoading(true);
    setError(undefined);

    try {
      const response = await action();

      if (isResponseError(response)) {
        setError(response.data.message);
        return;
      }

      window.location.assign(response.data.url);
    } catch {
      setError(t('errors.submit_failed'));
    } finally {
      setIsLoading(false);
    }
  };

  const startFreeTrial = async () => {
    setIsLoading(true);
    setError(undefined);

    try {
      const response = await startTrial(user.id!);

      if (isResponseError(response)) {
        setError(response.data.message);
        return;
      }

      await updateSessionAction({
        newSession: {
          isOnboarded: !!response.data.billing.onboardingCompletedAt,
          ...response.data.billing
        }
      });
      await onTrialStarted?.();
    } catch {
      setError(t('errors.submit_failed'));
    } finally {
      setIsLoading(false);
    }
  };

  const resumePausedSubscription = async () => {
    setIsLoading(true);
    setError(undefined);

    try {
      const response = await resumeSubscription(user.id!);

      if (isResponseError(response)) {
        setError(response.data.message);
        return;
      }

      await updateSessionAction({
        newSession: {
          isOnboarded: !!response.data.billing.onboardingCompletedAt,
          ...response.data.billing
        }
      });
      window.location.reload();
    } catch {
      setError(t('errors.submit_failed'));
    } finally {
      setIsLoading(false);
    }
  };

  const isPaused = user.subscriptionStatus === 'paused';
  const canStartTrial = !user.trialStartedAt && !user.stripeSubscriptionId;

  return (
    <Card className="border-default-200 w-full max-w-xl border bg-transparent">
      <CardHeader className="text-xl font-semibold">{t('title')}</CardHeader>
      <CardBody className="gap-3">
        <p className="text-default-500 text-sm">
          {canStartTrial ? t('trial_description') : t('recovery_description')}
        </p>
        {error && <p className="text-danger text-sm">{error}</p>}
      </CardBody>
      <CardFooter className="flex flex-wrap gap-3">
        {canStartTrial ? (
          <Button
            color="secondary"
            isLoading={isLoading}
            onPress={startFreeTrial}
          >
            {t('actions.start_trial')}
          </Button>
        ) : isPaused ? (
          <>
            <Button
              color="secondary"
              isLoading={isLoading}
              onPress={resumePausedSubscription}
            >
              {t('actions.resume')}
            </Button>
            <Button
              variant="bordered"
              isLoading={isLoading}
              onPress={() => run(() => createBillingPortalSession(user.id!))}
            >
              {t('actions.manage')}
            </Button>
          </>
        ) : user.subscriptionStatus === 'canceled' ||
          user.subscriptionStatus === 'incomplete_expired' ? (
          <Button
            color="secondary"
            isLoading={isLoading}
            onPress={() => run(() => createCheckoutSession(user.id!))}
          >
            {t('actions.subscribe')}
          </Button>
        ) : (
          <Button
            color="secondary"
            isLoading={isLoading}
            onPress={() => run(() => createBillingPortalSession(user.id!))}
          >
            {t('actions.manage')}
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}
