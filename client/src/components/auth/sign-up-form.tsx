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
import {
  CheckCircleIcon,
  ExclamationCircleIcon
} from '@heroicons/react/24/outline';
import { type SubmitHandler, useForm } from 'react-hook-form';
import { ArrowRightIcon } from '@heroicons/react/20/solid';
import type { FormEvent } from 'react';
import { useState } from 'react';
import { useTranslations } from 'next-intl';

import { LOGIN_PAGE } from '@/lib/constants/pages';
import { signUpAction } from '@/lib/actions';

type SignUpFormModel = {
  email: string;
  password: string;
  confirmPassword: string;
};

const initialSubmissionMessage = {
  message: '',
  ok: false
};

type SubmissionMessage = typeof initialSubmissionMessage | null;

export default function SignUpForm() {
  const t = useTranslations('sign_up.form');
  const {
    register,
    handleSubmit,
    clearErrors,
    setError,
    formState: { errors, isSubmitting }
  } = useForm<SignUpFormModel>({
    defaultValues: {
      email: '',
      password: '',
      confirmPassword: ''
    }
  });
  const [submissionMessage, setSubmissionMessage] =
    useState<SubmissionMessage>(null);

  const clearFieldState = (field: keyof SignUpFormModel) => {
    clearErrors(field);
    setSubmissionMessage(null);
  };

  const onSubmit: SubmitHandler<SignUpFormModel> = async (data) => {
    setSubmissionMessage(null);

    const formData = new FormData();
    formData.append('email', data.email);
    formData.append('password', data.password);
    formData.append('confirm-password', data.confirmPassword);

    const response = await signUpAction(initialSubmissionMessage, formData);
    if (response?.ok === false) {
      Object.entries(response.errors || {}).forEach(([key, value]) => {
        if (!value) return;

        setError(key as keyof SignUpFormModel, { message: value });
      });
      setSubmissionMessage({
        message: response.message || '',
        ok: false
      });
    }
  };

  const handleFormSubmit = async (event: FormEvent<HTMLFormElement>) => {
    clearErrors();
    setSubmissionMessage(null);

    return handleSubmit(onSubmit)(event);
  };

  const renderSubmissionMessage = () => {
    if (!submissionMessage?.message) return null;

    if (!submissionMessage.ok) {
      return (
        <div className="mb-6 flex items-center gap-1">
          <ExclamationCircleIcon className="text-danger-500 h-5 w-5" />
          <p className="text-danger-500 text-sm">{submissionMessage.message}</p>
        </div>
      );
    }

    return (
      <div className="mb-6 flex items-center gap-1">
        <CheckCircleIcon className="text-success-500 h-5 w-5" />
        <p className="text-success-500 text-sm">{submissionMessage.message}</p>
      </div>
    );
  };

  return (
    <Card
      data-testid="sign-up-form"
      className="dark:border-default-100 w-full dark:border"
      isBlurred
    >
      <CardHeader className="p-8 pb-0">
        <h1 className="text-3xl font-medium">{t('title')}</h1>
      </CardHeader>
      <CardBody className="p-8 pb-0">
        <form onSubmit={handleFormSubmit} className="flex flex-col gap-4">
          <Input
            {...register('email', {
              onChange: () => clearFieldState('email')
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
              onChange: () => clearFieldState('password')
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
          <Input
            {...register('confirmPassword', {
              onChange: () => clearFieldState('confirmPassword')
            })}
            labelPlacement="outside"
            variant="faded"
            id="confirm-password"
            type="password"
            label={t('confirm_password')}
            placeholder={t('confirm_password_placeholder')}
            isInvalid={!!errors.confirmPassword}
            errorMessage={errors.confirmPassword?.message}
          />
          <Button
            className="w-full justify-between"
            aria-disabled={isSubmitting}
            type="submit"
            isLoading={isSubmitting}
            endContent={<ArrowRightIcon className="h-5 w-5" />}
            color="secondary"
          >
            {t('submit')}
          </Button>
          <div aria-live="polite" aria-atomic="true">
            {renderSubmissionMessage()}
          </div>
        </form>
      </CardBody>
      <CardFooter className="flex flex-col items-center justify-center gap-1 pb-8 pt-0">
        <div className="flex flex-col items-center gap-1 sm:flex-row">
          <p className="text-md">{t('already_have_account')}</p>{' '}
          <Link color="secondary" href={LOGIN_PAGE}>
            {t('login_link')}
          </Link>
        </div>
      </CardFooter>
    </Card>
  );
}
