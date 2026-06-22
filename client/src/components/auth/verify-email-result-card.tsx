'use client';

import { Card, Link, buttonVariants, cn } from '@heroui/react';
import {
  CheckCircleIcon,
  ExclamationCircleIcon,
  ShieldCheckIcon
} from '@heroicons/react/24/outline';
import { useEffect, useMemo, useRef, useState } from 'react';
import { ArrowRightIcon } from '@heroicons/react/20/solid';
import { useTranslations } from 'next-intl';

import { ACCOUNT_SETTINGS_PAGE, DASHBOARD_PAGE } from '@/lib/constants/pages';
import { verifyEmailTokenAction } from '@/lib/actions/user';

type Props = {
  status: 'pending' | 'verified' | 'already_verified' | 'error';
  token?: string;
  message?: string;
  emailVerifiedAt?: string | null;
  shouldSyncSession?: boolean;
};

export default function VerifyEmailResultCard({
  status,
  token,
  message,
  emailVerifiedAt,
  shouldSyncSession = false
}: Props) {
  const t = useTranslations('verify_email');
  const hasSubmittedVerification = useRef(false);
  const [result, setResult] = useState({
    status,
    message,
    emailVerifiedAt
  });
  const isPending = result.status === 'pending';
  const isSuccess =
    result.status === 'verified' || result.status === 'already_verified';
  const isError = result.status === 'error';
  const indicatorClass = isSuccess
    ? 'bg-success/10 ring-success/30'
    : isError
      ? 'bg-danger-500/10 ring-danger-400/30'
      : 'bg-warning/10 ring-warning/30';

  const content = useMemo(() => {
    if (result.status === 'pending') {
      return {
        title: t('pending.title'),
        description: t('pending.description')
      };
    }

    if (result.status === 'verified') {
      return {
        title: t('verified.title'),
        description: t('verified.description')
      };
    }

    if (result.status === 'already_verified') {
      return {
        title: t('already_verified.title'),
        description: t('already_verified.description')
      };
    }

    return {
      title: t('error.title'),
      description: result.message || t('error.description')
    };
  }, [result.message, result.status, t]);

  useEffect(() => {
    if (result.status !== 'pending' || !token) return;
    if (hasSubmittedVerification.current) return;

    hasSubmittedVerification.current = true;

    const verifyEmail = async () => {
      const response = await verifyEmailTokenAction({
        token,
        shouldSyncSession
      });

      if (!response.ok) {
        setResult({
          status: 'error',
          message: response.message,
          emailVerifiedAt: null
        });
        return;
      }

      setResult({
        status: response.status,
        message: response.message,
        emailVerifiedAt: response.emailVerifiedAt
      });
    };

    verifyEmail();
  }, [result.status, shouldSyncSession, token]);

  useEffect(() => {
    if (result.status !== 'pending' || token) return;

    // eslint-disable-next-line react-hooks/set-state-in-effect
    setResult({
      status: 'error',
      message: undefined,
      emailVerifiedAt: null
    });
  }, [result.status, token]);

  return (
    <Card className="relative mx-auto w-full max-w-lg overflow-hidden rounded-2xl border">
      <Card.Content className="px-8 pb-7 pt-8">
        <div className="flex items-center gap-4">
          <div
            className={`relative grid h-11 w-11 shrink-0 place-items-center rounded-xl ring-1 ${indicatorClass}`}
          >
            {isSuccess ? (
              <CheckCircleIcon
                className="text-success h-5 w-5"
                strokeWidth={2.25}
              />
            ) : isError ? (
              <ExclamationCircleIcon className="text-danger-300 h-5 w-5" />
            ) : (
              <ShieldCheckIcon className="text-warning h-5 w-5" />
            )}
          </div>

          <div className="min-w-0">
            <h1 className="mt-1 text-[19px] font-semibold tracking-tight">
              {content.title}
            </h1>

            <p className="text-muted mt-1.5 text-[13px] leading-relaxed">
              {content.description}
            </p>
          </div>
        </div>
      </Card.Content>

      <Card.Footer className="flex items-center gap-2 px-8 pb-7 pt-0">
        <Link
          href={isError ? ACCOUNT_SETTINGS_PAGE : DASHBOARD_PAGE}
          aria-disabled={isPending}
          aria-busy={isPending}
          className={buttonVariants({
            className: cn(
              'group flex flex-1 items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-[13px] font-medium transition',
              isPending && 'pointer-events-none opacity-60'
            )
          })}
        >
          {isError ? t('actions.profile') : t('actions.dashboard')}
          <ArrowRightIcon className="h-3.5 w-3.5 transition group-hover:translate-x-0.5" />
        </Link>
      </Card.Footer>
    </Card>
  );
}
