'use client';

import {
  Button,
  Card,
  CardBody,
  CardFooter,
  CardHeader,
  Chip,
  Divider,
} from '@nextui-org/react';
import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { SubmitHandler, useForm } from 'react-hook-form';

import { changeUserPassword } from '@/api';
import { encryptPassword } from '@/lib/actions';
import { UiState } from '@/lib/constants/uiState';
import useGetUser from '@/lib/hooks/user/useGetUser';
import { ChangePasswordFormModel } from '@/lib/types/models/user';

import PasswordInput from '../password-input';
import ErrorAlert from '../ui/ErrorAlert';
import Loader from '../ui/Loader';

type Props = {
  userId: number;
  language: string;
};

export default function ChangePasswordForm({ userId, language }: Props) {
  const { mutateUser, user, isUserLoading, userError } = useGetUser({ userId });
  const t = useTranslations('profile.change_password');
  const {
    register,
    handleSubmit,
    formState: { isDirty },
    reset,
  } = useForm<ChangePasswordFormModel>({
    defaultValues: { password: '', newPassword: '', confirmedNewPassword: '' },
  });
  const [submissionMessage, setSubmissionMessage] = useState('');
  const [uiState, setUiState] = useState(UiState.Idle);

  const onSubmit: SubmitHandler<ChangePasswordFormModel> = async (data) => {
    if (!user?.id) return;

    setSubmissionMessage('');
    setUiState(UiState.Pending);

    const hashedPassword = await encryptPassword(data.password);
    const hashedNewPassword = await encryptPassword(data.newPassword);
    const hashedConfirmedNewPassword = await encryptPassword(
      data.confirmedNewPassword
    );

    const response = await changeUserPassword({
      userId: user.id,
      language,
      password: hashedPassword,
      newPassword: hashedNewPassword,
      confirmedNewPassword: hashedConfirmedNewPassword,
    });
    setSubmissionMessage(response.data.message);

    if ('errors' in response.data) {
      setUiState(UiState.Failure);

      // response.data.errors.forEach((error) => {
      //   setError(error.key, { message: error.value });
      // });

      return;
    }

    setUiState(UiState.Success);
    mutateUser();
    reset();
  };

  const renderCardBodyAndFooter = () => {
    if (isUserLoading)
      return (
        <div className='h-full pb-8'>
          <Loader fullHeight />
        </div>
      );

    const registeredPassword = { ...register('password') };
    const registeredNewPassword = { ...register('newPassword') };
    const registeredConfirmedNewPassword = {
      ...register('confirmedNewPassword'),
    };

    return (
      <>
        <CardBody className='p-6 grid grid-cols-1 gap-4 sm:grid-cols-2'>
          <PasswordInput
            registeredPassword={registeredPassword}
            label={t('current_password')}
          />
          <PasswordInput
            registeredPassword={registeredNewPassword}
            label={t('new_password')}
          />
          <small className='text-default-500 col-span-2'>
            {t('password_requirements')}
          </small>
          <PasswordInput
            registeredPassword={registeredConfirmedNewPassword}
            label={t('confirm_new_password')}
          />
        </CardBody>
        <CardFooter className='justify-between p-6 w-full flex-col'>
          {submissionMessage && (
            <Chip color={uiState === UiState.Success ? 'success' : 'danger'}>
              {submissionMessage}
            </Chip>
          )}
          <div className='flex gap-2 self-end'>
            <Button
              isDisabled={!isDirty}
              type='submit'
              isLoading={uiState === UiState.Pending}
              color='secondary'
              className='self-end'
            >
              {t('save_changes')}
            </Button>
          </div>
        </CardFooter>
      </>
    );
  };

  if (userError) return <ErrorAlert />;

  return (
    <Card
      as='form'
      aria-label='Change Password Form'
      onSubmit={handleSubmit(onSubmit)}
      className='w-full bg-transparent border border-neutral-800'
    >
      <CardHeader className='p-4 px-6'>{t('title')}</CardHeader>
      <Divider />
      {renderCardBodyAndFooter()}
    </Card>
  );
}
