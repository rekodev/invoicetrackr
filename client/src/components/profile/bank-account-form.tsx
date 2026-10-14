'use client';

import {
  Button,
  FieldError,
  Input,
  Label,
  TextField,
  toast
} from '@heroui/react';
import { BankAccountBody } from '@invoicetrackr/types';
import { useTranslations } from 'next-intl';
import { Controller, SubmitHandler, useForm } from 'react-hook-form';

import { addBankingInformationAction } from '@/lib/actions/banking-information';

const INITIAL_BANK_ACCOUNT_DATA: BankAccountBody = {
  name: '',
  code: '',
  accountNumber: ''
};

type Props = {
  userId: number | undefined;
  userSelectedBankAccountId?: number | null;
  defaultValues?: BankAccountBody;
  onCancel?: () => void;
  onSkip?: () => void;
  onSuccess: (_bankAccount?: BankAccountBody) => void;
  isUserOnboarding?: boolean;
  shouldSelectOnCreate?: boolean;
};

export default function BankAccountForm({
  onSuccess,
  userId,
  defaultValues,
  userSelectedBankAccountId,
  isUserOnboarding,
  onCancel,
  onSkip,
  shouldSelectOnCreate
}: Props) {
  const t = useTranslations('profile.banking_information.form');
  const {
    control,
    handleSubmit,
    setError,
    formState: { isSubmitting, isDirty, errors }
  } = useForm<BankAccountBody>({
    defaultValues: {
      ...INITIAL_BANK_ACCOUNT_DATA,
      ...defaultValues
    }
  });

  const onSubmit: SubmitHandler<BankAccountBody> = async (data) => {
    if (!userId) return;

    const response = await addBankingInformationAction(
      userId,
      data,
      shouldSelectOnCreate === undefined
        ? !!userSelectedBankAccountId
        : !shouldSelectOnCreate,
      isUserOnboarding
    );

    toast(response.message, {
      variant: response.ok ? 'success' : 'danger'
    });

    if (!response.ok) {
      if (response.validationErrors) {
        Object.keys(response.validationErrors).map((key) => {
          setError(key as keyof BankAccountBody, {
            message: response.validationErrors?.[key]
          });
        });
      }

      return;
    }

    const bankAccount = (
      response.data as { bankAccount?: BankAccountBody } | undefined
    )?.bankAccount;

    onSuccess(bankAccount);
  };

  const renderTextField = ({
    name,
    label,
    placeholder
  }: {
    name: keyof BankAccountBody;
    label: string;
    placeholder: string;
  }) => {
    const error = errors[name];

    return (
      <Controller
        control={control}
        name={name}
        render={({ field }) => (
          <TextField variant="secondary" isInvalid={Boolean(error)}>
            <Label>{label}</Label>
            <Input
              name={field.name}
              value={String(field.value ?? '')}
              placeholder={placeholder}
              onBlur={field.onBlur}
              onChange={field.onChange}
            />
            {error?.message ? <FieldError>{error.message}</FieldError> : null}
          </TextField>
        )}
      />
    );
  };

  const formContent = (
    <>
      <div className="grid grid-cols-1 gap-field">
        {renderTextField({
          name: 'name',
          label: t('bank_name'),
          placeholder: t('bank_name_placeholder')
        })}
        {renderTextField({
          name: 'code',
          label: t('bank_code'),
          placeholder: t('bank_code_placeholder')
        })}
        {renderTextField({
          name: 'accountNumber',
          label: t('bank_account_number'),
          placeholder: t('bank_account_number_placeholder')
        })}
      </div>
      <div className="pt-form-actions flex justify-end gap-actions">
        <div className="flex w-full flex-col-reverse gap-actions sm:w-auto sm:flex-row">
          {!isUserOnboarding && (
            <Button
              variant="ghost"
              className="w-full sm:w-auto"
              onPress={onCancel}
            >
              {t('actions.cancel')}
            </Button>
          )}
          {isUserOnboarding && onSkip ? (
            <Button
              type="button"
              variant="secondary"
              className="w-full sm:w-auto"
              onPress={onSkip}
            >
              {t('actions.skip')}
            </Button>
          ) : null}
          <Button
            type="submit"
            isDisabled={!isDirty}
            isPending={isSubmitting}
            className="w-full sm:w-auto"
          >
            {t('actions.save')}
          </Button>
        </div>
      </div>
    </>
  );

  return (
    <form
      aria-label={t('a11y.form_label')}
      className="w-full"
      onSubmit={handleSubmit(onSubmit)}
    >
      {formContent}
    </form>
  );
}
