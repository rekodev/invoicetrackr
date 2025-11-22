'use client';

import {
  Button,
  Card,
  CardBody,
  CardFooter,
  CardHeader,
  Divider,
  Select,
  SelectItem,
  Tooltip,
  addToast
} from '@heroui/react';
import {
  CurrencyDollarIcon,
  DocumentArrowUpIcon,
  InformationCircleIcon,
  LanguageIcon
} from '@heroicons/react/24/outline';
import { SubmitHandler, useForm } from 'react-hook-form';
import { User } from 'next-auth';
import { useState } from 'react';
import { useTranslations } from 'next-intl';

import {
  availableCurrencies,
  availableLanguages
} from '@/lib/constants/profile';
import { Currency } from '@/lib/types/currency';
import { getCurrencySymbol } from '@/lib/utils/currency';
import { updateUserAccountSettingsAction } from '@/lib/actions/user';

import DeleteAccountModal from './delete-account-modal';
import SubscriptionStatusCard from './subscription-status-card';

type AccountSettingsFormModel = {
  language: string;
  currency: Currency;
  preferredInvoiceLanguage: string;
};

type Props = {
  user: User;
  isSubscriptionActive: boolean;
};

const AccountSettingsForm = ({ user, isSubscriptionActive }: Props) => {
  const baseT = useTranslations();
  const t = useTranslations('profile.account_settings');
  const {
    register,
    handleSubmit,
    formState: { isDirty, errors, isSubmitting },
    setError,
    reset
  } = useForm<AccountSettingsFormModel>({
    defaultValues: {
      language: user?.language,
      currency: user?.currency,
      preferredInvoiceLanguage: user?.preferredInvoiceLanguage || user.language
    }
  });
  const [isDeleteAccountModalOpen, setIsDeleteAccountModalOpen] =
    useState(false);

  const onSubmit: SubmitHandler<AccountSettingsFormModel> = async (data) => {
    if (!user?.id) return;

    const response = await updateUserAccountSettingsAction({
      userId: Number(user.id),
      language: data.language,
      currency: data.currency,
      preferredInvoiceLanguage: data.preferredInvoiceLanguage
    });

    addToast({
      title: response.message,
      color: response.ok ? 'success' : 'danger'
    });

    if (!response.ok) {
      if (response.validationErrors) {
        Object.entries(response.validationErrors).forEach(([key, message]) => {
          setError(key as keyof AccountSettingsFormModel, { message });
        });
      }

      return;
    }

    reset(data);
  };

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
          isInvalid={!!errors.language}
          errorMessage={errors.language?.message}
        >
          {availableLanguages.map((language) => (
            <SelectItem
              key={language.code}
              textValue={baseT(language.nameTranslationKey)}
            >
              {baseT(language.nameTranslationKey)}
            </SelectItem>
          ))}
        </Select>
        <Select
          className="flex-col items-start gap-2"
          {...register('preferredInvoiceLanguage')}
          label={
            <div className="flex items-center gap-1">
              <DocumentArrowUpIcon className="h-5 w-5" />
              {t('preferred_invoice_language')}
              <Tooltip
                showArrow
                content={t('preferred_invoice_language_tooltip')}
                className="max-w-xs"
              >
                <Button
                  isIconOnly
                  variant="light"
                  size="sm"
                  className="h-min w-min min-w-0 p-0 pl-0"
                >
                  <InformationCircleIcon className="text-default-500 z-50 h-4 w-4 cursor-pointer" />
                </Button>
              </Tooltip>
            </div>
          }
          labelPlacement="outside-left"
          variant="faded"
          defaultSelectedKeys={
            user?.preferredInvoiceLanguage
              ? [user.preferredInvoiceLanguage]
              : [user?.language]
          }
          isInvalid={!!errors.preferredInvoiceLanguage}
          errorMessage={errors.preferredInvoiceLanguage?.message}
        >
          {availableLanguages.map((language) => (
            <SelectItem
              key={language.code}
              textValue={baseT(language.nameTranslationKey)}
            >
              {baseT(language.nameTranslationKey)}
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
          isInvalid={!!errors.currency}
          errorMessage={errors.currency?.message}
        >
          {availableCurrencies.map((currency) => (
            <SelectItem
              key={currency.code}
              textValue={baseT(currency.nameTranslationKey)}
            >
              {`${baseT(currency.nameTranslationKey)} (${currency.symbol})`}
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
            isLoading={isSubmitting}
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
        aria-label={t('a11y.form_label')}
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
