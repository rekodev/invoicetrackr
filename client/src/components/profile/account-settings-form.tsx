'use client';

import {
  Button,
  Card,
  CardContent,
  CardFooter,
  FieldError,
  Input,
  Label,
  ListBox,
  ListBoxItem,
  Select,
  Separator,
  TextField,
  toast
} from '@heroui/react';
import { Controller, SubmitHandler, useForm } from 'react-hook-form';
import type { DefaultInvoiceVatMode } from '@invoicetrackr/types';
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
  defaultInvoiceVatMode: DefaultInvoiceVatMode;
  defaultInvoiceSeries: string;
  defaultPaymentTermsDays: 7 | 14 | 30;
};

type Props = {
  user: User;
};

const defaultInvoiceVatModeOptions = [
  'no_vat',
  'standard_21',
  'zero',
  'manual'
] as const;

const paymentTermsOptions = [7, 14, 30] as const;

const AccountSettingsForm = ({ user }: Props) => {
  const baseT = useTranslations();
  const t = useTranslations('profile.account_settings');
  const isVatPayer = Boolean(user?.isVatPayer);
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
      preferredInvoiceLanguage: user?.preferredInvoiceLanguage || user.language,
      defaultInvoiceVatMode: isVatPayer
        ? user?.defaultInvoiceVatMode || 'no_vat'
        : 'no_vat',
      defaultInvoiceSeries: user?.defaultInvoiceSeries || 'SF',
      defaultPaymentTermsDays: user?.defaultPaymentTermsDays || 30
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
      preferredInvoiceLanguage: data.preferredInvoiceLanguage,
      isVatPayer,
      defaultInvoiceVatMode: isVatPayer ? data.defaultInvoiceVatMode : 'no_vat',
      defaultInvoiceSeries: data.defaultInvoiceSeries.trim().toUpperCase(),
      defaultPaymentTermsDays: data.defaultPaymentTermsDays
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

    reset({
      ...data,
      defaultInvoiceVatMode: isVatPayer ? data.defaultInvoiceVatMode : 'no_vat',
      defaultInvoiceSeries: data.defaultInvoiceSeries.trim().toUpperCase()
    });
  };

  const renderCardBodyAndFooter = () => (
    <>
      <CardContent className="grid grid-cols-1 gap-4 p-6 md:grid-cols-2">
        <div className="flex flex-col gap-1 md:col-span-2">
          <h3 className="text-lg font-medium">{t('general.title')}</h3>
          <p className="text-muted text-sm">{t('general.description')}</p>
        </div>
        <Controller
          control={control}
          name="language"
          render={({ field }) => (
            <Select
              className="w-full"
              variant="secondary"
              value={field.value}
              onChange={field.onChange}
              isInvalid={!!errors.language}
            >
              <Label>{t('language')}</Label>
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
          name="currency"
          render={({ field }) => (
            <Select
              className="w-full"
              variant="secondary"
              value={field.value}
              onChange={field.onChange}
              isInvalid={!!errors.currency}
            >
              <Label>{t('currency')}</Label>
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
      <Separator />
      <CardContent className="grid grid-cols-1 gap-4 p-6 md:grid-cols-2">
        <div className="flex flex-col gap-1 md:col-span-2">
          <h3 className="text-lg font-medium">{t('invoice_defaults.title')}</h3>
          <p className="text-muted text-sm">
            {t('invoice_defaults.description')}
          </p>
        </div>
        <Controller
          control={control}
          name="preferredInvoiceLanguage"
          render={({ field }) => (
            <Select
              className="w-full"
              variant="secondary"
              value={field.value}
              onChange={field.onChange}
              isInvalid={!!errors.preferredInvoiceLanguage}
            >
              <Label>{t('preferred_invoice_language')}</Label>
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
              <p className="text-muted text-xs">
                {t('preferred_invoice_language_tooltip')}
              </p>
              <FieldError>
                {errors.preferredInvoiceLanguage?.message}
              </FieldError>
            </Select>
          )}
        />
        <Controller
          control={control}
          name="defaultInvoiceVatMode"
          render={({ field }) => (
            <Select
              className="w-full"
              variant="secondary"
              value={isVatPayer ? field.value : 'no_vat'}
              onChange={field.onChange}
              isDisabled={!isVatPayer}
              isInvalid={!!errors.defaultInvoiceVatMode}
            >
              <Label>{t('invoice_defaults.default_vat_mode')}</Label>
              <Select.Trigger>
                <Select.Value />
                <Select.Indicator />
              </Select.Trigger>
              <Select.Popover>
                <ListBox>
                  {defaultInvoiceVatModeOptions.map((option) => (
                    <ListBoxItem
                      key={option}
                      id={option}
                      textValue={t(`invoice_defaults.vat_modes.${option}`)}
                    >
                      {t(`invoice_defaults.vat_modes.${option}`)}
                      <ListBoxItem.Indicator />
                    </ListBoxItem>
                  ))}
                </ListBox>
              </Select.Popover>
              <FieldError>{errors.defaultInvoiceVatMode?.message}</FieldError>
              {!isVatPayer && (
                <p className="text-muted text-xs">
                  {t('invoice_defaults.vat_locked_note')}
                </p>
              )}
            </Select>
          )}
        />
        <Controller
          control={control}
          name="defaultInvoiceSeries"
          render={({ field }) => (
            <TextField
              className="w-full"
              variant="secondary"
              isInvalid={!!errors.defaultInvoiceSeries}
            >
              <Label>{t('invoice_defaults.default_series')}</Label>
              <Input
                {...field}
                value={field.value || ''}
                onChange={(event) =>
                  field.onChange(event.target.value.toUpperCase())
                }
                maxLength={8}
                placeholder="SF"
              />
              <FieldError>{errors.defaultInvoiceSeries?.message}</FieldError>
            </TextField>
          )}
        />
        <Controller
          control={control}
          name="defaultPaymentTermsDays"
          render={({ field }) => (
            <Select
              className="w-full"
              variant="secondary"
              value={String(field.value)}
              onChange={(key) => {
                const selectedDays = Number(
                  key
                ) as AccountSettingsFormModel['defaultPaymentTermsDays'];

                field.onChange(selectedDays);
              }}
              isInvalid={!!errors.defaultPaymentTermsDays}
            >
              <Label>{t('invoice_defaults.payment_terms')}</Label>
              <Select.Trigger>
                <Select.Value />
                <Select.Indicator />
              </Select.Trigger>
              <Select.Popover>
                <ListBox>
                  {paymentTermsOptions.map((days) => (
                    <ListBoxItem
                      key={String(days)}
                      id={String(days)}
                      textValue={t('invoice_defaults.payment_terms_days', {
                        days
                      })}
                    >
                      {t('invoice_defaults.payment_terms_days', { days })}
                      <ListBoxItem.Indicator />
                    </ListBoxItem>
                  ))}
                </ListBox>
              </Select.Popover>
              <FieldError>{errors.defaultPaymentTermsDays?.message}</FieldError>
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
