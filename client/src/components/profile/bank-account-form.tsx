'use client';

import {
  Button,
  Card,
  cn,
  FieldError,
  Input,
  Label,
  Separator,
  TextField,
  toast
} from '@heroui/react';
import { BankAccountBody } from '@invoicetrackr/types';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { Controller, SubmitHandler, useForm } from 'react-hook-form';

import { addBankingInformationAction } from '@/lib/actions/banking-information';
import { BANKING_INFORMATION_PAGE } from '@/lib/constants/pages';

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
  onSuccess?: (_bankAccount?: BankAccountBody) => void;
  isUserOnboarding?: boolean;
  shouldSelectOnCreate?: boolean;
  variant?: 'card' | 'inline';
};

export default function BankAccountForm({
  onSuccess,
  userId,
  defaultValues,
  userSelectedBankAccountId,
  isUserOnboarding,
  onCancel,
  onSkip,
  shouldSelectOnCreate,
  variant = 'card'
}: Props) {
  const t = useTranslations('profile.banking_information.form');
  const router = useRouter();
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

    if (onSuccess) {
      onSuccess(bankAccount);
    } else {
      router.push(BANKING_INFORMATION_PAGE);
    }
  };

  const handleCancel = () => {
    if (onCancel) {
      onCancel();
      return;
    }

    router.push(BANKING_INFORMATION_PAGE);
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
      {variant === 'card' && (
        <Card.Header className="px-6 py-4">
          <Card.Title className="text-3xl">{t('title.create')}</Card.Title>
        </Card.Header>
      )}
      {variant === 'card' && <Separator />}
      <div
        className={cn(
          'grid grid-cols-1 gap-4',
          variant === 'card' ? 'p-6 sm:grid-cols-2' : 'p-0'
        )}
      >
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
      <div
        className={cn(
          'flex justify-end gap-2',
          variant === 'card' ? 'px-6 py-4' : 'px-0 pb-0 pt-4'
        )}
      >
        <div className="flex w-full flex-col-reverse gap-2 sm:w-auto sm:flex-row">
          {!isUserOnboarding && (
            <Button
              variant="danger-soft"
              className="w-full sm:w-auto"
              onPress={handleCancel}
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

  if (variant === 'inline') {
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

  return (
    <Card className="w-full border">
      <form aria-label={t('a11y.form_label')} onSubmit={handleSubmit(onSubmit)}>
        {formContent}
      </form>
    </Card>
  );
}
