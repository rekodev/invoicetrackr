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
  SelectItem
} from '@heroui/react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';
import { SubmitHandler, useForm } from 'react-hook-form';

import { updateUserAccountSettings } from '@/api';
import { updateSession } from '@/lib/actions';
import { UiState } from '@/lib/constants/uiState';
import useGetUser from '@/lib/hooks/user/useGetUser';
import { AccountSettingsFormModel } from '@/lib/types/models/user';

import DeleteAccountModal from './delete-account-modal';
import ErrorAlert from '../ui/error-alert';
import Loader from '../ui/loader';

type Props = {
  userId: number;
};

// TODO: Improve form and add validation

const AccountSettingsForm = ({ userId }: Props) => {
  const { mutateUser, user, isUserLoading, userError } = useGetUser({ userId });
  const { refresh } = useRouter();
  const t = useTranslations('profile.account_settings');
  const {
    register,
    handleSubmit,
    formState: { isDirty },
    reset
  } = useForm<AccountSettingsFormModel>({
    defaultValues: { language: user?.language, currency: user?.currency }
  });
  const [submissionMessage, setSubmissionMessage] = useState('');
  const [uiState, setUiState] = useState(UiState.Idle);
  const [isDeleteAccountModalOpen, setIsDeleteAccountModalOpen] =
    useState(false);

  const availableLanguages = [
    { code: 'lt', name: t('available_languages.lt') },
    { code: 'en', name: t('available_languages.en') }
  ] as const;

  const availableCurrencies = [
    {
      code: 'eur',
      name: t('available_currencies.eur'),
      symbol: '€'
    },
    {
      code: 'usd',
      name: t('available_currencies.usd'),
      symbol: '$'
    }
  ] as const;

  const onSubmit: SubmitHandler<AccountSettingsFormModel> = async (data) => {
    if (!user?.id) return;

    setSubmissionMessage('');
    setUiState(UiState.Pending);

    const response = await updateUserAccountSettings(user.id, {
      language: data.language,
      currency: data.currency
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
    await updateSession({
      newSession: {
        ...user,
        language: data.language,
        currency: data.currency
      }
    });
    refresh();
  };

  // When form is updated and user is re-fetched, reset the form to match the new user data
  useEffect(() => {
    reset(user);
  }, [reset, user]);

  const renderCardBodyAndFooter = () => {
    if (isUserLoading)
      return (
        <div className="h-full pb-8">
          <Loader fullHeight />
        </div>
      );

    return (
      <>
        <CardBody className="grid grid-cols-1 gap-4 p-6 lg:w-1/2">
          <Select
            {...register('language')}
            label={
              <div className="flex items-center gap-1">
                <LanguageIcon className="h-5 w-5" /> {t('language')}
              </div>
            }
            labelPlacement="outside"
            variant="faded"
            defaultSelectedKeys={user?.language ? [user.language] : undefined}
          >
            {availableLanguages.map((language) => (
              <SelectItem key={language.code} textValue={language.code}>
                {language.name}
              </SelectItem>
            ))}
          </Select>
          <Select
            {...register('currency')}
            label={
              <div className="flex items-center gap-1">
                <CurrencyDollarIcon className="h-5 w-5" /> {t('currency')}
              </div>
            }
            labelPlacement="outside"
            variant="faded"
            defaultSelectedKeys={user?.currency ? [user.currency] : undefined}
          >
            {availableCurrencies.map((currency) => (
              <SelectItem key={currency.code} textValue={currency.code}>
                {`${currency.name} (${currency.symbol})`}
              </SelectItem>
            ))}
          </Select>
        </CardBody>
        <CardFooter className="w-full flex-col justify-between p-6">
          {submissionMessage && (
            <Chip color={uiState === UiState.Success ? 'success' : 'danger'}>
              {submissionMessage}
            </Chip>
          )}
          <div className="flex w-full gap-2 self-end md:w-min">
            <Button
              className="w-full md:w-min"
              variant="faded"
              type="button"
              color="danger"
              onPress={() => setIsDeleteAccountModalOpen(true)}
            >
              {t('delete_account')}
            </Button>
            <Button
              isDisabled={!isDirty}
              type="submit"
              isLoading={uiState === UiState.Pending}
              color="secondary"
              className="w-full md:w-min"
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
    <>
      <Card
        as="form"
        aria-label="Account Settings Form"
        onSubmit={handleSubmit(onSubmit)}
        className="w-full bg-transparent dark:border dark:border-default-100"
      >
        <CardHeader className="p-4 px-6">{t('title')}</CardHeader>
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
