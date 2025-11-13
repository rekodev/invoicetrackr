'use client';

import { ArrowLeftIcon, ArrowRightIcon } from '@heroicons/react/20/solid';
import {
  Button,
  Card,
  CardBody,
  CardFooter,
  CardHeader,
  Input,
  Link,
  cn
} from '@heroui/react';
import {
  CheckCircleIcon,
  ExclamationCircleIcon
} from '@heroicons/react/24/outline';
import { useActionState } from 'react';
import { useTranslations } from 'next-intl';

import { FORGOT_PASSWORD_PAGE, SIGN_UP_PAGE } from '@/lib/constants/pages';
import { ActionResponseModel } from '@/lib/types/action';
import { resetPasswordAction } from '@/lib/actions';

export default function ForgotPasswordForm() {
  const t = useTranslations('forgot_password');
  const [response, formAction, isPending] = useActionState(
    (prevState: ActionResponseModel | undefined, formData: FormData) =>
      resetPasswordAction(prevState, formData.get('email') as string),
    undefined
  );

  return (
    <Card
      className="mx-auto w-full max-w-lg dark:border dark:border-neutral-800"
      isBlurred
    >
      <CardHeader className="p-8 pb-0">
        <h1 className="text-3xl font-medium">{t('card_header')}</h1>
      </CardHeader>
      <CardBody className="p-8 pb-0">
        <form action={formAction} className="flex flex-col gap-4">
          <Input
            labelPlacement="outside"
            variant="faded"
            id="email"
            name="email"
            label={t('email')}
            placeholder={t('email_placeholder')}
          />
          <Button
            className="w-full justify-between"
            aria-disabled={isPending}
            isLoading={isPending}
            type="submit"
            endContent={<ArrowRightIcon className="h-5 w-5" />}
            color="secondary"
          >
            {t('reset_link')}
          </Button>
          <div aria-live="polite" aria-atomic="true">
            {response?.message && (
              <div className="mb-6 flex items-center gap-1">
                {response.ok ? (
                  <CheckCircleIcon className="text-success-400 h-5 w-5" />
                ) : (
                  <ExclamationCircleIcon className="h-5 w-5 text-rose-500" />
                )}
                <p
                  className={cn('text-sm', {
                    'text-success-400': response.ok,
                    'text-rose-500': !response.ok
                  })}
                >
                  {response.message}
                </p>
              </div>
            )}
          </div>
        </form>
      </CardBody>
      <CardFooter className="flex flex-col items-center justify-center gap-1 pb-8 pt-0">
        <Link color="secondary" href={FORGOT_PASSWORD_PAGE}>
          <ArrowLeftIcon className="mr-1 h-4 w-4" /> {t('login')}
        </Link>
        <div className="flex gap-1">
          <p className="text-md">{t('create_account')}</p>
          <Link color="secondary" href={SIGN_UP_PAGE}>
            {t('sign_up')}
          </Link>
        </div>
      </CardFooter>
    </Card>
  );
}
