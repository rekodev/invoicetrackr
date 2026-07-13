'use client';

import {
  Button,
  Card,
  FieldError,
  Input,
  Label,
  TextField,
  toast
} from '@heroui/react';
import type { User } from '@invoicetrackr/types';
import { useTranslations } from 'next-intl';
import { Controller, type SubmitHandler, useForm } from 'react-hook-form';

import { updateUserAction } from '@/lib/actions/user';

type FreelancerDetails = Pick<
  User,
  'name' | 'businessNumber' | 'address' | 'invoiceEmail' | 'phone'
>;

type Props = {
  user: User;
  onSuccess: () => void;
};

export default function FreelancerDetailsStep({ user, onSuccess }: Props) {
  const t = useTranslations('profile.personal_information.form');
  const onboardingT = useTranslations('sign_up.multi_step');
  const {
    control,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting }
  } = useForm<FreelancerDetails>({
    defaultValues: {
      name: user.name,
      businessNumber: user.businessNumber,
      address: user.address,
      invoiceEmail: user.invoiceEmail || user.email,
      phone: user.phone || ''
    }
  });

  const onSubmit: SubmitHandler<FreelancerDetails> = async (details) => {
    const response = await updateUserAction({
      user: {
        ...user,
        ...details,
        businessType: 'individual'
      },
      signature: user.signature
    });

    if (!response.ok) {
      toast(response.message, { variant: 'danger' });
      Object.entries(response.validationErrors || {}).forEach(
        ([field, message]) => {
          setError(field as keyof FreelancerDetails, { message });
        }
      );
      return;
    }

    toast(response.message, { variant: 'success' });
    onSuccess();
  };

  const renderField = ({
    name,
    label,
    placeholder
  }: {
    name: keyof FreelancerDetails;
    label: string;
    placeholder: string;
  }) => (
    <Controller
      control={control}
      name={name}
      render={({ field }) => (
        <TextField variant="secondary" isInvalid={Boolean(errors[name])}>
          <Label>{label}</Label>
          <Input
            name={field.name}
            value={String(field.value || '')}
            placeholder={placeholder}
            onBlur={field.onBlur}
            onChange={field.onChange}
          />
          {errors[name]?.message ? (
            <FieldError>{errors[name]?.message}</FieldError>
          ) : null}
        </TextField>
      )}
    />
  );

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Card.Content className="grid grid-cols-1 gap-4 p-6 sm:grid-cols-2">
        {renderField({
          name: 'name',
          label: onboardingT('details.legal_name'),
          placeholder: t('name_placeholder')
        })}
        {renderField({
          name: 'businessNumber',
          label: t('business_number'),
          placeholder: t('business_number_placeholder')
        })}
        {renderField({
          name: 'invoiceEmail',
          label: t('invoice_email'),
          placeholder: t('email_placeholder')
        })}
        {renderField({
          name: 'phone',
          label: t('phone'),
          placeholder: t('phone_placeholder')
        })}
        <div className="sm:col-span-2">
          {renderField({
            name: 'address',
            label: t('address'),
            placeholder: t('address_placeholder')
          })}
        </div>
      </Card.Content>
      <Card.Footer className="justify-end px-6 py-4">
        <Button
          type="submit"
          isPending={isSubmitting}
          className="w-full sm:w-auto"
        >
          {onboardingT('actions.next')}
        </Button>
      </Card.Footer>
    </form>
  );
}
