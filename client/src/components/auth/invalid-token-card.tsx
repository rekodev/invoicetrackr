'use client';

import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  Link,
  buttonVariants
} from '@heroui/react';
import { ArrowRightIcon } from '@heroicons/react/20/solid';
import NextLink from 'next/link';
import { useTranslations } from 'next-intl';

import { FORGOT_PASSWORD_PAGE, LOGIN_PAGE } from '@/lib/constants/pages';

export default function InvalidTokenCard() {
  const t = useTranslations('create_new_password.invalid_token');

  return (
    <Card className="mx-auto w-full max-w-lg border border-neutral-800">
      <CardHeader className="flex flex-col gap-2 p-8 pb-0">
        <h1 className="text-3xl font-medium">{t('title')}</h1>
        <p className="text-default-500 text-center">{t('description')}</p>
      </CardHeader>
      <CardContent className="p-8 pb-4">
        <NextLink
          href={FORGOT_PASSWORD_PAGE}
          className={buttonVariants({
            className: 'w-full justify-between'
          })}
        >
          {t('request_new')}
          <ArrowRightIcon className="h-5 w-5" />
        </NextLink>
      </CardContent>
      <CardFooter className="flex flex-col items-center justify-center gap-1 pb-8 pt-0">
        <div className="flex gap-1">
          <p className="text-md">{t('remember_your_password')}</p>{' '}
          <Link href={LOGIN_PAGE}>{t('sign_in')}</Link>
        </div>
      </CardFooter>
    </Card>
  );
}
