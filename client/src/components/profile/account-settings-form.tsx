'use client';

import { CurrencyDollarIcon, LanguageIcon } from '@heroicons/react/24/outline';
import {
  Button,
  Card,
  CardBody,
  CardFooter,
  CardHeader,
  Chip,
  Divider,
  Select,
  SelectItem,
} from '@nextui-org/react';
import { useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';
import { SubmitHandler, useForm } from 'react-hook-form';

import { updateUserAccountSettings } from '@/api';
import { updateSession } from '@/lib/actions';
import {
  AVAILABLE_CURRENCIES,
  AVAILABLE_LANGUAGES,
} from '@/lib/constants/profile';
import { UiState } from '@/lib/constants/uiState';
import useGetUser from '@/lib/hooks/user/useGetUser';
import { AccountSettings } from '@/lib/types/models/user';

import DeleteAccountModal from './delete-account-modal';
import ErrorAlert from '../ui/ErrorAlert';
import Loader from '../ui/Loader';

type Props = {
  userId: number;
};

// TODO: Improve form and add validation

const AccountSettingsForm = ({ userId }: Props) => {
  const { mutateUser, user, isUserLoading, userError } = useGetUser({ userId });
  const t = useTranslations('profile.account_settings');
  const {
    register,
    handleSubmit,
    formState: { isDirty },
    reset,
  } = useForm<AccountSettings>({
    defaultValues: { language: user?.language, currency: user?.currency },
  });
  const [submissionMessage, setSubmissionMessage] = useState('');
  const [uiState, setUiState] = useState(UiState.Idle);
  const [isDeleteAccountModalOpen, setIsDeleteAccountModalOpen] =
    useState(false);

  const onSubmit: SubmitHandler<AccountSettings> = async (data) => {
    if (!user?.id) return;

    setSubmissionMessage('');
    setUiState(UiState.Pending);

    const response = await updateUserAccountSettings(user.id, {
      language: data.language,
      currency: data.currency,
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
    updateSession({ ...user, language: data.language });
  };

  // When form is updated and user is re-fetched, reset the form to match the new user data
  useEffect(() => {
    reset(user);
  }, [reset, user]);

  const renderCardBodyAndFooter = () => {
    if (isUserLoading)
      return (
        <div className='h-full pb-8'>
          <Loader fullHeight />
        </div>
      );

    return (
      <>
        <CardBody className='p-6 grid grid-cols-1 gap-4 sm:w-1/2'>
          <Select
            {...register('language')}
            label={
              <div className='flex gap-1 items-center'>
                <LanguageIcon className='h-5 w-5' /> Language
              </div>
            }
            labelPlacement='outside'
            variant='faded'
            defaultSelectedKeys={user?.language ? [user.language] : undefined}
          >
            {AVAILABLE_LANGUAGES.map((language) => (
              <SelectItem key={language.code} value={language.code}>
                {language.name}
              </SelectItem>
            ))}
          </Select>
          <Select
            {...register('currency')}
            label={
              <div className='flex items-center gap-1'>
                <CurrencyDollarIcon className='w-5 h-5' /> Currency
              </div>
            }
            labelPlacement='outside'
            variant='faded'
            defaultSelectedKeys={user?.currency ? [user.currency] : undefined}
          >
            {AVAILABLE_CURRENCIES.map((currency) => (
              <SelectItem key={currency.code} value={currency.code}>
                {`${currency.name} (${currency.symbol})`}
              </SelectItem>
            ))}
          </Select>
        </CardBody>
        <CardFooter className='justify-between p-6 w-full flex-col'>
          {submissionMessage && (
            <Chip color={uiState === UiState.Success ? 'success' : 'danger'}>
              {submissionMessage}
            </Chip>
          )}
          <div className='flex gap-2 self-end'>
            <Button
              variant='faded'
              type='button'
              color='danger'
              onPress={() => setIsDeleteAccountModalOpen(true)}
            >
              Delete Account
            </Button>
            <Button
              isDisabled={!isDirty}
              type='submit'
              isLoading={uiState === UiState.Pending}
              color='secondary'
              className='self-end'
            >
              Save Changes
            </Button>
          </div>
        </CardFooter>
      </>
    );
  };

  if (userError) return <ErrorAlert />;

  return (
    <>
      <Card
        as='form'
        aria-label='Account Settings Form'
        onSubmit={handleSubmit(onSubmit)}
        className='w-full bg-transparent border border-neutral-800'
      >
        <CardHeader className='p-4 px-6'>{t('title')}</CardHeader>
        <Divider />
        {renderCardBodyAndFooter()}
      </Card>
      <DeleteAccountModal
        userId={userId}
        isOpen={isDeleteAccountModalOpen}
        onClose={() => setIsDeleteAccountModalOpen(false)}
      />
    </>
  );
};

export default AccountSettingsForm;
