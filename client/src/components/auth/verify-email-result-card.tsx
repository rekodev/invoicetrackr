'use client';

import {
  Card,
  CardContent,
  CardFooter,
  Link,
  buttonVariants
} from '@heroui/react';
import {
  CheckCircleIcon,
  ExclamationCircleIcon
} from '@heroicons/react/24/outline';
import { useEffect, useMemo } from 'react';
import { ArrowRightIcon } from '@heroicons/react/20/solid';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';

import { ACCOUNT_SETTINGS_PAGE, DASHBOARD_PAGE } from '@/lib/constants/pages';
import AuthCardHeader from '@/components/auth/auth-card-header';
import { updateSessionAction } from '@/lib/actions';

type Props = {
  status: 'verified' | 'already_verified' | 'error';
  message?: string;
  emailVerifiedAt?: string | null;
  shouldSyncSession?: boolean;
};

export default function VerifyEmailResultCard({
  status,
  message,
  emailVerifiedAt,
  shouldSyncSession = false
}: Props) {
  const t = useTranslations('verify_email');
  const router = useRouter();
  const isSuccess = status !== 'error';
  const title = useMemo(() => {
    if (status === 'verified') return t('verified.title');
    if (status === 'already_verified') return t('already_verified.title');

    return t('error.title');
  }, [status, t]);
  const description = useMemo(() => {
    if (status === 'verified') return t('verified.description');
    if (status === 'already_verified') {
      return t('already_verified.description');
    }

    return message || t('error.description');
  }, [message, status, t]);

  useEffect(() => {
    if (!emailVerifiedAt || !shouldSyncSession) return;

    updateSessionAction({
      newSession: {
        emailVerifiedAt
      }
    }).then(() => router.refresh());
  }, [emailVerifiedAt, router, shouldSyncSession]);

  return (
    <Card className="mx-auto w-full max-w-lg border border-neutral-800">
      <AuthCardHeader title={title} description={description} />
      <CardContent className="flex flex-col items-center gap-4 p-8 pb-4 text-center">
        {isSuccess ? (
          <CheckCircleIcon className="text-success-500 h-12 w-12" />
        ) : (
          <ExclamationCircleIcon className="text-danger-500 h-12 w-12" />
        )}
      </CardContent>
      <CardFooter className="flex flex-col items-center justify-center gap-3 pb-8 pt-0">
        <Link
          href={isSuccess ? DASHBOARD_PAGE : ACCOUNT_SETTINGS_PAGE}
          className={buttonVariants({
            className: 'w-full justify-between'
          })}
        >
          {isSuccess ? t('actions.dashboard') : t('actions.account_settings')}
          <ArrowRightIcon className="h-5 w-5" />
        </Link>
      </CardFooter>
    </Card>
  );
}
