'use client';

import {
  ArrowRightIcon,
  ExclamationCircleIcon
} from '@heroicons/react/24/outline';
import {
  Button,
  Card,
  CardContent,
  CardFooter,
  FieldError,
  Input,
  Label,
  Link,
  TextField
} from '@heroui/react';
import { type SubmitHandler, useForm } from 'react-hook-form';
import type { FormEvent } from 'react';
import { useState } from 'react';
import { useTranslations } from 'next-intl';

import { FORGOT_PASSWORD_PAGE, SIGN_UP_PAGE } from '@/lib/constants/pages';
import AuthCardHeader from '@/components/auth/auth-card-header';
import { authenticateAction } from '@/lib/actions';

type LoginFormModel = {
  email: string;
  password: string;
};

export default function LoginForm() {
  const pageT = useTranslations('login');
  const t = useTranslations('login.form');
  const {
    register,
    handleSubmit,
    clearErrors,
    formState: { errors, isSubmitting }
  } = useForm<LoginFormModel>({
    defaultValues: {
      email: '',
      password: ''
    }
  });
  const [errorMessage, setErrorMessage] = useState<string>();

  const onSubmit: SubmitHandler<LoginFormModel> = async (data) => {
    setErrorMessage(undefined);

    const formData = new FormData();
    formData.append('email', data.email);
    formData.append('password', data.password);

    const response = await authenticateAction(undefined, formData);
    setErrorMessage(response);
  };

  const handleFormSubmit = async (event: FormEvent<HTMLFormElement>) => {
    clearErrors();
    setErrorMessage(undefined);

    return handleSubmit(onSubmit)(event);
  };

  return (
    <Card className="mx-auto w-full max-w-lg border">
      <AuthCardHeader
        title={pageT('welcome')}
        description={pageT('subtitle')}
      />
      <CardContent className="p-8 pb-0">
        <form onSubmit={handleFormSubmit} className="flex flex-col gap-4">
          <TextField variant="secondary" isInvalid={!!errors.email}>
            <Label>{t('email')}</Label>
            <Input
              {...register('email', {
                onChange: () => {
                  clearErrors('email');
                  setErrorMessage(undefined);
                }
              })}
              id="email"
              placeholder={t('email_placeholder')}
            />
            <FieldError>{errors.email?.message}</FieldError>
          </TextField>
          <TextField variant="secondary" isInvalid={!!errors.password}>
            <Label>{t('password')}</Label>
            <Input
              {...register('password', {
                onChange: () => {
                  clearErrors('password');
                  setErrorMessage(undefined);
                }
              })}
              id="password"
              type="password"
              placeholder={t('password_placeholder')}
            />
            <FieldError>{errors.password?.message}</FieldError>
          </TextField>
          <Button
            className="w-full justify-between"
            aria-disabled={isSubmitting}
            type="submit"
          >
            {t('submit')}
            <ArrowRightIcon className="h-5 w-5" />
          </Button>
          <div aria-live="polite" aria-atomic="true">
            {errorMessage && (
              <div className="mb-6 flex items-center gap-1">
                <ExclamationCircleIcon className="text-danger h-5 w-5" />
                <p className="text-danger text-sm">{errorMessage}</p>
              </div>
            )}
          </div>
        </form>
      </CardContent>
      <CardFooter className="flex flex-col items-center justify-center gap-1 pb-8 pt-0">
        <Link
          href={FORGOT_PASSWORD_PAGE}
          className="text-accent text-sm font-medium decoration-current underline-offset-4 hover:underline"
        >
          {t('forgot_password')}
        </Link>
        <div className="flex gap-1 text-sm">
          <p className="text-muted">{t('need_account')}</p>{' '}
          <Link
            href={SIGN_UP_PAGE}
            className="text-accent font-medium decoration-current underline-offset-4 hover:underline"
          >
            {t('sign_up_link')}
          </Link>
        </div>
      </CardFooter>
    </Card>
  );
}
