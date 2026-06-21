'use client';

import {
  Button,
  Card,
  FieldError,
  Input,
  Label,
  ListBox,
  Select,
  Separator,
  TextField,
  toast
} from '@heroui/react';
import { SubmitHandler, useForm } from 'react-hook-form';
import { useState } from 'react';
import { useTranslations } from 'next-intl';

import { CLIENT_BUSINESS_TYPES } from '@/lib/constants/client';
import { User } from '@invoicetrackr/types';
import { capitalize } from '@/lib/utils';
import { updateUserAction } from '@/lib/actions/user';

import SignaturePad from '../signature-pad';

type Props = {
  defaultValues?: Partial<User> | undefined;
  onSuccess?: () => void | Promise<void>;
};

const PersonalInformationForm = ({ defaultValues, onSuccess }: Props) => {
  const t = useTranslations('profile.personal_information.form');

  const {
    register,
    handleSubmit,
    formState: { isDirty, isSubmitting, errors },
    reset,
    setError,
    setValue,
    watch
  } = useForm<User>({
    defaultValues
  });

  const [formSignature, setFormSignature] = useState<
    File | string | undefined
  >();

  // eslint-disable-next-line react-hooks/incompatible-library
  const businessType = watch('businessType');

  const onSubmit: SubmitHandler<User> = async (data) => {
    if (!defaultValues?.id) return;

    const response = await updateUserAction({
      user: data,
      signature: formSignature || defaultValues.signature
    });

    toast(response.message, { variant: response.ok ? 'success' : 'danger' });

    if (!response?.ok) {
      if (response.validationErrors) {
        Object.entries(response.validationErrors).forEach(([key, message]) => {
          setError(key as keyof User, {
            message
          });
        });
      }

      return;
    }

    reset(data);
    await onSuccess?.();
  };

  const renderTextField = ({
    name,
    label,
    placeholder,
    isDisabled = false
  }: {
    name: keyof User;
    label: string;
    placeholder: string;
    isDisabled?: boolean;
  }) => {
    const error = errors[name];

    return (
      <TextField
        isDisabled={isDisabled}
        isInvalid={Boolean(error)}
        className="w-full"
      >
        <Label>{label}</Label>

        <Input
          {...register(name)}
          placeholder={placeholder}
          className="input input--secondary"
        />

        {error?.message ? <FieldError>{error.message}</FieldError> : null}
      </TextField>
    );
  };

  const renderCardBodyAndFooter = () => {
    return (
      <>
        <Card.Content className="grid grid-cols-1 gap-4 p-6 md:grid-cols-2">
          {renderTextField({
            name: 'email',
            label: t('email'),
            placeholder: t('email_placeholder'),
            isDisabled: true
          })}

          {renderTextField({
            name: 'name',
            label: t('name'),
            placeholder: t('name_placeholder')
          })}

          <Select
            className="w-full"
            placeholder={t('business_type_placeholder')}
            variant="secondary"
            isInvalid={Boolean(errors.businessType)}
            defaultValue={defaultValues?.businessType}
            onChange={(value) => {
              setValue('businessType', value as User['businessType'], {
                shouldDirty: true,
                shouldValidate: true
              });
            }}
          >
            <Label>{t('business_type')}</Label>

            <Select.Trigger>
              <Select.Value />
              <Select.Indicator />
            </Select.Trigger>

            <Select.Popover>
              <ListBox>
                {CLIENT_BUSINESS_TYPES.map((type) => {
                  const label = capitalize(type);

                  return (
                    <ListBox.Item key={type} id={type} textValue={label}>
                      {label}
                      <ListBox.ItemIndicator />
                    </ListBox.Item>
                  );
                })}
              </ListBox>
            </Select.Popover>

            {errors.businessType?.message ? (
              <FieldError>{errors.businessType.message}</FieldError>
            ) : null}
          </Select>

          {renderTextField({
            name: 'businessNumber',
            label: t('business_number'),
            placeholder: t('business_number_placeholder')
          })}

          {businessType === 'business' && (
            <TextField isInvalid={Boolean(errors.vatNumber)} className="w-full">
              <Label>VAT Number</Label>

              <Input
                {...register('vatNumber')}
                placeholder="Enter VAT number"
                className="input input--secondary"
              />

              {errors.vatNumber?.message ? (
                <FieldError>{errors.vatNumber.message}</FieldError>
              ) : null}
            </TextField>
          )}

          {renderTextField({
            name: 'address',
            label: t('address'),
            placeholder: t('address_placeholder')
          })}

          <div className="mt-[-0.25rem] flex flex-col gap-2">
            <label className="self-start text-sm">Signature</label>

            <SignaturePad
              signature={formSignature || defaultValues?.signature}
              onSignatureChange={setFormSignature}
            />
          </div>
        </Card.Content>

        <Card.Footer className="flex w-full flex-col p-6">
          <Button
            isDisabled={isSubmitting || (!isDirty && !Boolean(formSignature))}
            type="submit"
            className="self-end"
          >
            {t('save_changes')}
          </Button>
        </Card.Footer>
      </>
    );
  };

  return (
    <form
      aria-label={t('a11y.form_label')}
      onSubmit={handleSubmit(onSubmit)}
      encType="multipart/form-data"
      className="w-full"
    >
      <Card className="w-full border bg-transparent">
        <Card.Header
          data-testid="personal-information-form-heading"
          className="p-4 px-6"
        >
          <Card.Title className="text-2xl">{t('title')}</Card.Title>
        </Card.Header>

        <Separator />

        {renderCardBodyAndFooter()}
      </Card>
    </form>
  );
};

export default PersonalInformationForm;
