'use client';

import {
  Button,
  Card,
  CardContent,
  CardFooter,
  Checkbox,
  FieldError,
  Input,
  Label,
  ListBox,
  ListBoxItem,
  Select,
  TextField,
  toast
} from '@heroui/react';
import type { User } from '@invoicetrackr/types';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { Controller, SubmitHandler, useForm } from 'react-hook-form';

import SectionHeading from '@/components/ui/section-heading';
import { updateUserAccountSettingsAction } from '@/lib/actions/user';
import { availableLanguages } from '@/lib/constants/languages';
import { PROFILE_PAGE } from '@/lib/constants/pages';
import { getInvoiceDefaultsValues } from '@/lib/utils/user';

type InvoiceDefaultsFormModel = ReturnType<typeof getInvoiceDefaultsValues>;

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

const InvoiceDefaultsForm = ({ user }: Props) => {
  const baseT = useTranslations();
  const t = useTranslations('profile.account_settings');
  const isVatPayer = Boolean(user?.isVatPayer);
  const {
    handleSubmit,
    control,
    formState: { isDirty, errors, isSubmitting },
    setError,
    reset
  } = useForm<InvoiceDefaultsFormModel>({
    defaultValues: getInvoiceDefaultsValues(user)
  });

  const onSubmit: SubmitHandler<InvoiceDefaultsFormModel> = async (data) => {
    if (!user?.id) return;

    const response = await updateUserAccountSettingsAction({
      userId: Number(user.id),
      invoiceEmail: data.invoiceEmail,
      preferredInvoiceLanguage: data.preferredInvoiceLanguage,
      isVatPayer,
      defaultInvoiceVatMode: isVatPayer ? data.defaultInvoiceVatMode : 'no_vat',
      defaultInvoiceSeries: data.defaultInvoiceSeries.trim().toUpperCase(),
      defaultPaymentTermsDays: data.defaultPaymentTermsDays,
      defaultInvoiceIncludeLogo: data.defaultInvoiceIncludeLogo
    });

    toast(response.message, {
      variant: response.ok ? 'success' : 'danger'
    });

    if (!response.ok) {
      if (response.validationErrors) {
        Object.entries(response.validationErrors).forEach(([key, message]) => {
          setError(key as keyof InvoiceDefaultsFormModel, { message });
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
      <Card.Header>
        <SectionHeading title={t('invoice_defaults.section_title')} />
      </Card.Header>
      <CardContent className="card-form-fields gap-field grid grid-cols-1 md:grid-cols-2">
        <Controller
          control={control}
          name="invoiceEmail"
          render={({ field }) => (
            <TextField
              className="w-full"
              variant="secondary"
              isInvalid={!!errors.invoiceEmail}
            >
              <Label>{t('invoice_defaults.invoice_email')}</Label>
              <Input
                {...field}
                value={field.value || ''}
                type="email"
                placeholder={t('invoice_defaults.invoice_email_placeholder')}
              />
              <p className="text-muted text-xs">
                {t('invoice_defaults.invoice_email_description')}
              </p>
              <FieldError>{errors.invoiceEmail?.message}</FieldError>
            </TextField>
          )}
        />
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
                  {t('invoice_defaults.vat_locked_note')}{' '}
                  <Link
                    href={PROFILE_PAGE}
                    className="text-foreground underline underline-offset-2"
                  >
                    {t('invoice_defaults.personal_information_link')}
                  </Link>
                  .
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
                ) as InvoiceDefaultsFormModel['defaultPaymentTermsDays'];

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
        <Controller
          control={control}
          name="defaultInvoiceIncludeLogo"
          render={({ field }) => (
            <Checkbox
              className="md:col-span-2"
              variant="secondary"
              isSelected={field.value}
              onChange={field.onChange}
            >
              <Checkbox.Content>
                <Checkbox.Control>
                  <Checkbox.Indicator />
                </Checkbox.Control>
                <Label>{t('invoice_defaults.include_logo')}</Label>
              </Checkbox.Content>
            </Checkbox>
          )}
        />
      </CardContent>
      <CardFooter className="px-form-inset w-full flex-col justify-between">
        <div className="flex w-full flex-col-reverse gap-actions self-end sm:w-auto sm:flex-row">
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
    <form
      className="w-full"
      aria-label={t('a11y.form_label')}
      onSubmit={handleSubmit(onSubmit)}
    >
      <Card className="w-full border">{renderCardBodyAndFooter()}</Card>
    </form>
  );
};

export default InvoiceDefaultsForm;
