'use client';

import {
  Card,
  CardContent,
  CardFooter,
  Link,
  buttonVariants
} from '@heroui/react';
import { ArrowRightIcon } from '@heroicons/react/20/solid';
import { useTranslations } from 'next-intl';

import { FORGOT_PASSWORD_PAGE, LOGIN_PAGE } from '@/lib/constants/pages';
import AuthCardHeader from '@/components/auth/auth-card-header';

export default function InvalidTokenCard() {
  const t = useTranslations('create_new_password.invalid_token');

  return (
    <Card className="mx-auto w-full max-w-lg border border-neutral-800">
      <AuthCardHeader title={t('title')} description={t('description')} />
      <CardContent className="p-8 pb-4">
        <Link
          href={FORGOT_PASSWORD_PAGE}
          className={buttonVariants({
            className: 'w-full justify-between'
          })}
        >
          {t('request_new')}
          <ArrowRightIcon className="h-5 w-5" />
        </Link>
      </CardContent>
      <CardFooter className="flex flex-col items-center justify-center gap-1 pb-8 pt-0">
        <div className="flex gap-1 text-sm">
          <p className="text-muted">{t('remember_your_password')}</p>{' '}
          <Link
            href={LOGIN_PAGE}
            className="text-accent font-medium decoration-current underline-offset-4 hover:underline"
          >
            {t('sign_in')}
          </Link>
        </div>
      </CardFooter>
    </Card>
  );
}
