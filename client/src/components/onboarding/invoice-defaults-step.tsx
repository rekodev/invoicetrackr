'use client';

import {
  Button,
  Card,
  FieldError,
  Input,
  Label,
  ListBox,
  ListBoxItem,
  Select,
  TextField,
  toast
} from '@heroui/react';
import { DEFAULT_CURRENCY, type User } from '@invoicetrackr/types';
import { useTranslations } from 'next-intl';
import { Controller, type SubmitHandler, useForm } from 'react-hook-form';

import {
  completeUserOnboardingAction,
  updateUserAccountSettingsAction
} from '@/lib/actions/user';

type InvoiceDefaults = Pick<
  User,
  'defaultInvoiceSeries' | 'defaultPaymentTermsDays'
>;

const paymentTermsOptions = [7, 14, 30] as const;

type Props = {
  user: User;
  onSuccess: () => void;
};

export default function InvoiceDefaultsStep({ user, onSuccess }: Props) {
  const t = useTranslations('profile.account_settings.invoice_defaults');
  const onboardingT = useTranslations('sign_up.multi_step');
  const {
    control,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting }
  } = useForm<InvoiceDefaults>({
    defaultValues: {
      defaultInvoiceSeries: user.defaultInvoiceSeries || 'SF',
      defaultPaymentTermsDays: user.defaultPaymentTermsDays || 30
    }
  });

  const onSubmit: SubmitHandler<InvoiceDefaults> = async (defaults) => {
    if (!user.id) return;

    const normalizedSeries = defaults.defaultInvoiceSeries.trim().toUpperCase();
    const settingsResponse = await updateUserAccountSettingsAction({
      userId: user.id,
      language: user.language,
      preferredInvoiceLanguage: user.preferredInvoiceLanguage || user.language,
      isVatPayer: user.isVatPayer,
      defaultInvoiceVatMode: user.defaultInvoiceVatMode,
      defaultInvoiceSeries: normalizedSeries,
      defaultPaymentTermsDays: defaults.defaultPaymentTermsDays
    });

    if (!settingsResponse.ok) {
      toast(settingsResponse.message, { variant: 'danger' });
      Object.entries(settingsResponse.validationErrors || {}).forEach(
        ([field, message]) => {
          setError(field as keyof InvoiceDefaults, { message });
        }
      );
      return;
    }

    const completionResponse = await completeUserOnboardingAction({
      userId: user.id
    });

    if (!completionResponse.ok) {
      toast(completionResponse.message, { variant: 'danger' });
      return;
    }

    toast(completionResponse.message, { variant: 'success' });
    onSuccess();
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Card.Content className="grid grid-cols-1 gap-4 p-6 sm:grid-cols-2">
        <TextField variant="secondary" isDisabled>
          <Label>{onboardingT('defaults.currency')}</Label>
          <Input value={DEFAULT_CURRENCY.toUpperCase()} readOnly />
        </TextField>
        <Controller
          control={control}
          name="defaultInvoiceSeries"
          render={({ field }) => (
            <TextField
              variant="secondary"
              isInvalid={Boolean(errors.defaultInvoiceSeries)}
            >
              <Label>{t('default_series')}</Label>
              <Input
                {...field}
                value={field.value || ''}
                maxLength={8}
                placeholder="SF"
                onChange={(event) =>
                  field.onChange(event.target.value.toUpperCase())
                }
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
              variant="secondary"
              value={String(field.value)}
              onChange={(key) => field.onChange(Number(key))}
              isInvalid={Boolean(errors.defaultPaymentTermsDays)}
              className="sm:col-span-2"
            >
              <Label>{t('payment_terms')}</Label>
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
                      textValue={t('payment_terms_days', { days })}
                    >
                      {t('payment_terms_days', { days })}
                      <ListBoxItem.Indicator />
                    </ListBoxItem>
                  ))}
                </ListBox>
              </Select.Popover>
              <FieldError>{errors.defaultPaymentTermsDays?.message}</FieldError>
            </Select>
          )}
        />
      </Card.Content>
      <Card.Footer className="justify-end px-6 py-4">
        <Button
          type="submit"
          isPending={isSubmitting}
          className="w-full sm:w-auto"
        >
          {onboardingT('actions.finish')}
        </Button>
      </Card.Footer>
    </form>
  );
}
