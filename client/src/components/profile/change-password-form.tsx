'use client';

import {
  Button,
  Card,
  CardContent,
  CardFooter,
  Separator,
  toast
} from '@heroui/react';
import { SubmitHandler, useForm } from 'react-hook-form';
import { useTranslations } from 'next-intl';

import { changeUserPasswordAction } from '@/lib/actions/user';

import PasswordInput from './password-input';

type ChangePasswordFormModel = {
  password: string;
  newPassword: string;
  confirmedNewPassword: string;
};

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

    toast(response.message, {
      variant: response.ok ? 'success' : 'danger'
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
        <CardContent className="grid grid-cols-1 gap-4 p-6">
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
          <small className="text-muted -mt-2">
            {t('password_requirements')}
          </small>
          <PasswordInput
            placeholder={t('confirm_new_password_placeholder')}
            registeredPassword={registeredConfirmedNewPassword}
            label={t('confirm_new_password')}
            isInvalid={!!errors.confirmedNewPassword}
            errorMessage={errors.confirmedNewPassword?.message}
          />
        </CardContent>
        <CardFooter className="relative w-full justify-between px-6 py-4">
          <div className="flex w-full flex-col gap-2 self-end">
            <Button
              isPending={isSubmitting}
              isDisabled={!isDirty}
              type="submit"
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
    <form
      className="w-full"
      aria-label={t('a11y.form_label')}
      onSubmit={handleSubmit(onSubmit)}
    >
      <Card className="border">
        <Card.Header className="px-6 py-4">
          <Card.Title className="text-2xl">{t('title')}</Card.Title>
        </Card.Header>
        <Separator />
        {renderCardBodyAndFooter()}
      </Card>
    </form>
  );
}
