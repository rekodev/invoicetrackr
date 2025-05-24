'use client';

import {
  Button,
  Card,
  CardBody,
  CardFooter,
  CardHeader,
  cn
} from '@heroui/react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

import { RENEW_SUBSCRIPTION_PAGE } from '@/lib/constants/pages';

import CancelSubscriptionModal from './cancel-subscription-modal';

type Props = {
  userId: number;
  isActive: boolean;
  currency: string;
};

export default function SubscriptionStatusCard({
  userId,
  isActive,
  currency
}: Props) {
  const router = useRouter();
  const [isCancelSubscriptionModalOpen, setIsCancelSubscriptionModalOpen] =
    useState(false);

  const handleClick = () => {
    if (isActive) {
      setIsCancelSubscriptionModalOpen(true);

      return;
    }

    router.push(RENEW_SUBSCRIPTION_PAGE);
  };

  return (
    <>
      <Card className="border-2 border-default-200 bg-default-100 shadow-sm">
        <CardHeader>Subscription Status</CardHeader>
        <CardBody className="gap-6">
          <div>
            <div className="flex items-center gap-2">
              <div
                className={cn('h-2 w-2 rounded-full bg-success-500', {
                  'bg-danger-500': !isActive
                })}
              />{' '}
              <p>{isActive ? 'Active' : 'Inactive'}</p>
            </div>
            <p className="text-sm text-default-500">
              Premium Plan - {currency}4.99/month
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
            {isActive ? 'Cancel Subscription' : 'Renew Subscription'}
          </Button>
        </CardFooter>
      </Card>

      <CancelSubscriptionModal
        userId={userId}
        isOpen={isCancelSubscriptionModalOpen}
        onClose={() => setIsCancelSubscriptionModalOpen(false)}
      />
    </>
  );
}
