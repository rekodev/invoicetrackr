'use client';

import { usePathname, useRouter } from 'next/navigation';
import { useEffect } from 'react';

import PaymentForm from '@/components/payment-form';
import { RENEW_SUBSCRIPTION_PAGE } from '@/lib/constants/pages';
import { UserModel } from '@/lib/types/models/user';

type Props = {
  user: UserModel;
};

export default function RenewSubscription({ user }: Props) {
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (pathname === RENEW_SUBSCRIPTION_PAGE) return;

    router.push(RENEW_SUBSCRIPTION_PAGE);
  }, [pathname, router]);

  return (
    <section className="mx-auto w-full">
      <div className="mb-8 flex flex-col items-center justify-center gap-4">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
          Your subscription is no longer active
        </h1>
        <p className="text-lg text-default-500">
          Please renew your subscription to continue accessing all features and
          services.
        </p>
      </div>
      <PaymentForm user={user} />
    </section>
  );
}
