'use client';

import { CurrencyDollarIcon, LanguageIcon } from '@heroicons/react/24/outline';
import {
  addToast,
  Button,
  Card,
  CardBody,
  CardFooter,
  CardHeader,
  Divider,
  Select,
  SelectItem
} from '@heroui/react';
import { useRouter } from 'next/navigation';
import { User } from 'next-auth';
import { useTranslations } from 'next-intl';
import { useEffect, useState, useTransition } from 'react';
import { SubmitHandler, useForm } from 'react-hook-form';

import { updateSession } from '@/lib/actions';
import { updateUserAccountSettingsAction } from '@/lib/actions/user';
import { AccountSettingsFormModel } from '@/lib/types/models/user';
import { getCurrencySymbol } from '@/lib/utils/currency';

import DeleteAccountModal from './delete-account-modal';
import SubscriptionStatusCard from './subscription-status-card';

type Props = {
  user: User;
  isSubscriptionActive: boolean;
};

// TODO: Improve form and add validation
const AccountSettingsForm = ({ user, isSubscriptionActive }: Props) => {
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
  const [isPending, startTransition] = useTransition();
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

  const onSubmit: SubmitHandler<AccountSettingsFormModel> = async (data) =>
    startTransition(async () => {
      if (!user?.id) return;

      const response = await updateUserAccountSettingsAction({
        userId: Number(user.id),
        language: data.language,
        currency: data.currency
      });

      addToast({
        title: response.message,
        color: response.ok ? 'success' : 'danger'
      });

      if (!response.ok) {
        // response.data.errors.forEach((error) => {
        //   setError(error.key, { message: error.value });
        // });

        return;
      }

      await updateSession({
        newSession: {
          ...user,
          id: String(user.id),
          language: data.language,
          currency: data.currency
        }
      });
      refresh();
    });

  // When form is updated and user is re-fetched, reset the form to match the new user data
  useEffect(() => {
    reset(user);
  }, [reset, user]);

  const renderCardBodyAndFooter = () => (
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
            <SelectItem key={language.code} textValue={language.name}>
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
            <SelectItem key={currency.code} textValue={currency.name}>
              {`${currency.name} (${currency.symbol})`}
            </SelectItem>
          ))}
        </Select>
        <SubscriptionStatusCard
          user={user}
          isActive={isSubscriptionActive}
          currency={getCurrencySymbol(user?.currency)}
        />
      </CardBody>
      <CardFooter className="w-full flex-col justify-between p-6">
        <div className="flex w-full gap-2 self-end md:w-min">
          <Button
            className="w-full md:w-min"
            variant="faded"
            type="button"
            color="danger"
            onPress={() => setIsDeleteAccountModalOpen(true)}
          >
            {t('delete_account.action')}
          </Button>
          <Button
            isDisabled={!isDirty}
            type="submit"
            isLoading={isPending}
            color="secondary"
            className="w-full md:w-min"
          >
            {t('save_changes')}
          </Button>
        </div>
      </CardFooter>
    </>
  );

  return (
    <>
      <Card
        as="form"
        aria-label="Account Settings Form"
        onSubmit={handleSubmit(onSubmit)}
        className="dark:border-default-100 w-full bg-transparent dark:border"
      >
        <CardHeader className="p-4 px-6">{t('title')}</CardHeader>
        <Divider />
        {renderCardBodyAndFooter()}
      </Card>
      <DeleteAccountModal
        userId={Number(user.id)}
        isOpen={isDeleteAccountModalOpen}
        onClose={() => setIsDeleteAccountModalOpen(false)}
      />
    </>
  );
};

export default AccountSettingsForm;
