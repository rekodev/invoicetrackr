'use client';

import {
  Button,
  Card,
  CardBody,
  CardFooter,
  CardHeader,
  Input,
  Link
} from '@heroui/react';
import { type SubmitHandler, useForm } from 'react-hook-form';
import { ArrowRightIcon } from '@heroicons/react/20/solid';
import { ExclamationCircleIcon } from '@heroicons/react/24/outline';
import type { FormEvent } from 'react';
import { useState } from 'react';
import { useTranslations } from 'next-intl';

import { FORGOT_PASSWORD_PAGE, SIGN_UP_PAGE } from '@/lib/constants/pages';
import { authenticateAction } from '@/lib/actions';

type LoginFormModel = {
  email: string;
  password: string;
};

export default function LoginForm() {
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
    <Card
      className="dark:border-default-100 mx-auto w-full max-w-lg dark:border"
      isBlurred
    >
      <CardHeader className="p-8 pb-0">
        <h1 className="text-3xl font-medium">{t('title')}</h1>
      </CardHeader>
      <CardBody className="p-8 pb-0">
        <form onSubmit={handleFormSubmit} className="flex flex-col gap-4">
          <Input
            {...register('email', {
              onChange: () => {
                clearErrors('email');
                setErrorMessage(undefined);
              }
            })}
            labelPlacement="outside"
            variant="faded"
            id="email"
            label={t('email')}
            placeholder={t('email_placeholder')}
            isInvalid={!!errors.email}
            errorMessage={errors.email?.message}
          />
          <Input
            {...register('password', {
              onChange: () => {
                clearErrors('password');
                setErrorMessage(undefined);
              }
            })}
            labelPlacement="outside"
            variant="faded"
            id="password"
            type="password"
            label={t('password')}
            placeholder={t('password_placeholder')}
            isInvalid={!!errors.password}
            errorMessage={errors.password?.message}
          />
          <Button
            className="w-full justify-between"
            aria-disabled={isSubmitting}
            isLoading={isSubmitting}
            type="submit"
            endContent={<ArrowRightIcon className="h-5 w-5" />}
            color="secondary"
          >
            {t('submit')}
          </Button>
          <div aria-live="polite" aria-atomic="true">
            {errorMessage && (
              <div className="mb-6 flex items-center gap-1">
                <ExclamationCircleIcon className="h-5 w-5 text-red-500" />
                <p className="text-sm text-red-500">{errorMessage}</p>
              </div>
            )}
          </div>
        </form>
      </CardBody>
      <CardFooter className="flex flex-col items-center justify-center gap-1 pb-8 pt-0">
        <Link color="secondary" href={FORGOT_PASSWORD_PAGE}>
          {t('forgot_password')}
        </Link>
        <div className="flex gap-1">
          <p className="text-md">{t('need_account')}</p>{' '}
          <Link color="secondary" href={SIGN_UP_PAGE}>
            {t('sign_up_link')}
          </Link>
        </div>
      </CardFooter>
    </Card>
  );
}
