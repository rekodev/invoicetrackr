'use client';

import { ArrowLeftIcon, ArrowRightIcon } from '@heroicons/react/20/solid';
import {
  CheckCircleIcon,
  ExclamationCircleIcon
} from '@heroicons/react/24/outline';
import {
  Button,
  Card,
  CardContent,
  CardFooter,
  cn,
  FieldError,
  Input,
  Label,
  Link,
  TextField
} from '@heroui/react';
import { useTranslations } from 'next-intl';
import type { FormEvent } from 'react';
import { useState } from 'react';
import { type SubmitHandler, useForm } from 'react-hook-form';

import AuthCardHeader from '@/components/auth/auth-card-header';
import { resetPasswordAction } from '@/lib/actions';
import { LOGIN_PAGE, SIGN_UP_PAGE } from '@/lib/constants/pages';
import { ActionResponseModel } from '@/lib/types/action';

type ForgotPasswordFormModel = {
  email: string;
};

export default function ForgotPasswordForm() {
  const t = useTranslations('forgot_password');
  const {
    register,
    handleSubmit,
    clearErrors,
    formState: { errors, isSubmitting }
  } = useForm<ForgotPasswordFormModel>({
    defaultValues: {
      email: ''
    }
  });
  const [response, setResponse] = useState<ActionResponseModel>();

  const onSubmit: SubmitHandler<ForgotPasswordFormModel> = async (data) => {
    setResponse(undefined);
    setResponse(await resetPasswordAction(undefined, data.email));
  };

  const handleFormSubmit = async (event: FormEvent<HTMLFormElement>) => {
    clearErrors();
    setResponse(undefined);

    return handleSubmit(onSubmit)(event);
  };

  return (
    <Card className="mx-auto w-full max-w-lg border">
      <AuthCardHeader title={t('title')} description={t('description')} />
      <CardContent className="p-8 pb-0">
        <form onSubmit={handleFormSubmit} className="flex flex-col gap-4">
          <TextField variant="secondary" isInvalid={!!errors.email}>
            <Label>{t('email')}</Label>
            <Input
              {...register('email', {
                onChange: () => {
                  clearErrors('email');
                  setResponse(undefined);
                }
              })}
              id="email"
              placeholder={t('email_placeholder')}
            />
            <FieldError>{errors.email?.message}</FieldError>
          </TextField>
          <Button
            className="w-full justify-between"
            aria-disabled={isSubmitting}
            type="submit"
          >
            {t('reset_link')}
            <ArrowRightIcon className="h-5 w-5" />
          </Button>
          <div aria-live="polite" aria-atomic="true">
            {response?.message && (
              <div className="mb-6 flex items-center gap-1">
                {response.ok ? (
                  <CheckCircleIcon className="text-success h-5 w-5" />
                ) : (
                  <ExclamationCircleIcon className="text-danger h-5 w-5" />
                )}
                <p
                  className={cn('text-sm', {
                    'text-success': response.ok,
                    'text-danger': !response.ok
                  })}
                >
                  {response.message}
                </p>
              </div>
            )}
          </div>
        </form>
      </CardContent>
      <CardFooter className="flex flex-col items-center justify-center gap-1 pb-8 pt-0">
        <Link
          href={LOGIN_PAGE}
          className="text-accent inline-flex items-center text-sm font-medium decoration-current underline-offset-4 hover:underline"
        >
          <ArrowLeftIcon className="mr-1 h-4 w-4" /> {t('login')}
        </Link>
        <div className="flex gap-1 text-sm">
          <p className="text-muted">{t('create_account')}</p>
          <Link
            href={SIGN_UP_PAGE}
            className="text-accent font-medium decoration-current underline-offset-4 hover:underline"
          >
            {t('sign_up')}
          </Link>
        </div>
      </CardFooter>
    </Card>
  );
}
