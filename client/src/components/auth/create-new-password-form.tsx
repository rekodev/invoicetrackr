'use client';

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
import { type SubmitHandler, useForm } from 'react-hook-form';
import { ArrowRightIcon } from '@heroicons/react/20/solid';
import type { FormEvent } from 'react';
import { useState } from 'react';
import { useTranslations } from 'next-intl';

import { ActionResponseModel } from '@/lib/types/action';
import { LOGIN_PAGE } from '@/lib/constants/pages';
import { createNewPasswordAction } from '@/lib/actions';

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
    <Card
      className="mx-auto w-full max-w-lg dark:border dark:border-neutral-800"
      isBlurred
    >
      <CardHeader className="p-8 pb-0">
        <h1 className="text-3xl font-medium">{t('title')}</h1>
      </CardHeader>
      <CardBody className="p-8 pb-0">
        <form onSubmit={handleFormSubmit} className="flex flex-col gap-4">
          <Input
            {...register('newPassword', {
              onChange: () => clearFieldState('newPassword')
            })}
            labelPlacement="outside"
            variant="faded"
            id="newPassword"
            type="password"
            label={t('new_password')}
            placeholder={t('new_password_placeholder')}
            isInvalid={!!errors.newPassword}
            errorMessage={errors.newPassword?.message}
          />
          <Input
            {...register('confirmedNewPassword', {
              onChange: () => clearFieldState('confirmedNewPassword')
            })}
            labelPlacement="outside"
            variant="faded"
            id="confirmedNewPassword"
            type="password"
            label={t('confirmed_new_password')}
            placeholder={t('confirmed_new_password_placeholder')}
            isInvalid={!!errors.confirmedNewPassword}
            errorMessage={errors.confirmedNewPassword?.message}
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
            {response?.message && (
              <div className="mb-6 flex items-center gap-1">
                {response.ok ? (
                  <CheckCircleIcon className="text-success-500 h-5 w-5" />
                ) : (
                  <ExclamationCircleIcon className="h-5 w-5 text-red-500" />
                )}
                <p
                  className={cn('text-sm', {
                    'text-red-500': !response.ok,
                    'text-success-500': response.ok
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
        <div className="flex gap-1">
          <p className="text-md">{t('remember_your_password')}</p>{' '}
          <Link color="secondary" href={LOGIN_PAGE}>
            {t('sign_in')}
          </Link>
        </div>
      </CardFooter>
    </Card>
  );
}
