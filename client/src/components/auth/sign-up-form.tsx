'use client';

import { ArrowRightIcon } from '@heroicons/react/20/solid';
import {
  CheckCircleIcon,
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
import { useTranslations } from 'next-intl';
import type { ChangeEvent, ReactNode } from 'react';
import { useState } from 'react';
import { type SubmitHandler, useForm } from 'react-hook-form';

import AuthCardHeader from '@/components/auth/auth-card-header';
import { signInWithGoogleAction, signUpAction } from '@/lib/actions';
import { captureAnalyticsEvent } from '@/lib/analytics/client';
import { analyticsEvents } from '@/lib/analytics/events';
import { LOGIN_PAGE } from '@/lib/constants/pages';

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

type Props = {
  headerContent?: ReactNode;
};

export default function SignUpForm({ headerContent }: Props) {
  const pageT = useTranslations('sign_up');
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
    captureAnalyticsEvent(analyticsEvents.signUpStarted, {
      method: 'email'
    });

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

  const handleFormSubmit = async (event: ChangeEvent<HTMLFormElement>) => {
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
    <Card data-testid="sign-up-form" className="w-full border">
      <AuthCardHeader
        title={pageT('page_title')}
        description={pageT('page_description')}
      >
        {headerContent}
      </AuthCardHeader>
      <CardContent className="p-8 pb-0">
        <form action={signInWithGoogleAction}>
          <Button
            className="w-full justify-center gap-3"
            type="submit"
            variant="outline"
            onPress={() =>
              captureAnalyticsEvent(analyticsEvents.signUpStarted, {
                method: 'google'
              })
            }
          >
            <span className="text-base font-semibold">G</span>
            {t('google_submit')}
          </Button>
        </form>

        <div className="flex items-center gap-3 py-5">
          <div className="border-default-200 h-px flex-1 border-t" />
          <span className="text-muted text-xs">{t('oauth_divider')}</span>
          <div className="border-default-200 h-px flex-1 border-t" />
        </div>

        <form
          data-testid="sign-up-email-form"
          onSubmit={handleFormSubmit}
          className="flex flex-col gap-4"
        >
          <TextField variant="secondary" isInvalid={!!errors.email}>
            <Label>{t('email')}</Label>
            <Input
              {...register('email', {
                onChange: () => clearFieldState('email')
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
                onChange: () => clearFieldState('password')
              })}
              id="password"
              type="password"
              placeholder={t('password_placeholder')}
            />
            <FieldError>{errors.password?.message}</FieldError>
          </TextField>
          <TextField variant="secondary" isInvalid={!!errors.confirmPassword}>
            <Label>{t('confirm_password')}</Label>
            <Input
              {...register('confirmPassword', {
                onChange: () => clearFieldState('confirmPassword')
              })}
              id="confirm-password"
              type="password"
              placeholder={t('confirm_password_placeholder')}
            />
            <FieldError>{errors.confirmPassword?.message}</FieldError>
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
            {renderSubmissionMessage()}
          </div>
        </form>
      </CardContent>
      <CardFooter className="flex flex-col items-center justify-center gap-1 pb-8 pt-0">
        <div className="flex flex-col items-center gap-1 text-sm sm:flex-row">
          <p className="text-muted">{t('already_have_account')}</p>{' '}
          <Link
            href={LOGIN_PAGE}
            className="text-accent font-medium decoration-current underline-offset-4 hover:underline"
          >
            {t('login_link')}
          </Link>
        </div>
      </CardFooter>
    </Card>
  );
}
