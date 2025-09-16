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
import { User } from 'next-auth';
import { useState } from 'react';

import { RENEW_SUBSCRIPTION_PAGE } from '@/lib/constants/pages';

import CancelSubscriptionModal from './cancel-subscription-modal';

type Props = {
  user: User;
  isActive: boolean;
  currency: string;
};

export default function SubscriptionStatusCard({
  user,
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
      <Card className="border-default-200 bg-default-100 border-2 shadow-sm">
        <CardHeader>Subscription Status</CardHeader>
        <CardBody className="gap-6">
          <div>
            <div className="flex items-center gap-2">
              <div
                className={cn('bg-success-500 h-2 w-2 rounded-full', {
                  'bg-danger-500': !isActive
                })}
              />{' '}
              <p>{isActive ? 'Active' : 'Inactive'}</p>
            </div>
            <p className="text-default-500 text-sm">
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
        user={user}
        isOpen={isCancelSubscriptionModalOpen}
        onClose={() => setIsCancelSubscriptionModalOpen(false)}
      />
    </>
  );
}
