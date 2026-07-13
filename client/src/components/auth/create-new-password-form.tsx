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
import { createNewPasswordAction } from '@/lib/actions';
import { LOGIN_PAGE } from '@/lib/constants/pages';
import { ActionResponseModel } from '@/lib/types/action';

type Props = {
  userId: number;
  token: string;
};

const initialFormValues = {
  newPassword: '',
  confirmedNewPassword: ''
};

type CreateNewPasswordFormModel = typeof initialFormValues;

export default function CreateNewPasswordForm({ userId, token }: Props) {
  const pageT = useTranslations('create_new_password');
  const t = useTranslations('create_new_password.form');
  const {
    register,
    handleSubmit,
    clearErrors,
    setError,
    formState: { errors, isSubmitting }
  } = useForm<CreateNewPasswordFormModel>({
    defaultValues: initialFormValues
  });
  const [response, setResponse] = useState<ActionResponseModel>();

  const clearFieldState = (field: keyof CreateNewPasswordFormModel) => {
    clearErrors(field);
    setResponse(undefined);
  };

  const onSubmit: SubmitHandler<CreateNewPasswordFormModel> = async (data) => {
    setResponse(undefined);

    const formData = new FormData();
    formData.append('newPassword', data.newPassword);
    formData.append('confirmedNewPassword', data.confirmedNewPassword);
    formData.append('userId', String(userId));
    formData.append('token', token);

    const actionResponse = await createNewPasswordAction(undefined, formData);
    setResponse(actionResponse);

    if (!actionResponse.ok && actionResponse.validationErrors) {
      Object.entries(actionResponse.validationErrors).forEach(
        ([key, value]) => {
          setError(key as keyof CreateNewPasswordFormModel, { message: value });
        }
      );
    }
  };

  const handleFormSubmit = async (event: FormEvent<HTMLFormElement>) => {
    clearErrors();
    setResponse(undefined);

    return handleSubmit(onSubmit)(event);
  };

  return (
    <Card className="mx-auto w-full max-w-lg border">
      <AuthCardHeader
        title={pageT('title')}
        description={pageT('description')}
      />
      <CardContent className="p-8 pb-0">
        <form onSubmit={handleFormSubmit} className="flex flex-col gap-4">
          <TextField variant="secondary" isInvalid={!!errors.newPassword}>
            <Label>{t('new_password')}</Label>
            <Input
              {...register('newPassword', {
                onChange: () => clearFieldState('newPassword')
              })}
              id="newPassword"
              type="password"
              placeholder={t('new_password_placeholder')}
            />
            <FieldError>{errors.newPassword?.message}</FieldError>
          </TextField>
          <TextField
            variant="secondary"
            isInvalid={!!errors.confirmedNewPassword}
          >
            <Label>{t('confirmed_new_password')}</Label>
            <Input
              {...register('confirmedNewPassword', {
                onChange: () => clearFieldState('confirmedNewPassword')
              })}
              id="confirmedNewPassword"
              type="password"
              placeholder={t('confirmed_new_password_placeholder')}
            />
            <FieldError>{errors.confirmedNewPassword?.message}</FieldError>
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
            {response?.message && (
              <div className="mb-6 flex items-center gap-1">
                {response.ok ? (
                  <CheckCircleIcon className="text-success h-5 w-5" />
                ) : (
                  <ExclamationCircleIcon className="text-danger h-5 w-5" />
                )}
                <p
                  className={cn('text-sm', {
                    'text-danger': !response.ok,
                    'text-success': response.ok
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
