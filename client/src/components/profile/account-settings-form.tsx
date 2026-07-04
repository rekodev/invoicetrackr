'use client';

import {
  Button,
  Card,
  CardContent,
  CardFooter,
  FieldError,
  Label,
  ListBox,
  ListBoxItem,
  Select,
  Separator,
  Tooltip,
  toast
} from '@heroui/react';
import { Controller, SubmitHandler, useForm } from 'react-hook-form';
import {
  CurrencyDollarIcon,
  DocumentArrowUpIcon,
  InformationCircleIcon,
  LanguageIcon
} from '@heroicons/react/24/outline';
import { User } from 'next-auth';
import { useState } from 'react';
import { useTranslations } from 'next-intl';

import {
  availableCurrencies,
  availableLanguages
} from '@/lib/constants/profile';
import { Currency } from '@/lib/types/currency';
import { updateUserAccountSettingsAction } from '@/lib/actions/user';

import DeleteAccountModal from './delete-account-modal';

type AccountSettingsFormModel = {
  language: string;
  currency: Currency;
  preferredInvoiceLanguage: string;
};

type Props = {
  user: User;
};

const AccountSettingsForm = ({ user }: Props) => {
  const baseT = useTranslations();
  const t = useTranslations('profile.account_settings');
  const {
    handleSubmit,
    control,
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

    toast(response.message, {
      variant: response.ok ? 'success' : 'danger'
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
      <CardContent className="grid grid-cols-1 gap-4 p-6 lg:w-1/2">
        <Controller
          control={control}
          name="language"
          render={({ field }) => (
            <Select
              variant="secondary"
              value={field.value}
              onChange={field.onChange}
              isInvalid={!!errors.language}
            >
              <Label>
                <div className="flex items-center gap-1">
                  <LanguageIcon className="h-5 w-5" /> {t('language')}
                </div>
              </Label>
              <Select.Trigger>
                <Select.Value />
                <Select.Indicator />
              </Select.Trigger>
              <Select.Popover>
                <ListBox>
                  {availableLanguages.map((language) => (
                    <ListBoxItem
                      key={language.code}
                      id={language.code}
                      textValue={baseT(language.nameTranslationKey)}
                    >
                      {baseT(language.nameTranslationKey)}
                      <ListBoxItem.Indicator />
                    </ListBoxItem>
                  ))}
                </ListBox>
              </Select.Popover>
              <FieldError>{errors.language?.message}</FieldError>
            </Select>
          )}
        />
        <Controller
          control={control}
          name="preferredInvoiceLanguage"
          render={({ field }) => (
            <Select
              variant="secondary"
              value={field.value}
              onChange={field.onChange}
              isInvalid={!!errors.preferredInvoiceLanguage}
            >
              <Label>
                <div className="flex items-center gap-1">
                  <DocumentArrowUpIcon className="h-5 w-5" />
                  {t('preferred_invoice_language')}
                  <Tooltip delay={0}>
                    <Tooltip.Trigger>
                      <Button
                        type="button"
                        variant="tertiary"
                        size="sm"
                        isIconOnly
                        className="z-50 size-5 min-w-5 p-0"
                      >
                        <InformationCircleIcon className="text-muted h-4 w-4" />
                      </Button>
                    </Tooltip.Trigger>
                    <Tooltip.Content className="max-w-xs">
                      {t('preferred_invoice_language_tooltip')}
                    </Tooltip.Content>
                  </Tooltip>
                </div>
              </Label>
              <Select.Trigger>
                <Select.Value />
                <Select.Indicator />
              </Select.Trigger>
              <Select.Popover>
                <ListBox>
                  {availableLanguages.map((language) => (
                    <ListBoxItem
                      key={language.code}
                      id={language.code}
                      textValue={baseT(language.nameTranslationKey)}
                    >
                      {baseT(language.nameTranslationKey)}
                      <ListBoxItem.Indicator />
                    </ListBoxItem>
                  ))}
                </ListBox>
              </Select.Popover>
              <FieldError>
                {errors.preferredInvoiceLanguage?.message}
              </FieldError>
            </Select>
          )}
        />
        <Controller
          control={control}
          name="currency"
          render={({ field }) => (
            <Select
              variant="secondary"
              value={field.value}
              onChange={field.onChange}
              isInvalid={!!errors.currency}
            >
              <Label>
                <div className="flex items-center gap-1">
                  <CurrencyDollarIcon className="h-5 w-5" /> {t('currency')}
                </div>
              </Label>
              <Select.Trigger>
                <Select.Value />
                <Select.Indicator />
              </Select.Trigger>
              <Select.Popover>
                <ListBox>
                  {availableCurrencies.map((currency) => (
                    <ListBoxItem
                      key={currency.code}
                      id={currency.code}
                      textValue={baseT(currency.nameTranslationKey)}
                    >
                      {`${baseT(currency.nameTranslationKey)} (${currency.symbol})`}
                      <ListBoxItem.Indicator />
                    </ListBoxItem>
                  ))}
                </ListBox>
              </Select.Popover>
              <FieldError>{errors.currency?.message}</FieldError>
            </Select>
          )}
        />
      </CardContent>
      <CardFooter className="w-full flex-col justify-between px-6 py-4">
        <div className="flex w-full flex-col-reverse gap-2 self-end sm:w-auto sm:flex-row">
          <Button
            className="w-full sm:w-auto"
            variant="danger-soft"
            type="button"
            onPress={() => setIsDeleteAccountModalOpen(true)}
          >
            {t('delete_account.action')}
          </Button>
          <Button
            isDisabled={!isDirty}
            isPending={isSubmitting}
            type="submit"
            className="w-full sm:w-auto"
          >
            {t('save_changes')}
          </Button>
        </div>
      </CardFooter>
    </>
  );

  return (
    <>
      <form
        className="w-full"
        aria-label={t('a11y.form_label')}
        onSubmit={handleSubmit(onSubmit)}
      >
        <Card className="w-full border">
          <Card.Header className="px-6 py-4">
            <Card.Title className="text-2xl">{t('title')}</Card.Title>
          </Card.Header>
          <Separator />
          {renderCardBodyAndFooter()}
        </Card>
      </form>
      <DeleteAccountModal
        userId={Number(user.id)}
        isOpen={isDeleteAccountModalOpen}
        onClose={() => setIsDeleteAccountModalOpen(false)}
      />
    </>
  );
};

export default AccountSettingsForm;
