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
import {
  CheckCircleIcon,
  CurrencyDollarIcon,
  DocumentArrowUpIcon,
  EnvelopeIcon,
  ExclamationCircleIcon,
  InformationCircleIcon,
  LanguageIcon
} from '@heroicons/react/24/outline';
import { Controller, SubmitHandler, useForm } from 'react-hook-form';
import { User } from 'next-auth';
import { useState } from 'react';
import { useTranslations } from 'next-intl';

import {
  availableCurrencies,
  availableLanguages
} from '@/lib/constants/profile';
import {
  resendVerificationEmailAction,
  updateUserAccountSettingsAction
} from '@/lib/actions/user';
import { Currency } from '@/lib/types/currency';

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
  const [isResendingVerificationEmail, setIsResendingVerificationEmail] =
    useState(false);

  const emailVerifiedAt = user.emailVerifiedAt;
  const isEmailVerified = Boolean(emailVerifiedAt);
  const verifiedDate = emailVerifiedAt
    ? new Date(emailVerifiedAt).toLocaleDateString(user.language || 'en')
    : null;

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

  const handleResendVerificationEmail = async () => {
    if (!user?.id) return;

    setIsResendingVerificationEmail(true);
    try {
      const response = await resendVerificationEmailAction({
        userId: Number(user.id)
      });

      toast(response.message, {
        variant: response.ok ? 'success' : 'danger'
      });
    } finally {
      setIsResendingVerificationEmail(false);
    }
  };

  const renderCardBodyAndFooter = () => (
    <>
      <CardContent className="grid grid-cols-1 gap-4 p-6 lg:w-1/2">
        <div className="border-border bg-content1/40 rounded-lg border p-4">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex gap-3">
              <EnvelopeIcon className="text-muted mt-0.5 h-5 w-5 shrink-0" />
              <div>
                <p className="text-sm font-medium">
                  {t('email_verification.title')}
                </p>
                <p className="text-muted mt-1 text-sm">
                  {t('email_verification.email')}: {user.email}
                </p>
                <p className="text-muted mt-2 text-sm">
                  {isEmailVerified
                    ? t('email_verification.verified_description')
                    : t('email_verification.unverified_description')}
                </p>
                {verifiedDate ? (
                  <p className="text-muted mt-2 text-xs">
                    {t('email_verification.sent_at', { date: verifiedDate })}
                  </p>
                ) : null}
              </div>
            </div>
            <div className="flex flex-col items-start gap-3 sm:items-end">
              <div className="flex items-center gap-1 text-sm font-medium">
                {isEmailVerified ? (
                  <CheckCircleIcon className="text-success h-4 w-4" />
                ) : (
                  <ExclamationCircleIcon className="text-warning h-4 w-4" />
                )}
                {isEmailVerified
                  ? t('email_verification.verified')
                  : t('email_verification.unverified')}
              </div>
              {!isEmailVerified ? (
                <Button
                  size="sm"
                  type="button"
                  variant="secondary"
                  isPending={isResendingVerificationEmail}
                  onPress={handleResendVerificationEmail}
                >
                  {t('email_verification.resend')}
                </Button>
              ) : null}
            </div>
          </div>
        </div>
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
                      <InformationCircleIcon className="text-default-500 z-50 h-4 w-4 cursor-pointer" />
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
      <CardFooter className="w-full flex-col justify-between p-6">
        <div className="flex w-full gap-2 self-end md:w-min">
          <Button
            className="w-full md:w-min"
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
      <Card className="w-full border bg-transparent">
        <form
          aria-label={t('a11y.form_label')}
          onSubmit={handleSubmit(onSubmit)}
        >
          <Card.Header className="p-4 px-6">
            <Card.Title className="text-2xl">{t('title')}</Card.Title>
          </Card.Header>
          <Separator />
          {renderCardBodyAndFooter()}
        </form>
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
