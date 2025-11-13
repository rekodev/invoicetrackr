'use client';

import {
  Button,
  Card,
  CardBody,
  CardFooter,
  CardHeader,
  Divider,
  addToast
} from '@heroui/react';
import { SubmitHandler, useForm } from 'react-hook-form';
import { useTranslations } from 'next-intl';

import { ChangePasswordFormModel } from '@/lib/types/models';
import { changeUserPasswordAction } from '@/lib/actions/user';

import PasswordInput from '../password-input';

type Props = {
  userId: number;
};

export default function ChangePasswordForm({ userId }: Props) {
  const t = useTranslations('profile.change_password');
  const {
    register,
    handleSubmit,
    formState: { errors, isDirty, isSubmitting },
    setError,
    reset
  } = useForm<ChangePasswordFormModel>({
    defaultValues: { password: '', newPassword: '', confirmedNewPassword: '' }
  });

  const onSubmit: SubmitHandler<ChangePasswordFormModel> = async (data) => {
    const response = await changeUserPasswordAction({
      userId,
      password: data.password,
      newPassword: data.newPassword,
      confirmedNewPassword: data.confirmedNewPassword
    });

    addToast({
      title: response.message,
      color: response.ok ? 'success' : 'danger'
    });

    if (!response.ok) {
      if (response.validationErrors) {
        Object.entries(response.validationErrors).forEach(([key, value]) => {
          setError(key as keyof ChangePasswordFormModel, { message: value });
        });
      }

      return;
    }

    reset();
  };

  const renderCardBodyAndFooter = () => {
    const registeredPassword = { ...register('password') };
    const registeredNewPassword = { ...register('newPassword') };
    const registeredConfirmedNewPassword = {
      ...register('confirmedNewPassword')
    };

    return (
      <>
        <CardBody className="grid grid-cols-1 gap-4 p-6 lg:grid-cols-2">
          <PasswordInput
            autoComplete="new-password"
            placeholder={t('current_password_placeholder')}
            registeredPassword={registeredPassword}
            label={t('current_password')}
            isInvalid={!!errors.password}
            errorMessage={errors.password?.message}
          />
          <PasswordInput
            placeholder={t('new_password_placeholder')}
            registeredPassword={registeredNewPassword}
            label={t('new_password')}
            isInvalid={!!errors.newPassword}
            errorMessage={errors.newPassword?.message}
          />
          <small className="text-default-500 col-span-2 mt-[-8]">
            {t('password_requirements')}
          </small>
          <PasswordInput
            placeholder={t('confirm_new_password_placeholder')}
            registeredPassword={registeredConfirmedNewPassword}
            label={t('confirm_new_password')}
            isInvalid={!!errors.confirmedNewPassword}
            errorMessage={errors.confirmedNewPassword?.message}
          />
        </CardBody>
        <CardFooter className="relative w-full justify-between p-6">
          <div className="flex w-full flex-col gap-2 self-end">
            <Button
              isDisabled={!isDirty}
              type="submit"
              isLoading={isSubmitting}
              color="secondary"
              className="self-end"
            >
              {t('save_changes')}
            </Button>
          </div>
        </CardFooter>
      </>
    );
  };

  return (
    <Card
      as="form"
      aria-label={t('a11y.form_label')}
      onSubmit={handleSubmit(onSubmit)}
      className="dark:border-default-100 w-full bg-transparent dark:border"
    >
      <CardHeader className="p-4 px-6">{t('title')}</CardHeader>
      <Divider />
      {renderCardBodyAndFooter()}
    </Card>
  );
}
